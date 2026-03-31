const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://umofmnaalhustmxurzjj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtb2ZtbmFhbGh1c3RteHVyempqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTg4OTEsImV4cCI6MjA4MzgzNDg5MX0.Db_bN7Tzr2c3uTEMcXPQFMHGPLp-Omx7JGiNc21oz-k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching supervisors...");
    try {
        const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('user_id, organization_id')
            .eq('role', 'supervisor');

        if (rolesError) {
            console.error("Error fetching roles:", rolesError);
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

        if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
            return;
        }

        const { data: orgs, error: orgsError } = await supabase
            .from('organizations')
            .select('id, name');

        if (orgsError) {
            console.error("Error fetching organizations:", orgsError);
        }

        const results = roles.map(role => {
            const profile = profiles.find(p => p.user_id === role.user_id);
            const org = orgs ? orgs.find(o => o.id === role.organization_id) : null;
            return {
                name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email : 'Unknown',
                email: profile ? profile.email : 'Unknown',
                organization: org ? org.name : 'Unknown',
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
