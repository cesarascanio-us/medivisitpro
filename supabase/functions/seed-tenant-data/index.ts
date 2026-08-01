/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

/* eslint-disable @typescript-eslint/ban-ts-comment */
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

        const body = await req.json()
        const { organization_id, user_id } = body

        if (!organization_id || !user_id) {
            throw new Error('organization_id and user_id are required')
        }

        console.log(`Seeding data for org: ${organization_id}, user: ${user_id}`)

        // 1. Create Zones
        const { data: zones, error: zonesError } = await supabaseClient
            .from('zones')
            .insert([
                { name: 'Zona Norte', organization_id },
                { name: 'Zona Sur', organization_id }
            ])
            .select()

        if (zonesError) {
            console.error('Error seeding zones:', zonesError)
            throw zonesError
        }

        const zonaNorteId = zones?.find((z: any) => z.name === 'Zona Norte')?.id
        const zonaSurId = zones?.find((z: any) => z.name === 'Zona Sur')?.id

        // 2. Create Products
        const { error: productsError } = await supabaseClient
            .from('products')
            .insert([
                {
                    name: 'Vitalix 500mg',
                    category: 'Antibiótico',
                    therapeutic_area: 'Infectología',
                    organization_id,
                    user_id,
                    presentation: 'Caja x 20 tabletas',
                    description: 'Antibiótico de amplio espectro para procesos infecciosos.'
                },
                {
                    name: 'CardioCare Plus',
                    category: 'Cardiovascular',
                    therapeutic_area: 'Cardiología',
                    organization_id,
                    user_id,
                    presentation: 'Frasco x 30 cápsulas',
                    description: 'Suplemento para el fortalecimiento del sistema cardiovascular.'
                },
                {
                    name: 'NeuroZon',
                    category: 'Neurológico',
                    therapeutic_area: 'Neurología',
                    organization_id,
                    user_id,
                    presentation: 'Blíster x 10 ml',
                    description: 'Potenciador de la función cognitiva y regeneración neuronal.'
                }
            ])

        if (productsError) {
            console.error('Error seeding products:', productsError)
            throw productsError
        }

        // 3. Create Doctors
        const { error: doctorsError } = await supabaseClient
            .from('doctors')
            .insert([
                {
                    name: 'Dr. Alejandro Martínez',
                    specialty: 'Cardiología',
                    potential: 'A',
                    organization_id,
                    user_id,
                    city: 'Caracas',
                    state: 'Distrito Capital',
                    status: 'active'
                },
                {
                    name: 'Dra. Beatriz García',
                    specialty: 'Neurología',
                    potential: 'B',
                    organization_id,
                    user_id,
                    city: 'Caracas',
                    state: 'Distrito Capital',
                    status: 'active'
                },
                {
                    name: 'Dr. Carlos Ruiz',
                    specialty: 'Medicina General',
                    potential: 'C',
                    organization_id,
                    user_id,
                    city: 'Maracay',
                    state: 'Aragua',
                    status: 'active'
                },
                {
                    name: 'Dra. Daniela López',
                    specialty: 'Pediatría',
                    potential: 'A',
                    organization_id,
                    user_id,
                    city: 'Valencia',
                    state: 'Carabobo',
                    status: 'active'
                },
                {
                    name: 'Dr. Enrique Peña',
                    specialty: 'Ginecología',
                    potential: 'B',
                    organization_id,
                    user_id,
                    city: 'Barquisimeto',
                    state: 'Lara',
                    status: 'active'
                }
            ])

        if (doctorsError) {
            console.error('Error seeding doctors:', doctorsError)
            throw doctorsError
        }

        // 4. Create Pharmacies
        const { error: pharmaciesError } = await supabaseClient
            .from('pharmacies')
            .insert([
                {
                    name: 'Farmacia La Salud',
                    region: 'Capital',
                    zone_id: zonaNorteId,
                    organization_id,
                    user_id,
                    state: 'Distrito Capital',
                    city: 'Caracas',
                    status: 'active'
                },
                {
                    name: 'FarmaVenta Sur',
                    region: 'Central',
                    zone_id: zonaSurId,
                    organization_id,
                    user_id,
                    state: 'Carabobo',
                    city: 'Valencia',
                    status: 'active'
                },
                {
                    name: 'Farmacia Comunitaria',
                    region: 'Capital',
                    zone_id: zonaNorteId,
                    organization_id,
                    user_id,
                    state: 'Miranda',
                    city: 'Los Teques',
                    status: 'active'
                }
            ])

        if (pharmaciesError) {
            console.error('Error seeding pharmacies:', pharmaciesError)
            throw pharmaciesError
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Seeding completed successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error: any) {
        console.error('Seeding function error:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
