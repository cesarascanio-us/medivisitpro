import { useState, useEffect } from "react";
import { EliteHeader, EliteCard } from "@/components/layout/DesignSystem";
import { GraduationCap, Plus, Users, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CoachingDashboard() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [reps, setReps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    representative_id: "",
    score_vademecum: 3,
    score_objection_handling: 3,
    score_closing_skills: 3,
    score_pre_call_planning: 3,
    score_sample_strategy: false,
    strengths: "",
    areas_for_improvement: "",
    action_plan: ""
  });

  useEffect(() => {
    if (user) {
      loadEvaluations();
      if (role !== 'representative') {
        loadReps();
      }
    }
  }, [user, role]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      let query = supabase.from('field_evaluations').select(`
        *,
        representative:profiles!representative_id(first_name, last_name),
        supervisor:profiles!supervisor_id(first_name, last_name)
      `).order('created_at', { ascending: false });

      // Si es representante, solo ve las suyas. Si es gerente, ve las que hizo
      if (role === 'representative') {
        query = query.eq('representative_id', user?.id);
      } else {
        query = query.eq('supervisor_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvaluations(data || []);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: "No se pudieron cargar las evaluaciones", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadReps = async () => {
    try {
      // Cargar usuarios con rol representative en la misma org o bajo este supervisor
      const { data, error } = await supabase.from('user_roles').select('user_id, role');
      if (error) throw error;
      
      const repIds = data.filter(r => r.role === 'representative').map(r => r.user_id);
      if (repIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name').in('id', repIds);
        setReps(profiles || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.representative_id) {
      toast({ title: "Falta Representante", description: "Selecciona a quién vas a evaluar.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from('field_evaluations').insert({
        supervisor_id: user?.id,
        representative_id: formData.representative_id,
        score_vademecum: formData.score_vademecum,
        score_objection_handling: formData.score_objection_handling,
        score_closing_skills: formData.score_closing_skills,
        score_pre_call_planning: formData.score_pre_call_planning,
        score_sample_strategy: formData.score_sample_strategy,
        strengths: formData.strengths,
        areas_for_improvement: formData.areas_for_improvement,
        action_plan: formData.action_plan
      });
      if (error) throw error;
      toast({ title: "Éxito", description: "Evaluación guardada exitosamente." });
      setDialogOpen(false);
      loadEvaluations();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 4) return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{score} - Excelente</Badge>;
    if (score === 3) return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{score} - Promedio</Badge>;
    return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">{score} - Requiere Mejora</Badge>;
  };

  const renderStars = (score: number, onChange: (val: number) => void) => {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
              score >= star ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'bg-background border border-white/10 text-muted-foreground'
            }`}
          >
            {star}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <EliteHeader 
        title="Coaching en Campo"
        subtitle="Acompañamientos y Retroalimentación"
        icon={GraduationCap}
      />

      {role !== 'representative' && (
        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => setDialogOpen(true)}
            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Registrar Evaluación
          </Button>
        </div>
      )}

      <EliteCard className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="font-display uppercase text-[10px] tracking-wider text-muted-foreground">Fecha</TableHead>
              <TableHead className="font-display uppercase text-[10px] tracking-wider text-muted-foreground">
                {role === 'representative' ? 'Evaluador' : 'Representante'}
              </TableHead>
              <TableHead className="font-display uppercase text-[10px] tracking-wider text-muted-foreground">Conocimiento</TableHead>
              <TableHead className="font-display uppercase text-[10px] tracking-wider text-muted-foreground">Cierre</TableHead>
              <TableHead className="font-display uppercase text-[10px] tracking-wider text-muted-foreground">Planificación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-display">
                  No hay evaluaciones registradas.
                </TableCell>
              </TableRow>
            )}
            {evaluations.map((ev) => (
              <TableRow key={ev.id} className="border-white/5 hover:bg-white/5">
                <TableCell className="font-medium">
                  {new Date(ev.evaluation_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {role === 'representative' 
                    ? `${ev.supervisor?.first_name} ${ev.supervisor?.last_name}`
                    : `${ev.representative?.first_name} ${ev.representative?.last_name}`
                  }
                </TableCell>
                <TableCell>{getScoreBadge(ev.score_vademecum)}</TableCell>
                <TableCell>{getScoreBadge(ev.score_closing_skills)}</TableCell>
                <TableCell>{getScoreBadge(ev.score_pre_call_planning)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </EliteCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-background/95 backdrop-blur-xl border-white/10 text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-black uppercase tracking-tight flex items-center">
              <GraduationCap className="mr-3 h-6 w-6 text-primary" />
              Nueva Rúbrica de Coaching
            </DialogTitle>
            <DialogDescription>
              Evalúa el desempeño del visitador durante el acompañamiento en campo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Representante Evaluado</Label>
              <Select value={formData.representative_id} onValueChange={(val) => setFormData({...formData, representative_id: val})}>
                <SelectTrigger className="bg-black/20 border-white/10 rounded-xl h-12">
                  <SelectValue placeholder="Selecciona un representante" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1E] border-white/10">
                  {reps.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.first_name} {r.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/20 p-6 rounded-2xl border border-white/5">
              <div className="space-y-3">
                <Label className="flex items-center text-primary uppercase text-[10px] tracking-widest font-black"><Target className="w-3 h-3 mr-2" /> Vademécum y Producto</Label>
                {renderStars(formData.score_vademecum, (v) => setFormData({...formData, score_vademecum: v}))}
              </div>
              <div className="space-y-3">
                <Label className="flex items-center text-primary uppercase text-[10px] tracking-widest font-black"><Target className="w-3 h-3 mr-2" /> Manejo de Objeciones</Label>
                {renderStars(formData.score_objection_handling, (v) => setFormData({...formData, score_objection_handling: v}))}
              </div>
              <div className="space-y-3">
                <Label className="flex items-center text-primary uppercase text-[10px] tracking-widest font-black"><Target className="w-3 h-3 mr-2" /> Habilidades de Cierre</Label>
                {renderStars(formData.score_closing_skills, (v) => setFormData({...formData, score_closing_skills: v}))}
              </div>
              <div className="space-y-3">
                <Label className="flex items-center text-primary uppercase text-[10px] tracking-widest font-black"><Target className="w-3 h-3 mr-2" /> Planificación Pre-Visita</Label>
                {renderStars(formData.score_pre_call_planning, (v) => setFormData({...formData, score_pre_call_planning: v}))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-base font-display">Uso Estratégico de Muestras</Label>
                <p className="text-sm text-muted-foreground">¿Entregó la muestra de acuerdo a la estrategia del ciclo?</p>
              </div>
              <Switch checked={formData.score_sample_strategy} onCheckedChange={(c) => setFormData({...formData, score_sample_strategy: c})} />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <Label className="uppercase text-[10px] tracking-widest font-black text-emerald-500">Fortalezas Observadas</Label>
                <Textarea 
                  className="bg-black/20 border-white/10 rounded-xl resize-none" rows={3}
                  value={formData.strengths} onChange={e => setFormData({...formData, strengths: e.target.value})}
                  placeholder="¿Qué hizo excepcionalmente bien?"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-[10px] tracking-widest font-black text-rose-500">Áreas de Mejora</Label>
                <Textarea 
                  className="bg-black/20 border-white/10 rounded-xl resize-none" rows={3}
                  value={formData.areas_for_improvement} onChange={e => setFormData({...formData, areas_for_improvement: e.target.value})}
                  placeholder="¿En qué debe trabajar para la próxima vez?"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-[10px] tracking-widest font-black text-blue-500">Plan de Acción / Compromiso</Label>
                <Textarea 
                  className="bg-black/20 border-white/10 rounded-xl resize-none" rows={3}
                  value={formData.action_plan} onChange={e => setFormData({...formData, action_plan: e.target.value})}
                  placeholder="Acuerdos definidos con el representante..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSubmit} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
                Guardar Evaluación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
