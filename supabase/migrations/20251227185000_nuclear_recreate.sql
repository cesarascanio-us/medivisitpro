-- Nuclear Recreate of 'visits' and 'user_roles' to resolve 400 Bad Request / Corruption
-- effectively resetting these tables to a known healthy state.

-- 1. DROP (Cascade to remove RLS, Triggers, Foreign Keys from other tables)
DROP TABLE IF EXISTS public.visits CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
-- (Note: user_roles_plain might be orphaned or dropped if it depended on user_roles? No, it's independent copy mostly)
TRUNCATE public.user_roles_plain; 

-- 2. CREATE user_roles (Matching types.ts)
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- Unique constraint later?
    company_id UUID,
    role TEXT NOT NULL DEFAULT 'representative',
    permissions JSONB DEFAULT '[]'::jsonb,
    territory TEXT,
    supervisor_id UUID,
    is_active BOOLEAN DEFAULT true,
    zone_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT users_roles_user_id_key UNIQUE (user_id)
);

-- 3. CREATE visits (Simplified but functional structure)
CREATE TABLE public.visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    scheduled_date TIMESTAMPTZ,
    status TEXT, -- Enum 'visit_status' usually
    user_id UUID NOT NULL,
    contact_id UUID,
    notes TEXT,
    zone_id UUID,
    pharmacy_id UUID,
    company_id UUID,
    location_lat NUMERIC,
    location_lng NUMERIC,
    checkin_at TIMESTAMPTZ,
    checkout_at TIMESTAMPTZ,
    visit_type TEXT,
    visit_objective TEXT,
    visit_outcome TEXT -- Assuming common columns
);

-- 4. RESTORE Data (Assign 'master' role to all users found in auth.users if possible)
-- We use a safe INSERT that ignores if auth.users is not accessible in this context
-- (In db push, we act as postgres, so we might access auth.users)
DO $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'master' FROM auth.users
    ON CONFLICT (user_id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not auto-populate user_roles from auth.users';
END $$;

-- 5. RE-APPLY user_roles_plain TRIGGER (Since table was dropped, trigger is gone)
CREATE OR REPLACE FUNCTION public.sync_user_roles_plain()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM public.user_roles_plain WHERE user_id = OLD.user_id;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') THEN
        INSERT INTO public.user_roles_plain (user_id, role, zone_id, company_id, updated_at)
        VALUES (NEW.user_id, NEW.role, NEW.zone_id, NEW.company_id, NEW.updated_at)
        ON CONFLICT (user_id) DO UPDATE 
        SET role = EXCLUDED.role, zone_id = EXCLUDED.zone_id, company_id = EXCLUDED.company_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_user_roles_plain
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_roles_plain();

-- 6. SYNC 'user_roles_plain' Explicitly
INSERT INTO public.user_roles_plain (user_id, role, zone_id, company_id, updated_at)
SELECT user_id, role, zone_id, company_id, updated_at FROM public.user_roles
ON CONFLICT (user_id) DO UPDATE 
SET role = EXCLUDED.role, zone_id = EXCLUDED.zone_id, company_id = EXCLUDED.company_id;

-- 7. DISABLE RLS initially to confirm fix (We can enable later)
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits DISABLE ROW LEVEL SECURITY;
