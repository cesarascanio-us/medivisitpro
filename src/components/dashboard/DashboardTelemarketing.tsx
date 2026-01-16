
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle, Clock } from "lucide-react";

export default function DashboardTelemarketing() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Telemarketing Inbox</h1>
            <p className="text-muted-foreground">Procesamiento rápido de pedidos.</p>

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
