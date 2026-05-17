import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Database, UploadCloud, MapPin, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { biofarcoCatalog } from '@/data/biofarcoCatalog';
import { useAuth } from '@/hooks/useAuth';
import { CSVUploader } from '@/components/CSVUploader';

export function SystemSeeders() {
  const { session } = useAuth();
  const [isSeedingProducts, setIsSeedingProducts] = useState(false);
  const [isSeedingZones, setIsSeedingZones] = useState(false);

  const companyId = session?.user?.user_metadata?.company_id;

  const handleSeedBiofarcoCatalog = async () => {
    if (!companyId) {
      toast.error('Error de sesión: No se encontró el company_id.');
      return;
    }

    setIsSeedingProducts(true);
    let imported = 0;

    try {
      for (const item of biofarcoCatalog) {
        // Verificar si ya existe para evitar duplicados
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .ilike('name', item.name)
          .eq('company_id', companyId)
          .maybeSingle();

        if (!existing) {
          const cleanItem = {
            name: item.name,
            line: item.line || 'Biofarco',
            category: item.medicalSpecialty || 'Biofarco',
            is_sample: item.isSample || false,
            base_price: item.basePrice || 0,
            stock: item.stock || 0,
            status: 'active',
            company_id: companyId,
            active_principle: item.activePrinciple || '',
            composition: item.composition || '',
            indications: item.indications || '',
            medical_specialty: item.medicalSpecialty || '',
            description: item.indications || ''
          };

          const { error } = await supabase.from('products').insert(cleanItem);
          if (error) {
            console.error(`❌ Error al insertar ${item.name}:`, error.message);
          } else {
            imported++;
          }
        }
      }
      toast.success(`Catálogo sincronizado: ${imported} nuevos productos agregados.`);
    } catch (error: any) {
      toast.error('Error al cargar catálogo Biofarco: ' + error.message);
    } finally {
      setIsSeedingProducts(false);
    }
  };

  const handleSeedZones = async () => {
    if (!companyId) {
      toast.error('Error de sesión: No se encontró el company_id.');
      return;
    }

    setIsSeedingZones(true);
    try {
      const defaultZones = [
        { name: 'Gran Caracas 1' },
        { name: 'Gran Caracas 2' },
        { name: 'Zona Aragua (Maracay)' },
        { name: 'Zona Carabobo (Valencia)' },
        { name: 'Zona Lara (Barquisimeto)' },
        { name: 'Zona Zulia (Maracaibo)' },
        { name: 'Zona Oriente 1 (Barcelona/Lechería)' },
        { name: 'Zona Oriente 2 (Maturín)' },
        { name: 'Zona Los Andes (Táchira/Mérida)' },
        { name: 'Zona Guayana (Puerto Ordaz)' }
      ];

      const zonesData = defaultZones.map(z => ({
        ...z,
        company_id: companyId,
        description: 'Zona autogenerada por sistema'
      }));

      for (const z of zonesData) {
        // Solo inserta si no existe
        const { data: existing } = await supabase
          .from('zones')
          .select('id')
          .ilike('name', z.name)
          .eq('company_id', companyId)
          .maybeSingle();

        if (!existing) {
          await supabase.from('zones').insert(z);
        }
      }

      toast.success('Zonas operativas de Biofarco creadas exitosamente.');
    } catch (error: any) {
      console.error(error);
      toast.error('No se pudieron cargar las zonas: ' + error.message);
    } finally {
      setIsSeedingZones(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bulk Imports */}
        <div className="p-6 border rounded-2xl bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-primary mb-2">
            <UploadCloud className="h-6 w-6" />
            <h3 className="font-black uppercase tracking-widest text-sm">Importadores CSV (Self-Healing)</h3>
          </div>
          <p className="text-xs text-muted-foreground">Sube tus archivos CSV desde sistemas legados o Excel. El sistema corregirá automáticamente columnas incompatibles.</p>
          
          <div className="flex gap-4 pt-4">
            <CSVUploader collectionName="products" buttonText="Importar Productos CSV" />
            <CSVUploader collectionName="contacts" buttonText="Importar Contactos CSV" />
          </div>
        </div>

        {/* System Seeders */}
        <div className="p-6 border rounded-2xl bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <Database className="h-6 w-6" />
            <h3 className="font-black uppercase tracking-widest text-sm">Precargas del Sistema</h3>
          </div>
          <p className="text-xs text-muted-foreground">Herramientas de automatización para preparar la infraestructura sin importar datos manualmente.</p>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleSeedBiofarcoCatalog} 
              disabled={isSeedingProducts}
              className="justify-start border-emerald-200 hover:bg-emerald-50 text-emerald-700"
            >
              {isSeedingProducts ? <Loader2 className="h-4 w-4 mr-3 animate-spin" /> : <Play className="h-4 w-4 mr-3" />}
              Precargar Catálogo Maestro (Biofarco)
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSeedZones} 
              disabled={isSeedingZones}
              className="justify-start border-blue-200 hover:bg-blue-50 text-blue-700"
            >
              {isSeedingZones ? <Loader2 className="h-4 w-4 mr-3 animate-spin" /> : <MapPin className="h-4 w-4 mr-3" />}
              Restaurar 10 Zonas de Biofarco
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
