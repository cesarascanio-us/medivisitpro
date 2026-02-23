-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- 1. Crear la tabla para guardar los textos y configuraciones
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);
-- Habilitar seguridad (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
-- Políticas de acceso
-- Todo el mundo (incluso sin loguear) puede LEER la landing page
CREATE POLICY "Public Read Access" ON site_settings FOR
SELECT USING (true);
-- Solo usuarios autenticados (Idealmente solo admins/master) pueden EDITAR
-- Ajusta esta política según tus roles. Aquí permitimos a cualquier usuario autenticado por simplicidad inicial,
-- pero deberías restringirlo a 'master' si tienes roles en `auth.users` o `user_roles`.
CREATE POLICY "Authenticated Update Access" ON site_settings FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Insert Access" ON site_settings FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- 2. Configurar el Almacenamiento (Storage) para Imágenes
-- Crear un bucket público llamado 'landing-assets'
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-assets', 'landing-assets', true) ON CONFLICT (id) DO NOTHING;
-- Políticas de Almacenamiento
-- Cualquiera puede ver las imágenes
CREATE POLICY "Public Access Images" ON storage.objects FOR
SELECT USING (bucket_id = 'landing-assets');
-- Usuarios autenticados pueden subir imágenes
CREATE POLICY "Auth Users Upload Images" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'landing-assets'
        AND auth.role() = 'authenticated'
    );
-- Usuarios autenticados pueden actualizar/borrar sus imágenes
CREATE POLICY "Auth Users Update Images" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'landing-assets'
        AND auth.role() = 'authenticated'
    );