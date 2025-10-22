'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Lightbulb, SquareFunction } from 'lucide-react';
import React from 'react';

interface DistributionInfoProps {
  title: string;
  description: string;
  formula: string;
  parameters: Array<{
    name: string;
    description: string;
    example: string;
  }>;
  properties: string[];
  applications: string[];
}

const FormulaDisplay: React.FC<{ formula: string }> = ({ formula }) => {
  // Formatear la fórmula para mejor visualización
  const formatFormula = (text: string) => {
    return text
      .replace(/×/g, ' × ')
      .replace(/÷/g, ' ÷ ')
      .replace(/\^/g, '^')
      .replace(/sqrt\(/g, '√(')
      .replace(/sum_/g, '∑')
      .replace(/prod_/g, '∏')
      .replace(/int_/g, '∫')
      .replace(/<=/g, '≤')
      .replace(/>=/g, '≥')
      .replace(/!=/g, '≠')
      .replace(/inf/g, '∞')
      .replace(/lambda/g, 'λ')
      .replace(/mu/g, 'μ')
      .replace(/sigma/g, 'σ')
      .replace(/pi/g, 'π')
      .replace(/theta/g, 'θ')
      .replace(/alpha/g, 'α')
      .replace(/beta/g, 'β')
      .replace(/gamma/g, 'γ')
      .replace(/delta/g, 'δ')
      .replace(/epsilon/g, 'ε')
      .replace(/chi2/g, 'χ²')
      .replace(/e\^/g, 'e^')
      .replace(/\{([^}]+)\}/g, '{$1}');
  };

  return (
    <div className="text-center">
      <div className="text-lg font-mono bg-muted p-4 rounded-lg leading-relaxed whitespace-pre">
        {formatFormula(formula).split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
};

export function DistributionInfo({
  title,
  description,
  formula,
  parameters,
  properties,
  applications
}: DistributionInfoProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Descripción</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Tabs defaultValue="formula" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="formula" className="flex items-center gap-2">
            <SquareFunction className="h-4 w-4" />
            Fórmula
          </TabsTrigger>
          <TabsTrigger value="parameters" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Parámetros
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Aplicaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formula" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FormulaDisplay formula={formula} />
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Propiedades</h4>
            <div className="flex flex-wrap gap-2">
              {properties.map((property, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {property}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <div className="space-y-3">
            {parameters.map((param, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{param.name}</h4>
                      <Badge variant="outline">{param.example}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{param.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Aplicaciones Prácticas</h4>
            <ul className="space-y-2">
              {applications.map((application, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{application}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}