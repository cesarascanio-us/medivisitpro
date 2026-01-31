
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle, Clock, Wifi, WifiOff, RefreshCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

export default function DashboardTelemarketing() {
    const { user, organizationName } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-6">
            {/* Alpha BMT Style Header with Clock */}
            <header className="bg-slate-900 text-white px-6 pt-6 pb-20 rounded-b-[2.5rem] shadow-xl relative overflow-hidden -mx-6 -mt-6 mb-8">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                {/* Top Row: Greeting + Status + Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 border border-white/10">
                            <span className="text-2xl font-bold text-white">
                                {(user?.email || "?")[0].toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-orange-400/80 text-xs font-semibold uppercase tracking-widest mb-1">Telemarketing Inbox</p>
                            <h1 className="text-2xl font-bold tracking-tight">¡Hola, {user?.email?.split('@')[0]}!</h1>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 text-[10px] px-2">
                                    Agente
                                </Badge>
                                {organizationName && (
                                    <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-400/10 text-[10px] px-2 capitalize">
                                        {organizationName}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] px-2">
                                    En línea
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                            <div className="text-3xl font-mono font-bold tracking-tighter text-white">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-[10px] text-orange-400/60 uppercase tracking-widest font-medium">
                                {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 py-3 px-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <p className="text-white/60 text-xs italic">
                        Procesamiento rápido de pedidos y atención al cliente.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Incoming */}
                <Card className="md:col-span-1 h-[80vh] flex flex-col">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Entrantes</span>
                            <Badge>3</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                        {/* Sample item */}
                        <div className="p-3 border rounded-lg bg-card hover:bg-muted cursor-pointer transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-sm">Farmacia San José</h4>
                                <span className="text-xs text-muted-foreground">09:42 AM</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">Pedido #TR-9923</p>
                            <Badge variant="outline" className="text-xs">Pendiente</Badge>
                        </div>
                        {/* Sample item 2 */}
                        <div className="p-3 border rounded-lg bg-card hover:bg-muted cursor-pointer transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-sm">Farmacia La Rebaja</h4>
                                <span className="text-xs text-muted-foreground">10:15 AM</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">Pedido #TR-9924</p>
                            <Badge variant="outline" className="text-xs">Pendiente</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Column 2 & 3: Detail & Action */}
                <Card className="md:col-span-2 h-[80vh] flex flex-col">
                    <CardContent className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                            <Phone className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>Selecciona un pedido para procesar</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <span className="text-sm font-medium">Pedidos Procesados Hoy</span>
                        <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-xl font-bold">12</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <span className="text-sm font-medium">Tiempo Promedio</span>
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-xl font-bold">4m 12s</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
