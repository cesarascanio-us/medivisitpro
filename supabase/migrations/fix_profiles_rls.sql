-- Fix RLS policies for profiles to allow users to update their own profile
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (
    id::text = auth.uid()::text OR user_id::text = auth.uid()::text
);

CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (
    id::text = auth.uid()::text OR user_id::text = auth.uid()::text
) WITH CHECK (
    id::text = auth.uid()::text OR user_id::text = auth.uid()::text
);
