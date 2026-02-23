-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =============================================
-- MediVisit Pro - Promotional Cycles Schema
-- =============================================

-- Promotional Cycles table
CREATE TABLE IF NOT EXISTS promotional_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  objectives TEXT,
  target_visits INTEGER DEFAULT 0,
  target_presentations INTEGER DEFAULT 0,
  target_samples INTEGER DEFAULT 0,
  current_visits INTEGER DEFAULT 0,
  current_presentations INTEGER DEFAULT 0,
  current_samples INTEGER DEFAULT 0,
  company_id UUID REFERENCES companies(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotional Cycle Products junction table
CREATE TABLE IF NOT EXISTS promotional_cycle_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID REFERENCES promotional_cycles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  target_presentations INTEGER DEFAULT 0,
  target_samples INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cycle_id, product_id)
);

-- Enable RLS
ALTER TABLE promotional_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_cycle_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promotional_cycles
CREATE POLICY "Users can view promotional cycles"
  ON promotional_cycles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can insert promotional cycles"
  ON promotional_cycles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Managers can update promotional cycles"
  ON promotional_cycles FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Managers can delete promotional cycles"
  ON promotional_cycles FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for promotional_cycle_products
CREATE POLICY "Users can view cycle products"
  ON promotional_cycle_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can manage cycle products"
  ON promotional_cycle_products FOR ALL
  TO authenticated
  USING (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promotional_cycles_status ON promotional_cycles(status);
CREATE INDEX IF NOT EXISTS idx_promotional_cycles_dates ON promotional_cycles(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotional_cycle_products_cycle ON promotional_cycle_products(cycle_id);
CREATE INDEX IF NOT EXISTS idx_promotional_cycle_products_product ON promotional_cycle_products(product_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_promotional_cycles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_promotional_cycles_updated_at ON promotional_cycles;
CREATE TRIGGER trigger_promotional_cycles_updated_at
  BEFORE UPDATE ON promotional_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_promotional_cycles_updated_at();

-- Add zones table if it doesn't exist (for coverage map feature)
CREATE TABLE IF NOT EXISTS zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  boundary JSONB, -- GeoJSON for zone boundary polygon
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add zone_id to user_roles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND column_name = 'zone_id'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN zone_id UUID REFERENCES zones(id);
  END IF;
END $$;

-- Enable RLS on zones
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view zones"
  ON zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage zones"
  ON zones FOR ALL
  TO authenticated
  USING (true);
