import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://enmtiroqsgduhiopgtze.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2zEKeIhZil1VKWqyVpNFjQ_yz8e5hkt';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const email = 'demo.medivisitpro@gmail.com';
const password = 'demo123456';

async function runLoadTest() {
    console.log("🚀 Starting Load Test for MediVisitPro...");

    // 1. Authenticate
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        console.error("❌ Authentication failed:", authError.message);
        process.exit(1);
    }

    console.log(`✅ Authenticated successfully as ${email}`);

    // 2. Parallel Reads
    console.log("\n📊 Phase 1: Executing 50 Parallel Read Operations...");
    const readStart = Date.now();
    
    const readPromises = Array.from({ length: 50 }).map(async (_, i) => {
        const { error } = await supabase
            .from('visits')
            .select('id, status, scheduled_date')
            .limit(10);
            
        if (error) throw new Error(`Read request ${i} failed: ${error.message}`);
        return true;
    });

    try {
        await Promise.all(readPromises);
        const readEnd = Date.now();
        console.log(`✅ 50 Parallel reads completed successfully in ${readEnd - readStart}ms.`);
    } catch (error) {
        console.error("❌ Read Phase failed:", error.message);
    }

    // 3. Sequential Writes (To avoid violating unique constraints if we created too many, we just update)
    console.log("\n📊 Phase 2: Executing 20 Parallel Update Operations (RLS Write Test)...");
    
    // 3. Sequential Writes (Test RLS for profiles)
    console.log("\n📊 Phase 2: Executing 20 Parallel Update Operations (RLS Write Test on Profiles)...");
    
    const writeStart = Date.now();
    
    const writePromises = Array.from({ length: 20 }).map(async (_, i) => {
        const { error } = await supabase
            .from('profiles')
            .update({ last_name: `DemoTest_${i}` })
            .eq('user_id', authData.user.id);
            
        if (error) throw new Error(`Write request ${i} failed: ${error.message}`);
        return true;
    });

    try {
        await Promise.all(writePromises);
        const writeEnd = Date.now();
        console.log(`✅ 20 Parallel updates completed successfully in ${writeEnd - writeStart}ms.`);
        
        // Restore original name
        await supabase.from('profiles').update({ last_name: 'Demo' }).eq('user_id', authData.user.id);
    } catch (error) {
        console.error("❌ Write Phase failed:", error.message);
    }

    console.log("\n🏁 Load Test Completed.");
    process.exit(0);
}

runLoadTest();
