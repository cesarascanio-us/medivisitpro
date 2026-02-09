import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VisitDialog } from "@/components/agenda/VisitDialog";
import { VisitDetailDialog } from "@/components/visits/VisitDetailDialog"; // Use the main Detail Dialog
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/contexts/MockDataProvider";

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Demo mode hook
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
      // Create simplified ISO date strings for query filtering
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      // DEMO MODE: Use mock data filtered by current date
      if (demoData) {
        console.log("Agenda: Using mock demo data");
        const filteredVisits = demoData.visits.filter((v: any) => {
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
      case 'completed':
        return 'status-active';
      case 'scheduled':
        return 'status-pending';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border border-destructive/20';
      default:
        return 'status-inactive';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'scheduled':
        return 'Programada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Agenda de Visitas</h1>
          <p className="text-slate-400">Gestiona tus visitas médicas programadas</p>
        </div>
        <VisitDetailDialog
          trigger={
            <Button className="btn-medical">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Visita
            </Button>
          }
          onVisitSaved={loadVisits}
        // Optionally pass currentDate to pre-fill? The dialog might need update for that.
        />
      </div>

      {/* Calendar Header */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center w-48">
                <h2 className="text-xl font-semibold capitalize">
                  {currentDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => changeDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant={currentDate.toDateString() === new Date().toDateString() ? "default" : "secondary"} size="sm" onClick={() => setCurrentDate(new Date())}>
                Hoy
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Visit Timeline */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 icon-medical" />
            Agenda del Día ({visits.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {visits.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg mb-4">No hay visitas programadas para este día.</p>
              <div className="mt-4">
                <VisitDetailDialog
                  trigger={
                    <Button variant="secondary" className="glass-effect">Programar Visita</Button>
                  }
                  onVisitSaved={loadVisits}
                />
              </div>
            </div>
          ) : (
            visits.map((visit, index) => {
              const visitTime = new Date(visit.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={visit.id} className="relative">
                  {index !== visits.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-8 bg-border"></div>
                  )}
                  <div className="flex items-start space-x-4 p-4 medical-card-hover rounded-lg transition-colors hover:bg-muted/50">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${visit.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-emerald-400/30'}`}></div>
                      <div className="text-xs font-bold text-emerald-500 mt-2 tracking-wider">{visitTime}</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {visit.contacts?.name || "Contacto desconocido"}
                        </h3>
                        <Badge className={`${getStatusColor(visit.status)} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter`}>
                          {getStatusText(visit.status)}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 opacity-80">
                        <div className="flex items-center text-sm text-slate-300">
                          <User className="h-3.5 w-3.5 mr-2 text-emerald-500/70" />
                          {visit.contacts?.specialty || "Especialidad no disponible"}
                        </div>
                        {visit.contacts?.address && (
                          <div className="flex items-center text-sm text-slate-400 italic">
                            <MapPin className="h-3.5 w-3.5 mr-2 text-emerald-500/70" />
                            {visit.contacts.address}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-slate-300 font-medium">
                          <Clock className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                          <span className="text-emerald-500/60 mr-1">Objetivo:</span> {visit.objective || "Sin objetivo definido"}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        <VisitDetailDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              Ver / Editar
                            </Button>
                          }
                          visitData={visit}
                          onVisitSaved={loadVisits}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VisitDetailDialog
          trigger={
            <Card className="medical-card-hover cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Visita Espontánea</h3>
                <p className="text-sm text-muted-foreground">Registra una visita no planificada</p>
              </CardContent>
            </Card>
          }
          onVisitSaved={loadVisits}
        />
      </div>
    </div>
  );
}