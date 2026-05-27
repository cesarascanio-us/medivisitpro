import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const tables = ['doctors', 'pharmacies', 'health_centers', 'drugstores', 'commerces', 'natural_stores'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Error on ${table}:`, error.message);
    } else {
      if (data && data.length > 0) {
        console.log(`Columns in ${table}:`, Object.keys(data[0]).join(', '));
      } else {
        console.log(`${table} is empty. To check columns, insert a dummy row or use another method.`);
      }
    }
  }
}

checkSchema();
