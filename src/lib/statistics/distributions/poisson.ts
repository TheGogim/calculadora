import { factorial, findQuantile, generateTableData, calculateProbability, calculateIntervalProbability, InequalityType, TableData } from '../utils';

export interface PoissonParams {
  lambda: number; // Tasa promedio (λ > 0)
}

export interface PoissonResult {
  x: number;
  probability: number;
  type: 'pmf' | 'cdf' | 'ccdf' | 'interval';
}

export class PoissonDistribution {
  private lambda: number;

  constructor(lambda: number) {
    if (lambda <= 0) {
      throw new Error('Lambda debe ser mayor que 0');
    }
    this.lambda = lambda;
  }

  // Función de masa de probabilidad: P(X = k)
  pmf(k: number): number {
    if (k < 0 || !Number.isInteger(k)) return 0;
    return Math.exp(-this.lambda) * Math.pow(this.lambda, k) / factorial(k);
  }

  // Función de distribución acumulada: P(X ≤ k)
  cdf(k: number): number {
    if (k < 0) return 0;
    const kInt = Math.floor(k);
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
    return this.lambda;
  }

  // Varianza de la distribución
  get variance(): number {
    return this.lambda;
  }

  // Desviación estándar
  get stdDev(): number {
    return Math.sqrt(this.lambda);
  }

  // Moda (valor más probable)
  get mode(): number {
    return Math.floor(this.lambda);
  }

  // Encontrar cuantil (inversa de CDF)
  quantile(p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('La probabilidad debe estar entre 0 y 1');
    }
    
    // Para distribuciones discretas, necesitamos encontrar el k más pequeño
    // tal que P(X ≤ k) ≥ p
    let k = 0;
    let cumulative = 0;
    
    while (cumulative < p && k < 10000) { // Límite para evitar bucles infinitos
      cumulative += this.pmf(k);
      if (cumulative >= p) {
        return k;
      }
      k++;
    }
    
    return k;
  }

  // Generar tabla de valores
  generateTable(start: number = 0, end: number = 20): TableData[] {
    return generateTableData(
      (x) => this.pmf(x),
      (x) => this.cdf(x),
      start,
      end,
      1,
      true
    );
  }

  // Generar valores aleatorios
  random(): number {
    const u = Math.random();
    return this.quantile(u);
  }

  // Validar parámetros
  static validateParams(params: PoissonParams): string[] {
    const errors: string[] = [];
    
    if (typeof params.lambda !== 'number' || params.lambda <= 0) {
      errors.push('Lambda debe ser un número mayor que 0');
    }
    
    return errors;
  }

  // Ejemplos predefinidos
  static getExamples(): Array<{ params: PoissonParams; description: string }> {
    return [
      {
        params: { lambda: 1 },
        description: 'Llegadas promedio de 1 por unidad de tiempo'
      },
      {
        params: { lambda: 2 },
        description: 'Llegadas promedio de 2 por unidad de tiempo'
      },
      {
        params: { lambda: 5 },
        description: 'Llegadas promedio de 5 por unidad de tiempo'
      }
    ];
  }
}

// Función de conveniencia para crear distribución de Poisson
export function poisson(lambda: number): PoissonDistribution {
  return new PoissonDistribution(lambda);
}

// Funciones de utilidad para cálculos directos
export function poissonPMF(lambda: number, k: number): number {
  return poisson(lambda).pmf(k);
}

export function poissonCDF(lambda: number, k: number): number {
  return poisson(lambda).cdf(k);
}

export function poissonQuantile(lambda: number, p: number): number {
  return poisson(lambda).quantile(p);
}