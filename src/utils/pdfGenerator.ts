import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Formateo de fechas a DD/MM/YYYY
const formatDate = (dateValue: any) => {
  if (!dateValue) return new Date().toLocaleDateString();
  try {
    return new Date(dateValue).toLocaleDateString();
  } catch (e) {
    return String(dateValue);
  }
};

export const generateDocumentPDF = (
  docType: 'quote' | 'transfer', 
  docData: any, 
  contacts: any[], 
  products: any[],
  action: 'view' | 'download' = 'download'
) => {
  const doc = new jsPDF();
  
  // Paleta de Colores Corporativos (Elite UI Theme)
  const medicalBlue = '#0F172A'; // Slate-900 (Primario Corporativo)
  const medicalBlueRGB = [15, 23, 42] as [number, number, number];
  const corporateGreen = '#10B981'; // Emerald-500 (Éxito Comercial)
  const slateDark = '#1E293B';
  const slateGray = '#64748B';
  
  // Header: Membrete de la empresa
  doc.setFontSize(24);
  doc.setTextColor(medicalBlue);
  doc.setFont('helvetica', 'bold');
  doc.text('MediVisitPro', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(slateGray);
  doc.setFont('helvetica', 'normal');
  doc.text('Distribuidora Médica y Farmacéutica', 14, 28);
  doc.text('RIF: J-12345678-9', 14, 33);
  
  // Título e info del Documento
  doc.setFontSize(16);
  doc.setTextColor(slateDark);
  doc.setFont('helvetica', 'bold');
  const docTitle = docType === 'quote' ? 'Cotización Comercial' : 'Pedido de Transferencia';
  doc.text(docTitle, 200, 22, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray);
  doc.text(`Folio: #${docData.id ? docData.id.substring(0, 8).toUpperCase() : 'N/A'}`, 200, 28, { align: 'right' });
  doc.text(`Fecha: ${formatDate(docData.date || docData.createdAt)}`, 200, 33, { align: 'right' });
  
  // Línea separadora
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 38, 200, 38);

  let startY = 45;

  if (docType === 'quote') {
    const client = contacts.find((c: any) => c.id === docData.contactId);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark);
    doc.text('Datos del Cliente:', 14, startY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre / Razón Social: ${client?.name || 'Cliente'}`, 14, startY + 6);
    doc.text(`Dirección: ${client?.address || 'N/A'}`, 14, startY + 11);
    
    startY += 20;

    const tableColumns = ['Producto', 'Línea', 'Cant.', 'Precio Base', 'Desc.', 'Subtotal'];
    const tableRows = (docData.items || []).map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);
      const linea = product?.line || 'Biofarco';
      return [
        item.productName || product?.name || 'Producto Desconocido',
        linea,
        item.qty?.toString() || '0',
        `$${(item.basePrice || 0).toFixed(2)}`,
        `${((item.discountPercent || 0) * 100).toFixed(0)}%`,
        `$${(item.subtotal || 0).toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: medicalBlueRGB, textColor: '#FFFFFF', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 4, textColor: slateDark },
      margin: { top: 10, left: 14, right: 14 }
    });
    
  } else if (docType === 'transfer') {
    const pharmacy = contacts.find((c: any) => c.id === docData.pharmacyId);
    const drugstore = contacts.find((c: any) => c.id === docData.drugstoreId);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark);
    doc.text('Farmacia Solicitante:', 14, startY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${pharmacy?.name || docData.pharmacyName || 'N/A'}`, 14, startY + 6);
    doc.text(`Dirección: ${pharmacy?.address || 'N/A'}`, 14, startY + 11);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(medicalBlue);
    doc.text('Droguería Despachadora:', 110, startY);
    
    doc.setFontSize(11);
    doc.text(`▶ ${drugstore?.name || 'Droguería Principal'}`, 110, startY + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateDark);
    
    startY += 20;

    const tableColumns = ['Producto', 'Línea', 'Cant.', 'Precio Fijado', 'Subtotal'];
    const tableRows = (docData.items || []).map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);
      const linea = product?.line || 'Biofarco';
      const pFijado = item.fixedPrice ? item.fixedPrice : 0;
      const sub = item.subtotal ? item.subtotal : (item.qty * pFijado);

      return [
        item.productName || product?.name || 'Desconocido',
        linea,
        item.qty?.toString() || '0',
        `$${pFijado.toFixed(2)}`,
        `$${sub.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: medicalBlueRGB, textColor: '#FFFFFF', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 4, textColor: slateDark },
      margin: { top: 10, left: 14, right: 14 }
    });
  }

  // Footer / Totales
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  
  doc.setTextColor(slateDark);
  doc.text('Total General:', 160, finalY, { align: 'right' });
  
  const totalStr = `$${(docData.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  doc.setTextColor(corporateGreen);
  doc.text(totalStr, 200, finalY, { align: 'right' });

  // Firma digital
  if (docData.signature) {
    try {
      doc.addImage(docData.signature, 'PNG', 14, finalY + 10, 50, 25);
      doc.setFontSize(10);
      doc.setTextColor(slateDark);
      doc.text('Firma de Conformidad del Cliente', 14, finalY + 40);
    } catch (e) {
      console.error("Error al incrustar la firma en el PDF:", e);
    }
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Documento generado automáticamente por MediVisitPro. Válido por 15 días.', 105, 280, { align: 'center' });

  if (action === 'view') {
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    doc.save(`${docType}_${docData.id || Date.now()}.pdf`);
  }
  
  return doc.output('blob');
};
