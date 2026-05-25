import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function runSQL() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: "ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS rif TEXT; ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS potential TEXT; ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Activo';" });
  if (error) {
    console.error('Error executing RPC:', error);
  } else {
    console.log('Success:', data);
  }
}

runSQL();
