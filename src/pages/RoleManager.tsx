
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
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
import { toast } from "@/components/ui/use-toast";
import { Shield, Plus, Edit, Trash2, Lock, Save } from "lucide-react";

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="h-6 w-6 text-purple-600" />
                        Gestión de Roles y Permisos (RBAC)
                    </h2>
                    <p className="text-muted-foreground">Define roles personalizados y sus privilegios en el sistema.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" /> Nuevo Rol
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles.map(role => (
                    <Card key={role.slug} className="relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${role.color.split(' ')[0] || 'bg-gray-200'}`} />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {role.name}
                                    {role.is_system && <Lock className="h-3 w-3 text-muted-foreground" title="Rol del Sistema" />}
                                </CardTitle>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(role)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    {!role.is_system && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRole(role.slug)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <CardDescription>{role.description || "Sin descripción"}</CardDescription>
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
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
                        <DialogDescription>Configura los detalles del rol y sus permisos de acceso.</DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4">
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

                    <DialogFooter className="pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveRole}>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
