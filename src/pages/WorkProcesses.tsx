/* ========================================================================
 MASTER FRAMEWORK - CESAR ASCANIO CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const STANDARD_OPERATING_PROCEDURE = [
  {
    phase: "FASE 1",
    label: "APERTURA ESTRATÉGICA",
    color: "bg-blue-600",
    glow: "shadow-blue-500/20",
    icon: Calendar,
    reqBadge: "OBLIGATORIO: INICIO",
    steps: [
      { id: "1.1", title: "Módulo Ciclos Promocionales", desc: "Creación del ciclo de trabajo en el módulo Ciclos Promocionales. Define la ventana de tiempo operativa." },
      { id: "1.2", title: "Módulo Objetivos (KPIs)", desc: "Establecer la cuota de ventas y cobertura médica esperada en el Módulo Objetivos. Sin esto, el sistema bloquea los pasos siguientes." },
    ]
  },
  {
    phase: "FASE 2",
    label: "PLANIFICACIÓN LOGÍSTICA",
    color: "bg-amber-500",
    glow: "shadow-amber-500/20",
    icon: MapPin,
    reqBadge: "REQUISITO: CICLO ACTIVO",
    steps: [
      { id: "2.1", title: "Módulo Rutas Semanales", desc: "Agrupación geográfica de médicos y farmacias en Rutas Semanales. Solo se habilita si existe un Ciclo Activo." },
      { id: "2.2", title: "Módulo Plan Diario", desc: "Asignación táctica de tareas y visitas en el Plan Diario basados en la Ruta Semanal." },
    ]
  },
  {
    phase: "FASE 3",
    label: "EJECUCIÓN EN CAMPO",
    color: "bg-emerald-600",
    glow: "shadow-emerald-500/20",
    icon: ClipboardList,
    reqBadge: "REQUISITO: PLAN DIARIO",
    steps: [
      { id: "3.1", title: "Módulo Agenda de Equipo / Mis Visitas", desc: "El representante inicia su jornada en Mis Visitas. No hay agenda sin un Plan Diario previo." },
      { id: "3.2", title: "Módulo Muestras", desc: "Pitch de productos Biofarco según especialidad y entrega desde el módulo de Muestras." },
      { id: "3.3", title: "Módulo Directorio / Comercios", desc: "Auditoría de presencia en anaquel, chequeo de stock y revisión de precios en Farmacias (POS)." },
    ]
  },
  {
    phase: "FASE 4",
    label: "CIERRE Y TRANSFERENCIAS",
    color: "bg-indigo-600",
    glow: "shadow-indigo-500/20",
    icon: TrendingUp,
    reqBadge: "REQUISITO: AGENDA COMPLETADA",
    steps: [
      { id: "4.1", title: "Módulo Cotizaciones y Pedidos", desc: "Carga de ofertas comerciales directas en Cotizaciones o uso de Mis Pedidos hacia Droguerías Aliadas." },
      { id: "4.2", title: "Módulo Mis Gastos", desc: "Registro de viáticos, peajes y comidas consumidas durante la ejecución de la ruta de trabajo en Mis Gastos." },
      { id: "4.3", title: "Módulo Dashboard", desc: "Cierre oficial del día. Impacto automático en los KPIs en el Dashboard y Resumen Gerencial." },
    ]
  },
  {
    phase: "FASE 5",
    label: "MOTOR FINANCIERO",
    color: "bg-fuchsia-600",
    glow: "shadow-fuchsia-500/20",
    icon: CheckCircle2,
    reqBadge: "WORKFLOW: ESCALADO",
    steps: [
      { id: "5.1", title: "Módulo Mis Gastos (Rep)", desc: "El usuario base genera la solicitud de viático o carga sus facturas. El sistema bloquea el pago y notifica al Supervisor." },
      { id: "5.2", title: "Módulo Monitor Financiero (Sup)", desc: "El Supervisor valida en el Monitor Financiero que el gasto corresponda a la ruta ejecutada." },
      { id: "5.3", title: "Cruce de Partida (Coord)", desc: "El Coordinador revisa si dispone de Presupuesto en su 'Partida' asignada. Si tiene fondos, lo descuenta y eleva a Gerencia." },
      { id: "5.4", title: "Visto Bueno (Manager)", desc: "Gerencia Comercial aplica el sello de conformidad final, transformando el gasto en una orden de liquidación." },
      { id: "5.5", title: "Módulo Administración Fin. (Admin)", desc: "Administración Financiera procesa el pago real, ejecuta la transferencia y sube el recibo. Ciclo Cerrado." },
    ]
  },
  {
    phase: "FASE 6",
    label: "CADENA DE SUMINISTRO",
    color: "bg-cyan-600",
    glow: "shadow-cyan-500/20",
    icon: Package,
    reqBadge: "WORKFLOW: LOGÍSTICO",
    steps: [
      { id: "6.1", title: "Módulo Material POP y Muestras", desc: "El usuario solicita insumos físicos (POP, Muestras, Stands) indicando cantidades y justificativo." },
      { id: "6.2", title: "Escalamiento Binario", desc: "La solicitud sube por la misma cadena de mando (Sup -> Coord -> Gerencia) para control estratégico." },
      { id: "6.3", title: "Búnker Operaciones (Op)", desc: "Una vez con el 'Go' de Gerencia, la orden cae en el Búnker Operaciones. Se prepara el paquete y se registra la guía de envío." },
    ]
  }
];

export default function WorkProcesses() {
  const { isMaster } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 font-display transition-colors duration-500 overflow-y-auto">
      
      {/* HEADER INDUSTRIAL ELITE - PROCESOS DE TRABAJO */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-premium-md border border-primary/20 rotate-3 hover:rotate-0 transition-transform group">
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
              <Button onClick={() => navigate('/university')} className="h-14 px-8 bg-primary hover:bg-primary/90 text-white shadow-premium-sm rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                  <GraduationCap className="mr-3 h-5 w-5" /> Evaluación en Academia
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

          <TabsContent value="sop" className="flex-1 min-h-0 mt-0 data-[state=active]:flex flex-col gap-6">
             <Tabs defaultValue="fase1" className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0">
                {/* Side Selector - Phases */}
                <TabsList className="flex flex-col h-fit bg-transparent gap-3 p-0 shrink-0 w-full xl:w-64">
                   {STANDARD_OPERATING_PROCEDURE.map((phase, idx) => (
                      <TabsTrigger 
                        key={idx} 
                        value={`fase${idx+1}`}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-premium-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white group transition-all"
                      >
                         <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg rotate-3 group-data-[state=active]:rotate-0 transition-transform", phase.color)}>
                               <phase.icon className="h-5 w-5" />
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
                <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-6">
                   <div className="flex-1">
                      {STANDARD_OPERATING_PROCEDURE.map((phase, idx) => (
                        <TabsContent key={idx} value={`fase${idx+1}`} className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                           <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                 <div className={cn("px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg font-display", phase.color)}>
                                    {phase.phase}: {phase.label}
                                 </div>
                                  <div className="flex-1 h-[2px] bg-border" />
                                  <Badge className="bg-primary/10 text-primary border border-primary/20 font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-full">{phase.reqBadge}</Badge>
                               </div>

                              <div className="grid grid-cols-1 gap-4">
                                 {phase.steps.map((step, sIdx) => (
                                    <Card key={sIdx} className="border border-border bg-card shadow-premium-sm hover:shadow-premium-md transition-all hover:-translate-y-1 rounded-[1.5rem] group/step relative overflow-hidden">
                                       <CardContent className="p-6 flex items-start gap-4 relative z-10">
                                          <div className="h-10 w-10 shrink-0 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground font-black text-sm font-mono group-hover/step:bg-primary group-hover/step:text-white transition-colors duration-500 shadow-inner">
                                             {step.id}
                                          </div>
                                          <div className="space-y-2 flex-1">
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
                   <div className="w-full xl:w-72 flex flex-col gap-6 shrink-0">
                      <Card className="bg-card border border-primary/10 shadow-premium-lg rounded-[2rem] p-6 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-32 h-32 text-primary" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
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

                      <Card className="bg-card border border-border rounded-[2rem] shadow-premium-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground mb-4 shadow-inner">
                            <Calendar className="h-6 w-6" />
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
                            Bienvenido al centro de modelado de procesos del sistema. Aquí se detalla la lógica operativa y las reglas de negocio en cascada (Waterfall) que rigen el funcionamiento del CRM médico.
                         </p>

                         <div className="space-y-4">
                            {[
                              { 
                                title: "1. Regla de Bloqueo Estricto (Ciclos)", 
                                desc: "El sistema impedirá planificar cualquier Ruta o crear un Plan Diario si no existe un Ciclo Promocional vigente y registrado por la gerencia.",
                                priority: "CRÍTICA",
                                color: "text-rose-500 bg-rose-500/10 border-rose-500/20"
                              },
                              { 
                                title: "2. Dependencia Táctica (Rutas a Plan)", 
                                desc: "No se puede generar un Plan Diario con contactos médicos/comerciales que no hayan sido previamente asignados a la Ruta Semanal del usuario.",
                                priority: "ALTA",
                                color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
                              },
                              { 
                                title: "3. Trazabilidad Muestral (Biofarco)", 
                                desc: "Las muestras entregadas durante la ejecución de la Agenda de Visitas descontarán inventario del Banco de Muestras del visitador en tiempo real.",
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
