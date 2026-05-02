/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, cloneElement } from "react";
import { Plus, UserRound, Shield, Building, Search, Trash2, Edit, Check, X, MapPin, Globe, ChevronsUpDown, Loader2, RefreshCw, LayoutDashboard, Users as UsersIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getAllRegions, getStatesInRegion, getAllStates } from "@/constants/regions";
import { cn } from "@/lib/utils";

interface Zone {
    id: string;
    name: string;
    state: string | null;
    region: string | null;
}

interface UserWithRole {
    id: string;
    user_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: UserRole;
    organization_id: string | null;
    zone_id: string | null; // Keep for legacy/compat
    assigned_zones: Zone[]; // New field for multiple zones
    state: string | null;
    region: string | null;
    is_active: boolean;
    created_at: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
    master: 'Master Elite CA',
    organization_admin: 'Admin de Organización',
    admin: 'Administrador',
    manager: 'Gerente',
    coordinator: 'Coordinador',
    supervisor: 'Supervisor',
    representative: 'Representante',
    chief: 'Jefe de Zona',
    store_manager: 'Gerente de Tienda',
    doctor: 'Médico',
    pharmacist: 'Farmacéutico',
    service_chief: 'Jefe de Servicios',
    telemarketing: 'Telemarketing',
    admin_saas: 'SaaS Admin',
    soporte_saas: 'SaaS Soporte',
    desarrollo_saas: 'SaaS Dev'
};


const ROLE_COLORS: Record<UserRole, string> = {
    master: 'bg-primary/10 text-primary border-primary/20',
    organization_admin: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    admin: 'bg-red-500/10 text-red-500 border-red-500/20',
    manager: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    coordinator: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    supervisor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    representative: 'bg-slate-50 text-slate-500 border-border/40',
    chief: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    store_manager: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    doctor: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    pharmacist: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    service_chief: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    telemarketing: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    admin_saas: 'bg-slate-900 text-white',
    soporte_saas: 'bg-slate-500 text-white',
    desarrollo_saas: 'bg-primary text-white'
};


