'use client';

import { useState } from 'react';
import { DistributionTabWrapper } from '../DistributionTabWrapper';

interface ExponentialParams {
  lambda: number;
}

export function ExponentialTab() {
  const [params, setParams] = useState<ExponentialParams>({ lambda: 1 });
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
      distribution="exponential"
      title="Distribución Exponencial"
      description="Modela el tiempo entre eventos en un proceso de Poisson, o el tiempo hasta el primer evento. Es una distribución continua con propiedades de falta de memoria."
      formula="f(x) = λ × e^(-λx), para x ≥ 0"
      parameters={[
        { name: 'λ (lambda)', description: 'Tasa de ocurrencia de eventos', example: '0.5 eventos por hora' }
      ]}
      properties={[
        'Media: 1/λ',
        'Varianza: 1/λ²',
        'Desviación estándar: 1/λ',
        'Soporte: x ≥ 0',
        'Propiedad de falta de memoria: P(X > s + t | X > s) = P(X > t)'
      ]}
      applications={[
        'Tiempo entre llegadas de clientes',
        'Vida útil de componentes electrónicos',
        'Tiempo hasta el próximo sismo',
        'Procesos de renovación',
        'Análisis de supervivencia'
      ]}
      params={params}
      setParams={setParams}
      result={result}
      setResult={handleCalculate}
      loading={loading}
      setLoading={setLoading}
      error={error}
      tableConfig={{ start: 0, end: 10, step: 0.1 }}
    />
  );
}