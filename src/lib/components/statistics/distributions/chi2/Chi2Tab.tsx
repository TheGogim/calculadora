'use client';

import { useState } from 'react';
import { DistributionTabWrapper } from '../DistributionTabWrapper';

interface Chi2Params {
  df: number;
}

export function Chi2Tab() {
  const [params, setParams] = useState<Chi2Params>({ df: 5 });
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
      distribution="chi2"
      title="Distribución Chi-cuadrado (χ²)"
      description="Representa la distribución de la suma de los cuadrados de v variables aleatorias independientes con distribución normal estándar."
      formula="f(x) = [1/(2^(v/2) Γ(v/2))] × x^(v/2-1) × e^(-x/2), para x > 0"
      parameters={[
        { name: 'df (v)', description: 'Grados de libertad', example: '10 grados de libertad' }
      ]}
      properties={[
        'Media: v',
        'Varianza: 2v',
        'Desviación estándar: √(2v)',
        'Soporte: x > 0',
        'Asimetría: √(8/v)',
        'Curtosis: 12/v + 3'
      ]}
      applications={[
        'Pruebas de bondad de ajuste',
        'Pruebas de independencia en tablas de contingencia',
        'Intervalos de confianza para varianzas',
        'Análisis de varianza (ANOVA)',
        'Estimación de parámetros en modelos estadísticos'
      ]}
      params={params}
      setParams={setParams}
      result={result}
      setResult={handleCalculate}
      loading={loading}
      setLoading={setLoading}
      error={error}
      tableConfig={{ start: 0, end: 20, step: 0.1 }}
    />
  );
}