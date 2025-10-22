import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TableData } from './statistics/utils';

interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  includeHeaders?: boolean;
}

export class ExportUtils {
  // Exportar a CSV
  static exportToCSV(data: any[], headers: string[], options: ExportOptions = { filename: 'export' }) {
    const { filename, includeHeaders = true } = options;
    
    let csvContent = '';
    
    if (includeHeaders) {
      csvContent += headers.join(',') + '\n';
    }
    
    data.forEach(row => {
      const csvRow = headers.map(header => {
        const value = row[header];
        // Escapar comillas y manejar valores que contienen comas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
      csvContent += csvRow + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Exportar a Excel
  static exportToExcel(data: any[], headers: string[], options: ExportOptions = { filename: 'export' }) {
    const { filename, title, subtitle } = options;
    
    // Crear workbook
    const wb = XLSX.utils.book_new();
    
    // Preparar datos para Excel
    const wsData = [];
    
    // Añadir título si existe
    if (title) {
      wsData.push([title]);
      if (subtitle) {
        wsData.push([subtitle]);
      }
      wsData.push([]); // Fila vacía
    }
    
    // Añadir headers
    wsData.push(headers);
    
    // Añadir datos
    data.forEach(row => {
      const rowData = headers.map(header => row[header]);
      wsData.push(rowData);
    });
    
    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Ajustar anchos de columna
    const colWidths = headers.map(header => ({
      wch: Math.max(header.length, 15)
    }));
    ws['!cols'] = colWidths;
    
    // Añadir worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    
    // Guardar archivo
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  // Exportar a PDF
  static exportToPDF(data: any[], headers: string[], options: ExportOptions = { filename: 'export' }) {
    const { filename, title, subtitle } = options;
    
    const doc = new jsPDF();
    
    // Configurar fuente
    doc.setFont('helvetica');
    
    // Añadir título
    if (title) {
      doc.setFontSize(16);
      doc.text(title, 14, 20);
      
      if (subtitle) {
        doc.setFontSize(12);
        doc.text(subtitle, 14, 30);
      }
    }
    
    // Preparar datos para la tabla
    const tableData = data.map(row => headers.map(header => row[header]));
    
    // Configurar tabla
    const tableOptions = {
      head: [headers],
      body: tableData,
      startY: title ? 45 : 20,
      styles: {
        fontSize: 10,
        font: 'helvetica',
        cellPadding: 3
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 20 }
    };
    
    // Añadir tabla al PDF
    (doc as any).autoTable(tableOptions);
    
    // Guardar archivo
    doc.save(`${filename}.pdf`);
  }

  // Exportar tabla de distribución estadística
  static exportDistributionTable(
    distribution: string,
    data: TableData[],
    params: any,
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ) {
    const headers = ['x', 'pmf/pdf', 'P(X ≤ x)', 'P(X ≥ x)'];
    const exportData = data.map(row => ({
      'x': row.x,
      'pmf/pdf': row.pmf ? row.pmf.toFixed(6) : (row.pdf ? row.pdf.toFixed(6) : ''),
      'P(X ≤ x)': row.cdf.toFixed(6),
      'P(X ≥ x)': row.ccdf.toFixed(6)
    }));

    const paramStr = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('_');
    
    const filename = `${distribution}_${paramStr}`;
    const title = `Tabla de Distribución ${distribution.charAt(0).toUpperCase() + distribution.slice(1)}`;
    const subtitle = `Parámetros: ${paramStr.replace(/_/g, ', ')}`;

    const options: ExportOptions = {
      filename,
      title,
      subtitle,
      includeHeaders: true
    };

    switch (format) {
      case 'csv':
        this.exportToCSV(exportData, headers, options);
        break;
      case 'excel':
        this.exportToExcel(exportData, headers, options);
        break;
      case 'pdf':
        this.exportToPDF(exportData, headers, options);
        break;
      default:
        throw new Error(`Formato de exportación no válido: ${format}`);
    }
  }

  // Exportar resultado de cálculo
  static exportCalculationResult(
    distribution: string,
    result: any,
    params: any,
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ) {
    const headers = ['Propiedad', 'Valor'];
    const exportData = [
      { 'Propiedad': 'Distribución', 'Valor': distribution },
      ...Object.entries(params).map(([key, value]) => ({
        'Propiedad': key,
        'Valor': value.toString()
      })),
      ...Object.entries(result).map(([key, value]) => ({
        'Propiedad': key,
        'Valor': typeof value === 'number' ? value.toFixed(6) : value.toString()
      }))
    ];

    const paramStr = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('_');
    
    const filename = `${distribution}_resultado_${paramStr}`;
    const title = `Resultado de Cálculo - ${distribution.charAt(0).toUpperCase() + distribution.slice(1)}`;
    const subtitle = `Parámetros: ${paramStr.replace(/_/g, ', ')}`;

    const options: ExportOptions = {
      filename,
      title,
      subtitle,
      includeHeaders: true
    };

    switch (format) {
      case 'csv':
        this.exportToCSV(exportData, headers, options);
        break;
      case 'excel':
        this.exportToExcel(exportData, headers, options);
        break;
      case 'pdf':
        this.exportToPDF(exportData, headers, options);
        break;
      default:
        throw new Error(`Formato de exportación no válido: ${format}`);
    }
  }
}