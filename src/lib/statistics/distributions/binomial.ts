import { combination, findQuantile, generateTableData, calculateProbability, calculateIntervalProbability, InequalityType, TableData } from '../utils';

export interface BinomialParams {
  n: number; // Número de ensayos
  p: number; // Probabilidad de éxito (0 ≤ p ≤ 1)
}

export class BinomialDistribution {
  private n: number;
  private p: number;

  constructor(n: number, p: number) {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error('n debe ser un entero no negativo');
    }
    if (p < 0 || p > 1) {
      throw new Error('p debe estar entre 0 y 1');
    }
    this.n = n;
    this.p = p;
  }

  // Función de masa de probabilidad: P(X = k)
  pmf(k: number): number {
    if (k < 0 || k > this.n || !Number.isInteger(k)) return 0;
    return combination(this.n, k) * Math.pow(this.p, k) * Math.pow(1 - this.p, this.n - k);
  }

  // Función de distribución acumulada: P(X ≤ k)
  cdf(k: number): number {
    if (k < 0) return 0;
    const kInt = Math.min(Math.floor(k), this.n);
    let sum = 0;
    for (let i = 0; i <= kInt; i++) {
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
    return this.n * this.p;
  }

  // Varianza de la distribución
  get variance(): number {
    return this.n * this.p * (1 - this.p);
  }

  // Desviación estándar
  get stdDev(): number {
    return Math.sqrt(this.variance);
  }

  // Moda
  get mode(): number {
    const floor = Math.floor((this.n + 1) * this.p);
    if ((this.n + 1) * this.p === floor) {
      return floor - 1; // Dos modas
    }
    return floor;
  }

  // Encontrar cuantil (inversa de CDF)
  quantile(q: number): number {
    if (q < 0 || q > 1) {
      throw new Error('La probabilidad debe estar entre 0 y 1');
    }
    
    let k = 0;
    let cumulative = 0;
    
    while (cumulative < q && k <= this.n) {
      cumulative += this.pmf(k);
      if (cumulative >= q) {
        return k;
      }
      k++;
    }
    
    return this.n;
  }

  // Generar tabla de valores
  generateTable(): TableData[] {
    return generateTableData(
      (x) => this.pmf(x),
      (x) => this.cdf(x),
      0,
      this.n,
      1,
      true
    );
  }

  // Aproximación normal (para n grande y p no extremo)
  normalApproximation(x: number, continuityCorrection: boolean = true): number {
    const mu = this.mean;
    const sigma = this.stdDev;
    
    if (sigma === 0) return x === mu ? 1 : 0;
    
    const z = continuityCorrection ? (x + 0.5 - mu) / sigma : (x - mu) / sigma;
    return this.normalCDF(z);
  }

  // Aproximación de Poisson (para n grande y p pequeño)
  poissonApproximation(lambda: number = this.n * this.p): number {
    const poissonLambda = this.n * this.p;
    return Math.exp(-poissonLambda) * Math.pow(poissonLambda, lambda) / this.factorial(lambda);
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

  // Factorial (para aproximación de Poisson)
  private factorial(n: number): number {
    if (n < 0) throw new Error('Factorial no definido para números negativos');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  // Validar parámetros
  static validateParams(params: BinomialParams): string[] {
    const errors: string[] = [];
    
    if (!Number.isInteger(params.n) || params.n < 0) {
      errors.push('n debe ser un entero no negativo');
    }
    
    if (typeof params.p !== 'number' || params.p < 0 || params.p > 1) {
      errors.push('p debe ser un número entre 0 y 1');
    }
    
    return errors;
  }

  // Ejemplos predefinidos
  static getExamples(): Array<{ params: BinomialParams; description: string }> {
    return [
      {
        params: { n: 10, p: 0.2 },
        description: '10 ensayos con 20% de probabilidad de éxito'
      },
      {
        params: { n: 20, p: 0.5 },
        description: '20 ensayos con 50% de probabilidad de éxito'
      },
      {
        params: { n: 100, p: 0.02 },
        description: '100 ensayos con 2% de probabilidad de éxito (aproximable a Poisson)'
      }
    ];
  }
}

// Función de conveniencia para crear distribución binomial
export function binomial(n: number, p: number): BinomialDistribution {
  return new BinomialDistribution(n, p);
}

// Funciones de utilidad para cálculos directos
export function binomialPMF(n: number, p: number, k: number): number {
  return binomial(n, p).pmf(k);
}

export function binomialCDF(n: number, p: number, k: number): number {
  return binomial(n, p).cdf(k);
}

export function binomialQuantile(n: number, p: number, q: number): number {
  return binomial(n, p).quantile(q);
}