import { NextRequest, NextResponse } from 'next/server';
import { ExponentialDistribution, ExponentialParams } from '@/lib/statistics/distributions/exponential';

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
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API de Exponential:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function handleProbability(searchParams: URLSearchParams) {
  const lambda = parseFloat(searchParams.get('lambda') || '1');
  const x = parseFloat(searchParams.get('x') || '0');
  const type = searchParams.get('type') || 'le';

  // Validar parámetros
  const errors = ExponentialDistribution.validateParams({ lambda });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new ExponentialDistribution(lambda);
  const probability = dist.probability(x, type as any);

  return NextResponse.json({
    lambda,
    x,
    type,
    probability,
    pdf: dist.pdf(x),
    mean: dist.mean,
    variance: dist.variance,
    stdDev: dist.stdDev
  });
}

async function handleQuantile(searchParams: URLSearchParams) {
  const lambda = parseFloat(searchParams.get('lambda') || '1');
  const p = parseFloat(searchParams.get('p') || '0.5');

  // Validar parámetros
  const errors = ExponentialDistribution.validateParams({ lambda });
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

  const dist = new ExponentialDistribution(lambda);
  const quantile = dist.quantile(p);

  return NextResponse.json({
    lambda,
    p,
    quantile
  });
}

async function handleTable(searchParams: URLSearchParams) {
  const lambda = parseFloat(searchParams.get('lambda') || '1');
  const start = parseFloat(searchParams.get('start') || '0');
  const end = parseFloat(searchParams.get('end') || '10');
  const step = parseFloat(searchParams.get('step') || '0.1');

  // Validar parámetros
  const errors = ExponentialDistribution.validateParams({ lambda });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new ExponentialDistribution(lambda);
  const table = dist.generateTable(start, end, step);

  return NextResponse.json({
    lambda,
    start,
    end,
    step,
    table,
    totalRows: table.length
  });
}

async function handleValidate(searchParams: URLSearchParams) {
  const lambda = parseFloat(searchParams.get('lambda') || '1');
  
  const errors = ExponentialDistribution.validateParams({ lambda });
  
  return NextResponse.json({
    lambda,
    isValid: errors.length === 0,
    errors
  });
}

async function handleExamples() {
  const examples = ExponentialDistribution.getExamples();
  
  return NextResponse.json({
    examples
  });
}