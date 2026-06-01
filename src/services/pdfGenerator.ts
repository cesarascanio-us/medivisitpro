/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Quote, TransferOrderItem } from '@/types/commercial';

// Define the shape of data we expect for printing
interface OrderData {
    title: string;
    number: string; // Order Number or Quote ID
    date: string;
    clientName: string;
    clientAddress?: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        total: number;
    }[];
    totals: {
        subtotal: number;
        tax: number;
        total: number;
    };
    notes?: string;
}

export const generatePDF = (data: OrderData) => {
    const doc = new jsPDF();

    // Company Logo / Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185); // Professional Blue
    doc.text("MediVisit Pro", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Soluciones Farmacéuticas Integrales", 14, 26);

    // Document Info (Right Aligned)
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(data.title.toUpperCase(), 195, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.text(`Nº: ${data.number}`, 195, 28, { align: 'right' });
    doc.text(`Fecha: ${data.date}`, 195, 34, { align: 'right' });

    // Client Info Box
    doc.setDrawColor(200);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 45, 182, 25, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text("CLIENTE:", 20, 52);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(data.clientName, 20, 59);

    if (data.clientAddress) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(data.clientAddress, 20, 65);
    }

    // Items Table
    const tableBody = data.items.map(item => [
        item.name,
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
    ]);

    // Use autoTable from the doc instance (added by the plugin)
    (doc as any).autoTable({
        startY: 80,
        head: [['Producto', 'Cant.', 'P. Unit', 'Total']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Product Name
            1: { cellWidth: 20, halign: 'center' }, // Qty
            2: { cellWidth: 30, halign: 'right' }, // Price
            3: { cellWidth: 30, halign: 'right' }  // Total
        }
    });

    // Totals
    // Access finalY from the doc object, extended by autotable
    const finalY = (doc as any).lastAutoTable?.finalY || 150;

    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`$${data.totals.subtotal.toFixed(2)}`, 195, finalY, { align: 'right' });

    doc.text(`IVA (16%):`, 140, finalY + 6);
    doc.text(`$${data.totals.tax.toFixed(2)}`, 195, finalY + 6, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL:`, 140, finalY + 14);
    doc.text(`$${data.totals.total.toFixed(2)}`, 195, finalY + 14, { align: 'right' });

    // Footer / Notes
    if (data.notes) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text("Notas:", 14, finalY + 25);
        doc.text(data.notes, 14, finalY + 30, { maxWidth: 100 });
    }

    // Save
    doc.save(`${data.title}_${data.number}.pdf`);
};
