'use client';

import { useState } from 'react';
import { DistributionTabWrapper } from '../DistributionTabWrapper';

interface PoissonParams {
  lambda: number;
}

export function PoissonTab() {
  const [params, setParams] = useState<PoissonParams>({ lambda: 2 });
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
      distribution="poisson"
      title="Distribución de Poisson"
      description="Modela el número de eventos que ocurren en un intervalo fijo de tiempo o espacio, cuando estos eventos suceden con una tasa media constante y son independientes entre sí."
      formula="P(X = k) = (e^{-λ} λ^k) / k!"
      parameters={[
        { name: 'λ (lambda)', description: 'Tasa promedio de ocurrencia (λ > 0)', example: '2 eventos por hora' }
      ]}
      properties={[
        'Media: λ',
        'Varianza: λ',
        'Desviación estándar: √λ',
        'Soporte: k = 0, 1, 2, ...'
      ]}
      applications={[
        'Número de llamadas a un centro de atención',
        'Llegadas de clientes a un negocio',
        'Defectos en un proceso de fabricación',
        'Eventos raros en grandes poblaciones'
      ]}
      params={params}
      setParams={setParams}
      result={result}
      setResult={handleCalculate}
      loading={loading}
      setLoading={setLoading}
      error={error}
      tableConfig={{ start: 0, end: 20 }}
    />
  );
}