import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, TrendingUp, Activity, Map,
    Clock, FileText, Globe, LayoutDashboard, ShoppingCart, CheckCircle,
    XCircle, RefreshCw,
    Search, Building2, Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
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
    master: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    admin: 'bg-rose-100 text-rose-700 border-rose-200',
    manager: 'bg-slate-800 text-white border-slate-700',
    coordinator: 'bg-blue-100 text-blue-700 border-blue-200',
    supervisor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    representative: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    doctor: 'bg-teal-50 text-teal-700 border-teal-200',
    pharmacist: 'bg-orange-50 text-orange-700 border-orange-200',
    service_chief: 'bg-violet-100 text-violet-700 border-violet-200',
    telemarketing: 'bg-pink-100 text-pink-700 border-pink-200'
};

export default function DashboardMaster() {
    // --- HOOKS ---
    const { user, role, isManager, isAdmin, isMaster, isSystemAdmin, isSupervisor, isCoordinator, loading: authLoading } = useAuth();
    const { organization } = useOrganization();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // --- ESTADO UI ---
    const [activeTab, setActiveTab] = useState('dashboard');

    // --- QUERY PARAMS ---
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const [filters, setFilters] = useState<AdminFilterState>({ region: "all", state: "all" });

    // --- QUERIES ---
    const { data: visitsDataObj, isLoading: loadingVisits } = useDashboardVisits(startOfMonth, filters);
    const { data: ordersData, isLoading: loadingOrders } = useDashboardOrders(startOfMonth, filters);
    const { data: profilesRoles, isLoading: loadingProfiles } = useDashboardProfilesRoles();
    const { data: zonesData, isLoading: loadingZones } = useDashboardZones();
    const { data: kpiDataRaw, isLoading: loadingKPIs } = useDashboardKPIs();
    const { data: pendingOrders = [], isLoading: loadingPending } = usePendingOrders(filters);
    const { data: droguerias = [], isLoading: loadingDroguerias } = useDashboardDroguerias();

    const loading = loadingVisits || loadingOrders || loadingProfiles || loadingZones || loadingKPIs || loadingPending || loadingDroguerias;

    // --- ESTADO DE GESTIÓN ---
    const [selectedRep, setSelectedRep] = useState<RepPerformance | null>(null);
    const [editRole, setEditRole] = useState<string>("");

    // Note: allZones was state, now derived from zonesData
    const allZones = zonesData || [];

    const [editZoneId, setEditZoneId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [openNewUser, setOpenNewUser] = useState(false);
    const [newUserLoading, setNewUserLoading] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        email: '', firstName: '', lastName: '', role: 'representative', zoneId: 'none'
    });

    // --- ESTADO PARA TRIANGULACIÓN COMERCIAL ---
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [selectedOrderForApproval, setSelectedOrderForApproval] = useState<string | null>(null);
    const [selectedDrogueriaId, setSelectedDrogueriaId] = useState<string>('');
    const [codigoPedidoExterno, setCodigoPedidoExterno] = useState('');
    const [notasTelemarketing, setNotasTelemarketing] = useState('');

    // --- DERIVED DATA (useMemo) ---
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
            acc[curr.user_id] = {
                role: curr.role,
                is_active: curr.is_active,
                zone_id: curr.zone_id,
                supervisor_id: curr.supervisor_id
            };
            return acc;
        }, {});

        // --- AGGREGATION LOGIC ---
        const repStatsMap: Record<string, RepPerformance> = {};
        profilesData?.forEach(p => {
            const roleInfo = roleDataMap[p.user_id];
            if (!isMaster && !roleInfo) return;

            repStatsMap[p.user_id] = {
                id: p.user_id,
                name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email,
                email: p.email,
                state: 'N/A', visits: 0, orders: 0, sales: 0, effectiveness: 0,
                role: roleInfo?.role || 'representative',
                is_active: roleInfo?.is_active ?? true,
                invitation_status: (p.invitation_status as 'pending' | 'active') || 'active',
                region: roleInfo?.zone_id ? zoneMap[roleInfo.zone_id] : 'N/A'
            };
        });

        visitsData?.forEach((v: any) => {
            if (repStatsMap[v.user_id]) {
                repStatsMap[v.user_id].visits++;
                if (v.contacts?.state) {
                    repStatsMap[v.user_id].state = v.contacts.state;
                    repStatsMap[v.user_id].region = getRegion(v.contacts.state);
                }
            }
        });

        ordersData?.forEach((o: any) => {
            if (repStatsMap[o.user_id]) {
                repStatsMap[o.user_id].orders++;
                repStatsMap[o.user_id].sales += (o.total || 0);
                if (o.contacts?.state) {
                    repStatsMap[o.user_id].state = o.contacts.state;
                    repStatsMap[o.user_id].region = getRegion(o.contacts.state);
                }
            }
        });

        const repsArray = Object.values(repStatsMap)
            .map(rep => ({
                ...rep,
                effectiveness: rep.visits > 0 ? (rep.orders / rep.visits) * 100 : 0
            }))
            .filter(rep => {
                const currentEmail = user?.email?.toLowerCase();
                const repEmail = rep.email.toLowerCase();

                if (user?.id && rep.id === user.id && !isMaster) return false;
                if (currentEmail && repEmail === currentEmail && !isMaster) return false;
                if (!isMaster && (repEmail.includes('demo') || rep.name.toLowerCase().includes('demo'))) return false;

                if (isMaster || isManager || isCoordinator) return true;

                const roleInfo = roleDataMap[rep.id];
                if (isSupervisor) {
                    const isMySubordinate = roleInfo?.supervisor_id === user?.id;
                    const isRepresentative = rep.role === 'representative';
                    return isMySubordinate && isRepresentative;
                }

                return rep.role === 'representative' || rep.role === 'coordinator';
            })
            .sort((a, b) => b.sales - a.sales);

        const regMap: Record<string, { sales: number, visits: number }> = {};
        repsArray.forEach(rep => {
            if (rep.region === 'N/A') return;
            if (!regMap[rep.region]) regMap[rep.region] = { sales: 0, visits: 0 };
            regMap[rep.region].sales += rep.sales;
            regMap[rep.region].visits += rep.visits;
        });

        const zoneStatsMap: Record<string, ZoneKPI> = {};
        (kpiDataRaw || []).forEach((k: any) => {
            zoneStatsMap[k.zone_name] = {
                estate: k.zone_name, region: k.zone_name, visit_count: 0, orders_count: k.total_orders || 0, sales_total: k.total_amount || 0
            };
        });

        visitsData?.forEach((v: any) => {
            const state = v.contacts?.state;
            if (state) {
                const regionName = getRegion(state);
                if (!zoneStatsMap[regionName]) {
                    zoneStatsMap[regionName] = { estate: regionName, region: regionName, visit_count: 0, orders_count: 0, sales_total: 0 };
                }
                zoneStatsMap[regionName].visit_count++;
            }
        });

        const finalZoneData = Object.values(zoneStatsMap);

        const newStats = {
            totalVisits: visitCount || 0,
            totalOrders: ordersData?.length || 0,
            totalSales: ordersData?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0,
            activeZones: finalZoneData.length || 0
        };

        const productCounts: Record<string, number> = {};
        const sampleCounts: Record<string, number> = {};
        visitsData?.forEach((v: any) => {
            if (Array.isArray(v.products_presented)) v.products_presented.forEach((p: string) => productCounts[p.trim()] = (productCounts[p.trim()] || 0) + 1);
            if (v.samples_delivered) {
                const samples = Array.isArray(v.samples_delivered) ? v.samples_delivered : v.samples_delivered.split(',').map((s: string) => s.trim());
                samples.forEach((s: string) => sampleCounts[s] = (sampleCounts[s] || 0) + 1);
            }
        });

        const getTop5 = (r: Record<string, number>) => Object.entries(r).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

        return {
            stats: newStats,
            repData: repsArray,
            regionStats: regMap,
            zoneData: finalZoneData,
            topProducts: getTop5(productCounts),
            topSamples: getTop5(sampleCounts)
        };

    }, [visitsDataObj, ordersData, profilesRoles, zonesData, kpiDataRaw, filters, loading, user, isMaster, isSupervisor]);


    const handleCreateUser = async () => {
        setNewUserLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email: newUserForm.email,
                    firstName: newUserForm.firstName,
                    lastName: newUserForm.lastName,
                    role: newUserForm.role,
                    zoneId: newUserForm.zoneId === 'none' ? null : newUserForm.zoneId,
                    organizationId: organization?.id
                }
            });

            if (error) throw error;

            toast({ title: "Invitación Enviada", description: `Se ha enviado un correo de acceso a ${newUserForm.email}.`, className: "bg-emerald-50 border-emerald-200 text-emerald-800" });
            setOpenNewUser(false);
            setNewUserForm({ email: '', firstName: '', lastName: '', role: 'representative', zoneId: 'none' });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } catch (err: any) {
            console.error("Error creating user:", err);
            toast({ title: "Error", description: err.message || "No se pudo enviar la invitación.", variant: "destructive" });
        } finally {
            setNewUserLoading(false);
        }
    };

    // --- LÓGICA: AUTH Y ACCESO ---
    useEffect(() => {
        const checkAccess = async () => {
            if (authLoading) return;
            if (!user || (!isManager && !isAdmin && !isMaster)) {
                toast({ title: "Acceso Restringido", description: "No tienes permisos para ver el Panel del Gerente.", variant: "destructive" });
                navigate("/");
                return;
            }
        };
        checkAccess();
    }, [user, isManager, isAdmin, isMaster, navigate, authLoading]);

    // --- ACCIONES: TRIANGULACIÓN COMERCIAL ---
    const handleOpenApprovalModal = (orderId: string, currentDrogueriaId?: string) => {
        setSelectedOrderForApproval(orderId);
        setSelectedDrogueriaId(currentDrogueriaId || '');
        setCodigoPedidoExterno('');
        setNotasTelemarketing('');
        setApprovalModalOpen(true);
    };

    const handleConfirmWithDistributor = async () => {
        if (!selectedOrderForApproval || !codigoPedidoExterno || !selectedDrogueriaId) {
            toast({ title: "Campos Requeridos", description: "Debes seleccionar una droguería e ingresar el código de pedido.", variant: "destructive" });
            return;
        }
        try {
            await dashboardService.confirmOrderWithDistributor(
                selectedOrderForApproval, selectedDrogueriaId, codigoPedidoExterno, notasTelemarketing
            );
            toast({ title: "✅ Pedido Confirmado", description: `Código: ${codigoPedidoExterno}`, className: "bg-emerald-50 border-emerald-200 text-emerald-800" });
            setApprovalModalOpen(false); setSelectedOrderForApproval(null);
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } catch (error) {
            console.error('Error confirming order:', error);
            toast({ title: "Error", description: "No se pudo confirmar el pedido.", variant: "destructive" });
        }
    };

    const handleRechazarPedido = async () => {
        if (!rejectId || !rejectReason) return;
        try {
            const { error } = await supabase.from('transfer_orders').update({
                status: 'rejected_by_distributor', notas_telemarketing: `Rechazado: ${rejectReason}`
            }).eq('id', rejectId);
            if (error) throw error;
            toast({ title: "Pedido Rechazado", description: "La droguería rechazó el pedido.", className: "bg-amber-50 border-amber-200 text-amber-800" });
            setRejectId(null); setRejectReason("");
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    };

    const handleUpdateRole = async () => {
        if (!selectedRep || !editRole) return;
        try {
            const { error } = await supabase.from('user_roles').upsert({
                user_id: selectedRep.id, role: editRole, zone_id: editZoneId, updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            if (error) throw error;
            toast({ title: "Perfil Actualizado", description: `El rol de ${selectedRep.name} ahora es ${editRole}.` });
            setSelectedRep(null); queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    };

    if (loading && !stats.totalVisits) return (
        <div className="flex items-center justify-center h-full min-h-[500px] bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <RefreshCw className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium">Sincronizando Centro de Mando...</p>
            </div>
        </div>
    );

    // --- UI HELPERS ---
    const getUserName = () => {
        const myProfile = profilesRoles?.profiles?.find(p => p.user_id === user?.id);
        if (myProfile?.first_name || myProfile?.last_name) {
            return `${myProfile.first_name || ''} ${myProfile.last_name || ''}`.trim();
        }
        if (user?.email) {
            return user.email.split('@')[0]
                .split(/[._]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
        return 'Usuario';
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 space-y-6">

            {/* HEADERS FILTER & ACTION */}
            <div className="flex flex-col gap-4 pt-4 px-1">
                <div className="flex justify-between items-start md:items-center">
                    <div className="flex flex-col space-y-1.5">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Centro de Mando</h2>
                        <p className="text-slate-500 dark:text-slate-400">Gestión estratégica y control operativo</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })} size="icon" variant="outline" className="text-slate-500 hover:text-blue-600 dark:bg-slate-800 dark:border-slate-700">
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </Button>
                    </div>
                </div>

                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-lg text-white shadow-md">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                        <div>
                            <h1 className="text-2xl font-bold">¡Bienvenido de vuelta, {getUserName()}!</h1>
                            <div className="flex items-center mt-1">
                                <Badge variant="secondary" className="bg-background text-foreground hover:bg-background/90 border-0">
                                    {isSystemAdmin ? 'System Admin' : (ROLE_LABELS[role] || role)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <p className="text-primary-foreground/80 mt-2">
                        Tienes {stats.activeZones} zonas activas y ${stats.totalSales.toLocaleString()} en ventas acumuladas este mes.
                    </p>
                </div>
            </div>

            <AdminDataFilter onFilterChange={setFilters} />

            <Tabs defaultValue="dashboard" className="w-full space-y-6" onValueChange={setActiveTab}>
                {/* TABS NAVIGATION */}
                <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-xl h-auto shadow-sm grid grid-cols-2 md:grid-cols-4 lg:inline-flex lg:w-auto gap-2">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all">
                        <LayoutDashboard size={18} /> Tablero
                    </TabsTrigger>
                    {/* Map tab removed to avoid conflict with main map module */}
                    <TabsTrigger value="pedidos" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg transition-all">
                        <ShoppingCart size={18} /> Pedidos
                        {pendingOrders.length > 0 && <span className="ml-2 bg-white text-violet-600 text-xs px-2 py-0.5 rounded-full font-bold">{pendingOrders.length}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="equipo" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg transition-all">
                        <Users size={18} /> Equipo
                    </TabsTrigger>
                </TabsList>
                {activeTab === 'equipo' && (
                    <div className="flex justify-end mt-4 px-1">
                        <Button onClick={() => setOpenNewUser(true)} className="bg-amber-500 hover:bg-amber-600">
                            <Users className="mr-2 h-4 w-4" /> Invitar Miembro
                        </Button>
                    </div>
                )}

                {/* VISTA DASHBOARD */}
                <TabsContent value="dashboard" className="space-y-6 animate-in fade-in duration-300">
                    {/* KPIS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard title="Ventas Totales" value={`$${stats.totalSales.toLocaleString()}`} icon={<TrendingUp />} color="emerald" />
                        <KPICard title="Visitas Médicas" value={stats.totalVisits} icon={<Activity />} color="blue" />
                        <KPICard title="Pedidos" value={stats.totalOrders} icon={<ShoppingCart />} color="violet" />
                        <KPICard title="Zonas Activas" value={stats.activeZones} icon={<Globe />} color="amber" />
                    </div>

                    {/* Resumen Regional */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(regionStats).map(([region, data]) => (
                            <Card key={region} className="bg-slate-50 border-slate-200 shadow-sm hover:shadow-md transition-all cursor-default">
                                <CardContent className="p-4 pt-5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{region}</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-lg font-bold text-slate-700">${data.sales.toLocaleString()}</p>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{data.visits} vts</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <CompetitivenessMonitor />
                    <AnalyticsCharts zoneData={zoneData} />
                </TabsContent>

                {/* VISTA PEDIDOS */}
                <TabsContent value="pedidos" className="space-y-4 animate-in fade-in duration-300">
                    <Card className="bg-slate-50 border-slate-200 shadow-sm">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Orden #</TableHead>
                                        <TableHead>Farmacia</TableHead>
                                        <TableHead>Representante</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-slate-400 bg-slate-50/20">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="bg-emerald-50 p-4 rounded-full mb-4">
                                                        <CheckCircle className="h-10 w-10 text-emerald-400" />
                                                    </div>
                                                    <p className="font-bold text-lg text-slate-600">¡Bandeja limpia!</p>
                                                    <p className="text-sm mt-1">No hay pedidos pendientes.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingOrders.map((order) => (
                                            <TableRow key={order.id} className="hover:bg-blue-50/30 transition group">
                                                <TableCell className="font-mono font-bold text-slate-700 bg-slate-100/50 rounded-sm">
                                                    {order.order_number}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-800">{order.pharmacy_name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{order.users?.first_name} {order.users?.last_name}</span>
                                                        <span className="text-[10px] text-slate-400">{order.users?.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-slate-800">
                                                    ${order.total?.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-9 w-9 border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                                                            onClick={() => handleOpenApprovalModal(order.id, (order as any).drogueria_sugerida_id)}
                                                            title="Gestionar con Droguería"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                        </Button>
                                                        <Button size="icon" variant="outline" className="h-9 w-9 border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white" onClick={() => setRejectId(order.id)}>
                                                            <XCircle className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* VISTA EQUIPO */}
                <TabsContent value="equipo" className="space-y-4 animate-in fade-in duration-300">
                    <Card className="bg-slate-50 border-slate-200 shadow-sm">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[50px] text-center">#</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Rol / Zona</TableHead>
                                        <TableHead className="text-center">Estado</TableHead>
                                        <TableHead className="text-right">Ventas</TableHead>
                                        <TableHead className="text-right">Efec.</TableHead>
                                        <TableHead className="text-center">Editar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {repData.filter(r => {
                                        if (filters.region && filters.region !== 'all' && r.region !== filters.region) return false;
                                        if (filters.state && filters.state !== 'all' && r.state !== filters.state) return false;
                                        if (filters.repId && filters.repId !== 'all' && r.id !== filters.repId) return false;
                                        return true;
                                    }).map((rep, idx) => (
                                        <TableRow key={rep.id} className="hover:bg-slate-50">
                                            <TableCell className="text-center font-bold text-slate-300">{idx + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">{rep.name}</span>
                                                    <span className="text-[10px] text-slate-400">{rep.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className={`w-fit text-[10px] ${ROLE_COLORS[rep.role || 'representative']}`}>
                                                        {ROLE_LABELS[rep.role || 'representative'] || 'Representante'}
                                                    </Badge>
                                                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1"><Globe className="h-3 w-3" /> {rep.region}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {rep.invitation_status === 'pending' ? (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                                                        Pendiente
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                        Activo
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">${rep.sales.toLocaleString()}</TableCell>
                                            <TableCell className="text-right"><span className={`font-bold ${rep.effectiveness > 50 ? 'text-emerald-600' : 'text-slate-400'}`}>{rep.effectiveness.toFixed(0)}%</span></TableCell>
                                            <TableCell className="text-center">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => { setSelectedRep(rep); setEditRole(rep.role || 'representative'); setEditZoneId(allZones.find(z => z.name === rep.region)?.id || null); }}>
                                                    <Search className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* --- MODALES --- */}

            <Dialog open={openNewUser} onOpenChange={setOpenNewUser}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Invitar Miembro al Equipo</DialogTitle><DialogDescription>Se enviará un correo electrónico con un enlace de acceso.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><label className="text-sm font-medium">Nombre</label><Input placeholder="Juan" value={newUserForm.firstName} onChange={e => setNewUserForm({ ...newUserForm, firstName: e.target.value })} /></div>
                            <div className="grid gap-2"><label className="text-sm font-medium">Apellido</label><Input placeholder="Pérez" value={newUserForm.lastName} onChange={e => setNewUserForm({ ...newUserForm, lastName: e.target.value })} /></div>
                        </div>
                        <div className="grid gap-2"><label className="text-sm font-medium">Email</label><Input type="email" placeholder="email@alphabmt.com" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} /></div>
                        <div className="grid gap-2"><label className="text-sm font-medium">Rol</label>
                            <Select value={newUserForm.role} onValueChange={val => setNewUserForm({ ...newUserForm, role: val })}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar Rol" /></SelectTrigger>
                                <SelectContent>{Object.entries(ROLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2"><label className="text-sm font-medium">Zona</label>
                            <Select value={newUserForm.zoneId} onValueChange={val => setNewUserForm({ ...newUserForm, zoneId: val })}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar Zona" /></SelectTrigger>
                                <SelectContent><SelectItem value="none">Sin Zona</SelectItem>{allZones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setOpenNewUser(false)}>Cancelar</Button><Button onClick={handleCreateUser} disabled={newUserLoading}>{newUserLoading ? 'Enviando Invitación...' : 'Enviar Invitación'}</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedRep} onOpenChange={(open) => !open && setSelectedRep(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Editar Rol de {selectedRep?.name}</DialogTitle><DialogDescription>Modifica el nivel de acceso y zona asignada.</DialogDescription></DialogHeader>
                    {selectedRep && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2"><label className="text-sm font-medium">Rol</label>
                                <Select value={editRole} onValueChange={setEditRole}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{Object.entries(ROLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2"><label className="text-sm font-medium">Zona asignada</label>
                                <Select value={editZoneId || "none"} onValueChange={v => setEditZoneId(v === "none" ? null : v)}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar Zona" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin zona</SelectItem>
                                        {allZones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter><Button onClick={handleUpdateRole}>Guardar Cambios</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-blue-600" /> Gestionar Transferencia</DialogTitle>
                        <DialogDescription>Confirma el pedido con el distribuidor externo</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><label className="text-sm font-medium flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-600" /> Droguería</label>
                            <Select value={selectedDrogueriaId} onValueChange={setSelectedDrogueriaId}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar droguería" /></SelectTrigger>
                                <SelectContent>{(droguerias || []).map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2"><label className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-green-600" /> Código Pedido Externo</label><Input placeholder="Ej: ORD-998877" value={codigoPedidoExterno} onChange={e => setCodigoPedidoExterno(e.target.value)} /></div>
                        <div className="grid gap-2"><label className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4 text-amber-600" /> Notas</label><Textarea placeholder="Observaciones..." value={notasTelemarketing} onChange={e => setNotasTelemarketing(e.target.value)} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApprovalModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmWithDistributor} className="bg-emerald-600 hover:bg-emerald-700"><Check className="h-4 w-4 mr-2" /> Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!rejectId} onOpenChange={open => !open && setRejectId(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="text-rose-600">Rechazar Pedido</DialogTitle><DialogDescription>Indica el motivo del rechazo.</DialogDescription></DialogHeader>
                    <div className="py-4"><Textarea placeholder="Motivo del rechazo (ej: Sin stock, cliente moroso...)" value={rejectReason} onChange={e => setRejectReason(e.target.value)} /></div>
                    <DialogFooter><Button variant="outline" onClick={() => setRejectId(null)}>Cancelar</Button><Button variant="destructive" onClick={handleRechazarPedido}>Rechazar Pedido</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function KPICard({ title, value, icon, color }: any) {
    const colors: any = {
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        violet: "text-violet-600 bg-violet-50 border-violet-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
    };
    return (
        <Card className={`border-l-4 shadow-sm bg-white dark:bg-slate-900 ${color === 'emerald' ? 'border-l-emerald-500' : color === 'blue' ? 'border-l-blue-500' : color === 'violet' ? 'border-l-violet-500' : 'border-l-amber-500'}`}>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                    <p className={`text-2xl font-bold ${color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : color === 'blue' ? 'text-blue-600 dark:text-blue-400' : color === 'violet' ? 'text-violet-600 dark:text-violet-400' : 'text-amber-600 dark:text-amber-400'}`}>{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : color === 'violet' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}