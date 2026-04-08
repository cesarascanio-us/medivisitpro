/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect, useMemo, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, TrendingUp, Activity, 
    Clock, FileText, Globe, LayoutDashboard, ShoppingCart, CheckCircle,
    XCircle, RefreshCw, Search, Building2, Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { dashboardService } from "@/services/dashboardService";
import {
    useDashboardVisits, useDashboardOrders, useDashboardProfilesRoles,
    useDashboardZones, useDashboardKPIs, usePendingOrders, useDashboardDroguerias
} from "@/hooks/queries/useDashboardQueries";
import { useQueryClient } from "@tanstack/react-query";
import { getRegion } from "@/utils/regions";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CompetitivenessMonitor } from "@/components/dashboard/CompetitivenessMonitor";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { AdminDataFilter, AdminFilterState } from "@/components/admin/AdminDataFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";

// --- TIPOS DE DATOS ---
interface KPIStats {
    totalVisits: number;
    totalOrders: number;
    totalSales: number;
    activeZones: number;
}

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

// --- CONSTANTES ---
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
    master: 'text-primary border-primary/20 bg-primary/5',
    admin: 'text-rose-600 border-rose-200 bg-rose-50',
    manager: 'text-slate-600 border-slate-200 bg-slate-50',
    coordinator: 'text-blue-600 border-blue-200 bg-blue-50',
    supervisor: 'text-cyan-600 border-cyan-200 bg-cyan-50',
    representative: 'text-emerald-600 border-emerald-200 bg-emerald-50',
    doctor: 'text-teal-600 border-teal-200 bg-teal-50',
    pharmacist: 'text-orange-600 border-orange-200 bg-orange-50',
    service_chief: 'text-violet-600 border-violet-200 bg-violet-50',
    telemarketing: 'text-pink-600 border-pink-200 bg-pink-50'
};

