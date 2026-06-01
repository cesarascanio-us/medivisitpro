import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import { 
    Shield, Users, Building2, Plus, 
    RefreshCw, Search, Edit, ShieldAlert, 
    ShieldCheck, Activity, Database, Zap,
    ChevronRight, ExternalLink, Trash2, Key, DollarSign,
    CheckCircle2, XCircle, Pencil, LayoutGrid, PauseCircle, PlayCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteKPICard, EliteTabsList, EliteTabsTrigger } from "@/components/layout/DesignSystem";
import { EliteTable, EliteColumn } from "@/components/layout/EliteTable";

export default function MasterPanel() {
    const { isMaster, profile } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { switchOrganization } = useOrganization();
    const [loading, setLoading] = useState(true);
    
    // ACTIVE TAB
    const [activeTab, setActiveTab] = useState('organizations');

    // STATES
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [billingPlans, setBillingPlans] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [systemRoles, setSystemRoles] = useState<any[]>([]);

    const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<any>(null);
    const [managingUsersOrg, setManagingUsersOrg] = useState<any>(null);
    const [managingModulesOrg, setManagingModulesOrg] = useState<any>(null);
    
    const [orgUsers, setOrgUsers] = useState<any[]>([]);
    const [orgFormData, setOrgFormData] = useState({ name: '', slug: '', plan_id: '', rif: '', phone: '' });
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('representative');

    useEffect(() => { 
        loadData(); 
        
        // Auto-fix para forzar la Identidad Corporativa (eliminar tema anaranjado/oscuro residual en BD)
        const enforceCorporateTheme = async () => {
            if (isMaster) {
                const { data } = await supabase.from('organizations').select('settings').eq('id', '00000000-0000-0000-0000-000000000000').single();
                if (data && data.settings && Object.keys(data.settings).length > 0) {
                    // Resetear a null para forzar que tome el DEFAULT_THEME (Light-First Corporate)
                    await supabase.from('organizations').update({ settings: null }).eq('id', '00000000-0000-0000-0000-000000000000');
                    toast({ title: "Identidad Corporativa Aplicada", description: "El tema residual ha sido limpiado. Refresca la página con F5.", variant: "default" });
                }
            }
        };
        enforceCorporateTheme();
    }, [activeTab, isMaster]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'organizations') {
                const { data } = await supabase.from('organizations').select(`
                    id, name, slug, plan_tier, subscription_status, trial_ends_at, plan_id,
                    plan:billing_plans(name, tier)
                `);
                setOrganizations(data || []);
                const { data: plansData } = await supabase.from('billing_plans').select('*');
                setBillingPlans(plansData || []);
            }
            if (activeTab === 'roles') {
                // Mock system roles for matrix
                setSystemRoles([
                    { id: '1', role: 'admin', name: 'SaaS Admin', users: 12 },
                    { id: '2', role: 'manager', name: 'Gerente Operativo', users: 45 },
                    { id: '3', role: 'representative', name: 'Visitador Médico', users: 340 },
                ]);
            }
        } catch (error: any) { 
            toast({ title: "Error de Núcleo", description: error.message, variant: "destructive" }); 
        } finally { 
            setLoading(false); 
        }
    };

    const openCreateOrg = () => {
        setOrgFormData({ name: '', slug: '', plan_id: '', rif: '', phone: '' });
        setIsCreateOrgModalOpen(true);
    };

    const openEditOrg = (org: any) => {
        setOrgFormData({ name: org.name, slug: org.slug, plan_id: org.plan_id || '', rif: org.rif || '', phone: org.phone || '' });
        setEditingOrg(org);
    };

    const loadOrgUsers = async (orgId: string) => {
        const { data } = await supabase
            .from('user_roles')
            .select('*, profile:profiles(*)')
            .eq('organization_id', orgId);
        setOrgUsers(data || []);
    };

    useEffect(() => {
        if (managingUsersOrg) {
            loadOrgUsers(managingUsersOrg.id);
        }
    }, [managingUsersOrg]);

    const handleCreateOrg = async () => {
        try {
            const { error } = await supabase.from('organizations').insert({
                name: orgFormData.name,
                slug: orgFormData.slug.toLowerCase().replace(/\s+/g, '-'),
                plan_id: orgFormData.plan_id || null,
                subscription_status: 'trialing',
                trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                rif: orgFormData.rif,
                phone: orgFormData.phone,
            });
            if (error) throw error;
            toast({ title: "Éxito", description: "Organización creada", variant: "default" });
            setIsCreateOrgModalOpen(false);
            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleUpdateOrg = async () => {
        try {
            const { error } = await supabase.from('organizations').update({
                name: orgFormData.name,
                plan_id: orgFormData.plan_id || null,
                rif: orgFormData.rif,
                phone: orgFormData.phone,
            }).eq('id', editingOrg.id);
            if (error) throw error;
            toast({ title: "Éxito", description: "Organización actualizada", variant: "default" });
            setEditingOrg(null);
            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const toggleOrgStatus = async (org: any) => {
        const newStatus = org.subscription_status === 'active' ? 'inactive' : 'active';
        try {
            const { error } = await supabase.from('organizations').update({ subscription_status: newStatus }).eq('id', org.id);
            if (error) throw error;
            toast({ title: "Éxito", description: "Estado actualizado", variant: "default" });
            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const updateUserRole = async (userId: string, newRole: string, orgId: string) => {
        try {
            const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId).eq('organization_id', orgId);
            if (error) throw error;
            toast({ title: "Éxito", description: "Rol actualizado", variant: "default" });
            loadOrgUsers(orgId);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const inviteUser = async () => {
        if (!inviteEmail || !managingUsersOrg) return;
        try {
            const { data: existingProfile } = await supabase.from('profiles').select('user_id').eq('email', inviteEmail).maybeSingle();
            
            if (existingProfile) {
                const { error } = await supabase.from('user_roles').upsert({
                    user_id: existingProfile.user_id,
                    organization_id: managingUsersOrg.id,
                    role: inviteRole,
                    is_active: true,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
                    data: { organization_id: managingUsersOrg.id, role: inviteRole }
                });
                if (error) throw error;
            }
            toast({ title: "Éxito", description: "Usuario invitado", variant: "default" });
            setInviteEmail('');
            loadOrgUsers(managingUsersOrg.id);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    if (!isMaster) return <Navigate to="/" replace />;

    const orgColumns: EliteColumn<any>[] = [
        {
            header: "Tenant Corporativo",
            key: "name",
            render: (o) => (
                <div className="flex items-center gap-4">
                    <div className="icon-box-primary w-12 h-12 !rounded-2xl">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-foreground text-sm uppercase font-display tracking-tight">{o.name}</span>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{o.slug}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Suscripción",
            key: "plan",
            render: (o) => (
                <Badge className="badge-elite-info text-[10px] font-black uppercase tracking-widest px-4 py-1.5 border-none">
                    {o.plan?.name || o.plan_tier || 'N/A'}
                </Badge>
            )
        },
        {
            header: "Estado",
            key: "status",
            render: (o) => (
                <Badge className={cn("text-[10px] font-black uppercase px-4 py-1.5 border-none", 
                    o.subscription_status === 'active' ? "badge-elite-success" : 
                    o.subscription_status === 'trialing' ? "badge-elite-warning" : "badge-elite-error"
                )}>
                    {o.subscription_status}
                </Badge>
            )
        },
        {
            header: "Acciones",
            key: "actions",
            render: (o) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditOrg(o)}>
                        <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setManagingUsersOrg(o)}>
                        <Users className="w-3.5 h-3.5 mr-1.5" /> Usuarios
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setManagingModulesOrg(o)}>
                        <LayoutGrid className="w-3.5 h-3.5 mr-1.5" /> Módulos
                    </Button>
                    <Button
                        variant="ghost" size="sm"
                        className={o.subscription_status === 'active' ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-600"}
                        onClick={() => toggleOrgStatus(o)}>
                        {o.subscription_status === 'active'
                        ? <><PauseCircle className="w-3.5 h-3.5 mr-1.5" />Suspender</>
                        : <><PlayCircle className="w-3.5 h-3.5 mr-1.5" />Activar</>
                        }
                    </Button>
                     <Button 
                        variant="ghost" size="sm" 
                        onClick={async () => { await switchOrganization(o.id); navigate("/dashboard"); }}
                        className="btn-elite-ghost h-8 px-4 text-[9px] font-bold uppercase"
                    >
                        Impersonar <ExternalLink size={12} className="ml-2" />
                    </Button>
                </div>
            ),
            className: "text-right"
        }
    ];

    // Removido planColumns y billingColumns porque ya existen en sus propios módulos avanzados (/master/plans y /master/billing)

    return (
        <div className="space-y-10 pb-10 p-1 animate-in fade-in duration-700">
            <EliteHeader 
                title="Consola Sentinel"
                subtitle="Administración Suprema SaaS Matriz"
                icon={Shield}
                badgeText="CÉSAR ASCANIO CORE"
                statusText="PROTOCOL: MASTER ACTIVE"
                statusColor="bg-primary"
                rightContent={
                    <Button onClick={loadData} size="icon" variant="ghost" className="btn-elite-secondary h-12 w-12 group">
                        <RefreshCw size={24} className={cn("group-hover:rotate-180 transition-transform duration-500 text-muted-foreground group-hover:text-primary", loading && "animate-spin text-primary")} />
                    </Button>
                }
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
                <EliteTabsList className="grid-cols-3">
                    <EliteTabsTrigger value="organizations" label="Organizaciones" icon={Building2} />
                    <EliteTabsTrigger value="roles" label="Roles Globales" icon={Key} />
                    <EliteTabsTrigger value="analytics" label="Analítica" icon={Activity} />
                </EliteTabsList>

                <TabsContent value="organizations" className="animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Tenants Corporativos</h3>
                            <p className="text-xs text-muted-foreground font-semibold">Administra todos los inquilinos y suscripciones</p>
                        </div>
                        <Button className="btn-elite-primary h-10 px-6 rounded-xl font-black text-[10px]" onClick={openCreateOrg}>
                            <Plus size={16} className="mr-2" /> Nueva Organización
                        </Button>
                    </div>
                    <EliteTable data={organizations} columns={orgColumns} searchKey="name" searchPlaceholder="Localizar Organización SaaS..." />
                </TabsContent>

                {/* Las pestañas de Planes y Facturación fueron removidas para evitar duplicidad con /master/plans y /master/billing */}

                <TabsContent value="roles" className="animate-in slide-in-from-right-10 duration-500">
                    <div className="card-elite p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="icon-box-primary w-12 h-12 !rounded-xl"><Key className="w-6 h-6" /></div>
                            <div>
                                <h3 className="text-lg font-black uppercase text-foreground">Matriz de Permisos Base</h3>
                                <p className="text-xs text-muted-foreground font-semibold">app_permissions base por cada app_role global</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {systemRoles.map((role: any) => (
                                <Card key={role.id} className="border border-border/50 bg-background/50 hover:border-primary/30 transition-colors">
                                    <CardContent className="p-6">
                                        <h4 className="font-black text-sm uppercase mb-1">{role.name}</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">SLUG: {role.role}</p>
                                        <Badge className="bg-primary/10 text-primary border-none">{role.users} usuarios</Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="animate-in slide-in-from-left-10 duration-500">
                    <div className="card-elite p-16 text-center max-w-2xl mx-auto mt-8">
                        <div className="icon-box-primary w-20 h-20 !rounded-[2rem] mx-auto mb-8">
                             <Activity className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-3 font-display">Telemetría Global</h3>
                        <p className="text-muted-foreground font-medium text-sm max-w-sm mx-auto leading-relaxed">
                            KPIs consumidos desde las funciones RPC de Supabase. Conexión de sockets en progreso.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Modal: Crear / Editar Organización */}
            <Dialog open={isCreateOrgModalOpen || !!editingOrg} onOpenChange={(open) => {
                if (!open) {
                    setIsCreateOrgModalOpen(false);
                    setEditingOrg(null);
                }
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingOrg ? 'Editar Organización' : 'Nueva Organización'}</DialogTitle>
                        <DialogDescription>Configura los detalles del tenant corporativo.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Nombre</Label>
                            <Input value={orgFormData.name} onChange={e => setOrgFormData({...orgFormData, name: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Slug (Subdominio)</Label>
                            <Input disabled={!!editingOrg} value={orgFormData.slug} onChange={e => setOrgFormData({...orgFormData, slug: e.target.value})} placeholder="mi-empresa" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Plan Base</Label>
                            <Select value={orgFormData.plan_id} onValueChange={v => setOrgFormData({...orgFormData, plan_id: v})}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar Plan" /></SelectTrigger>
                                <SelectContent>
                                    {billingPlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>RIF / Tax ID</Label>
                            <Input value={orgFormData.rif} onChange={e => setOrgFormData({...orgFormData, rif: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Teléfono</Label>
                            <Input value={orgFormData.phone} onChange={e => setOrgFormData({...orgFormData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setIsCreateOrgModalOpen(false); setEditingOrg(null); }}>Cancelar</Button>
                        <Button onClick={editingOrg ? handleUpdateOrg : handleCreateOrg}>Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal: Gestión de Usuarios */}
            <Dialog open={!!managingUsersOrg} onOpenChange={(open) => !open && setManagingUsersOrg(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Usuarios de {managingUsersOrg?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex gap-2 items-end">
                            <div className="grid gap-2 flex-1">
                                <Label>Email del usuario</Label>
                                <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="usuario@email.com" />
                            </div>
                            <div className="grid gap-2 w-[150px]">
                                <Label>Rol</Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="representative">Representante</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={inviteUser}>Invitar</Button>
                        </div>
                        
                        <div className="border rounded-md mt-4">
                            {orgUsers.map(u => (
                                <div key={u.user_id} className="flex items-center justify-between p-3 border-b last:border-0">
                                    <div>
                                        <p className="font-semibold text-sm">{u.profile?.full_name || u.profile?.email || 'Usuario'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select value={u.role} onValueChange={(r) => updateUserRole(u.user_id, r, managingUsersOrg.id)}>
                                            <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="manager">Manager</SelectItem>
                                                <SelectItem value="representative">Representante</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8"><Trash2 size={14} /></Button>
                                    </div>
                                </div>
                            ))}
                            {orgUsers.length === 0 && <p className="text-center p-4 text-muted-foreground text-sm">No hay usuarios en esta organización.</p>}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal: Gestión de Módulos (Placeholder) */}
            <Dialog open={!!managingModulesOrg} onOpenChange={(open) => !open && setManagingModulesOrg(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Módulos de {managingModulesOrg?.name}</DialogTitle>
                        <DialogDescription>Los módulos se administran según el plan {managingModulesOrg?.plan?.name}. (WIP)</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </div>
    );
}
