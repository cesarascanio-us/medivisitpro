/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Clock, User, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VisitDetailDialog } from "@/components/visits/VisitDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/contexts/MockDataProvider";
import { cn } from "@/lib/utils";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const demoData = useDemoData();

  useEffect(() => {
    loadVisits();
  }, [user, currentDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const loadVisits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      if (demoData?.visits) {
        const filteredVisits = demoData.visits.filter((v: any) => {
          if (!v.scheduled_date) return false;
          const visitDate = new Date(v.scheduled_date);
          return visitDate >= startOfDay && visitDate <= endOfDay;
        });
        setVisits(filteredVisits as any[]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          contacts (
            name,
            specialty,
            address,
            contact_type
          )
        `)
        .eq('user_id', user.id)
        .gte('scheduled_date', startOfDay.toISOString())
        .lte('scheduled_date', endOfDay.toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setVisits(data || []);
    } catch (error) {
      console.error('Error loading visits:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las visitas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500 text-white shadow-soft'; 
      case 'scheduled': return 'bg-primary text-white shadow-soft';
      case 'cancelled': return 'bg-rose-500 text-white shadow-soft';
      default: return 'bg-slate-200 text-slate-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'scheduled': return 'Programada';
      case 'cancelled': return 'Cancelada';
      default: return 'Pendiente';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header / Date Selector */}
      <Card className="glass-card border-none rounded-[2.5rem] shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="mesh-gradient-primary px-8 py-10 text-white relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-[100px] pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl transform hover:rotate-2 transition-transform">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1 drop-shadow-sm leading-none">CENTRO DE OPERACIONES</p>
                  <h2 className="text-4xl font-black capitalize tracking-tight drop-shadow-lg leading-none">
                    {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h2>
                </div>
              </div>

              <div className="flex items-center bg-black/5 backdrop-blur-md p-2 rounded-[1.5rem] border border-white/10 shadow-inner">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => changeDate(-1)}
                  className="text-white hover:bg-white/10 rounded-xl h-12 w-12"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCurrentDate(new Date())}
                  className="text-white hover:bg-white/10 px-6 font-black uppercase text-[11px] tracking-[0.2em]"
                >
                  HOY
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => changeDate(1)}
                  className="text-white hover:bg-white/10 rounded-xl h-12 w-12"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit Timeline Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-8 bg-primary rounded-full"></span>
            Agenda del Día 
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-lg px-2 py-0.5 ml-2 font-black">
              {visits.length}
            </Badge>
          </h2>
          <VisitDetailDialog
            trigger={
              <Button className="btn-medical shadow-xl h-12 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                <Plus className="mr-2 h-5 w-5" />
                Nueva Visita
              </Button>
            }
            visitData={{
              scheduled_date: currentDate.toISOString().split('T')[0],
              status: 'scheduled'
            }}
            onVisitSaved={loadVisits}
          />
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-black text-primary uppercase tracking-[0.3em]">Sincronizando Agenda...</p>
            </div>
          ) : visits.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-slate-200 p-20">
              <PremiumEmptyState
                icon={Calendar}
                title="Cero Visitas Programadas"
                description="Disfruta de este espacio extra o añade una nueva visita estratégica ahora."
                actionLabel="Programar Ahora"
                onAction={() => {}} // VisitDetailDialog handles its own trigger
              />
            </div>
          ) : (
            visits.map((visit) => {
              const visitTime = new Date(visit.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              return (
                <Card key={visit.id} className="group relative overflow-hidden rounded-[2.5rem] bg-white border-none shadow-soft hover:shadow-card transition-all duration-500">
                  <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 group-hover:bg-primary transition-colors duration-500"></div>
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex items-start gap-6">
                        <div className="flex flex-col items-center gap-3">
                          <div className={cn(
                            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                            visit.status === 'completed' ? "icon-vibrant-success" : "icon-vibrant-primary"
                          )}>
                            <Clock className="h-8 w-8" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter tabular-nums px-2 py-1 bg-slate-50 rounded-lg">
                            {visitTime}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight leading-none">
                              {visit.contacts?.name || "Contacto sin nombre"}
                            </h3>
                            <Badge className={cn("px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border-none shadow-sm", getStatusColor(visit.status))}>
                              {getStatusText(visit.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <span className="truncate">{visit.contacts?.specialty || "Especialidad General"}</span>
                            </div>
                            
                            {visit.contacts?.address && (
                              <div className="flex items-center text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                                  <MapPin className="h-5 w-5 text-emerald-500" />
                                </div>
                                <span className="truncate">{visit.contacts.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 lg:self-center">
                        <VisitDetailDialog
                          trigger={
                            <Button className="btn-medical w-full sm:w-auto h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                              Gestionar Visita
                            </Button>
                          }
                          visitData={visit}
                          onVisitSaved={loadVisits}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <VisitDetailDialog
          trigger={
            <Card className="rounded-[2.5rem] border-none shadow-soft hover:shadow-card cursor-pointer group transition-all duration-500 bg-white/60 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8 text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:bg-primary text-primary group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-12 shadow-inner">
                  <Plus className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">Visita Espontánea</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Registro Inmediato<br/>Fuera de Plan</p>
              </CardContent>
            </Card>
          }
          visitData={{
            scheduled_date: new Date().toISOString().split('T')[0],
            status: 'completed',
            visit_type: 'doctor'
          }}
          onVisitSaved={loadVisits}
        />
      </div>
    </div>
  );
}