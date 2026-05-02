/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Building2,
    Users,
    Shield,
    CreditCard,
    LogOut,
    Activity,
    Plus,
    Settings,
    MoreVertical,
    Loader2,
    MapPin,
    AlertCircle
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

const MasterDashboard = () => {
    // ... (rest of the component logic stays the same)
    const { signOut, user } = useAuth();
    const { toast } = useToast();
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentOrganization, setCurrentOrganization] = useState<any>({ name: '', plan_tier: 'professional' });
    const [processing, setProcessing] = useState(false);
    const [adminProfiles, setAdminProfiles] = useState<Record<string, any>>({});

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const { data: orgsData, error } = await supabase
                .from('organizations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setOrganizations(orgsData || []);

            // As owner_id doesn't exist in organizations, we might want to find admins
            // This is complex for a single fetch, so we'll fetch all profiles with is_org_admin=true
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, user_id, first_name, last_name, email, organization_id')
                .eq('is_org_admin', true);

            if (profiles) {
                const profileMap: Record<string, any> = {};
                profiles.forEach(profile => {
                    if (profile.organization_id) {
                        profileMap[profile.organization_id] = profile;
                    }
                });
                setAdminProfiles(profileMap);
            }
        } catch (error) {
            console.error('Error fetching organizations:', error);
            toast({
                title: "Error cargando organizaciones",
                description: "No se pudieron obtener los datos.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrganization = async () => {
        if (!currentOrganization.name.trim()) {
            toast({ title: "Error", description: "El nombre es requerido.", variant: "destructive" });
            return;
        }

        try {
            setProcessing(true);
            const slug = currentOrganization.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const { error } = await supabase
                .from('organizations')
                .insert({
                    name: currentOrganization.name,
                    slug: slug,
                    plan_tier: currentOrganization.plan_tier,
                    subscription_status: 'active'
                });

            if (error) throw error;

            toast({ title: "Éxito", description: "Organización creada correctamente." });
            setIsCreateOpen(false);
            setCurrentOrganization({ name: '', plan_tier: 'professional' });
            fetchOrganizations();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    const handleEditOrganization = async () => {
        if (!currentOrganization.name.trim()) return;

        try {
            setProcessing(true);
            const { error } = await supabase
                .from('organizations')
                .update({
                    name: currentOrganization.name,
                    plan_tier: currentOrganization.plan_tier
                })
                .eq('id', currentOrganization.id);

            if (error) throw error;

            toast({ title: "Éxito", description: "Organización actualizada." });
            setIsEditOpen(false);
            setCurrentOrganization({ name: '', plan_tier: 'professional' });
            fetchOrganizations();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteOrganization = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar "${name}"? Esta acción es irreversible.`)) return;

        try {
            const { error } = await supabase.from('organizations').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Organización eliminada", description: "Los datos han sido borrados." });
            fetchOrganizations();
        } catch (error: any) {
            toast({ title: "Error", description: "No se pudo eliminar la organización.", variant: "destructive" });
        }
    };

    const openEdit = (org: any) => {
        setCurrentOrganization({ ...org });
        setIsEditOpen(true);
    };

    const getAdminName = (orgId: string) => {
        const profile = adminProfiles[orgId];
        if (profile) return `${profile.first_name} ${profile.last_name}`;
        return "N/A";
    };

    const calculateMRR = () => {
        return organizations.reduce((acc, curr) => {
            const price = curr.plan_tier === 'enterprise' ? 299 : curr.plan_tier === 'professional' ? 99 : 0;
            return acc + price;
        }, 0);
    };

    return (
        <div className="min-h-screen bg-[#f8fbff]">
            {/* Master Header - Corporate Blue Gradient */}
            <header className="bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-background/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="container mx-auto px-6 py-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-background/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tighter">MedVisit MASTER</h1>
                                <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Super Admin Control</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block border-r border-white/20 pr-6">
                                <p className="text-sm font-black">{user?.email}</p>
                                <Badge variant="outline" className="bg-background/10 text-white border-white/30 text-[9px] font-bold h-4">
                                    AUTH MASTER
                                </Badge>
                            </div>
                            <Button variant="ghost" size="icon" onClick={signOut} className="text-white hover:bg-background/20 rounded-full w-10 h-10 transition-transform active:scale-90">
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-10">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <Card className="corporate-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[10px] font-black text-text-muted uppercase tracking-widest">Organizaciones Activas</CardTitle>
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Building2 className="w-4 h-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-text-main">{organizations.length}</div>
                            <p className="text-xs text-text-muted font-bold mt-1">Tenant Infrastructure</p>
                        </CardContent>
                    </Card>
                    <Card className="corporate-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[10px] font-black text-text-muted uppercase tracking-widest">MRR Global</CardTitle>
                            <div className="p-2 bg-secondary/10 rounded-lg">
                                <CreditCard className="w-4 h-4 text-secondary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-primary">${calculateMRR().toLocaleString()}</div>
                            <p className="text-xs text-text-muted font-bold mt-1">Mensual recurrente</p>
                        </CardContent>
                    </Card>
                    <Card className="corporate-card col-span-1 md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[10px] font-black text-text-muted uppercase tracking-widest">Estado del Ecosistema</CardTitle>
                            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                <Activity className="w-3 h-3 animate-pulse" />
                                <span className="text-[9px] font-bold">OPERACIONAL</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex items-end justify-between">
                            <div>
                                <div className="text-3xl font-black text-emerald-600">100% Uptime</div>
                                <p className="text-xs text-text-muted font-bold mt-1">Health score across nodes</p>
                            </div>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-primary text-white"></div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Organizations Management */}
                <Card className="corporate-card shadow-xl overflow-hidden">
                    <CardHeader className="bg-muted border-b border-border py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl font-black text-text-main tracking-tight">Gestión de Tenants</CardTitle>
                                <CardDescription className="font-bold text-text-muted">Administración centralizada de infraestructura SaaS</CardDescription>
                            </div>
                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 font-black text-xs uppercase tracking-widest px-6 rounded-full h-11 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nueva Organización
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-2xl border-none shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black tracking-tighter">Registrar Nueva Organización</DialogTitle>
                                        <DialogDescription className="font-bold">Configuración inicial de tenant para el ecosistema MedVisit.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-text-muted">Nombre Comercial</Label>
                                            <Input
                                                id="name"
                                                placeholder="Ej: PharmaGroup S.A."
                                                className="h-12 rounded-xl border-border bg-muted/50 font-bold focus:ring-primary"
                                                value={currentOrganization.name}
                                                onChange={(e) => setCurrentOrganization({ ...currentOrganization, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="plan" className="text-[10px] font-black uppercase tracking-widest text-text-muted">Nivel de Suscripción</Label>
                                            <Select
                                                value={currentOrganization.plan_tier}
                                                onValueChange={(val) => setCurrentOrganization({ ...currentOrganization, plan_tier: val })}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-border bg-muted/50 font-bold">
                                                    <SelectValue placeholder="Selecciona un plan" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="free">Basic (Standard)</SelectItem>
                                                    <SelectItem value="professional">Pro (Business)</SelectItem>
                                                    <SelectItem value="enterprise">Enterprise (Global)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button onClick={handleCreateOrganization} disabled={processing} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs">
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            INICIALIZAR TENANT
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-20">
                                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary opacity-50" />
                                <p className="text-text-muted font-bold mt-4 uppercase tracking-[0.2em] text-[10px]">Sincronizando Base de Datos...</p>
                            </div>
                        ) : organizations.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Building2 className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <p className="text-text-muted font-black text-lg">No hay infraestructuras activas.</p>
                                <p className="text-sm text-text-muted/60 font-medium">Comienza registrando un nuevo cliente corporativo.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="border-b-gray-100 hover:bg-transparent">
                                            <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">IDENTIDAD CORPORATIVA</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-muted">NIVEL</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-muted">ESTADO</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-muted">ADMINISTRADOR</TableHead>
                                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-text-muted px-6">GESTIÓN</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {organizations.map((org) => (
                                            <TableRow key={org.id} className="border-b-gray-50 hover:bg-blue-50/30 transition-colors group">
                                                <TableCell className="py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                                                            {org.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-text-main text-base">{org.name}</span>
                                                            <span className="text-[10px] text-text-muted font-extrabold flex items-center gap-1 uppercase tracking-tight">
                                                                <MapPin className="w-3 h-3" /> Tenant ID: {org.id.substring(0, 8)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`rounded-md font-black text-[9px] uppercase px-2 py-0.5 ${org.plan_tier === 'enterprise' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                        org.plan_tier === 'professional' ? 'bg-primary/5 border-primary/20 text-primary' :
                                                            'bg-slate-50 border-slate-200 text-slate-700'
                                                        }`}>
                                                        {org.plan_tier || 'Free'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${org.subscription_status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                                        <span className={`text-[10px] font-black uppercase ${org.subscription_status === 'active' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                            {org.subscription_status || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
                                                            {(getAdminName(org.id)[0] || '?').toUpperCase()}
                                                        </div>
                                                        <span className="text-xs font-bold text-text-main">{getAdminName(org.id)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-muted">
                                                                <MoreVertical className="h-4 w-4 text-text-muted" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-2xl border-border">
                                                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-text-muted px-3 py-2">Operaciones</DropdownMenuLabel>
                                                            <DropdownMenuItem className="rounded-lg font-bold text-sm cursor-pointer py-2.5" onClick={() => openEdit(org)}>
                                                                <Settings className="w-4 h-4 mr-3 text-primary" />
                                                                Configurar Tenant
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-muted" />
                                                            <DropdownMenuItem className="rounded-lg font-bold text-sm cursor-pointer py-2.5 text-destructive hover:bg-destructive/5" onClick={() => handleDeleteOrganization(org.id, org.name)}>
                                                                <LogOut className="w-4 h-4 mr-3" />
                                                                Eliminar Ecosistema
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="rounded-2xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tighter">Editar Organización</DialogTitle>
                            <DialogDescription className="font-bold">Modificar parámetros de suscripción y metadatos.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-widest text-text-muted">Nombre Comercial</Label>
                                <Input
                                    id="edit-name"
                                    className="h-12 rounded-xl border-border bg-muted/50 font-bold focus:ring-primary"
                                    value={currentOrganization.name}
                                    onChange={(e) => setCurrentOrganization({ ...currentOrganization, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-plan" className="text-[10px] font-black uppercase tracking-widest text-text-muted">Nivel de Suscripción</Label>
                                <Select
                                    value={currentOrganization.plan_tier}
                                    onValueChange={(val) => setCurrentOrganization({ ...currentOrganization, plan_tier: val })}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-border bg-muted/50 font-bold">
                                        <SelectValue placeholder="Selecciona un plan" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="free">Basic</SelectItem>
                                        <SelectItem value="professional">Pro</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button onClick={handleEditOrganization} disabled={processing} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs">
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                GUARDAR CAMBIOS
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div >
    );
};

export default MasterDashboard;
