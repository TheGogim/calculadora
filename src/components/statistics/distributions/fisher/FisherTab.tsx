'use client';

import { useState } from 'react';
import { DistributionTabWrapper } from '../DistributionTabWrapper';

interface FisherParams {
  d1: number;
  d2: number;
}

export function FisherTab() {
  const [params, setParams] = useState<FisherParams>({ d1: 5, d2: 10 });
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
      distribution="fisher"
      title="Distribución F de Fisher"
      description="Representa la distribución del cociente de dos variables aleatorias independientes con distribución chi-cuadrado divididas por sus grados de libertad."
      formula="F = (χ₁²/d₁) / (χ₂²/d₂)"
      parameters={[
        { name: 'd1', description: 'Grados de libertad del numerador', example: '5 grados de libertad' },
        { name: 'd2', description: 'Grados de libertad del denominador', example: '10 grados de libertad' }
      ]}
      properties={[
        'Media: d2/(d2-2) para d2 > 2',
        'Varianza: [2d2²(d1+d2-2)]/[d1(d2-2)²(d2-4)] para d2 > 4',
        'Soporte: F > 0',
        'Asimetría positiva',
        'Moda: [d1(d2-2)]/[d2(d1+2)] para d2 > 2'
      ]}
      applications={[
        'Pruebas F en ANOVA',
        'Comparación de varianzas',
        'Análisis de regresión',
        'Pruebas de hipótesis en modelos lineales',
        'Diseño experimental'
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