/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Building2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface HealthCenterSelectProps {
    value?: string;
    onValueChange: (value: string, name: string) => void;
    className?: string;
}

export function HealthCenterSelect({ value, onValueChange, className }: HealthCenterSelectProps) {
    const [open, setOpen] = useState(false);
    const [centers, setCenters] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { organizationId } = useAuth();

    useEffect(() => {
        loadHealthCenters();
    }, [organizationId]);

    const loadHealthCenters = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('health_centers')
                .select('id, name, city, facility_type')
                .eq('organization_id', organizationId)
                .order('name');

            if (error) throw error;
            setCenters(data || []);
        } catch (error) {
            console.error('Error loading health centers:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedCenter = centers.find((center) => center.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50", className)}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Building2 className="h-4 w-4 text-blue-500 opacity-50" />
                        {selectedCenter ? (
                            <span className="truncate">{selectedCenter.name} <span className="text-[10px] text-slate-400 font-normal">({selectedCenter.city})</span></span>
                        ) : (
                            <span className="text-muted-foreground">Vincular Centro de Salud...</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl shadow-2xl border-slate-100">
                <Command className="rounded-2xl">
                    <CommandInput placeholder="Buscar centro..." className="h-11 font-bold" />
                    <CommandList>
                        <CommandEmpty className="py-6 text-center text-slate-500">
                            <p className="text-xs font-bold mb-2">No se encontró el centro</p>
                            <Button size="sm" variant="ghost" className="text-blue-600 text-[10px] uppercase font-black tracking-widest">
                                <Plus className="h-3 w-3 mr-1" /> Registrar Nuevo
                            </Button>
                        </CommandEmpty>
                        <CommandGroup heading="Centros Disponibles">
                            {centers.map((center) => (
                                <CommandItem
                                    key={center.id}
                                    value={center.name}
                                    onSelect={() => {
                                        onValueChange(center.id, center.name);
                                        setOpen(false);
                                    }}
                                    className="py-3 px-4 flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700">{center.name}</span>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">{center.facility_type} • {center.city}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 text-blue-600",
                                            value === center.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
