// Exportar todas las distribuciones estadísticas

// Distribuciones discretas
export * from './distributions/poisson';
export * from './distributions/binomial';
export * from './distributions/hypergeometric';

// Distribuciones continuas
export * from './distributions/normal';
export * from './distributions/exponential';
export * from './distributions/student';
export * from './distributions/chi2';
export * from './distributions/fisher';

// Utilidades
export * from './utils';

// Tipos comunes
export type DistributionType = 
  | 'poisson'
  | 'binomial'
  | 'hypergeometric'
  | 'normal'
  | 'exponential'
  | 'student'
  | 'chi2'
  | 'fisher';

export interface DistributionParams {
  type: DistributionType;
  params: any;
}

// Función para crear distribución por tipo
export function createDistribution(type: DistributionType, params: any) {
  switch (type) {
    case 'poisson':
      return new PoissonDistribution(params.lambda);
    case 'binomial':
      return new BinomialDistribution(params.n, params.p);
    case 'hypergeometric':
      return new HypergeometricDistribution(params.N, params.K, params.n);
    case 'normal':
      return new NormalDistribution(params.mu, params.sigma);
    case 'exponential':
      return new ExponentialDistribution(params.lambda);
    case 'student':
      return new StudentDistribution(params.df);
    case 'chi2':
      return new Chi2Distribution(params.df);
    case 'fisher':
      return new FisherDistribution(params.d1, params.d2);
    default:
      throw new Error(`Tipo de distribución no válido: ${type}`);
  }
}