const { createClient } = require('@supabase/supabase-js');

// Using .env.local credentials which seem to be the ones for this workspace
const supabaseUrl = 'https://enmtiroqsgduhiopgtze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubXRpcm9xc2dkdWhpb3BndHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDIwMzYsImV4cCI6MjA3MTAxODAzNn0.P1iay3C7hOUE7bflU6L4dERKB59SCaKw8Lo9xL6ZTUE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching supervisors from local development DB...");
    try {
        const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('user_id, organization_id, role')
            .eq('role', 'supervisor');

        if (rolesError) {
            console.error("Error fetching roles:", rolesError);
            // Let's also check if the table exists by listing some roles
            const { data: allRoles } = await supabase.from('user_roles').select('role').limit(5);
            console.log("Sample roles found:", allRoles);
            return;
        }

        if (!roles || roles.length === 0) {
            console.log("No supervisors found in user_roles table.");
            return;
        }

        const userIds = roles.map(r => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, email, first_name, last_name')
            .in('user_id', userIds);

        const { data: orgs } = await supabase.from('organizations').select('id, name');

        const results = roles.map(role => {
            const profile = profiles?.find(p => p.user_id === role.user_id);
            const org = orgs?.find(o => o.id === role.organization_id);
            return {
                name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
                email: profile ? profile.email : 'Unknown',
                organization: org ? org.name : 'Master/Global',
                role: 'Supervisor'
            };
        });

        console.log("SUPERVISORS_LIST_START");
        console.log(JSON.stringify(results, null, 2));
        console.log("SUPERVISORS_LIST_END");
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

run();
