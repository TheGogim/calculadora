'use client';

import { useState } from 'react';
import { DistributionTabWrapper } from '../DistributionTabWrapper';

interface StudentParams {
  df: number;
}

export function StudentTab() {
  const [params, setParams] = useState<StudentParams>({ df: 5 });
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
      distribution="student"
      title="Distribución t-Student"
      description="Utilizada para estimar la media de una población normalmente distribuida cuando el tamaño de la muestra es pequeño y la desviación estándar poblacional es desconocida."
      formula="f(t) = [Γ((v+1)/2) / (√(vπ) Γ(v/2))] × (1 + t²/v)^(-(v+1)/2)"
      parameters={[
        { name: 'df (v)', description: 'Grados de libertad', example: '10 grados de libertad' }
      ]}
      properties={[
        'Media: 0 (para df > 1)',
        'Varianza: df/(df-2) (para df > 2)',
        'Simétrica alrededor de 0',
        'Soporte: t ∈ (-∞, ∞)',
        'Converge a Normal estándar cuando df → ∞'
      ]}
      applications={[
        'Pruebas t de Student',
        'Intervalos de confianza para la media',
        'Comparación de medias muestrales',
        'Análisis de regresión',
        'Control de calidad en muestras pequeñas'
      ]}
      params={params}
      setParams={setParams}
      result={result}
      setResult={handleCalculate}
      loading={loading}
      setLoading={setLoading}
      error={error}
      tableConfig={{ start: -4, end: 4, step: 0.1 }}
    />
  );
}