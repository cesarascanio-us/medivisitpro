import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, MapPin, CheckCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/contexts/MockDataProvider";

interface PlanItem {
    id: string;
    title: string;
    description: string | null;
    scheduled_time: string | null;
    duration_minutes: number;
    priority: number;
    status: string;
    contact_id: string | null;
    contacts?: { name: string; specialty: string };
}

interface DailyPlan {
    id: string;
    plan_date: string;
    title: string | null;
    notes: string | null;
    status: string;
}

export default function Planner() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [plan, setPlan] = useState<DailyPlan | null>(null);
    const [items, setItems] = useState<PlanItem[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Demo mode hook
    const demoData = useDemoData();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        scheduled_time: "09:00",
        duration_minutes: 30,
        contact_id: ""
    });

    useEffect(() => {
        if (user) {
            loadPlan();
            loadContacts();
        }
    }, [user, selectedDate]);

    const loadPlan = async () => {
        try {
            setLoading(true);

            // DEMO MODE: Use mock data
            if (demoData) {
                console.log("Planner: Using mock demo data");
                // Create mock daily plan with items based on visits for today
                const todayStr = selectedDate;
                const mockItems: PlanItem[] = demoData.visits
                    .filter((v: any) => v.scheduled_date.startsWith(todayStr))
                    .map((v: any, idx: number) => ({
                        id: `plan-item-${idx}`,
                        title: `Visita a ${v.contacts?.name || 'Contacto'}`,
                        description: v.objective || v.notes,
                        scheduled_time: new Date(v.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        duration_minutes: 30,
                        priority: idx,
                        status: v.status === 'completed' ? 'completed' : 'pending',
                        contact_id: v.contact_id,
                        contacts: { name: v.contacts?.name || '', specialty: v.contacts?.specialty || '' }
                    }));
                setPlan({ id: 'demo-plan', plan_date: todayStr, title: 'Plan Demo', notes: null, status: 'active' });
                setItems(mockItems);
                setLoading(false);
                return;
            }

            // Get or create plan for date
            let { data: planData } = await supabase
                .from('daily_plans')
                .select('*')
                .eq('user_id', user?.id)
                .eq('plan_date', selectedDate)
                .single();

            if (!planData) {
                const { data: newPlan } = await supabase
                    .from('daily_plans')
                    .insert({ user_id: user?.id, plan_date: selectedDate })
                    .select()
                    .single();
                planData = newPlan;
            }

            setPlan(planData);

            if (planData) {
                const { data: itemsData } = await supabase
                    .from('daily_plan_items')
                    .select('*, contacts(name, specialty)')
                    .eq('plan_id', planData.id)
                    .order('scheduled_time', { ascending: true });

                setItems(itemsData || []);
            }
        } catch (error) {
            console.error('Error loading plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        // DEMO MODE: Use mock contacts
        if (demoData) {
            setContacts(demoData.contacts as any[]);
            return;
        }
        const { data } = await supabase.from('contacts').select('id, name, specialty');
        setContacts(data || []);
    };

    const addItem = async () => {
        if (!user || !plan || !formData.title) return;

        try {
            const { error } = await supabase.from('daily_plan_items').insert({
                user_id: user.id,
                plan_id: plan.id,
                title: formData.title,
                description: formData.description || null,
                scheduled_time: formData.scheduled_time,
                duration_minutes: formData.duration_minutes,
                contact_id: formData.contact_id || null,
                status: 'pending',
                priority: items.length
            });

            if (error) throw error;

            toast({ title: "Tarea agregada", description: "La tarea ha sido añadida al plan." });
            setDialogOpen(false);
            setFormData({ title: "", description: "", scheduled_time: "09:00", duration_minutes: 30, contact_id: "" });
            loadPlan();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo agregar la tarea.", variant: "destructive" });
        }
    };

    const toggleItemStatus = async (item: PlanItem) => {
        const newStatus = item.status === 'completed' ? 'pending' : 'completed';

        try {
            await supabase
                .from('daily_plan_items')
                .update({ status: newStatus })
                .eq('id', item.id);

            setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const navigateDate = (direction: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + direction);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const completedCount = items.filter(i => i.status === 'completed').length;
    const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Planificador Diario</h1>
                    <p className="text-muted-foreground">Organiza tus actividades del día</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-medical">
                            <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Agregar Tarea</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Título *</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Nombre de la tarea"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Hora</Label>
                                    <Input
                                        type="time"
                                        value={formData.scheduled_time}
                                        onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Duración (min)</Label>
                                    <Select
                                        value={formData.duration_minutes.toString()}
                                        onValueChange={(v) => setFormData({ ...formData, duration_minutes: parseInt(v) })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 min</SelectItem>
                                            <SelectItem value="30">30 min</SelectItem>
                                            <SelectItem value="45">45 min</SelectItem>
                                            <SelectItem value="60">1 hora</SelectItem>
                                            <SelectItem value="90">1.5 horas</SelectItem>
                                            <SelectItem value="120">2 horas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Contacto (opcional)</Label>
                                <Select value={formData.contact_id} onValueChange={(v) => setFormData({ ...formData, contact_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar contacto" /></SelectTrigger>
                                    <SelectContent>
                                        {contacts.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name} - {c.specialty}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Notas</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalles adicionales..."
                                />
                            </div>
                            <Button onClick={addItem} className="w-full btn-medical">Agregar Tarea</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Date Navigation */}
            <Card className="medical-card">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => navigateDate(-1)}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="text-center">
                            <h2 className="text-xl font-semibold capitalize">{formatDate(selectedDate)}</h2>
                            <div className="flex items-center justify-center gap-4 mt-2">
                                <Badge variant="outline">{completedCount} / {items.length} tareas</Badge>
                                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={() => navigateDate(1)}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tasks List */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Cargando plan...</div>
            ) : items.length === 0 ? (
                <Card className="medical-card">
                    <CardContent className="text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Sin tareas programadas</h3>
                        <p className="text-muted-foreground mb-4">Agrega tareas para organizar tu día</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <Card
                            key={item.id}
                            className={`medical-card transition-all ${item.status === 'completed' ? 'opacity-60' : ''}`}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-start gap-4">
                                    <Checkbox
                                        checked={item.status === 'completed'}
                                        onCheckedChange={() => toggleItemStatus(item)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-medium ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                                {item.title}
                                            </h3>
                                            {item.scheduled_time && (
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {item.scheduled_time.slice(0, 5)}
                                                </Badge>
                                            )}
                                        </div>
                                        {item.contacts && (
                                            <p className="text-sm text-muted-foreground">
                                                👨‍⚕️ {item.contacts.name} - {item.contacts.specialty}
                                            </p>
                                        )}
                                        {item.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {item.duration_minutes} min
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
