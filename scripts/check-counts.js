/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://enmtiroqsgduhiopgtze.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubXRpcm9xc2dkdWhpb3BndHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDIwMzYsImV4cCI6MjA3MTAxODAzNn0.P1iay3C7hOUE7bflU6L4dERKB59SCaKw8Lo9xL6ZTUE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    const { count: settings } = await supabase.from('site_settings').select('*', { count: 'exact', head: true })
    console.log('Site Settings:', settings)
}

check()
