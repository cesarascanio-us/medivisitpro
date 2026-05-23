import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import { 
    Shield, Users, Building2, Plus, 
    RefreshCw, Search, Edit, ShieldAlert, 
    ShieldCheck, Activity, Database, Zap,
    ChevronRight, ExternalLink, Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteKPICard, EliteTabsList, EliteTabsTrigger } from "@/components/layout/DesignSystem";
import { EliteTable, EliteColumn } from "@/components/layout/EliteTable";

interface UserData {
    user_id: string;
    email: string;
    role: UserRole;
    organization_id: string | null;
    company_id: string | null;
    is_active: boolean;
}

interface OrganizationData {
    id: string;
    name: string;
    slug: string;
    plan_tier: string;
    subscription_status: string;
}

interface SystemStats {
    totalUsers: number;
    activeUsers: number;
    totalOrganizations: number;
    totalVisits: number;
}

const ROLE_LABELS: Record<UserRole, string> = {
    master: 'Sentinel Master',
    organization_admin: 'SaaS Admin',
    admin: 'Empresa Admin',
    manager: 'Gerente Operativo',
    chief: 'Jefe de Ventas',
    coordinator: 'Coordinador',
    supervisor: 'Supervisor',
    telemarketing: 'Telemarketing',
    representative: 'Visitador Médico',
    doctor: 'Médico Especialista',
    pharmacist: 'Farmacéutico',
    service_chief: 'Jefe de Servicio',
    store_manager: 'Gerente Tienda',
    admin_saas: 'SaaS Alpha',
    soporte_saas: 'SaaS Support',
    desarrollo_saas: 'SaaS Core Dev'
};

const ROLE_COLORS: Record<string, string> = {
    master: 'status-active',
    admin_saas: 'status-destructive',
    admin: 'status-info',
    manager: 'status-active',
    representative: 'status-pending'
};

