import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { REGION_MAPPING, getAllStates, getStatesInRegion } from "@/constants/regions";

export interface AdminFilterState {
    region?: string;
    state?: string;
    zoneId?: string;
    repId?: string;
}

interface AdminDataFilterProps {
    onFilterChange: (filters: AdminFilterState) => void;
    moduleType?: 'doctors' | 'pharmacies' | 'visits' | 'contacts';
}

// Removed local REGION_MAPPING and helpers as they are now imported


export function AdminDataFilter({ onFilterChange, moduleType = 'contacts' }: AdminDataFilterProps) {
    const { isMaster, isManager, isSupervisor, isRepresentative, zoneId, profile, userRegion, userState, loading: authLoading } = useAuth();
    const [filters, setFilters] = useState<AdminFilterState>({});
    const [zones, setZones] = useState<{ id: string; name: string; state: string | null }[]>([]);
    const [representatives, setRepresentatives] = useState<{
        id: string;
        name: string;
        email: string;
        supervisorId?: string;
        region?: string;
        state?: string;
    }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMasterData();
    }, []);

    // Effect for initializing filters based on role
    useEffect(() => {
        if (authLoading) return;

        const initFilters = async () => {
            const newFilters: AdminFilterState = { ...filters };
            let shouldUpdate = false;

            // Supervisor Logic: Lock Region
            if (isSupervisor && userRegion) {
                if (filters.region !== userRegion) {
                    newFilters.region = userRegion;
                    shouldUpdate = true;
                }
            }
            // Representative Logic: Lock Filter to their assignment
            else if (isRepresentative) {
                if (userRegion && filters.region !== userRegion) {
                    newFilters.region = userRegion;
                    shouldUpdate = true;
                }
                if (userState && filters.state !== userState) {
                    newFilters.state = userState;
                    shouldUpdate = true;
                }
                if (zoneId && filters.zoneId !== zoneId) {
                    newFilters.zoneId = zoneId;
                    shouldUpdate = true;
                }
                if (profile?.id && filters.repId !== profile.id) {
                    newFilters.repId = profile.id;
                    shouldUpdate = true;
                }
            }

            if (shouldUpdate) {
                setFilters(newFilters);
                onFilterChange(newFilters);
            }
        };

        initFilters();
    }, [isSupervisor, isRepresentative, zoneId, userRegion, userState, profile, authLoading]);


    const loadMasterData = async () => {
        setLoading(true);
        try {
            // Cargar zonas (now includes state column)
            const { data: zonesData } = await (supabase as any).from('zones').select('id, name, state');

            let availableZones = zonesData || [];

            // If Manager, filter zones to only assigned ones (Multi-Zone support)
            if (isManager && profile?.id && !isMaster && !isAdmin) { // Ensure Master/Admin see all
                const { data: myZones } = await supabase.from('user_zones').select('zone_id').eq('user_id', profile.id);
                if (myZones && myZones.length > 0) {
                    const myZoneIds = myZones.map((z: any) => z.zone_id);
                    availableZones = availableZones.filter((z: any) => myZoneIds.includes(z.id));
                }
            }

            setZones(availableZones);

            // Cargar usuarios (representantes)
            // For supervisors, we want to see their subordinates
            let profilesQuery = supabase
                .from('profiles')
                .select('user_id, first_name, last_name, email');

            const { data: profilesData } = await profilesQuery;

            // We will also need to know who reports to who for the representatives dropdown
            // To avoid complex joins here, we can fetch user_roles too
            const { data: rolesData } = await supabase
                .from('user_roles')
                .select('user_id, supervisor_id, region, state');

            const reps = (profilesData || [])
                .filter(p => p.user_id !== profile?.id || isMaster)
                .map(p => {
                    const roleInfo = rolesData?.find(r => r.user_id === p.user_id);
                    return {
                        id: p.user_id,
                        name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email,
                        email: p.email,
                        supervisorId: roleInfo?.supervisor_id,
                        region: roleInfo?.region,
                        state: roleInfo?.state
                    };
                });

            setRepresentatives(reps);
        } catch (error) {
            console.error("Error loading master data:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (key: keyof AdminFilterState, value: string) => {
        const newFilters = { ...filters };

        if (value === 'all' || value === 'none') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }

        // Cascade resets when parent filter changes
        if (key === 'region') {
            delete newFilters.state;
            delete newFilters.zoneId;
            delete newFilters.repId;
        }
        if (key === 'state') {
            delete newFilters.zoneId;
            delete newFilters.repId;
        }

        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const resetFilters: AdminFilterState = {};

        // Restore locked filters for non-admins
        if (isSupervisor && userRegion) {
            resetFilters.region = userRegion;
        }
        if (isRepresentative) {
            if (userRegion) resetFilters.region = userRegion;
            if (userState) resetFilters.state = userState;
            if (zoneId) resetFilters.zoneId = zoneId;
            if (profile?.id) resetFilters.repId = profile.id;
        }

        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    // Determine lock state
    const isRegionLocked = (isSupervisor || isRepresentative) && !!userRegion;
    const isStateLocked = isRepresentative && !!userState;
    const isZoneLocked = isRepresentative && !!zoneId;
    const isRepLocked = isRepresentative;

    // Filter lists based on role and parent filters
    const visibleStates = (isSupervisor && userRegion)
        ? getStatesInRegion(userRegion)
        : (filters.region && filters.region !== 'all' ? getStatesInRegion(filters.region) : getAllStates());

    const visibleZones = filters.state && filters.state !== 'all'
        ? zones.filter(z => z.state === filters.state)
        : (isSupervisor && userRegion
            ? zones.filter(z => z.state && visibleStates.includes(z.state))
            : zones);

    const visibleReps = representatives.filter(rep => {
        // If supervisor, only show reports
        if (isSupervisor && profile?.id) {
            return rep.supervisorId === profile.id || rep.id === profile.id;
        }
        // If specific region/state filtered, limit by that
        if (filters.state && filters.state !== 'all') {
            return rep.state === filters.state;
        }
        if (filters.region && filters.region !== 'all') {
            return rep.region === filters.region;
        }
        return true;
    });


    const getViewLabel = () => {
        if (isMaster) return "Vista Master";
        if (isManager) return "Vista Gerente";
        if (isSupervisor) return "Vista Supervisor";
        if (isRepresentative) return "Vista Representante";
        return "Vista Usuario";
    }

    return (
        <Card className="mb-6 border-emerald-200 bg-white shadow-sm">
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-emerald-600" />
                        <h3 className="font-semibold text-sm text-slate-800">
                            Filtros Administrativos
                        </h3>
                        <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {getViewLabel()}
                        </span>
                    </div>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Limpiar
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Región */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Región</label>
                        <Select
                            value={filters.region || 'all'}
                            onValueChange={(v) => updateFilters('region', v)}
                            disabled={isRegionLocked}
                        >
                            <SelectTrigger className="h-9 bg-white border-slate-200 text-slate-800">
                                <SelectValue placeholder="Todas las regiones" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las regiones</SelectItem>
                                {Object.values(REGION_MAPPING).filter((v, i, a) => a.indexOf(v) === i).map(r => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Estado */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Estado</label>
                        <Select
                            value={filters.state || 'all'}
                            onValueChange={(v) => updateFilters('state', v)}
                            disabled={isStateLocked}
                        >
                            <SelectTrigger className="h-9 bg-white border-slate-200 text-slate-800">
                                <SelectValue placeholder="Todos los estados" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                {visibleStates.map(state => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Zona */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Zona</label>
                        <Select
                            value={filters.zoneId || 'all'}
                            onValueChange={(v) => updateFilters('zoneId', v)}
                            disabled={isZoneLocked}
                        >
                            <SelectTrigger className="h-9 bg-white border-slate-200 text-slate-800">
                                <SelectValue placeholder="Todas las zonas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las zonas</SelectItem>
                                {visibleZones.map(zone => (
                                    <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Representante */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Representante</label>
                        <Select
                            value={filters.repId || 'all'}
                            onValueChange={(v) => updateFilters('repId', v)}
                            disabled={isRepLocked}
                        >
                            <SelectTrigger className="h-9 bg-white border-slate-200 text-slate-800">
                                <SelectValue placeholder="Todos los reps" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los representantes</SelectItem>
                                {visibleReps.map(rep => (
                                    <SelectItem key={rep.id} value={rep.id}>
                                        {rep.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-slate-600">Filtros activos:</span>
                        {filters.region && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                Región: {filters.region}
                            </span>
                        )}
                        {filters.state && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                Estado: {filters.state}
                            </span>
                        )}
                        {filters.zoneId && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                Zona: {zones.find(z => z.id === filters.zoneId)?.name}
                            </span>
                        )}
                        {filters.repId && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                Rep: {representatives.find(r => r.id === filters.repId)?.name}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
