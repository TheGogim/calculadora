import { generateTableData, calculateProbability, calculateIntervalProbability, InequalityType, TableData } from '../utils';

export interface ExponentialParams {
  lambda: number; // Tasa (λ > 0)
  scale?: number; // Parámetro de escala β = 1/λ
}

export class ExponentialDistribution {
  private lambda: number;
  private scale: number;

  constructor(lambda: number);
  constructor(scale: number, useScale: boolean);
  constructor(param: number, useScale: boolean = false) {
    if (param <= 0) {
      throw new Error('El parámetro debe ser mayor que 0');
    }
    
    if (useScale) {
      this.scale = param;
      this.lambda = 1 / param;
    } else {
      this.lambda = param;
      this.scale = 1 / param;
    }
  }

  // Función de densidad de probabilidad: f(x)
  pdf(x: number): number {
    if (x < 0) return 0;
    return this.lambda * Math.exp(-this.lambda * x);
  }

  // Función de distribución acumulada: P(X ≤ x)
  cdf(x: number): number {
    if (x < 0) return 0;
    return 1 - Math.exp(-this.lambda * x);
  }

  // Función de supervivencia: P(X ≥ x)
  ccdf(x: number): number {
    if (x < 0) return 1;
    return Math.exp(-this.lambda * x);
  }

  // Función de riesgo (hazard rate)
  hazard(x: number): number {
    if (x < 0) return 0;
    return this.lambda;
  }

  // Función de riesgo acumulada
  cumulativeHazard(x: number): number {
    if (x < 0) return 0;
    return this.lambda * x;
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
    return this.scale;
  }

  // Varianza de la distribución
  get variance(): number {
    return this.scale * this.scale;
  }

  // Desviación estándar
  get stdDev(): number {
    return this.scale;
  }

  // Mediana
  get median(): number {
    return this.scale * Math.log(2);
  }

  // Moda
  get mode(): number {
    return 0;
  }

  // Encontrar cuantil (inversa de CDF)
  quantile(p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('La probabilidad debe estar entre 0 y 1');
    }
    
    if (p === 0) return 0;
    if (p === 1) return Infinity;
    
    return -Math.log(1 - p) / this.lambda;
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

  // Generar valores aleatorios (método de transformada inversa)
  random(): number {
    return -Math.log(1 - Math.random()) / this.lambda;
  }

  // Probabilidad de memorialess: P(X > s + t | X > s) = P(X > t)
  memorylessProbability(s: number, t: number): number {
    if (s < 0 || t < 0) return 0;
    return Math.exp(-this.lambda * t);
  }

  // Validar parámetros
  static validateParams(params: ExponentialParams): string[] {
    const errors: string[] = [];
    
    if (typeof params.lambda !== 'number' || params.lambda <= 0) {
      errors.push('lambda debe ser un número mayor que 0');
    }
    
    if (params.scale !== undefined) {
      if (typeof params.scale !== 'number' || params.scale <= 0) {
        errors.push('scale debe ser un número mayor que 0');
      }
    }
    
    return errors;
  }

  // Ejemplos predefinidos
  static getExamples(): Array<{ params: ExponentialParams; description: string }> {
    return [
      {
        params: { lambda: 1 },
        description: 'Tasa de 1 evento por unidad de tiempo'
      },
      {
        params: { lambda: 0.5 },
        description: 'Tasa de 0.5 eventos por unidad de tiempo'
      },
      {
        params: { scale: 2 },
        description: 'Tiempo medio entre eventos de 2 unidades'
      }
    ];
  }
}

// Función de conveniencia para crear distribución exponencial
export function exponential(lambda: number): ExponentialDistribution {
  return new ExponentialDistribution(lambda);
}

export function exponentialScale(scale: number): ExponentialDistribution {
  return new ExponentialDistribution(scale, true);
}

// Funciones de utilidad para cálculos directos
export function exponentialPDF(lambda: number, x: number): number {
  return exponential(lambda).pdf(x);
}

export function exponentialCDF(lambda: number, x: number): number {
  return exponential(lambda).cdf(x);
}

export function exponentialQuantile(lambda: number, p: number): number {
  return exponential(lambda).quantile(p);
}