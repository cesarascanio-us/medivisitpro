export interface Cycle {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: 'open' | 'closed' | 'planning';
    goals_json?: Record<string, any>;
    created_at?: string;
}

export interface DirectoryItem {
    id: string;
    entity_id: string;
    entity_type: 'doctor' | 'pharmacy';
    name: string;
    address?: string;
    city?: string;
    zone_id?: string;
}

export interface WeeklyPlan {
    id: string;
    user_id: string;
    cycle_id: string;
    week_number: number;
    start_date: string;
    end_date: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    supervisor_comment?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DailyPlanDetail {
    id: string;
    weekly_plan_id: string;
    day_of_week: string;
    date: string;
    directory_item_id: string;
    turn: 'AM' | 'PM';
    visit_order: number;
    status: 'planned' | 'visited' | 'missed';

    // Joined fields (optional)
    directory_item?: DirectoryItem;
}