export default function DashboardMaster() {
    const { user, role, isManager, isAdmin, isMaster, isSystemAdmin, isSupervisor, isCoordinator, loading: authLoading } = useAuth();
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

    const [selectedRep, setSelectedRep] = useState<RepPerformance | null>(null);
    const [editRole, setEditRole] = useState<string>("");
    const allZones = zonesData || [];
    const [editZoneId, setEditZoneId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [openNewUser, setOpenNewUser] = useState(false);
    const [newUserLoading, setNewUserLoading] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        email: '', firstName: '', lastName: '', role: 'representative', zoneId: 'none'
    });

    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [selectedOrderForApproval, setSelectedOrderForApproval] = useState<string | null>(null);
    const [selectedDrogueriaId, setSelectedDrogueriaId] = useState<string>('');
    const [codigoPedidoExterno, setCodigoPedidoExterno] = useState('');
    const [notasTelemarketing, setNotasTelemarketing] = useState('');

    const { stats, repData, regionStats, zoneData } = useMemo(() => {
        const initial = {
            stats: { totalVisits: 0, totalOrders: 0, totalSales: 0, activeZones: 0 },
            repData: [] as RepPerformance[],
            regionStats: {} as Record<string, { sales: number, visits: number }>,
            zoneData: [] as ZoneKPI[],
            topProducts: [] as ItemStat[],
            topSamples: [] as ItemStat[]
        };

        if (loading) return initial;

        const visitsData = visitsDataObj?.data || [];
        const visitCount = visitsDataObj?.count || 0;
        const profilesData = profilesRoles?.profiles || [];
        const rolesData = profilesRoles?.roles || [];
        const zoneMap = (zonesData || []).reduce((acc: any, curr: any) => { acc[curr.id] = curr.name; return acc; }, {});

        const roleDataMap = (rolesData || []).reduce((acc: any, curr: any) => {
            acc[curr.user_id] = { role: curr.role, is_active: curr.is_active, zone_id: curr.zone_id, supervisor_id: curr.supervisor_id };
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
            repData: repsArray, regionStats: regMap, zoneData: finalZoneData, topProducts: [], topSamples: []
        };
    }, [visitsDataObj, ordersData, profilesRoles, zonesData, kpiDataRaw, loading, isMaster, user]);

    const handleCreateUser = async () => {
        setNewUserLoading(true);
        try {
            await supabase.functions.invoke('invite-user', { body: { email: newUserForm.email, firstName: newUserForm.firstName, lastName: newUserForm.lastName, role: newUserForm.role, zoneId: newUserForm.zoneId === 'none' ? null : newUserForm.zoneId, organizationId: organization?.id } });
            toast({ title: "Invitación Enviada" });
            setOpenNewUser(false);
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); } finally { setNewUserLoading(false); }
    };

    useEffect(() => { if (!authLoading && (!user || (!isManager && !isAdmin && !isMaster))) { navigate("/"); } }, [user, isManager, isAdmin, isMaster, navigate, authLoading]);

    const handleConfirmWithDistributor = async () => {
        if (!selectedOrderForApproval || !codigoPedidoExterno || !selectedDrogueriaId) return;
        try {
            await dashboardService.confirmOrderWithDistributor(selectedOrderForApproval, selectedDrogueriaId, codigoPedidoExterno, notasTelemarketing);
            toast({ title: "✅ Pedido Confirmado" });
            setApprovalModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    };

    if (loading && !stats.totalVisits) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white space-y-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center border border-primary/10 shadow-inner">
                <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div className="text-slate-900 font-black uppercase tracking-[0.4em] animate-pulse font-display">Sincronizando Centro de Mando</div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-background space-y-6">
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
                            variant="ghost" 
                            className="h-14 w-14 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:shadow-premium-sm transition-all"
                        >
                            <RefreshCw className={cn("h-6 w-6", loading && "animate-spin")} />
                        </Button>
                    </div>
                }
            />

            <AdminDataFilter onFilterChange={setFilters} />

            <Tabs defaultValue="dashboard" className="w-full space-y-6" onValueChange={setActiveTab}>
                <div className="flex justify-start px-2">
                    <TabsList className="bg-slate-50 border border-slate-100 p-1.5 rounded-2xl h-auto flex flex-nowrap gap-2 shadow-inner">
                        <TabsTrigger 
                            value="dashboard" 
                            className="flex items-center gap-3 px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-premium-sm rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border-none group"
                        >
                            <LayoutDashboard size={16} strokeWidth={3} className="text-slate-300 group-data-[state=active]:text-primary" /> TABLERO
                        </TabsTrigger>
                        
                        <TabsTrigger 
                            value="pedidos" 
                            className="flex items-center gap-3 px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-rose-500 data-[state=active]:shadow-premium-sm rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border-none text-slate-400 group"
                        >
                            <ShoppingCart size={16} strokeWidth={3} className="group-data-[state=active]:text-rose-500" /> PEDIDOS
                            {pendingOrders.length > 0 && (
                                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">{pendingOrders.length}</span>
                            )}
                        </TabsTrigger>
 
                        <TabsTrigger 
                            value="equipo" 
                            className="flex items-center gap-3 px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-premium-sm rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border-none text-slate-400 group"
                        >
                            <Users size={16} strokeWidth={3} className="group-data-[state=active]:text-amber-600" /> EQUIPO
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="dashboard" className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    {/* KPI STRIP - SIN FONDOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <EliteKPICard 
                            title="Ventas Totales" 
                            value={`$${stats.totalSales.toLocaleString()}`} 
                            subtitle="Facturación acumulada"
                            icon={TrendingUp}
                            color="emerald"
                        />
                        <EliteKPICard 
                            title="Visitas Médicas" 
                            value={stats.totalVisits.toString()} 
                            subtitle="Actividad de campo"
                            icon={Activity}
                            color="indigo"
                        />
                        <EliteKPICard 
                            title="Pedidos" 
                            value={stats.totalOrders.toString()} 
                            subtitle="Órdenes procesadas"
                            icon={ShoppingCart}
                            color="indigo"
                        />
                        <EliteKPICard 
                            title="Detección Zonas" 
                            value={stats.activeZones.toString()} 
                            subtitle="Zonas activas en radar"
                            icon={Globe}
                            color="amber"
                        />
                    </div>
                    <CompetitivenessMonitor />
                    <AnalyticsCharts zoneData={zoneData} />
                </TabsContent>

                <TabsContent value="pedidos" className="space-y-4 animate-in slide-in-from-right-10 duration-500">
                    <Card className="border border-slate-100 bg-white shadow-premium-sm rounded-[2.5rem] overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow className="border-slate-100">
                                    <TableHead className="py-6 pl-10 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Orden de Manifiesto</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Entrada / Punto de Venta</TableHead>
                                    <TableHead className="text-right pr-10 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Monto Proyectado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingOrders.map(order => (
                                    <TableRow key={order.id} className="hover:bg-slate-50 transition-all border-slate-50">
                                        <TableCell className="pl-10 py-6 font-black text-slate-900 font-display text-base tracking-tight uppercase">{order.order_number}</TableCell>
                                        <TableCell className="font-bold text-slate-500 uppercase text-[10px] tracking-tight">{order.pharmacy_name}</TableCell>
                                        <TableCell className="text-right pr-10 font-black text-slate-900 font-display text-lg">${order.total?.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="equipo" className="animate-in slide-in-from-left-10 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {repData.map(rep => (
                            <Card key={rep.id} className="border border-slate-100 bg-white shadow-premium-sm p-8 rounded-[2.5rem] group hover:shadow-premium-md transition-all duration-300">
                                <div className="flex justify-between items-start mb-6">
                                     <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 transition-transform group-hover:scale-110">
                                         <Users className="text-amber-500 h-8 w-8" />
                                     </div>
                                     <Badge className={cn("px-4 py-1.5 font-black text-[9px] uppercase border tracking-widest rounded-full", ROLE_COLORS[rep.role || 'representative'])}>{ROLE_LABELS[rep.role || 'representative']}</Badge>
                                </div>
                                <h3 className="font-black text-slate-900 text-lg uppercase mb-1 font-display tracking-tight group-hover:text-primary transition-colors">{rep.name}</h3>
                                <p className="text-[10px] text-slate-400 mb-6 font-bold uppercase tracking-widest">{rep.email}</p>
                                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                    <div className="flex flex-col">
                                         <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Ventas Período</span>
                                         <p className="text-xl font-black text-emerald-500 font-display tracking-tighter">${rep.sales.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                         <p className="text-lg font-black text-slate-900 font-display tracking-tighter">{rep.effectiveness.toFixed(0)}%</p>
                                         <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Eficacia</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function KPICard({ title, value, icon, color }: any) {
    const colors: any = {
        emerald: "text-emerald-500",
        blue: "text-blue-500",
        violet: "text-violet-500",
        amber: "text-amber-500"
    };
    return (
        <Card className="border border-slate-100 bg-white shadow-premium-sm rounded-[2.5rem] hover:shadow-premium-md transition-all group overflow-hidden">
            <CardContent className="p-10 flex items-center justify-between relative">
                <div className={cn("absolute -right-4 -bottom-4 opacity-[0.03] transition-transform group-hover:scale-110", colors[color])}>
                     {cloneElement(icon, { size: 120, strokeWidth: 1 })}
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 font-display">{title}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums font-display leading-none">{value}</p>
                </div>
                <div className={cn("h-14 w-14 flex items-center justify-center shrink-0 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner group-hover:bg-white transition-all relative z-10", colors[color])}>
                    {cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
                </div>
            </CardContent>
        </Card>
    );
}
