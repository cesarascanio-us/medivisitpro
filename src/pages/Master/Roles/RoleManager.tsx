/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Tables']['app_roles']['Row'];
type AppPermission = Database['public']['Tables']['app_permissions']['Row'];
type RolePermission = Database['public']['Tables']['role_permissions']['Row'];
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Edit, Trash2, Save, X, Lock } from "lucide-react";

export default function RoleManager() {
    const { isMaster, isAdmin, user } = useAuth();
    const { toast } = useToast();
    const [roles, setRoles] = useState<AppRole[]>([]);
    const [permissions, setPermissions] = useState<AppPermission[]>([]);
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit/Create State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<AppRole | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        color: "bg-slate-100 text-slate-800 border-slate-200"
    });
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isMaster || isAdmin) {
            loadData();
        }
    }, [isMaster, isAdmin]);

    // [AUTO-INIT] Seed default permissions for Manager Controls
    const seedDefaultPermissions = async () => {
        try {
            const newPerms = [
                { code: 'objectives.assign', name: 'Asignar Objetivos', description: 'Permite asignar objetivos a otros usuarios', module: 'Objectives' },
                { code: 'orders.approve', name: 'Aprobar Pedidos', description: 'Permite aprobar, rechazar o confirmar pedidos', module: 'Orders' }
            ];

            let seeded = false;

            for (const p of newPerms) {
                // Check if exists
                const { data } = await supabase.from('app_permissions').select('id').eq('code', p.code).maybeSingle();
                if (!data) {
                    await supabase.from('app_permissions').insert(p);
                    seeded = true;
                    // Auto-assign to Manager, Supervisor, Coordinator
                    const rolesToAssign = ['manager', 'supervisor', 'coordinator', 'master', 'admin'];
                    for (const roleSlug of rolesToAssign) {
                        await supabase.from('role_permissions').insert({ role_slug: roleSlug, permission_code: p.code });
                    }
                }
            }

            if (seeded) {
                toast({ title: "Sistema Actualizado", description: "Se han registrado nuevos permisos de control gerencial." });
                loadData();
            }
        } catch (e) {
            console.error("Error seeding perms:", e);
        }
    };

    useEffect(() => {
        seedDefaultPermissions();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('app_roles')
                .select('*')
                .order('is_system', { ascending: false }) // System roles first
                .order('name');

            if (rolesError) throw rolesError;

            // 2. Fetch Permissions
            const { data: permsData, error: permsError } = await supabase
                .from('app_permissions')
                .select('*')
                .order('module, name');

            if (permsError) throw permsError;

            // 3. Fetch Role-Permissions (All)
            const { data: rolePermsData, error: rpError } = await supabase
                .from('role_permissions')
                .select('*');

            if (rpError) throw rpError;

            setRoles((rolesData as AppRole[]) || []);
            setPermissions((permsData as AppPermission[]) || []);
            setRolePermissions((rolePermsData as RolePermission[]) || []);

        } catch (error: any) {
            console.error("Error loading RBAC data:", error);
            toast({
                title: "Error cargando roles",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (role: AppRole) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            slug: role.slug,
            description: role.description || "",
            color: role.color || "bg-slate-100 text-slate-800 border-slate-200"
        });

        // Find permissions for this role
        const rolePerms = rolePermissions
            .filter(rp => rp.role_slug === role.slug)
            .map(rp => rp.permission_code);

        setSelectedPermissions(rolePerms);
        setIsDialogOpen(true);
    };

    const handleCreateClick = () => {
        setEditingRole(null);
        setFormData({
            name: "",
            slug: "",
            description: "",
            color: "bg-slate-100 text-slate-800 border-slate-200"
        });
        setSelectedPermissions([]);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.slug) {
            toast({ title: "Error", description: "Nombre y slug son obligatorios", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const rolePayload = {
                slug: formData.slug.toLowerCase().replace(/\s+/g, '_'),
                name: formData.name,
                description: formData.description,
                color: formData.color,
                // is_system defaults to false for new, preserved for edit
            };

            let savedSlug = rolePayload.slug;

            if (editingRole) {
                // UPDATE
                const { error } = await supabase
                    .from('app_roles')
                    .update(rolePayload)
                    .eq('id', editingRole.id);

                if (error) throw error;
                savedSlug = editingRole.slug; // Slug usually doesn't change for system roles, but for custom could
            } else {
                // CREATE
                const { error } = await supabase
                    .from('app_roles')
                    .insert(rolePayload);

                if (error) throw error;
            }

            // Sync Permissions
            // Strategy: Verify difference and update. 
            // Simplified: Delete all for this role and re-insert. 
            // Note: RLS policies must allow this.

            // 1. Delete existing
            const { error: delError } = await supabase
                .from('role_permissions')
                .delete()
                .eq('role_slug', savedSlug);

            if (delError) throw delError;

            // 2. Insert new selections
            if (selectedPermissions.length > 0) {
                const insertData = selectedPermissions.map(code => ({
                    role_slug: savedSlug,
                    permission_code: code
                }));

                const { error: insError } = await supabase
                    .from('role_permissions')
                    .insert(insertData);

                if (insError) throw insError;
            }

            toast({
                title: editingRole ? "Perfil Actualizado" : "Nuevo Perfil Creado",
                description: "La configuración de accesos se ha guardado exitosamente."
            });

            setIsDialogOpen(false);
            loadData(); // Refresh full table

        } catch (error: any) {
            console.error("Error saving role:", error);
            toast({
                title: "Error guardando",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (role: AppRole) => {
        if (role.is_system) return;

        if (!confirm(`¿Estás seguro de eliminar el perfil "${role.name}"? Esta acción es irreversible.`)) return;

        try {
            const { error } = await supabase
                .from('app_roles')
                .delete()
                .eq('id', role.id);

            if (error) throw error;

            toast({ title: "Perfil eliminado", description: "El rol ha sido eliminado correctamente del sistema." });
            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const togglePermission = (code: string) => {
        setSelectedPermissions(prev =>
            prev.includes(code)
                ? prev.filter(p => p !== code)
                : [...prev, code]
        );
    };

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
    }, {} as Record<string, AppPermission[]>);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Perfiles y Niveles de Acceso</h2>
                    <p className="text-slate-500">Configure los roles de usuario y sus permisos dentro de la plataforma.</p>
                </div>
                <Button onClick={handleCreateClick} className="bg-slate-900 hover:bg-slate-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Nuevo Perfil
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Perfiles Activos</CardTitle>
                    <CardDescription>
                        {roles.length} perfiles configurados. Los roles de sistema (candado) son esenciales y no pueden eliminarse.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre del Perfil</TableHead>
                                <TableHead>Identificador</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Acceso</TableHead>
                                <TableHead className="text-right">Gestionar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => {
                                const count = rolePermissions.filter(rp => rp.role_slug === role.slug).length;
                                return (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={role.color || ""}>
                                                    {role.name}
                                                </Badge>
                                                {role.is_system && <Lock className="h-3 w-3 text-slate-400" title="Rol de Sistema" />}
                                            </div>
                                        </TableCell>
                                        <TableCell><code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{role.slug}</code></TableCell>
                                        <TableCell className="text-sm text-slate-600">{role.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-xs">
                                                {count} permisos
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditClick(role)}>
                                                    <Edit className="h-4 w-4 text-slate-500" />
                                                </Button>
                                                {!role.is_system && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(role)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? "Editar Perfil" : "Crear Nuevo Perfil"}</DialogTitle>
                        <DialogDescription>Ajusta los detalles del rol y sus niveles de autorización.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre del Perfil</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Auditor Senior"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Identificador (Slug)</Label>
                                <Input
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="Ej. auditor_senior"
                                    disabled={editingRole?.is_system}
                                />
                                {editingRole?.is_system && <p className="text-[10px] text-amber-600">Identificador sistema protegido</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción Funcional</Label>
                            <Input
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe el propósito y alcance de este rol"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Color Distintivo (Estilo Visual)</Label>
                            <Input
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                placeholder="bg-color-100 text-color-700 border-color-200"
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-slate-500">Vista previa:</span>
                                <Badge variant="outline" className={formData.color}>{formData.name || "Ejemplo"}</Badge>
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-semibold mb-3">Permisos y Accesos</h3>
                            <div className="space-y-6">
                                {Object.entries(groupedPermissions).map(([module, perms]) => (
                                    <div key={module} className="bg-slate-50 p-4 rounded-lg border">
                                        <h4 className="font-medium text-slate-800 mb-3 border-b pb-2">{module}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {perms.map(perm => (
                                                <div key={perm.code} className="flex items-start gap-2">
                                                    <Checkbox
                                                        id={`perm-${perm.code}`}
                                                        checked={selectedPermissions.includes(perm.code)}
                                                        onCheckedChange={() => togglePermission(perm.code)}
                                                    />
                                                    <div className="grid gap-0.5">
                                                        <Label htmlFor={`perm-${perm.code}`} className="font-medium text-sm cursor-pointer">
                                                            {perm.name}
                                                        </Label>
                                                        <p className="text-[10px] text-slate-500 leading-tight">
                                                            {perm.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
