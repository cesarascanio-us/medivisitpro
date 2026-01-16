const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.enmtiroqsgduhiopgtze:xvbOiSLypoKPESUA@aws-0-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log("--- Debugging State ---");

        // 1. Check Plain Table Count
        try {
            const res = await client.query('SELECT count(*) FROM public.user_roles_plain');
            console.log("user_roles_plain count:", res.rows[0].count);
        } catch (e) {
            console.log("Error reading user_roles_plain:", e.message);
        }

        // 2. Check Original Count
        try {
            const res = await client.query('SELECT count(*) FROM public.user_roles');
            console.log("user_roles count:", res.rows[0].count);
        } catch (e) {
            console.log("Error reading user_roles:", e.message);
        }

        // 3. Test Function Call (as current user postgres)
        try {
            // Need to mock auth.uid() for the function to work?
            // Actually function logic is: WHERE user_id = auth.uid()
            // If checking as postgres, auth.uid() is null? Function returns null.
            // But verify it doesn't CRASH.
            const res = await client.query('SELECT public.get_my_role() as role');
            console.log("get_my_role() returns:", res.rows[0].role);
        } catch (e) {
            console.log("Error calling get_my_role:", e.message);
        }

        // 4. Simulate a specific user (if I can find a user_id from the plain table)
        try {
            // Find a user ID
            const userRes = await client.query('SELECT user_id FROM public.user_roles_plain LIMIT 1');
            if (userRes.rows.length > 0) {
                const uid = userRes.rows[0].user_id;
                console.log(`Testing with user_id: ${uid}`);

                // How to simulate auth.uid()? 
                // By setting the config parameter request.jwt.claim.sub?
                // Supabase uses 'request.jwt.claim.sub' in auth.uid() wrapper.

                await client.query(`SELECT set_config('request.jwt.claim.sub', '${uid}', false)`);
                const roleRes = await client.query('SELECT public.get_my_role() as role');
                console.log("get_my_role() with uid returns:", roleRes.rows[0].role);
            } else {
                console.log("No users found to test.");
            }
        } catch (e) {
            console.log("Error testing auth simulation:", e.message);
        }

    } catch (e) {
        console.error("Connection Error:", e.message);
    } finally {
        await client.end();
    }
}

run();
