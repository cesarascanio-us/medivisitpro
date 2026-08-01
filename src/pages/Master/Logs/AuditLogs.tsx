/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, Activity, User, Globe, RefreshCw } from "lucide-react";
import { EliteHeader } from "@/components/layout/DesignSystem";
import { EliteTable, EliteColumn } from "@/components/layout/EliteTable";

interface LogType {
    id: string;
    operation: string;
    table_name: string;
    new_data: any;
    old_data: any;
    changed_by: string;
    changed_at: string;
}

export default function AuditLogs() {
    const [logs, setLogs] = useState<LogType[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('changed_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching logs:', error);
        } else {
            setLogs(data as LogType[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const columns: EliteColumn<LogType>[] = [
        {
            header: "Acción / Entidad",
            key: "operation",
            render: (log) => (
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="badge-elite badge-elite-info">
                        {log.operation}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">
                        {log.table_name}
                    </span>
                </div>
            )
        },
        {
            header: "Datos Técnicos (Payload)",
            key: "new_data",
            render: (log) => (
                <code className="text-[11px] font-mono bg-muted p-2 rounded-lg text-muted-foreground block max-w-[280px] truncate border border-border">
                    {JSON.stringify(log.new_data || log.old_data || {})}
                </code>
            )
        },
        {
            header: "Autoría / Red",
            key: "changed_by",
            render: (log) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-muted-foreground">
                        <div className="icon-box-primary w-5 h-5 !rounded">
                            <User className="w-3 h-3 text-primary" />
                        </div>
                        <span className="truncate max-w-[140px]">{log.changed_by || 'Autómata'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground pl-6">
                        <Globe className="w-2.5 h-2.5" />
                        {log.table_name || 'Red Interna'}
                    </div>
                </div>
            )
        },
        {
            header: "Fecha de Registro",
            key: "changed_at",
            render: (log) => (
                <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-muted-foreground tabular-nums lowercase tracking-tighter">
                        {new Date(log.changed_at).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(log.changed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            ),
            className: "text-right"
        }
    ];

    if (loading && logs.length === 0) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Sincronizando logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <EliteHeader 
                title="Auditoría de Logs"
                subtitle="Registro de actividad y eventos de seguridad"
                icon={ShieldAlert}
                badgeText="SEGURIDAD DEL SISTEMA"
                statusText="AUDITORÍA ACTIVA"
                statusColor="bg-primary"
                rightContent={
                    <Button
                        onClick={fetchLogs}
                        className="btn-elite-secondary"
                        title="Actualizar registro"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                }
            />

            {logs.length === 0 ? (
                <div className="text-center py-24 px-6 border border-border rounded-elite-xl bg-card">
                    <div className="icon-box-primary w-20 h-20 !rounded-[2rem] mx-auto mb-6">
                        <Activity className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-black text-foreground">Sin actividad registrada</h3>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">
                        No se encontraron logs en el sistema.
                    </p>
                </div>
            ) : (
                <EliteTable 
                    data={logs} 
                    columns={columns} 
                    searchKey="operation"
                    searchPlaceholder="Buscar por operación..."
                />
            )}
        </div>
    );
}
