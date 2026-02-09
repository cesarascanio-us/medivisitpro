
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Use Service Role to bypass RLS and manage organizations
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Verify LemonSqueezy Signature (Recommended for production)
        // const secret = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET');
        // const hmac = req.headers.get('X-Signature');
        // ... validation logic ...

        const body = await req.json()
        const eventName = body.meta.event_name
        const data = body.data

        console.log(`Received LemonSqueezy event: ${eventName}`, data.id)

        if (eventName === 'order_created' || eventName === 'subscription_created') {
            const attributes = data.attributes
            const customData = attributes.checkout_data?.custom || {}
            const userEmail = attributes.user_email
            const userId = customData.user_id

            // We need a userId to associate the subscription
            if (!userId) {
                console.warn('No user_id found in webhook custom data. Trying with email...')
                // Fallback: find user by email (risky if email changed, but better than nothing)
            }

            let targetUserId = userId

            if (!targetUserId && userEmail) {
                const { data: users, error: userError } = await supabaseClient.auth.admin.listUsers();
                const foundUser = users?.users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase())
                if (foundUser) targetUserId = foundUser.id
            }

            if (!targetUserId) {
                throw new Error(`Could not identify user for email ${userEmail}`)
            }

            console.log(`Processing subscription for User ID: ${targetUserId}`)

            // 1. Check if user belongs to an organization
            const { data: userRoles } = await supabaseClient
                .from('user_roles')
                .select('organization_id, role')
                .eq('user_id', targetUserId)
                .maybeSingle()

            let orgId = userRoles?.organization_id

            // 2. If NO organization, create one (Self-Serve Flow)
            if (!orgId) {
                console.log('User has no organization. Creating "Personal" organization...')

                const { data: profile } = await supabaseClient.from('profiles').select('first_name, last_name').eq('user_id', targetUserId).single()
                const orgName = profile ? `Org de ${profile.first_name}` : `Org Personal ${targetUserId.substring(0, 4)}`

                const { data: newOrg, error: orgError } = await supabaseClient
                    .from('organizations')
                    .insert({ name: orgName, slug: crypto.randomUUID(), plan: 'pro', status: 'active' })
                    .select()
                    .single()

                if (orgError) throw orgError
                orgId = newOrg.id

                // Assign user as Admin/Master of this new Org
                await supabaseClient.from('user_roles').upsert({
                    user_id: targetUserId,
                    organization_id: orgId,
                    role: 'admin', // Give them full control
                    updated_at: new Date().toISOString()
                })

                // Update profile
                await supabaseClient.from('profiles').update({ organization_id: orgId }).eq('user_id', targetUserId)
            }

            // 3. Record Subscription
            await supabaseClient.from('subscriptions').upsert({
                organization_id: orgId,
                status: attributes.status, // 'active'
                plan_variant_id: attributes.variant_id.toString(),
                provider_subscription_id: data.id, // Subscription ID in LS
                current_period_end: attributes.renews_at ? new Date(attributes.renews_at).toISOString() : null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'organization_id' }) // One active sub per org for now? Or handle multiple?

            console.log(`Subscription activated for Org ${orgId}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Webhook error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
