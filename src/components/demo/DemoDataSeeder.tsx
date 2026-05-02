/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_DATA } from "@/data/mockDemoData";
import { useToast } from "@/hooks/use-toast";

/**
 * DemoDataSeeder - Active Seeder
 * Injects fictitious data into the REAL database for the Demo Organization.
 */
export const DemoDataSeeder = () => {
    const { isDemo, user, organizationId } = useAuth();
    const { toast } = useToast();
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        const seedData = async () => {
            if (!isDemo || !user || !organizationId || seeding) return;

            try {
                // 1. Check if we already have contacts (to avoid duplicate seeding)
                const { count, error: countError } = await supabase
                    .from('contacts')
                    .select('*', { count: 'exact', head: true })
                    .eq('organization_id', organizationId);

                if (countError) throw countError;

                if (count === 0) {
                    console.log("🚀 [Seeder] Entorno vacío detectado. Iniciando siembra de datos...");
                    setSeeding(true);
                    
                    toast({
                        title: "Iniciando Demo",
                        description: "Estamos preparando tus datos ficticios iniciales...",
                    });

                    // 2. Seed Contacts (Doctors & Pharmacies)
                    const contactsToInsert = MOCK_DATA.contacts.map(c => ({
                        ...c,
                        user_id: user.id,
                        organization_id: organizationId,
                        created_at: new Date().toISOString()
                    }));

                    const { data: insertedContacts, error: contactError } = await supabase
                        .from('contacts')
                        .insert(contactsToInsert as any)
                        .select();

                    if (contactError) throw contactError;

                    // 3. Seed Products
                    const productsToInsert = MOCK_DATA.products.map(p => ({
                        ...p,
                        organization_id: organizationId
                    }));
                    await supabase.from('products').insert(productsToInsert as any);

                    // 4. Seed Initial Visits
                    if (insertedContacts && insertedContacts.length > 0) {
                        const contacts = insertedContacts as any[];
                        const visitsToInsert = MOCK_DATA.visits.slice(0, 10).map((v, i) => ({
                            ...v,
                            user_id: user.id,
                            organization_id: organizationId,
                            contact_id: contacts[i % contacts.length].id,
                            scheduled_date: new Date(Date.now() + i * 3600000).toISOString()
                        }));
                        await supabase.from('visits').insert(visitsToInsert as any);
                    }

                    toast({
                        title: "¡Demo Lista!",
                        description: "Se han cargado los datos ficticios. ¡Ya puedes editarlos o añadir los tuyos!",
                    });
                }
            } catch (error) {
                console.error("❌ [Seeder] Error al sembrar datos:", error);
            } finally {
                setSeeding(false);
            }
        };

        seedData();
    }, [isDemo, user, organizationId]);

    return null;
};
