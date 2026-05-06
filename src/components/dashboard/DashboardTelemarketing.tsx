import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle, Clock, Search, ChevronRight, Activity, Zap, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { EliteHeader, EliteKPICard, EliteCard, EliteButton, EliteInput } from "@/components/layout/DesignSystem";

export default function DashboardTelemarketing() {
    const { user, organizationName } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const userName = user?.email?.split('@')[0] || "Agente";

    return (
        <div className="space-y-10 pb-10">
            <EliteHeader 
                title={`Terminal Telemarketing: ${userName}`}
                subtitle={organizationName || "MediVisitPro Operaciones"}
                icon={Phone}
                badgeText="Inbox Activo"
                statusText="En Línea / Listo para Procesar"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex flex-col items-end">
                        <div className="text-2xl font-black tabular-nums tracking-tighter">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hora Local del Servidor</p>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <EliteKPICard
                    title="Pedidos Procesados"
                    value="142"
                    subtitle="Hoy"
                    icon={CheckCircle}
                    trend={15}
                    color="emerald"
                />
                <EliteKPICard
                    title="Tiempo Promedio"
                    value="4m 12s"
                    subtitle="Por interacción"
                    icon={Clock}
                    trend={-5}
                    color="blue"
                />
                <EliteKPICard
                    title="Conversión"
                    value="78%"
                    subtitle="Llamada/Pedido"
                    icon={Activity}
                    trend={8}
                    color="indigo"
                />
                <EliteKPICard
                    title="Cola de Espera"
                    value="12"
                    subtitle="Solicitudes"
                    icon={MessageSquare}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-10">
                    <section>
                        <div className="flex items-center justify-between mb-8 px-2">
                           <div className="flex items-center gap-5">
                              <div className="icon-box-primary">
                                <Zap className="h-7 w-7" />
                              </div>
                              <h2 className="text-elite-title text-foreground font-display">Entrantes</h2>
                           </div>
                           <Badge className="badge-elite-info">3 Nuevos</Badge>
                        </div>
                        <div className="space-y-4">
                            <EliteInput icon={Search} placeholder="BUSCAR PEDIDO..." />
                            
                            {[1, 2, 3].map((item) => (
                                <EliteCard key={item} onClick={() => {}} delay={item * 100}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-black uppercase tracking-tight font-display">Farmacia San José</h4>
                                                <p className="text-elite-xs text-muted-foreground">Pedido #TR-992{item}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-muted-foreground">09:42 AM</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <Badge className="badge-elite-warning">Pendiente</Badge>
                                            <ChevronRight className="h-4 w-4 text-primary" />
                                        </div>
                                    </CardContent>
                                </EliteCard>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-2">
                    <EliteCard className="h-full min-h-[600px] flex items-center justify-center border-dashed bg-muted/5">
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-card rounded-elite-lg shadow-premium-sm border border-border flex items-center justify-center mx-auto text-muted-foreground/20 animate-pulse">
                                <Phone className="h-12 w-12" />
                            </div>
                            <div>
                                <h3 className="text-elite-title text-foreground font-display">Consola de Operación</h3>
                                <p className="text-elite-sm text-muted-foreground">Selecciona un registro para iniciar el procesamiento</p>
                            </div>
                            <EliteButton variant="secondary" className="px-10">Activar Terminal de Llamada</EliteButton>
                        </div>
                    </EliteCard>
                </div>
            </div>
        </div>
    );
}
