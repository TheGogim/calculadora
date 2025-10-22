import { NextRequest, NextResponse } from 'next/server';
import { FisherDistribution, FisherParams } from '@/lib/statistics/distributions/fisher';

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
    console.error('Error en API de Fisher:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function handleProbability(searchParams: URLSearchParams) {
  const d1 = parseFloat(searchParams.get('d1') || '1');
  const d2 = parseFloat(searchParams.get('d2') || '1');
  const x = parseFloat(searchParams.get('x') || '0');
  const type = searchParams.get('type') || 'le';

  // Validar parámetros
  const errors = FisherDistribution.validateParams({ d1, d2 });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new FisherDistribution(d1, d2);
  const probability = dist.probability(x, type as any);

  return NextResponse.json({
    d1,
    d2,
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
  const d1 = parseFloat(searchParams.get('d1') || '1');
  const d2 = parseFloat(searchParams.get('d2') || '1');
  const p = parseFloat(searchParams.get('p') || '0.5');

  // Validar parámetros
  const errors = FisherDistribution.validateParams({ d1, d2 });
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

  const dist = new FisherDistribution(d1, d2);
  const quantile = dist.quantile(p);

  return NextResponse.json({
    d1,
    d2,
    p,
    quantile
  });
}

async function handleTable(searchParams: URLSearchParams) {
  const d1 = parseFloat(searchParams.get('d1') || '1');
  const d2 = parseFloat(searchParams.get('d2') || '1');
  const start = parseFloat(searchParams.get('start') || '0');
  const end = parseFloat(searchParams.get('end') || '10');
  const step = parseFloat(searchParams.get('step') || '0.1');

  // Validar parámetros
  const errors = FisherDistribution.validateParams({ d1, d2 });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new FisherDistribution(d1, d2);
  const table = dist.generateTable(start, end, step);

  return NextResponse.json({
    d1,
    d2,
    start,
    end,
    step,
    table,
    totalRows: table.length
  });
}

async function handleValidate(searchParams: URLSearchParams) {
  const d1 = parseFloat(searchParams.get('d1') || '1');
  const d2 = parseFloat(searchParams.get('d2') || '1');
  
  const errors = FisherDistribution.validateParams({ d1, d2 });
  
  return NextResponse.json({
    d1,
    d2,
    isValid: errors.length === 0,
    errors
  });
}

async function handleExamples() {
  const examples = FisherDistribution.getExamples();
  
  return NextResponse.json({
    examples
  });
}