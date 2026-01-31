// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create a Supabase client with the Auth context of the user calling the function
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Check if the user is a master or admin
        const { data: { user } } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Unauthorized')
        }

        // Verify role in profiles table (extra security layer)
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single()

        // Allow 'master' and 'admin' to create users
        if (!profile || !['master', 'admin'].includes(profile.role)) {
            // Also allow if metadata has role (fallback)
            const userRole = user.app_metadata.role || user.user_metadata.role;
            if (!['master', 'admin'].includes(userRole)) {
                throw new Error('Unauthorized: Insufficient permissions')
            }
        }

        // Initialize Admin Client to perform the creation
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { email, firstName, lastName, role, zoneId, organizationId } = await req.json()

        if (!email) {
            throw new Error('Email is required')
        }

        // 1. Check if user already exists in auth.users
        const { data: existingUserSearch } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUserSearch.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        let targetUserId: string;

        if (existingUser) {
            console.log('User already exists, updating existing record:', existingUser.id);
            targetUserId = existingUser.id;

            // Optionally update their metadata if needed
            await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
                user_metadata: { first_name: firstName, last_name: lastName, role: role || 'representative' }
            });
        } else {
            // 2. Invite New User (sends magic link)
            const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    role: role || 'representative'
                }
            })

            if (inviteError) throw inviteError
            if (!inviteData.user) throw new Error('Failed to create invitation')
            targetUserId = inviteData.user.id;
        }

        // 3. Insert/Update Profile (using onConflict to avoid duplicate key errors)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                user_id: targetUserId,
                first_name: firstName,
                last_name: lastName,
                email: email,
                role: role || 'representative',
                organization_id: organizationId,
                invitation_status: existingUser ? 'active' : 'pending',
                is_active: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            throw new Error(`Auth logic success but profile update failed: ${profileError.message}`)
        }

        // 4. Insert/Update Role & Zone
        const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .upsert({
                user_id: targetUserId,
                role: role || 'representative',
                zone_id: zoneId || null,
                organization_id: organizationId,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

        if (roleError) console.error('Role/Zone assignment error:', roleError)

        return new Response(
            JSON.stringify({
                user: { id: targetUserId, email },
                message: existingUser ? 'User updated successfully' : 'Invitation sent successfully'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
