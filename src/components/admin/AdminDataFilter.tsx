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
        <Card className="mb-12 border border-border/40 shadow-premium-lg bg-card transition-all duration-700 overflow-hidden rounded-[3rem] group/filter pb-1 border-b-4 border-b-primary/10">
            <div className="px-10 py-10 flex items-center justify-between bg-card border-b border-border/40 relative overflow-hidden">
                {/* Subtle decorator - Corporate Glow */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover/filter:opacity-100 transition-opacity duration-1000" />
                
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center shadow-inner border border-border/40 group transition-all duration-500 hover:bg-card hover:border-primary/30 hover:shadow-premium-md hover:-rotate-3">
                        <Filter className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter font-display leading-[0.8]">
                            Mando de<br />Territorio
                        </h3>
                        <div className="flex items-center gap-4 mt-4">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] font-display">Nivel de Acceso:</span>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] h-7 px-5 font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
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
                        className="h-14 px-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-[10px] rounded-2xl transition-all uppercase tracking-[0.25em] gap-3 relative z-10 border border-transparent hover:border-rose-100 shadow-premium-sm"
                    >
                        <X className="h-4 w-4" />
                        Reset Operativo
                    </Button>
                )}
            </div>

            {/* Filter Content Dynamism */}
            <div className="p-12 bg-muted/5 backdrop-blur-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Región */}
                    <div className="space-y-5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 flex items-center gap-3 font-display">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            Región Estratégica
                        </label>
                        <Select
                            value={filters.region || 'all'}
                            onValueChange={(val) => updateFilters('region', val)}
                            disabled={isRegionLocked}
                        >
                            <SelectTrigger className="h-18 bg-background border-border/60 text-foreground focus:ring-primary/20 hover:border-primary/40 hover:shadow-premium-md transition-all duration-300 rounded-[1.5rem] font-black uppercase tracking-widest px-8 shadow-premium-sm border-2">
                                <div className="flex items-center gap-4">
                                    <Globe className="w-5 h-5 text-slate-300" />
                                    <SelectValue placeholder="Global" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border shadow-premium-2xl rounded-[2rem] p-3 border-2">
                                <SelectItem value="all" className="font-black text-slate-400 uppercase tracking-widest text-[11px] py-5 rounded-xl focus:bg-slate-50">Todas las regiones</SelectItem>
                                {Array.from(new Set(Object.values(REGION_MAPPING))).map(r => (
                                    <SelectItem key={r} value={r} className="font-black text-slate-900 uppercase tracking-widest text-[11px] py-5 rounded-xl focus:bg-primary/5 focus:text-primary">{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isRegionLocked && (
                            <div className="flex items-center gap-3 px-3 py-2 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest font-display">Bloqueo Regional Vigente</span>
                            </div>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="space-y-5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 flex items-center gap-3 font-display">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            Jurisdicción / Entidad
                        </label>
                        <Select
                            value={filters.state || 'all'}
                            onValueChange={(val) => updateFilters('state', val)}
                            disabled={isStateLocked}
                        >
                            <SelectTrigger className="h-18 bg-background border-border/60 text-foreground focus:ring-primary/20 hover:border-primary/40 hover:shadow-premium-md transition-all duration-300 rounded-[1.5rem] font-black uppercase tracking-widest px-8 shadow-premium-sm border-2">
                                <div className="flex items-center gap-4">
                                    <MapPin className="w-5 h-5 text-slate-300" />
                                    <SelectValue placeholder="Estado" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-100 shadow-premium-2xl rounded-[2rem] p-3 border-2">
                                <SelectItem value="all" className="font-black text-slate-400 uppercase tracking-widest text-[11px] py-5 rounded-xl focus:bg-slate-50">Todos los estados</SelectItem>
                                {visibleStates.map(s => (
                                    <SelectItem key={s} value={s} className="font-black text-slate-900 uppercase tracking-widest text-[11px] py-5 rounded-xl focus:bg-primary/5 focus:text-primary">{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isStateLocked && (
                            <div className="flex items-center gap-3 px-3 py-2 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest font-display">Anclaje de Entidad OK</span>
                            </div>
                        )}
                    </div>

                    {/* Zona */}
                    <div className="space-y-5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 flex items-center gap-3 font-display">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            Zona Operativa
                        </label>
                        <Select
                            value={filters.zoneId || 'all'}
                            onValueChange={(val) => updateFilters('zoneId', val)}
                            disabled={isZoneLocked}
                        >
                            <SelectTrigger className="h-18 bg-background border-border/60 text-foreground focus:ring-primary/20 hover:border-primary/40 hover:shadow-premium-md transition-all duration-300 rounded-[1.5rem] font-black uppercase tracking-widest px-8 shadow-premium-sm border-2">
                                <div className="flex items-center gap-4">
                                    <Layers className="w-5 h-5 text-slate-300" />
                                    <SelectValue placeholder="Sector" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-100 shadow-premium-2xl rounded-[2rem] p-3 border-2">
                                <SelectItem value="all" className="font-black text-slate-400 uppercase tracking-widest text-[11px] py-5 rounded-xl focus:bg-slate-50">Todas las zonas</SelectItem>
                                {visibleZones.map(z => (
                                    <SelectItem key={z.id} value={z.id} className="font-black text-slate-900 uppercase tracking-widest text-[11px] py-5 rounded-xl focus:bg-primary/5 focus:text-primary">{z.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isZoneLocked && (
                            <div className="flex items-center gap-3 px-3 py-2 bg-primary/5 rounded-xl border border-primary/10">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest font-display">Segmentación Industrial</span>
                            </div>
                        )}
                    </div>

                    {/* Colaborador */}
                    <div className="space-y-5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 flex items-center gap-3 font-display">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            Operador Designado
                        </label>
                        <Select
                            value={filters.userId || 'all'}
                            onValueChange={(val) => updateFilters('userId', val)}
                            disabled={isUserLocked}
                        >
                            <SelectTrigger className="h-18 bg-background border-border/60 text-foreground focus:ring-primary/20 hover:border-primary/40 hover:shadow-premium-md transition-all duration-300 rounded-[1.5rem] font-black uppercase tracking-widest px-8 shadow-premium-sm border-2">
                                <div className="flex items-center gap-4">
                                    <User className="w-5 h-5 text-slate-300" />
                                    <SelectValue placeholder="Operador" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-100 shadow-premium-2xl rounded-[2rem] p-3 border-2">
                                <SelectItem value="all" className="font-black text-slate-400 uppercase tracking-widest text-[11px] py-5 rounded-xl focus:bg-slate-50">Todos los colaboradores</SelectItem>
                                {visibleMembers.map(m => (
                                    <SelectItem key={m.id} value={m.id} className="font-black text-slate-900 uppercase tracking-widest text-[11px] py-5 rounded-xl focus:bg-primary/5 focus:text-primary">{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isUserLocked && (
                            <div className="flex items-center gap-3 px-3 py-2 bg-primary/5 rounded-xl border border-primary/10">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest font-display">Perfil Individual Activo</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Filter Summary Elite */}
                <div className="mt-16 pt-12 border-t border-slate-100 flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-4 mr-8">
                        <div className="w-3 h-12 bg-primary rounded-full shadow-premium-sm shadow-primary/20" />
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] font-display block">Análisis</span>
                            <span className="text-[14px] font-black text-slate-900 uppercase tracking-tighter font-display block -mt-1">Criterios Activos</span>
                        </div>
                    </div>
                    
                    {!hasActiveFilters ? (
                        <div className="flex items-center gap-4 bg-slate-100/50 px-8 py-4 rounded-2xl border border-dashed border-slate-200">
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-display">Visualización Global de Activos</span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-4">
                            {filters.region !== 'all' && (
                                <Badge className="bg-primary/5 text-primary border border-primary/20 text-[10px] px-6 py-3 font-black rounded-xl uppercase tracking-widest shadow-premium-sm">
                                    REG: {filters.region}
                                </Badge>
                            )}
                            {filters.state !== 'all' && (
                                <Badge className="bg-primary/5 text-primary border border-primary/20 text-[10px] px-6 py-3 font-black rounded-xl uppercase tracking-widest shadow-premium-sm">
                                    EST: {filters.state}
                                </Badge>
                            )}
                            {filters.zoneId && filters.zoneId !== 'all' && (
                                <Badge className="bg-primary/5 text-primary border border-primary/20 text-[10px] px-6 py-3 font-black rounded-xl uppercase tracking-widest shadow-premium-sm">
                                    ZONA: {zones.find(z => z.id === filters.zoneId)?.name}
                                </Badge>
                            )}
                            {filters.userId && filters.userId !== 'all' && (
                                <Badge className="bg-primary/5 text-primary border border-primary/20 text-[10px] px-6 py-3 font-black rounded-xl uppercase tracking-widest shadow-premium-sm">
                                    USER: {members.find(m => m.id === filters.userId)?.name}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
