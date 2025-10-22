'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Table, BookOpen, FileText } from 'lucide-react';
import { PoissonTab } from '@/components/statistics/distributions/poisson/PoissonTab';
import { BinomialTab } from '@/components/statistics/distributions/binomial/BinomialTab';
import { NormalTab } from '@/components/statistics/distributions/normal/NormalTab';
import { ExponentialTab } from '@/components/statistics/distributions/exponential/ExponentialTab';
import { StudentTab } from '@/components/statistics/distributions/student/StudentTab';
import { Chi2Tab } from '@/components/statistics/distributions/chi2/Chi2Tab';
import { FisherTab } from '@/components/statistics/distributions/fisher/FisherTab';
import { HypergeometricTab } from '@/components/statistics/distributions/hypergeometric/HypergeometricTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('poisson');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Distribuciones Estadísticas</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calculadora interactiva de distribuciones estadísticas discretas y continuas con tablas completas y funciones directas e inversas.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="poisson" className="text-xs">Poisson</TabsTrigger>
            <TabsTrigger value="binomial" className="text-xs">Binomial</TabsTrigger>
            <TabsTrigger value="hypergeometric" className="text-xs">Hipergeométrica</TabsTrigger>
            <TabsTrigger value="normal" className="text-xs">Normal</TabsTrigger>
            <TabsTrigger value="exponential" className="text-xs">Exponencial</TabsTrigger>
            <TabsTrigger value="student" className="text-xs">t-Student</TabsTrigger>
            <TabsTrigger value="chi2" className="text-xs">χ²</TabsTrigger>
            <TabsTrigger value="fisher" className="text-xs">F-Fisher</TabsTrigger>
          </TabsList>

          <TabsContent value="poisson">
            <PoissonTab />
          </TabsContent>

          <TabsContent value="binomial">
            <BinomialTab />
          </TabsContent>

          <TabsContent value="hypergeometric">
            <HypergeometricTab />
          </TabsContent>

          <TabsContent value="normal">
            <NormalTab />
          </TabsContent>

          <TabsContent value="exponential">
            <ExponentialTab />
          </TabsContent>

          <TabsContent value="student">
            <StudentTab />
          </TabsContent>

          <TabsContent value="chi2">
            <Chi2Tab />
          </TabsContent>

          <TabsContent value="fisher">
            <FisherTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}