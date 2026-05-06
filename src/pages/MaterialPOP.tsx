/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Archive, Send, History, Inbox } from "lucide-react";
import { POPCatalog } from "@/components/pop/POPCatalog";
import { POPAssignmentManager } from "@/components/pop/POPAssignmentManager";
import { POPAssignmentHistory } from "@/components/pop/POPAssignmentHistory";
import { POPPendingAssignments } from "@/components/pop/POPPendingAssignments";
import { useAuth } from "@/hooks/useAuth";
import { EliteHeader, EliteKPICard, EliteTabsList, EliteTabsTrigger } from "@/components/layout/DesignSystem";

export default function MaterialPOP() {
    const { isMaster, isAdmin, isManager, isSupervisor } = useAuth();

    // Check if user can manage assignments (supervisor and above)
    const canManageAssignments = isMaster || isAdmin || isManager || isSupervisor;
    // Check if user can manage catalog (admin and above)
    const canManageCatalog = isMaster || isAdmin || isManager;

    // Calculate visible tabs count
    const tabCount = 2 + (canManageCatalog ? 1 : 0) + (canManageAssignments ? 1 : 0);

    return (
        <div className="space-y-6">
            <EliteHeader
                title="Material POP"
                subtitle="Gestión de Material Promocional y Publicitario"
                icon={Package}
                badgeText="Industrial"
            />

            <Tabs defaultValue="pending" className="w-full">
                <EliteTabsList className="mb-6">
                    <EliteTabsTrigger value="pending" label="Pendientes" icon={Inbox} />
                    {canManageCatalog && (
                        <EliteTabsTrigger value="catalog" label="Catálogo" icon={Package} />
                    )}
                    {canManageAssignments && (
                        <EliteTabsTrigger value="assign" label="Asignar" icon={Send} />
                    )}
                    <EliteTabsTrigger value="history" label="Historial" icon={History} />
                </EliteTabsList>

                <TabsContent value="pending" className="mt-6">
                    <POPPendingAssignments />
                </TabsContent>

                {canManageCatalog && (
                    <TabsContent value="catalog" className="mt-6">
                        <POPCatalog />
                    </TabsContent>
                )}

                {canManageAssignments && (
                    <TabsContent value="assign" className="mt-6">
                        <POPAssignmentManager />
                    </TabsContent>
                )}

                <TabsContent value="history" className="mt-6">
                    <POPAssignmentHistory />
                </TabsContent>
            </Tabs>
        </div>
    );
}
