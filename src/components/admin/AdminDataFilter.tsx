/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Globe, MapPin, Layers, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { REGION_MAPPING, getAllStates, getStatesInRegion } from "@/constants/regions";

export interface AdminFilterState {
    region?: string;
    state?: string;
    zoneId?: string;
    userId?: string;
}

interface AdminDataFilterProps {
    onFilterChange: (filters: AdminFilterState) => void;
    moduleType?: 'doctors' | 'pharmacies' | 'visits' | 'contacts';
}

export function AdminDataFilter({ onFilterChange, moduleType = 'contacts' }: AdminDataFilterProps) {
    const { isMaster, isAdmin, isManager, isSupervisor, isRepresentative, zoneId, profile, userRegion, userState, loading: authLoading } = useAuth();
    const [filters, setFilters] = useState<AdminFilterState>({ region: 'all', state: 'all', zoneId: 'all', userId: 'all' });
    const [zones, setZones] = useState<{ id: string; name: string; state: string | null }[]>([]);
    const [members, setMembers] = useState<{
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
                if (profile?.id && filters.userId !== profile.id) {
                    newFilters.userId = profile.id;
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

            if (isManager && profile?.id && !isMaster && !isAdmin) {
                const { data: myZones } = await (supabase as any).from('user_zones').select('zone_id').eq('user_id', profile.id);
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

            const members = (profilesData || [])
                .filter(p => (p.user_id !== profile?.id || isMaster))
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

            setMembers(members);
        } catch (error) {
            console.error("Error loading master data:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (key: keyof AdminFilterState, value: string) => {
        const newFilters = { ...filters };

        if (value === 'all') {
            newFilters[key] = 'all';
        } else {
            newFilters[key] = value;
        }

        // Reset child filters
        if (key === 'region') {
            newFilters.state = 'all';
            newFilters.zoneId = 'all';
            newFilters.userId = 'all';
        }
        if (key === 'state') {
            newFilters.zoneId = 'all';
            newFilters.userId = 'all';
        }

        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const resetFilters: AdminFilterState = { region: 'all', state: 'all', zoneId: 'all', userId: 'all' };

        if (isSupervisor && userRegion) resetFilters.region = userRegion;
        if (isRepresentative) {
            if (userRegion) resetFilters.region = userRegion;
            if (userState) resetFilters.state = userState;
            if (zoneId) resetFilters.zoneId = zoneId;
            if (profile?.id) resetFilters.userId = profile.id;
        }

        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const hasActiveFilters = filters.region !== 'all' || filters.state !== 'all' || (filters.zoneId && filters.zoneId !== 'all') || (filters.userId && filters.userId !== 'all');
    const isRegionLocked = (isSupervisor || isRepresentative) && !!userRegion;
    const isStateLocked = isRepresentative && !!userState;
    const isZoneLocked = isRepresentative && !!zoneId;
    const isUserLocked = isRepresentative;

    const visibleStates = (isSupervisor && userRegion)
        ? getStatesInRegion(userRegion)
        : (filters.region && filters.region !== 'all' ? getStatesInRegion(filters.region) : getAllStates());

    const visibleZones = filters.state && filters.state !== 'all'
        ? zones.filter(z => z.state === filters.state)
        : (isSupervisor && userRegion
            ? zones.filter(z => z.state && visibleStates.includes(z.state))
            : zones);

    const visibleMembers = members.filter(m => {
        if (isSupervisor && profile?.id) {
            // Supervisors see themselves and their subordinates
            return m.supervisorId === profile.id || m.id === profile.id;
        }
        if (filters.state && filters.state !== 'all') return m.state === filters.state;
        if (filters.region && filters.region !== 'all') return m.region === filters.region;
        return true;
    });

    const getViewLabel = () => {
        if (isMaster) return "System Admin";
        if (isAdmin) return "Administrador";
        if (isManager) return "Gerente";
        if (isSupervisor) return "Supervisor";
        if (isRepresentative) return "Representante";
        return "Filtros";
    }

    return (
        <Card className="mb-8 border-none bg-white shadow-soft hover:shadow-card transition-all duration-500 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                        <Filter className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">
                            Control de Territorio
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em]">Jerarquía:</span>
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[9px] h-4 py-0 font-bold uppercase">
                                {getViewLabel()}
                            </Badge>
                        </div>
                    </div>
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 text-slate-400 hover:text-primary hover:bg-primary/5 font-bold text-xs rounded-lg transition-all"
                    >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        Limpiar Filtros
                    </Button>
                )}
            </div>

            {/* Filter Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Región */}
                    <div className="space-y-2">
                        <label htmlFor="region-select" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5 cursor-pointer">
                            <Globe className="w-3.5 h-3.5 text-primary/40" /> Región
                        </label>
                        <Select
                            name="region"
                            value={filters.region || 'all'}
                            onValueChange={(val) => updateFilters('region', val)}
                            disabled={isRegionLocked}
                        >
                            <SelectTrigger id="region-select" className="h-11 bg-slate-50 border-slate-200 text-slate-700 focus:ring-primary/20 hover:border-primary/30 transition-all rounded-xl font-medium shadow-sm">
                                <SelectValue placeholder="Todas las regiones" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 shadow-2xl rounded-xl">
                                <SelectItem value="all" className="font-medium text-slate-500 italic">Todas las regiones</SelectItem>
                                {Array.from(new Set(Object.values(REGION_MAPPING))).map(r => (
                                    <SelectItem key={r} value={r} className="font-medium text-slate-700">{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isRegionLocked && (
                            <div className="flex items-center gap-1.5 px-1 py-0.5 animate-in fade-in slide-in-from-left-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                                <span className="text-[10px] font-bold text-amber-600/80 uppercase tracking-tighter">Acceso Restringido</span>
                            </div>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="space-y-2">
                        <label htmlFor="state-select" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5 cursor-pointer">
                            <MapPin className="w-3.5 h-3.5 text-primary/40" /> Estado
                        </label>
                        <Select
                            name="state"
                            value={filters.state || 'all'}
                            onValueChange={(val) => updateFilters('state', val)}
                            disabled={isStateLocked}
                        >
                            <SelectTrigger id="state-select" className="h-11 bg-slate-50 border-slate-200 text-slate-700 focus:ring-primary/20 hover:border-primary/30 transition-all rounded-xl font-medium shadow-sm">
                                <SelectValue placeholder="Todos los estados" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 shadow-2xl rounded-xl">
                                <SelectItem value="all" className="font-medium text-slate-500 italic">Todos los estados</SelectItem>
                                {visibleStates.map(s => (
                                    <SelectItem key={s} value={s} className="font-medium text-slate-700">{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isStateLocked && (
                            <div className="flex items-center gap-1.5 px-1 py-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                                <span className="text-[10px] font-bold text-amber-600/80 uppercase tracking-tighter">Viendo: {userState}</span>
                            </div>
                        )}
                    </div>

                    {/* Zona */}
                    <div className="space-y-2">
                        <label htmlFor="zone-select" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5 cursor-pointer">
                            <Layers className="w-3.5 h-3.5 text-primary/40" /> Zona
                        </label>
                        <Select
                            name="zone"
                            value={filters.zoneId || 'all'}
                            onValueChange={(val) => updateFilters('zoneId', val)}
                            disabled={isZoneLocked}
                        >
                            <SelectTrigger id="zone-select" className="h-11 bg-slate-50 border-slate-200 text-slate-700 focus:ring-primary/20 hover:border-primary/30 transition-all rounded-xl font-medium shadow-sm">
                                <SelectValue placeholder="Todas las zonas" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 shadow-2xl rounded-xl">
                                <SelectItem value="all" className="font-medium text-slate-500 italic">Todas las zonas</SelectItem>
                                {visibleZones.map(z => (
                                    <SelectItem key={z.id} value={z.id} className="font-medium text-slate-700">{z.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isZoneLocked && (
                            <div className="flex items-center gap-1.5 px-1 py-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                                <span className="text-[10px] font-bold text-amber-600/80 uppercase tracking-tighter">Zonificación Fija</span>
                            </div>
                        )}
                    </div>

                    {/* Colaborador */}
                    <div className="space-y-2">
                        <label htmlFor="user-select" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5 cursor-pointer">
                            <User className="w-3.5 h-3.5 text-primary/40" /> Colaborador
                        </label>
                        <Select
                            name="user_id"
                            value={filters.userId || 'all'}
                            onValueChange={(val) => updateFilters('userId', val)}
                            disabled={isUserLocked}
                        >
                            <SelectTrigger id="user-select" className="h-11 bg-slate-50 border-slate-200 text-slate-700 focus:ring-primary/20 hover:border-primary/30 transition-all rounded-xl font-medium shadow-sm">
                                <SelectValue placeholder="Seleccionar Colaborador" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 shadow-2xl rounded-xl">
                                <SelectItem value="all" className="font-medium text-slate-500 italic">Todos los colaboradores</SelectItem>
                                {visibleMembers.map(m => (
                                    <SelectItem key={m.id} value={m.id} className="font-medium text-slate-700">{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isUserLocked && (
                            <div className="flex items-center gap-1.5 px-1 py-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                                <span className="text-[10px] font-bold text-blue-600/80 uppercase tracking-tighter">Mis Registros</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Filter Summary */}
                {hasActiveFilters && (
                    <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mr-2">Criterios Activos:</span>
                        {filters.region !== 'all' && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] px-3 py-1 font-bold rounded-full">
                                Región: {filters.region}
                            </Badge>
                        )}
                        {filters.state !== 'all' && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] px-3 py-1 font-bold rounded-full">
                                Estado: {filters.state}
                            </Badge>
                        )}
                        {filters.zoneId && filters.zoneId !== 'all' && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] px-3 py-1 font-bold rounded-full">
                                Zona: {zones.find(z => z.id === filters.zoneId)?.name}
                            </Badge>
                        )}
                        {filters.userId && filters.userId !== 'all' && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] px-3 py-1 font-bold rounded-full">
                                Usuario: {members.find(m => m.id === filters.userId)?.name}
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
