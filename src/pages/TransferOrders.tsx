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
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";
import { useTheme } from "@/context/ThemeContext";

const TRANSFER_ORDERS = [
    { id: "TRF-2026-001", pharmacy: "FARMACIA EL SOL", drugstore: "DROGUERÍA NENA", items: 12, total: 450.50, status: "pendiente", date: "2026-04-01" },
    { id: "TRF-2026-002", pharmacy: "BOTIQUERÍA LOS ALTOS", drugstore: "DROGUERÍA COBECA", items: 5, total: 125.00, status: "procesado", date: "2026-04-02" },
    { id: "TRF-2026-003", pharmacy: "FARMAHORRO PRINCIPAL", drugstore: "DROGUERÍA MÉDICA", items: 28, total: 1200.75, status: "en_ruta", date: "2026-04-03" },
];

export default function TransferOrders() {
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pendiente': return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold text-[10px] px-3 py-0.5 rounded-full shadow-none">Pendiente</Badge>;
            case 'procesado': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold text-[10px] px-3 py-0.5 rounded-full shadow-none">Procesado</Badge>;
            case 'en_ruta': return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold text-[10px] px-3 py-0.5 rounded-full shadow-none">En ruta</Badge>;
            default: return <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-border/40 font-bold text-[10px] px-3 py-0.5 rounded-full shadow-none">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <EliteHeader
                title={theme?.texts?.transfers_title || "Canal de Transferencia"}
                subtitle={theme?.texts?.transfers_subtitle || "Gestión de órdenes de transferencia y logística de suministro"}
                icon={Truck}
                badgeText="Logística"
                statusText="Sistema operativo"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-12 px-6 border-border/40 bg-card text-muted-foreground font-bold text-xs hover:bg-muted/10 rounded-xl transition-all shadow-sm flex items-center gap-2">
                            <FileText className="h-4 w-4" /> 
                            Histórico
                        </Button>
                        <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">
                            <Plus className="h-4 w-4" /> 
                            Nueva Orden
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <EliteKPICard
                    title="Órdenes activas"
                    value="12"
                    icon={Package}
                    color="blue"
                />
                <EliteKPICard
                    title="Pendientes"
                    value="04"
                    icon={Clock}
                    color="amber"
                />
                <EliteKPICard
                    title="Entregadas"
                    value="48"
                    icon={CheckCircle2}
                    color="emerald"
                />
                <EliteKPICard
                    title="Proyección ventas"
                    value="$14.2K"
                    icon={TrendingUp}
                    color="indigo"
                />
            </div>

            <Card className="border-border/40 shadow-sm bg-card rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            <Input
                                placeholder="Buscar por farmacia o droguería..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 pl-10 bg-muted/20 border-none rounded-xl font-semibold text-xs shadow-inner text-foreground"
                            />
                        </div>
                        <Button variant="outline" className="h-11 px-6 border-border/40 bg-card rounded-xl font-bold text-xs text-muted-foreground flex items-center gap-2 hover:bg-muted/10 transition-all shadow-sm">
                            <Filter className="h-4 w-4 text-primary" /> Filtrar resultados
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-card rounded-[2rem] overflow-hidden flex flex-col">
                <ScrollArea className="flex-1">
                    <Table>
                        <TableHeader className="bg-muted/5">
                            <TableRow className="hover:bg-transparent border-border/40 h-16">
                                <TableHead className="pl-8 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ID Orden</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Punto de entrega</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Distribuidora</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">Unidades</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">Estado</TableHead>
                                <TableHead className="text-right pr-8 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {TRANSFER_ORDERS.map((order) => (
                                <TableRow key={order.id} className="hover:bg-muted/5 transition-all border-border/40 group h-20">
                                    <TableCell className="pl-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <span className="font-bold text-xs text-foreground group-hover:text-primary cursor-pointer transition-colors">{order.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xs text-muted-foreground uppercase leading-none mb-1">{order.pharmacy}</span>
                                            <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">Sede Autorizada</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] font-bold border-border/40 bg-muted/20 text-muted-foreground px-3 py-1 group-hover:bg-card transition-all rounded-lg">{order.drugstore}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-xs tabular-nums text-muted-foreground/60">{order.items} uni</TableCell>
                                    <TableCell className="text-right font-bold text-foreground tabular-nums text-sm">${order.total.toLocaleString()}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
                                    <TableCell className="text-right pr-8">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted/10 rounded-xl transition-all">
                                            <ExternalLink className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </Card>

            <div className="flex items-center justify-between px-8 text-muted-foreground/50">
                <div className="flex items-center gap-3">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">MediVisitPro Platform</span>
                </div>
                <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
                    <span>Sincronización segura</span>
                    <span className="text-primary">V 6.5.2</span>
                </div>
            </div>
        </div>
    );
}
