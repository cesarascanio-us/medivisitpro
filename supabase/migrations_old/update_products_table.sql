-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Update products table with pharmaceutical fields
-- Date: 2025-12-22

-- Add missing columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_code TEXT,
ADD COLUMN IF NOT EXISTS medical_specialties TEXT,
ADD COLUMN IF NOT EXISTS key_message TEXT,
ADD COLUMN IF NOT EXISTS safety_info TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_link TEXT;

-- Rename composition column if needed (presentation already exists)
-- Note: If 'presentation' serves as 'composition', no change needed

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Add comment to table
COMMENT ON TABLE products IS 'Pharmaceutical products catalog with complete medical information';

-- Add column comments
COMMENT ON COLUMN products.product_code IS 'Unique product identifier code';
COMMENT ON COLUMN products.name IS 'Product name';
COMMENT ON COLUMN products.active_ingredients IS 'Active ingredient(s)';
COMMENT ON COLUMN products.presentation IS 'Composition / Main presentation';
COMMENT ON COLUMN products.indications IS 'Consolidated indications';
COMMENT ON COLUMN products.medical_specialties IS 'Medical specialty(ies) according to manual';
COMMENT ON COLUMN products.key_message IS 'Key message according to manual';
COMMENT ON COLUMN products.dosage IS 'Dosage / Application according to available information';
COMMENT ON COLUMN products.safety_info IS 'Safety (contraindications / key precautions)';
COMMENT ON COLUMN products.category IS 'Product category';
COMMENT ON COLUMN products.image_url IS 'Product image URL';
COMMENT ON COLUMN products.pdf_link IS 'Link to PDF documentation';
