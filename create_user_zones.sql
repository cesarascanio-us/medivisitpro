-- Script para implementar soporte de múltiples zonas por usuario
-- Crea la tabla user_zones y migra los datos existentes.
BEGIN;
-- 1. Crear tabla intermedia user_zones
CREATE TABLE IF NOT EXISTS public.user_zones (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, zone_id) -- Evitar duplicados
);
-- 2. Habilitar RLS
ALTER TABLE public.user_zones ENABLE ROW LEVEL SECURITY;
-- 3. Crear políticas RLS
-- Permitir lectura a usuarios autenticados (para que puedan ver sus propias zonas y las de su equipo)
CREATE POLICY "Permitir lectura a usuarios autenticados" ON public.user_zones FOR
SELECT TO authenticated USING (true);
-- Permitir escritura (INSERT, UPDATE, DELETE) solo a Managers y Admins
CREATE POLICY "Permitir gestión a Managers y Admins" ON public.user_zones FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
            AND ur.role IN ('master', 'admin', 'manager', 'coordinator')
    )
);
-- 4. Migrar datos existentes de user_roles.zone_id a user_zones
INSERT INTO public.user_zones (user_id, zone_id)
SELECT user_id,
    zone_id
FROM public.user_roles
WHERE zone_id IS NOT NULL ON CONFLICT (user_id, zone_id) DO NOTHING;
COMMIT;
-- Mensaje de éxito
DO $$ BEGIN RAISE NOTICE 'Tabla user_zones creada y datos migrados exitosamente.';
END $$;