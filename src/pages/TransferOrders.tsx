/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState } from "react";
import { Plus, Search, Truck, Package, Clock, CheckCircle2, MoreVertical, FileText, Filter, ShieldCheck, TrendingUp, Activity, ShoppingCart, Layers, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const TRANSFER_ORDERS = [
    { id: "TRF-2026-001", pharmacy: "FARMACIA EL SOL", drugstore: "DROGUERÍA NENA", items: 12, total: 450.50, status: "pendiente", date: "2026-04-01" },
    { id: "TRF-2026-002", pharmacy: "BOTIQUERÍA LOS ALTOS", drugstore: "DROGUERÍA COBECA", items: 5, total: 125.00, status: "procesado", date: "2026-04-02" },
    { id: "TRF-2026-003", pharmacy: "FARMAHORRO PRINCIPAL", drugstore: "DROGUERÍA MÉDICA", items: 28, total: 1200.75, status: "en_ruta", date: "2026-04-03" },
];

export default function TransferOrders() {
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pendiente': return <Badge className="bg-amber-500/10 text-amber-500 border-none font-black text-[9px] uppercase tracking-widest px-4 ">PENDIENTE</Badge>;
            case 'procesado': return <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-black text-[9px] uppercase tracking-widest px-4 ">PROCESADO</Badge>;
            case 'en_ruta': return <Badge className="bg-blue-500/10 text-blue-400 border-none font-black text-[9px] uppercase tracking-widest px-4 ">EN RUTA</Badge>;
            default: return <Badge className="bg-slate-900 text-slate-500 border-none font-black text-[9px] uppercase tracking-widest px-4 ">{status.toUpperCase()}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-10 font-outfit text-slate-900 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
            
            {/* HEADER ELITE INDUSTRIAL */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 mb-12">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 shadow-2xl shadow-indigo-500/20 flex items-center justify-center rotate-3 border border-indigo-400/30 scale-105">
                        <Truck className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black  uppercase tracking-tighter leading-none mb-4">Canal Transfer CA</h1>
                        <div className="flex items-center gap-4">
                            <Badge className="bg-indigo-500/10 text-indigo-500 border-none font-black text-[10px] uppercase tracking-[0.2em] px-4 ">Logística de Suministro Soberano 📦</Badge>
                            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ">Operativa Industrial V6.0</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-14 px-8 border-border/40 bg-card hover:bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500  transition-all group">
                        <FileText className="mr-3 h-5 w-5 group-hover:text-indigo-600" /> HISTÓRICO DE MANDO
                    </Button>
                    <Button className="h-14 px-10 bg-primary text-white font-black uppercase  tracking-widest text-xs rounded-2xl shadow-premium-md hover:scale-105 active:scale-95 transition-all">
                        <Plus className="h-5 w-5 mr-3" /> NUEVA ORDEN TÁCTICA
                    </Button>
                </div>
            </div>

            {/* KPI GRID - ELITE DARK STYLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
                {[
                    { label: 'Órdenes Activas', val: '12', sub: 'Transacciones', icon: <Package />, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                    { label: 'En Cola de Proceso', val: '04', sub: 'Pendientes', icon: <Clock />, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                    { label: 'Ciclo Completado', val: '48', sub: 'Entregadas', icon: <CheckCircle2 />, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    { label: 'Facturación SINK', val: '$14.2K', sub: 'Proyección', icon: <TrendingUp />, color: 'text-blue-600', bg: 'bg-blue-50/50' }
                ].map((kpi, i) => (
                    <Card key={i} className={cn("bg-card border-border/40 rounded-[2.5rem] p-8 shadow-premium-sm group relative overflow-hidden transition-all hover:border-primary/20", kpi.bg)}>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform text-slate-400">
                            {kpi.icon}
                        </div>
                        <div className={cn("text-4xl font-black mb-3 tabular-nums ", kpi.color)}>{kpi.val}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]  flex items-center gap-3">
                           {kpi.label}
                        </div>
                    </Card>
                ))}
            </div>

            {/* SEARCH & CONTEXT */}
            <Card className="bg-card border-border/40 rounded-[2.5rem] shadow-premium-md p-6 mb-10 overflow-hidden relative">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="relative z-10 flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="FILTRAR POR FARMACIA, DROGUERÍA O TOKEN DE ORDEN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-16 h-16 bg-slate-50/50 border-border/40 shadow-premium-sm font-black  uppercase text-slate-900 shadow-inner focus:ring-indigo-500/20"
                        />
                    </div>
                    <Button variant="outline" className="h-16 px-10 border-border/40 bg-card rounded-3xl font-black  uppercase text-slate-500 flex items-center gap-4 hover:bg-slate-50 transition-all">
                        <Filter className="h-5 w-5" /> REGLAS DE FILTRADO
                    </Button>
                </div>
            </Card>

            {/* MAIN DATA TABLE - ELITE INDUSTRIAL */}
            <Card className="bg-card border-border/40 rounded-[3rem] shadow-premium-lg overflow-hidden flex flex-col mb-10">
                <ScrollArea className="flex-1">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-border/40 h-20">
                                <TableHead className="pl-10 text-[10px] font-black uppercase tracking-widest text-slate-600 ">ID DE ORDEN</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-600 ">PUNTO DE ENTREGA</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-600 ">SUMINISTRO MAESTRO</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-600  text-center">ITEMS</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-600  text-right">VALOR TÁCTICO</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-600  text-center">ESTATUS</TableHead>
                                <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-widest text-slate-600 ">ACCIÓN</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {TRANSFER_ORDERS.map((order) => (
                                <TableRow key={order.id} className="hover:bg-slate-50 transition-all border-border/40 group h-24">
                                    <TableCell className="pl-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                            <span className="font-black text-xs text-indigo-600  group-hover:underline cursor-pointer tracking-tighter">{order.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-black text-xs text-slate-900 uppercase  leading-none mb-2">{order.pharmacy}</span>
                                            <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Sede Autorizada CA</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-border/40 bg-slate-50 text-slate-500 px-3 py-1.5  group-hover:bg-card transition-all">{order.drugstore}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-black  text-xs tabular-nums text-slate-400">{order.items} UNI</TableCell>
                                    <TableCell className="text-right font-black text-slate-900  tabular-nums text-sm">${order.total.toLocaleString()}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
                                    <TableCell className="text-right pr-10">
                                        <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-slate-100 rounded-2xl transition-all">
                                            <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </Card>

            {/* FOOTER MASTER RECORD */}
            <div className="flex items-center justify-between px-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-indigo-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ">Sincronización Logística SINK - César Ascanio CA</span>
                    </div>
                </div>
                <div className="flex gap-6">
                    <span className="text-[9px] font-black text-slate-700  uppercase tracking-widest">BUILD V6.5.2 INDUSTRIALE</span>
                    <span className="text-[9px] font-black text-indigo-500  uppercase tracking-widest">SUPPLY WEB SECURE</span>
                </div>
            </div>
        </div>
    );
}
