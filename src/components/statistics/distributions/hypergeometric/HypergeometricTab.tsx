'use client';

import { useState } from 'react';
import { DistributionTabWrapper } from '../DistributionTabWrapper';

interface HypergeometricParams {
  N: number;
  K: number;
  n: number;
}

export function HypergeometricTab() {
  const [params, setParams] = useState<HypergeometricParams>({ N: 50, K: 5, n: 10 });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (calcResult: any) => {
    setResult(calcResult);
    if (calcResult.error) {
      setError(calcResult.error);
    } else {
      setError(null);
    }
  };

  const calculateTableRange = () => {
    const start = Math.max(0, params.n - (params.N - params.K));
    const end = Math.min(params.n, params.K);
    return { start, end };
  };

  return (
    <DistributionTabWrapper
      distribution="hypergeometric"
      title="Distribución Hipergeométrica"
      description="Modela el número de éxitos en una muestra extraída sin reemplazo de una población finita. A diferencia de la binomial, los ensayos no son independientes."
      formula="P(X = k) = [C(K,k) × C(N-K,n-k)] / C(N,n)"
      parameters={[
        { name: 'N', description: 'Tamaño total de la población', example: '50 elementos totales' },
        { name: 'K', description: 'Número de éxitos en la población', example: '5 elementos defectuosos' },
        { name: 'n', description: 'Tamaño de la muestra', example: '10 elementos muestreados' }
      ]}
      properties={[
        'Media: nK/N',
        'Varianza: nK(N-K)(N-n)/[N²(N-1)]',
        'Soporte: k = max(0, n-(N-K)) a min(n, K)',
        'Distribución discreta',
        'Converge a Binomial cuando N → ∞'
      ]}
      applications={[
        'Control de calidad sin reemplazo',
        'Muestreo biológico y ecológico',
        'Encuestas en poblaciones finitas',
        'Análisis de lotes de producción',
        'Estudios de auditoría'
      ]}
      params={params}
      setParams={setParams}
      result={result}
      setResult={handleCalculate}
      loading={loading}
      setLoading={setLoading}
      error={error}
      tableConfig={calculateTableRange()}
    />
  );
}