/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useEffect, useState } from "react";
import { Wifi, WifiOff, Cloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export const OnlineStatusIndicator = () => {
    const { isOnline, pendingCount, isSyncing } = useOfflineSync();
    const [showSyncBadge, setShowSyncBadge] = useState(false);

    useEffect(() => {
        if (isSyncing) {
            setShowSyncBadge(true);
        } else {
            const timer = setTimeout(() => setShowSyncBadge(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isSyncing]);

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 transition-all duration-300">
                {isSyncing || showSyncBadge ? (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 flex items-center gap-1.5 px-2 py-0.5 animate-pulse">
                            <Cloud className="w-3 h-3 animate-bounce" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Sincronizando...</span>
                        </Badge>
                    </div>
                ) : !isOnline ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/40 flex items-center gap-1.5 px-2 py-0.5">
                            <WifiOff className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Modo Offline Activo</span>
                        </Badge>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5 px-2 py-0.5">
                            <Wifi className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Conectado</span>
                        </Badge>
                    </div>
                )}
            </div>

            {pendingCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 text-[10px] h-5 px-1.5 font-bold shadow-lg shadow-red-500/20 animate-in zoom-in duration-300">
                    {pendingCount}
                </Badge>
            )}
        </div>
    );
};
