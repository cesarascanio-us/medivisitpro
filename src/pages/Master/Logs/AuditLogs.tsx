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
import { Loader2, ShieldAlert, Search, Activity, User, Globe } from "lucide-react";

interface LogType {
    id: string;
    action: string;
    entity: string;
    details: any;
    ip_address: string;
    created_at: string;
    user_id: string;
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
            .order('created_at', { ascending: false })
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
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-emerald-500" />
                        Audit Logs
                    </h1>
                    <p className="text-slate-400 mt-1">Registro de actividad y seguridad del sistema.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Buscar por acción o entidad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                </div>
            </div>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-white">Actividad Reciente</CardTitle>
                            <CardDescription className="text-slate-400">Últimos 100 eventos registrados</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={fetchLogs} title="Refrescar">
                            <Activity className="w-5 h-5 text-emerald-500" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-300">Sin actividad registrada</h3>
                            <p className="text-slate-500 mt-1">No se encontraron logs que coincidan con tu búsqueda.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Acción / Entidad</TableHead>
                                    <TableHead className="text-slate-400">Detalles</TableHead>
                                    <TableHead className="text-slate-400">Usuario / IP</TableHead>
                                    <TableHead className="text-slate-400 text-right">Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell className="font-medium text-white">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-slate-800 text-emerald-400 border-emerald-500/30">
                                                    {log.action}
                                                </Badge>
                                                <span className="text-xs text-slate-500 uppercase font-bold">{log.entity}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-black/30 p-1 rounded text-slate-300 block max-w-[200px] truncate">
                                                {JSON.stringify(log.details)}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    <span className="truncate max-w-[120px]">{log.user_id || 'System'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5 text-slate-500">
                                                    <Globe className="w-3 h-3" />
                                                    {log.ip_address || 'N/A'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-400 text-sm">
                                            <div className="flex flex-col items-end">
                                                <span>{new Date(log.created_at).toLocaleDateString()}</span>
                                                <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
