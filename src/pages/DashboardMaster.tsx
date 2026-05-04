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
    Globe, LayoutDashboard, ShoppingCart, RefreshCw, ExternalLink
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
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";

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

interface ItemStat {
    name: string;
    count: number;
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
    master: 'status-active',
    admin: 'status-destructive',
    manager: 'status-info',
    coordinator: 'status-active',
    supervisor: 'status-info',
    representative: 'status-active',
    doctor: 'status-info',
    pharmacist: 'status-pending',
    service_chief: 'status-info',
    telemarketing: 'status-active'
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
            regionStats: {} as Record<string, { sales: number, visits: number }>,
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
        
        const regMap: Record<string, { sales: number, visits: number }> = {};
        repsArray.forEach(rep => {
            if (rep.region === 'N/A') return;
            if (!regMap[rep.region]) regMap[rep.region] = { sales: 0, visits: 0 };
            regMap[rep.region].sales += rep.sales;
            regMap[rep.region].visits += rep.visits;
        });

        const zoneStatsMap: Record<string, ZoneKPI> = {};
        (kpiDataRaw || []).forEach((k: any) => { zoneStatsMap[k.zone_name] = { estate: k.zone_name, region: k.zone_name, visit_count: 0, orders_count: k.total_orders || 0, sales_total: k.total_amount || 0 }; });

