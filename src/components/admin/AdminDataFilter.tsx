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
    moduleType?: 'doctors' | 'pharmacies' | 'visits' | 'contacts' | 'finance' | 'expenses' | 'pipeline' | 'natural_stores' | 'health_centers' | 'hospitals' | 'commerces' | 'drugstores';
}

export function AdminDataFilter({ onFilterChange, moduleType = 'contacts' }: AdminDataFilterProps) {
    const { isMaster, isAdmin, isManager, isSupervisor, isRepresentative, zoneId, profile, userRegion, userState, loading: authLoading, canViewAllData } = useAuth();
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

    const isStrictSupervisor = isSupervisor && !isManager;

    useEffect(() => {
        if (authLoading) return;

        const initFilters = async () => {
            const newFilters: AdminFilterState = { ...filters };
            let shouldUpdate = false;

            if (isStrictSupervisor && userRegion) {
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
                
                let activeState = userState;
                if (!activeState && zones.length > 0) {
                    const uniqueStates = Array.from(new Set(zones.map(z => z.state).filter(Boolean)));
                    if (uniqueStates.length === 1) {
                        activeState = uniqueStates[0] as string;
                    }
                }

                if (activeState && filters.state !== activeState) {
                    newFilters.state = activeState;
                    shouldUpdate = true;
                }
                if (!filters.zoneId) {
                    newFilters.zoneId = 'all';
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
    }, [isStrictSupervisor, isRepresentative, zoneId, userRegion, userState, profile, authLoading, zones]);

    const loadMasterData = async () => {
        setLoading(true);
        try {
            const { data: zonesData } = await (supabase as any).from('zones').select('id, name, state');
            let availableZones = zonesData || [];

            if ((isManager || isRepresentative || isSupervisor) && profile?.id && !isMaster && !isAdmin) {
                const { data: myZones } = await (supabase as any).from('user_zones').select('zone_id').eq('user_id', profile.id);
                if (myZones && myZones.length > 0) {
                    const myZoneIds = myZones.map((z: any) => z.zone_id);
                    availableZones = availableZones.filter((z: any) => myZoneIds.includes(z.id));
                } else if (userState) {
                    availableZones = availableZones.filter((z: any) => z.state === userState);
                } else if (userRegion) {
                    const regionStates = getStatesInRegion(userRegion);
                    availableZones = availableZones.filter((z: any) => z.state && regionStates.includes(z.state));
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

        if (isStrictSupervisor && userRegion) resetFilters.region = userRegion;
        if (isRepresentative) {
            if (userRegion) resetFilters.region = userRegion;
            if (userState) resetFilters.state = userState;
            resetFilters.zoneId = 'all';
            if (profile?.id) resetFilters.userId = profile.id;
        }

        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const hasActiveFilters = filters.region !== 'all' || filters.state !== 'all' || (filters.zoneId && filters.zoneId !== 'all') || (filters.userId && filters.userId !== 'all');
    const isRegionLocked = isStrictSupervisor || isRepresentative;
    const isStateLocked = isRepresentative;
    const isZoneLocked = false;
    const isUserLocked = isRepresentative;

    const visibleStates = (isStrictSupervisor && userRegion)
        ? getStatesInRegion(userRegion)
        : (filters.region && filters.region !== 'all' ? getStatesInRegion(filters.region) : getAllStates());

    const visibleZones = filters.state && filters.state !== 'all'
        ? zones.filter(z => z.state === filters.state)
        : (isStrictSupervisor && userRegion
            ? zones.filter(z => z.state && visibleStates.includes(z.state))
            : zones);

    const visibleMembers = members.filter(m => {
        if (isStrictSupervisor && profile?.id) {
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
        <Card className="mb-6 border border-border shadow-sm bg-card rounded-2xl overflow-hidden group/filter">
            <div className="px-6 py-4 flex items-center justify-between bg-muted/20 border-b border-border/40">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Filter className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground tracking-tight">
                            Mando de Territorio
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Nivel de Acceso:</span>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] h-5 px-2 font-bold uppercase rounded-md">
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
                        className="h-9 px-4 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-lg transition-all gap-2"
                    >
                        <X className="h-3.5 w-3.5" />
                        Reset Operativo
                    </Button>
                )}
            </div>

            <div className="p-6 bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Región */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-primary/60" />
                            Región Estratégica
                        </label>
                        <Select
                            value={filters.region || 'all'}
                            onValueChange={(val) => updateFilters('region', val)}
                            disabled={isRegionLocked}
                        >
                            <SelectTrigger className="h-11 bg-background border-border hover:border-primary/40 transition-all rounded-xl font-semibold text-sm px-4">
                                <SelectValue placeholder="Global" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-semibold text-muted-foreground text-xs py-2.5">Todas las regiones</SelectItem>
                                {Array.from(new Set(Object.values(REGION_MAPPING))).map(r => (
                                    <SelectItem key={r} value={r} className="font-semibold text-foreground text-xs py-2.5">{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isRegionLocked && (
                            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 mt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Bloqueo Regional
                            </p>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary/60" />
                            Jurisdicción / Entidad
                        </label>
                        <Select
                            value={filters.state || 'all'}
                            onValueChange={(val) => updateFilters('state', val)}
                            disabled={isStateLocked}
                        >
                            <SelectTrigger className="h-11 bg-background border-border hover:border-primary/40 transition-all rounded-xl font-semibold text-sm px-4">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-semibold text-muted-foreground text-xs py-2.5">Todos los estados</SelectItem>
                                {visibleStates.map(s => (
                                    <SelectItem key={s} value={s} className="font-semibold text-foreground text-xs py-2.5">{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isStateLocked && (
                            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 mt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Anclaje de Entidad
                            </p>
                        )}
                    </div>

                    {/* Zona */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-primary/60" />
                            Zona Operativa
                        </label>
                        <Select
                            value={filters.zoneId || 'all'}
                            onValueChange={(val) => updateFilters('zoneId', val)}
                            disabled={isZoneLocked}
                        >
                            <SelectTrigger className="h-11 bg-background border-border hover:border-primary/40 transition-all rounded-xl font-semibold text-sm px-4">
                                <SelectValue placeholder="Sector" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-semibold text-muted-foreground text-xs py-2.5">Todas las zonas</SelectItem>
                                {visibleZones.map(z => (
                                    <SelectItem key={z.id} value={z.id} className="font-semibold text-foreground text-xs py-2.5">{z.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isZoneLocked && (
                            <p className="text-[9px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Segmentación
                            </p>
                        )}
                    </div>

                    {/* Colaborador */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-primary/60" />
                            Operador Designado
                        </label>
                        <Select
                            value={filters.userId || 'all'}
                            onValueChange={(val) => updateFilters('userId', val)}
                            disabled={isUserLocked}
                        >
                            <SelectTrigger className="h-11 bg-background border-border hover:border-primary/40 transition-all rounded-xl font-semibold text-sm px-4">
                                <SelectValue placeholder="Operador" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-semibold text-muted-foreground text-xs py-2.5">Todos los operadores</SelectItem>
                                {visibleMembers.map(m => (
                                    <SelectItem key={m.id} value={m.id} className="font-semibold text-foreground text-xs py-2.5">{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isUserLocked && (
                            <p className="text-[9px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Perfil Activo
                            </p>
                        )}
                    </div>
                </div>

                {/* Active Filter Summary */}
                {hasActiveFilters && (
                    <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-2">Criterios:</span>
                        <div className="flex flex-wrap gap-2">
                            {filters.region !== 'all' && (
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] px-3 py-1 font-semibold rounded-lg uppercase">
                                    REG: {filters.region}
                                </Badge>
                            )}
                            {filters.state !== 'all' && (
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] px-3 py-1 font-semibold rounded-lg uppercase">
                                    EST: {filters.state}
                                </Badge>
                            )}
                            {filters.zoneId && filters.zoneId !== 'all' && (
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] px-3 py-1 font-semibold rounded-lg uppercase">
                                    ZONA: {zones.find(z => z.id === filters.zoneId)?.name}
                                </Badge>
                            )}
                            {filters.userId && filters.userId !== 'all' && (
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] px-3 py-1 font-semibold rounded-lg uppercase">
                                    USER: {members.find(m => m.id === filters.userId)?.name}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
