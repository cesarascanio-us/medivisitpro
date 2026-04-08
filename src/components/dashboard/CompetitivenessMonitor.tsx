/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, AlertTriangle, Activity } from "lucide-react";

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

export function CompetitivenessMonitor() {
    const [data, setData] = useState<any[]>([]);
    const [shareData, setShareData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [warnings, setWarnings] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Get Drugstore Prices (Avg per product)
            const drugstoreQuery = await supabase
                .from('inventario_droguerias' as any)
                .select('producto_id, precio_venta_farmacia, products(name)');

            if (drugstoreQuery.error) throw drugstoreQuery.error;

            // 2. Get Pharmacy PVPs (Avg per product)
            const pvpQuery = await supabase
                .from('registro_pvp_farmacia' as any)
                .select('producto_id, pvp, faces');

            if (pvpQuery.error) throw pvpQuery.error;

            // 3. Get Competition Data from Visits (Mapping Missing Fix)
            const { data: interactionData } = await supabase
                .from('visits')
                .select('visibility_audit')
                .not('visibility_audit', 'is', null)
                .order('created_at', { ascending: false })
                .limit(20);

            // Process Data
            const productsMap = new Map();
            let totalOurFaces = 0;
            let totalCompetitorFaces = 0;

            // Process Competition JSON
            (interactionData || []).forEach((v: any) => {
                const audit = v.visibility_audit;
                if (audit) {
                    totalOurFaces += Number(audit.total_our_faces || 0);
                    totalCompetitorFaces += Number(audit.competitor_faces || 0);
                }
            });

            // Aggregate Drugstore Cost
            (drugstoreQuery.data || []).forEach((item: any) => {
                if (!item.products?.name) return;
                const pid = item.producto_id;
                if (!productsMap.has(pid)) {
                    productsMap.set(pid, {
                        name: item.products.name,
                        totalCost: 0,
                        countCost: 0,
                        totalPvp: 0,
                        countPvp: 0,
                        totalFaces: 0
                    });
                }
                const p = productsMap.get(pid);
                p.totalCost += Number(item.precio_venta_farmacia);
                p.countCost += 1;
            });

            // Aggregate Pharmacy PVP
            (pvpQuery.data || []).forEach((item: any) => {
                const pid = item.producto_id;
                if (productsMap.has(pid)) {
                    const p = productsMap.get(pid);
                    p.totalPvp += Number(item.pvp);
                    p.countPvp += 1;
                    p.totalFaces += Number(item.faces || 0);
                }
            });

            const chartData: any[] = [];
            const newWarnings: string[] = [];

            productsMap.forEach((value, key) => {
                const avgCost = value.countCost > 0 ? value.totalCost / value.countCost : 0;
                const avgPvp = value.countPvp > 0 ? value.totalPvp / value.countPvp : 0;
                
                if (avgCost > 0 && avgPvp > 0) {
                    const margin = ((avgPvp - avgCost) / avgPvp) * 100;

                    chartData.push({
                        name: value.name.substring(0, 15) + (value.name.length > 15 ? '...' : ''),
                        fullName: value.name,
                        CostoPromedio: parseFloat(avgCost.toFixed(2)),
                        PVPPromedio: parseFloat(avgPvp.toFixed(2)),
                        margin: margin,
                        faces: value.totalFaces
                    });

                    if (margin < 15) {
                        newWarnings.push(`${value.name}: Margen bajo (${margin.toFixed(1)}%)`);
                    }
                }
            });

            // Pie Chart for Market Share
            if (totalOurFaces > 0 || totalCompetitorFaces > 0) {
                setShareData([
                    { name: 'Propio', value: totalOurFaces },
                    { name: 'Competencia', value: totalCompetitorFaces }
                ]);
                
                const sharePercent = (totalOurFaces / (totalOurFaces + totalCompetitorFaces)) * 100;
                newWarnings.unshift(`Market Share: ${sharePercent.toFixed(1)}% (Total Caras)`);
            }

            setData(chartData.sort((a, b) => a.margin - b.margin).slice(0, 5));
            setWarnings(newWarnings.slice(0, 4));

        } catch (error) {
            console.error("Error loading competitiveness data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="h-[400px] flex items-center justify-center text-muted-foreground">Analizando datos de mercado...</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 col-span-1 lg:col-span-2">
            {/* Margins Monitor */}
            <Card className="border-l-4 border-l-blue-500 shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" /> Monitor de Márgenes
                    </CardTitle>
                    <CardDescription>Costo Mayorista vs PVP Retail (Top Críticos)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`$${value}`, '']} 
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '10px' }} />
                                <Bar dataKey="CostoPromedio" name="Costo Droguería" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="PVPPromedio" name="PVP Farmacia" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Share Monitor (Mapping Fix 360) */}
            <Card className="border-l-4 border-l-emerald-500 shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-800">
                        <Activity className="h-5 w-5 text-emerald-600" /> Share de Visibilidad
                    </CardTitle>
                    <CardDescription>Caras Propias vs Competencia (Auditado)</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="h-[220px] w-full md:w-1/2">
                        {shareData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={shareData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {shareData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sin datos de caras</div>
                        )}
                    </div>

                    <div className="w-full md:w-1/2 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Alertas de Mercado</h4>
                        {warnings.length > 0 ? (
                            <div className="space-y-2">
                                {warnings.map((w, i) => (
                                    <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-2 animate-in slide-in-from-right duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${i === 0 && w.includes('Share') ? 'text-emerald-500' : 'text-amber-500'}`} />
                                        <span className="text-[11px] font-medium text-slate-600 leading-tight">{w}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 border border-dashed rounded-lg text-center text-xs text-muted-foreground">Márgenes y Share dentro de parámetros.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
