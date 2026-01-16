const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:xvbOiSLypoKPESUA@db.enmtiroqsgduhiopgtze.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        const res = await client.query(`
            SELECT pg_get_viewdef('public.view_farmacia_stock_actual', true) as definition;
        `);

        if (res.rows.length > 0) {
            console.log("View Definition:");
            console.log(res.rows[0].definition);
        } else {
            console.log("View not found in pg_get_viewdef (or permission denied).");
        }

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.end();
    }
}

run();
