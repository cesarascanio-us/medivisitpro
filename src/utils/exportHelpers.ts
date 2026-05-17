import { toast } from 'sonner';

/**
 * Genera un archivo CSV a partir de un arreglo de objetos y lo descarga automáticamente.
 * Filtra IDs internos para mantener el reporte limpio.
 */
export const exportToCSV = (filename: string, data: any[]) => {
  if (!data || data.length === 0) {
    toast.error('No hay datos para exportar');
    return;
  }

  // Filtrar campos técnicos que no interesan al usuario final
  const headers = Object.keys(data[0]).filter(k => 
    k !== 'id' && 
    k !== 'company_id' && 
    k !== 'organization_id' && 
    k !== 'companyId' && 
    k !== 'organizationId' && 
    k !== 'user_id'
  );
  
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      
      // Manejar fechas y objetos
      if (val && (typeof val === 'object' || (typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val))))) {
        try {
          const date = new Date(val);
          if (!isNaN(date.getTime())) return `"${date.toLocaleString()}"`;
        } catch(e) {}
      }
      if (typeof val === 'object' && val !== null) {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      
      // Strings y otros valores
      return `"${String(val ?? '').replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  // Descarga del Blob
  const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}_${new Date().getTime()}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  toast.success(`Archivo ${filename}.csv exportado con éxito`);
};

/**
 * Genera el enlace dinámico de WhatsApp para compartir un texto a un número específico
 */
export const getWhatsAppShareLink = (phone: string, text: string) => {
  const cleanPhone = phone ? phone.replace(/\\D/g, '') : '';
  const urlParams = new URLSearchParams();
  urlParams.append('text', text);
  return `https://wa.me/${cleanPhone}?${urlParams.toString()}`;
};