export default function MasterPanel() {
    const { isMaster } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { switchOrganization } = useOrganization();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 0, activeUsers: 0, totalOrganizations: 0, totalVisits: 0
    });
    const [users, setUsers] = useState<UserData[]>([]);
    const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [newRole, setNewRole] = useState<UserRole>('representative');
    const [newUserOrgIdEdit, setNewUserOrgIdEdit] = useState<string>('');
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    
    // New User State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('representative');
    const [newUserOrgId, setNewUserOrgId] = useState<string>('');
    const [newUserFirstName, setNewUserFirstName] = useState('');
    const [newUserLastName, setNewUserLastName] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    // Active tab
    const [activeTab, setActiveTab] = useState('users');

    // Organization CRUD state
    const [orgDialogOpen, setOrgDialogOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<OrganizationData | null>(null);
    const [orgName, setOrgName] = useState('');
    const [orgSlug, setOrgSlug] = useState('');
    const [orgPlanTier, setOrgPlanTier] = useState('starter');
    const [orgStatus, setOrgStatus] = useState('active');
    const [isSavingOrg, setIsSavingOrg] = useState(false);

    useEffect(() => { 
        loadData(); 
    }, []);

    if (!isMaster) return <Navigate to="/" replace />;

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersRes, organizationsRes] = await Promise.all([
                supabase.from('user_roles').select('*'),
                supabase.from('organizations').select('*')
            ]);

            const userRoles = (usersRes.data || []) as any[];
            const orgs = (organizationsRes.data || []) as any[];
            
            setStats({
                totalUsers: userRoles.length,
                activeUsers: userRoles.filter(u => u.is_active).length,
                totalOrganizations: orgs.length,
                totalVisits: 0 
            });

            setOrganizations(orgs);

            if (userRoles.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('user_id, email')
                    .in('user_id', userRoles.map(u => u.user_id));

                const hydratedUsers = userRoles.map(ur => {
                    const p = profiles?.find(p => p.user_id === ur.user_id);
                    return { ...ur, email: p?.email || 'N/A' };
                });
                setUsers(hydratedUsers);
            }
        } catch (error) { 
            toast({ title: "Error de Núcleo", description: "No se pudo sincronizar la matriz master.", variant: "destructive" }); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            const updatePayload = {
                role: newRole,
                organization_id: newUserOrgIdEdit === 'none' ? null : newUserOrgIdEdit
            };
            await supabase.from('user_roles').update(updatePayload).eq('user_id', editingUser);
            toast({ title: "Acceso Industrial Actualizado", description: "Protocolos de seguridad refrescados." });
            setEditingUser(null);
            loadData();
        } catch (error: any) { 
            toast({ title: "Falla de Sistema", description: error.message, variant: "destructive" }); 
        }
    };

    const handleInviteUser = async () => {
        setIsCreatingUser(true);
        try {
            await supabase.functions.invoke('invite-user', {
                body: { 
                    email: newUserEmail, 
                    firstName: newUserFirstName, 
                    lastName: newUserLastName, 
                    role: newUserRole, 
                    organizationId: newUserOrgId === 'none' ? null : newUserOrgId 
                }
            });
            toast({ title: "Enlace Invitado", description: "Credenciales de acceso enviadas al terminal remoto." });
            setUserDialogOpen(false);
            loadData();
        } catch (error: any) { 
            toast({ title: "Error de Despliegue", description: error.message, variant: "destructive" }); 
        } finally { 
            setIsCreatingUser(false); 
        }
    };

    const handleSaveOrganization = async () => {
        if (!orgName || !orgSlug) {
            toast({ title: "Validación Fallida", description: "El nombre y el slug son obligatorios.", variant: "destructive" });
            return;
        }
        setIsSavingOrg(true);
        try {
            const payload = {
                name: orgName,
                slug: orgSlug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                plan_tier: orgPlanTier,
                subscription_status: orgStatus,
                onboarding_completed: true,
                settings: {
                    features: {
                        basic_visits: true,
                        advanced_reports: orgPlanTier !== 'starter',
                        smart_agenda: true,
                        sample_tracking: orgPlanTier === 'enterprise' || orgPlanTier === 'pro',
                        export_data: orgPlanTier === 'enterprise',
                        offline_sync: true
                    }
                }
            };

            if (editingOrg) {
                // Update
                const { error } = await supabase
                    .from('organizations')
                    .update(payload)
                    .eq('id', editingOrg.id);

                if (error) throw error;
                toast({ title: "SaaS Tenant Actualizado", description: `La organización ${orgName} ha sido guardada.` });
            } else {
                // Create
                const { error } = await supabase
                    .from('organizations')
                    .insert({
                        ...payload,
                        id: crypto.randomUUID()
                    });

                if (error) throw error;
                toast({ title: "SaaS Tenant Creado", description: `La organización ${orgName} ha sido inicializada.` });
            }
            setOrgDialogOpen(false);
            setEditingOrg(null);
            setOrgName('');
            setOrgSlug('');
            loadData();
        } catch (error: any) {
            toast({ title: "Falla al Guardar", description: error.message, variant: "destructive" });
        } finally {
            setIsSavingOrg(false);
        }
    };

    const handleDeleteOrganization = async (orgId: string, name: string) => {
        if (!confirm(`¿Estás completamente seguro de eliminar permanentemente la organización "${name}"? Esto borrará el inquilino y podría fallar si existen registros dependientes.`)) return;
        try {
            const { error } = await supabase
                .from('organizations')
                .delete()
                .eq('id', orgId);

            if (error) throw error;
            toast({ title: "SaaS Tenant Eliminado", description: `La organización ${name} ha sido removida del núcleo.` });
            loadData();
        } catch (error: any) {
            toast({ title: "Falla al Eliminar", description: error.message, variant: "destructive" });
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-background space-y-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner animate-pulse">
                <Zap className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <div className="text-muted-foreground font-black uppercase tracking-[0.5em] font-display text-[10px]">Sincronizando Matriz Master...</div>
        </div>
    );

    const userColumns: EliteColumn<UserData>[] = [
        { 
            header: "Identidad Digital", 
            key: "email",
            render: (u) => (
                <div className="flex flex-col">
                    <span className="font-black text-foreground text-base tracking-tight uppercase font-display">{u.email}</span>
                    <span className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">UID: {u.user_id.slice(0, 16)}...</span>
                </div>
            )
        },
        { 
            header: "Nivel de Rango", 
            key: "role",
            render: (u) => (
                <Badge className={cn("text-[10px] font-black uppercase px-4 py-1.5 rounded-full border tracking-widest", ROLE_COLORS[u.role] || "status-pending")}>
                    {ROLE_LABELS[u.role]}
                </Badge>
            )
        },
        {
            header: "Tenant SaaS",
            key: "organization_id",
            render: (u) => {
                const org = organizations.find(o => o.id === u.organization_id);
                return (
                    <div className="flex items-center gap-3">
                         <div className={cn("h-2 w-2 rounded-full", u.organization_id ? "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" : "bg-muted-foreground/20")} />
                         <span className="text-[11px] font-black text-foreground uppercase tracking-tight">{org?.name || 'Sistémico / Global'}</span>
                    </div>
                );
            }
        },
        { 
            header: "Aislamiento Operativo", 
            key: "company_id",
            render: (u) => (
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{u.company_id || 'Global Core'}</span>
            ),
            className: "text-right"
        },
        {
            header: "Acción",
            key: "actions",
            render: (u) => (
                <div className="flex justify-end gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                        onClick={() => { setEditingUser(u.user_id); setNewRole(u.role); setNewUserOrgIdEdit(u.organization_id || 'none'); }}
                    >
                        <Edit size={18} />
                    </Button>
                </div>
            ),
            className: "text-right"
        }
    ];

    const orgColumns: EliteColumn<OrganizationData>[] = [
        {
            header: "Entidad Corporativa",
            key: "name",
            render: (o) => (
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 transition-transform group-hover:scale-110 shadow-inner">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-foreground text-base uppercase font-display tracking-tight">{o.name}</span>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">TENANT: {o.slug}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Plan Maestro",
            key: "plan_tier",
            render: (o) => (
                <Badge className="status-info text-[10px] font-black uppercase tracking-widest px-4 py-1.5 border-none">
                    {o.plan_tier || 'ENTERPRISE'}
                </Badge>
            )
        },
        {
            header: "Estado Operativo",
            key: "subscription_status",
            render: (o) => {
                const status = o.subscription_status || 'inactive';
                const statusColors: Record<string, string> = {
                    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    inactive: 'bg-destructive/10 text-destructive border-destructive/20',
                    trialing: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                };
                const statusLabels: Record<string, string> = {
                    active: 'Activo',
                    inactive: 'Suspendido',
                    trialing: 'Prueba (Trial)'
                };
                return (
                    <Badge className={cn("text-[10px] font-black uppercase px-3 py-1 border rounded-full tracking-widest", statusColors[status] || "bg-muted text-muted-foreground")}>
                        {statusLabels[status] || status}
                    </Badge>
                );
            }
        },
        {
            header: "Acceso & Configuración",
            key: "actions",
            render: (o) => (
                <div className="flex justify-end gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={async () => {
                            await switchOrganization(o.id);
                            navigate("/dashboard");
                        }}
                        className="gap-2 text-[9px] font-black uppercase tracking-widest border border-border rounded-xl hover:bg-muted/30 text-muted-foreground hover:text-primary transition-all"
                    >
                        <ExternalLink size={14} /> Inspeccionar
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                            setEditingOrg(o);
                            setOrgName(o.name);
                            setOrgSlug(o.slug);
                            setOrgPlanTier(o.plan_tier || 'starter');
                            setOrgStatus(o.subscription_status || 'active');
                            setOrgDialogOpen(true);
                        }}
                        className="gap-2 text-[9px] font-black uppercase tracking-widest border border-border rounded-xl hover:bg-muted/30 text-muted-foreground hover:text-primary transition-all"
                    >
                        <Edit size={14} /> Editar
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteOrganization(o.id, o.name)}
                        className="gap-2 text-[9px] font-black uppercase tracking-widest border border-destructive/20 hover:bg-destructive/10 text-destructive rounded-xl transition-all"
                    >
                        <Trash2 size={14} /> Eliminar
                    </Button>
                </div>
            ),
            className: "text-right"
        }
    ];

    return (
        <div className="space-y-10 pb-10 p-1 animate-in fade-in duration-700">
            <EliteHeader 
                title="Consola Sentinel"
                subtitle="Administración Suprema SaaS Matriz"
                icon={Shield}
                badgeText="CÉSAR ASCANIO CORE"
                statusText="PROTOCOL: DUAL-ID ACTIVE"
                statusColor="bg-primary"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={loadData} 
                            size="icon"
                            variant="ghost" 
                            className="h-14 w-14 rounded-2xl bg-card border border-border text-muted-foreground hover:text-primary transition-all shadow-sm group"
                        >
                            <RefreshCw size={24} className={cn("group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin text-primary")} />
                        </Button>
                        {activeTab === 'users' ? (
                            <Button 
                                onClick={() => setUserDialogOpen(true)} 
                                className="bg-primary hover:bg-primary/90 text-white h-16 shadow-premium-md rounded-2xl px-8 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Plus size={20} /> Nuevo Enlace Maestro
                            </Button>
                        ) : activeTab === 'organizations' ? (
                            <Button 
                                onClick={() => {
                                    setEditingOrg(null);
                                    setOrgName('');
                                    setOrgSlug('');
                                    setOrgPlanTier('starter');
                                    setOrgStatus('active');
                                    setOrgDialogOpen(true);
                                }} 
                                className="bg-primary hover:bg-primary/90 text-white h-16 shadow-premium-md rounded-2xl px-8 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Plus size={20} /> Nueva Organización
                            </Button>
                        ) : null}
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <EliteKPICard 
                    title="Usuarios Totales"
                    value={stats.totalUsers}
                    icon={Users}
                    color="indigo"
                />
                <EliteKPICard 
                    title="SaaS Tenants"
                    value={stats.totalOrganizations}
                    icon={Building2}
                    color="blue"
                />
                <EliteKPICard 
                    title="Salud del Núcleo"
                    value="100%"
                    icon={ShieldCheck}
                    color="emerald"
                />
                <EliteKPICard 
                    title="Alertas Globales"
                    value="0"
                    icon={ShieldAlert}
                    color="rose"
                />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
                <EliteTabsList>
                    <EliteTabsTrigger 
                        value="users" 
                        label="Usuarios Atómicos"
                        icon={Users}
                    />
                    <EliteTabsTrigger 
                        value="organizations" 
                        label="Gestión de Tenants"
                        icon={Building2}
                    />
                    <EliteTabsTrigger 
                        value="system" 
                        label="Logs del Núcleo"
                        icon={Database}
                    />
                </EliteTabsList>

                <TabsContent value="users" className="animate-in fade-in zoom-in-95 duration-500">
                    <EliteTable 
                        data={users} 
                        columns={userColumns} 
                        searchKey="email" 
                        searchPlaceholder="Localizar ID de Usuario o Email..."
                    />
                </TabsContent>

                <TabsContent value="organizations" className="animate-in slide-in-from-right-10 duration-500">
                    <EliteTable 
                        data={organizations} 
                        columns={orgColumns} 
                        searchKey="name" 
                        searchPlaceholder="Localizar Organización SaaS..."
                    />
                </TabsContent>

                <TabsContent value="system" className="animate-in slide-in-from-left-10 duration-500">
                    <div className="bg-muted/10 border border-dashed border-border rounded-[3rem] p-24 text-center">
                        <div className="w-20 h-20 rounded-[2rem] bg-card shadow-soft border border-border flex items-center justify-center mx-auto mb-8">
                             <Database className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-3 font-display">Auditoría del Núcleo</h3>
                        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest max-w-sm mx-auto leading-relaxed">
                            Esta sección está actualmente encriptada. Solo disponible en auditorías de nivel Sentinel Alpha con protocolos de seguridad Biométricos.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>

            {/* EDIT USER DIALOG */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="max-w-lg bg-card rounded-[3rem] border border-border shadow-premium-2xl p-0 overflow-hidden font-display">
                    <div className="bg-muted/20 p-10 border-b border-border">
                         <div className="flex items-center gap-4">
                             <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center shadow-soft border border-border">
                                 <RefreshCw className="h-6 w-6 text-primary" />
                             </div>
                             <div>
                                 <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">Refactorizar Acceso</DialogTitle>
                                 <DialogDescription className="text-muted-foreground font-black uppercase text-[9px] tracking-widest mt-1">Modificando parámetros de seguridad de rango</DialogDescription>
                             </div>
                         </div>
                    </div>
                    <div className="p-12 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Nivel de Rango Sentinel</Label>
                            <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                                <SelectTrigger className="h-16 bg-muted/20 border-none focus:ring-primary rounded-2xl font-black uppercase text-xs tracking-tight shadow-inner text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border font-black uppercase text-[10px] tracking-widest">
                                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                        <SelectItem key={val} value={val} className="hover:bg-primary/10">{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Enlace SaaS Tenant</Label>
                            <Select value={newUserOrgIdEdit} onValueChange={setNewUserOrgIdEdit}>
                                <SelectTrigger className="h-16 bg-muted/20 border-none focus:ring-primary rounded-2xl font-black uppercase text-xs tracking-tight shadow-inner text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border font-black uppercase text-[10px] tracking-widest">
                                    <SelectItem value="none">Sistémico / Global</SelectItem>
                                    {organizations.map(org => (
                                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-4 pt-6">
                            <Button variant="ghost" onClick={() => setEditingUser(null)} className="h-14 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-muted/30">Abortar</Button>
                            <Button onClick={handleUpdateUser} className="h-14 px-10 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-premium-md font-black uppercase text-[10px] tracking-widest transition-all active:scale-95">Actualizar Matriz</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* NEW USER DIALOG */}
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                <DialogContent className="max-w-xl bg-card rounded-[3rem] border border-border shadow-premium-2xl p-0 overflow-hidden font-display">
                    <div className="bg-muted/20 p-10 border-b border-border">
                         <div className="flex items-center gap-4">
                             <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center shadow-soft border border-border">
                                 <Plus className="h-6 w-6 text-primary" />
                             </div>
                             <div>
                                 <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">Nuevo Enlace Maestro</DialogTitle>
                                 <DialogDescription className="text-muted-foreground font-black uppercase text-[9px] tracking-widest mt-1">Generando credenciales de acceso Sentinel Alpha</DialogDescription>
                             </div>
                         </div>
                    </div>
                    <div className="p-12 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre</Label>
                                <Input value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} className="h-14 bg-muted/20 border-none focus-visible:ring-primary rounded-xl px-6 font-black uppercase text-xs tracking-tight shadow-inner text-foreground placeholder:text-muted-foreground/30" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Apellido</Label>
                                <Input value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} className="h-14 bg-muted/20 border-none focus-visible:ring-primary rounded-xl px-6 font-black uppercase text-xs tracking-tight shadow-inner text-foreground placeholder:text-muted-foreground/30" />
                            </div>
                            <div className="col-span-2 space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Terminal Email Corporativo</Label>
                                <Input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="h-14 bg-muted/20 border-none focus-visible:ring-primary rounded-xl px-6 font-black uppercase text-xs tracking-tight shadow-inner text-foreground placeholder:text-muted-foreground/30" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Rango Sentinel</Label>
                                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as UserRole)}>
                                    <SelectTrigger className="h-14 bg-muted/20 border-none focus:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border font-black uppercase text-[10px] tracking-widest">
                                        {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                            <SelectItem key={val} value={val}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tenant SaaS</Label>
                                <Select value={newUserOrgId} onValueChange={setNewUserOrgId}>
                                    <SelectTrigger className="h-14 bg-muted/20 border-none focus:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border font-black uppercase text-[10px] tracking-widest">
                                        <SelectItem value="none">Sistémico / Global</SelectItem>
                                        {organizations.map(org => (
                                            <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-8 border-t border-border/40">
                            <Button variant="ghost" onClick={() => setUserDialogOpen(false)} className="h-14 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-muted/30">Cancelar</Button>
                            <Button 
                                onClick={handleInviteUser} 
                                disabled={isCreatingUser} 
                                className="h-14 px-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-premium-md font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center gap-3 min-w-[220px]"
                            >
                                {isCreatingUser ? <RefreshCw className="animate-spin h-4 w-4" /> : <Zap className="h-4 w-4" />}
                                Desplegar Invitación
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* CREATE / EDIT ORGANIZATION DIALOG */}
            <Dialog open={orgDialogOpen} onOpenChange={(open) => {
                setOrgDialogOpen(open);
                if (!open) {
                    setEditingOrg(null);
                    setOrgName('');
                    setOrgSlug('');
                }
            }}>
                <DialogContent className="max-w-xl bg-card rounded-[3rem] border border-border shadow-premium-2xl p-0 overflow-hidden font-display">
                    <div className="bg-muted/20 p-10 border-b border-border">
                         <div className="flex items-center gap-4">
                             <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center shadow-soft border border-border">
                                 {editingOrg ? <Edit className="h-6 w-6 text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
                             </div>
                             <div>
                                 <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">
                                     {editingOrg ? 'Editar SaaS Tenant' : 'Nuevo SaaS Tenant'}
                                 </DialogTitle>
                                 <DialogDescription className="text-muted-foreground font-black uppercase text-[9px] tracking-widest mt-1">
                                     {editingOrg ? 'Modificando parámetros de la organización' : 'Inicializando nueva entidad en la nube'}
                                 </DialogDescription>
                             </div>
                         </div>
                    </div>
                    <div className="p-12 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-2 space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre Comercial</Label>
                                <Input 
                                    value={orgName} 
                                    onChange={(e) => {
                                        setOrgName(e.target.value);
                                        if (!editingOrg) {
                                            setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                        }
                                    }} 
                                    placeholder="Ej: Laboratorios Roche"
                                    className="h-14 bg-muted/20 border-none focus-visible:ring-primary rounded-xl px-6 font-semibold text-sm shadow-inner text-foreground placeholder:text-muted-foreground/30" 
                                />
                            </div>
                            <div className="col-span-2 space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Slug Identificador (único)</Label>
                                <Input 
                                    value={orgSlug} 
                                    onChange={(e) => setOrgSlug(e.target.value)} 
                                    placeholder="ej: laboratorios-roche"
                                    className="h-14 bg-muted/20 border-none focus-visible:ring-primary rounded-xl px-6 font-semibold text-sm shadow-inner text-foreground placeholder:text-muted-foreground/30" 
                                    disabled={!!editingOrg}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Plan de Suscripción</Label>
                                <Select value={orgPlanTier} onValueChange={setOrgPlanTier}>
                                    <SelectTrigger className="h-14 bg-muted/20 border-none focus:ring-primary rounded-xl font-semibold text-xs shadow-inner text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border font-semibold text-xs">
                                        <SelectItem value="starter">Starter</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Estado Operativo</Label>
                                <Select value={orgStatus} onValueChange={setOrgStatus}>
                                    <SelectTrigger className="h-14 bg-muted/20 border-none focus:ring-primary rounded-xl font-semibold text-xs shadow-inner text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border font-semibold text-xs">
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="inactive">Suspendido</SelectItem>
                                        <SelectItem value="trialing">En Prueba (Trial)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-8 border-t border-border/40">
                            <Button variant="ghost" onClick={() => setOrgDialogOpen(false)} className="h-14 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-muted/30">Cancelar</Button>
                            <Button 
                                onClick={handleSaveOrganization} 
                                disabled={isSavingOrg} 
                                className="h-14 px-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-premium-md font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center gap-3 min-w-[220px]"
                            >
                                {isSavingOrg ? <RefreshCw className="animate-spin h-4 w-4" /> : <Zap className="h-4 w-4" />}
                                {editingOrg ? 'Actualizar Tenant' : 'Crear Tenant'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

