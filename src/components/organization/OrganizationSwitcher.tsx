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
    const { organization, allOrganizations, switchOrganization, isMaster } = useOrganization();

    // Only render for Master users
    if (!isMaster) return null;

    return (
        <div className="flex items-center gap-2 mr-4 border-r border-slate-700/50 pr-4">
            <div className="hidden lg:flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded text-xs font-bold text-purple-400">
                <Command className="w-3 h-3" />
                MASTER
            </div>

            <div className="w-[200px] sm:w-[240px]">
                <Select
                    value={organization?.id || ''}
                    onValueChange={(value) => switchOrganization(value)}
                >
                    <SelectTrigger className="h-9 bg-slate-800 border-slate-700 text-white focus:ring-purple-500/50 hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-2 truncate">
                            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                            <SelectValue placeholder="Seleccionar Organización" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                        {allOrganizations.map((org) => (
                            <SelectItem
                                key={org.id}
                                value={org.id}
                                className="text-slate-200 focus:bg-slate-800 focus:text-white cursor-pointer"
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
