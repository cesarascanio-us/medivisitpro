ALTER TABLE IF EXISTS daily_plan_items DROP CONSTRAINT IF EXISTS daily_plan_items_contact_id_fkey;
ALTER TABLE IF EXISTS agenda_events DROP CONSTRAINT IF EXISTS agenda_events_contact_id_fkey;
ALTER TABLE IF EXISTS visits DROP CONSTRAINT IF EXISTS visits_contact_id_fkey;
