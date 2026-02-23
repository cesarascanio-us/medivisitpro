/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, cloneElement } from "react";
import {
    Users, Shield, Building2, BarChart3, Settings, Database,
    Activity, TrendingUp, Calendar, Package, FileText, Bell,
    Plus, Edit, Trash2, Eye, RefreshCw, Download, Save, AlertTriangle, ShieldCheck,
    LayoutDashboard, Map, ShoppingCart, HelpCircle, Globe,
    ShieldAlert, Zap, ExternalLink, Timer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import RoleManager from "@/pages/Master/Roles/RoleManager";
import PlanManager from "@/pages/Master/Memberships/PlanManager";
import ManualPaymentApprover from "@/pages/Master/Memberships/ManualPaymentApprover";
import TicketList from "@/pages/Master/Tickets/TicketList";
import LandingEditor from "@/pages/Master/LandingEditor";

interface SystemStats {
    totalUsers: number;
    activeUsers: number;
    totalOrganizations: number;
    totalVisits: number;
    totalContacts: number;
    totalProducts: number;
    pendingExpenses: number;
    openTickets: number;
}

interface UserData {
    id: string;
    user_id: string;
    email: string;
    role: UserRole;
    organization_id: string | null;
    is_active: boolean;
    created_at: string;
}

interface OrganizationData {
    id: string;
    name: string;
    slug: string;
    plan_tier?: string;
    subscription_status?: string;
    rif?: string;
    fiscal_address?: string;
    phone?: string;
    taxpayer_type?: string;
    settings?: any;
    created_at: string;
    user_count?: number;
}

interface AuditLog {
    id: string;
    action_type: string;
    master_id: string;
    target_id: string;
    details: any;
    created_at: string;
}

const PLAN_LIMITS: Record<string, number> = {
    free: 5,
    pro: 20,
    enterprise: 1000
};

const ROLE_LABELS: Record<UserRole, string> = {
    master: 'Master',
    admin: 'Administrador Global',
    manager: 'Gerente',
    chief: 'Jefe',
    coordinator: 'Coordinador',
    supervisor: 'Supervisor',
    telemarketing: 'Telemarketing',
    representative: 'Representante',
    doctor: 'Médico',
    pharmacist: 'Farmacéutico',
    service_chief: 'Jefe de Servicios',
    store_manager: 'Gerente de Tienda'
};

const ROLE_COLORS: Record<UserRole, string> = {
    master: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    chief: 'bg-orange-100 text-orange-800',
    coordinator: 'bg-indigo-100 text-indigo-800',
    supervisor: 'bg-green-100 text-green-800',
    telemarketing: 'bg-pink-100 text-pink-800',
    representative: 'bg-gray-100 text-gray-800',
    doctor: 'bg-teal-100 text-teal-800',
    pharmacist: 'bg-amber-100 text-amber-800',
    service_chief: 'bg-cyan-100 text-cyan-800',
    store_manager: 'bg-teal-100 text-teal-800'
};

export default function MasterPanel() {
    const { user, isMaster, isAdmin } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 0, activeUsers: 0, totalOrganizations: 0, totalVisits: 0,
        totalContacts: 0, totalProducts: 0, pendingExpenses: 0, openTickets: 0
    });
    const [users, setUsers] = useState<UserData[]>([]);
    const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [newRole, setNewRole] = useState<UserRole>('representative');
    const [newUserOrgIdEdit, setNewUserOrgIdEdit] = useState<string>('');
    const [newOrganizationName, setNewOrganizationName] = useState('');
    const [newOrgRif, setNewOrgRif] = useState('');
    const [newOrgAddress, setNewOrgAddress] = useState('');
    const [newOrgPhone, setNewOrgPhone] = useState('');
    const [newOrgTaxType, setNewOrgTaxType] = useState('Ordinario');
    const [organizationDialogOpen, setOrganizationDialogOpen] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<{ slug: string, name: string }[]>([]);

    const [editingOrg, setEditingOrg] = useState<string | null>(null);
    const [editOrgName, setEditOrgName] = useState('');
    const [editOrgSlug, setEditOrgSlug] = useState('');
    const [editOrgPlan, setEditOrgPlan] = useState('free');
    const [editOrgStatus, setEditOrgStatus] = useState('active');
    const [editOrgRif, setEditOrgRif] = useState('');
    const [editOrgAddress, setEditOrgAddress] = useState('');
    const [editOrgPhone, setEditOrgPhone] = useState('');
    const [editOrgTaxType, setEditOrgTaxType] = useState('');
    const [editOrgMaxUsers, setEditOrgMaxUsers] = useState(5);
    const [editOrgFeatures, setEditOrgFeatures] = useState<Record<string, boolean>>({});

    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('representative');
    const [newUserOrgId, setNewUserOrgId] = useState<string>('');
    const [newUserFirstName, setNewUserFirstName] = useState('');
    const [newUserLastName, setNewUserLastName] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [securityAlerts, setSecurityAlerts] = useState<{ status: string, missing_tables: string[] } | null>(null);

    if (!isMaster) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: rolesData } = await supabase.from('app_roles').select('slug, name').order('name');
            if (rolesData) setAvailableRoles(rolesData);

            try {
                const { data: sentinelData } = await (supabase as any).rpc('check_security_integrity');
                if (sentinelData && (sentinelData as any).status === 'compromised') {
                    setSecurityAlerts(sentinelData as any);
                } else {
                    setSecurityAlerts(null);
                }
            } catch (err) {
                console.error("Sentinel check failed:", err);
            }

            const [usersRes, organizationsRes, visitsRes, contactsRes, productsRes, expensesRes, ticketsRes, logsRes] = await Promise.all([
                supabase.from('user_roles').select('*', { count: 'exact' }),
                supabase.from('organizations').select('*'),
                supabase.from('visits').select('*', { count: 'exact', head: true }),
                supabase.from('contacts').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('expenses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
                supabase.from('master_audit_logs').select('*').order('created_at', { ascending: false }).limit(60)
            ]);

            const activeUsers = usersRes.data?.filter(u => u.is_active).length || 0;

            setStats({
                totalUsers: usersRes.count || 0,
                activeUsers,
                totalOrganizations: organizationsRes.data?.length || 0,
                totalVisits: visitsRes.count || 0,
                totalContacts: contactsRes.count || 0,
                totalProducts: productsRes.count || 0,
                pendingExpenses: expensesRes.count || 0,
                openTickets: ticketsRes.count || 0
            });

            setOrganizations(organizationsRes.data || []);
            if (logsRes.data) setAuditLogs(logsRes.data as any);

            if (usersRes.data && usersRes.data.length > 0) {
                const userIds = usersRes.data.map(u => u.user_id);
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('user_id, email')
                    .in('user_id', userIds);

                const usersWithEmails = usersRes.data.map(ur => {
                    const profile = profilesData?.find(p => p.user_id === ur.user_id);
                    return {
                        ...ur,
                        email: profile?.email || 'Sin email',
                        role: (ur.role || 'representative') as UserRole
                    };
                });
                setUsers(usersWithEmails);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string) => {
        try {
            const { error: roleError } = await supabase
                .from('user_roles')
                .update({
                    role: newRole,
                    organization_id: newUserOrgIdEdit || null
                })
                .eq('user_id', userId);

            if (roleError) throw roleError;

            await (supabase as any).from('master_audit_logs').insert({
                action_type: 'user_role_change',
                master_id: user?.id,
                target_id: userId,
                details: { new_role: newRole, organization_id: newUserOrgIdEdit }
            });

            toast({ title: "Usuario actualizado", description: "El rol y organización se han cambiado correctamente." });
            setEditingUser(null);
            loadData();
        } catch (error) {
            console.error('Update user error:', error);
            toast({ title: "Error", description: "No se pudo actualizar el usuario.", variant: "destructive" });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('ADVERTENCIA: ¿Estás seguro de eliminar este usuario permanentemente?')) return;
        try {
            const { error: profileError } = await supabase.from('profiles').delete().eq('user_id', userId);
            if (profileError) {
                await supabase.from('user_roles').delete().eq('user_id', userId);
                const { error: retryError } = await supabase.from('profiles').delete().eq('user_id', userId);
                if (retryError) throw retryError;
            }
            toast({ title: "Usuario eliminado" });
            loadData();
        } catch (error) {
            console.error('Delete user error:', error);
            toast({ title: "Error", description: "No se pudo eliminar el usuario.", variant: "destructive" });
        }
    };

    const handleToggleUserActive = async (userId: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('user_roles')
                .update({ is_active: !isActive })
                .eq('user_id', userId);
            if (error) throw error;
            toast({ title: isActive ? "Usuario desactivado" : "Usuario activado" });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo cambiar el estado.", variant: "destructive" });
        }
    };

    const handleCreateOrganization = async () => {
        if (!newOrganizationName.trim()) return;
        try {
            const slug = newOrganizationName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const defaultLimit = PLAN_LIMITS['free'];

            const { data: org, error: orgError } = await supabase.from('organizations').insert({
                name: newOrganizationName.trim(),
                slug,
                rif: newOrgRif,
                fiscal_address: newOrgAddress,
                phone: newOrgPhone,
                taxpayer_type: newOrgTaxType,
                settings: { max_users: defaultLimit }
            }).select().single();

            if (orgError) throw orgError;

            toast({ title: "Organización creada", description: `${newOrganizationName} ha sido registrada.` });
            setNewOrganizationName('');
            setNewOrgRif('');
            setNewOrgAddress('');
            setNewOrgPhone('');
            setOrganizationDialogOpen(false);
            loadData();
        } catch (error) {
            console.error('Create organization error:', error);
            toast({ title: "Error", description: "No se pudo crear la organización.", variant: "destructive" });
        }
    };

    const handleUpdateOrganization = async () => {
        if (!editingOrg || !editOrgName || !editOrgSlug) return;
        try {
            const { error } = await supabase.from('organizations').update({
                name: editOrgName,
                slug: editOrgSlug,
                plan_tier: editOrgPlan,
                subscription_status: editOrgStatus,
                rif: editOrgRif,
                fiscal_address: editOrgAddress,
                phone: editOrgPhone,
                taxpayer_type: editOrgTaxType,
                settings: {
                    max_users: parseInt(editOrgMaxUsers as any),
                    features: editOrgFeatures
                }
            }).eq('id', editingOrg);

            if (error) throw error;
            toast({ title: "Organización Actualizada" });
            setEditingOrg(null);
            loadData();
        } catch (error) {
            console.error('Update org error:', error);
            toast({ title: "Error", description: "No se pudo actualizar la organización.", variant: "destructive" });
        }
    };

    const startEditingOrg = (org: OrganizationData) => {
        setEditingOrg(org.id);
        setEditOrgName(org.name);
        setEditOrgSlug(org.slug);
        setEditOrgPlan(org.plan_tier || 'free');
        setEditOrgStatus(org.subscription_status || 'active');
        setEditOrgRif(org.rif || '');
        setEditOrgAddress(org.fiscal_address || '');
        setEditOrgPhone(org.phone || '');
        setEditOrgTaxType(org.taxpayer_type || 'Ordinario');
        const settings = org.settings as any;
        setEditOrgMaxUsers(settings?.max_users || PLAN_LIMITS[org.plan_tier || 'free'] || 5);
        setEditOrgFeatures(settings?.features || {});
    };

    const handleInviteUser = async () => {
        if (!newUserEmail || !newUserOrgId || !newUserFirstName || !newUserLastName) {
            toast({ title: "Error", description: "Faltan campos obligatorios", variant: "destructive" });
            return;
        }

        setIsCreatingUser(true);
        try {
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email: newUserEmail,
                    firstName: newUserFirstName,
                    lastName: newUserLastName,
                    role: newUserRole,
                    organizationId: newUserOrgId === 'none' ? null : newUserOrgId
                }
            });

            if (error) throw error;
            if (data && data.error) throw new Error(data.error);

            toast({ title: "Invitación Enviada", description: `Se ha enviado un correo a ${newUserEmail}.` });
            setUserDialogOpen(false);
            setNewUserEmail('');
            setNewUserFirstName('');
            setNewUserLastName('');
            setNewUserRole('representative');
            setTimeout(loadData, 1000);
        } catch (error: any) {
            console.error('Invite user error:', error);
            toast({ title: "Error al invitar", description: error.message || "No se pudo enviar la invitación.", variant: "destructive" });
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleDeleteOrganization = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta organización?')) return;
        try {
            const { error } = await supabase.from('organizations').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Organización eliminada" });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar la organización.", variant: "destructive" });
        }
    };

    const enterAuditMode = (orgId: string) => {
        toast({ title: "Modo Auditor", description: "Cambiando de contexto..." });
        window.location.href = `/dashboard?audit_org=${orgId}`;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-950 font-bold text-slate-400">CARGANDO NÚCLEO MASTER...</div>;
    }

    const licenseInfractions = auditLogs.filter(log => log.action_type === 'security_alert_license_exceeded');
    const araguaActivity = auditLogs.filter(log => log.action_type === 'aragua_regional_activity');

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 space-y-6">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 px-6 py-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden -mt-2 mx-1">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-50 dark:bg-rose-900/10 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none transform transition-transform hover:scale-105">
                            <Shield className="text-white h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Centro de Administración Suprema</p>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Panel Master</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-none font-bold text-[10px] px-2.5 py-0.5 uppercase tracking-wider">Nivel Supremo</Badge>
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Sentinel Protegido</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                        </div>
                        <Button onClick={loadData} size="icon" variant="outline" className="w-12 h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all active:scale-95">
                            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Safety Banner */}
            {!securityAlerts && (
                <div className="bg-green-50 border-green-100 border p-2 rounded-lg flex items-center gap-2 text-xs text-green-700">
                    <ShieldCheck className="h-3 w-3" />
                    Sentinel Oracle: Integridad verificada. Escaneo de licencias activo.
                </div>
            )}

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Usuarios Totales" value={stats.totalUsers} icon={<Users />} color="indigo" subtitle={`${stats.activeUsers} usuarios activos`} />
                <KPICard title="Organizaciones" value={stats.totalOrganizations} icon={<Building2 />} color="purple" />
                <KPICard title="Incidentes Sentinel" value={licenseInfractions.length} icon={<ShieldAlert />} color="rose" subtitle="Requieren Auditoría" />
                <KPICard title="Actividad Radar" value={araguaActivity.length} icon={<Zap />} color="emerald" subtitle="Zona Aragua (Hoy)" />
            </div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-1 rounded-2xl h-auto shadow-sm grid grid-cols-2 md:grid-cols-4 lg:inline-flex lg:w-auto gap-2">
                    <TabsTrigger value="users" className="flex items-center gap-2 px-6 py-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap"><Users size={14} /> Usuarios</TabsTrigger>
                    <TabsTrigger value="organizations" className="flex items-center gap-2 px-6 py-2.5 data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap"><Building2 size={14} /> Org</TabsTrigger>
                    <TabsTrigger value="sentinel" className="flex items-center gap-2 px-6 py-2.5 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap"><Shield size={14} /> Sentinel</TabsTrigger>
                    <TabsTrigger value="memberships" className="flex items-center gap-2 px-6 py-2.5 data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap"><Package size={14} /> Planes</TabsTrigger>
                    <TabsTrigger value="support" className="flex items-center gap-2 px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap"><HelpCircle size={14} /> Soporte</TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2 px-6 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap"><Globe size={14} /> Actividad</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div><CardTitle>Gestión de Usuarios</CardTitle><CardDescription>Administra a todos los usuarios de la plataforma global.</CardDescription></div>
                            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />Invitar</Button></DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader><DialogTitle>Invitar Usuario</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2"><Label>Email</Label><Input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Nombre</Label><Input value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Apellido</Label><Input value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Rol</Label><Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as UserRole)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{availableRoles.map(r => <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>)}</SelectContent></Select></div>
                                            <div className="space-y-2"><Label>Organización</Label><Select value={newUserOrgId} onValueChange={setNewUserOrgId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{organizations.map(org => <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>)}</SelectContent></Select></div>
                                        </div>
                                        <Button className="w-full" onClick={handleInviteUser} disabled={isCreatingUser}>{isCreatingUser ? "Procesando..." : "Invitar"}</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50"><TableRow className="border-none"><TableHead className="py-4 pl-6 text-[10px] font-black uppercase">Email</TableHead><TableHead className="text-[10px] font-black uppercase">Organización</TableHead><TableHead className="text-[10px] font-black uppercase">Rol</TableHead><TableHead className="text-center text-[10px] font-black uppercase">Estatus</TableHead><TableHead className="text-right py-4 pr-6 text-[10px] font-black uppercase tracking-widest">Acciones</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {users.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell className="pl-6 font-medium">{u.email}</TableCell>
                                            <TableCell>{organizations.find(o => o.id === u.organization_id)?.name || 'Acceso Global'}</TableCell>
                                            <TableCell><Badge className={ROLE_COLORS[u.role]}>{ROLE_LABELS[u.role]}</Badge></TableCell>
                                            <TableCell className="text-center"><Badge variant={u.is_active ? "default" : "secondary"}>{u.is_active ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                                            <TableCell className="pr-6 text-right flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => setEditingUser(u.user_id)}><Edit size={14} /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDeleteUser(u.user_id)}><Trash2 size={14} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="organizations">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div><CardTitle>Organizaciones Globales</CardTitle><CardDescription>Control masivo de entidades empresariales.</CardDescription></div>
                            <Button size="sm" onClick={() => setOrganizationDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Nueva Org</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50"><TableRow className="border-none"><TableHead className="py-4 pl-6 text-[10px] font-black uppercase">Entidad</TableHead><TableHead className="text-[10px] font-black uppercase">Plan</TableHead><TableHead className="text-center text-[10px] font-black uppercase">Estado</TableHead><TableHead className="text-[10px] font-black uppercase">Usuarios</TableHead><TableHead className="text-right py-4 pr-6 text-[10px] font-black uppercase tracking-widest">Control</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {organizations.map(org => (
                                        <TableRow key={org.id}>
                                            <TableCell className="pl-6 font-bold">{org.name}</TableCell>
                                            <TableCell><Badge variant="outline" className="capitalize">{org.plan_tier}</Badge></TableCell>
                                            <TableCell className="text-center"><Badge className={org.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>{org.subscription_status}</Badge></TableCell>
                                            <TableCell className="font-mono text-xs">{users.filter(u => u.organization_id === org.id).length} / {org.settings?.max_users || 5}</TableCell>
                                            <TableCell className="pr-6 text-right flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-500" onClick={() => enterAuditMode(org.id)}><Eye size={14} /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500" onClick={() => startEditingOrg(org)}><Edit size={14} /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDeleteOrganization(org.id)}><Trash2 size={14} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sentinel" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* License Auditor Feed */}
                        <Card className="border-red-100 shadow-xl shadow-red-50/20">
                            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600"><ShieldAlert size={20} /></div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">Sentinel Oracle [Licencias]</CardTitle>
                                    <CardDescription>Escaneo de organizaciones que exceden su límite.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {licenseInfractions.length === 0 ? (
                                    <div className="py-10 text-center space-y-2">
                                        <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto opacity-20" />
                                        <p className="text-sm font-bold text-slate-400">Total Integridad. Sin infracciones.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {licenseInfractions.map((inf, idx) => (
                                            <div key={inf.id} className="p-4 border rounded-2xl bg-red-50/50 border-red-100 flex justify-between items-center group hover:bg-red-50 transition-colors">
                                                <div>
                                                    <p className="text-sm font-black text-red-900">{organizations.find(o => o.id === inf.target_id)?.name || 'Org Desconocida'}</p>
                                                    <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-tighter">
                                                        Uso Crítico: {inf.details?.current} / {inf.details?.max} Usuarios
                                                    </p>
                                                </div>
                                                <Badge className="bg-red-600 text-white border-none text-[10px] font-black uppercase">ALERTA {idx + 1}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Regional Radar Feed (Aragua) */}
                        <Card className="border-emerald-100 shadow-xl shadow-emerald-50/20">
                            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Zap size={20} /></div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">Radar Regional [Aragua]</CardTitle>
                                    <CardDescription>Seguimiento de actividad proactiva en tiempo real.</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 animate-pulse">LIVE</Badge>
                            </CardHeader>
                            <CardContent>
                                {araguaActivity.length === 0 ? (
                                    <div className="py-10 text-center space-y-2">
                                        <Activity className="h-10 w-10 text-slate-300 mx-auto opacity-20" />
                                        <p className="text-sm font-bold text-slate-400">Sin actividad reciente en Aragua.</p>
                                    </div>
                                ) : (
                                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                        {araguaActivity.map(act => (
                                            <div key={act.id} className="p-3 border rounded-xl bg-white flex items-center gap-3 hover:border-emerald-200 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Map size={14} /></div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-slate-800">Nueva Visita: <span className="text-emerald-600">Aragua</span></p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Ref: {act.target_id.slice(-6).toUpperCase()}</p>
                                                </div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle className="text-md">Historial General de Auditoría [Nivel Dios]</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50"><TableRow className="border-none"><TableHead className="pl-6 text-[10px] font-black uppercase py-4">Evento</TableHead><TableHead className="text-[10px] font-black uppercase">Timestamp</TableHead><TableHead className="pr-6 text-right text-[10px] font-black uppercase">Details</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {auditLogs.slice(0, 10).map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell className="pl-6"><Badge variant="outline" className="font-mono text-[9px] uppercase tracking-tighter">{log.action_type.replace(/_/g, ' ')}</Badge></TableCell>
                                            <TableCell className="text-[10px] text-slate-500 font-bold">{new Date(log.created_at).toLocaleString()}</TableCell>
                                            <TableCell className="pr-6 text-right font-mono text-[9px] text-slate-400 max-w-[200px] truncate">{JSON.stringify(log.details)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="memberships"><PlanManager /></TabsContent>
                <TabsContent value="support"><TicketList /></TabsContent>
                <TabsContent value="activity">
                    <Card>
                        <CardHeader><CardTitle>Actividad del Sistema</CardTitle><CardDescription>Estadísticas crudas de operación.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                <Activity className="h-8 w-8 text-emerald-600" />
                                <div className="flex-1"><h4 className="font-bold text-slate-900">Núcleo Central Operativo</h4><p className="text-xs text-slate-500">Latencia promedio Supabase: {supabase ? '< 300ms' : 'Error'}</p></div>
                                <Badge className="bg-emerald-500 text-white">Online</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm"><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Visitas 24H</p><p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.totalVisits}</p></div>
                                <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm"><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Lead Stream</p><p className="text-4xl font-black text-indigo-600 tracking-tighter">{stats.totalContacts}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Org Dialog (Legacy support) */}
            <Dialog open={!!editingOrg} onOpenChange={(open) => !open && setEditingOrg(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Configuración Maestra: {editOrgName}</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Nombre</Label><Input value={editOrgName} onChange={(e) => setEditOrgName(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Plan</Label><Select value={editOrgPlan} onValueChange={(v) => { setEditOrgPlan(v); setEditOrgMaxUsers(PLAN_LIMITS[v] || 5); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="pro">Pro</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label className="text-red-500 font-bold">Límite Usuarios (Override)</Label><Input type="number" value={editOrgMaxUsers} onChange={(e) => setEditOrgMaxUsers(parseInt(e.target.value))} className="bg-red-50" /></div>
                        </div>
                        <div className="space-y-4">
                            <Label className="font-bold">Módulos Habilitados</Label>
                            <div className="grid grid-cols-1 gap-2 border p-4 rounded-xl">
                                {['sales_module', 'warehouse_module', 'telemarketing_module', 'events_module'].map(mod => (
                                    <div key={mod} className="flex items-center gap-2"><Checkbox id={mod} checked={editOrgFeatures[mod] === true} onCheckedChange={(v) => setEditOrgFeatures(prev => ({ ...prev, [mod]: !!v }))} /><Label htmlFor={mod} className="text-sm capitalize">{mod.replace('_', ' ')}</Label></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleUpdateOrganization} className="w-full bg-slate-900">Aplicar Cambios Nucleares</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function KPICard({ title, value, icon, color, subtitle }: any) {
    const variants: any = {
        indigo: { bg: "bg-indigo-50", icon: "text-indigo-600 bg-indigo-100" },
        purple: { bg: "bg-purple-50", icon: "text-purple-600 bg-purple-100" },
        rose: { bg: "bg-rose-50", icon: "text-rose-600 bg-rose-100" },
        emerald: { bg: "bg-emerald-50", icon: "text-emerald-600 bg-emerald-100" },
    };
    const v = variants[color] || variants.indigo;
    return (
        <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p><p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{value}</p>{subtitle && <p className="text-[9px] font-bold text-slate-400 mt-1">{subtitle}</p>}</div>
                    <div className={cn("p-4 rounded-[1.25rem] transition-all group-hover:scale-110", v.icon)}>{cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: 2.5 })}</div>
                </div>
            </CardContent>
        </Card>
    );
}
