import { useState, useEffect } from "react";
import { Plus, Target, TrendingUp, Calendar, CheckCircle, AlertCircle, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { refreshObjectivesProgress } from "@/services/objectiveService";

interface Objective {
    id: string;
    title: string;
    description: string | null;
    objective_type: string;
    category: string;
    target_value: number;
    current_value: number;
    unit: string;
    start_date: string;
    end_date: string;
    status: string;
    priority: string;
}

export default function Objectives() {
    const { user, canViewAllData, isSupervisor, isManager, isCoordinator, zoneId, canAssignObjectives: canAssign } = useAuth();
    const { toast } = useToast();
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Team Management
    const [teamMembers, setTeamMembers] = useState<{ id: string, first_name: string, last_name: string, email: string }[]>([]);
    const [targetUserId, setTargetUserId] = useState<string>("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        objective_type: "monthly",
        category: "visits",
        target_value: 10,
        unit: "count",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: "normal"
    });

    const isLeader = isManager || isSupervisor || isCoordinator;

    useEffect(() => {
        if (user) {
            loadObjectives();
            if (isLeader) {
                loadTeamMembers();
            }
        }
    }, [user, isLeader]);

    const loadTeamMembers = async () => {
        try {
            // Fetch users from the same organization
            // Note: In a real scenario, we might want to filter by hierarchy (e.g. only my subordinates)
            // For now, we fetch all profiles in the org context (RLS should handle org isolation)
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email')
                .neq('id', user?.id) // Exclude self if desired, or keep to assign to self? Let's keep self out for "Assign" dropdown, or maybe include.
                .order('first_name');

            if (error) throw error;
            setTeamMembers(data || []);
        } catch (error) {
            console.error("Error loading team:", error);
        }
    };

    const loadObjectives = async () => {
        try {
            setLoading(true);
            if (user?.id) {
                await refreshObjectivesProgress(user.id);
            }
            let query: any = supabase
                .from('objectives')
                .select('*');

            if (!canViewAllData) {
                if (isSupervisor && zoneId) {
                    // Supervisor sees their zone objectives? Or just their own and team?
                    // Assuming RLS/Logic: Supervisor sees all in their scope.
                    // For now, let's keep it simple: If canViewAllData (Master/Manager/Admin) they see all.
                    // Otherwise, only see own.
                    // WAIT: If I am a Manager assigning task, I need to see tasks I assigned to others.
                    // The current RLS might limit this.
                    // Let's assume Manager has canViewAllData = true usually (or isManager check).

                    if (isLeader) {
                        // Managers/Supervisors should see objectives of their team
                        // Since we don't have a direct "assigned_by" column yet, we rely on RLS allowing reading profiles in same org.
                        // But for now, let's revert to seeing *all* if they are managers, or just keep current logic
                        // Current logic: query.eq('user_id', user?.id) blocks seeing others.

                        // We need to REMOVE the user_id filter if they are leaders, allowing them to see all in org (handled by RLS policies hopefully)
                        // If RLS is strict, we might need an 'assigned_by' or 'team' logic.
                        // For this rapid implementation, we'll try removing the filter for leaders.
                    } else {
                        query = query.eq('user_id', user?.id);
                    }
                } else {
                    // Reps only see theirs
                    if (!isLeader) {
                        query = query.eq('user_id', user?.id);
                    }
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            setObjectives(data || []);
        } catch (error) {
            console.error('Error loading objectives:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user || !formData.title) return;

        const assignedUser = (canAssign && targetUserId) ? targetUserId : user.id;

        try {
            const { error } = await supabase.from('objectives').insert({
                user_id: assignedUser,
                title: formData.title,
                description: formData.description || null,
                objective_type: formData.objective_type,
                category: formData.category,
                target_value: formData.target_value,
                current_value: 0,
                unit: formData.unit,
                start_date: formData.start_date,
                end_date: formData.end_date,
                priority: formData.priority,
                status: 'active'
            });

            if (error) throw error;

            toast({
                title: "Objetivo creado",
                description: isLeader && targetUserId
                    ? "Objetivo asignado al usuario exitosamente."
                    : "El objetivo ha sido creado exitosamente."
            });
            setDialogOpen(false);
            setTargetUserId(""); // Reset
            loadObjectives();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo crear el objetivo.", variant: "destructive" });
        }
    };

    const getProgress = (current: number, target: number) => {
        if (target === 0) return 0;
        return Math.min((current / target) * 100, 100);
    };

    const getStatusIcon = (status: string) => {
        if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />;
        if (status === 'failed') return <AlertCircle className="h-5 w-5 text-red-500" />;
        return <Target className="h-5 w-5 text-blue-500" />;
    };

    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
            visits: "Visitas",
            sales: "Ventas",
            contacts: "Contactos",
            events: "Eventos"
        };
        return labels[cat] || cat;
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            daily: "Diario",
            weekly: "Semanal",
            monthly: "Mensual",
            quarterly: "Trimestral",
            yearly: "Anual"
        };
        return labels[type] || type;
    };

    const activeObjectives = objectives.filter(o => o.status === 'active');
    const completedObjectives = objectives.filter(o => o.status === 'completed');
    const overallProgress = objectives.length > 0
        ? objectives.reduce((acc, o) => acc + getProgress(o.current_value, o.target_value), 0) / objectives.length
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Objetivos y Metas</h1>
                    <p className="text-muted-foreground">Define y monitorea tus metas de desempeño</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-medical">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Objetivo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Objetivo</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {canAssign && (
                                <div className="space-y-2">
                                    <Label className="text-blue-600 font-semibold">Asignar a (Opcional)</Label>
                                    <Select value={targetUserId} onValueChange={setTargetUserId}>
                                        <SelectTrigger className="bg-blue-50 border-blue-200">
                                            <SelectValue placeholder="Seleccionar miembro del equipo..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Asignarme a mí mismo</SelectItem>
                                            {teamMembers.map(member => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.first_name} {member.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Si seleccionas un usuario, el objetivo se creará en su tablero.
                                    </p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Título *</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ej: Visitar 20 médicos este mes"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="visits">Visitas</SelectItem>
                                            <SelectItem value="sales">Ventas</SelectItem>
                                            <SelectItem value="contacts">Contactos</SelectItem>
                                            <SelectItem value="events">Eventos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Período</Label>
                                    <Select value={formData.objective_type} onValueChange={(v) => setFormData({ ...formData, objective_type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Diario</SelectItem>
                                            <SelectItem value="weekly">Semanal</SelectItem>
                                            <SelectItem value="monthly">Mensual</SelectItem>
                                            <SelectItem value="quarterly">Trimestral</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Meta *</Label>
                                    <Input
                                        type="number"
                                        value={formData.target_value}
                                        onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Prioridad</Label>
                                    <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Baja</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha Inicio</Label>
                                    <Input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha Fin</Label>
                                    <Input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalles del objetivo..."
                                />
                            </div>
                            <Button onClick={handleSubmit} className="w-full btn-medical">Crear Objetivo</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Objetivos Activos</p>
                                <p className="text-3xl font-bold text-primary">{activeObjectives.length}</p>
                            </div>
                            <Target className="h-10 w-10 text-primary opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completados</p>
                                <p className="text-3xl font-bold text-green-600">{completedObjectives.length}</p>
                            </div>
                            <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Progreso General</p>
                                <p className="text-3xl font-bold">{Math.round(overallProgress)}%</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-blue-500 opacity-20" />
                        </div>
                        <Progress value={overallProgress} className="mt-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Objectives List */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Cargando objetivos...</div>
            ) : objectives.length === 0 ? (
                <Card className="medical-card">
                    <CardContent className="text-center py-12">
                        <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay objetivos</h3>
                        <p className="text-muted-foreground mb-4">Crea tu primer objetivo para comenzar a monitorear tu progreso</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {objectives.map((obj) => {
                        const progress = getProgress(obj.current_value, obj.target_value);
                        return (
                            <Card key={obj.id} className="medical-card">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(obj.status)}
                                            <div>
                                                <h3 className="font-medium">{obj.title}</h3>
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <Badge variant="outline">{getCategoryLabel(obj.category)}</Badge>
                                                    <Badge variant="secondary">{getTypeLabel(obj.objective_type)}</Badge>
                                                    {(canAssign || canViewAllData) && (obj as any).profiles && (
                                                        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                                            {(obj as any).profiles?.first_name} {(obj as any).profiles?.last_name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">
                                                {obj.category === 'sales' ? `$${obj.current_value.toLocaleString()}` : obj.current_value} / {obj.category === 'sales' ? `$${obj.target_value.toLocaleString()}` : obj.target_value}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{Math.round(progress)}% completado</p>
                                        </div>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                        <span>Inicio: {new Date(obj.start_date).toLocaleDateString()}</span>
                                        <span>Fin: {new Date(obj.end_date).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
