const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function run() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const getEnv = (key) => fs.readFileSync(envPath, 'utf8').match(new RegExp(`${key}=(.*)`))[1].trim();
    const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_ANON_KEY'));
    const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'cesar.ascanio@gmail.com', password: '123456'
    });
    const { data, error } = await supabase.from('user_roles').select('*').eq('user_id', authData.user.id);
    console.log('user_roles result:', data, error?.message || '');
}
run();
