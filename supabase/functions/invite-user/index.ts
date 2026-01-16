// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

        const { email, password, firstName, lastName, role, zoneId } = await req.json()

        if (!email || !password) {
            throw new Error('Email and password are required')
        }

        // 1. Create User
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                role: role || 'representative'
            }
        })

        if (createError) throw createError

        if (!newUser.user) throw new Error('Failed to create user object')

        // 2. Insert Profile
        // Note: If you have a trigger on auth.users -> public.profiles, this might be redundant or fail with unique constraint.
        // We will attempt to update if exists, or insert if not.
        // But since it's a new user, upsert is safe.

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                user_id: newUser.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                role: role || 'representative',
                is_active: true,
                created_at: new Date().toISOString()
            })

        if (profileError) {
            // If profile creation fails, we might want to delete the user? 
            // For now let's just log and throw.
            console.error('Profile creation error:', profileError)
            // Cleanup user maybe? await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
            throw new Error(`User created but profile failed: ${profileError.message}`)
        }

        // 3. Insert Role & Zone
        if (role || zoneId) {
            const { error: roleError } = await supabaseAdmin
                .from('user_roles')
                .upsert({
                    user_id: newUser.user.id,
                    role: role || 'representative',
                    zone_id: zoneId || null,
                    updated_at: new Date().toISOString()
                })

            if (roleError) console.error('Role/Zone assignment error:', roleError)
        }

        return new Response(
            JSON.stringify({ user: newUser.user, message: 'User created successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
