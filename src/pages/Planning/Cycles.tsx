
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon, Loader2, Plus, RefreshCw, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Cycle } from "@/types/planning";

// Mock implementation until real service is fully integrated/debugged or custom hooks created
const useCycles = () => {
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCycles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('cycles' as any)
            .select('*')
            .order('start_date', { ascending: false });

        if (error) {
            toast({ title: "Error", description: "No se pudieron cargar los ciclos", variant: "destructive" });
        } else {
            setCycles(data as unknown as Cycle[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCycles();
    }, []);

    return { cycles, loading, refetch: fetchCycles };
};

export default function CyclesPage() {
    const { cycles, loading, refetch } = useCycles();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        defaultValues: {
            name: "",
            start_date: new Date(),
            end_date: new Date(),
            status: "open"
        }
    });

    const onSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('cycles' as any).insert({
                name: values.name,
                start_date: values.start_date.toISOString(),
                end_date: values.end_date.toISOString(),
                status: values.status
            });

            if (error) throw error;

            toast({ title: "Ciclo creado", description: "El ciclo comercial se ha registrado exitosamente." });
            setDialogOpen(false);
            form.reset();
            refetch();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo crear el ciclo.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ciclos Comerciales</h1>
                    <p className="text-muted-foreground">Gestiona los periodos de venta y objetivos mensuales.</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-medical">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Ciclo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Ciclo</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre del Ciclo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Enero 2025" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="start_date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Inicio</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                                {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="end_date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Fin</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                                {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar estado" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="planning">Planificación</SelectItem>
                                                    <SelectItem value="open">Abierto (Activo)</SelectItem>
                                                    <SelectItem value="closed">Cerrado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Crear Ciclo
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : cycles.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No hay ciclos registrados</h3>
                        <p className="text-muted-foreground mb-4">Crea el primer ciclo comercial para comenzar la planificación.</p>
                        <Button variant="outline" onClick={() => setDialogOpen(true)}>Crear Ciclo</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {cycles.map((cycle) => (
                        <Card key={cycle.id} className={cn("transition-all hover:shadow-md", cycle.status === 'open' ? 'border-primary border-l-4' : '')}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{cycle.name}</CardTitle>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-semibold",
                                        cycle.status === 'open' ? "bg-green-100 text-green-700" :
                                            cycle.status === 'planning' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                    )}>
                                        {cycle.status === 'open' ? 'ACTIVO' : cycle.status === 'planning' ? 'PLANIFICACIÓN' : 'CERRADO'}
                                    </span>
                                </div>
                                <CardDescription>
                                    {format(new Date(cycle.start_date), "PP", { locale: es })} - {format(new Date(cycle.end_date), "PP", { locale: es })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Edit className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
