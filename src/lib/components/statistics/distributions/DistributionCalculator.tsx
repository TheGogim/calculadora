'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, ArrowRightLeft } from 'lucide-react';

interface DistributionCalculatorProps {
  distribution: string;
  params: any;
  onParamsChange: (params: any) => void;
  onCalculate: (result: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface ParamConfig {
  name: string;
  key: string;
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  description: string;
  placeholder: string;
}

const PARAMS_CONFIG: Record<string, ParamConfig[]> = {
  poisson: [
    { name: 'λ (Lambda)', key: 'lambda', type: 'number', min: 0.01, step: 0.1, description: 'Tasa promedio', placeholder: '2' }
  ],
  binomial: [
    { name: 'n', key: 'n', type: 'number', min: 1, step: 1, description: 'Número de ensayos', placeholder: '10' },
    { name: 'p', key: 'p', type: 'number', min: 0, max: 1, step: 0.01, description: 'Probabilidad de éxito', placeholder: '0.5' }
  ],
  hypergeometric: [
    { name: 'N', key: 'N', type: 'number', min: 1, step: 1, description: 'Tamaño población', placeholder: '50' },
    { name: 'K', key: 'K', type: 'number', min: 0, step: 1, description: 'Éxitos en población', placeholder: '5' },
    { name: 'n', key: 'n', type: 'number', min: 0, step: 1, description: 'Tamaño muestra', placeholder: '10' }
  ],
  normal: [
    { name: 'μ (mu)', key: 'mu', type: 'number', step: 0.1, description: 'Media', placeholder: '0' },
    { name: 'σ (sigma)', key: 'sigma', type: 'number', min: 0.01, step: 0.1, description: 'Desviación estándar', placeholder: '1' }
  ],
  exponential: [
    { name: 'λ (lambda)', key: 'lambda', type: 'number', min: 0.01, step: 0.1, description: 'Tasa', placeholder: '1' }
  ],
  student: [
    { name: 'df', key: 'df', type: 'number', min: 0.01, step: 1, description: 'Grados de libertad', placeholder: '5' }
  ],
  chi2: [
    { name: 'df', key: 'df', type: 'number', min: 0.01, step: 1, description: 'Grados de libertad', placeholder: '5' }
  ],
  fisher: [
    { name: 'd1', key: 'd1', type: 'number', min: 0.01, step: 1, description: 'Grados libertad numerador', placeholder: '5' },
    { name: 'd2', key: 'd2', type: 'number', min: 0.01, step: 1, description: 'Grados libertad denominador', placeholder: '10' }
  ]
};

const INEQUALITY_OPTIONS = [
  { value: 'le', label: 'P(X ≤ x)' },
  { value: 'lt', label: 'P(X < x)' },
  { value: 'ge', label: 'P(X ≥ x)' },
  { value: 'gt', label: 'P(X > x)' },
  { value: 'eq', label: 'P(X = x)' },
  { value: 'ne', label: 'P(X ≠ x)' }
];

export function DistributionCalculator({ 
  distribution, 
  params, 
  onParamsChange, 
  onCalculate,
  loading,
  setLoading
}: DistributionCalculatorProps) {
  const [calculationType, setCalculationType] = useState<'direct' | 'inverse'>('direct');
  const [xValue, setXValue] = useState<string>('');
  const [probabilityValue, setProbabilityValue] = useState<string>('');
  const [inequalityType, setInequalityType] = useState<string>('le');

  const paramConfigs = PARAMS_CONFIG[distribution] || [];

  const handleParamChange = (key: string, value: string) => {
    onParamsChange({
      ...params,
      [key]: parseFloat(value) || 0
    });
  };

  const handleDirectCalculation = async () => {
    if (!xValue) return;
    
    try {
      const urlParams = new URLSearchParams({
        action: 'probability',
        ...Object.entries(params).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value.toString()
        }), {}),
        k: xValue, // Para discretas usar 'k', para continuas 'x'
        x: xValue, // Para continuas
        type: inequalityType
      });

      const response = await fetch(`/api/statistics/distributions/${distribution}?${urlParams}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en el cálculo');
      }
      
      return data;
    } catch (error) {
      console.error('Error en cálculo directo:', error);
      throw error;
    }
  };

  const handleInverseCalculation = async () => {
    if (!probabilityValue) return;
    
    try {
      const urlParams = new URLSearchParams({
        action: 'quantile',
        ...Object.entries(params).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value.toString()
        }), {}),
        p: probabilityValue
      });

      const response = await fetch(`/api/statistics/distributions/${distribution}?${urlParams}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en el cálculo inverso');
      }
      
      return data;
    } catch (error) {
      console.error('Error en cálculo inverso:', error);
      throw error;
    }
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      let result;
      
      if (calculationType === 'direct') {
        result = await handleDirectCalculation();
      } else {
        result = await handleInverseCalculation();
      }
      
      onCalculate(result);
    } catch (error) {
      console.error('Error en cálculo:', error);
      onCalculate({ error: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {paramConfigs.map((config) => (
          <div key={config.key} className="space-y-1">
            <Label htmlFor={config.key} className="text-sm font-medium">
              {config.name}
            </Label>
            <Input
              id={config.key}
              type={config.type}
              min={config.min}
              max={config.max}
              step={config.step}
              value={params[config.key] || ''}
              onChange={(e) => handleParamChange(config.key, e.target.value)}
              placeholder={config.placeholder}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        ))}
      </div>

      <Tabs value={calculationType} onValueChange={(value) => setCalculationType(value as 'direct' | 'inverse')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="direct" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Directo
          </TabsTrigger>
          <TabsTrigger value="inverse" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Inverso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="xValue">Valor de x</Label>
              <Input
                id="xValue"
                type="number"
                step="0.01"
                value={xValue}
                onChange={(e) => setXValue(e.target.value)}
                placeholder="Ingrese el valor de x"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="inequality">Tipo de probabilidad</Label>
              <Select value={inequalityType} onValueChange={setInequalityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INEQUALITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inverse" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="probabilityValue">Probabilidad (p)</Label>
              <Input
                id="probabilityValue"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={probabilityValue}
                onChange={(e) => setProbabilityValue(e.target.value)}
                placeholder="Ingrese la probabilidad (0-1)"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Encuentra el valor x tal que P(X ≤ x) = p
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <Button 
        onClick={handleCalculate} 
        disabled={loading || !params} 
        className="w-full"
      >
        {loading ? 'Calculando...' : 'Calcular'}
      </Button>
    </div>
  );
}