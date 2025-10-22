import { NextRequest, NextResponse } from 'next/server';
import { HypergeometricDistribution, HypergeometricParams } from '@/lib/statistics/distributions/hypergeometric';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'probability';
    
    switch (action) {
      case 'probability':
        return handleProbability(searchParams);
      case 'quantile':
        return handleQuantile(searchParams);
      case 'table':
        return handleTable(searchParams);
      case 'validate':
        return handleValidate(searchParams);
      case 'examples':
        return handleExamples();
      case 'approximation':
        return handleApproximation(searchParams);
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API de Hypergeometric:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function handleProbability(searchParams: URLSearchParams) {
  const N = parseInt(searchParams.get('N') || '10');
  const K = parseInt(searchParams.get('K') || '5');
  const n = parseInt(searchParams.get('n') || '3');
  const k = parseFloat(searchParams.get('k') || '0');
  const type = searchParams.get('type') || 'le';

  // Validar parámetros
  const errors = HypergeometricDistribution.validateParams({ N, K, n });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new HypergeometricDistribution(N, K, n);
  const probability = dist.probability(k, type as any);

  return NextResponse.json({
    N,
    K,
    n,
    k,
    type,
    probability,
    mean: dist.mean,
    variance: dist.variance,
    stdDev: dist.stdDev
  });
}

async function handleQuantile(searchParams: URLSearchParams) {
  const N = parseInt(searchParams.get('N') || '10');
  const K = parseInt(searchParams.get('K') || '5');
  const n = parseInt(searchParams.get('n') || '3');
  const p = parseFloat(searchParams.get('p') || '0.5');

  // Validar parámetros
  const errors = HypergeometricDistribution.validateParams({ N, K, n });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  if (p < 0 || p > 1) {
    return NextResponse.json(
      { error: 'La probabilidad debe estar entre 0 y 1' },
      { status: 400 }
    );
  }

  const dist = new HypergeometricDistribution(N, K, n);
  const quantile = dist.quantile(p);

  return NextResponse.json({
    N,
    K,
    n,
    p,
    quantile
  });
}

async function handleTable(searchParams: URLSearchParams) {
  const N = parseInt(searchParams.get('N') || '10');
  const K = parseInt(searchParams.get('K') || '5');
  const n = parseInt(searchParams.get('n') || '3');

  // Validar parámetros
  const errors = HypergeometricDistribution.validateParams({ N, K, n });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new HypergeometricDistribution(N, K, n);
  const table = dist.generateTable();

  return NextResponse.json({
    N,
    K,
    n,
    table,
    totalRows: table.length
  });
}

async function handleValidate(searchParams: URLSearchParams) {
  const N = parseInt(searchParams.get('N') || '10');
  const K = parseInt(searchParams.get('K') || '5');
  const n = parseInt(searchParams.get('n') || '3');
  
  const errors = HypergeometricDistribution.validateParams({ N, K, n });
  
  return NextResponse.json({
    N,
    K,
    n,
    isValid: errors.length === 0,
    errors
  });
}

async function handleExamples() {
  const examples = HypergeometricDistribution.getExamples();
  
  return NextResponse.json({
    examples
  });
}

async function handleApproximation(searchParams: URLSearchParams) {
  const N = parseInt(searchParams.get('N') || '10');
  const K = parseInt(searchParams.get('K') || '5');
  const n = parseInt(searchParams.get('n') || '3');
  const k = parseFloat(searchParams.get('k') || '0');
  const type = searchParams.get('type') || 'binomial';

  // Validar parámetros
  const errors = HypergeometricDistribution.validateParams({ N, K, n });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new HypergeometricDistribution(N, K, n);
  let approximation: number;

  if (type === 'binomial') {
    approximation = dist.binomialApproximation(k);
  } else if (type === 'normal') {
    approximation = dist.normalApproximation(k);
  } else {
    return NextResponse.json(
      { error: 'Tipo de aproximación no válido. Use "binomial" o "normal"' },
      { status: 400 }
    );
  }

  const exact = dist.pmf(k);

  return NextResponse.json({
    N,
    K,
    n,
    k,
    type,
    exact,
    approximation,
    error: Math.abs(exact - approximation),
    relativeError: Math.abs((exact - approximation) / exact)
  });
}