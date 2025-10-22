import { findQuantile, generateTableData, calculateProbability, calculateIntervalProbability, InequalityType, TableData } from '../utils';

export interface NormalParams {
  mu: number; // Media (μ)
  sigma: number; // Desviación estándar (σ > 0)
}

export class NormalDistribution {
  private mu: number;
  private sigma: number;
  private sqrt2pi: number;

  constructor(mu: number = 0, sigma: number = 1) {
    if (sigma <= 0) {
      throw new Error('Sigma debe ser mayor que 0');
    }
    this.mu = mu;
    this.sigma = sigma;
    this.sqrt2pi = Math.sqrt(2 * Math.PI);
  }

  // Función de densidad de probabilidad: f(x)
  pdf(x: number): number {
    const z = (x - this.mu) / this.sigma;
    return Math.exp(-0.5 * z * z) / (this.sigma * this.sqrt2pi);
  }

  // Función de distribución acumulada: P(X ≤ x)
  cdf(x: number): number {
    const z = (x - this.mu) / this.sigma;
    return this.normalCDF(z);
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
    return this.mu;
  }

  // Varianza de la distribución
  get variance(): number {
    return this.sigma * this.sigma;
  }

  // Desviación estándar
  get stdDev(): number {
    return this.sigma;
  }

  // Moda
  get mode(): number {
    return this.mu;
  }

  // Mediana
  get median(): number {
    return this.mu;
  }

  // Encontrar cuantil (inversa de CDF)
  quantile(p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('La probabilidad debe estar entre 0 y 1');
    }
    
    const z = this.inverseNormalCDF(p);
    return this.mu + this.sigma * z;
  }

  // Generar tabla de valores
  generateTable(start: number, end: number, step: number = 0.1): TableData[] {
    return generateTableData(
      (x) => this.pdf(x),
      (x) => this.cdf(x),
      start,
      end,
      step,
      false
    );
  }

  // Función CDF normal estándar
  private normalCDF(z: number): number {
    return 0.5 * (1 + this.erf(z / Math.sqrt(2)));
  }

  // Función de error (aproximación)
  private erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }

  // Inversa de CDF normal estándar (método de Beasley-Springer-Moro)
  private inverseNormalCDF(p: number): number {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    
    // Coeficientes para la aproximación
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
               1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
               6.680131188771972e+01, -1.328068155288572e+01];
    
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
               -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
               3.754408661907416e+00];
    
    const q = Math.min(p, 1 - p);
    let t, u;
    
    if (q > 0.02425) {
      // Aproximación racional para región central
      u = q - 0.5;
      t = u * u;
      u = u * (((((a[0] * t + a[1]) * t + a[2]) * t + a[3]) * t + a[4]) * t + a[5]) /
              (((((b[0] * t + b[1]) * t + b[2]) * t + b[3]) * t + b[4]) * t + 1);
    } else {
      // Aproximación racional para regiones de cola
      t = Math.sqrt(-2 * Math.log(q));
      u = (((((c[0] * t + c[1]) * t + c[2]) * t + c[3]) * t + c[4]) * t + c[5]) /
              ((((d[0] * t + d[1]) * t + d[2]) * t + d[3]) * t + 1);
    }
    
    return p > 0.5 ? -u : u;
  }

  // Validar parámetros
  static validateParams(params: NormalParams): string[] {
    const errors: string[] = [];
    
    if (typeof params.mu !== 'number') {
      errors.push('mu debe ser un número');
    }
    
    if (typeof params.sigma !== 'number' || params.sigma <= 0) {
      errors.push('sigma debe ser un número mayor que 0');
    }
    
    return errors;
  }

  // Ejemplos predefinidos
  static getExamples(): Array<{ params: NormalParams; description: string }> {
    return [
      {
        params: { mu: 0, sigma: 1 },
        description: 'Normal estándar (Z)'
      },
      {
        params: { mu: 100, sigma: 15 },
        description: 'Distribución normal con media 100 y desviación 15 (CI)'
      },
      {
        params: { mu: 50, sigma: 10 },
        description: 'Distribución normal con media 50 y desviación 10'
      }
    ];
  }
}

// Función de conveniencia para crear distribución normal
export function normal(mu: number = 0, sigma: number = 1): NormalDistribution {
  return new NormalDistribution(mu, sigma);
}

// Funciones de utilidad para cálculos directos
export function normalPDF(mu: number, sigma: number, x: number): number {
  return normal(mu, sigma).pdf(x);
}

export function normalCDF(mu: number, sigma: number, x: number): number {
  return normal(mu, sigma).cdf(x);
}

export function normalQuantile(mu: number, sigma: number, p: number): number {
  return normal(mu, sigma).quantile(p);
}

// Funciones para distribución normal estándar (Z)
export function standardNormalPDF(x: number): number {
  return normal(0, 1).pdf(x);
}

export function standardNormalCDF(x: number): number {
  return normal(0, 1).cdf(x);
}

export function standardNormalQuantile(p: number): number {
  return normal(0, 1).quantile(p);
}