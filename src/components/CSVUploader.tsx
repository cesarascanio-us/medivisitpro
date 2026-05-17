import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Loader2, FileUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface CSVUploaderProps {
  collectionName: 'products' | 'contacts';
  onSuccess?: () => void;
  buttonText?: string;
}

export function CSVUploader({ collectionName, onSuccess, buttonText = "Importar CSV" }: CSVUploaderProps) {
  const { session, companyId, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!companyId) {
      toast.error('Error de sesión: No se encontró el company_id del usuario.');
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setStatusText('Analizando archivo CSV...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const results = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });

        if (results.errors && results.errors.length > 0) {
          console.warn("CSV Parse Warnings:", results.errors);
        }

        const parsedData = results.data;
        let importedCount = 0;
        const totalLines = parsedData.length;

        if (totalLines === 0) {
          toast.warning('El archivo no contiene datos válidos');
          setIsImporting(false);
          return;
        }

        setStatusText(`Importando ${totalLines} registros a ${collectionName}...`);

        for (let i = 0; i < totalLines; i++) {
          const row = parsedData[i] as Record<string, any>;
          const rawData: any = {};

          // Limpieza de llaves BOM y espacios
          Object.keys(row).forEach(header => {
            const headerTrimmed = String(header).trim();
            const finalHeader = headerTrimmed.replace(/^\\uFEFF/, '');
            if (row[header] !== undefined && row[header] !== null && row[header] !== '') {
              rawData[finalHeader] = row[header];
            }
          });

          // Mapeo Inteligente basado en la colección
          const data: any = { company_id: companyId };
          
          if (collectionName === 'products') {
            data.name = String(rawData.Nombre || rawData.name || '').trim();
            data.category = String(rawData['Categoría'] || rawData.category || 'General').trim();
            data.description = String(rawData['Indicaciones'] || rawData['Indicaciones (Consolidado)'] || rawData.description || '').trim();
            data.base_price = Number(rawData.Precio || rawData.basePrice || 0);
            data.stock = Number(rawData.Stock_Seguridad || rawData.stock || 0);
            data.status = 'active';
            
            // Atributos de Biofarco
            data.line = String(rawData.line || rawData.Linea || 'Biofarco').trim();
            data.active_principle = String(rawData['Principio(s) Activo(s)'] || rawData.activePrinciple || '').trim();
            data.composition = String(rawData['Composición / Presentación Principal'] || rawData.composition || '').trim();
            data.indications = String(rawData['Indicaciones (Consolidado)'] || rawData.indications || '').trim();
            data.medical_specialty = String(rawData['Especialidad(es) Médica(s)'] || rawData.medicalSpecialty || '').trim();
          } else if (collectionName === 'contacts') {
            data.name = String(rawData.Nombre || rawData.name || '').trim();
            data.contact_type = String(rawData.Tipo || rawData.type || 'Medicos').trim();
            data.address = String(rawData['Dirección'] || rawData.address || '').trim();
            data.phone = String(rawData['Teléfono'] || rawData.phone || '').trim();
            data.city = String(rawData.Ciudad || rawData.city || '').trim();
            data.state = String(rawData.Estado || rawData.state || '').trim();
            data.rif = String(rawData.RIF || rawData.rif || '').trim();
            data.specialty = String(rawData.Especialidad || rawData.specialty || '').trim();
            data.user_id = user?.id;
          }

          // Inserción Recursiva (Self-Healing)
          let payload = { ...data };
          
          const performInsert = async (p: any): Promise<any> => {
            const { error } = await supabase.from(collectionName).insert(p);
            
            if (error && (error.message.includes('column') || error.message.includes('not exist'))) {
              const missingColMatch = error.message.match(/column ["'](.+?)["']/i);
              if (missingColMatch && missingColMatch[1]) {
                const col = missingColMatch[1];
                console.warn(`🛡️ Self-Healing: Eliminando columna inexistente [${col}]`);
                const { [col]: _, ...nextPayload } = p;
                return performInsert(nextPayload);
              }
            }
            return error;
          };

          const error = await performInsert(payload);
          if (!error) importedCount++;

          // Actualizar barra de progreso
          if ((i + 1) % 5 === 0 || (i + 1) === totalLines) {
            setProgress(Math.round(((i + 1) / totalLines) * 100));
          }
        }

        setStatusText('¡Importación completada!');
        toast.success(`${importedCount} registros importados exitosamente`);
        if (onSuccess) onSuccess();
        
        setTimeout(() => setIsOpen(false), 2000);

      } catch (error: any) {
        toast.error(`Error procesando CSV: ${error.message}`);
        setStatusText('Error en la importación');
      } finally {
        setTimeout(() => setIsImporting(false), 2000);
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar {collectionName === 'products' ? 'Productos' : 'Contactos'}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          {!isImporting ? (
            <>
              <div 
                className="border-2 border-dashed border-primary/20 rounded-lg p-12 text-center hover:bg-primary/5 transition-colors cursor-pointer w-full flex flex-col items-center justify-center gap-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-12 w-12 text-primary/40" />
                <div>
                  <p className="text-sm font-medium text-primary">Haz clic para seleccionar un archivo</p>
                  <p className="text-xs text-muted-foreground mt-1">Solo archivos .csv</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-xs w-full">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  El sistema utilizará la herramienta <strong>Self-Healing</strong> para auto-reparar el mapeo de columnas si el CSV tiene campos desconocidos.
                </p>
              </div>
            </>
          ) : (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary font-medium">
                {progress === 100 ? (
                  <Upload className="h-5 w-5 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                <span>{progress === 100 ? 'Importación Exitosa' : 'Procesando...'}</span>
              </div>
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-center text-sm text-muted-foreground">{statusText}</p>
            </div>
          )}
          
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImport}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
