/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, getWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Plus, Calendar as CalendarIcon, Save, Trash2, MapPin, Play, Repeat, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { planningService } from "@/services/planningService";
import { Cycle, WeeklyPlan, DailyPlanDetail, DirectoryItem } from "@/types/planning";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useDemoData } from "@/contexts/MockDataProvider";

const DAYS = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" }
];

const TURNS = ["AM", "PM"];

export default function WeeklyScheduler() {
    const queryClient = useQueryClient();
    const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number>(getWeek(new Date()));
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSlot, setSelectedSlot] = useState<{ day: string, turn: 'AM' | 'PM', date: string } | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Demo mode hook
    const demoData = useDemoData();

    // User ID (Mocked for now, should come from Auth Context)
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    // Fetch Cycles (or use demo data)
    const { data: cycles } = useQuery({
        queryKey: ['cycles'],
        queryFn: demoData ? () => Promise.resolve(demoData.cycles as any[]) : planningService.getActiveCycles,
        enabled: !demoData || true
    });

    // Set default cycle
    useEffect(() => {
        if (cycles && cycles.length > 0 && !selectedCycleId) {
            setSelectedCycleId(cycles[0].id);
        }
    }, [cycles, selectedCycleId]);

    // Fetch Weekly Plan (or use demo data)
    const { data: weeklyPlans, isLoading: isLoadingPlan } = useQuery({
        queryKey: ['weeklyPlans', userId, selectedCycleId],
        queryFn: () => {
            if (demoData) {
                return Promise.resolve(demoData.weeklyPlans as any[]);
            }
            return userId ? planningService.getWeeklyPlans(userId, selectedCycleId!) : Promise.resolve([]);
        },
        enabled: !!userId && !!selectedCycleId
    });

    const currentPlan = weeklyPlans?.find(p => p.week_number === selectedWeek);

    // Fetch Plan Details - Visits (or use demo data)
    const { data: planDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['planDetails', currentPlan?.id, demoData ? 'demo' : 'real'],
        queryFn: () => {
            if (demoData) {
                // In demo mode, return ALL plan details (no filtering needed)
                console.log("WeeklyScheduler: Using demo planDetails", demoData.planDetails);
                return Promise.resolve(demoData.planDetails as any[]);
            }
            return currentPlan ? planningService.getPlanDetails(currentPlan.id) : Promise.resolve([]);
        },
        enabled: !!currentPlan || !!demoData
    });

    // Search Directory (or use demo data)
    const { data: searchResults } = useQuery({
        queryKey: ['directorySearch', searchQuery],
        queryFn: () => {
            if (demoData && searchQuery.length > 2) {
                // Search in demo contacts
                const query = searchQuery.toLowerCase();
                const results = demoData.contacts
                    .filter((c: any) => c.name.toLowerCase().includes(query))
                    .map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        entity_type: c.contact_type === 'doctor' ? 'doctor' : 'pharmacy',
                        city: c.city,
                        address: c.address
                    }));
                return Promise.resolve(results as any[]);
            }
            return planningService.searchDirectory(searchQuery);
        },
        enabled: searchQuery.length > 2
    });

    // Mutations
    const createPlanMutation = useMutation({
        mutationFn: planningService.createWeeklyPlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weeklyPlans'] });
        }
    });

    const addDetailMutation = useMutation({
        mutationFn: planningService.savePlanDetails,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planDetails'] });
            setIsDialogOpen(false);
            setSearchQuery("");
            toast({ title: "Visita agregada", description: "La visita se ha programado correctamente." });
        },
        onError: () => {
            toast({ title: "Error", description: "No se pudo agendar la visita.", variant: "destructive" });
        }
    });

    const removeDetailMutation = useMutation({
        mutationFn: planningService.deletePlanDetail,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planDetails'] });
            toast({ title: "Visita eliminada" });
        }
    });

    const autoFillMutation = useMutation({
        mutationFn: async () => {
            // DEMO MODE: Just show success message, don't call Supabase
            if (demoData) {
                toast({
                    title: "Modo Demo",
                    description: "En el demo, las visitas ya están pre-cargadas en el planificador.",
                    className: "bg-blue-50 border-blue-200"
                });
                return;
            }

            if (!userId || !selectedCycleId || !selectedWeek) return;

            setIsSyncing(true);
            try {
                // 1. Get or create current plan
                let planId = currentPlan?.id;
                if (!planId) {
                    const now = new Date();
                    const newPlan = await planningService.createWeeklyPlan({
                        user_id: userId,
                        cycle_id: selectedCycleId,
                        week_number: selectedWeek,
                        start_date: now.toISOString(),
                        end_date: now.toISOString(),
                        status: 'draft'
                    });
                    planId = newPlan.id;
                }

                // 2. Calculate date range for the week
                const start = startOfWeek(new Date(), { weekStartsOn: 1 });
                // Note: In real app, this should be adjusted by selectedWeek if it's not current
                const startDate = format(start, "yyyy-MM-dd");
                const endDate = format(addDays(start, 6), "yyyy-MM-dd");

                // 3. Fetch visits
                const visits = await planningService.getScheduledVisits(userId, startDate, endDate);

                // 4. Sync
                await planningService.syncPlanWithScheduledVisits(planId, visits);

                toast({
                    title: "Planificador actualizado",
                    description: `Se han importado ${visits.length} visitas desde tu agenda.`
                });
            } finally {
                setIsSyncing(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planDetails'] });
        },
        onError: (error: any) => {
            toast({
                title: "Error al sincronizar",
                description: error.message || "No se pudo importar la agenda.",
                variant: "destructive"
            });
        }
    });

    // Helpers
    const handleAddVisit = async (directoryItem: DirectoryItem) => {
        if (!userId || !selectedCycleId || !selectedSlot) return;

        // Si es recurrente, crear serie via RPC
        if (isRecurring) {
            try {
                // Mapear día de DAYS a número (0=Domingo en PostgreSQL)
                const dayMapping: { [key: string]: number } = {
                    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
                    'thursday': 4, 'friday': 5, 'saturday': 6
                };
                const dayOfWeek = dayMapping[selectedSlot.day] ?? 1;
                const preferredTime = selectedSlot.turn === 'AM' ? '09:00:00' : '14:00:00';

                // @ts-ignore - RPC function created in recurring_visits.sql
                const { data, error } = await supabase.rpc('create_visit_series', {
                    p_user_id: userId,
                    p_contact_id: directoryItem.id,
                    p_day_of_week: dayOfWeek,
                    p_preferred_time: preferredTime,
                    p_turn: selectedSlot.turn,
                    p_frequency: 'weekly',
                    p_visit_type: null,
                    p_visit_objective: null,
                    p_notes: null,
                    p_first_visit_date: selectedSlot.date
                });

                if (error) throw error;

                const result = data as { success: boolean; error?: string; series_id?: string };
                if (!result.success) {
                    throw new Error(result.error || 'Error al crear serie');
                }

                queryClient.invalidateQueries({ queryKey: ['planDetails'] });
                setIsDialogOpen(false);
                setSearchQuery("");
                setIsRecurring(false);
                toast({
                    title: "Serie recurrente creada",
                    description: `Visita a ${directoryItem.name} programada cada ${DAYS.find(d => d.key === selectedSlot.day)?.label}.`,
                    className: "bg-purple-50 border-purple-200"
                });
                return;

            } catch (error: any) {
                console.error("Error creating recurring visit:", error);
                toast({
                    title: "Error",
                    description: error.message || "No se pudo crear la visita recurrente.",
                    variant: "destructive"
                });
                return;
            }
        }

        // Flujo normal (visita única)
        let planId = currentPlan?.id;

        // Create plan if doesn't exist for this week
        if (!planId) {
            try {
                // Calculate start/end date for the week (rough approx for now)
                // In prod, use proper date math based on cycle start + week number
                const now = new Date();
                const newPlan = await createPlanMutation.mutateAsync({
                    user_id: userId,
                    cycle_id: selectedCycleId,
                    week_number: selectedWeek,
                    start_date: now.toISOString(), // Placeholder
                    end_date: now.toISOString(), // Placeholder
                    status: 'draft'
                });
                planId = newPlan.id;
            } catch (e) {
                console.error("Error creating plan", e);
                return;
            }
        }

        // Add detail
        await addDetailMutation.mutateAsync([{
            weekly_plan_id: planId,
            day_of_week: selectedSlot.day,
            date: selectedSlot.date,
            turn: selectedSlot.turn,
            directory_item_id: directoryItem.id,
            visit_order: (planDetails?.filter(d => d.day_of_week === selectedSlot.day && d.turn === selectedSlot.turn).length || 0) + 1,
            status: 'planned'
        }]);

        setIsRecurring(false);
    };

    const calculateDateForDay = (dayKey: string) => {
        // This is a simplification. Real implementation needs robust week date calc based on year/cycle.
        // For verify, we'll assume current week.
        const start = startOfWeek(new Date(), { weekStartsOn: 1 });
        const dayIndex = DAYS.findIndex(d => d.key === dayKey);
        return format(addDays(start, dayIndex), "yyyy-MM-dd");
    };

    const openAddDialog = (day: string, turn: 'AM' | 'PM') => {
        setSelectedSlot({
            day,
            turn,
            date: calculateDateForDay(day)
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-4 space-y-4">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-background p-4 rounded-lg border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold">Planificador Semanal</h1>
                    <p className="text-muted-foreground text-sm">Organiza tu ruta de visitas para el ciclo.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <Select value={selectedCycleId || ""} onValueChange={setSelectedCycleId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar Ciclo" />
                        </SelectTrigger>
                        <SelectContent>
                            {cycles?.map(cycle => (
                                <SelectItem key={cycle.id} value={cycle.id}>{cycle.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={String(selectedWeek)} onValueChange={(v) => setSelectedWeek(Number(v))}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Semana" />
                        </SelectTrigger>
                        <SelectContent>
                            {[...Array(52)].map((_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>Semana {i + 1}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={() => autoFillMutation.mutate()}
                        disabled={isSyncing || !selectedCycleId}
                        className="bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                        <Wand2 className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                        {isSyncing ? 'Sincronizando...' : 'Auto-completar desde Agenda'}
                    </Button>
                    <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Guardar Borrador</Button>
                </div>
            </div>

            {/* Weekly Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {DAYS.map((day) => (
                    <Card key={day.key} className="flex flex-col h-[600px]">
                        <CardHeader className="py-3 bg-muted/30">
                            <CardTitle className="text-center text-sm font-medium uppercase tracking-wider">
                                {day.label}
                                <span className="block text-xs font-normal text-muted-foreground mt-1">
                                    {format(new Date(calculateDateForDay(day.key)), "d MMM", { locale: es })}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-2 space-y-2 overflow-y-auto">
                            {TURNS.map((turn) => (
                                <div key={turn} className="flex flex-col gap-2 p-2 rounded-lg bg-slate-50 border h-1/2">
                                    <div className="flex justify-between items-center">
                                        <Badge variant="secondary" className="text-xs">{turn}</Badge>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openAddDialog(day.key, turn as 'AM' | 'PM')}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2 overflow-y-auto pr-1">
                                        {planDetails?.filter(d => d.day_of_week === day.key && d.turn === turn).map((detail) => (
                                            <div key={detail.id} className="text-xs bg-white dark:bg-slate-800 p-2 rounded border shadow-sm group relative hover:border-primary transition-colors">
                                                <div className="font-semibold truncate text-slate-900 dark:text-white">{detail.directory_item?.name || "⚠️ Sin nombre"}</div>
                                                <div className="text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate">{detail.directory_item?.city || detail.directory_item?.address || "Sin dirección"}</span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${detail.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {detail.status || 'Pendiente'}
                                                    </span>
                                                    {(!detail.status || detail.status === 'planned' || detail.status === 'in_progress') && (
                                                        <Link to={`/visits/execution/${detail.id}`}>
                                                            <Button size="sm" className="h-6 gap-1 bg-blue-600 hover:bg-blue-700 text-[10px] px-2 shadow-sm">
                                                                <Play className="h-3 w-3" /> Iniciar
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive" onClick={() => removeDetailMutation.mutate(detail.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {planDetails?.filter(d => d.day_of_week === day.key && d.turn === turn).length === 0 && (
                                            <div className="text-center py-4 opacity-30 text-xs italic">
                                                Sin visitas
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Visit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Visita</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar médico o farmacia..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                            {/* Show empty state or loading */}
                            {!searchQuery && <p className="text-center text-sm text-muted-foreground py-4">Ingresa nombre para buscar</p>}

                            {searchResults?.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-2 hover:bg-muted rounded cursor-pointer" onClick={() => handleAddVisit(item)}>
                                    <div>
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.entity_type === 'doctor' ? 'Médico' : 'Farmacia'} - {item.city}</p>
                                    </div>
                                    <Button size="sm" variant="ghost"><Plus className="h-4 w-4" /></Button>
                                </div>
                            ))}

                            {searchQuery && searchResults?.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-4">No se encontraron resultados</p>
                            )}
                        </ScrollArea>

                        {/* Checkbox de recurrencia */}
                        <div className="flex items-center space-x-3 p-3 rounded-lg border bg-purple-50/50 border-purple-200">
                            <Checkbox
                                id="recurring"
                                checked={isRecurring}
                                onCheckedChange={(checked) => setIsRecurring(checked === true)}
                            />
                            <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer">
                                <Repeat className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">¿Repetir semanalmente?</span>
                            </Label>
                        </div>
                        {isRecurring && (
                            <p className="text-xs text-purple-600 -mt-2 ml-1">
                                La visita se programará automáticamente cada {DAYS.find(d => d.key === selectedSlot?.day)?.label || 'semana'}.
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
