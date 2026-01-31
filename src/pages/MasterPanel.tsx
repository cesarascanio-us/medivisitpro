import { useState, useEffect } from "react";
import {
    Users, Shield, Building2, BarChart3, Settings, Database,
    Activity, TrendingUp, Calendar, Package, FileText, Bell,
    Plus, Edit, Trash2, Eye, RefreshCw, Download, Save
} from "lucide-react";
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
import TicketList from "@/pages/Master/Tickets/TicketList";

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
    rif?: string; // NEW
    fiscal_address?: string; // NEW
    phone?: string; // NEW
    taxpayer_type?: string; // NEW
    settings?: any; // For max_users
    created_at: string;
    user_count?: number;
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

    // Organization Edit State
    const [editingOrg, setEditingOrg] = useState<string | null>(null);
    const [editOrgName, setEditOrgName] = useState('');
    const [editOrgSlug, setEditOrgSlug] = useState('');
    const [editOrgPlan, setEditOrgPlan] = useState('free');
    const [editOrgStatus, setEditOrgStatus] = useState('active');
    // New Edit Fields
    const [editOrgRif, setEditOrgRif] = useState('');
    const [editOrgAddress, setEditOrgAddress] = useState('');
    const [editOrgPhone, setEditOrgPhone] = useState('');
    const [editOrgTaxType, setEditOrgTaxType] = useState('');
    const [editOrgMaxUsers, setEditOrgMaxUsers] = useState(5);
    const [editOrgFeatures, setEditOrgFeatures] = useState<Record<string, boolean>>({});

    // User creation states
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('representative');
    const [newUserOrgId, setNewUserOrgId] = useState<string>('');
    const [newUserFirstName, setNewUserFirstName] = useState('');
    const [newUserLastName, setNewUserLastName] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    // Redirect non-master/admin users
    if (!isMaster && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch Dynamic Roles
            const { data: rolesData } = await supabase.from('app_roles').select('slug, name').order('name');
            if (rolesData) setAvailableRoles(rolesData);

            // Load stats
            const [usersRes, organizationsRes, visitsRes, contactsRes, productsRes, expensesRes, ticketsRes] = await Promise.all([
                supabase.from('user_roles').select('*', { count: 'exact' }),
                supabase.from('organizations').select('*'),
                supabase.from('visits').select('*', { count: 'exact', head: true }),
                supabase.from('contacts').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('expenses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')
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

            // Load users with emails from profiles
            if (usersRes.data) {
                const usersWithEmails = await Promise.all(usersRes.data.map(async (ur) => {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('email')
                        .eq('user_id', ur.user_id)
                        .maybeSingle();
                    return {
                        ...ur,
                        email: profile?.email || 'Sin email',
                        role: (ur.role || 'representative') as UserRole
                    };
                }));
                setUsers(usersWithEmails);
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

            // Also update profiles for consistency
            await supabase
                .from('profiles')
                .update({ organization_id: newUserOrgIdEdit || null })
                .eq('user_id', userId);

            toast({ title: "Usuario actualizado", description: "El rol y organización se han cambiado correctamente." });
            setEditingUser(null);
            loadData();
        } catch (error) {
            console.error('Update user error:', error);
            toast({ title: "Error", description: "No se pudo actualizar el usuario.", variant: "destructive" });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('ADVERTENCIA: ¿Estás seguro de eliminar este usuario permanentemente? Esta acción borrará sus datos de perfil y roles.')) return;
        try {
            // Check if we can delete from profiles

            const { error: profileError } = await supabase.from('profiles').delete().eq('user_id', userId);

            if (profileError) {
                // Try deleting from user_roles first if cascade isn't set
                await supabase.from('user_roles').delete().eq('user_id', userId);
                const { error: retryError } = await supabase.from('profiles').delete().eq('user_id', userId);
                if (retryError) throw retryError;
            }

            toast({ title: "Usuario eliminado", description: "El perfil del usuario ha sido eliminado." });
            loadData();
        } catch (error) {
            console.error('Delete user error:', error);
            toast({ title: "Error", description: "No se pudo eliminar el usuario completemente. Puede requerir permisos de Auth.", variant: "destructive" });
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
            const slug = newOrganizationName.toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

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
            setNewOrganizationName('');
            setNewOrgRif('');
            setNewOrgAddress('');
            setNewOrgPhone('');
            setNewUserEmail('');
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
            toast({ title: "Organización Actualizada", description: "Los cambios se han guardado correctamente." });
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
        // Load extended fields
        setEditOrgRif(org.rif || '');
        setEditOrgAddress(org.fiscal_address || '');
        setEditOrgPhone(org.phone || '');
        setEditOrgTaxType(org.taxpayer_type || 'Ordinario');
        // Load settings safely
        const settings = org.settings as any;
        setEditOrgMaxUsers(settings?.max_users || PLAN_LIMITS[org.plan_tier || 'free'] || 5);
        setEditOrgFeatures(settings?.features || {});
    };

    const handleInviteUser = async () => {
        if (!newUserEmail || !newUserOrgId || !newUserFirstName || !newUserLastName) {
            toast({ title: "Error", description: "Faltan campos obligatorios (Email, Nombre, Apellido, Organización)", variant: "destructive" });
            return;
        }

        setIsCreatingUser(true);
        try {
            console.log("Invoking invite-user function...");
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email: newUserEmail,
                    firstName: newUserFirstName,
                    lastName: newUserLastName,
                    role: newUserRole,
                    organizationId: newUserOrgId === 'none' ? null : newUserOrgId
                }
            });

            if (error) {
                console.error("Function error:", error);
                throw error;
            }

            console.log("Invitation result:", data);

            toast({
                title: "Invitación Enviada",
                description: `Se ha enviado un correo de invitación a ${newUserEmail}.`
            });

            setUserDialogOpen(false);
            setNewUserEmail('');
            setNewUserFirstName('');
            setNewUserLastName('');
            setNewUserRole('representative');

            // Reload data to potentially show the pending user if the function inserts immediately
            setTimeout(loadData, 1000);

        } catch (error: any) {
            console.error('Invite user error:', error);
            let errorMessage = "No se pudo enviar la invitación.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            // Intentar parsear error de cuerpo de respuesta si existe
            if (error && typeof error === 'object' && 'context' in error) {
                // Supabase function errors sometimes come in a specific format
            }

            toast({
                title: "Error al invitar",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleDeleteOrganization = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta organización? Esta acción no se puede deshacer.')) return;
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
        // Implement actual audit switch logic here if needed
        window.location.href = `/dashboard?audit_org=${orgId}`;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Cargando Panel Master...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Shield className="h-6 w-6 text-purple-600" />
                        Panel Master
                    </h1>
                    <p className="text-muted-foreground">Administración centralizada del sistema</p>
                </div>
                <Button variant="outline" onClick={loadData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Usuarios</p>
                                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                                <p className="text-xs text-green-600">{stats.activeUsers} activos</p>
                            </div>
                            <Users className="h-8 w-8 text-primary opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Organizaciones</p>
                                <p className="text-2xl font-bold">{stats.totalOrganizations}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tickets Abiertos</p>
                                <p className="text-2xl font-bold">{stats.openTickets}</p>
                            </div>
                            <Bell className="h-8 w-8 text-red-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Sistema</p>
                                <p className="text-2xl font-bold text-green-600">Operativo</p>
                            </div>
                            <Activity className="h-8 w-8 text-green-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Management */}
            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Usuarios</TabsTrigger>
                    <TabsTrigger value="roles">Roles & Permisos</TabsTrigger>
                    <TabsTrigger value="organizations">Organizaciones</TabsTrigger>
                    <TabsTrigger value="memberships">Membresías</TabsTrigger>
                    <TabsTrigger value="support">Soporte</TabsTrigger>
                    <TabsTrigger value="activity">Actividad</TabsTrigger>
                </TabsList>

                {/* Roles Tab */}
                <TabsContent value="roles">
                    <RoleManager />
                </TabsContent>

                {/* Memberships Tab */}
                <TabsContent value="memberships">
                    <PlanManager />
                </TabsContent>

                {/* Support Tab */}
                <TabsContent value="support">
                    <TicketList />
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Gestión de Usuarios</CardTitle>
                                <CardDescription>Administra roles y accesos de usuarios del sistema</CardDescription>
                            </div>
                            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                                <DialogTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button size="sm"><Plus className="h-4 w-4 mr-2" />Invitar Usuario</Button>
                                    </DialogTrigger>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Correo Electrónico</Label>
                                            <Input
                                                type="email"
                                                value={newUserEmail}
                                                onChange={(e) => setNewUserEmail(e.target.value)}
                                                placeholder="usuario@ejemplo.com"
                                            />
                                        </div>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Nombre</Label>
                                                    <Input value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} placeholder="Juan" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Apellido</Label>
                                                    <Input value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} placeholder="Pérez" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Rol del Sistema</Label>
                                                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as UserRole)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableRoles.length > 0 ? (
                                                            availableRoles.map(role => (
                                                                <SelectItem key={role.slug} value={role.slug}>{role.name}</SelectItem>
                                                            ))
                                                        ) : (
                                                            <>
                                                                <SelectItem value="admin">Admin Organización</SelectItem>
                                                                <SelectItem value="manager">Gerente</SelectItem>
                                                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                                                <SelectItem value="representative">Representante</SelectItem>
                                                            </>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Organización</Label>
                                                <Select value={newUserOrgId} onValueChange={setNewUserOrgId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {organizations.map(org => (
                                                            <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full"
                                            onClick={handleInviteUser}
                                            disabled={isCreatingUser}
                                        >
                                            {isCreatingUser ? "Enviando Invitación..." : "Enviar Invitación"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Organización</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Registro</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell className="font-medium">{u.email}</TableCell>
                                            <TableCell>
                                                {editingUser === u.user_id ? (
                                                    <Select value={newUserOrgIdEdit} onValueChange={setNewUserOrgIdEdit}>
                                                        <SelectTrigger className="w-40">
                                                            <SelectValue placeholder="Sin Org" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">Sin Organización</SelectItem>
                                                            {organizations.map(org => (
                                                                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                        {organizations.find(o => o.id === u.organization_id)?.name || 'Sin Org'}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingUser === u.user_id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableRoles.length > 0 ? (
                                                                    availableRoles.map(role => (
                                                                        <SelectItem key={role.slug} value={role.slug}>{role.name}</SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <>
                                                                        <SelectItem value="master">Master</SelectItem>
                                                                        <SelectItem value="admin">Administrador</SelectItem>
                                                                        <SelectItem value="manager">Gerente</SelectItem>
                                                                        <SelectItem value="coordinator">Coordinador</SelectItem>
                                                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                                                        <SelectItem value="representative">Representante</SelectItem>
                                                                    </>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button size="sm" onClick={() => handleUpdateRole(u.user_id)}>✓</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setEditingUser(null)}>✕</Button>
                                                    </div>
                                                ) : (
                                                    <Badge className={ROLE_COLORS[u.role]}>{ROLE_LABELS[u.role]}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={u.is_active ? "default" : "secondary"}>
                                                    {u.is_active ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(u.created_at).toLocaleDateString('es-ES')}</TableCell>
                                            <TableCell className="text-right">
                                                {u.role !== 'master' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            setEditingUser(u.user_id);
                                                            setNewRole(u.role);
                                                            setNewUserOrgIdEdit(u.organization_id || 'none');
                                                        }}>
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={u.is_active ? "ghost" : "outline"}
                                                            className={u.is_active ? "text-amber-500 hover:text-amber-600 hover:bg-amber-100" : "bg-green-50 text-green-600 border-green-200"}
                                                            onClick={() => handleToggleUserActive(u.user_id, u.is_active)}
                                                            title={u.is_active ? 'Desactivar acceso' : 'Activar acceso'}
                                                        >
                                                            {u.is_active ? <Shield className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                            onClick={() => handleDeleteUser(u.user_id)}
                                                            title="Eliminar Usuario"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Edit Organization Dialog */}
                <Dialog open={!!editingOrg} onOpenChange={(open) => !open && setEditingOrg(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Organización (Modo Dios)</DialogTitle>
                            <CardDescription>Modifica privilegios, planes y acceso.</CardDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nombre de la Organización</Label>
                                <Input value={editOrgName} onChange={(e) => setEditOrgName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (Identificador URL)</Label>
                                <Input value={editOrgSlug} onChange={(e) => setEditOrgSlug(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Plan de Membresía</Label>
                                    <Select value={editOrgPlan} onValueChange={(val) => {
                                        setEditOrgPlan(val);
                                        // Auto-update limit based on plan change
                                        setEditOrgMaxUsers(PLAN_LIMITS[val] || 5);
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Gratuito (Max 5)</SelectItem>
                                            <SelectItem value="pro">Profesional (Max 20)</SelectItem>
                                            <SelectItem value="enterprise">Empresarial (1000+)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado de Suscripción</Label>
                                    <Select value={editOrgStatus} onValueChange={setEditOrgStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Activo</SelectItem>
                                            <SelectItem value="trialing">En Prueba</SelectItem>
                                            <SelectItem value="past_due">Vencido</SelectItem>
                                            <SelectItem value="canceled">Cancelado</SelectItem>
                                            <SelectItem value="incomplete">Incompleto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
                                <div className="space-y-2">
                                    <Label>RIF</Label>
                                    <Input value={editOrgRif} onChange={(e) => setEditOrgRif(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teléfono</Label>
                                    <Input value={editOrgPhone} onChange={(e) => setEditOrgPhone(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Dirección Fiscal</Label>
                                <Input value={editOrgAddress} onChange={(e) => setEditOrgAddress(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Contribuyente</Label>
                                    <Select value={editOrgTaxType} onValueChange={setEditOrgTaxType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Ordinario">Ordinario</SelectItem>
                                            <SelectItem value="Especial">Especial</SelectItem>
                                            <SelectItem value="Formal">Formal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-purple-600 font-bold">Límite de Usuarios</Label>
                                    <Input
                                        type="number"
                                        value={editOrgMaxUsers}
                                        onChange={(e) => setEditOrgMaxUsers(parseInt(e.target.value))}
                                        className="border-purple-200 bg-purple-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4 border-t pt-4 mt-4">
                                <Label className="text-lg font-semibold">Módulos Habilitados (Modo Dios)</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="feat-sales"
                                            checked={editOrgFeatures['sales_module'] !== false}
                                            onCheckedChange={(checked) => setEditOrgFeatures(prev => ({ ...prev, sales_module: !!checked }))}
                                        />
                                        <Label htmlFor="feat-sales" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Módulo de Ventas
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="feat-warehouse"
                                            checked={editOrgFeatures['warehouse_module'] === true}
                                            onCheckedChange={(checked) => setEditOrgFeatures(prev => ({ ...prev, warehouse_module: !!checked }))}
                                        />
                                        <Label htmlFor="feat-warehouse" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Control de Almacén
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="feat-telemarketing"
                                            checked={editOrgFeatures['telemarketing_module'] === true}
                                            onCheckedChange={(checked) => setEditOrgFeatures(prev => ({ ...prev, telemarketing_module: !!checked }))}
                                        />
                                        <Label htmlFor="feat-telemarketing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Telemarketing
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="feat-events"
                                            checked={editOrgFeatures['events_module'] === true}
                                            onCheckedChange={(checked) => setEditOrgFeatures(prev => ({ ...prev, events_module: !!checked }))}
                                        />
                                        <Label htmlFor="feat-events" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Gestión de Eventos
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleUpdateOrganization}>
                                <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Features Toggle Section - Inserted into Edit Dialog */}

                {/* Organizations Tab */}
                <TabsContent value="organizations">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Gestión de Organizaciones</CardTitle>
                                <CardDescription>Administra las organizaciones registradas en el sistema</CardDescription>
                            </div>
                            <Dialog open={organizationDialogOpen} onOpenChange={setOrganizationDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm"><Plus className="h-4 w-4 mr-2" />Nueva Organización</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Registrar Nueva Organización</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Nombre de la Organización</Label>
                                            <Input
                                                value={newOrganizationName}
                                                onChange={(e) => setNewOrganizationName(e.target.value)}
                                                placeholder="Ej: Pharma Corp"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>RIF</Label>
                                                <Input value={newOrgRif} onChange={(e) => setNewOrgRif(e.target.value)} placeholder="J-12345678-9" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Teléfono</Label>
                                                <Input value={newOrgPhone} onChange={(e) => setNewOrgPhone(e.target.value)} placeholder="+58..." />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Dirección Fiscal</Label>
                                            <Input value={newOrgAddress} onChange={(e) => setNewOrgAddress(e.target.value)} placeholder="Av. Principal..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tipo de Contribuyente</Label>
                                            <Select value={newOrgTaxType} onValueChange={setNewOrgTaxType}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Ordinario">Ordinario</SelectItem>
                                                    <SelectItem value="Especial">Especial</SelectItem>
                                                    <SelectItem value="Formal">Formal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button className="w-full bg-primary" onClick={handleCreateOrganization}>Crear Organización</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Fecha Creación</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {organizations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                No hay organizaciones registradas
                                            </TableCell>
                                        </TableRow>
                                    ) : organizations.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{c.plan_tier || 'Free'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={c.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {c.subscription_status || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(c.created_at || '').toLocaleDateString('es-ES')}</TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => enterAuditMode(c.id)} title="Entrar como Auditor (Nivel Dios)">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => startEditingOrg(c)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDeleteOrganization(c.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actividad del Sistema</CardTitle>
                            <CardDescription>Resumen de actividad reciente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                    <Activity className="h-10 w-10 text-primary" />
                                    <div className="flex-1">
                                        <h4 className="font-medium">Sistema Operativo</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Todos los servicios funcionando correctamente
                                        </p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">Últimas 24 horas</h4>
                                        <p className="text-3xl font-bold text-primary">{stats.totalVisits}</p>
                                        <p className="text-sm text-muted-foreground">visitas registradas</p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">Usuarios Activos</h4>
                                        <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
                                        <p className="text-sm text-muted-foreground">de {stats.totalUsers} totales</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
