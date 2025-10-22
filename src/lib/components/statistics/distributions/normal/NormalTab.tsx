'use client';

import { useState } from 'react';
import { DistributionTabWrapper } from '../DistributionTabWrapper';

interface NormalParams {
  mu: number;
  sigma: number;
}

export function NormalTab() {
  const [params, setParams] = useState<NormalParams>({ mu: 0, sigma: 1 });
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
      distribution="normal"
      title="Distribución Normal"
      description="La distribución normal o gaussiana es la distribución de probabilidad continua más importante en estadística. Muchos fenómenos naturales siguen esta distribución."
      formula="f(x) = (1/(σ√(2π))) × e^(-(x-μ)²/(2σ²))"
      parameters={[
        { name: 'μ (mu)', description: 'Media de la distribución', example: '100' },
        { name: 'σ (sigma)', description: 'Desviación estándar', example: '15' }
      ]}
      properties={[
        'Media: μ',
        'Varianza: σ²',
        'Desviación estándar: σ',
        'Soporte: x ∈ (-∞, ∞)',
        'Simétrica alrededor de μ',
        'Curtosis: 3 (mesocúrtica)'
      ]}
      applications={[
        'Alturas y pesos de personas',
        'Calificaciones en pruebas estandarizadas',
        'Errores de medición',
        'Variables financieras (rendimientos)',
        'Procesos industriales y control de calidad'
      ]}
      params={params}
      setParams={setParams}
      result={result}
      setResult={handleCalculate}
      loading={loading}
      setLoading={setLoading}
      error={error}
      tableConfig={{ start: -3, end: 3, step: 0.1 }}
    />
  );
}