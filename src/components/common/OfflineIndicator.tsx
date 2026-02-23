/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Wifi, WifiOff, Cloud, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function OfflineIndicator() {
    const { isOnline, pendingCount, isSyncing, forceSync } = useOfflineSync();

    if (isOnline && pendingCount === 0) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-green-600">
                            <Cloud className="h-4 w-4" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Conectado - Todos los datos sincronizados</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (!isOnline) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="animate-pulse gap-1">
                                <WifiOff className="h-3 w-3" />
                                Offline
                            </Badge>
                            {pendingCount > 0 && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                    {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Sin conexión - Los cambios se guardan localmente</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Online but has pending items
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 gap-1">
                            <Wifi className="h-3 w-3" />
                            {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={forceSync}
                            disabled={isSyncing}
                        >
                            {isSyncing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <RefreshCw className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Click para sincronizar operaciones pendientes</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
