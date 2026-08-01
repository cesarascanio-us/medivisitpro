/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, History, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RotationHistoryProps {
    pharmacyId: string;
    productId?: string;
}

export function RotationHistory({ pharmacyId, productId }: RotationHistoryProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => { loadHistory(); }, [pharmacyId, productId]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const { data: audits } = await (supabase as any).from("registro_pvp_farmacia").select(`*, visits(scheduled_date)`).eq("pharmacy_id", pharmacyId).order("created_at", { ascending: true });
            if (audits) {
                const chartMap = new Map();
                audits.forEach((a: any) => {
                    const date = new Date(a.visits?.scheduled_date || a.created_at).toLocaleDateString("es-ES", { month: "short", day: "numeric" }).toUpperCase();
                    if (!chartMap.has(date)) chartMap.set(date, { date, rotation: 0, stock: 0 });
                    const entry = chartMap.get(date);
                    entry.rotation += a.ventas_estimadas || 0;
                    entry.stock += a.cantidad_actual || 0;
                });
                setData(Array.from(chartMap.values()));
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (data.length === 0) return <div className="text-[10px] font-black text-slate-600 text-center p-12 uppercase tracking-[0.3em] ">No hay historial de rotación disponible en el Archivo Maestro.</div>;

    return (
        <Card className="border-none shadow-none bg-transparent font-outfit">
            <CardHeader className="px-0 pb-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 flex items-center gap-3 ">
                    <History className="h-4 w-4" /> Inteligencia de Mercado & Tendencia Histórica
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="h-[250px] w-full bg-slate-950/30 p-6 rounded-[2rem] border border-white/5 relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5"><Activity className="w-16 h-16 text-white" /></div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" fontSize={8} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                            <YAxis fontSize={8} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                labelStyle={{ fontWeight: 'black', color: '#fff', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}
                                itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '8px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                            <Bar name="Rotación (Ventas)" dataKey="rotation" fill="#10b981" radius={[6, 6, 0, 0]} barSize={12} />
                            <Bar name="Stock en Anaquel" dataKey="stock" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6 flex items-center justify-between px-2">
                    <div className="flex gap-3">
                        <Badge className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-none px-3 py-1 ">
                            <TrendingUp className="h-3 w-3 mr-2" /> Alta Rotación Detectada
                        </Badge>
                        <Badge className="text-[8px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border-none px-3 py-1 ">
                            Estrategia Activa
                        </Badge>
                    </div>
                    <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">v6.4.2 ANALYTICS SINK</p>
                </div>
            </CardContent>
        </Card>
    );
}