        const finalZoneData = Object.values(zoneStatsMap);
        return {
            stats: { totalVisits: visitCount || 0, totalOrders: ordersData?.length || 0, totalSales: ordersData?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0, activeZones: finalZoneData.length || 0 },
            repData: repsArray, regionStats: regMap, zoneData: finalZoneData
        };
    }, [visitsDataObj, ordersData, profilesRoles, zonesData, kpiDataRaw, loading, isMaster, user]);

    useEffect(() => { if (!authLoading && (!user || (!isManager && !isAdmin && !isMaster))) { navigate("/"); } }, [user, isManager, isAdmin, isMaster, navigate, authLoading]);

    if (loading && !stats.totalVisits) return (
        <div className="h-screen flex flex-col items-center justify-center bg-background space-y-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner animate-pulse">
                <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div className="text-muted-foreground font-black uppercase tracking-[0.4em] font-display text-[10px]">Sincronizando Centro de Mando...</div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-background space-y-10 p-1 animate-in fade-in duration-700">
            <EliteHeader 
                title="Centro de Mando Alpha"
                subtitle="Soberanía Digital y Orquestación SaaS de MediVisitPro"
                icon={LayoutDashboard}
                badgeText="SYSTEM ACCESS ALPHA"
                statusText="Core Online & Sincronizado"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })} 
                            size="icon"
                            variant="ghost" 
                            className="h-14 w-14 rounded-2xl bg-card border border-border text-muted-foreground hover:text-primary transition-all shadow-sm group"
                        >
                            <RefreshCw className={cn("h-6 w-6 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
                        </Button>
                    </div>
                }
            />

            <AdminDataFilter onFilterChange={setFilters} />

            <Tabs defaultValue="dashboard" className="w-full space-y-8" onValueChange={setActiveTab}>
                <div className="flex justify-start">
                    <TabsList className="bg-muted/30 border border-border/40 p-2 rounded-full h-auto flex gap-2 shadow-inner">
                        <TabsTrigger 
                            value="dashboard" 
                            className="flex items-center gap-3 px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest border-none group"
                        >
                            <LayoutDashboard size={14} className="group-data-[state=active]:text-white" /> TABLERO
                        </TabsTrigger>
                        
                        <TabsTrigger 
                            value="pedidos" 
                            className="flex items-center gap-3 px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest border-none text-muted-foreground group"
                        >
                            <ShoppingCart size={14} className="group-data-[state=active]:text-white" /> PEDIDOS
                            {pendingOrders.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-destructive text-white text-[9px] font-black">{pendingOrders.length}</span>
                            )}
                        </TabsTrigger>
                        
                        <TabsTrigger 
                            value="equipo" 
                            className="flex items-center gap-3 px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest border-none text-muted-foreground group"
                        >
                            <Users size={14} className="group-data-[state=active]:text-white" /> EQUIPO
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="dashboard" className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <EliteKPICard 
                            title="Ventas Totales" 
                            value={`$${stats.totalSales.toLocaleString()}`} 
                            icon={TrendingUp}
                            color="emerald"
                        />
                        <EliteKPICard 
                            title="Visitas Médicas" 
                            value={stats.totalVisits.toString()} 
                            icon={Activity}
                            color="indigo"
                        />
                        <EliteKPICard 
                            title="Pedidos" 
                            value={stats.totalOrders.toString()} 
                            icon={ShoppingCart}
                            color="blue"
                        />
                        <EliteKPICard 
                            title="Detección Zonas" 
                            value={stats.activeZones.toString()} 
                            icon={Globe}
                            color="amber"
                        />
                    </div>
                    <CompetitivenessMonitor />
                    <AnalyticsCharts zoneData={zoneData} />
                </TabsContent>

                <TabsContent value="pedidos" className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                    <Card className="bg-card rounded-[2.5rem] border border-border shadow-premium-sm overflow-hidden p-6">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border/40 hover:bg-transparent">
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Orden de Manifiesto</TableHead>
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Entrada / Punto de Venta</TableHead>
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6 text-right">Monto Proyectado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-24 text-muted-foreground">
                                            <div className="flex flex-col items-center">
                                                <ShoppingCart className="h-12 w-12 opacity-10 mb-4" />
                                                <p className="font-black text-[10px] uppercase tracking-[0.3em]">No hay pedidos pendientes de revisión</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pendingOrders.map(order => (
                                        <TableRow key={order.id} className="border-b border-border/20 hover:bg-muted/30 group transition-colors">
                                            <TableCell className="py-6 font-black text-sm text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                                                {order.order_number}
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground uppercase text-[11px] tracking-tight">{order.pharmacy_name}</span>
                                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Sede Autorizada</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6 text-right font-black text-foreground font-display text-lg tracking-tighter">
                                                ${order.total?.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="equipo" className="space-y-8 animate-in slide-in-from-left-10 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {repData.map(rep => (
                            <Card key={rep.id} className="bg-card border border-border rounded-[2.5rem] shadow-premium-sm p-8 group hover:shadow-premium-md transition-all duration-500">
                                <div className="flex justify-between items-start mb-6">
                                     <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 transition-all group-hover:scale-110 shadow-inner">
                                         <Users className="text-primary h-7 w-7" />
                                     </div>
                                     <Badge className={cn("px-4 py-1.5 font-black text-[9px] uppercase border tracking-widest rounded-full", ROLE_COLORS[rep.role || 'representative'])}>
                                        {ROLE_LABELS[rep.role || 'representative']}
                                     </Badge>
                                </div>
                                <h3 className="font-black text-foreground text-lg uppercase mb-1 tracking-tight group-hover:text-primary transition-colors">{rep.name}</h3>
                                <p className="text-[10px] text-muted-foreground mb-8 font-black uppercase tracking-widest">{rep.email}</p>
                                
                                <div className="pt-6 border-t border-border/40 flex justify-between items-center">
                                    <div className="flex flex-col">
                                         <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Ventas Período</span>
                                         <p className="text-xl font-black text-emerald-500 font-display tracking-tighter">${rep.sales.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                         <p className="text-xl font-black text-foreground font-display tracking-tighter">{rep.effectiveness.toFixed(0)}%</p>
                                         <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">Eficacia</p>
                                    </div>
                                </div>

                                <Button 
                                    variant="ghost" 
                                    className="w-full mt-6 h-12 rounded-xl bg-muted/20 border border-transparent hover:border-primary/20 text-muted-foreground hover:text-primary font-black text-[10px] uppercase tracking-widest transition-all"
                                    onClick={() => navigate(`/performance/${rep.id}`)}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" /> Ver Rendimiento
                                </Button>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
