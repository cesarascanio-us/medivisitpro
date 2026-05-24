import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// fallback to .env.local if needed
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName: string) {
  try {
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`[${tableName}]: ERROR - ${error.message}`);
    } else {
      console.log(`[${tableName}]: ${count} rows`);
    }
  } catch (err: any) {
    console.log(`[${tableName}]: CATCH ERROR - ${err.message}`);
  }
}

async function run() {
  const tables = [
    'billing_plans',
    'billing_prices',
    'subscriptions',
    'subscription_plans',
    'app_permissions',
    'app_roles',
    'role_permissions',
    'user_roles',
    'organizations'
  ];

  for (const t of tables) {
    await checkTable(t);
  }
  
  // also get a sample of organizations plan_tier
  const { data } = await supabase.from('organizations').select('plan_tier').limit(5);
  if (data) {
     console.log('Sample plan_tier values in organizations:', data.map(d => d.plan_tier).join(', '));
  }
}

run();
