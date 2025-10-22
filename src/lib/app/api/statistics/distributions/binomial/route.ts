import { NextRequest, NextResponse } from 'next/server';
import { BinomialDistribution, BinomialParams } from '@/lib/statistics/distributions/binomial';

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
    console.error('Error en API de Binomial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function handleProbability(searchParams: URLSearchParams) {
  const n = parseInt(searchParams.get('n') || '10');
  const p = parseFloat(searchParams.get('p') || '0.5');
  const k = parseFloat(searchParams.get('k') || '0');
  const type = searchParams.get('type') || 'le';

  // Validar parámetros
  const errors = BinomialDistribution.validateParams({ n, p });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new BinomialDistribution(n, p);
  const probability = dist.probability(k, type as any);

  return NextResponse.json({
    n,
    p,
    k,
    type,
    probability,
    mean: dist.mean,
    variance: dist.variance,
    stdDev: dist.stdDev
  });
}

async function handleQuantile(searchParams: URLSearchParams) {
  const n = parseInt(searchParams.get('n') || '10');
  const p = parseFloat(searchParams.get('p') || '0.5');
  const q = parseFloat(searchParams.get('q') || '0.5');

  // Validar parámetros
  const errors = BinomialDistribution.validateParams({ n, p });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  if (q < 0 || q > 1) {
    return NextResponse.json(
      { error: 'La probabilidad debe estar entre 0 y 1' },
      { status: 400 }
    );
  }

  const dist = new BinomialDistribution(n, p);
  const quantile = dist.quantile(q);

  return NextResponse.json({
    n,
    p,
    q,
    quantile
  });
}

async function handleTable(searchParams: URLSearchParams) {
  const n = parseInt(searchParams.get('n') || '10');
  const p = parseFloat(searchParams.get('p') || '0.5');

  // Validar parámetros
  const errors = BinomialDistribution.validateParams({ n, p });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new BinomialDistribution(n, p);
  const table = dist.generateTable();

  return NextResponse.json({
    n,
    p,
    table,
    totalRows: table.length
  });
}

async function handleValidate(searchParams: URLSearchParams) {
  const n = parseInt(searchParams.get('n') || '10');
  const p = parseFloat(searchParams.get('p') || '0.5');
  
  const errors = BinomialDistribution.validateParams({ n, p });
  
  return NextResponse.json({
    n,
    p,
    isValid: errors.length === 0,
    errors
  });
}

async function handleExamples() {
  const examples = BinomialDistribution.getExamples();
  
  return NextResponse.json({
    examples
  });
}

async function handleApproximation(searchParams: URLSearchParams) {
  const n = parseInt(searchParams.get('n') || '10');
  const p = parseFloat(searchParams.get('p') || '0.5');
  const k = parseFloat(searchParams.get('k') || '0');
  const type = searchParams.get('type') || 'normal';

  // Validar parámetros
  const errors = BinomialDistribution.validateParams({ n, p });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new BinomialDistribution(n, p);
  let approximation: number;

  if (type === 'normal') {
    approximation = dist.normalApproximation(k);
  } else if (type === 'poisson') {
    approximation = dist.poissonApproximation(k);
  } else {
    return NextResponse.json(
      { error: 'Tipo de aproximación no válido. Use "normal" o "poisson"' },
      { status: 400 }
    );
  }

  const exact = dist.pmf(k);

  return NextResponse.json({
    n,
    p,
    k,
    type,
    exact,
    approximation,
    error: Math.abs(exact - approximation),
    relativeError: Math.abs((exact - approximation) / exact)
  });
}