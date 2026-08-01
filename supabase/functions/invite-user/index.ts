/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
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

        // Verify role in user_roles_plain table (extra security layer)
        const { data: profile } = await supabaseClient
            .from('user_roles_plain')
            .select('role')
            .eq('user_id', user.id)
            .single()

        // Allow 'master' and 'admin' to create users
        if (!profile || !['master', 'admin', 'organization_admin'].includes(profile.role)) {
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
        console.log(`Checking existence for email: ${email}`);

        let existingUser = null;
        try {
            const listUsersResponse = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
            if (listUsersResponse.error) {
                console.error('List users error:', listUsersResponse.error);
                throw new Error(`Failed to list users: ${listUsersResponse.error.message}`);
            }
            if (!listUsersResponse.data || !listUsersResponse.data.users) {
                console.error('List users data is null/empty');
                throw new Error('Failed to list users: No data returned');
            }
            existingUser = listUsersResponse.data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        } catch (e: any) {
            console.error('Exception during listUsers:', e);
            throw new Error(`User search failed: ${e.message}`);
        }

        let targetUserId: string;

        if (existingUser) {
            console.log('User already exists, updating existing record:', existingUser.id);
            targetUserId = existingUser.id;

            // Optionally update their metadata if needed
            const updateResult = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
                user_metadata: { first_name: firstName, last_name: lastName, role: role || 'representative' }
            });
            if (updateResult.error) {
                console.error('Update user error:', updateResult.error);
                throw new Error(`Failed to update existing user: ${updateResult.error.message}`);
            }
        } else {
            // 2. Invite New User (sends magic link)
            console.log('Inviting new user...');
            const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    role: role || 'representative'
                }
            })

            if (inviteError) {
                console.error('Invite error:', inviteError);
                throw new Error(`Supabase inviteWithEmail failed: ${inviteError.message}`);
            }
            if (!inviteData.user) throw new Error('Failed to create invitation: No user returned');
            targetUserId = inviteData.user.id;
        }

        // 3. Database Setup (Profile + Roles) via Security Definer RPC to bypass all permissions/triggers
        const { data: dbData, error: dbError } = await supabaseAdmin.rpc('admin_invite_user_db_setup', {
            p_user_id: targetUserId,
            p_email: email,
            p_first_name: firstName,
            p_last_name: lastName,
            p_role: role || 'representative',
            p_organization_id: organizationId,
            p_zone_id: zoneId || null
        });

        if (dbError) {
            console.error('DB Setup RPC error:', dbError);
            throw new Error(`Auth logic success but profile update failed: ${dbError.message}`);
        }
        
        if (dbData && dbData.error) {
            console.error('DB Setup RPC internal error:', dbData.error);
            throw new Error(`Auth logic success but profile update failed internally: ${dbData.error}`);
        }

        return new Response(
            JSON.stringify({
                user: { id: targetUserId, email },
                message: existingUser ? 'User updated successfully' : 'Invitation sent successfully'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        // Return 200 with error key so client can read the message instead of throwing generic 400
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