export default function Users() {
    const { user, canManageUsers, isMaster, profile } = useAuth();
    const organizationId = profile?.organization_id;
    const { toast } = useToast();
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Editing state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);

    // Form States
    const [selectedRole, setSelectedRole] = useState<UserRole>('representative');
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedZones, setSelectedZones] = useState<string[]>([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [openZoneCombobox, setOpenZoneCombobox] = useState(false);

    useEffect(() => {
        if (user) {
            loadUsers();
            loadZones();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Initial load of form when opening dialog
    useEffect(() => {
        if (editingUser) {
            setSelectedRole(editingUser.role);
            setSelectedRegion(editingUser.region || '');
            setSelectedState(editingUser.state || '');
            setSelectedZones(editingUser.assigned_zones?.map(z => z.id) || []);
            setFirstName(editingUser.first_name || '');
            setLastName(editingUser.last_name || '');
        } else {
            // Reset form
            setSelectedRole('representative');
            setSelectedRegion('');
            setSelectedState('');
            setSelectedZones([]);
            setFirstName('');
            setLastName('');
        }
    }, [editingUser]);

    // Reset downstream selections when upstream changes
    useEffect(() => {
        if (selectedRegion) {
            // If we change region, we might keep state if it belongs, or clear it
            const statesInRegion = getStatesInRegion(selectedRegion);
            if (selectedState && !statesInRegion.includes(selectedState)) {
                setSelectedState('');
                setSelectedZones([]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRegion]);

    useEffect(() => {
        // When state changes, we might want to clear zones if they don't match anymore
        // But for simplicity, we just filter them visually. 
        // Actually good UX: clear zones that are not available
        if (selectedState) {
            const availableZones = getAvailableZones();
            // Check if selected zones are still valid
            const validZoneIds = new Set(availableZones.map(z => z.id));
            setSelectedZones(prev => prev.filter(id => validZoneIds.has(id)));
        } else {
            // When state is cleared, usually we should clear zones if we enforce state->zone hierarchy
            // But if we allow picking zones from region (without state set), logic might differ
            // Assuming strict hierarchy: Region -> State -> Zone
            if (zones.length > 0 && selectedRegion === '') {
                // Reset if no region either
                setSelectedZones([]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedState]);


    const loadZones = async () => {
        try {
            let query = supabase
                .from('zones')
                .select('*');

            if (!isMaster && organizationId) {
                query = query.eq('organization_id', organizationId);
            }

            const { data, error } = await query.order('name');

            if (error) throw error;
            setZones(data || []);
        } catch (error) {
            console.error('Error loading zones:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar las zonas",
            });
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('user_roles')
                .select(`
                    *,
                    profiles:user_id (
                        email,
                        first_name,
                        last_name
                    )
                `);

            if (!isMaster && organizationId) {
                query = query.eq('organization_id', organizationId);
            }

            const { data: rolesData, error: rolesError } = await query;

            if (rolesError) throw rolesError;

            // Fetch assigned zones for all users
            const { data: userZonesData, error: userZonesError } = await supabase
                .from('user_zones' as any)
                .select('user_id, zone_id, zones(id, name, state, region)');

            if (userZonesError) {
                console.warn("Could not fetch user_zones, maybe table doesn't exist yet?", userZonesError);
            }

            const usersWithRoles = rolesData?.map((role: any) => {
                // Find all zones for this user
                const myZones = userZonesData
                    ?.filter((uz: any) => uz.user_id === role.user_id)
                    .map((uz: any) => uz.zones)
                    .filter(Boolean) || []; // filter Boolean to remove any nulls from join

                return {
                    id: role.id,
                    user_id: role.user_id,
                    email: role.profiles?.email,
                    first_name: role.profiles?.first_name,
                    last_name: role.profiles?.last_name,
                    role: role.role as UserRole,
                    organization_id: role.organization_id,
                    zone_id: role.zone_id,
                    assigned_zones: myZones,
                    state: role.state,
                    region: role.region,
                    is_active: role.is_active,
                    created_at: role.created_at
                };
            }) || [];

            setUsers(usersWithRoles);
        } catch (error) {
            console.error('Error loading users:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los usuarios",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: UserWithRole) => {
        setEditingUser(user);
        setIsEditDialogOpen(true);
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;
        setIsSaving(true);

        try {
            // 1. Update Profile (Name)
            // 1. Update Profile (Name, Region, State)
            // We sync region/state to profiles as well, as some views might rely on it
            const profileUpdates: any = {
                first_name: firstName,
                last_name: lastName,
                region: selectedRegion === 'all' ? null : selectedRegion,
                state: selectedState === 'all' ? null : selectedState
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .update(profileUpdates)
                .eq('user_id', editingUser.user_id);

            if (profileError) throw profileError;

            // 2. Update User Role (Role, Region, State, Main Zone)
            // We use the first selected zone as the "main" zone_id for backward compatibility
            const primaryZoneId = selectedZones.length > 0 ? selectedZones[0] : null;

            const { error: roleError } = await supabase
                .from('user_roles')
                .update({
                    role: selectedRole,
                    region: selectedRegion || null,
                    state: selectedState || null,
                    zone_id: primaryZoneId
                })
                .eq('user_id', editingUser.user_id);

            if (roleError) throw roleError;

            // 3. Update User Zones (Many-to-Many)
            // First delete existing
            const { error: deleteError } = await supabase
                .from('user_zones' as any)
                .delete()
                .eq('user_id', editingUser.user_id);

            if (deleteError) {
                // If table doesn't exist, this might fail.
                console.warn("Error deleting user_zones:", deleteError);
            } else if (selectedZones.length > 0) {
                // Insert new
                const { error: insertError } = await supabase
                    .from('user_zones' as any)
                    .insert(selectedZones.map(zid => ({
                        user_id: editingUser.user_id,
                        zone_id: zid
                    })));

                if (insertError) throw insertError;
            }

            toast({
                title: "Usuario actualizado",
                description: "Los datos se han guardado correctamente.",
            });

            setIsEditDialogOpen(false);
            loadUsers(); // Reload to see changes

        } catch (error: any) {
            console.error('Error updating user:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "No se pudo actualizar el usuario",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('user_roles')
                .update({ is_active: !currentStatus })
                .eq('user_id', userId);

            if (error) throw error;

            setUsers(users.map(u =>
                u.user_id === userId ? { ...u, is_active: !currentStatus } : u
            ));

            toast({
                title: !currentStatus ? "Usuario activado" : "Usuario desactivado",
                description: `El usuario ha sido ${!currentStatus ? 'activado' : 'desactivado'} exitosamente.`
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo cambiar el estado del usuario"
            });
        }
    };


    const getAvailableStates = () => {
        if (!selectedRegion || selectedRegion === 'all') return [];
        return getStatesInRegion(selectedRegion);
    };

    const getAvailableZones = () => {
        let filtered = zones;

        // Filter by state if selected
        if (selectedState && selectedState !== 'all') {
            filtered = filtered.filter(z => z.state === selectedState);
        } else if (selectedRegion && selectedRegion !== 'all') {
            // If only region selected, filter by all states in that region? 
            // Or filter by region column if available
            // Since we have region in zone type, let's use it
            filtered = filtered.filter(z => z.region === selectedRegion);
        }

        return filtered;
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!canManageUsers) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Shield className="h-5 w-5" />
                            Acceso Restringido
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>No tienes permisos para administrar usuarios.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 space-y-6 font-display animate-in fade-in duration-700 text-slate-900">
            {/* Premium Header Container */}
            <header className="bg-card px-8 py-10 rounded-[2rem] shadow-premium-md border border-border/40 relative overflow-hidden -mt-2 mx-1">
                {/* Decorative backgrounds */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 text-slate-900"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transform transition-transform hover:scale-105 active:scale-95 duration-500 text-white">
                            <UsersIcon className="text-white h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2">Soberanía de Identidad</p>
                            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">
                                Gestión de Usuarios
                            </h1>
                            <div className="flex items-center gap-3 mt-3">
                                <Badge variant="secondary" className="bg-primary/5 text-primary border border-primary/20 font-black text-[10px] px-3 py-1 uppercase tracking-widest rounded-lg">
                                    {isMaster ? 'Modo Master Global' : (ROLE_LABELS[profile?.role as UserRole] || 'Admin')}
                                </Badge>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-border/40 shadow-inner text-slate-900">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-glow"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{users.length} Colaboradores en línea</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <Button
                            onClick={loadUsers}
                            variant="outline"
                            className="bg-card border-border/40 rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-soft hover:shadow-md transition-all active:scale-95 group"
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-3 text-primary group-hover:rotate-180 transition-transform duration-700", loading && "animate-spin")} />
                            Sincronizar Listado
                        </Button>
                    </div>
                </div>
            </header>

            <Card className="border border-border/40 shadow-premium-lg bg-card rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-8 p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <CardTitle className="text-xl font-black text-slate-800 tracking-tighter uppercase">
                            Personal Operativo
                        </CardTitle>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="BUSCAR COLABORADOR POR NOMBRE O EMAIL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary font-black uppercase text-[10px] tracking-widest shadow-inner placeholder:text-slate-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 pl-8">Colaborador</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">Rol Corporativo</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">Asignación Geográfica</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">Cobertura Logística</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">Status</TableHead>
                                        <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 pr-8">Control</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No se encontraron usuarios
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-slate-50 transition-colors border-slate-50">
                                                <TableCell className="pl-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-black text-foreground uppercase tracking-tight">
                                                            {user.first_name} {user.last_name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold tracking-widest">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn("font-medium", ROLE_COLORS[user.role] || "bg-muted text-gray-800")}
                                                    >
                                                        {ROLE_LABELS[user.role]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div className="flex flex-col gap-2">
                                                        {user.region && (
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <Globe className="h-3 w-3 text-primary" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{user.region}</span>
                                                            </div>
                                                        )}
                                                        {user.state && (
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <MapPin className="h-3 w-3 text-primary" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{user.state}</span>
                                                            </div>
                                                        )}
                                                        {!user.region && !user.state && (
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ">Sin Asignación</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.assigned_zones && user.assigned_zones.length > 0 ? (
                                                            user.assigned_zones.slice(0, 3).map(z => (
                                                                <Badge key={z.id} className="bg-slate-50 text-slate-500 border border-border/40 font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg shadow-sm">
                                                                    {z.name}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ninguna</span>
                                                        )}
                                                        {user.assigned_zones && user.assigned_zones.length > 3 && (
                                                            <Badge className="bg-primary/5 text-primary border border-primary/20 font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">
                                                                +{user.assigned_zones.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center py-6">
                                                    <Badge className={cn(
                                                        "font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm border",
                                                        user.is_active 
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                            : "bg-slate-50 text-slate-400 border-border/40"
                                                    )}>
                                                        {user.is_active ? "Operativo" : "Inactivo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-8 py-6">
                                                    <div className="flex justify-end gap-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditClick(user)}
                                                            className="h-10 w-10 text-primary hover:text-primary hover:bg-primary/5 rounded-xl transition-all shadow-none hover:shadow-soft"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {isMaster && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleToggleActive(user.user_id, user.is_active)}
                                                                className={cn(
                                                                    "h-10 w-10 rounded-xl transition-all shadow-none hover:shadow-soft",
                                                                    user.is_active
                                                                        ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                        : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                                                                )}
                                                            >
                                                                {user.is_active ? (
                                                                    <Trash2 className="h-4 w-4" />
                                                                ) : (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-card">
                    <DialogHeader className="bg-muted/30 p-8 pb-6 border-b border-border/50">
                        <DialogTitle className="text-2xl font-black text-foreground tracking-tight">Editar Usuario</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Modifique los permisos y asignaciones del colaborador en el sistema.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 p-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nombre</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Apellido</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Rol del Sistema</Label>
                            <Select
                                value={selectedRole}
                                onValueChange={(v) => setSelectedRole(v as UserRole)}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
                            <h4 className="font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary" />
                                Asignación Geográfica
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Región</Label>
                                    <Select
                                        value={selectedRegion}
                                        onValueChange={setSelectedRegion}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar región" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas (Solo visible admin)</SelectItem>
                                            {getAllRegions().map((region) => (
                                                <SelectItem key={region} value={region}>
                                                    {region}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Select
                                        value={selectedState}
                                        onValueChange={setSelectedState}
                                        disabled={!selectedRegion || selectedRegion === 'all'}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={selectedRegion ? "Seleccionar estado" : "Seleccione región primero"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            {getAvailableStates().map((state) => (
                                                <SelectItem key={state} value={state}>
                                                    {state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Zonas Asignadas</Label>
                                <div className="space-y-2">
                                    <Popover open={openZoneCombobox} onOpenChange={setOpenZoneCombobox}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between"
                                                disabled={(!selectedState || selectedState === 'all') && (!selectedRegion || selectedRegion === 'all')}
                                            >
                                                {selectedZones.length > 0
                                                    ? `${selectedZones.length} zona(s) seleccionada(s)`
                                                    : "Seleccionar zonas"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Buscar zona..." />
                                                <div className="p-2 border-b">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="select-all"
                                                            checked={selectedZones.length > 0 &&
                                                                getAvailableZones().length > 0 &&
                                                                selectedZones.length === getAvailableZones().length}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedZones(getAvailableZones().map(z => z.id));
                                                                } else {
                                                                    setSelectedZones([]);
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor="select-all"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Seleccionar Todas
                                                        </label>
                                                    </div>
                                                </div>
                                                <CommandList>
                                                    <CommandEmpty>No se encontraron zonas.</CommandEmpty>
                                                    <CommandGroup className="max-h-[200px] overflow-auto">
                                                        {getAvailableZones().map((zone) => (
                                                            <CommandItem
                                                                key={zone.id}
                                                                value={zone.name}
                                                                onSelect={() => {
                                                                    setSelectedZones(prev =>
                                                                        prev.includes(zone.id)
                                                                            ? prev.filter(id => id !== zone.id)
                                                                            : [...prev, zone.id]
                                                                    );
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedZones.includes(zone.id)
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {zone.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    <div className="flex flex-wrap gap-1 mt-2 min-h-[24px]">
                                        {selectedZones.map(zoneId => {
                                            const zone = zones.find(z => z.id === zoneId);
                                            return zone ? (
                                                <Badge key={zoneId} variant="secondary" className="flex items-center gap-1">
                                                    {zone.name}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                        onClick={() => setSelectedZones(prev => prev.filter(id => id !== zoneId))}
                                                    />
                                                </Badge>
                                            ) : null;
                                        })}
                                        {selectedZones.length === 0 && (
                                            <span className="text-xs text-muted-foreground ">
                                                Ninguna zona seleccionada
                                            </span>
                                        )}
                                    </div>
                                    {(!selectedState || selectedState === 'all') && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Seleccione un estado específico para filtrar zonas.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-muted/30 p-6 px-8 border-t border-border/50">
                        <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl font-bold">
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveUser} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 font-black shadow-lg shadow-primary/10 transition-all active:scale-95">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
