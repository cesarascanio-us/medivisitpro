/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 MIGRACIÓN: 20240401_sample_movements_unified.sql
 Propósito: Unificación de movimientos de muestras (Entradas/Salidas/Transferencias)
 Fuente de Verdad: company_id (aislamiento multi-inquilino)
 ======================================================================== */

-- Crear la tabla unificada con el esquema verificado
CREATE TABLE IF NOT EXISTS public.sample_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id), -- VERIFICADO: Fuente de Verdad
    user_id UUID NOT NULL REFERENCES auth.users(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit', 'transfer', 'delivery', 'treatment_start')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    target_user_id UUID REFERENCES auth.users(id), -- Para transferencias entre visitadores
    bank_id UUID REFERENCES public.sample_banks(id), -- Para entradas desde bancos
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Seguridad a Nivel de FILA (RLS)
ALTER TABLE public.sample_movements ENABLE ROW LEVEL SECURITY;

-- Política de aislamiento por company_id (Verificada)
CREATE POLICY "Aislamiento por Empresa" ON public.sample_movements
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Índices para optimizar el rendimiento industrial
CREATE INDEX IF NOT EXISTS idx_sample_movements_company_id ON public.sample_movements(company_id);
CREATE INDEX IF NOT EXISTS idx_sample_movements_user_id ON public.sample_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_sample_movements_product_id ON public.sample_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_sample_movements_type ON public.sample_movements(movement_type);

-- Trigger para actualización automática de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sample_movements_updated_at
    BEFORE UPDATE ON public.sample_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
