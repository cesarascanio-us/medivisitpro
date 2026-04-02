const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function run() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('.env.local not found');
        return;
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    const getEnv = (key) => {
        const match = envContent.match(new RegExp(`${key}=(.*)`));
        return match ? match[1].trim() : null;
    };
    
    const url = getEnv('VITE_SUPABASE_URL');
    const anonKey = getEnv('VITE_SUPABASE_ANON_KEY');
    
    const supabase = createClient(url, anonKey);
    
    console.log('Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'cesar.ascanio@gmail.com',
        password: '123456'
    });
    
    if (authError) {
        console.error('Auth Error:', authError.message);
        return;
    }
    
    console.log('Logged in successfully', authData.user.id);
    
    // Attempting to update another user (let's say the demo user or representative)
    const { data: fetchUser, error: fetchErr } = await supabase.from('profiles').select('*').limit(3);
    console.log('Got profiles:', fetchUser?.length, fetchErr);
    
    if (fetchUser && fetchUser.length > 0) {
       const targetUser = fetchUser.find(u => u.email === 'cesarascanio.edu@gmail.com') || fetchUser[0];
       console.log('Testing update on target profile:', targetUser.email, targetUser.user_id);
       
       const { data: up1, error: er1 } = await supabase.from('profiles').update({ first_name: targetUser.first_name + ' Test' }).eq('user_id', targetUser.user_id).select();
       
       console.log('Update Result on profiles:', JSON.stringify(up1), er1?.message || er1);
       
       const { data: up2, error: er2 } = await supabase.from('user_roles').update({ role: 'manager' }).eq('user_id', targetUser.user_id).select();
       
       console.log('Update Result on user_roles:', JSON.stringify(up2), er2?.message || er2);
    }
}

run();
