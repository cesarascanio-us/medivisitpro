/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 
 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { 
    Shield, Users, Building2, Plus, 
    RefreshCw, Search, Edit, ShieldAlert, 
    ShieldCheck, Activity, Database, Zap,
    ChevronRight, ExternalLink
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
    master: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    admin_saas: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    admin: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    manager: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    representative: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

export default function MasterPanel() {
    const { isMaster } = useAuth();
    const { toast } = useToast();
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

    if (!isMaster) return <Navigate to="/" replace />;

    useEffect(() => { loadData(); }, []);

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
                totalVisits: 0 // Fetch from RPC if needed
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

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-950 space-y-6">
            <Zap className="h-16 w-16 text-indigo-500 animate-pulse fill-indigo-500/20" />
            <div className="text-indigo-400 font-black uppercase italic tracking-[0.5em] animate-pulse">Sincronizando Matriz Master...</div>
        </div>
    );

    const userColumns: EliteColumn<UserData>[] = [
        { 
            header: "Identidad Digital", 
            key: "email",
            render: (u) => (
                <div className="flex flex-col">
                    <span className="font-black text-white text-base tracking-tight italic uppercase">{u.email}</span>
                    <span className="text-[10px] text-slate-500 font-mono">UID: {u.user_id.slice(0, 16)}...</span>
                </div>
            )
        },
        { 
            header: "Nivel de Rango", 
            key: "role",
            render: (u) => (
                <Badge variant="outline" className={cn("text-[10px] font-black uppercase px-4 py-1.5 rounded-full border tracking-widest italic bg-transparent", ROLE_COLORS[u.role] || "border-white/10 text-slate-400")}>
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
                    <div className="flex items-center gap-2">
                         <div className={cn("h-1.5 w-1.5 rounded-full", u.organization_id ? "bg-indigo-500" : "bg-slate-600")} />
                         <span className="text-xs font-bold text-slate-300">{org?.name || 'Sistémico / Global'}</span>
                    </div>
                );
            }
        },
        { 
            header: "Aislamiento Operativo", 
            key: "company_id",
            render: (u) => (
                <span className="text-[10px] font-mono text-slate-500">{u.company_id || 'N/A'}</span>
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
                        className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all"
                        onClick={() => { setEditingUser(u.user_id); setNewRole(u.role); setNewUserOrgIdEdit(u.organization_id || 'none'); }}
                    >
                        <Edit size={20} />
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
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Building2 className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-white text-base uppercase italic">{o.name}</span>
                        <span className="text-xs text-slate-500">ID: {o.slug}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Plan Maestro",
            key: "plan_tier",
            render: (o) => (
                <Badge className="bg-indigo-500/10 text-indigo-500 border-none text-[10px] font-black uppercase tracking-widest px-4 py-1.5">
                    {o.plan_tier || 'ENTERPRISE'}
                </Badge>
            )
        },
        {
            header: "Frecuencia Sinc",
            key: "subscription_status",
            render: (o) => (
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-tight">{o.subscription_status}</span>
                </div>
            )
        },
        {
            header: "Acceso Rep",
            key: "actions",
            render: (o) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="gap-2 text-[10px] font-black uppercase border border-white/5 rounded-xl hover:bg-white/5">
                        <ExternalLink size={14} /> Inspeccionar
                    </Button>
                </div>
            ),
            className: "text-right"
        }
    ];

    return (
        <div className="space-y-10 pb-10">
            {/* ELITE MASTER HEADER */}
            <EliteHeader 
                title="Consola Sentinel"
                subtitle="Administración Suprema SaaS Matriz"
                icon={Shield}
                badgeText="CÉSAR ASCANIO CORE"
                statusText="PROTOCOL: DUAL-ID ACTIVE"
                statusColor="bg-indigo-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={loadData} 
                            variant="ghost" 
                            size="icon" 
                            className="h-14 w-14 rounded-2xl hover:bg-white/5 border border-white/5 transition-all"
                        >
                            <RefreshCw size={24} className={cn(loading && "animate-spin text-indigo-400")} />
                        </Button>
                        <Button 
                            onClick={() => setUserDialogOpen(true)} 
                            className="bg-indigo-600 hover:bg-indigo-500 text-white h-16 shadow-2xl rounded-[1.5rem] px-8 font-black text-xs uppercase tracking-widest italic transition-all active:scale-95 border-b-4 border-indigo-900"
                        >
                            <Plus size={20} className="mr-3" /> Nuevo Enlace Maestro
                        </Button>
                    </div>
                }
            />

            {/* ELITE KPI STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <EliteKPICard 
                    title="Usuarios Totales"
                    value={stats.totalUsers}
                    icon={<Users className="w-10 h-10" />}
                    color="indigo"
                />
                <EliteKPICard 
                    title="SaaS Tenants"
                    value={stats.totalOrganizations}
                    icon={<Building2 className="w-10 h-10" />}
                    color="blue"
                />
                <EliteKPICard 
                    title="Salud del Núcleo"
                    value="100%"
                    icon={<ShieldCheck className="w-10 h-10" />}
                    color="emerald"
                />
                <EliteKPICard 
                    title="Alertas Globales"
                    value="0"
                    icon={<ShieldAlert className="w-10 h-10" />}
                    color="rose"
                />
            </div>

            <Tabs defaultValue="users" className="w-full">
                <EliteTabsList className="mb-8">
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

                <TabsContent value="users" className="mt-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <EliteTable 
                        data={users} 
                        columns={userColumns} 
                        searchKey="email" 
                        searchPlaceholder="Localizar ID de Usuario o Email..."
                    />
                </TabsContent>

                <TabsContent value="organizations" className="mt-6">
                    <EliteTable 
                        data={organizations} 
                        columns={orgColumns} 
                        searchKey="name" 
                        searchPlaceholder="Localizar Organización SaaS..."
                    />
                </TabsContent>

                <TabsContent value="system" className="mt-6">
                    <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-[3rem] p-20 text-center">
                        <Database className="h-16 w-16 text-slate-700 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Auditoría del Núcleo</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Esta sección está actualmente encriptada. Solo disponible en auditorías de nivel Sentinel Alpha.</p>
                    </div>
                </TabsContent>
            </Tabs>

            {/* EDIT USER DIALOG */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="bg-slate-950 border border-white/5 rounded-[3rem] p-10 max-w-lg shadow-2xl">
                    <DialogHeader className="mb-6 text-center space-y-2">
                        <DialogTitle className="text-3xl font-black text-white italic uppercase tracking-tighter">Refactorizar Acceso</DialogTitle>
                        <DialogDescription className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Modificando parámetros de seguridad de rango</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase text-slate-400 tracking-widest italic ml-4">Nivel de Rango Sentinel</Label>
                            <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                                <SelectTrigger className="bg-slate-900/50 h-16 border-white/10 rounded-2xl text-white font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                        <SelectItem key={val} value={val} className="hover:bg-indigo-500/20">{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase text-slate-400 tracking-widest italic ml-4">Enlace SaaS Tenant</Label>
                            <Select value={newUserOrgIdEdit} onValueChange={setNewUserOrgIdEdit}>
                                <SelectTrigger className="bg-slate-900/50 h-16 border-white/10 rounded-2xl text-white font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="none">Sistémico / Global</SelectItem>
                                    {organizations.map(org => (
                                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="mt-10 sm:justify-center gap-4">
                        <Button variant="ghost" onClick={() => setEditingUser(null)} className="h-16 px-10 rounded-2xl font-bold uppercase tracking-widest text-xs border border-white/5 hover:bg-white/5">Abortar</Button>
                        <Button onClick={handleUpdateUser} className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl">Actualizar Matriz</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* NEW USER DIALOG */}
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                <DialogContent className="bg-slate-950 border border-white/5 rounded-[3rem] p-10 max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader className="mb-6 text-center space-y-2">
                        <DialogTitle className="text-3xl font-black text-white italic uppercase tracking-tighter">Nuevo Enlace Maestro</DialogTitle>
                        <DialogDescription className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Generando credenciales de acceso Sentinel</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Nombre</Label>
                            <Input value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} className="bg-slate-900/50 h-14 border-white/10 rounded-2xl text-white font-bold" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Apellido</Label>
                            <Input value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} className="bg-slate-900/50 h-14 border-white/10 rounded-2xl text-white font-bold" />
                        </div>
                        <div className="col-span-2 space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Terminal Email</Label>
                            <Input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="bg-slate-900/50 h-14 border-white/10 rounded-2xl text-white font-bold" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Nivel de Rango</Label>
                            <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as UserRole)}>
                                <SelectTrigger className="bg-slate-900/50 h-14 border-white/10 rounded-2xl text-white font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                        <SelectItem key={val} value={val}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Asignación Tenant</Label>
                            <Select value={newUserOrgId} onValueChange={setNewUserOrgId}>
                                <SelectTrigger className="bg-slate-900/50 h-14 border-white/10 rounded-2xl text-white font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="none">Sistémico / Global</SelectItem>
                                    {organizations.map(org => (
                                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="mt-10 sm:justify-center gap-4">
                        <Button variant="ghost" onClick={() => setUserDialogOpen(false)} className="h-16 px-10 rounded-2xl font-bold uppercase text-xs border border-white/5 hover:bg-white/5">Cancelar</Button>
                        <Button 
                            onClick={handleInviteUser} 
                            disabled={isCreatingUser} 
                            className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl min-w-[200px]"
                        >
                            {isCreatingUser ? <RefreshCw className="animate-spin mr-2" /> : 'Desplegar Invitación'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
