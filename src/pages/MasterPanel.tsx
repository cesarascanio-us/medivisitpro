import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import { 
    Shield, Users, Building2, Plus, 
    RefreshCw, Search, Edit, ShieldAlert, 
    ShieldCheck, Activity, Database, Zap,
    ChevronRight, ExternalLink, Trash2, Key, DollarSign,
    CheckCircle2, XCircle, Pencil, LayoutGrid, PauseCircle, PlayCircle, TrendingUp, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const [permissionsList, setPermissionsList] = useState<any[]>([]);
    const [rolePermissions, setRolePermissions] = useState<any[]>([]);
    const [planAvailability, setPlanAvailability] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState({ totalOrgs: 0, activeUsers: 0, estimatedMrr: 0, invoicesTotal: 0, orgsByPlan: [] as any[] });

    const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<any>(null);

    const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<any>(null);
    const [managingUsersOrg, setManagingUsersOrg] = useState<any>(null);
    const [managingModulesOrg, setManagingModulesOrg] = useState<any>(null);
    const [orgLimits, setOrgLimits] = useState<any>(null);
    
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
                const [rolesRes, permsRes, matrixRes, plansRes] = await Promise.all([
                    supabase.from('app_roles').select('*').order('name'),
                    supabase.from('app_permissions').select('*').order('module, name'),
                    supabase.from('role_permissions').select('*'),
                    supabase.from('plan_available_roles').select('*')
                ]);
                
                let permsData = permsRes.data || [];
                
                // [Auto-Seed] Inject 'map.view' permission if missing
                if (permsData && !permsData.find((p: any) => p.code === 'map.view')) {
                    await supabase.from('app_permissions').insert([{
                        code: 'map.view',
                        name: 'Ver Mapa de Cobertura',
                        module: 'GESTIÓN TERRITORIAL',
                        description: 'Acceso al mapa interactivo de contactos y rutas'
                    }]);
                    
                    const { data: newPermsData } = await supabase
                        .from('app_permissions')
                        .select('*')
                        .order('module, name');
                    if (newPermsData) permsData = newPermsData;
                }
                
                setSystemRoles(rolesRes.data || []);
                setPermissionsList(permsData);
                setRolePermissions(matrixRes.data || []);
                setPlanAvailability(plansRes.data || []);
            }
            if (activeTab === 'analytics') {
                const [orgsRes, usersRes, invoicesRes, plansRes] = await Promise.all([
                    supabase.from('organizations').select('id, subscription_status, plan_tier'),
                    supabase.from('user_roles').select('user_id', { count: 'exact', head: true }).eq('is_active', true),
                    supabase.from('invoices').select('amount, status'),
                    supabase.from('billing_plans').select('tier, name')
                ]);

                const orgs = orgsRes.data || [];
                const activeOrgs = orgs.filter(o => o.subscription_status === 'active');
                const totalOrgs = activeOrgs.length;
                
                const invoices = invoicesRes.data || [];
                const invoicesTotal = invoices.reduce((acc, curr) => acc + Number(curr.amount), 0);
                const paidInvoices = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
                
                // Aggregate orgs by plan
                const planCounts = orgs.reduce((acc: any, curr: any) => {
                    const planName = curr.plan_tier || 'desconocido';
                    acc[planName] = (acc[planName] || 0) + 1;
                    return acc;
                }, {});
                const orgsByPlan = Object.keys(planCounts).map(k => ({ name: k, value: planCounts[k] }));

                setAnalyticsData({
                    totalOrgs,
                    activeUsers: usersRes.count || 0,
                    estimatedMrr: paidInvoices > 0 ? paidInvoices : totalOrgs * 29.99, // Fallback MRR
                    invoicesTotal,
                    orgsByPlan
                });
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

    const fetchOrgLimits = async (orgId: string) => {
        const { data } = await supabase.from('org_usage_limits').select('*').eq('organization_id', orgId).maybeSingle();
        if (data) {
            setOrgLimits(data);
        } else {
            setOrgLimits({
                max_users: 10,
                max_doctors: 100,
                max_pharmacies: 50,
                max_products: 50,
                max_visits_monthly: 500
            });
        }
    };

    useEffect(() => {
        if (managingUsersOrg) {
            loadOrgUsers(managingUsersOrg.id);
        }
    }, [managingUsersOrg]);

    useEffect(() => {
        if (managingModulesOrg) {
            fetchOrgLimits(managingModulesOrg.id);
        }
    }, [managingModulesOrg]);

    const saveOrgLimits = async () => {
        if (!managingModulesOrg) return;
        try {
            const { error } = await supabase.from('org_usage_limits').upsert({
                organization_id: managingModulesOrg.id,
                ...orgLimits
            });
            if (error) throw error;
            toast({ title: "Éxito", description: "Extensiones y límites del tenant actualizados" });
            setManagingModulesOrg(null);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

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

    // Role Matrix Handlers
    const handleTogglePermission = async (roleSlug: string, permissionCode: string, hasPermission: boolean) => {
        try {
            if (hasPermission) {
                await supabase.from('role_permissions').delete().eq('role_slug', roleSlug).eq('permission_code', permissionCode);
            } else {
                await supabase.from('role_permissions').insert({ role_slug: roleSlug, permission_code: permissionCode });
            }
            // Update local state without full refetch for snappy UI
            setRolePermissions(prev => 
                hasPermission 
                ? prev.filter(p => !(p.role_slug === roleSlug && p.permission_code === permissionCode))
                : [...prev, { role_slug: roleSlug, permission_code: permissionCode }]
            );
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleTogglePlan = async (roleSlug: string, planTier: string, isAvailable: boolean) => {
        try {
            if (isAvailable) {
                await supabase.from('plan_available_roles').delete().eq('role_slug', roleSlug).eq('plan_tier', planTier);
            } else {
                await supabase.from('plan_available_roles').insert({ role_slug: roleSlug, plan_tier: planTier });
            }
            setPlanAvailability(prev => 
                isAvailable 
                ? prev.filter(p => !(p.role_slug === roleSlug && p.plan_tier === planTier))
                : [...prev, { role_slug: roleSlug, plan_tier: planTier }]
            );
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    // Derived data for Matrix
    const groupedPermissions = permissionsList.reduce((acc, p) => {
        if (!acc[p.module]) acc[p.module] = [];
        acc[p.module].push(p);
        return acc;
    }, {} as Record<string, any[]>);

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
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Matriz de Roles y Privilegios</h3>
                            <p className="text-xs text-muted-foreground font-semibold">Configura dinámicamente qué hace cada rol y en qué planes están disponibles</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Columna 1: Lista de Roles */}
                        <div className="lg:col-span-3 space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Roles del Sistema</h4>
                            {systemRoles.map((role: any) => {
                                const isSelected = selectedRoleForMatrix?.slug === role.slug;
                                return (
                                    <div 
                                        key={role.slug}
                                        onClick={() => setSelectedRoleForMatrix(role)}
                                        className={cn(
                                            "p-3 rounded-xl border cursor-pointer transition-all",
                                            isSelected 
                                                ? "border-primary bg-primary/5 shadow-sm" 
                                                : "border-border hover:border-primary/30 hover:bg-muted/30"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${role.color}15` }}>
                                                <Shield className="w-4 h-4" style={{ color: role.color }} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className={cn("font-bold text-sm truncate", isSelected ? "text-primary" : "text-foreground")}>{role.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{role.slug}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Columna 2 y 3: Matrix de Permisos y Planes */}
                        {selectedRoleForMatrix ? (
                            <>
                                {/* Permisos */}
                                <div className="lg:col-span-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                                                <Key className="w-4 h-4 text-primary" /> 
                                                Permisos: {selectedRoleForMatrix.name}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                                        {Object.entries(groupedPermissions).map(([module, perms]) => (
                                            <div key={module} className="space-y-3">
                                                <h5 className="font-bold text-xs uppercase tracking-widest text-muted-foreground border-b pb-1">{module}</h5>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {(perms as any[]).map((p: any) => {
                                                        const hasPermission = rolePermissions.some(rp => rp.role_slug === selectedRoleForMatrix.slug && rp.permission_code === p.code);
                                                        return (
                                                            <div 
                                                                key={p.code}
                                                                onClick={() => handleTogglePermission(selectedRoleForMatrix.slug, p.code, hasPermission)}
                                                                className={cn(
                                                                    "flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors",
                                                                    hasPermission ? "border-emerald-500/30 bg-emerald-500/5" : "border-border hover:bg-muted"
                                                                )}
                                                            >
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-bold text-[11px] leading-tight truncate">{p.name}</p>
                                                                    <p className="text-[9px] text-muted-foreground font-mono truncate">{p.code}</p>
                                                                </div>
                                                                {hasPermission ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-2" /> : <div className="w-4 h-4 rounded-full border border-border flex-shrink-0 ml-2" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Planes Disponibles */}
                                <div className="lg:col-span-3 space-y-6">
                                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                        <h4 className="font-black text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
                                            <DollarSign className="w-4 h-4 text-amber-500" /> 
                                            Disponibilidad
                                        </h4>
                                        <p className="text-xs text-muted-foreground mb-4">Selecciona en qué planes de suscripción estará disponible este rol.</p>
                                        
                                        <div className="space-y-3">
                                            {['starter', 'pro', 'team', 'enterprise'].map(tier => {
                                                const isAvailable = planAvailability.some(pa => pa.role_slug === selectedRoleForMatrix.slug && pa.plan_tier === tier);
                                                return (
                                                    <div 
                                                        key={tier}
                                                        onClick={() => handleTogglePlan(selectedRoleForMatrix.slug, tier, isAvailable)}
                                                        className={cn(
                                                            "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors",
                                                            isAvailable ? "border-amber-500/30 bg-amber-500/5" : "border-border hover:bg-muted"
                                                        )}
                                                    >
                                                        <span className="font-black text-xs uppercase tracking-widest">{tier}</span>
                                                        {isAvailable ? <CheckCircle2 className="w-4 h-4 text-amber-500" /> : <XCircle className="w-4 h-4 text-muted-foreground/30" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="lg:col-span-9 flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl text-center h-[500px]">
                                <Shield className="w-12 h-12 text-muted-foreground/20 mb-4" />
                                <h4 className="font-bold text-lg text-foreground">Selecciona un Rol</h4>
                                <p className="text-sm text-muted-foreground max-w-sm mt-2">Haz clic en cualquier rol de la lista para gestionar sus permisos granulares y disponibilidad por plan.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="animate-in slide-in-from-left-10 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Telemetría Global</h3>
                            <p className="text-xs text-muted-foreground font-semibold">Métricas de negocio y adopción del ecosistema SaaS</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 className="w-16 h-16" /></div>
                            <CardContent className="p-6">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Tenants Activos</p>
                                <h4 className="text-3xl font-black tracking-tighter text-foreground">{analyticsData.totalOrgs}</h4>
                                <p className="text-[10px] text-emerald-500 font-bold mt-2">Organizaciones en plataforma</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16" /></div>
                            <CardContent className="p-6">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Usuarios Globales</p>
                                <h4 className="text-3xl font-black tracking-tighter text-foreground">{analyticsData.activeUsers}</h4>
                                <p className="text-[10px] text-emerald-500 font-bold mt-2">Cuentas activas totales</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-16 h-16" /></div>
                            <CardContent className="p-6">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Ingresos Históricos</p>
                                <h4 className="text-3xl font-black tracking-tighter text-foreground">${analyticsData.invoicesTotal.toFixed(2)}</h4>
                                <p className="text-[10px] text-indigo-500 font-bold mt-2">Facturado total</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-primary border border-primary-foreground/20 shadow-lg shadow-primary/20 rounded-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingUp className="w-16 h-16 text-primary-foreground" /></div>
                            <CardContent className="p-6 text-primary-foreground">
                                <p className="text-xs font-bold text-primary-foreground/80 uppercase tracking-widest mb-1">MRR / Pagado</p>
                                <h4 className="text-3xl font-black tracking-tighter">${analyticsData.estimatedMrr.toFixed(2)}</h4>
                                <p className="text-[10px] text-primary-foreground/90 font-bold mt-2">Ingresos recurrentes estimados</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-card border border-border shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase tracking-wider">Distribución por Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analyticsData.orgsByPlan.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-primary" />
                                                <span className="font-bold text-sm uppercase">{p.name}</span>
                                            </div>
                                            <span className="font-black text-lg">{p.value}</span>
                                        </div>
                                    ))}
                                    {analyticsData.orgsByPlan.length === 0 && (
                                        <p className="text-xs text-muted-foreground">No hay datos de planes.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
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

            {/* Modal: Gestión de Módulos */}
            <Dialog open={!!managingModulesOrg} onOpenChange={(open) => !open && setManagingModulesOrg(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Extensiones y Límites</DialogTitle>
                        <DialogDescription>
                            El tenant <strong>{managingModulesOrg?.name}</strong> opera bajo el plan <strong>{managingModulesOrg?.plan?.name || managingModulesOrg?.plan_tier}</strong>.
                            Usa este panel para otorgar extensiones manuales que sobrescriban los límites de su plan.
                        </DialogDescription>
                    </DialogHeader>
                    {orgLimits ? (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Max Usuarios</Label>
                                    <Input type="number" value={orgLimits.max_users} onChange={e => setOrgLimits({...orgLimits, max_users: parseInt(e.target.value) || 0})} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Max Médicos</Label>
                                    <Input type="number" value={orgLimits.max_doctors} onChange={e => setOrgLimits({...orgLimits, max_doctors: parseInt(e.target.value) || 0})} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Max Farmacias</Label>
                                    <Input type="number" value={orgLimits.max_pharmacies} onChange={e => setOrgLimits({...orgLimits, max_pharmacies: parseInt(e.target.value) || 0})} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Max Visitas/Mes</Label>
                                    <Input type="number" value={orgLimits.max_visits_monthly} onChange={e => setOrgLimits({...orgLimits, max_visits_monthly: parseInt(e.target.value) || 0})} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setManagingModulesOrg(null)}>Cancelar</Button>
                                <Button className="btn-elite-primary" onClick={saveOrgLimits}>Aplicar Extensiones</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
