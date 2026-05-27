import { useState, useEffect } from "react";
import { Plus, Shield, MapPin, Globe, Loader2, RefreshCw, Users as UsersIcon, Search, Edit, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { getAllRegions, getStatesInRegion } from "@/constants/regions";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteTable } from "@/components/layout/DesignSystem";
import { useTexts } from "@/hooks/useTexts";

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
    zone_id: string | null;
    assigned_zones: Zone[];
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
    representative: 'bg-muted/10 text-muted-foreground border-border/40',
    chief: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    store_manager: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    doctor: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    pharmacist: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    service_chief: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    telemarketing: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    admin_saas: 'bg-foreground text-background',
    soporte_saas: 'bg-muted/30 text-muted-foreground',
    desarrollo_saas: 'bg-primary text-white'
};

export default function Users() {
    const t = useTexts();
    const { user, canManageUsers, isMaster, profile, organizationName } = useAuth();
    const organizationId = profile?.organization_id;
    const { toast } = useToast();
    
    // --- NUEVOS ESTADOS DE INVITACIÓN Y ORGANIZACIONES ---
    const isGlobalAdmin = isMaster && organizationId === '00000000-0000-0000-0000-000000000000';
    const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
    const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
    
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteFirstName, setInviteFirstName] = useState('');
    const [inviteLastName, setInviteLastName] = useState('');
    const [inviteRole, setInviteRole] = useState<UserRole>('representative');
    const [inviteOrgId, setInviteOrgId] = useState<string>('');
    const [isInviting, setIsInviting] = useState(false);
    
    const [editOrgId, setEditOrgId] = useState<string>('');

    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);

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
            if (isMaster) {
                loadOrganizations();
            }
        }
    }, [user, selectedOrgFilter]);

    useEffect(() => {
        if (editingUser) {
            setSelectedRole(editingUser.role);
            setSelectedRegion(editingUser.region || '');
            setSelectedState(editingUser.state || '');
            setSelectedZones(editingUser.assigned_zones?.map(z => z.id) || []);
            setFirstName(editingUser.first_name || '');
            setLastName(editingUser.last_name || '');
            setEditOrgId(editingUser.organization_id || 'none');
        } else {
            setSelectedRole('representative');
            setSelectedRegion('');
            setSelectedState('');
            setSelectedZones([]);
            setFirstName('');
            setLastName('');
            setEditOrgId('');
        }
    }, [editingUser]);

    useEffect(() => {
        if (selectedRegion) {
            const statesInRegion = getStatesInRegion(selectedRegion);
            if (selectedState && !statesInRegion.includes(selectedState)) {
                setSelectedState('');
                setSelectedZones([]);
            }
        }
    }, [selectedRegion]);

    useEffect(() => {
        if (selectedState) {
            const availableZones = getAvailableZones();
            const validZoneIds = new Set(availableZones.map(z => z.id));
            setSelectedZones(prev => prev.filter(id => validZoneIds.has(id)));
        } else {
            if (zones.length > 0 && selectedRegion === '') {
                setSelectedZones([]);
            }
        }
    }, [selectedState]);

    const loadOrganizations = async () => {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('id, name')
                .order('name');
            if (error) throw error;
            setOrganizations(data || []);
        } catch (error) {
            console.error('Error loading organizations:', error);
        }
    };

    const loadZones = async () => {
        try {
            let query = supabase.from('zones').select('*');
            if (!isGlobalAdmin && organizationId) {
                query = query.eq('organization_id', organizationId);
            }
            const { data, error } = await query.order('name');
            if (error) throw error;
            setZones(data || []);
        } catch (error) {
            console.error('Error loading zones:', error);
            toast({
                variant: "destructive",
                title: "Error de Sistema",
                description: "No se pudieron recuperar los perímetros de zona.",
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

            if (!isGlobalAdmin) {
                if (organizationId) {
                    query = query.eq('organization_id', organizationId);
                }
            } else {
                if (selectedOrgFilter !== 'all') {
                    if (selectedOrgFilter === 'none') {
                        query = query.is('organization_id', null);
                    } else {
                        query = query.eq('organization_id', selectedOrgFilter);
                    }
                }
            }

            const { data: rolesData, error: rolesError } = await query;
            if (rolesError) throw rolesError;

            const { data: userZonesData, error: userZonesError } = await supabase
                .from('user_zones' as any)
                .select('user_id, zone_id, zones(id, name, state, region)');

            if (userZonesError) {
                console.warn("Could not fetch user_zones", userZonesError);
            }

            const usersWithRoles = rolesData?.map((role: any) => {
                const myZones = userZonesData
                    ?.filter((uz: any) => uz.user_id === role.user_id)
                    .map((uz: any) => uz.zones)
                    .filter(Boolean) || [];

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
                title: "Error de Protocolo",
                description: "Fallo en la sincronización de la base de datos de personal.",
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
            const primaryZoneId = selectedZones.length > 0 ? selectedZones[0] : null;

            const { data, error: rpcError } = await supabase.rpc('admin_update_user_full', {
                p_target_user_id: editingUser.user_id,
                p_first_name: firstName,
                p_last_name: lastName,
                p_region: selectedRegion === 'all' ? null : selectedRegion,
                p_state: selectedState === 'all' ? null : selectedState,
                p_role: selectedRole,
                p_zone_id: primaryZoneId,
                p_organization_id: isGlobalAdmin ? (editOrgId === 'none' ? null : editOrgId) : null,
                p_zone_ids: selectedZones
            });

            if (rpcError) throw rpcError;
            if (data && data.error) throw new Error(data.error);

            toast({
                title: "Protocolo Completado",
                description: "Los parámetros del colaborador han sido reconfigurados.",
            });

            setIsEditDialogOpen(false);
            loadUsers();

        } catch (error: any) {
            console.error('Error updating user:', error);
            toast({
                variant: "destructive",
                title: "Error de Escritura",
                description: error.message || "No se pudo actualizar la matriz de usuario.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInviteUserSubmit = async () => {
        setIsInviting(true);
        try {
            const resolvedOrgId = isGlobalAdmin 
                ? (inviteOrgId === 'none' ? null : inviteOrgId)
                : (organizationId || null);

            await supabase.functions.invoke('invite-user', {
                body: { 
                    email: inviteEmail, 
                    firstName: inviteFirstName, 
                    lastName: inviteLastName, 
                    role: inviteRole, 
                    organizationId: resolvedOrgId 
                }
            });
            
            toast({ 
                title: "Invitación Enviada", 
                description: "Credenciales de acceso y enlace de onboarding enviados por correo electrónico." 
            });
            setIsInviteDialogOpen(false);
            loadUsers();
        } catch (error: any) { 
            console.error("Invite error:", error);
            toast({ 
                title: "Error de Envío", 
                description: error.message || "Fallo al enviar la invitación al operador.", 
                variant: "destructive" 
            }); 
        } finally {
            setIsInviting(false); 
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
                title: !currentStatus ? "Acceso Restaurado" : "Acceso Revocado",
                description: `El estado del colaborador ha sido modificado en la red central.`
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Fallo de Sistema",
                description: "No se pudo alterar el estado de acceso del usuario."
            });
        }
    };

    const getAvailableStates = () => {
        if (!selectedRegion || selectedRegion === 'all') return [];
        return getStatesInRegion(selectedRegion);
    };

    const getAvailableZones = () => {
        let filtered = zones;
        if (selectedState && selectedState !== 'all') {
            filtered = filtered.filter(z => z.state === selectedState);
        } else if (selectedRegion && selectedRegion !== 'all') {
            filtered = filtered.filter(z => z.region === selectedRegion);
        }
        return filtered;
    };

    const filteredUsers = users.filter(user => {
        if (user.role === 'master') return false;
        return user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (!canManageUsers) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Card className="w-full max-w-md border-none shadow-premium-lg bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive font-black uppercase tracking-widest text-sm">
                            <Shield className="h-5 w-5" />
                            Acceso Denegado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground font-medium">No posee credenciales de nivel suficiente para administrar el personal.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full space-y-10 font-display animate-in fade-in duration-700 text-foreground pb-20">
            
            <EliteHeader 
                title={t.users_title}
                subtitle={t.users_subtitle}
                icon={UsersIcon}
                badgeText={isMaster ? "Soberanía Global" : "Control de Acceso"}
                statusText={`${users.length} Operadores Activos`}
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => {
                                setInviteEmail('');
                                setInviteFirstName('');
                                setInviteLastName('');
                                setInviteRole('representative');
                                setInviteOrgId(organizationId || 'none');
                                setIsInviteDialogOpen(true);
                            }}
                            className="bg-primary hover:bg-primary/95 text-white border-none rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 animate-in fade-in zoom-in duration-300"
                        >
                            <Plus className="h-4 w-4 text-white" />
                            Invitar Colaborador
                        </Button>
                        <Button
                            onClick={loadUsers}
                            variant="outline"
                            className="bg-muted/10 border-border/40 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner hover:bg-muted/20 transition-all group"
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-3 text-primary group-hover:rotate-180 transition-transform duration-700", loading && "animate-spin")} />
                            Sincronizar Datos
                        </Button>
                    </div>
                }
            />

            <EliteTable 
                title="Directorio de Operadores Alpha"
                description="Matriz central de colaboradores y niveles de acceso corporativo."
                searchPlaceholder="BUSCAR COLABORADOR POR IDENTIFICADOR..."
                onSearch={setSearchTerm}
                filterElement={
                    isGlobalAdmin ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filtrar Org:</span>
                            <Select
                                value={selectedOrgFilter}
                                onValueChange={setSelectedOrgFilter}
                            >
                                <SelectTrigger className="h-9 w-48 bg-muted/30 border-border/40 rounded-xl font-black uppercase text-[9px] px-4 shadow-sm">
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/40 bg-card">
                                    <SelectItem value="all" className="font-black uppercase text-[9px] tracking-widest py-2">
                                        Todas las Organizaciones
                                    </SelectItem>
                                    <SelectItem value="none" className="font-black uppercase text-[9px] tracking-widest py-2">
                                        Sistémico / Global Core
                                    </SelectItem>
                                    {organizations.map((org) => (
                                        <SelectItem key={org.id} value={org.id} className="font-black uppercase text-[9px] tracking-widest py-2">
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : null
                }
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/40">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-8">Operador</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Privilegios</TableHead>
                            {isGlobalAdmin && (
                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Organización</TableHead>
                            )}
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Despliegue Geográfico</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Radio de Cobertura</TableHead>
                            <TableHead className="text-center text-[10px] font-black uppercase tracking-widest py-6">Estado</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-6 pr-8">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [1,2,3,4,5].map(i => (
                                <TableRow key={i} className="animate-pulse border-border/40">
                                    <TableCell colSpan={isGlobalAdmin ? 7 : 6} className="h-16 py-8">
                                        <div className="h-4 bg-muted/20 rounded-full w-full"></div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isGlobalAdmin ? 7 : 6} className="h-40 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                                    Ningún colaborador interceptado en el radar.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/5 transition-colors border-border/40 group">
                                    <TableCell className="pl-8 py-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-black text-foreground uppercase tracking-tighter text-base group-hover:text-primary transition-colors">
                                                {user.first_name} {user.last_name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-black tracking-widest uppercase opacity-70">
                                                {user.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn("font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg border", ROLE_COLORS[user.role] || "bg-muted/10 text-muted-foreground border-border/40")}
                                        >
                                            {ROLE_LABELS[user.role]}
                                        </Badge>
                                    </TableCell>
                                    {isGlobalAdmin && (
                                        <TableCell className="py-8">
                                            <span className="text-[10px] font-black text-foreground uppercase tracking-tight">
                                                {organizations.find(o => o.id === user.organization_id)?.name || (user.organization_id === '00000000-0000-0000-0000-000000000000' ? 'Global Core' : 'Sistémico')}
                                            </span>
                                        </TableCell>
                                    )}
                                    <TableCell className="py-8">
                                        <div className="flex flex-col gap-2">
                                            {user.region && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Globe className="h-3 w-3 text-primary" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{user.region}</span>
                                                </div>
                                            )}
                                            {user.state && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-3 w-3 text-primary" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{user.state}</span>
                                                </div>
                                            )}
                                            {!user.region && !user.state && (
                                                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest italic">Perímetro Global</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        <div className="flex flex-wrap gap-2">
                                            {user.assigned_zones && user.assigned_zones.length > 0 ? (
                                                user.assigned_zones.slice(0, 3).map(z => (
                                                    <Badge key={z.id} className="bg-muted/20 text-muted-foreground border border-border/40 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md shadow-inner">
                                                        {z.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest">N/A</span>
                                            )}
                                            {user.assigned_zones && user.assigned_zones.length > 3 && (
                                                <Badge className="bg-primary/10 text-primary border border-primary/20 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                    +{user.assigned_zones.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-8">
                                        <div className="flex justify-center">
                                            <Badge className={cn(
                                                "font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm",
                                                user.is_active 
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                                                    : "bg-muted/10 text-muted-foreground border-border/40"
                                            )}>
                                                {user.is_active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8 py-8">
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditClick(user)}
                                                className="h-12 w-12 text-primary hover:text-primary hover:bg-primary/10 rounded-2xl transition-all shadow-inner border border-transparent hover:border-primary/20"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            {isMaster && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleActive(user.user_id, user.is_active)}
                                                    className={cn(
                                                        "h-12 w-12 rounded-2xl transition-all shadow-inner border border-transparent",
                                                        user.is_active
                                                            ? "text-red-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                                                            : "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20"
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
                            )
                        ))}
                    </TableBody>
                </Table>
            </EliteTable>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-[3rem] border-border/40 shadow-premium-2xl p-0 overflow-y-auto max-h-[90vh] bg-card font-display">
                    <DialogHeader className="bg-muted/20 p-10 pb-8 border-b border-border/40 relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">Configurar Operador</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-70">
                            Ajuste de parámetros y credenciales tácticas del colaborador.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-10 p-10">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre</Label>
                                <Input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Apellido</Label>
                                <Input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nivel de Seguridad (Rol)</Label>
                            <Select
                                value={selectedRole}
                                onValueChange={(v) => setSelectedRole(v as UserRole)}
                            >
                                <SelectTrigger className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner">
                                    <SelectValue placeholder="Definir rol corporativo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border/40 bg-card">
                                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value} className="font-black uppercase text-[10px] tracking-widest py-3">
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {isGlobalAdmin && (
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SaaS Tenant (Organización)</Label>
                                <Select
                                    value={editOrgId}
                                    onValueChange={setEditOrgId}
                                >
                                    <SelectTrigger className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner">
                                        <SelectValue placeholder="Elegir organización" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/40 bg-card">
                                        <SelectItem value="none" className="font-black uppercase text-[10px] tracking-widest py-3">
                                            Sistémico / Global Core
                                        </SelectItem>
                                        {organizations.map((org) => (
                                            <SelectItem key={org.id} value={org.id} className="font-black uppercase text-[10px] tracking-widest py-3">
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-8 rounded-[2.5rem] border border-border/40 p-8 bg-muted/10 shadow-inner">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                                <Globe className="h-4 w-4" />
                                Jurisdicción Territorial
                            </h4>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Región Alpha</Label>
                                    <Select
                                        value={selectedRegion}
                                        onValueChange={setSelectedRegion}
                                    >
                                        <SelectTrigger className="h-12 bg-card border-border/40 rounded-xl font-black uppercase text-[10px] px-5 shadow-sm">
                                            <SelectValue placeholder="Elegir región" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/40 bg-card">
                                            <SelectItem value="all" className="font-black uppercase text-[10px] tracking-widest">Global</SelectItem>
                                            {getAllRegions().map((region) => (
                                                <SelectItem key={region} value={region} className="font-black uppercase text-[10px] tracking-widest">
                                                    {region}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Estado de Operación</Label>
                                    <Select
                                        value={selectedState}
                                        onValueChange={setSelectedState}
                                        disabled={!selectedRegion || selectedRegion === 'all'}
                                    >
                                        <SelectTrigger className="h-12 bg-card border-border/40 rounded-xl font-black uppercase text-[10px] px-5 shadow-sm">
                                            <SelectValue placeholder="Definir estado" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/40 bg-card">
                                            <SelectItem value="all" className="font-black uppercase text-[10px] tracking-widest">Todos los Estados</SelectItem>
                                            {getAvailableStates().map((state) => (
                                                <SelectItem key={state} value={state} className="font-black uppercase text-[10px] tracking-widest">
                                                    {state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Perímetros de Zona (Multi-asignación)</Label>
                                <Popover open={openZoneCombobox} onOpenChange={setOpenZoneCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 bg-card border-border/40 rounded-xl font-black uppercase text-[10px] px-5 shadow-sm justify-between hover:bg-muted/10"
                                            disabled={(!selectedState || selectedState === 'all') && (!selectedRegion || selectedRegion === 'all')}
                                        >
                                            {selectedZones.length > 0
                                                ? `${selectedZones.length} Zona(s) Interceptada(s)`
                                                : "Escanear Zonas Disponibles"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[500px] p-0 rounded-2xl border-border/40 shadow-2xl bg-card" align="start">
                                        <Command className="bg-transparent">
                                            <CommandInput placeholder="FILTRAR ZONA POR IDENTIFICADOR..." className="h-14 font-black uppercase text-[10px] tracking-widest" />
                                            <div className="p-4 border-b border-border/40 bg-muted/10">
                                                <div className="flex items-center space-x-3">
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
                                                        className="rounded-md border-primary/40 data-[state=checked]:bg-primary"
                                                    />
                                                    <label
                                                        htmlFor="select-all"
                                                        className="text-[10px] font-black uppercase tracking-widest text-foreground cursor-pointer"
                                                    >
                                                        Sincronizar Todas las Zonas Visibles
                                                    </label>
                                                </div>
                                            </div>
                                            <CommandList>
                                                <CommandEmpty className="py-6 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ninguna zona interceptada.</CommandEmpty>
                                                <CommandGroup className="max-h-[300px] overflow-auto p-2">
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
                                                            className="rounded-lg py-3 px-4 font-black uppercase text-[9px] tracking-widest hover:bg-primary/10 data-[selected=true]:bg-primary/5 cursor-pointer"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-3 h-4 w-4 text-primary transition-opacity",
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
                            </div>
                        </div>

                        <div className="flex gap-4 justify-end pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsEditDialogOpen(false)}
                                className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border/40 hover:bg-muted/10"
                            >
                                Abortar
                            </Button>
                            <Button 
                                onClick={handleSaveUser} 
                                disabled={isSaving}
                                className="h-14 px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Consolidar Cambios
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-[3rem] border-border/40 shadow-premium-2xl p-0 overflow-hidden bg-card font-display">
                    <DialogHeader className="bg-muted/20 p-10 pb-8 border-b border-border/40 relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">Invitar Colaborador</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-70">
                            Invitar un nuevo miembro al equipo e iniciar el flujo de onboarding automático.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-8 p-10">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre</Label>
                                <Input
                                    value={inviteFirstName}
                                    onChange={(e) => setInviteFirstName(e.target.value)}
                                    placeholder="EJ: JUAN"
                                    className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Apellido</Label>
                                <Input
                                    value={inviteLastName}
                                    onChange={(e) => setInviteLastName(e.target.value)}
                                    placeholder="EJ: PÉREZ"
                                    className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Correo Electrónico</Label>
                            <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="EJ: JUAN.PEREZ@EMPRESA.COM"
                                className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner focus-visible:ring-primary"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rol / Nivel de Acceso</Label>
                                <Select
                                    value={inviteRole}
                                    onValueChange={(v) => setInviteRole(v as UserRole)}
                                >
                                    <SelectTrigger className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner">
                                        <SelectValue placeholder="Definir rol" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/40 bg-card">
                                        {Object.entries(ROLE_LABELS)
                                            .filter(([r]) => isGlobalAdmin ? true : r !== 'master') // Only master can invite masters
                                            .map(([value, label]) => (
                                                <SelectItem key={value} value={value} className="font-black uppercase text-[10px] tracking-widest py-3">
                                                    {label}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Organización / SaaS Tenant</Label>
                                {isGlobalAdmin ? (
                                    <Select
                                        value={inviteOrgId}
                                        onValueChange={setInviteOrgId}
                                    >
                                        <SelectTrigger className="h-14 bg-muted/20 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner">
                                            <SelectValue placeholder="Asignar organización" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-border/40 bg-card">
                                            <SelectItem value="none" className="font-black uppercase text-[10px] tracking-widest py-3">
                                                Sistémico / Global Core
                                            </SelectItem>
                                            {organizations.map((org) => (
                                                <SelectItem key={org.id} value={org.id} className="font-black uppercase text-[10px] tracking-widest py-3">
                                                    {org.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={organizationName || "Organización Local"}
                                        disabled
                                        className="h-14 bg-muted/30 border-border/40 rounded-2xl font-black uppercase text-xs px-6 shadow-inner cursor-not-allowed text-muted-foreground"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 justify-end pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsInviteDialogOpen(false)}
                                className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border/40 hover:bg-muted/10"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={handleInviteUserSubmit} 
                                disabled={isInviting || !inviteEmail || !inviteFirstName || !inviteLastName}
                                className="h-14 px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                            >
                                {isInviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Enviar Invitación
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
