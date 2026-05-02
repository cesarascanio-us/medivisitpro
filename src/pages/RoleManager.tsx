/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect, cloneElement } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Edit, Trash2, Lock, Save, RefreshCw, LayoutDashboard, Search } from "lucide-react";

interface AppRole {
    id: string;
    slug: string;
    name: string;
    description: string;
    is_system: boolean;
    color: string;
    permissions?: string[]; // Code array
}

interface AppPermission {
    code: string;
    name: string;
    module: string;
    description: string;
}

export default function RoleManager() {
    const { isMaster } = useAuth();
    const { toast } = useToast();
    const [roles, setRoles] = useState<AppRole[]>([]);
    const [permissions, setPermissions] = useState<AppPermission[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<AppRole | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        slug: "",
        name: "",
        description: "",
        color: "bg-slate-100 text-slate-800",
        selectedPermissions: [] as string[]
    });

    useEffect(() => {
        if (isMaster) {
            loadData();
        }
    }, [isMaster]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('app_roles')
                .select('*')
                .order('name');

            if (rolesError) throw rolesError;

            // 2. Fetch Permissions
            const { data: permsData, error: permsError } = await supabase
                .from('app_permissions')
                .select('*')
                .order('module, name');

            if (permsError) throw permsError;
            setPermissions(permsData || []);

            // 3. Fetch Role-Permissions
            const { data: rolePermsData, error: rpError } = await supabase
                .from('role_permissions')
                .select('role_slug, permission_code');

            if (rpError) throw rpError;

            // Map permissions to roles
            const rolesWithPerms = rolesData?.map(role => ({
                ...role,
                permissions: rolePermsData
                    ?.filter(rp => rp.role_slug === role.slug)
                    .map(rp => rp.permission_code) || []
            })) || [];

            setRoles(rolesWithPerms);
        } catch (error: any) {
            console.error('Error loading RBAC data:', error);
            toast({
                title: "Error cargando roles",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (role?: AppRole) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                slug: role.slug,
                name: role.name,
                description: role.description || "",
                color: role.color || "bg-slate-100 text-slate-800",
                selectedPermissions: role.permissions || []
            });
        } else {
            setEditingRole(null);
            setFormData({
                slug: "",
                name: "",
                description: "",
                color: "bg-slate-100 text-slate-800",
                selectedPermissions: []
            });
        }
        setIsDialogOpen(true);
    };

    const handleSaveRole = async () => {
        try {
            if (!formData.slug || !formData.name) {
                toast({ title: "Error", description: "Nombre y SLUG son obligatorios", variant: "destructive" });
                return;
            }

            // 1. Upsert Role
            const rolePayload = {
                slug: formData.slug, 
                name: formData.name,
                description: formData.description,
                color: formData.color,
            };

            if (editingRole && editingRole.slug !== formData.slug) {
                toast({ title: "Error", description: "No se puede cambiar el ID (slug) de un rol existente.", variant: "destructive" });
                return;
            }

            const { error: roleError } = await supabase
                .from('app_roles')
                .upsert(rolePayload, { onConflict: 'slug' });

            if (roleError) throw roleError;

            // 2. Update Permissions
            // Delete existing
            const { error: delError } = await supabase
                .from('role_permissions')
                .delete()
                .eq('role_slug', formData.slug);

            if (delError) throw delError;

            // Insert new
            if (formData.selectedPermissions.length > 0) {
                const rpPayload = formData.selectedPermissions.map(code => ({
                    role_slug: formData.slug,
                    permission_code: code
                }));

                const { error: insError } = await supabase
                    .from('role_permissions')
                    .insert(rpPayload);

                if (insError) throw insError;
            }

            toast({ title: "Rol Guardado", description: "Los cambios se han aplicado correctamente." });
            setIsDialogOpen(false);
            loadData();
        } catch (error: any) {
            console.error('Save role error:', error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteRole = async (slug: string) => {
        if (!confirm(`¿Estás seguro de eliminar el rol '${slug}'? Esto afectará a los usuarios asignados.`)) return;

        try {
            const { error } = await supabase.from('app_roles').delete().eq('slug', slug);
            if (error) throw error;
            toast({ title: "Rol Eliminado" });
            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const togglePermission = (code: string) => {
        setFormData(prev => {
            const exists = prev.selectedPermissions.includes(code);
            return {
                ...prev,
                selectedPermissions: exists
                    ? prev.selectedPermissions.filter(p => p !== code)
                    : [...prev.selectedPermissions, code]
            };
        });
    };

    // Group permissions by module
    const permissionsByModule = permissions.reduce((acc, curr) => {
        if (!acc[curr.module]) acc[curr.module] = [];
        acc[curr.module].push(curr);
        return acc;
    }, {} as Record<string, AppPermission[]>);

    if (!isMaster) return <div className="p-8 text-center text-red-500">Acceso Denegado</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50/30 space-y-8 p-1">
            {/* HEADER INDUSTRIAL ELITE - GESTIÓN DE SEGURIDAD */}
            <header className="bg-card px-8 py-10 rounded-[3rem] shadow-premium-sm border border-slate-100 relative overflow-hidden">
                {/* Decorative backgrounds */}
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl opacity-40" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-slate-50 rounded-full blur-3xl opacity-40 text-slate-900" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center shadow-premium-md border border-primary/20 rotate-3 hover:rotate-0 transition-transform group">
                            <Shield className="text-primary h-10 w-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-2 font-display">Administración de Seguridad</p>
                            <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase font-display leading-none">
                                Roles & Permisos
                            </h1>
                            <div className="flex items-center gap-3 mt-4">
                                <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[9px] px-3 py-1.5 uppercase tracking-widest leading-none">RBAC Protocol V6.0</Badge>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-slate-900">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">{roles.length} Roles Activos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={loadData}
                            size="icon"
                            variant="ghost"
                            className="w-14 h-14 rounded-2xl bg-card border border-slate-100 hover:bg-slate-50 hover:shadow-premium-sm transition-all shadow-sm group"
                        >
                            <RefreshCw className={cn("h-6 w-6 text-slate-300 group-hover:text-primary transition-colors", loading && "animate-spin text-primary")} />
                        </Button>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="bg-primary hover:bg-primary/90 text-white shadow-premium-md font-black uppercase tracking-widest text-[10px] h-14 px-10 rounded-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="h-5 w-5 mr-3" />
                            Nuevo Rol
                        </Button>
                    </div>
                </div>
            </header>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {roles.map(role => (
                    <Card key={role.slug} className="relative overflow-hidden border border-slate-100 shadow-premium-sm bg-card rounded-[3rem] group hover:shadow-premium-md transition-all duration-500">
                        <div className={cn("absolute top-0 left-0 w-2 h-full opacity-10", role.color.split(' ')[0] || 'bg-slate-200')} />
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase font-display flex items-center gap-3">
                                    {role.name}
                                    {role.is_system && (
                                        <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-slate-900">
                                            <Lock className="h-3 w-3 text-amber-500" />
                                        </div>
                                    )}
                                </CardTitle>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-300 hover:text-primary" onClick={() => handleOpenDialog(role)}>
                                        <Edit className="h-5 w-5" />
                                    </Button>
                                    {!role.is_system && (
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-600" onClick={() => handleDeleteRole(role.slug)}>
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 font-display leading-relaxed">
                                {role.description || "Sin descripción detallada de privilegios"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4 font-display">Matriz de Acceso ({role.permissions?.length || 0})</p>
                            <div className="flex flex-wrap gap-2">
                                {role.permissions?.slice(0, 4).map(code => (
                                    <Badge key={code} variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 border-slate-100 text-slate-400">
                                        {permissions.find(p => p.code === code)?.name || code}
                                    </Badge>
                                ))}
                                {(role.permissions?.length || 0) > 4 && (
                                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-primary/5 text-primary border-none">
                                        +{role.permissions!.length - 4} Privilegios
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] rounded-[3.5rem] border-none shadow-premium-lg p-0 overflow-hidden flex flex-col font-sans">
                    <DialogHeader className="bg-card p-12 pb-8 border-b border-slate-100 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase font-display leading-none relative z-10">
                            {editingRole ? 'Configurar Privilegios' : 'Nueva Entidad de Acceso'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-bold text-xs mt-4 uppercase tracking-widest relative z-10">
                            Protocolo de Definición de Roles Estructurales
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 px-12 py-8 bg-slate-50/50">
                        <div className="space-y-10">
                            {/* Role Details */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">Designación del Rol</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: AUDITOR MAESTRO"
                                        className="h-16 rounded-2xl border-transparent bg-card font-bold text-foreground focus:ring-primary/20 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">Identificador Único (Slug)</Label>
                                    <Input
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                        placeholder="ej: auditor_maestro"
                                        disabled={!!editingRole} 
                                        className="h-16 rounded-2xl border-transparent bg-card font-black text-primary focus:ring-primary/20 shadow-sm disabled:opacity-50"
                                    />
                                </div>
                                <div className="col-span-2 space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">Propósito Técnico</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="rounded-2xl border-transparent bg-card font-bold text-foreground focus:ring-primary/20 shadow-sm min-h-[100px]"
                                        placeholder="Describa el alcance de este rol..."
                                    />
                                </div>
                                <div className="col-span-2 space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">Token Visual (Tailwind Color)</Label>
                                    <div className="flex gap-4">
                                        <Input
                                            value={formData.color}
                                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                                            placeholder="ej: bg-blue-50 text-blue-600"
                                            className="h-16 rounded-2xl border-transparent bg-card font-bold text-foreground shadow-sm flex-1"
                                        />
                                        <div className="flex items-center px-6 rounded-2xl bg-card shadow-sm border border-slate-100">
                                            <Badge className={cn("px-4 py-2 rounded-full border-none font-black text-[10px] uppercase tracking-widest", formData.color)}>Vista Previa</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            <div className="space-y-8 pt-8 border-t border-slate-200">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-display flex items-center gap-3">
                                    <Shield className="h-4 w-4" /> Matriz de Permisos Operativos
                                </h3>
                                {Object.entries(permissionsByModule).map(([module, perms]) => (
                                    <div key={module} className="bg-card rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transform transition-all hover:shadow-md">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] bg-slate-50 text-slate-400 border-b border-slate-100 px-8 py-4 font-display flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary text-white" />
                                            {module}
                                        </h4>
                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {perms.map(p => (
                                                <div key={p.code} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                                                    <Checkbox
                                                        id={`perm-${p.code}`}
                                                        checked={formData.selectedPermissions.includes(p.code)}
                                                        onCheckedChange={() => togglePermission(p.code)}
                                                        className="mt-1 w-5 h-5 rounded-lg border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <Label
                                                            htmlFor={`perm-${p.code}`}
                                                            className="text-xs font-black uppercase tracking-tight text-slate-700 cursor-pointer group-hover:text-primary transition-colors font-display"
                                                        >
                                                            {p.name}
                                                        </Label>
                                                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                                                            {p.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="bg-card p-10 px-12 border-t border-slate-100">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-16 rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                            Abortar Cambios
                        </Button>
                        <Button
                            onClick={handleSaveRole}
                            className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-16 px-12 font-black uppercase text-[10px] tracking-widest shadow-premium-md transition-all active:scale-95 flex items-center gap-3"
                        >
                            <Save className="h-5 w-5" />
                            Consolidar Configuración
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
