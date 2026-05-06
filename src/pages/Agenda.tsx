import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Clock, User, Target, ChevronRight as ChevronRightIcon } from "lucide-react";
import { EliteHeader, EliteKPICard, EliteButton, EliteCard } from "@/components/layout/DesignSystem";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VisitDetailDialog } from "@/components/visits/VisitDetailDialog";
import { QuickScheduleWizard } from "@/components/visits/QuickScheduleWizard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/contexts/MockDataProvider";
import { cn } from "@/lib/utils";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Agenda() {
  const [searchParams] = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [initialVisitData, setInitialVisitData] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const demoData = useDemoData();

  useEffect(() => {
    const doctorId = searchParams.get('doctorId');
    const pharmacyId = searchParams.get('pharmacyId');
    const commerceId = searchParams.get('commerceId');

    if (doctorId || pharmacyId || commerceId) {
      setInitialVisitData({
        contactId: doctorId || pharmacyId || commerceId,
        visitType: doctorId ? 'doctor' : (pharmacyId ? 'pharmacy' : 'commerce'),
      });
      setWizardOpen(true);
    }
  }, [searchParams]);

  useEffect(() => { loadVisits(); }, [user, currentDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const loadVisits = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      if (demoData?.visits) {
        setVisits(demoData.visits.filter((v: any) => v.scheduled_date && new Date(v.scheduled_date) >= startOfDay && new Date(v.scheduled_date) <= endOfDay));
        setLoading(false); return;
      }

      const { data: visitsData, error } = await supabase
        .from('visits')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_date', startOfDay.toISOString())
        .lte('scheduled_date', endOfDay.toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      if (visitsData && visitsData.length > 0) {
        const contactIds = Array.from(new Set(visitsData.map(v => v.contact_id)));
        const { data: contactsData } = await supabase
          .from('unified_contacts')
          .select('*')
          .in('id', contactIds);
        
        const merged = visitsData.map(v => ({
          ...v,
          contacts: contactsData?.find(c => c.id === v.contact_id)
        }));
        setVisits(merged);
      } else {
        setVisits([]);
      }
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'; 
      case 'scheduled': return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled': return 'bg-rose-500/5 text-rose-500 border-rose-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-border/40';
    }
  };

  return (
    <div className="space-y-10 pb-20 font-display animate-in fade-in duration-700">
      <EliteHeader 
        title="Plan de Mando Táctico"
        subtitle={currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
        icon={Calendar}
        badgeText="Operativo V6.0"
        statusText={`${visits.length} MISIONES PROGRAMADAS`}
        statusColor={visits.length > 0 ? "bg-primary" : "bg-muted-foreground/30"}
        rightContent={
          <div className="flex items-center gap-4 bg-muted/5 backdrop-blur-md p-1.5 rounded-elite-md border border-border/40 shadow-inner group">
            <div className="flex items-center gap-1">
              <EliteButton variant="ghost" className="h-10 w-10 p-0" onClick={() => changeDate(-1)}>
                <ChevronLeft className="h-5 w-5" />
              </EliteButton>
              <EliteButton variant="ghost" className="h-10 px-4 text-primary font-black text-[10px]" onClick={() => setCurrentDate(new Date())}>HOY</EliteButton>
              <EliteButton variant="ghost" className="h-10 w-10 p-0" onClick={() => changeDate(1)}>
                <ChevronRight className="h-5 w-5" />
              </EliteButton>
            </div>
            <div className="w-px h-8 bg-border/40 mx-2" />
            <EliteButton onClick={() => setWizardOpen(true)} className="h-12 px-6" icon={Plus}>
              NUEVA MISIÓN
            </EliteButton>
          </div>
        }
      />

      <div className="grid gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40 gap-6">
              <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin shadow-glow shadow-primary/10" />
              <div className="text-center">
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Sincronizando Archivo Maestro...</p>
                <p className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest mt-2">CÉSAR ASCANIO ENTERPRISE FRAMEWORK</p>
              </div>
            </motion.div>
          ) : visits.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <EliteCard className="p-24 border-dashed border-border/40 bg-muted/5 text-center">
                <PremiumEmptyState
                  icon={Calendar}
                  title="OBJETIVOS NO DETECTADOS"
                  description="ZONA CRONOLÓGICA DESPEJADA. INICIE EL DESPLIEGUE AÑADIENDO UNA NUEVA MISIÓN ESTRATÉGICA."
                  actionLabel="ABRIR WIZARD"
                  onAction={() => setWizardOpen(true)}
                />
              </EliteCard>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {visits.map((v, i) => (
                <EliteCard key={v.id} delay={i * 50} className="group overflow-hidden">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-muted/20 group-hover:bg-primary transition-colors duration-500" />
                   <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row lg:items-center">
                      <div className="lg:w-32 bg-muted/5 p-8 flex flex-col items-center justify-center border-r border-border/40 group-hover:bg-primary/5 transition-colors duration-500">
                        <div className="w-14 h-14 rounded-2xl bg-card border border-border/40 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <Badge className="mt-4 bg-muted/10 text-foreground font-black text-[10px] border-none px-3 py-1 rounded-lg">
                           {new Date(v.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      </div>

                      <div className="flex-1 p-8 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="space-y-4">
                             <div>
                                <div className="flex items-center gap-4 flex-wrap mb-2">
                                   <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight font-display">
                                      {v.contacts?.name || v.contacts?.full_name || "OBJETIVO_TIER_0"}
                                   </h3>
                                   <Badge className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-inner", getStatusColor(v.status))}>
                                      {v.status.toUpperCase()}
                                   </Badge>
                                </div>
                                <p className="text-elite-xs text-muted-foreground uppercase tracking-widest">{v.visit_type?.toUpperCase() || 'LOGS'} • DESPLIEGUE TÁCTICO</p>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="flex items-center text-elite-xs text-muted-foreground group/item">
                                   <div className="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center mr-3 border border-border/40 group-hover/item:bg-primary/10 group-hover/item:border-primary/20 transition-all">
                                      <Target className="h-4 w-4 text-primary opacity-60" />
                                   </div>
                                   {v.contacts?.specialty || v.contacts?.city || "SECTOR_GENERAL"}
                                </div>
                                {v.contacts?.address && (
                                  <div className="flex items-center text-elite-xs text-muted-foreground group/item">
                                    <div className="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center mr-3 border border-border/40 group-hover/item:bg-emerald-500/10 group-hover/item:border-emerald-500/20 transition-all">
                                      <MapPin className="h-4 w-4 text-emerald-500 opacity-60" />
                                    </div>
                                    <span className="truncate max-w-[200px]">{v.contacts.address}</span>
                                  </div>
                                )}
                             </div>
                          </div>

                          <VisitDetailDialog
                            trigger={
                              <EliteButton className="h-14 px-10 group/btn" icon={ChevronRightIcon}>
                                GESTIONAR MISIÓN
                              </EliteButton>
                            }
                            visitData={v} onVisitSaved={loadVisits}
                          />
                        </div>
                      </div>
                    </div>
                   </CardContent>
                </EliteCard>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-border/40">
        <VisitDetailDialog
          trigger={
            <EliteCard className="p-10 text-center relative group cursor-pointer border-dashed border-border/60 hover:border-primary/40">
                <div className="w-20 h-20 bg-muted/10 rounded- elite-md flex items-center justify-center mx-auto mb-6 text-muted-foreground transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 group-hover:bg-primary group-hover:text-white border border-border/40 shadow-inner">
                  <Plus className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-foreground uppercase mb-2 tracking-tighter font-display">Visita Espontánea</h3>
                <p className="text-elite-xs text-muted-foreground uppercase tracking-widest">LOG INMEDIATO FUERA DE PLAN</p>
            </EliteCard>
          }
          visitData={{ scheduled_date: new Date().toISOString().split('T')[0], status: 'completed', visit_type: 'doctor' }}
          onVisitSaved={loadVisits}
        />
      </div>
      
      <QuickScheduleWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen} 
        onSuccess={loadVisits} 
        visitData={initialVisitData}
      />
    </div>
  );
}
