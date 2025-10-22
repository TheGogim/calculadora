'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Table as TableIcon, Info, BookOpen, MessageSquare } from 'lucide-react';
import { DistributionCalculator } from './DistributionCalculator';
import { DistributionTable } from './DistributionTable';
import { DistributionInfo } from './DistributionInfo';
import { Chatbot } from './Chatbot';

interface DistributionTabWrapperProps {
  distribution: string;
  title: string;
  description: string;
  formula: string;
  parameters: Array<{name: string, description: string, example: string}>;
  properties: string[];
  applications: string[];
  params: any;
  setParams: (params: any) => void;
  result: any;
  setResult: (result: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  tableConfig?: {
    start: number;
    end: number;
    step?: number;
  };
}

export function DistributionTabWrapper({
  distribution,
  title,
  description,
  formula,
  parameters,
  properties,
  applications,
  params,
  setParams,
  result,
  setResult,
  loading,
  setLoading,
  error,
  tableConfig = { start: 0, end: 20 }
}: DistributionTabWrapperProps) {
  const [activeInternalTab, setActiveInternalTab] = useState('parametros');
  const [showChatbot, setShowChatbot] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveInternalTab(value);
    // Hide chatbot when switching to other tabs
    if (value !== 'aplicaciones') {
      setShowChatbot(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeInternalTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parametros" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Parámetros
          </TabsTrigger>
          <TabsTrigger value="formula" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Fórmula
          </TabsTrigger>
          <TabsTrigger value="aplicaciones" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Aplicaciones
          </TabsTrigger>
          <TabsTrigger value="tabla" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Tabla
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parametros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculadora
              </CardTitle>
              <CardDescription>
                Calcula probabilidades para la distribución {title.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DistributionCalculator
                distribution={distribution}
                params={params}
                onParamsChange={setParams}
                onCalculate={setResult}
                loading={loading}
                setLoading={setLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formula" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Fórmula y Propiedades
              </CardTitle>
              <CardDescription>
                Detalles matemáticos de la distribución {title.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DistributionInfo
                title={title}
                description={description}
                formula={formula}
                parameters={parameters}
                properties={properties}
                applications={[]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aplicaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Aplicaciones
              </CardTitle>
              <CardDescription>
                Usos prácticos de la distribución {title.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DistributionInfo
                title={title}
                description={description}
                formula=""
                parameters={[]}
                properties={[]}
                applications={applications}
              />
            </CardContent>
          </Card>

          {/* Chatbot - only visible in aplicaciones tab */}
          <Chatbot
            distribution={distribution}
            isVisible={showChatbot}
            onToggleVisibility={() => setShowChatbot(!showChatbot)}
          />
        </TabsContent>

        <TabsContent value="tabla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                Tabla de Distribución
              </CardTitle>
              <CardDescription>
                Tabla completa de probabilidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DistributionTable
                distribution={distribution}
                params={params}
                start={tableConfig.start}
                end={tableConfig.end}
                step={tableConfig.step}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && !result.error && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado del Cálculo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(result).map(([key, value]) => {
                if (key === 'error') return null;
                return (
                  <div key={key} className="space-y-1">
                    <p className="text-sm font-medium capitalize">{key}</p>
                    <p className="text-2xl font-bold">
                      {typeof value === 'number' ? value.toFixed(6) : value}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}