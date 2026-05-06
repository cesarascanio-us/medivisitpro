/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, TrendingUp, Activity, 
    Globe, LayoutDashboard, ShoppingCart, RefreshCw, ExternalLink, ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import {
    useDashboardVisits, useDashboardOrders, useDashboardProfilesRoles,
    useDashboardZones, useDashboardKPIs, usePendingOrders, useDashboardDroguerias
} from "@/hooks/queries/useDashboardQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CompetitivenessMonitor } from "@/components/dashboard/CompetitivenessMonitor";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { AdminDataFilter, AdminFilterState } from "@/components/admin/AdminDataFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteKPICard, EliteCard, EliteButton } from "@/components/layout/DesignSystem";

interface ZoneKPI {
    estate: string;
    visit_count: number;
    orders_count: number;
    sales_total: number;
    region?: string;
}

interface RepPerformance {
    id: string;
    name: string;
    email: string;
    state: string;
    region: string;
    visits: number;
    orders: number;
    sales: number;
    effectiveness: number;
    role?: string;
    is_active?: boolean;
    invitation_status?: 'pending' | 'active';
}

const ROLE_LABELS: Record<string, string> = {
    master: 'System Admin',
    admin: 'Administrador',
    manager: 'Gerente',
    coordinator: 'Coordinador',
    supervisor: 'Supervisor',
    representative: 'Representante',
    doctor: 'Médico',
    pharmacist: 'Farmacéutico',
    service_chief: 'Jefe de Servicios',
    telemarketing: 'Telemarketing'
};

const ROLE_COLORS: Record<string, string> = {
    master: 'bg-primary/20 text-primary border-primary/40',
    admin: 'bg-rose-500/20 text-rose-500 border-rose-500/40',
    manager: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/40',
    coordinator: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40',
    supervisor: 'bg-blue-500/20 text-blue-500 border-blue-500/40',
    representative: 'bg-amber-500/20 text-amber-500 border-amber-500/40',
    telemarketing: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
};

