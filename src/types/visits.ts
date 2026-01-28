
export interface VisitExecution {
    id: string;
    directory_item_id?: string;
    directory_items?: {
        name: string;
        entity_type: string;
    };
    user_id: string;
    scheduled_date: string; // ISO date
    status: 'pending' | 'in_progress' | 'completed' | 'missed';

    // Phase 2 Fields
    checkin_at?: string;
    checkout_at?: string;
    location_lat?: number;
    location_lng?: number;
    distance_meters?: number;

    // Neuro Sales
    emotional_state?: 'open' | 'skeptical' | 'indifferent' | 'closed';
    purchase_driver?: string;
    next_commitment?: string;
    photo_url?: string;

    notes?: string;
}

export interface VisitContextState {
    currentVisit: VisitExecution | null;
    isLoading: boolean;
    activeTimer: number; // seconds
}
