// Organization and Multi-Tenant Types
// Part of the SaaS transformation for MediVisitPro

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export type SubscriptionStatus = 
  | 'trialing' 
  | 'active' 
  | 'past_due' 
  | 'canceled' 
  | 'incomplete';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan_tier: PlanTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  settings: OrganizationSettings;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  // Branding
  primary_color?: string;
  secondary_color?: string;
  
  // Features
  enable_geolocation?: boolean;
  enable_offline_mode?: boolean;
  enable_sample_tracking?: boolean;
  
  // Notifications
  email_notifications?: boolean;
  push_notifications?: boolean;
  
  // Limits based on plan
  max_users?: number;
  max_products?: number;
  max_contacts?: number;
}

// Extended profile with organization link
export interface ProfileWithOrg {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  is_org_admin: boolean;
  organization?: Organization;
}

// Plan feature limits
export const PLAN_LIMITS: Record<PlanTier, {
  maxUsers: number;
  maxProducts: number;
  maxContacts: number;
  features: string[];
}> = {
  free: {
    maxUsers: 1,
    maxProducts: 10,
    maxContacts: 50,
    features: ['basic_visits', 'basic_reports']
  },
  starter: {
    maxUsers: 5,
    maxProducts: 50,
    maxContacts: 500,
    features: ['basic_visits', 'basic_reports', 'sample_tracking', 'export_data']
  },
  professional: {
    maxUsers: 20,
    maxProducts: 200,
    maxContacts: 2000,
    features: ['basic_visits', 'basic_reports', 'sample_tracking', 'export_data', 'advanced_analytics', 'api_access']
  },
  enterprise: {
    maxUsers: -1, // Unlimited
    maxProducts: -1,
    maxContacts: -1,
    features: ['basic_visits', 'basic_reports', 'sample_tracking', 'export_data', 'advanced_analytics', 'api_access', 'custom_integrations', 'dedicated_support', 'sso']
  }
};