export default function DashboardMaster() {
    const { user, isManager, isAdmin, isMaster, loading: authLoading } = useAuth();
    const { organization } = useOrganization();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState('dashboard');
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const [filters, setFilters] = useState<AdminFilterState>({ region: "all", state: "all" });

    const { data: visitsDataObj, isLoading: loadingVisits } = useDashboardVisits(startOfMonth, filters);
    const { data: ordersData, isLoading: loadingOrders } = useDashboardOrders(startOfMonth, filters);
    const { data: profilesRoles, isLoading: loadingProfiles } = useDashboardProfilesRoles();
    const { data: zonesData, isLoading: loadingZones } = useDashboardZones();
    const { data: kpiDataRaw, isLoading: loadingKPIs } = useDashboardKPIs();
    const { data: pendingOrders = [], isLoading: loadingPending } = usePendingOrders(filters);
    const { data: droguerias = [], isLoading: loadingDroguerias } = useDashboardDroguerias();

    const loading = loadingVisits || loadingOrders || loadingProfiles || loadingZones || loadingKPIs || loadingPending || loadingDroguerias;

    const { stats, repData, zoneData } = useMemo(() => {
        const initial = {
            stats: { totalVisits: 0, totalOrders: 0, totalSales: 0, activeZones: 0 },
            repData: [] as RepPerformance[],
            zoneData: [] as ZoneKPI[],
        };

        if (loading) return initial;

        const visitsData = visitsDataObj?.data || [];
        const visitCount = visitsDataObj?.count || 0;
        const profilesData = profilesRoles?.profiles || [];
        const rolesData = profilesRoles?.roles || [];
        const zoneMap = (zonesData || []).reduce((acc: any, curr: any) => { acc[curr.id] = curr.name; return acc; }, {});

        const roleDataMap = (rolesData || []).reduce((acc: any, curr: any) => {
            acc[curr.user_id] = { role: curr.role, is_active: curr.is_active, zone_id: curr.zone_id };
            return acc;
        }, {});

        const repStatsMap: Record<string, RepPerformance> = {};
        profilesData?.forEach(p => {
            const roleInfo = roleDataMap[p.user_id];
            if (!isMaster && !roleInfo) return;
            repStatsMap[p.user_id] = {
                id: p.user_id, name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email, email: p.email,
                state: 'N/A', visits: 0, orders: 0, sales: 0, effectiveness: 0, role: roleInfo?.role || 'representative',
                is_active: roleInfo?.is_active ?? true, invitation_status: (p.invitation_status as any) || 'active',
                region: roleInfo?.zone_id ? zoneMap[roleInfo.zone_id] : 'N/A'
            };
        });

        visitsData?.forEach((v: any) => { if (repStatsMap[v.user_id]) { repStatsMap[v.user_id].visits++; } });
        ordersData?.forEach((o: any) => { if (repStatsMap[o.user_id]) { repStatsMap[o.user_id].orders++; repStatsMap[o.user_id].sales += (o.total || 0); } });

        const repsArray = Object.values(repStatsMap).map(rep => ({ ...rep, effectiveness: rep.visits > 0 ? (rep.orders / rep.visits) * 100 : 0 }));
        const zoneStatsMap: Record<string, ZoneKPI> = {};
        (kpiDataRaw || []).forEach((k: any) => { zoneStatsMap[k.zone_name] = { estate: k.zone_name, region: k.zone_name, visit_count: 0, orders_count: k.total_orders || 0, sales_total: k.total_amount || 0 }; });

        return {
            stats: { totalVisits: visitCount || 0, totalOrders: ordersData?.length || 0, totalSales: ordersData?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0, activeZones: Object.keys(zoneStatsMap).length || 0 },
            repData: repsArray, zoneData: Object.values(zoneStatsMap)
        };
    }, [visitsDataObj, ordersData, profilesRoles, zonesData, kpiDataRaw, loading, isMaster]);

    useEffect(() => { if (!authLoading && (!user || (!isManager && !isAdmin && !isMaster))) { navigate("/"); } }, [user, isManager, isAdmin, isMaster, navigate, authLoading]);

    if (loading && !stats.totalVisits) return (
        <div className="h-screen flex flex-col items-center justify-center bg-card space-y-8 font-display">
            <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-premium-lg animate-pulse">
                <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px]">Sincronizando Mando Central...</div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-full bg-card space-y-10 p-1 animate-in fade-in duration-700 font-display">
            <EliteHeader 
                title="Centro de Mando Alpha"
                subtitle="Soberanía Digital y Orquestación SaaS de MediVisitPro Intelligence"
                icon={LayoutDashboard}
                badgeText="SYSTEM ACCESS ALPHA"
                statusText="Core Online & Sincronizado"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <EliteButton 
                            variant="secondary"
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })} 
                            className="h-14 w-14 p-0 shadow-premium-sm group"
                        >
                            <RefreshCw className={cn("h-6 w-6 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
                        </EliteButton>
                    </div>
                }
            />

            <AdminDataFilter onFilterChange={setFilters} />

            <Tabs defaultValue="dashboard" className="w-full space-y-10" onValueChange={setActiveTab}>
                <div className="flex justify-start">
                    <TabsList className="bg-muted/5 border border-border/40 p-1.5 rounded-full h-auto flex gap-1 shadow-inner">
                        <TabsTrigger value="dashboard" className="flex items-center gap-3 px-10 py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest border-none group">
                            <LayoutDashboard size={14} /> TABLERO
                        </TabsTrigger>
                        <TabsTrigger value="pedidos" className="flex items-center gap-3 px-10 py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest border-none text-muted-foreground group">
                            <ShoppingCart size={14} /> PEDIDOS {pendingOrders.length > 0 && <Badge className="ml-2 bg-rose-500 text-white border-none text-[8px] h-5 min-w-5 flex items-center justify-center rounded-full p-0">{pendingOrders.length}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="equipo" className="flex items-center gap-3 px-10 py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest border-none text-muted-foreground group">
                            <Users size={14} /> EQUIPO
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="dashboard" className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <EliteKPICard title="Ventas Totales" value={`$${stats.totalSales.toLocaleString()}`} icon={TrendingUp} color="emerald" />
                        <EliteKPICard title="Visitas Médicas" value={stats.totalVisits.toString()} icon={Activity} color="indigo" />
                        <EliteKPICard title="Pedidos Activos" value={stats.totalOrders.toString()} icon={ShoppingCart} color="blue" />
                        <EliteKPICard title="Detección Zonas" value={stats.activeZones.toString()} icon={Globe} color="amber" />
                    </div>
                    <CompetitivenessMonitor />
                    <AnalyticsCharts zoneData={zoneData} />
                </TabsContent>

                <TabsContent value="pedidos" className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                    <EliteCard className="p-8 shadow-premium-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border/40 hover:bg-transparent">
                                    <TableHead className="font-black text-elite-xs text-muted-foreground uppercase tracking-[0.3em] py-8">Orden de Manifiesto</TableHead>
                                    <TableHead className="font-black text-elite-xs text-muted-foreground uppercase tracking-[0.3em] py-8">Entrada / Punto de Venta</TableHead>
                                    <TableHead className="font-black text-elite-xs text-muted-foreground uppercase tracking-[0.3em] py-8 text-right">Monto Proyectado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-32 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-6 opacity-30">
                                                <ShoppingCart className="h-16 w-16" />
                                                <p className="font-black text-elite-xs uppercase tracking-[0.4em]">Sin pedidos pendientes de orquestación</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pendingOrders.map(order => (
                                        <TableRow key={order.id} className="border-b border-border/10 hover:bg-muted/5 group transition-colors">
                                            <TableCell className="py-8 font-black text-sm text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                                                {order.order_number}
                                            </TableCell>
                                            <TableCell className="py-8">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-foreground uppercase text-xs tracking-tight">{order.pharmacy_name}</span>
                                                    <span className="text-elite-xs text-muted-foreground font-black uppercase tracking-widest opacity-60">Sede Autorizada</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-8 text-right font-black text-foreground font-display text-2xl tracking-tighter tabular-nums">
                                                ${order.total?.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </EliteCard>
                </TabsContent>

                <TabsContent value="equipo" className="space-y-8 animate-in slide-in-from-left-10 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {repData.map(rep => (
                            <EliteCard key={rep.id} className="p-10 shadow-premium-sm group hover:shadow-premium-lg transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5"><Users className="w-20 h-20" /></div>
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                     <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 transition-all group-hover:scale-110 shadow-inner group-hover:border-primary/40">
                                         <Users className="text-primary h-8 w-8" />
                                     </div>
                                     <Badge className={cn("px-5 py-2 font-black text-elite-xs uppercase border tracking-widest rounded-full shadow-sm", ROLE_COLORS[rep.role || 'representative'])}>
                                        {ROLE_LABELS[rep.role || 'representative']}
                                     </Badge>
                                </div>
                                <h3 className="font-black text-foreground text-xl uppercase mb-1 tracking-tighter group-hover:text-primary transition-colors font-display">{rep.name}</h3>
                                <p className="text-elite-xs text-muted-foreground mb-10 font-black uppercase tracking-widest opacity-60">{rep.email}</p>
                                
                                <div className="pt-8 border-t border-border/40 flex justify-between items-end relative z-10">
                                    <div className="flex flex-col">
                                         <span className="text-elite-xs font-black text-muted-foreground/40 uppercase tracking-widest mb-2">Ventas Período</span>
                                         <p className="text-2xl font-black text-emerald-500 font-display tracking-tighter tabular-nums">${rep.sales.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                         <p className="text-2xl font-black text-foreground font-display tracking-tighter tabular-nums">{rep.effectiveness.toFixed(0)}%</p>
                                         <p className="text-elite-xs font-black text-muted-foreground/40 uppercase tracking-widest">Eficacia</p>
                                    </div>
                                </div>

                                <EliteButton variant="secondary" className="w-full mt-8 h-12 shadow-sm" icon={ExternalLink} onClick={() => navigate(`/performance/${rep.id}`)}>VER RENDIMIENTO</EliteButton>
                            </EliteCard>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <div className="text-center pb-10 pt-4">
                <p className="text-elite-xs text-muted-foreground/30 font-black uppercase tracking-[0.4em]">
                    Powered by Antigravity Core • Alpha Hub • Empresa CA
                </p>
            </div>
        </div>
    );
}
