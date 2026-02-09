import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export function AdminDataFilter({ onFilterChange, moduleType = 'contacts' }: AdminDataFilterProps) {
    const { isMaster, isAdmin, isManager, isSupervisor, isRepresentative, zoneId, profile, userRegion, userState, loading: authLoading } = useAuth();
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

    useEffect(() => {
        if (authLoading) return;

        const initFilters = async () => {
            const newFilters: AdminFilterState = { ...filters };
            let shouldUpdate = false;

            if (isSupervisor && userRegion) {
                if (filters.region !== userRegion) {
                    newFilters.region = userRegion;
                    shouldUpdate = true;
                }
            }
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
                if (profile?.user_id && filters.repId !== profile.user_id) {
                    newFilters.repId = profile.user_id;
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
            const { data: zonesData } = await (supabase as any).from('zones').select('id, name, state');
            let availableZones = zonesData || [];

            if (isManager && profile?.user_id && !isMaster && !isAdmin) {
                const { data: myZones } = await (supabase as any).from('user_zones').select('zone_id').eq('user_id', profile.user_id);
                if (myZones && myZones.length > 0) {
                    const myZoneIds = myZones.map((z: any) => z.zone_id);
                    availableZones = availableZones.filter((z: any) => myZoneIds.includes(z.id));
                }
            }

            setZones(availableZones);

            const { data: profilesData } = await supabase
                .from('profiles')
                .select('user_id, first_name, last_name, email');

            const { data: rolesData } = await supabase
                .from('user_roles')
                .select('user_id, supervisor_id, region, state');

            const reps = (profilesData || [])
                .filter(p => p.user_id !== profile?.user_id || isMaster)
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
        if (isSupervisor && userRegion) resetFilters.region = userRegion;
        if (isRepresentative) {
            if (userRegion) resetFilters.region = userRegion;
            if (userState) resetFilters.state = userState;
            if (zoneId) resetFilters.zoneId = zoneId;
            if (profile?.user_id) resetFilters.repId = profile.user_id;
        }
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const hasActiveFilters = Object.keys(filters).length > 0;
    const isRegionLocked = (isSupervisor || isRepresentative) && !!userRegion;
    const isStateLocked = isRepresentative && !!userState;
    const isZoneLocked = isRepresentative && !!zoneId;
    const isRepLocked = isRepresentative;

    const visibleStates = (isSupervisor && userRegion)
        ? getStatesInRegion(userRegion)
        : (filters.region && filters.region !== 'all' ? getStatesInRegion(filters.region) : getAllStates());

    const visibleZones = filters.state && filters.state !== 'all'
        ? zones.filter(z => z.state === filters.state)
        : (isSupervisor && userRegion
            ? zones.filter(z => z.state && visibleStates.includes(z.state))
            : zones);

    const visibleReps = representatives.filter(rep => {
        if (isSupervisor && profile?.user_id) return rep.supervisorId === profile.user_id || rep.id === profile.user_id;
        if (filters.state && filters.state !== 'all') return rep.state === filters.state;
        if (filters.region && filters.region !== 'all') return rep.region === filters.region;
        return true;
    });

    const getViewLabel = () => {
        if (isMaster) return "Master";
        if (isManager) return "Gerente";
        if (isSupervisor) return "Supervisor";
        if (isRepresentative) return "Representante";
        return "Usuario";
    }

    return (
        <Card className="mb-6 medical-card border-emerald-500/20 shadow-xl overflow-hidden group">
            <div className="p-4 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-emerald-400" />
                    <h3 className="font-semibold text-sm text-white">
                        Filtros Administrativos
                    </h3>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] h-5">
                        {getViewLabel()}
                    </Badge>
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 text-emerald-400 hover:text-emerald-300 hover:bg-white/5"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Limpiar
                    </Button>
                )}
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 bg-transparent">
                {/* Región */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Región</label>
                    <Select
                        value={filters.region || 'all'}
                        onValueChange={(v) => updateFilters('region', v)}
                        disabled={isRegionLocked}
                    >
                        <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white focus:ring-emerald-500/20">
                            <SelectValue placeholder="Todas las regiones" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="all">Todas las regiones</SelectItem>
                            {Object.values(REGION_MAPPING).filter((v, i, a) => a.indexOf(v) === i).map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estado</label>
                    <Select
                        value={filters.state || 'all'}
                        onValueChange={(v) => updateFilters('state', v)}
                        disabled={isStateLocked}
                    >
                        <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white focus:ring-emerald-500/20">
                            <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="all">Todos los estados</SelectItem>
                            {visibleStates.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Zona */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Zona</label>
                    <Select
                        value={filters.zoneId || 'all'}
                        onValueChange={(v) => updateFilters('zoneId', v)}
                        disabled={isZoneLocked}
                    >
                        <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white focus:ring-emerald-500/20">
                            <SelectValue placeholder="Todas las zonas" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="all">Todas las zonas</SelectItem>
                            {visibleZones.map(zone => (
                                <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Representante */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Representante</label>
                    <Select
                        value={filters.repId || 'all'}
                        onValueChange={(v) => updateFilters('repId', v)}
                        disabled={isRepLocked}
                    >
                        <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white focus:ring-emerald-500/20">
                            <SelectValue placeholder="Todos los reps" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
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
                <div className="px-5 pb-5 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    {filters.region && (
                        <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400 text-[10px]">
                            Región: {filters.region}
                        </Badge>
                    )}
                    {filters.state && (
                        <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400 text-[10px]">
                            Estado: {filters.state}
                        </Badge>
                    )}
                    {filters.zoneId && (
                        <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400 text-[10px]">
                            Zona: {zones.find(z => z.id === filters.zoneId)?.name}
                        </Badge>
                    )}
                    {filters.repId && (
                        <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400 text-[10px]">
                            Rep: {representatives.find(r => r.id === filters.repId)?.name}
                        </Badge>
                    )}
                </div>
            )}
        </Card>
    );
}
