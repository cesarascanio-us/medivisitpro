/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Clock, User, Target } from "lucide-react";
import { EliteHeader } from "@/components/layout/DesignSystem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-none'; 
      case 'scheduled': return 'bg-primary/10 text-primary border-none';
      case 'cancelled': return 'bg-rose-500/5 text-rose-500 border-none';
      default: return 'bg-slate-50 text-slate-400 border-none';
    }
  };

  return (
    <div className="space-y-10 pb-10 font-display animate-in fade-in duration-700">
      {/* Header Industrial de Élite con Control Cronológico */}
      <EliteHeader 
        title="Plan de Mando"
        subtitle={currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
        icon={Calendar}
        badgeText="TÁCTICO V6"
        statusText={`CARGA OPERATIVA: ${visits.length} MISIONES`}
        statusColor="bg-primary"
        rightContent={
          <div className="flex items-center gap-4 bg-background/50 backdrop-blur-md p-2 pl-4 rounded-[1.5rem] border border-slate-100 shadow-premium-sm group hover:shadow-premium-md transition-all">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" onClick={() => setCurrentDate(new Date())} className="h-10 px-4 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 rounded-xl">HOY</Button>
              <Button variant="ghost" size="icon" onClick={() => changeDate(1)} className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="w-[1px] h-8 bg-slate-100 mx-2" />
            <Button onClick={() => setWizardOpen(true)} className="bg-primary text-white shadow-premium-md h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <Plus className="h-4 w-4" /> NUEVA MISIÓN
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        <div className="grid gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-[1.5rem] animate-spin shadow-glow shadow-primary/20" />
              <div className="text-center">
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Sincronizando Archivo Maestro CA...</p>
                <p className="text-slate-300 font-bold uppercase text-[8px] tracking-widest mt-2">CÉSAR ASCANIO ENTERPRISE FRAMEWORK</p>
              </div>
            </div>
          ) : visits.length === 0 ? (
            <div className="bg-background/50 backdrop-blur-3xl rounded-[4rem] border border-dashed border-slate-200 p-24 text-center shadow-inner">
              <PremiumEmptyState
                icon={Calendar}
                title="OBJETIVOS NO DETECTADOS"
                description="ZONA CRONOLÓGICA DESPEJADA. INICIE EL DESPLIEGUE AÑADIENDO UNA NUEVA MISIÓN ESTRATÉGICA."
                actionLabel="ABRIR WIZARD"
                onAction={() => setWizardOpen(true)}
              />
            </div>
          ) : (
            <div className="grid gap-8">
              {visits.map((v) => (
                <Card key={v.id} className="group relative overflow-hidden rounded-[3rem] bg-card border-slate-100 hover:border-primary/30 transition-all duration-700 shadow-premium-sm hover:shadow-premium-xl cursor-pointer">
                  <div className="absolute top-0 left-0 w-2 h-full bg-slate-50 group-hover:bg-primary transition-colors duration-1000" />
                  <CardContent className="p-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                      <div className="flex items-start gap-10">
                        <div className="flex flex-col items-center gap-4">
                          <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-6 bg-slate-50 border border-slate-100 shadow-inner group-hover:bg-primary group-hover:text-white")}>
                            <Clock className="h-10 w-10 opacity-30 group-hover:opacity-100" />
                          </div>
                          <Badge className="text-[10px] font-black text-slate-500 uppercase tracking-widest tabular-nums px-4 py-1.5 bg-slate-50 border-none rounded-xl shadow-sm">
                            {new Date(v.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-4 mb-2 flex-wrap">
                              <h3 className="text-3xl font-black text-slate-900 group-hover:text-primary transition-colors tracking-tighter leading-none uppercase font-display">{v.contacts?.name || v.contacts?.full_name || "OBJETIVO_TIER_0"}</h3>
                              <Badge className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-none shadow-sm", getStatusColor(v.status))}>
                                {v.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{v.visit_type?.toUpperCase() || 'LOGS'} • DESPLIEGUE TÁCTICO</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="flex items-center text-[11px] font-black text-slate-500 uppercase tracking-widest group/item">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-4 group-hover/item:bg-primary/10 transition-colors shadow-soft">
                                <Target className="h-4 w-4 text-primary opacity-60" />
                              </div>
                              {v.contacts?.specialty || v.contacts?.city || "SECTOR_GENERAL"}
                            </div>
                            {v.contacts?.address && (
                              <div className="flex items-center text-[11px] font-black text-slate-500 uppercase tracking-widest group/item">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-4 group-hover/item:bg-emerald-500/10 transition-colors shadow-soft">
                                  <MapPin className="h-4 w-4 text-emerald-500 opacity-60" />
                                </div>
                                <span className="truncate">{v.contacts.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <VisitDetailDialog
                        trigger={
                          <Button className="bg-primary text-white w-full lg:w-auto h-16 px-12 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/90 hover:shadow-glow shadow-premium-md transition-all active:scale-95 flex items-center gap-3">
                            GESTIONAR MISIÓN <ChevronRight className="h-5 w-5" />
                          </Button>
                        }
                        visitData={v} onVisitSaved={loadVisits}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acciones Rápidas Proactivas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
        <VisitDetailDialog
          trigger={
            <Card className="rounded-[3.5rem] border border-slate-100 bg-card hover:border-primary/30 cursor-pointer group transition-all duration-700 overflow-hidden shadow-premium-sm hover:shadow-premium-xl">
              <CardContent className="p-12 text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-300 transition-all transform group-hover:scale-110 group-hover:rotate-12 group-hover:bg-primary group-hover:text-white shadow-inner">
                  <Plus className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase mb-2 tracking-tighter font-display">Visita Espontánea</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">LOG INMEDIATO FUERA DE PLAN</p>
              </CardContent>
            </Card>
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
