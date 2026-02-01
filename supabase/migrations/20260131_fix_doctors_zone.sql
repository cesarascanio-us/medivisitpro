-- Add zone_id to doctors table for consistency with pharmacies and simplified filtering
ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES zones(id);
-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_doctors_zone ON doctors(zone_id);
-- Optional: Try to backfill based on representative's zone (if possible and safe)
-- UPDATE doctors d
-- SET zone_id = p.zone_id
-- FROM profiles p
-- WHERE d.representative_id = p.id
-- AND d.zone_id IS NULL;