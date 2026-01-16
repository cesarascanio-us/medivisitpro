-- FIX: Remove policies causing infinite recursion
-- Run this FIRST in Supabase SQL Editor

-- Drop all problematic policies on user_roles
DROP POLICY IF EXISTS "Users can select own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update non-master roles" ON user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;

-- Drop the recursive function
DROP FUNCTION IF EXISTS is_master_user();

-- Create simple, non-recursive policies
-- Users can only see and manage their own role
CREATE POLICY "Users manage own role" ON user_roles
    FOR ALL USING (auth.uid() = user_id);

-- That's it - simple policy that avoids recursion
-- Admin features will be handled in application code, not RLS
