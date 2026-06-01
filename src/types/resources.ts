/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

export interface Expense {
    id: string;
    organization_id: string;
    user_id: string;
    description: string;
    amount: number;
    expense_date: string;
    category: string;
    custom_category?: string;
    vendor?: string;
    receipt_url?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    created_at: string;
    start_km?: number;
    end_km?: number;
    km_start_url?: string;
    km_end_url?: string;
    zone_id?: string;
}

export interface FixedAsset {
    id: string;
    code: string;
    name: string;
    description?: string;
    assigned_to?: string;
    condition: 'new' | 'good' | 'fair' | 'poor';
    assigned_date: string;
}

export const EXPENSE_CATEGORIES = {
    trans: 'Transporte'
};
