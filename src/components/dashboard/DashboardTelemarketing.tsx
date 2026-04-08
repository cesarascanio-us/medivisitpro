/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


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
            <header className="bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white px-6 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl relative overflow-hidden -mx-6 -mt-10 mb-8">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>

                {/* Top Row: Greeting + Status + Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                            <span className="text-2xl font-black text-white">
                                {(user?.email || "?")[0].toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Telemarketing Inbox</p>
                            <h1 className="text-3xl font-extrabold tracking-tight">¡Hola, {user?.email?.split('@')[0]}!</h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0 text-[10px] px-2 font-bold backdrop-blur-sm">
                                    Agente
                                </Badge>
                                {organizationName && (
                                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 text-[10px] px-2 capitalize font-medium">
                                        {organizationName}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-[10px] px-2 font-bold backdrop-blur-sm">
                                    <div className="h-1.5 w-1.5 rounded-full bg-secondary mr-2 animate-pulse"></div>
                                    En línea
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl shadow-inner mb-1">
                                <div className="text-3xl font-mono font-black tracking-tighter text-white tabular-nums">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                            </div>
                            <div className="text-[10px] text-white/60 uppercase tracking-widest font-bold">
                                {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 py-3 px-5 bg-black/10 rounded-2xl border border-white/10 backdrop-blur-md">
                    <p className="text-white/80 text-xs font-bold ">
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
