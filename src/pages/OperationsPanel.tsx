import { useState } from "react";
import { Package, Truck, Box, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import { EliteHeader, EliteKPICard, EliteTable } from "@/components/layout/DesignSystem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function OperationsPanel() {
    const { user } = useAuth(); // Soon to be isOperations
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("approved");
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
    const [trackingId, setTrackingId] = useState("");

    // Mock data
    const mockRequests = [
        { id: "1", user_name: "Carlos Rep", resource: "Caja Bolígrafos (50u)", type: "POP", status: "approved_for_dispatch", date: "2026-06-10", manager_approved_by: "Gerente Ventas" },
        { id: "2", user_name: "Ana Rep", resource: "Stand Exhibidor V2", type: "Stand", status: "dispatched", date: "2026-06-09", tracking: "MRW-928374", manager_approved_by: "Gerente Ventas" }
    ];

    const handleDispatch = () => {
        if (!trackingId) {
            toast({ title: "Falta Guía de Envío", description: "Debe ingresar el número de tracking.", variant: "destructive" });
            return;
        }
        toast({ title: "Material Despachado", description: "El estado ha cambiado y el usuario ha sido notificado con la guía." });
        setDispatchModalOpen(false);
        setTrackingId("");
    };

    return (
        <div className="flex flex-col min-h-full space-y-10 font-display animate-in fade-in duration-700 text-foreground pb-20">
            <EliteHeader 
                title="Búnker de Operaciones"
                subtitle="Centro de Almacén y Cadena de Suministro"
                icon={Package}
                badgeText="Logística"
                statusText="Despachos Activos"
                statusColor="bg-cyan-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <EliteKPICard
                    title="Órdenes Pendientes"
                    value="14"
                    subtitle="Listas para pick & pack"
                    icon={AlertCircle}
                    trend={2}
                    color="cyan"
                />
                <EliteKPICard
                    title="Despachado (Mes)"
                    value="128"
                    subtitle="Guías emitidas exitosamente"
                    icon={Truck}
                    trend={15}
                    color="emerald"
                />
                <EliteKPICard
                    title="Rotación Almacén"
                    value="89%"
                    subtitle="Índice de salida de material"
                    icon={Box}
                    trend={8}
                    color="blue"
                />
            </div>

            <EliteTable 
                title="Bandeja de Suministros (Material Físico)"
                description="Listado de requerimientos de representantes que ya fueron aprobados por Gerencia y deben ser enviados."
                searchPlaceholder="Buscar por artículo o representante..."
                onSearch={() => {}}
                filterElement={
                    <Select value={activeTab} onValueChange={setActiveTab}>
                        <SelectTrigger className="w-64 h-12 bg-muted/20 border-border/40 rounded-xl font-black uppercase text-[10px]">
                            <div className="flex items-center gap-3">
                                <Filter className="h-3.5 w-3.5 text-cyan-500" />
                                <SelectValue placeholder="Estado" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="approved">Pendiente Despacho</SelectItem>
                            <SelectItem value="dispatched">Despachados</SelectItem>
                        </SelectContent>
                    </Select>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/40">
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Representante</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Material</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Autorizado Por</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                                <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockRequests.filter(r => activeTab === 'approved' ? r.status === 'approved_for_dispatch' : r.status === 'dispatched').map((req) => (
                                <tr key={req.id} className="border-b border-border/10 hover:bg-muted/5">
                                    <td className="py-4 px-6 font-bold text-sm">{req.date}</td>
                                    <td className="py-4 px-6 font-black uppercase text-xs">{req.user_name}</td>
                                    <td className="py-4 px-6 font-bold text-cyan-500">{req.resource}</td>
                                    <td className="py-4 px-6 text-xs text-muted-foreground uppercase">{req.manager_approved_by}</td>
                                    <td className="py-4 px-6">
                                        <Badge className={req.status === 'dispatched' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-cyan-500/10 text-cyan-500'}>
                                            {req.status === 'dispatched' ? 'DESPACHADO' : 'POR EMPACAR'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {req.status === 'approved_for_dispatch' && (
                                            <Button size="sm" onClick={() => { setSelectedRequest(req); setDispatchModalOpen(true); }} className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-[10px] uppercase font-black tracking-widest">
                                                Registrar Envío
                                            </Button>
                                        )}
                                        {req.status === 'dispatched' && (
                                            <div className="flex flex-col items-end">
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Guía N°</span>
                                                <span className="text-xs font-black">{req.tracking}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </EliteTable>

            <Dialog open={dispatchModalOpen} onOpenChange={setDispatchModalOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem] bg-card border-border/40">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Registrar Salida Físisca</DialogTitle>
                        <DialogDescription className="text-[10px] uppercase tracking-widest font-bold">
                            Asignar número de guía de envío (Tracking)
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-6 pt-4">
                            <div className="p-4 bg-muted/10 rounded-2xl border border-border flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Destinatario: {selectedRequest.user_name}</span>
                                <span className="text-sm font-black text-cyan-500 uppercase">{selectedRequest.resource}</span>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tracking Number / Guía</label>
                                <Input 
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                    placeholder="EJ. MRW-000000000"
                                    className="h-14 rounded-2xl bg-muted/20 border-border/40 font-black uppercase"
                                />
                            </div>
                            <Button onClick={handleDispatch} className="w-full h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black uppercase tracking-widest text-[10px]">
                                Confirmar Despacho
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
