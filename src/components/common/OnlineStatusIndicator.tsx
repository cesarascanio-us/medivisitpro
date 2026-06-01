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
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/5 border border-blue-500/10 rounded-full animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest hidden md:inline">Sincronizando</span>
                    </div>
                ) : !isOnline ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/5 border border-amber-500/10 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest hidden md:inline">Offline</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full group hover:bg-emerald-500/10 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform"></div>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest hidden md:inline">Cloud Activa</span>
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
