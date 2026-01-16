-- =====================================================
-- FIX: Onboarding RLS Policies
-- Date: 2026-01-01
-- Purpose: Allow new users to create organizations and set their own role
-- =====================================================

-- 1. Allow authenticated users to create organizations
-- They need this to complete the "Step 4 of 4" in OnboardingWizard
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
CREATE POLICY "Authenticated users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Allow users to update their own profile
-- Needed to set organization_id and is_org_admin during onboarding
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 3. Allow users to insert their initial role
-- Needed to set the 'admin' role linked to the new organization
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
CREATE POLICY "Users can insert own role" ON user_roles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 4. Allow users to view roles they own (even if organization_id is still being synced in cache)
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- 5. Ensure profile insert is also allowed for future signups if not handled by triggers
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
