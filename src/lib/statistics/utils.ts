// Utilidades estadísticas comunes

export interface ProbabilityResult {
  value: number;
  probability: number;
  type: 'pmf' | 'pdf' | 'cdf' | 'ccdf' | 'interval';
}

export interface QuantileResult {
  probability: number;
  quantile: number;
}

export interface TableData {
  x: number;
  pmf?: number; // Para distribuciones discretas
  pdf?: number; // Para distribuciones continuas
  cdf: number; // P(X ≤ x)
  ccdf: number; // P(X ≥ x) = 1 - P(X < x)
}

export type InequalityType = 'le' | 'lt' | 'ge' | 'gt' | 'eq' | 'ne';

// Función para calcular factorial
export function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial no definido para números negativos');
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Función para calcular combinaciones (n choose k)
export function combination(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  // Optimización para calcular combinaciones grandes
  let result = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * (n - i + 1) / i;
  }
  return result;
}

// Función de error para distribuciones normales
export function erf(x: number): number {
  // Aproximación de la función de error
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

// Función gamma incompleta inferior
export function gammaIncomplete(a: number, x: number): number {
  // Implementación simplificada usando series
  if (x < 0 || a <= 0) return 0;
  
  let sum = 0;
  let term = 1 / a;
  let n = 1;
  
  while (Math.abs(term) > 1e-10 && n < 1000) {
    sum += term;
    term *= x / (a + n);
    n++;
  }
  
  return Math.pow(x, a) * Math.exp(-x) * sum;
}

// Función para encontrar cuantiles usando búsqueda binaria
export function findQuantile(
  cdf: (x: number) => number,
  target: number,
  min: number = -1000,
  max: number = 1000,
  tolerance: number = 1e-8
): number {
  let low = min;
  let high = max;
  let mid: number;
  
  while (high - low > tolerance) {
    mid = (low + high) / 2;
    const prob = cdf(mid);
    
    if (prob < target) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return (low + high) / 2;
}

// Función para generar datos de tabla
export function generateTableData(
  pmfOrPdf: (x: number) => number,
  cdf: (x: number) => number,
  start: number,
  end: number,
  step: number = 1,
  isDiscrete: boolean = true
): TableData[] {
  const data: TableData[] = [];
  
  for (let x = start; x <= end; x += step) {
    const density = pmfOrPdf(x);
    const cumulative = cdf(x);
    
    data.push({
      x,
      ...(isDiscrete ? { pmf: density } : { pdf: density }),
      cdf: cumulative,
      ccdf: 1 - cdf(x - (isDiscrete ? 1 : 0))
    });
  }
  
  return data;
}

// Función para calcular probabilidades basadas en tipo de desigualdad
export function calculateProbability(
  x: number,
  pmfOrPdf: (x: number) => number,
  cdf: (x: number) => number,
  type: InequalityType,
  isDiscrete: boolean = true
): number {
  switch (type) {
    case 'le': // P(X ≤ x)
      return cdf(x);
    case 'lt': // P(X < x)
      return isDiscrete ? cdf(x - 1) : cdf(x) - pmfOrPdf(x);
    case 'ge': // P(X ≥ x)
      return isDiscrete ? 1 - cdf(x - 1) : 1 - cdf(x) + pmfOrPdf(x);
    case 'gt': // P(X > x)
      return 1 - cdf(x);
    case 'eq': // P(X = x)
      return pmfOrPdf(x);
    case 'ne': // P(X ≠ x)
      return 1 - pmfOrPdf(x);
    default:
      throw new Error(`Tipo de desigualdad no válido: ${type}`);
  }
}

// Función para calcular probabilidades de intervalo
export function calculateIntervalProbability(
  a: number,
  b: number,
  cdf: (x: number) => number,
  inclusive: boolean = true
): number {
  if (inclusive) {
    return cdf(b) - cdf(a - 1);
  } else {
    return cdf(b - 1) - cdf(a);
  }
}