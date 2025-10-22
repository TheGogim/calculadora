'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Search, RefreshCw } from 'lucide-react';
import { TableData } from '@/lib/statistics/utils';

interface DistributionTableProps {
  distribution: string;
  params: any;
  start: number;
  end: number;
  step?: number;
}

interface TableResponse {
  table: TableData[];
  totalRows: number;
}

export function DistributionTable({ distribution, params, start, end, step = 1 }: DistributionTableProps) {
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filter, setFilter] = useState('');
  const [tableStart, setTableStart] = useState(start);
  const [tableEnd, setTableEnd] = useState(end);

  const loadTableData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const urlParams = new URLSearchParams({
        action: 'table',
        start: tableStart.toString(),
        end: tableEnd.toString(),
        ...(step !== 1 && { step: step.toString() }),
        ...Object.entries(params).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value.toString()
        }), {})
      });

      const response = await fetch(`/api/statistics/distributions/${distribution}?${urlParams}`);
      const data: TableResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar la tabla');
      }
      
      setTableData(data.table);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableData();
  }, [distribution, params, tableStart, tableEnd, step]);

  const filteredData = tableData.filter(row => {
    if (!filter) return true;
    return row.x.toString().includes(filter) || 
           (row.pmf && row.pmf.toString().includes(filter)) ||
           (row.pdf && row.pdf.toString().includes(filter)) ||
           row.cdf.toString().includes(filter) ||
           row.ccdf.toString().includes(filter);
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const exportToCSV = () => {
    const headers = ['x', 'pmf/pdf', 'P(X ≤ x)', 'P(X ≥ x)'];
    const rows = filteredData.map(row => [
      row.x,
      row.pmf ? row.pmf.toFixed(6) : (row.pdf ? row.pdf.toFixed(6) : ''),
      row.cdf.toFixed(6),
      row.ccdf.toFixed(6)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${distribution}_table.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isDiscrete = distribution === 'poisson' || distribution === 'binomial' || distribution === 'hypergeometric';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex gap-2">
          <div>
            <Label htmlFor="tableStart">Inicio</Label>
            <Input
              id="tableStart"
              type="number"
              value={tableStart}
              onChange={(e) => setTableStart(Number(e.target.value))}
              className="w-20"
            />
          </div>
          <div>
            <Label htmlFor="tableEnd">Fin</Label>
            <Input
              id="tableEnd"
              type="number"
              value={tableEnd}
              onChange={(e) => setTableEnd(Number(e.target.value))}
              className="w-20"
            />
          </div>
          <Button onClick={loadTableData} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div>
            <Label htmlFor="filter">Filtrar</Label>
            <Input
              id="filter"
              placeholder="Buscar..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-32"
            />
          </div>
          <div>
            <Label htmlFor="itemsPerPage">Items</Label>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="border rounded-lg">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 sticky top-0 bg-background">x</TableHead>
                <TableHead className="w-32 sticky top-0 bg-background">
                  {isDiscrete ? 'P(X = x)' : 'f(x)'}
                </TableHead>
                <TableHead className="w-32 sticky top-0 bg-background">P(X ≤ x)</TableHead>
                <TableHead className="w-32 sticky top-0 bg-background">P(X ≥ x)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{row.x}</TableCell>
                  <TableCell className="font-mono">
                    {row.pmf ? row.pmf.toFixed(6) : (row.pdf ? row.pdf.toFixed(6) : '-')}
                  </TableCell>
                  <TableCell className="font-mono">{row.cdf.toFixed(6)}</TableCell>
                  <TableCell className="font-mono">{row.ccdf.toFixed(6)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length} resultados
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>
          <Badge variant="secondary">
            Página {currentPage} de {totalPages}
          </Badge>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}