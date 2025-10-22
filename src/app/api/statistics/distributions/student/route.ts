import { NextRequest, NextResponse } from 'next/server';
import { StudentDistribution, StudentParams } from '@/lib/statistics/distributions/student';

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
    console.error('Error en API de Student:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function handleProbability(searchParams: URLSearchParams) {
  const df = parseFloat(searchParams.get('df') || '1');
  const t = parseFloat(searchParams.get('t') || '0');
  const type = searchParams.get('type') || 'le';

  // Validar parámetros
  const errors = StudentDistribution.validateParams({ df });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new StudentDistribution(df);
  const probability = dist.probability(t, type as any);

  return NextResponse.json({
    df,
    t,
    type,
    probability,
    pdf: dist.pdf(t),
    mean: dist.mean,
    variance: dist.variance,
    stdDev: dist.stdDev
  });
}

async function handleQuantile(searchParams: URLSearchParams) {
  const df = parseFloat(searchParams.get('df') || '1');
  const p = parseFloat(searchParams.get('p') || '0.5');

  // Validar parámetros
  const errors = StudentDistribution.validateParams({ df });
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

  const dist = new StudentDistribution(df);
  const quantile = dist.quantile(p);

  return NextResponse.json({
    df,
    p,
    quantile
  });
}

async function handleTable(searchParams: URLSearchParams) {
  const df = parseFloat(searchParams.get('df') || '1');
  const start = parseFloat(searchParams.get('start') || '-4');
  const end = parseFloat(searchParams.get('end') || '4');
  const step = parseFloat(searchParams.get('step') || '0.1');

  // Validar parámetros
  const errors = StudentDistribution.validateParams({ df });
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: errors },
      { status: 400 }
    );
  }

  const dist = new StudentDistribution(df);
  const table = dist.generateTable(start, end, step);

  return NextResponse.json({
    df,
    start,
    end,
    step,
    table,
    totalRows: table.length
  });
}

async function handleValidate(searchParams: URLSearchParams) {
  const df = parseFloat(searchParams.get('df') || '1');
  
  const errors = StudentDistribution.validateParams({ df });
  
  return NextResponse.json({
    df,
    isValid: errors.length === 0,
    errors
  });
}

async function handleExamples() {
  const examples = StudentDistribution.getExamples();
  
  return NextResponse.json({
    examples
  });
}