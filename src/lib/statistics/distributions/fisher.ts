import { findQuantile, generateTableData, calculateProbability, calculateIntervalProbability, InequalityType, TableData } from '../utils';

export interface FisherParams {
  d1: number; // Grados de libertad del numerador (> 0)
  d2: number; // Grados de libertad del denominador (> 0)
}

export class FisherDistribution {
  private d1: number;
  private d2: number;
  private halfD1: number;
  private halfD2: number;

  constructor(d1: number, d2: number) {
    if (d1 <= 0 || d2 <= 0) {
      throw new Error('Los grados de libertad deben ser mayores que 0');
    }
    this.d1 = d1;
    this.d2 = d2;
    this.halfD1 = d1 / 2;
    this.halfD2 = d2 / 2;
  }

  // Función de densidad de probabilidad: f(x) - versión simplificada
  pdf(x: number): number {
    if (x <= 0) return 0;
    
    try {
      // Para valores pequeños de d1 y d2, usar aproximaciones especiales
      if (this.d1 === 1 && this.d2 === 1) {
        return 1 / (Math.PI * Math.sqrt(x) * (1 + x));
      }
      
      if (this.d1 === 1 && this.d2 === 2) {
        return 1 / (Math.sqrt(x) * (1 + x/2) ** 1.5);
      }
      
      // Para otros casos, usar la fórmula general con logaritmos
      const logNumerator = this.logGamma(this.halfD1 + this.halfD2) + 
                          this.halfD1 * Math.log(this.d1) + 
                          this.halfD2 * Math.log(this.d2) + 
                          (this.halfD1 - 1) * Math.log(x);
      
      const logDenominator = this.logGamma(this.halfD1) + 
                           this.logGamma(this.halfD2) + 
                           (this.halfD1 + this.halfD2) * Math.log(this.d1 * x + this.d2);
      
      const result = Math.exp(logNumerator - logDenominator);
      
      // Limitar el resultado a un rango razonable
      return Math.max(1e-100, Math.min(1e100, result));
    } catch (error) {
      return 0;
    }
  }

  // Logaritmo de la función gamma (más estable numéricamente)
  private logGamma(z: number): number {
    try {
      if (z < 0.5) {
        return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - this.logGamma(1 - z);
      }
      
      z -= 1;
      const x = 0.99999999999980993;
      const p = [676.5203681218851, -1259.1392167224028,
                771.32342877765313, -176.61502916214059,
                12.507343278686905, -0.13857109526572012,
                9.9843695780195716e-6, 1.5056327351493116e-7];
      
      let t = x + p[0];
      for (let i = 1; i < p.length; i++) {
        t += p[i] / (z + i);
      }
      
      const logSqrt2pi = Math.log(2 * Math.PI) / 2;
      const logPower = (z + p.length - 0.5) * Math.log(z + p.length - 0.5);
      const logExp = -(z + p.length - 0.5);
      
      return logSqrt2pi + logPower + logExp - Math.log(t);
    } catch (error) {
      return 0;
    }
  }

  // Función de distribución acumulada: P(X ≤ x) - versión simplificada
  cdf(x: number): number {
    if (x <= 0) return 0;
    
    try {
      // Para valores pequeños de d1 y d2, usar aproximaciones especiales
      if (this.d1 === 1 && this.d2 === 1) {
        const z = Math.sqrt(x);
        return 0.5 + Math.atan(z) / Math.PI;
      }
      
      if (this.d1 === 1 && this.d2 === 2) {
        const z = Math.sqrt(x / 2);
        return 2 * Math.atan(z) / Math.PI;
      }
      
      // Para otros casos, usar integración numérica simple
      return this.integratePDF(0.001, x, 1000);
    } catch (error) {
      return 0;
    }
  }

  // Integración numérica simple usando trapecios
  private integratePDF(a: number, b: number, n: number = 1000): number {
    const h = (b - a) / n;
    let sum = this.pdf(a) + this.pdf(b);
    
    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      sum += 2 * this.pdf(x);
    }
    
