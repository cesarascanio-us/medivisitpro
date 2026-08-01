import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, ChevronsUpDown, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAppRoles } from "@/hooks/useAppRoles";
import { getAllRegions, getStatesInRegion } from "@/constants/regions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Zone {
    id: string;
    name: string;
    state: string | null;
    region: string | null;
}

interface UserEditDialogProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function UserEditDialog({ userId, isOpen, onClose, onSuccess }: UserEditDialogProps) {
    const { isMaster, profile } = useAuth();
    const { data: appRoles } = useAppRoles();
    const { toast } = useToast();
    
    const isGlobalAdmin = isMaster && profile?.organization_id === '00000000-0000-0000-0000-000000000000';
    
    const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('representative');
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedZones, setSelectedZones] = useState<string[]>([]);
    const [editOrgId, setEditOrgId] = useState<string>('none');
    
    const [openZoneCombobox, setOpenZoneCombobox] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            loadInitialData();
        } else {
            resetForm();
        }
    }, [isOpen, userId]);

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
    }, [selectedState, zones]);

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setSelectedRole('representative');
        setSelectedRegion('');
        setSelectedState('');
        setSelectedZones([]);
        setEditOrgId('none');
    };

    const loadInitialData = async () => {
        if (!userId) return;
        setLoadingData(true);
        try {
            // Load organizations if global admin
            if (isGlobalAdmin && organizations.length === 0) {
                const { data: orgData } = await supabase.from('organizations').select('id, name').order('name');
                if (orgData) setOrganizations(orgData);
            }

            // Load zones
            let zonesQuery = supabase.from('zones').select('*');
            if (!isGlobalAdmin && profile?.organization_id) {
                zonesQuery = zonesQuery.eq('organization_id', profile.organization_id);
            }
            const { data: zonesData } = await zonesQuery.order('name');
            if (zonesData) setZones(zonesData);

            // Load user details
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select(`
                    *,
                    profiles:user_id (
                        first_name,
                        last_name
                    )
                `)
                .eq('user_id', userId)
                .single();

            if (roleError) throw roleError;

            const { data: userZonesData } = await supabase
                .from('user_zones' as any)
                .select('zone_id')
                .eq('user_id', userId);

            setFirstName(roleData.profiles?.first_name || '');
            setLastName(roleData.profiles?.last_name || '');
            setSelectedRole(roleData.role as UserRole);
            setSelectedRegion(roleData.region || '');
            setSelectedState(roleData.state || '');
            setEditOrgId(roleData.organization_id || 'none');
            
            if (userZonesData) {
                setSelectedZones(userZonesData.map((uz: any) => uz.zone_id));
            }

        } catch (error: any) {
            console.error("Error loading user data:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los datos del usuario."
            });
            onClose();
        } finally {
            setLoadingData(false);
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

    const handleSaveUser = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const primaryZoneId = selectedZones.length > 0 ? selectedZones[0] : null;

            const { data, error: rpcError } = await supabase.rpc('admin_update_user_full', {
                p_target_user_id: userId,
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

            onSuccess();
            onClose();

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] rounded-[3rem] border-border/40 shadow-premium-2xl p-0 overflow-y-auto max-h-[90vh] bg-card font-display">
                <DialogHeader className="bg-muted/20 p-10 pb-8 border-b border-border/40 relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">Configurar Operador</DialogTitle>
                    <DialogDescription className="text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-70">
                        Ajuste de parámetros y credenciales tácticas del colaborador.
                    </DialogDescription>
                </DialogHeader>

                {loadingData ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descargando Matriz...</span>
                    </div>
                ) : (
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
                                    {appRoles?.filter(r => isMaster || !r.is_system).map((r) => (
                                        <SelectItem key={r.slug} value={r.slug}>
                                            {r.name}
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
                                onClick={onClose}
                                className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border/40 hover:bg-muted/10"
                            >
                                Abortar
                            </Button>
                            <Button 
                                onClick={handleSaveUser} 
                                disabled={isSaving}
                                className="h-14 px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Consolidar Cambios
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
