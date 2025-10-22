import { combination, findQuantile, generateTableData, calculateProbability, calculateIntervalProbability, InequalityType, TableData } from '../utils';

export interface HypergeometricParams {
  N: number; // Tamaño de la población
  K: number; // Número de éxitos en la población
  n: number; // Tamaño de la muestra
}

export class HypergeometricDistribution {
  private N: number;
  private K: number;
  private n: number;

  constructor(N: number, K: number, n: number) {
    if (!Number.isInteger(N) || N <= 0) {
      throw new Error('N debe ser un entero positivo');
    }
    if (!Number.isInteger(K) || K < 0 || K > N) {
      throw new Error('K debe ser un entero entre 0 y N');
    }
    if (!Number.isInteger(n) || n < 0 || n > N) {
      throw new Error('n debe ser un entero entre 0 y N');
    }
    
    this.N = N;
    this.K = K;
    this.n = n;
  }

  // Función de masa de probabilidad: P(X = k)
  pmf(k: number): number {
    if (!Number.isInteger(k) || k < Math.max(0, this.n - (this.N - this.K)) || k > Math.min(this.n, this.K)) {
      return 0;
    }
    
    const numerator = combination(this.K, k) * combination(this.N - this.K, this.n - k);
    const denominator = combination(this.N, this.n);
    
    return numerator / denominator;
  }

  // Función de distribución acumulada: P(X ≤ k)
  cdf(k: number): number {
    if (k < 0) return 0;
    
    const kInt = Math.min(Math.floor(k), Math.min(this.n, this.K));
    let sum = 0;
    
    for (let i = Math.max(0, this.n - (this.N - this.K)); i <= kInt; i++) {
      sum += this.pmf(i);
    }
    
    return sum;
  }

  // Función de supervivencia: P(X ≥ k)
  ccdf(k: number): number {
    return 1 - this.cdf(k - 1);
  }

  // Calcular probabilidad según tipo de desigualdad
  probability(k: number, type: InequalityType = 'le'): number {
    return calculateProbability(k, (x) => this.pmf(x), (x) => this.cdf(x), type, true);
  }

  // Calcular probabilidad de intervalo P(a < X ≤ b)
  intervalProbability(a: number, b: number): number {
    return calculateIntervalProbability(a, b, (x) => this.cdf(x), true);
  }

  // Media de la distribución
  get mean(): number {
    return (this.n * this.K) / this.N;
  }

  // Varianza de la distribución
  get variance(): number {
    const numerator = this.n * this.K * (this.N - this.K) * (this.N - this.n);
    const denominator = this.N * this.N * (this.N - 1);
    return numerator / denominator;
  }

  // Desviación estándar
  get stdDev(): number {
    return Math.sqrt(this.variance);
  }

  // Moda
  get mode(): number {
    const numerator = (this.n + 1) * (this.K + 1);
    const denominator = this.N + 2;
    return Math.floor(numerator / denominator);
  }

  // Encontrar cuantil (inversa de CDF)
  quantile(p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('La probabilidad debe estar entre 0 y 1');
    }
    
    let k = Math.max(0, this.n - (this.N - this.K));
    let cumulative = 0;
    
    while (k <= Math.min(this.n, this.K) && cumulative < p) {
      cumulative += this.pmf(k);
      if (cumulative >= p) {
        return k;
      }
      k++;
    }
    
    return Math.min(this.n, this.K);
  }

  // Generar tabla de valores
  generateTable(): TableData[] {
    const start = Math.max(0, this.n - (this.N - this.K));
    const end = Math.min(this.n, this.K);
    
    return generateTableData(
      (x) => this.pmf(x),
      (x) => this.cdf(x),
      start,
      end,
      1,
      true
    );
  }

  // Aproximación binomial (cuando N es grande y n/N es pequeño)
  binomialApproximation(k: number): number {
    const p = this.K / this.N;
    const binomCoeff = combination(this.n, k);
    return binomCoeff * Math.pow(p, k) * Math.pow(1 - p, this.n - k);
  }

  // Aproximación normal (cuando N es grande)
  normalApproximation(k: number, continuityCorrection: boolean = true): number {
    const mu = this.mean;
    const sigma = this.stdDev;
    
    if (sigma === 0) return k === mu ? 1 : 0;
    
    const x = continuityCorrection ? k + 0.5 : k;
    const z = (x - mu) / sigma;
    return this.normalCDF(z);
  }

  // Función CDF normal estándar (para aproximaciones)
  private normalCDF(z: number): number {
    return 0.5 * (1 + this.erf(z / Math.sqrt(2)));
  }

  // Función de error (para CDF normal)
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

  // Validar parámetros
  static validateParams(params: HypergeometricParams): string[] {
    const errors: string[] = [];
    
    if (!Number.isInteger(params.N) || params.N <= 0) {
      errors.push('N debe ser un entero positivo');
    }
    
    if (!Number.isInteger(params.K) || params.K < 0 || params.K > params.N) {
      errors.push('K debe ser un entero entre 0 y N');
    }
    
    if (!Number.isInteger(params.n) || params.n < 0 || params.n > params.N) {
      errors.push('n debe ser un entero entre 0 y N');
    }
    
    return errors;
  }

  // Ejemplos predefinidos
  static getExamples(): Array<{ params: HypergeometricParams; description: string }> {
    return [
      {
        params: { N: 50, K: 5, n: 10 },
        description: 'Población de 50 con 5 éxitos, muestra de 10'
      },
      {
        params: { N: 100, K: 20, n: 15 },
        description: 'Población de 100 con 20 éxitos, muestra de 15'
      },
      {
        params: { N: 200, K: 50, n: 30 },
        description: 'Población de 200 con 50 éxitos, muestra de 30'
      }
    ];
  }
}

// Función de conveniencia para crear distribución hipergeométrica
export function hypergeometric(N: number, K: number, n: number): HypergeometricDistribution {
  return new HypergeometricDistribution(N, K, n);
}

// Funciones de utilidad para cálculos directos
export function hypergeometricPMF(N: number, K: number, n: number, k: number): number {
  return hypergeometric(N, K, n).pmf(k);
}

export function hypergeometricCDF(N: number, K: number, n: number, k: number): number {
  return hypergeometric(N, K, n).cdf(k);
}

export function hypergeometricQuantile(N: number, K: number, n: number, p: number): number {
  return hypergeometric(N, K, n).quantile(p);
}