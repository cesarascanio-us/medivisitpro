// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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
        const supabaseClient = createClient(
            (globalThis as any).Deno.env.get('SUPABASE_URL') ?? '',
            (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const url = new URL(req.url)
        const provider = url.searchParams.get('provider') // stripe, paypal, binance

        const body = await req.json()
        console.log(`Received webhook from ${provider}:`, body)

        if (provider === 'stripe') {
            // Handle Stripe Event
            const eventType = body.type
            const data = body.data.object

            if (eventType === 'checkout.session.completed') {
                const orgId = data.metadata.organization_id
                const subId = data.subscription
                const customerId = data.customer

                // Update Organization with Stripe Customer ID
                await supabaseClient
                    .from('organizations')
                    .update({ stripe_customer_id: customerId })
                    .eq('id', orgId)

                // Create/Update Subscription
                await supabaseClient.from('subscriptions').upsert({
                    organization_id: orgId,
                    provider: 'stripe',
                    provider_subscription_id: subId,
                    status: 'active',
                    current_period_end: new Date(data.expires_at * 1000).toISOString(),
                })
            }
        }

        else if (provider === 'paypal') {
            // Handle PayPal Webhook (e.g., BILLING.SUBSCRIPTION.ACTIVATED)
            const eventType = body.event_type
            const resource = body.resource

            if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
                const orgId = resource.custom_id // We should pass orgId in custom_id

                await supabaseClient.from('subscriptions').upsert({
                    organization_id: orgId,
                    provider: 'paypal',
                    provider_subscription_id: resource.id,
                    status: 'active',
                    current_period_end: resource.billing_info.next_billing_time,
                })
            }
        }

        else if (provider === 'binance') {
            // Handle Binance Pay (C2B) logic
            // In Binance, we usually poll or use a webhook for "Order Paid"
            if (body.bizStatus === 'PAY_SUCCESS') {
                const orgId = body.merchantTradeNo.split('_')[0] // Assuming merchantTradeNo is "orgId_timestamp"

                // Log Transaction
                await supabaseClient.from('billing_transactions').insert({
                    organization_id: orgId,
                    amount: parseFloat(body.totalFee),
                    currency: body.currency,
                    status: 'completed',
                    provider: 'binance',
                    provider_transaction_id: body.transactionId
                })

                // Update Subscription (Binance is usually one-off or handled as manual renewal)
                await supabaseClient.from('subscriptions').upsert({
                    organization_id: orgId,
                    provider: 'binance',
                    status: 'active',
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
                })
            }
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
