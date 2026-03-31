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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Material POP</h1>
                    <p className="text-muted-foreground">Gestión de Material Promocional y Publicitario</p>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className={`grid w-full grid-cols-${tabCount} lg:w-[600px]`}>
                    <TabsTrigger value="pending" className="gap-2">
                        <Inbox className="h-4 w-4" /> Pendientes
                    </TabsTrigger>
                    {canManageCatalog && (
                        <TabsTrigger value="catalog" className="gap-2">
                            <Package className="h-4 w-4" /> Catálogo
                        </TabsTrigger>
                    )}
                    {canManageAssignments && (
                        <TabsTrigger value="assign" className="gap-2">
                            <Send className="h-4 w-4" /> Asignar
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="history" className="gap-2">
                        <History className="h-4 w-4" /> Historial
                    </TabsTrigger>
                </TabsList>

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
