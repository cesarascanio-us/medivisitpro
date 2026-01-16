-- Work Processes table for storing process characterization, diagrams and risk matrices
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS work_processes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  responsible_person TEXT,
  objectives TEXT,
  scope TEXT,
  diagram_nodes JSONB DEFAULT '[]'::jsonb,
  diagram_edges JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE work_processes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own processes
CREATE POLICY "Users can manage own work processes" ON work_processes
  FOR ALL USING (auth.uid() = user_id);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_work_processes_user_id ON work_processes(user_id);

-- User favorites table for product favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own favorites
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
