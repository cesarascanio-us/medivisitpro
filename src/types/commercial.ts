export interface Quote {
    id: string;
    user_id: string;
    contact_id?: string;
    pharmacy_name: string;
    total_amount: number;
    status: 'draft' | 'sent' | 'converted_to_order' | 'cancelled';
    valid_until?: string;
    created_at: string;
    items?: QuoteItem[];
}

export interface QuoteItem {
    id: string;
    quote_id: string;
    product_id: string;
    product_name?: string; // Joined
    quantity: number;
    unit_price: number;
    discount?: number;
    total: number;
}

export interface TransferOrderItem {
    id: string;
    transfer_order_id: string;
    product_id: string;
    product_name?: string;
    quantity: number;
    unit_price: number;
    bonus_units: number;
    subtotal: number;
}

export interface PharmacyDrugstoreRelation {
    id: string;
    pharmacy_id: string;
    drugstore_id: string;
    account_number?: string;
    is_preferred: boolean;
}

// Cart Item for the Builder
export interface CartItem {
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    discount: number; // For Quotes
    bonus: number;    // For Transfer Orders
}
