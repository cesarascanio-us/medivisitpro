/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, User, Clock, FileText, CheckCircle, Download } from "lucide-react";

interface VisitReportDialogProps {
  trigger: React.ReactNode;
  visitData: any;
}

export function VisitReportDialog({ trigger, visitData }: VisitReportDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-active';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border border-destructive/20';
      case 'scheduled':
        return 'status-pending';
      default:
        return 'status-inactive';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'scheduled':
        return 'Programada';
      default:
        return 'Pendiente';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = () => {
    if (visitData.actual_start_time && visitData.actual_end_time) {
      const start = new Date(visitData.actual_start_time);
      const end = new Date(visitData.actual_end_time);
      const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      return `${duration} minutos`;
    }
    return "No registrado";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5 icon-medical" />
              Reporte de Visita
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Visit Header */}
          <div className="bg-gradient-medical p-6 rounded-lg text-primary-foreground">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {visitData.contacts?.name || "Contacto no disponible"}
                </h2>
                <p className="text-primary-foreground/80">
                  {visitData.contacts?.specialty || "Especialidad no especificada"}
                </p>
              </div>
              <Badge className={`${getStatusColor(visitData.status)} !text-current !border-current`}>
                <CheckCircle className="h-4 w-4 mr-1" />
                {getStatusText(visitData.status)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(visitData.scheduled_date)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(visitData.scheduled_date)}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {visitData.contacts?.address || "Dirección no disponible"}
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Información de la Visita</h3>
                
                {visitData.objective && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-muted-foreground">Objetivo:</label>
                    <p className="text-foreground mt-1">{visitData.objective}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duración:</label>
                    <p className="text-foreground">{calculateDuration()}</p>
                  </div>
                  
                  {visitData.actual_start_time && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Hora de inicio real:</label>
                      <p className="text-foreground">{formatTime(visitData.actual_start_time)}</p>
                    </div>
                  )}
                  
                  {visitData.actual_end_time && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Hora de finalización:</label>
                      <p className="text-foreground">{formatTime(visitData.actual_end_time)}</p>
                    </div>
                  )}
                </div>
              </div>

              {visitData.notes && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Notas y Observaciones</h4>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{visitData.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {visitData.feedback && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Feedback del Médico</h4>
                  <div className="bg-success/5 border border-success/20 p-3 rounded-lg">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{visitData.feedback}</p>
                  </div>
                </div>
              )}

              {visitData.agreements && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Acuerdos Alcanzados</h4>
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{visitData.agreements}</p>
                  </div>
                </div>
              )}

              {visitData.next_steps && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Próximos Pasos</h4>
                  <div className="bg-warning/5 border border-warning/20 p-3 rounded-lg">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{visitData.next_steps}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Visit Summary */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Resumen de la Visita</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {visitData.status === 'completed' ? '✓' : '○'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Estado</div>
                <div className="text-sm font-medium text-foreground">
                  {getStatusText(visitData.status)}
                </div>
              </div>
              
              <div className="text-center p-4 bg-success/5 rounded-lg">
                <div className="text-2xl font-bold text-success">
                  {visitData.feedback ? '😊' : '—'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Satisfacción</div>
                <div className="text-sm font-medium text-foreground">
                  {visitData.feedback ? 'Positiva' : 'No registrada'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-warning/5 rounded-lg">
                <div className="text-2xl font-bold text-warning">
                  {visitData.next_steps ? '📋' : '—'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Seguimiento</div>
                <div className="text-sm font-medium text-foreground">
                  {visitData.next_steps ? 'Programado' : 'Sin programar'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Reporte generado el {new Date().toLocaleDateString('es-ES')}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Programar Seguimiento
              </Button>
              <Button size="sm" className="btn-medical">
                Compartir Reporte
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
