/* ========================================================================
 MASTER FRAMEWORK - CESAR ASCANIO CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  MapPin, 
  Package, 
  BarChart3, 
  Camera, 
  Briefcase,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  Calendar,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const STANDARD_OPERATING_PROCEDURE = [
  {
    phase: "FASE 1",
    label: "PREPARACIÓN & CHECK-IN",
    color: "bg-blue-600",
    glow: "shadow-blue-500/20",
    icon: MapPin,
    steps: [
      { id: "1.1", title: "Validación GPS y Cercanía", desc: "Asegurar que el visitador está en el radio del punto de venta para validación de geocerca." },
      { id: "1.2", title: "Sincronización de Inventario", desc: "Verificar stock de muestras y material POP antes de la interacción comercial." },
    ]
  },
  {
    phase: "FASE 2",
    label: "AUDITORÍA 360° (ANAQUEL)",
    color: "bg-emerald-600",
    glow: "shadow-emerald-500/20",
    icon: Package,
    steps: [
      { id: "2.1", title: "Auditoría Visual Propia (Faces)", desc: "Conteo riguroso de frentes de productos propios en el anaquel principal." },
      { id: "2.2", title: "Visibilidad de Competencia", desc: "Mapeo de marcas rivales, precios y espacios ocupados en la góndola." },
      { id: "2.3", title: "Registro de PVP Real", desc: "Validar que el precio de mercado coincida con la directiva comercial central." },
    ]
  },
  {
    phase: "FASE 3",
    label: "NEGOCIACIÓN & VENTAS",
    color: "bg-amber-500",
    glow: "shadow-amber-500/20",
    icon: BarChart3,
    steps: [
      { id: "3.1", title: "Identificación de Fallas", desc: "Detectar quiebres de stock críticos para generar orden de reposición inmediata." },
      { id: "3.2", title: "Presentación de Promociones", desc: "Despliegue de material POP estratégico para impulsar el sell-through del mes." },
      { id: "3.3", title: "Cierre de Pedido Directo", desc: "Formalizar orden de transferencia o venta directa mediante el portal MediVisitPro." },
    ]
  },
  {
    phase: "FASE 4",
    label: "CIERRE & EVIDENCIAS",
    color: "bg-indigo-600",
    glow: "shadow-indigo-500/20",
    icon: Camera,
    steps: [
      { id: "4.1", title: "Captura Fotográfica (Forense)", desc: "Registro fotográfico obligatorio del anaquel post-ejecución para auditoría remota." },
      { id: "4.2", title: "Compromisos y Notas", desc: "Registro de acuerdos estratégicos para seguimiento en la próxima ruta de visita." },
      { id: "4.3", title: "Check-out del Sistema", desc: "Cierre oficial de la interacción para el cálculo en tiempo real de los KPIs de cobertura." },
    ]
  }
];

export default function WorkProcesses() {
  const { isMaster } = useAuth();

  return (
    <div className="min-h-screen flex flex-col p-8 font-display transition-colors duration-500 overflow-y-auto">
      
      {/* HEADER INDUSTRIAL ELITE - PROCESOS DE TRABAJO */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center shadow-premium-md border border-primary/20 rotate-3 hover:rotate-0 transition-transform group">
                  <Layers className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] mb-2 font-display">Protocolos Operativos</p>
                  <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase font-display leading-none">Procesos de Trabajo</h1>
                  <div className="flex items-center gap-3 mt-4">
                      <Badge className="bg-primary/5 text-primary border border-primary/10 font-black text-[9px] px-3 py-1.5 uppercase tracking-widest leading-none">Manual Maestro V6.0</Badge>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/20 border border-border">
                          <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Estándar César Ascanio CA</span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl bg-card border border-border hover:bg-muted/10 hover:shadow-premium-sm transition-all shadow-sm">
                  <Activity className="h-6 w-6 text-muted-foreground" />
              </Button>
              <Button variant="outline" className="h-14 px-8 border-border hover:bg-card hover:text-primary hover:shadow-premium-sm bg-transparent rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                  <Zap className="mr-3 h-5 w-5 text-amber-500" /> Auditoría SOP
              </Button>
          </div>
      </div>

      {/* WORKSPACE AREA */}
      <div className="flex-1 min-h-0">
        <Tabs defaultValue="sop" className="h-full flex flex-col">
          {/* Tabs Selector Industrial */}
          <TabsList className="bg-card p-2 rounded-[1.5rem] w-fit mb-12 border border-border shadow-premium-sm">
            <TabsTrigger value="sop" className="rounded-xl px-10 py-3 font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">SOP (Procedimientos)</TabsTrigger>
            <TabsTrigger value="manual" className="rounded-xl px-10 py-3 font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">Manual Estándar</TabsTrigger>
          </TabsList>

          <TabsContent value="sop" className="flex-1 min-h-0 mt-0 data-[state=active]:flex flex-col gap-10">
             <Tabs defaultValue="fase1" className="flex-1 flex flex-col 2xl:flex-row gap-10 min-h-0">
                {/* Side Selector - Phases */}
                <TabsList className="flex flex-col h-fit bg-transparent gap-5 p-0 shrink-0 w-full 2xl:w-80">
                   {STANDARD_OPERATING_PROCEDURE.map((phase, idx) => (
                      <TabsTrigger 
                        key={idx} 
                        value={`fase${idx+1}`}
                        className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-card border border-border shadow-premium-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white group transition-all"
                      >
                         <div className="flex items-center gap-5">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3 group-data-[state=active]:rotate-0 transition-transform", phase.color)}>
                               <phase.icon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col items-start">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-data-[state=active]:opacity-60 font-display">{phase.phase}</span>
                               <span className="text-sm font-black uppercase tracking-tight font-display whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{phase.label.split(' ')[0]}</span>
                            </div>
                         </div>
                         <ChevronRight className="h-5 w-5 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
                      </TabsTrigger>
                   ))}
                </TabsList>

                {/* Content Area */}
                <div className="flex-1 min-h-0 flex flex-col 2xl:flex-row gap-10">
                   <div className="flex-1">
                      {STANDARD_OPERATING_PROCEDURE.map((phase, idx) => (
                        <TabsContent key={idx} value={`fase${idx+1}`} className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                           <div className="space-y-10">
                              <div className="flex items-center gap-6">
                                 <div className={cn("px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg font-display", phase.color)}>
                                    {phase.phase}: {phase.label}
                                 </div>
                                 <div className="flex-1 h-[2px] bg-border" />
                                 <Badge className="bg-muted/20 text-muted-foreground border border-border font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-full">Estatus: Optimizado V26</Badge>
                              </div>

                              <div className="grid grid-cols-1 gap-6">
                                 {phase.steps.map((step, sIdx) => (
                                    <Card key={sIdx} className="border border-border bg-card shadow-premium-sm hover:shadow-premium-md transition-all hover:-translate-y-1 rounded-[2.5rem] group/step relative overflow-hidden">
                                       <CardContent className="p-10 flex items-start gap-8 relative z-10">
                                          <div className="h-14 w-14 rounded-2xl bg-muted/20 flex items-center justify-center text-muted-foreground font-black text-sm font-mono group-hover/step:bg-primary group-hover/step:text-white transition-colors duration-500 shadow-inner">
                                             {step.id}
                                          </div>
                                          <div className="space-y-3 flex-1">
                                             <h4 className="font-black text-foreground text-base uppercase tracking-tight font-display">{step.title}</h4>
                                             <p className="text-xs text-muted-foreground leading-relaxed font-bold">{step.desc}</p>
                                          </div>
                                       </CardContent>
                                       {/* Ghost background decorator */}
                                       <div className="absolute -bottom-8 -right-4 text-8xl font-black text-muted/20 select-none pointer-events-none group-hover/step:text-muted/30 transition-colors">
                                          {step.id.split('.')[1]}
                                       </div>
                                    </Card>
                                 ))}
                              </div>
                           </div>
                        </TabsContent>
                      ))}
                   </div>

                   {/* Sidebar of Intelligence */}
                   <div className="w-full 2xl:w-80 flex flex-col gap-8 shrink-0">
                      <Card className="bg-card border border-primary/10 shadow-premium-lg rounded-[3rem] p-10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-40 h-40 text-primary" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                 <CheckCircle2 className="h-6 w-6" />
                              </div>
                              <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] font-display">Garantía Operativa</h3>
                            </div>
                            <p className="text-muted-foreground text-xs font-bold leading-relaxed mb-8">
                               El cumplimiento estricto del protocolo asegura una penetración del <span className="text-primary font-black">+95%</span> en el mercado objetivo.
                            </p>
                            
                            <div className="space-y-4">
                              {[
                                { label: 'Eficiencia CA', val: '+22.5%', color: 'text-emerald-400' },
                                { label: 'Precisión GPS', val: '99.8%', color: 'text-emerald-400' }
                              ].map((stat, i) => (
                                 <div key={i} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border transition-colors hover:bg-muted/20">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                                    <span className={cn("text-xs font-black tabular-nums ", stat.color)}>{stat.val}</span>
                                 </div>
                              ))}
                            </div>
                        </div>
                      </Card>

                      <Card className="bg-card border border-border rounded-[3rem] shadow-premium-sm p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group shrink-0">
                        <div className="w-16 h-16 rounded-[2rem] bg-muted/20 flex items-center justify-center text-muted-foreground mb-8 shadow-inner">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 font-display">Próxima Revisión</h4>
                        <p className="text-base font-black text-foreground uppercase tracking-tighter font-display leading-none">MAYO 2026</p>
                      </Card>
                   </div>
                </div>
             </Tabs>
          </TabsContent>

          <TabsContent value="manual" className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom duration-500">
             {isMaster ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-left">
                   {/* Left Side: Active Master Strategy Directives */}
                   <div className="xl:col-span-2 space-y-8">
                      <div className="p-12 bg-card rounded-[3rem] border border-border shadow-premium-lg relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none">
                            <Layers className="h-64 w-64" />
                         </div>
                         <div className="flex items-center gap-6 mb-8">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                               <ShieldCheck className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                               <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] font-display">Nivel de Acceso: Master Global</span>
                               <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mt-1 font-display">Directivas Estratégicas de Penetración</h3>
                            </div>
                         </div>
                         <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                            Bienvenido al centro de modelado de procesos estándar y contra-inteligencia comercial de nivel maestro. Aquí se gestionan los workflows operativos que regulan la labor de toda la fuerza representativa de MediVisitPro.
                         </p>

                         <div className="space-y-4">
                            {[
                              { 
                                title: "1. Táctica de Visibilidad Premium (Anaquel)", 
                                desc: "Posicionar marcas propias a la altura de la vista (Eye-Level) ocupando al menos el 45% del espacio útil de la categoría de exhibición.",
                                priority: "CRÍTICA",
                                color: "text-rose-500 bg-rose-500/10 border-rose-500/20"
                              },
                              { 
                                title: "2. Mitigación de Quiebres y Stock de Seguridad", 
                                desc: "Activar solicitudes automáticas de pedido de transferencia a droguerías aliadas cuando la cobertura baje de 15 días estimados.",
                                priority: "ALTA",
                                color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
                              },
                              { 
                                title: "3. Protocolo de Captura Forense Multicanal", 
                                desc: "Validación y cruce de imágenes de anaquel con geolocalización de satélite en tiempo real para evitar reportes fantasmas.",
                                priority: "ESTÁNDAR",
                                color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
                              }
                            ].map((dir, idx) => (
                               <div key={idx} className="p-6 bg-muted/5 rounded-[2rem] border border-border/60 hover:border-primary/20 transition-all duration-300">
                                  <div className="flex items-center justify-between gap-4 mb-3">
                                     <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{dir.title}</h4>
                                     <Badge className={cn("font-black text-[9px] px-3 py-1 uppercase tracking-widest rounded-full border shadow-sm shrink-0", dir.color)}>
                                        {dir.priority}
                                     </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{dir.desc}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Right Side: Master Control Panel */}
                   <div className="space-y-8">
                      <Card className="bg-card border border-border rounded-[3rem] shadow-premium-sm p-10 flex flex-col relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                            <Zap className="h-32 w-32" />
                         </div>
                         <h3 className="text-base font-black text-foreground uppercase tracking-tight mb-6 font-display">Operaciones de Directiva</h3>
                         
                         <div className="space-y-4 flex-1">
                            <Button className="w-full h-12 bg-primary text-white hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-2 group/btn shadow-md shadow-primary/10">
                               <Zap className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                               Desplegar Nueva Directiva
                            </Button>
                            
                            <Button variant="outline" className="w-full h-12 border-border/80 hover:bg-muted/10 font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-2">
                               <ClipboardList className="h-4 w-4" />
                               Exportar Manual de Campo
                            </Button>

                            <Button variant="ghost" className="w-full h-12 text-muted-foreground hover:text-primary hover:bg-primary/5 font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-2">
                               <Activity className="h-4 w-4" />
                               Auditar Cumplimiento de SOP
                            </Button>
                         </div>

                         <div className="mt-8 pt-8 border-t border-border/40">
                            <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border/60">
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1">Mapeo de Rutas</span>
                                  <span className="text-xs font-black text-emerald-400 leading-none">ACTIVO</span>
                               </div>
                               <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black px-3 py-1">SECURE</Badge>
                            </div>
                         </div>
                      </Card>

                      <Card className="bg-card border border-border rounded-[3rem] shadow-premium-sm p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group shrink-0">
                         <div className="w-16 h-16 rounded-[2rem] bg-muted/20 flex items-center justify-center text-muted-foreground mb-8 shadow-inner">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                         </div>
                         <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 font-display">Estado de Seguridad</h4>
                         <p className="text-base font-black text-emerald-400 uppercase tracking-tighter font-display leading-none">SOP GLOBAL HABILITADO</p>
                      </Card>
                   </div>
                </div>
             ) : (
                <div className="text-center p-24 bg-card rounded-[4rem] border border-border shadow-premium-lg max-w-xl relative overflow-hidden group mx-auto">
                   <div className="absolute top-0 right-0 p-16 opacity-[0.02]">
                      <ClipboardList className="h-64 w-64" />
                   </div>
                   <div className="w-24 h-24 bg-muted/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:scale-110 transition-transform">
                      <ShieldCheck className="h-12 w-12 text-muted-foreground" />
                   </div>
                   <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-6 font-display">Búnker de Estrategia</h3>
                   <p className="text-sm text-muted-foreground leading-loose font-bold font-sans">
                      El manual detallado de tácticas de penetración de mercado y contra-inteligencia comercial se encuentra bajo protocolo de seguridad de nivel 5.
                   </p>
                   <div className="mt-12 flex justify-center">
                      <Badge className="bg-primary/5 text-primary border border-primary/10 font-black text-[10px] px-6 py-2.5 uppercase tracking-widest rounded-full shadow-sm">Acceso Restringido</Badge>
                   </div>
                </div>
             )}
          </TabsContent>
        </Tabs>
      </div>

      {/* FOOTER INDUSTRIAL ELITE */}
      <div className="mt-12 flex items-center justify-between text-muted-foreground/60 px-6 shrink-0">
          <div className="flex items-center gap-4">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] font-display">
                  Directiva de Procesos César Ascanio CA • Infraestructura Operativa V6
              </p>
          </div>
          <div className="flex gap-8">
              <span className="text-[9px] font-black tracking-widest text-muted-foreground/40">SOP PROTOCOL OK</span>
              <span className="text-[9px] font-black tracking-widest">SINK_ID: 2026-CA-MVP</span>
          </div>
      </div>
    </div>
  );
}
