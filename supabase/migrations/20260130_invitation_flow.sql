-- MIGRACIÓN SQL: ESTADO DE INVITACIÓN
-- Ejecuta esto en el SQL Editor de Supabase
-- 1. Agregar columna de estado a profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'pending';
-- 2. Asegurar que los usuarios existentes sean 'active'
UPDATE public.profiles
SET invitation_status = 'active'
WHERE invitation_status IS NULL;
-- 3. Trigger para activar perfil al primer login
CREATE OR REPLACE FUNCTION public.handle_user_first_login() RETURNS TRIGGER AS $$ BEGIN -- Si el usuario se loguea, marcamos su perfil como activo
UPDATE public.profiles
SET invitation_status = 'active'
WHERE user_id = NEW.id
    AND invitation_status = 'pending';
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Nota: Este trigger debe ir en auth.users (requiere permisos de superusuario o configurar vía dashboard)
-- Si no puedes crear triggers en auth.users, el estado se puede actualizar en el primer login vía frontend.