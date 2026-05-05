/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { Building2, Command } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useOrganization } from "@/hooks/useOrganization";
import { Badge } from "@/components/ui/badge";

export function OrganizationSwitcher() {
    const { organization, allOrganizations, switchOrganization, isMaster, isLoading } = useOrganization();

    // Only render for Master users
    if (!isMaster) return null;

    return (
        <div className="flex items-center gap-2 mr-4 border-r border-border pr-4">
            <div className="hidden lg:flex items-center gap-2 bg-primary/10 border border-primary/20 px-2 py-1 rounded text-xs font-bold text-primary">
                <Command className="w-3 h-3" />
                MASTER
            </div>

            <div className="w-[200px] sm:w-[240px]">
                <Select
                    value={organization?.id || ''}
                    onValueChange={(value) => switchOrganization(value)}
                    disabled={isLoading}
                >
                    <SelectTrigger className="h-9 bg-card border-border text-foreground focus:ring-primary/50 hover:bg-accent transition-colors">
                        <div className="flex items-center gap-2 truncate">
                            {isLoading ? (
                                <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full mr-2" />
                            ) : (
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccionar Organización"} />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                        {allOrganizations.map((org) => (
                            <SelectItem
                                key={org.id}
                                value={org.id}
                                className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    {org.name}
                                    {org.subscription_status === 'active' && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    )}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
