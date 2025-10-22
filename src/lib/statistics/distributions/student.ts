import { findQuantile, generateTableData, calculateProbability, calculateIntervalProbability, InequalityType, TableData } from '../utils';

export interface StudentParams {
  df: number; // Grados de libertad (v > 0)
}

export class StudentDistribution {
  private df: number;
  private sqrtPi: number;

  constructor(df: number) {
    if (df <= 0) {
      throw new Error('Los grados de libertad deben ser mayores que 0');
    }
    this.df = df;
    this.sqrtPi = Math.sqrt(Math.PI);
  }

  // Función de densidad de probabilidad: f(t)
  pdf(t: number): number {
    const df = this.df;
    const numerator = this.gamma((df + 1) / 2);
    const denominator = Math.sqrt(df * Math.PI) * this.gamma(df / 2);
    const base = 1 + (t * t) / df;
    const exponent = -(df + 1) / 2;
    
    return (numerator / denominator) * Math.pow(base, exponent);
  }

  // Función de distribución acumulada: P(T ≤ t)
  cdf(t: number): number {
    // Usar integración numérica o aproximación
    return this.studentCDF(t, this.df);
  }

  // Función de supervivencia: P(T ≥ t)
  ccdf(t: number): number {
    return 1 - this.cdf(t);
  }

  // Calcular probabilidad según tipo de desigualdad
  probability(t: number, type: InequalityType = 'le'): number {
    return calculateProbability(t, (x) => this.pdf(x), (x) => this.cdf(x), type, false);
  }

  // Calcular probabilidad de intervalo P(a < T ≤ b)
  intervalProbability(a: number, b: number): number {
    return this.cdf(b) - this.cdf(a);
  }

  // Media de la distribución
  get mean(): number {
    return this.df > 1 ? 0 : NaN;
  }

  // Varianza de la distribución
  get variance(): number {
    if (this.df <= 1) return NaN;
    if (this.df <= 2) return Infinity;
    return this.df / (this.df - 2);
  }

  // Desviación estándar
  get stdDev(): number {
    const var_ = this.variance;
    return isNaN(var_) ? NaN : Math.sqrt(var_);
  }

  // Moda
  get mode(): number {
    return 0;
  }

  // Asimetría
  get skewness(): number {
    if (this.df <= 3) return NaN;
    return 0; // La distribución t es simétrica
  }

  // Curtosis
  get kurtosis(): number {
    if (this.df <= 4) return NaN;
    return 3 * (this.df - 2) / (this.df - 4);
  }

  // Encontrar cuantil (inversa de CDF)
  quantile(p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('La probabilidad debe estar entre 0 y 1');
    }
    
    // Usar búsqueda binaria para encontrar el cuantil
    return findQuantile(
      (t) => this.cdf(t),
      p,
      -100,
      100,
      1e-8
    );
  }

  // Generar tabla de valores
  generateTable(start: number = -4, end: number = 4, step: number = 0.01): TableData[] {
    return generateTableData(
      (x) => this.pdf(x),
      (x) => this.cdf(x),
      start,
      end,
      step,
      false
    );
  }

  // Función gamma (aproximación de Lanczos)
  private gamma(z: number): number {
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
    
    return sqrt2pi * power * exp / t;
  }

  // Función CDF t-Student (aproximación)
  private studentCDF(t: number, df: number): number {
    if (df === 1) {
      // Distribución de Cauchy
      return 0.5 + Math.atan(t) / Math.PI;
    }
    
    if (df === 2) {
      // Caso especial para df = 2
      return 0.5 + t / (2 * Math.sqrt(2 + t * t));
    }
    
    // Para df > 2, usar aproximación o integración numérica
    // Usar un método más robusto para evitar errores
    try {
      return this.integratePDF(-50, t);
    } catch (error) {
      // Fallback a aproximación para valores extremos
      if (t > 10) return 1;
      if (t < -10) return 0;
      // Aproximación normal para df grande
      if (df > 30) {
        const z = t / Math.sqrt(df / (df - 2));
        return this.normalCDF(z);
      }
      return 0.5; // Valor por defecto
    }
  }

  // Función CDF normal estándar (aproximación)
  private normalCDF(z: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2);
    
    const t = 1 / (1 + p * z);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    
    return 0.5 * (1 + sign * y);
  }

  // Integración numérica usando regla de Simpson adaptativa
  private integratePDF(a: number, b: number, tolerance: number = 1e-6): number {
    const simpson = (fa: number, fb: number, fc: number, h: number) => (h / 3) * (fa + 4 * fc + fb);
    
    const adaptiveSimpson = (a: number, b: number, fa: number, fb: number, fc: number, tol: number, whole: number): number => {
      const c = (a + b) / 2;
      const h = (b - a) / 2;
      const d = (a + c) / 2;
      const e = (c + b) / 2;
      const fd = this.pdf(d);
      const fe = this.pdf(e);
      
      const left = simpson(fa, fc, fd, h);
      const right = simpson(fc, fb, fe, h);
      
      if (Math.abs(left + right - whole) <= 15 * tol) {
        return left + right + (left + right - whole) / 15;
      }
      
      return adaptiveSimpson(a, c, fa, fc, fd, tol / 2, left) + 
             adaptiveSimpson(c, b, fc, fb, fe, tol / 2, right);
    };
    
    const fa = this.pdf(a);
    const fb = this.pdf(b);
    const fc = this.pdf((a + b) / 2);
    const h = b - a;
    const whole = simpson(fa, fb, fc, h);
    
    return adaptiveSimpson(a, b, fa, fb, fc, tolerance, whole);
  }

  // Validar parámetros
  static validateParams(params: StudentParams): string[] {
    const errors: string[] = [];
    
    if (typeof params.df !== 'number' || params.df <= 0) {
      errors.push('df debe ser un número mayor que 0');
    }
    
    return errors;
  }

  // Ejemplos predefinidos
  static getExamples(): Array<{ params: StudentParams; description: string }> {
    return [
      {
        params: { df: 1 },
        description: 'Distribución t con 1 grado de libertad (Cauchy)'
      },
      {
        params: { df: 5 },
        description: 'Distribución t con 5 grados de libertad'
      },
      {
        params: { df: 30 },
        description: 'Distribución t con 30 grados de libertad (cercana a normal)'
      }
    ];
  }
}

// Función de conveniencia para crear distribución t-Student
export function student(df: number): StudentDistribution {
  return new StudentDistribution(df);
}

// Funciones de utilidad para cálculos directos
export function studentPDF(df: number, t: number): number {
  return student(df).pdf(t);
}

export function studentCDF(df: number, t: number): number {
  return student(df).cdf(t);
}

export function studentQuantile(df: number, p: number): number {
  return student(df).quantile(p);
}