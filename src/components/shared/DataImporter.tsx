/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react';

interface DataImporterProps {
  onImport: (data: Record<string, any>[]) => Promise<void>;
  expectedColumns: { key: string; label: string; required?: boolean }[];
  title?: string;
  description?: string;
}

export const DataImporter: React.FC<DataImporterProps> = ({
  onImport,
  expectedColumns,
  title = 'Importar Datos',
  description = 'Arrastra un archivo Excel (.xlsx) o CSV, o haz clic para seleccionar.'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const processFile = useCallback((file: File) => {
    setError(null);
    setImportSuccess(false);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        
        if (jsonData.length === 0) {
          setError('El archivo está vacío o no tiene datos válidos.');
          return;
        }

        // Validate required columns
        const fileColumns = Object.keys(jsonData[0]);
        const missingColumns = expectedColumns
          .filter(col => col.required)
          .filter(col => !fileColumns.some(fc => 
            fc.toLowerCase() === col.key.toLowerCase() || 
            fc.toLowerCase() === col.label.toLowerCase()
          ));

        if (missingColumns.length > 0) {
          setError(`Columnas requeridas faltantes: ${missingColumns.map(c => c.label).join(', ')}`);
          return;
        }

        setFile(file);
        setPreviewData(jsonData.slice(0, 5)); // Show first 5 rows as preview
      } catch (err) {
        setError('Error al procesar el archivo. Asegúrate de que sea un archivo Excel o CSV válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [expectedColumns]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, [processFile]);

  const handleImport = async () => {
    if (!file) return;
    
    setIsImporting(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const XLSX = await import('xlsx');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        
        await onImport(jsonData);
        setImportSuccess(true);
        setFile(null);
        setPreviewData([]);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('Error durante la importación. Por favor, intenta de nuevo.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewData([]);
    setError(null);
    setImportSuccess(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        {!file && (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Formatos soportados: .xlsx, .xls, .csv
            </p>
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {importSuccess && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              ¡Datos importados exitosamente!
            </AlertDescription>
          </Alert>
        )}

        {/* File Preview */}
        {file && previewData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="border rounded-lg overflow-x-auto max-w-full">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    {Object.keys(previewData[0]).map((key) => (
                      <TableHead key={key} className="text-xs whitespace-nowrap">{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((value, j) => (
                        <TableCell key={j} className="text-xs max-w-[200px] truncate">
                          {String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Mostrando las primeras 5 filas como vista previa
            </p>

            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? 'Importando...' : 'Importar Datos'}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Expected Columns Info */}
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Columnas esperadas:</p>
          <ul className="list-disc list-inside">
            {expectedColumns.map((col) => (
              <li key={col.key}>
                {col.label} {col.required && <span className="text-red-500">*</span>}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataImporter;
