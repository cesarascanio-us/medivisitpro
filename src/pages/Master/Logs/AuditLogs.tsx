/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, ShieldAlert, Search, Activity, User, Globe, RefreshCw } from "lucide-react";

interface LogType {
    id: string;
    operation: string; // Action in DB is operation
    table_name: string; // Entity is table_name
    new_data: any;    // Details is usually new_data
    old_data: any;
    changed_by: string; // user_id is changed_by
    changed_at: string;
    // Note: IP might not be in the base schema if not strictly defined, 
    // but we can map operation -> action for UI consistency
}

export default function AuditLogs() {
    const [logs, setLogs] = useState<LogType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        // Cast table name to any/string to bypass strict type check for new table
        let query = supabase
            .from('audit_logs')
            .select('*')
            .order('changed_at', { ascending: false })
            .limit(100);

        if (searchTerm) {
            query = query.or(`action.ilike.%${searchTerm}%,entity.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching logs:', error);
        } else {
            setLogs(data as LogType[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <div className="flex flex-col min-h-full space-y-6 p-1">
            {/* Premium White Header Container */}
            <header className="bg-card px-10 md:px-12 py-8 rounded-elite-lg shadow-xl shadow-slate-200/50 dark:shadow-none border border-border relative overflow-hidden -mt-2 mx-1">
                {/* Decorative backgrounds */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-60 text-slate-900"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none transform transition-transform hover:scale-105">
                            <ShieldAlert className="text-white h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Seguridad del Sistema</p>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                                Auditoría de Logs
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">Registro de actividad y eventos de seguridad</p>
                        </div>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar acción o entidad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 bg-muted border-border h-12 rounded-2xl focus:ring-emerald-500 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </header>

            <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-card rounded-[2rem] overflow-hidden mx-1">
                <CardHeader className="border-b border-border pb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                Actividad Crítica
                            </CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">Últimos 100 eventos registrados sincrónicamente</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchLogs}
                            className="w-10 h-10 rounded-xl border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-all"
                            title="Actualizar registro"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && logs.length === 0 ? (
                        <div className="flex justify-center py-24">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Sincronizando logs...</p>
                            </div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-24 px-6">
                            <div className="bg-muted/50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <Activity className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-lg font-black text-foreground">Sin actividad registrada</h3>
                            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">No se encontraron logs que coincidan con los criterios de búsqueda actuales.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 pl-8">Acción / Entidad</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6">Datos Técnicos (Payload)</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6">Autoría / Red</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-6 text-right pr-8">Fecha de Registro</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id} className="border-b border-border hover:bg-muted/10 transition-colors group">
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none font-bold text-[10px] px-2.5 py-0.5 uppercase tracking-wider">
                                                        {log.operation}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">{log.table_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <code className="text-[11px] font-mono bg-muted p-2 rounded-lg text-muted-foreground block max-w-[280px] truncate border border-border/50">
                                                    {JSON.stringify(log.new_data || log.old_data || {})}
                                                </code>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 font-bold text-xs text-muted-foreground">
                                                        <div className="w-5 h-5 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-slate-900">
                                                            <User className="w-3 h-3 text-blue-500" />
                                                        </div>
                                                        <span className="truncate max-w-[140px]">{log.changed_by || 'Autómata'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground pl-6">
                                                        <Globe className="w-2.5 h-2.5" />
                                                        {log.table_name || 'Red Interna'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8 py-5">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-black text-muted-foreground tabular-nums lowercase tracking-tighter">{new Date(log.changed_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(log.changed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
