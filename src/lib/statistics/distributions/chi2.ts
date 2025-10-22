import { findQuantile, generateTableData, calculateProbability, calculateIntervalProbability, InequalityType, TableData } from '../utils';

export interface Chi2Params {
  df: number; // Grados de libertad (v > 0)
}

export class Chi2Distribution {
  private df: number;
  private halfDf: number;

  constructor(df: number) {
    if (df <= 0) {
      throw new Error('Los grados de libertad deben ser mayores que 0');
    }
    this.df = df;
    this.halfDf = df / 2;
  }

  // Función de densidad de probabilidad: f(x) - versión simplificada
  pdf(x: number): number {
    if (x <= 0) return 0;
    
    try {
      // Para valores pequeños de df, usar aproximaciones especiales
      if (this.df === 1) {
        return Math.exp(-x / 2) / Math.sqrt(2 * Math.PI * x);
      }
      
      if (this.df === 2) {
        return Math.exp(-x / 2) / 2;
      }
      
      // Para df >= 3, usar la fórmula general con límites
      const logNumerator = (this.halfDf - 1) * Math.log(x) - x / 2;
      const logDenominator = this.halfDf * Math.log(2) + this.logGamma(this.halfDf);
      
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
      // Para valores pequeños de df, usar aproximaciones especiales
      if (this.df === 1) {
        // Para df=1, usar la función de error
        return this.erf(Math.sqrt(x / 2));
      }
      
      if (this.df === 2) {
        // Para df=2, tiene forma cerrada
        return 1 - Math.exp(-x / 2);
      }
      
      // Para df >= 3, usar integración numérica simple
      return this.integratePDF(0.001, x, 1000);
    } catch (error) {
      return 0;
    }
  }

  // Función de error aproximada
  private erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
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
    return this.df;
  }

  // Varianza de la distribución
  get variance(): number {
    return 2 * this.df;
  }

  // Desviación estándar
  get stdDev(): number {
    return Math.sqrt(2 * this.df);
  }

  // Moda
  get mode(): number {
    return Math.max(0, this.df - 2);
  }

  // Asimetría
  get skewness(): number {
    return Math.sqrt(8 / this.df);
  }

  // Curtosis
  get kurtosis(): number {
    return 12 / this.df;
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
      1000,
      1e-8
    );
  }

  // Generar tabla de valores
  generateTable(start: number = 0, end: number = 30, step: number = 0.1): TableData[] {
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

  // Función gamma incompleta inferior (aproximación mejorada)
  private gammaIncomplete(a: number, x: number): number {
    if (x < 0 || a <= 0) return 0;
    if (x === 0) return 0;
    
    // Para valores pequeños de x, usar expansión en series
    if (x < a + 1) {
      let sum = 0;
      let term = 1 / a;
      let n = 1;
      
      while (Math.abs(term) > 1e-12 && n < 1000) {
        sum += term;
        term *= x / (a + n);
        n++;
      }
      
      const result = Math.pow(x, a) * Math.exp(-x) * sum;
      return Math.max(0, Math.min(1, result));
    }
    
    // Para valores grandes de x, usar expansión asintótica
    let sum = 0;
    let term = 1;
    let n = 1;
    
    while (Math.abs(term) > 1e-12 && n < 1000) {
      sum += term;
      term *= (a - n) / x;
      n++;
    }
    
    const gammaA = this.gamma(a);
    const incomplete = Math.pow(x, a) * Math.exp(-x) * sum / x;
    const result = gammaA - incomplete;
    
    // Asegurar que el resultado esté en [0, 1]
    return Math.max(0, Math.min(1, result / gammaA));
  }

  // Validar parámetros
  static validateParams(params: Chi2Params): string[] {
    const errors: string[] = [];
    
    if (typeof params.df !== 'number' || params.df <= 0) {
      errors.push('df debe ser un número mayor que 0');
    }
    
    return errors;
  }

  // Ejemplos predefinidos
  static getExamples(): Array<{ params: Chi2Params; description: string }> {
    return [
      {
        params: { df: 1 },
        description: 'Chi-cuadrado con 1 grado de libertad'
      },
      {
        params: { df: 5 },
        description: 'Chi-cuadrado con 5 grados de libertad'
      },
      {
        params: { df: 10 },
        description: 'Chi-cuadrado con 10 grados de libertad'
      }
    ];
  }
}

// Función de conveniencia para crear distribución chi-cuadrado
export function chi2(df: number): Chi2Distribution {
  return new Chi2Distribution(df);
}

// Funciones de utilidad para cálculos directos
export function chi2PDF(df: number, x: number): number {
  return chi2(df).pdf(x);
}

export function chi2CDF(df: number, x: number): number {
  return chi2(df).cdf(x);
}

export function chi2Quantile(df: number, p: number): number {
  return chi2(df).quantile(p);
}