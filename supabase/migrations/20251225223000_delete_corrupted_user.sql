-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- CLEANUP: Delete the corrupted user (Wrapped in DO block for syntax correctness)

DO $$ 
DECLARE
    v_target_email TEXT := 'cesarascaniofo.us@gmail.com';
    v_user_id UUID;
BEGIN
    -- 1. Get User ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_target_email;

    IF v_user_id IS NOT NULL THEN
        -- 2. Delete from public tables
        DELETE FROM public.user_roles WHERE user_id = v_user_id;
        DELETE FROM public.profiles WHERE user_id = v_user_id;
        
        -- 3. Delete from auth.users
        DELETE FROM auth.users WHERE id = v_user_id;

        RAISE NOTICE 'User % has been completely deleted.', v_target_email;
    ELSE
        RAISE NOTICE 'User % not found.', v_target_email;
    END IF;
END $$;
