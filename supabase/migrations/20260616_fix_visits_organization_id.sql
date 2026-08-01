
UPDATE visits
SET organization_id = p.organization_id
FROM profiles p
WHERE visits.user_id = p.id
  AND visits.organization_id IS NULL;
