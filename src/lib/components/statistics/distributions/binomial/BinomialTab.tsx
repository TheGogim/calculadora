'use client';

import { useState } from 'react';
import { DistributionTabWrapper } from '../DistributionTabWrapper';

interface BinomialParams {
  n: number;
  p: number;
}

export function BinomialTab() {
  const [params, setParams] = useState<BinomialParams>({ n: 10, p: 0.5 });
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

  return (
    <DistributionTabWrapper
      distribution="binomial"
      title="Distribución Binomial"
      description="Modela el número de éxitos en n ensayos independientes de Bernoulli, cada uno con probabilidad p de éxito."
      formula="P(X = k) = C(n,k) × p^k × (1-p)^(n-k)"
      parameters={[
        { name: 'n', description: 'Número de ensayos independientes', example: '10 lanzamientos' },
        { name: 'p', description: 'Probabilidad de éxito en cada ensayo', example: '0.5 (50%)' }
      ]}
      properties={[
        'Media: n × p',
        'Varianza: n × p × (1-p)',
        'Desviación estándar: √(n × p × (1-p))',
        'Soporte: k = 0, 1, 2, ..., n'
      ]}
      applications={[
        'Control de calidad (defectos en producción)',
        'Encuestas y sondeos de opinión',
        'Pruebas de hipótesis',
        'Análisis de decisiones binarias'
      ]}
      params={params}
      setParams={setParams}
      result={result}
      setResult={handleCalculate}
      loading={loading}
      setLoading={setLoading}
      error={error}
      tableConfig={{ start: 0, end: params.n }}
    />
  );
}