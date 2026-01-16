-- Migration: Pharmacy Stock and Reports
-- Run this in your Supabase SQL Editor

-- 1. Pharmacy Stock table
CREATE TABLE IF NOT EXISTS pharmacy_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pharmacy_stock ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pharmacy stock" ON pharmacy_stock FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own pharmacy stock" ON pharmacy_stock FOR ALL USING (auth.uid() = user_id);

-- 2. Pharmacy Reports table
CREATE TABLE IF NOT EXISTS pharmacy_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, resolved
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pharmacy_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pharmacy reports" ON pharmacy_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own pharmacy reports" ON pharmacy_reports FOR ALL USING (auth.uid() = user_id);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_stock_pharmacy_id ON pharmacy_stock(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_reports_pharmacy_id ON pharmacy_reports(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_reports_status ON pharmacy_reports(status);
