export interface Expense {
    id: string;
    user_id: string;
    description: string;
    amount: number;
    expense_date: string;
    category: 'alim' | 'hosp' | 'trans' | 'otros';
    receipt_url?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    created_at: string;
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
    alim: 'Alimentación',
    hosp: 'Hospedaje',
    trans: 'Transporte',
    otros: 'Otros'
};
