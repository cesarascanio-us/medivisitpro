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
    master: 'text-indigo-400 border-indigo-500/30',
    admin: 'text-rose-400 border-rose-500/30',
    manager: 'text-slate-300 border-slate-700',
    coordinator: 'text-blue-400 border-blue-500/30',
    supervisor: 'text-cyan-400 border-cyan-500/30',
    representative: 'text-emerald-400 border-emerald-500/30',
    doctor: 'text-teal-400 border-teal-500/30',
    pharmacist: 'text-orange-400 border-orange-500/30',
    service_chief: 'text-violet-400 border-violet-500/30',
    telemarketing: 'text-pink-400 border-pink-500/30'
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

    if (loading && !stats.totalVisits) return <div className="h-screen flex items-center justify-center bg-background text-primary font-black uppercase tracking-widest animate-pulse">Sincronizando Centro de Mando...</div>;

    return (
        <div className="flex flex-col h-full bg-background space-y-6">
            {/* Header Industrial Elite */}
            <header className="bg-card px-8 py-10 rounded-[3rem] border border-border shadow-soft relative overflow-hidden mx-1 -mt-2">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <LayoutDashboard className="text-primary h-14 w-14" />
                        <div>
                            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Malla de Control Operativa</p>
                            <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Centro de Mando</h1>
                            <div className="flex items-center gap-3 mt-3">
                                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest italic">{ROLE_LABELS[role] || 'Acceso Maestro'}</Badge>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30 border border-border">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Core Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })} size="icon" variant="ghost" className="h-14 w-14 rounded-full hover:bg-primary/10 hover:text-primary transition-all"><RefreshCw className={cn("h-6 w-6", loading && "animate-spin")} /></Button>
                    </div>
                </div>
            </header>

            <AdminDataFilter onFilterChange={setFilters} />

            <Tabs defaultValue="dashboard" className="w-full space-y-6" onValueChange={setActiveTab}>
                {/* TABS NAVIGATION - INDUSTRIAL CAPSULE DESIGN (ULTRA LIGHT ADAPTATIVE) */}
                <div className="flex justify-start px-2">
                    <TabsList className="bg-muted/50 dark:bg-slate-900/60 border border-border/50 p-1.5 rounded-full h-auto flex flex-nowrap gap-2 shadow-sm backdrop-blur-md">
                        <TabsTrigger 
                            value="dashboard" 
                            className="flex items-center gap-2.5 px-7 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest border-none group"
                        >
                            <LayoutDashboard size={16} strokeWidth={3} className="text-indigo-600 group-data-[state=active]:text-white" /> TABLERO
                        </TabsTrigger>
                        
                        <TabsTrigger 
                            value="pedidos" 
                            className="flex items-center gap-3 px-7 py-2.5 data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest border-none text-rose-600 group"
                        >
                            <ShoppingCart size={16} strokeWidth={3} className="group-data-[state=active]:text-white" /> PEDIDOS
                            {pendingOrders.length > 0 && (
                                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">{pendingOrders.length}</span>
                            )}
                        </TabsTrigger>

                        <TabsTrigger 
                            value="equipo" 
                            className="flex items-center gap-3 px-7 py-2.5 data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest border-none text-amber-600 group"
                        >
                            <Users size={16} strokeWidth={3} className="group-data-[state=active]:text-white" /> EQUIPO
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="dashboard" className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    {/* KPI STRIP - SIN FONDOS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <KPICard title="Ventas Totales" value={`$${stats.totalSales.toLocaleString()}`} icon={<TrendingUp />} color="emerald" />
                        <KPICard title="Visitas Médicas" value={stats.totalVisits} icon={<Activity />} color="blue" />
                        <KPICard title="Pedidos" value={stats.totalOrders} icon={<ShoppingCart />} color="violet" />
                        <KPICard title="Detección Zonas" value={stats.activeZones} icon={<Globe />} color="amber" />
                    </div>
                    <CompetitivenessMonitor />
                    <AnalyticsCharts zoneData={zoneData} />
                </TabsContent>

                <TabsContent value="pedidos" className="space-y-4 animate-in slide-in-from-right-10 duration-500">
                    <Card className="border-none bg-card shadow-soft rounded-[2rem] overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/5">
                                <TableRow className="border-none">
                                    <TableHead className="py-6 pl-8 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Orden</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Farmacia / Punto</TableHead>
                                    <TableHead className="text-right pr-8 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Monto Nucleo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingOrders.map(order => (
                                    <TableRow key={order.id} className="hover:bg-muted/5 transition-all">
                                        <TableCell className="pl-8 py-5 font-black text-foreground font-mono">{order.order_number}</TableCell>
                                        <TableCell className="font-bold text-muted-foreground uppercase text-xs">{order.pharmacy_name}</TableCell>
                                        <TableCell className="text-right pr-8 font-black text-foreground">${order.total?.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="equipo" className="animate-in slide-in-from-left-10 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {repData.map(rep => (
                            <Card key={rep.id} className="border-none bg-card shadow-soft p-6 rounded-[2rem] group hover:scale-[1.02] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                     <Users className="text-amber-500 h-10 w-10" />
                                     <Badge className={cn("px-3 py-1 font-black text-[9px] uppercase border", ROLE_COLORS[rep.role || 'representative'])}>{ROLE_LABELS[rep.role || 'representative']}</Badge>
                                </div>
                                <h3 className="font-black text-foreground text-base uppercase mb-1">{rep.name}</h3>
                                <p className="text-[10px] text-muted-foreground mb-4 font-mono tracking-tighter">{rep.email}</p>
                                <div className="pt-4 border-t border-border flex justify-between items-center">
                                    <p className="text-sm font-black text-emerald-500 tabular-nums">${rep.sales.toLocaleString()}</p>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">{rep.effectiveness.toFixed(0)}% Eficacia</p>
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
        <Card className="border-none bg-card shadow-soft rounded-[2rem] hover:shadow-xl transition-all">
            <CardContent className="p-8 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{title}</p>
                    <p className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{value}</p>
                </div>
                <div className={cn("h-12 w-12 flex items-center justify-center pt-1", colors[color])}>
                    {cloneElement(icon, { size: 40, strokeWidth: 2.5 })}
                </div>
            </CardContent>
        </Card>
    );
}