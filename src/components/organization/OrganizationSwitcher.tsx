/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { Building2, Command, LogOut } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useOrganization } from "@/hooks/useOrganization";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function OrganizationSwitcher() {
    const { organization, allOrganizations, switchOrganization, isMaster, isLoading } = useOrganization();
    const { isAuditMode, exitAuditMode } = useAuth();

    // Only render for Master users
    if (!isMaster) return null;

    const handleExitAudit = () => {
        localStorage.removeItem('medivisit_master_active_org');
        exitAuditMode();
        toast.success("Modo Auditoría finalizado. Regresando a Consola Sentinel.");
        setTimeout(() => {
            window.location.reload();
        }, 800);
    };

    return (
        <div className="flex items-center gap-2 mr-4 border-r border-border pr-4">
            <div className="hidden lg:flex items-center gap-2 bg-primary/10 border border-primary/20 px-2 py-1 rounded text-xs font-bold text-primary">
                <Command className="w-3 h-3" />
                MASTER
            </div>

            {isAuditMode && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExitAudit}
                    className="h-9 px-3 gap-1.5 text-xs font-semibold text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded transition-colors shadow-sm shrink-0"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Salir de Auditoría</span>
                </Button>
            )}

            <div className="w-[180px] sm:w-[220px]">
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
