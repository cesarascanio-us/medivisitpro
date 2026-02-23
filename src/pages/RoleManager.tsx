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
                slug: formData.slug, // ID for update if exists (simplified logic for this UI, usually ID is better but slug is key here)
                name: formData.name,
                description: formData.description,
                color: formData.color,
                // Only allow editing slug if it's new. If existing, slug shouldn't change easily without cascading.
                // For this simple implementation, we assume slug is immutable for existing roles.
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
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 space-y-6">
            {/* Premium White Header Container */}
            <header className="bg-white dark:bg-slate-900 px-6 py-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden -mt-2 mx-1">
                {/* Decorative backgrounds */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none transform transition-transform hover:scale-105">
                            <Shield className="text-white h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Administración de Seguridad</p>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Gestión de Roles y Permisos
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-none font-bold text-[10px] px-2.5 py-0.5 uppercase tracking-wider">
                                    RBAC Control
                                </Badge>
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{roles.length} Roles Activos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={loadData}
                            size="icon"
                            variant="outline"
                            className="w-12 h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all active:scale-95 group"
                        >
                            <RefreshCw className={cn("h-5 w-5 text-slate-500 group-hover:text-indigo-600 transition-colors", loading && "animate-spin")} />
                        </Button>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-6 font-black shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Nuevo Rol
                        </Button>
                    </div>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {roles.map(role => (
                    <Card key={role.slug} className="relative overflow-hidden border-none shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] group hover:scale-[1.02] transition-all duration-300">
                        <div className={cn("absolute top-0 left-0 w-1.5 h-full", role.color.split(' ')[0] || 'bg-slate-200')} />
                        <CardHeader className="p-6 pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    {role.name}
                                    {role.is_system && <Lock className="h-4 w-4 text-amber-500" />}
                                </CardTitle>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600" onClick={() => handleOpenDialog(role)}>
                                        <Edit className="h-4.5 w-4.5" />
                                    </Button>
                                    {!role.is_system && (
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-500 hover:text-rose-600" onClick={() => handleDeleteRole(role.slug)}>
                                            <Trash2 className="h-4.5 w-4.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <CardDescription className="text-slate-500 font-medium text-xs mt-1">
                                {role.description || "Sin descripción detallada"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-2">Permisos ({role.permissions?.length || 0}):</div>
                            <div className="flex flex-wrap gap-1">
                                {role.permissions?.slice(0, 5).map(code => (
                                    <Badge key={code} variant="outline" className="text-[10px] px-1 py-0 h-5">
                                        {permissions.find(p => p.code === code)?.name || code}
                                    </Badge>
                                ))}
                                {(role.permissions?.length || 0) > 5 && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                        +{role.permissions!.length - 5} más
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="bg-slate-50 dark:bg-slate-900 p-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {editingRole ? 'Configurar Rol' : 'Nuevo Rol del Sistema'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Defina las capacidades y nivel de acceso para este perfil de usuario.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 px-8">
                        <div className="space-y-6 py-4">
                            {/* Role Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre del Rol</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Auditor Senior"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Identificador (Slug)</Label>
                                    <Input
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                        placeholder="ej: auditor_senior"
                                        disabled={!!editingRole} // Lock slug for edits
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Color (Clases Tailwind)</Label>
                                    <Input
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        placeholder="ej: bg-blue-100 text-blue-800"
                                    />
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        Preview: <Badge className={formData.color}>Rol Badge</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            <div className="space-y-4 border-t pt-4">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Permisos del Sistema</h3>
                                {Object.entries(permissionsByModule).map(([module, perms]) => (
                                    <div key={module} className="space-y-3">
                                        <h4 className="text-sm font-medium bg-slate-50 p-2 rounded">{module}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                            {perms.map(p => (
                                                <div key={p.code} className="flex items-start space-x-2">
                                                    <Checkbox
                                                        id={`perm-${p.code}`}
                                                        checked={formData.selectedPermissions.includes(p.code)}
                                                        onCheckedChange={() => togglePermission(p.code)}
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <Label
                                                            htmlFor={`perm-${p.code}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {p.name}
                                                        </Label>
                                                        <p className="text-[11px] text-muted-foreground">
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

                    <DialogFooter className="bg-slate-50 dark:bg-slate-900 p-6 px-8 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSaveRole}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 font-black shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
