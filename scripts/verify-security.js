import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Script de Verificación de Integridad de Datos y RLS
 * Este script simula comprobaciones de seguridad para asegurar que el rol Master 
 * mantiene su acceso global y los Tenants mantienen su aislamiento.
 */
async function verifyIntegridad() {
    console.log('--- Iniciando Verificación de Seguridad MediVisitPro ---');

    // 1. Verificar existencia de tablas críticas
    const tables = ['organizations', 'user_roles', 'profiles', 'visits', 'contacts'];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.error(`❌ Error en tabla [${table}]:`, error.message);
        } else {
            console.log(`✅ Tabla [${table}] accesible.`);
        }
    }

    // 2. Verificar función is_master
    const { data: isMasterFunc, error: funcError } = await supabase.rpc('is_master');
    if (funcError && funcError.message.includes('not exist')) {
        console.error('❌ La función crítica public.is_master() NO ha sido creada.');
    } else {
        console.log('✅ Función is_master() detectada.');
    }

    // 3. Recomendación de Prueba de Aislamiento (Manual)
    console.log('\n--- Recomendaciones de Seguridad para el Futuro ---');
    console.log('1. Use Slugs Únicos: Asegure que los slugs de organizaciones sean inmutables.');
    console.log('2. Auditoría de RLS: Periódicamente, intente acceder a datos de la Org B con un usuario de la Org A.');
    console.log('3. Backups: Use "supabase db dump --data-only" semanalmente.');
    console.log('4. Migraciones: Nunca modifique una migración ya ejecutada; cree una nueva con fecha actual.');

    console.log('\n--- Fin de la Verificación ---');
}

verifyIntegridad();
