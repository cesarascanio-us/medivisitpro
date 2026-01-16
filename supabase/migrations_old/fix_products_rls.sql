-- Add user_id to products table to enable ownership and RLS
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create Index
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);

-- Update RLS Policies
-- First, drop existing policies to avoid conflicts or security holes
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

-- 1. View: Users can view their own products OR products with no owner (Global)
CREATE POLICY "Users can view own and global products" 
ON public.products FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- 2. Insert: Users can insert their own products
CREATE POLICY "Users can insert their own products" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Update: Users can update their own products
CREATE POLICY "Users can update their own products" 
ON public.products FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Delete: Users can delete their own products
CREATE POLICY "Users can delete their own products" 
ON public.products FOR DELETE 
USING (auth.uid() = user_id);