    return (h / 2) * sum;
  }

  // Función de supervivencia: P(X ≥ x)
  ccdf(x: number): number {
    return 1 - this.cdf(x);
  }

  // Calcular probabilidad según tipo de desigualdad
  probability(x: number, type: InequalityType = 'le'): number {
    return calculateProbability(x, (x) => this.pdf(x), (x) => this.cdf(x), type, false);
  }

  // Calcular probabilidad de intervalo P(a < X ≤ b)
  intervalProbability(a: number, b: number): number {
    return this.cdf(b) - this.cdf(a);
  }

  // Media de la distribución
  get mean(): number {
    return this.d2 > 2 ? this.d2 / (this.d2 - 2) : NaN;
  }

  // Varianza de la distribución
  get variance(): number {
    if (this.d2 <= 4) return NaN;
    const numerator = 2 * this.d2 * this.d2 * (this.d1 + this.d2 - 2);
    const denominator = this.d1 * (this.d2 - 2) * (this.d2 - 2) * (this.d2 - 4);
    return numerator / denominator;
  }

  // Desviación estándar
  get stdDev(): number {
    const var_ = this.variance;
    return isNaN(var_) ? NaN : Math.sqrt(var_);
  }

  // Moda
  get mode(): number {
    return this.d1 > 2 ? (this.d2 * (this.d1 - 2)) / (this.d1 * (this.d2 + 2)) : 0;
  }

  // Encontrar cuantil (inversa de CDF)
  quantile(p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('La probabilidad debe estar entre 0 y 1');
    }
    
    // Usar búsqueda binaria para encontrar el cuantil
    return findQuantile(
      (x) => this.cdf(x),
      p,
      0.001,
      100,
      1e-8
    );
  }

  // Generar tabla de valores
  generateTable(start: number = 0, end: number = 10, step: number = 0.1): TableData[] {
    return generateTableData(
      (x) => this.pdf(x),
      (x) => this.cdf(x),
      start,
      end,
      step,
      false
    );
  }

  // Función gamma (aproximación de Lanczos mejorada)
  private gamma(z: number): number {
    try {
      if (z < 0.5) {
        return Math.PI / (Math.sin(Math.PI * z) * this.gamma(1 - z));
      }
      
      z -= 1;
      const x = 0.99999999999980993;
      const p = [676.5203681218851, -1259.1392167224028,
                771.32342877765313, -176.61502916214059,
                12.507343278686905, -0.13857109526572012,
                9.9843695780195716e-6, 1.5056327351493116e-7];
      
      let t = x + p[0];
      for (let i = 1; i < p.length; i++) {
        t += p[i] / (z + i);
      }
      
      const sqrt2pi = Math.sqrt(2 * Math.PI);
      const power = Math.pow(z + p.length - 0.5, z + 0.5);
      const exp = Math.exp(-(z + p.length - 0.5));
      
      const result = sqrt2pi * power * exp / t;
      
      // Asegurar que el resultado sea positivo y finito
      return Math.max(1e-300, Math.min(1e300, result));
    } catch (error) {
      return 1; // Valor por defecto para evitar errores
    }
  }

  // Función beta regularizada (aproximación mejorada)
  private betaRegularized(a: number, b: number, x: number): number {
    if (x < 0 || x > 1) return 0;
    if (x === 0) return 0;
    if (x === 1) return 1;
    
    try {
      // Usar expansión en series continuas fraccionadas
      const cf = this.continuedFraction(a, b, x);
      const beta = this.beta(a, b);
      const numerator = Math.pow(x, a) * Math.pow(1 - x, b);
      const denominator = a * beta;
      
      if (denominator === 0) {
        return x < 0.5 ? 0 : 1;
      }
      
      const result = cf * numerator / denominator;
      
      // Asegurar que el resultado esté en [0, 1]
      return Math.max(0, Math.min(1, result));
    } catch (error) {
      // Fallback para casos problemáticos
      if (x < 0.5) {
        return Math.pow(x, a) / (a * this.beta(a, b));
      } else {
        return 1 - Math.pow(1 - x, b) / (b * this.beta(a, b));
      }
    }
  }

  // Función beta
  private beta(a: number, b: number): number {
    return this.gamma(a) * this.gamma(b) / this.gamma(a + b);
  }

  // Fracción continuada para la función beta incompleta (mejorada)
  private continuedFraction(a: number, b: number, x: number, maxIterations: number = 100): number {
    const eps = 1e-10;
    const tiny = 1e-20;
    
    try {
      let qab = a + b;
      let qap = a + 1;
      let qam = a - 1;
      let c = 1;
      let d = 1 - qab * x / qap;
      
      if (Math.abs(d) < tiny) d = tiny;
      d = 1 / d;
      let h = d;
      
      for (let m = 1; m <= maxIterations; m++) {
        let m2 = 2 * m;
        let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
        d = 1 + aa * d;
        if (Math.abs(d) < tiny) d = tiny;
        d = 1 / d;
        c = 1 + aa / c;
        if (Math.abs(c) < tiny) c = tiny;
        h *= d * c;
        
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
        d = 1 + aa * d;
        if (Math.abs(d) < tiny) d = tiny;
        d = 1 / d;
        c = 1 + aa / c;
        if (Math.abs(c) < tiny) c = tiny;
        const del = d * c;
        h *= del;
        
        if (Math.abs(del - 1) < eps) break;
      }
      
      return h;
    } catch (error) {
      // Fallback a valor simple
      return 1;
    }
  }

  // Validar parámetros
  static validateParams(params: FisherParams): string[] {
    const errors: string[] = [];
    
    if (typeof params.d1 !== 'number' || params.d1 <= 0) {
      errors.push('d1 debe ser un número mayor que 0');
    }
    
    if (typeof params.d2 !== 'number' || params.d2 <= 0) {
      errors.push('d2 debe ser un número mayor que 0');
    }
    
    return errors;
  }

  // Ejemplos predefinidos
  static getExamples(): Array<{ params: FisherParams; description: string }> {
    return [
      {
        params: { d1: 5, d2: 10 },
        description: 'F con 5 y 10 grados de libertad'
      },
      {
        params: { d1: 10, d2: 20 },
        description: 'F con 10 y 20 grados de libertad'
      },
      {
        params: { d1: 2, d2: 30 },
        description: 'F con 2 y 30 grados de libertad'
      }
    ];
  }
}

// Función de conveniencia para crear distribución F de Fisher
export function fisher(d1: number, d2: number): FisherDistribution {
  return new FisherDistribution(d1, d2);
}

// Funciones de utilidad para cálculos directos
export function fisherPDF(d1: number, d2: number, x: number): number {
  return fisher(d1, d2).pdf(x);
}

export function fisherCDF(d1: number, d2: number, x: number): number {
  return fisher(d1, d2).cdf(x);
}

export function fisherQuantile(d1: number, d2: number, p: number): number {
  return fisher(d1, d2).quantile(p);
}