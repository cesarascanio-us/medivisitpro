import { useState, useEffect } from "react";
import { DollarSign, Upload, Search, CheckCircle2, FileText, AlertCircle, TrendingUp, Filter } from "lucide-react";
import { EliteHeader, EliteKPICard, EliteTable } from "@/components/layout/DesignSystem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function FinanceAdmin() {
    const { user, isMaster } = useAuth(); // Soon to be isFinance
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedExpense, setSelectedExpense] = useState<any>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    // Mock data for now until DB is synced
    const mockExpenses = [
        { id: "1", user_name: "Carlos Rep", amount: 120.50, category: "Transporte / KM", status: "pending_finance", date: "2026-06-10", manager_approved_by: "Gerente Ventas" },
        { id: "2", user_name: "Ana Rep", amount: 45.00, category: "Alimentación", status: "paid", date: "2026-06-09", manager_approved_by: "Gerente Ventas" }
    ];

    const handleProcessPayment = () => {
        if (!receiptFile) {
            toast({ title: "Falta Comprobante", description: "Debe adjuntar el comprobante de transferencia.", variant: "destructive" });
            return;
        }
        toast({ title: "Liquidación Exitosa", description: "El pago ha sido procesado y el usuario notificado." });
        setPaymentModalOpen(false);
        setReceiptFile(null);
    };

    return (
        <div className="flex flex-col min-h-full space-y-10 font-display animate-in fade-in duration-700 text-foreground pb-20">
            <EliteHeader 
                title="Administración Financiera"
                subtitle="Centro de Liquidación y Partidas Presupuestarias"
                icon={DollarSign}
                badgeText="Caja Central"
                statusText="Auditoría Financiera Activa"
                statusColor="bg-fuchsia-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <EliteKPICard
                    title="Por Liquidar"
                    value="$1,245.00"
                    subtitle="Gastos con visto bueno gerencial"
                    icon={AlertCircle}
                    trend={5}
                    color="fuchsia"
                />
                <EliteKPICard
                    title="Liquidados (Mes)"
                    value="$8,450.00"
                    subtitle="Transferencias ejecutadas"
                    icon={CheckCircle2}
                    trend={12}
                    color="emerald"
                />
                <EliteKPICard
                    title="Fondo Consumido"
                    value="42%"
                    subtitle="De la partida global"
                    icon={TrendingUp}
                    trend={-2}
                    color="blue"
                />
            </div>

            <EliteTable 
                title="Bandeja de Liquidaciones (Viáticos)"
                description="Listado de gastos operativos que han completado el ciclo de aprobación y esperan depósito."
                searchPlaceholder="Buscar por representante..."
                onSearch={() => {}}
                filterElement={
                    <Select value={activeTab} onValueChange={setActiveTab}>
                        <SelectTrigger className="w-64 h-12 bg-muted/20 border-border/40 rounded-xl font-black uppercase text-[10px]">
                            <div className="flex items-center gap-3">
                                <Filter className="h-3.5 w-3.5 text-fuchsia-500" />
                                <SelectValue placeholder="Estado" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pendiente de Pago</SelectItem>
                            <SelectItem value="paid">Liquidados</SelectItem>
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
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monto</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Autorizado Por</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                                <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockExpenses.filter(e => activeTab === 'pending' ? e.status === 'pending_finance' : e.status === 'paid').map((exp) => (
                                <tr key={exp.id} className="border-b border-border/10 hover:bg-muted/5">
                                    <td className="py-4 px-6 font-bold text-sm">{exp.date}</td>
                                    <td className="py-4 px-6 font-black uppercase text-xs">{exp.user_name}</td>
                                    <td className="py-4 px-6 font-black text-fuchsia-500 text-lg">${exp.amount.toFixed(2)}</td>
                                    <td className="py-4 px-6 text-xs text-muted-foreground uppercase">{exp.manager_approved_by}</td>
                                    <td className="py-4 px-6">
                                        <Badge className={exp.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-fuchsia-500/10 text-fuchsia-500'}>
                                            {exp.status === 'paid' ? 'LIQUIDADO' : 'POR PAGAR'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {exp.status === 'pending_finance' && (
                                            <Button size="sm" onClick={() => { setSelectedExpense(exp); setPaymentModalOpen(true); }} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-[10px] uppercase font-black tracking-widest">
                                                Procesar Pago
                                            </Button>
                                        )}
                                        {exp.status === 'paid' && (
                                            <Button size="icon" variant="ghost" className="text-emerald-500 hover:bg-emerald-500/10 rounded-xl">
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </EliteTable>

            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem] bg-card border-border/40">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Procesar Liquidación</DialogTitle>
                        <DialogDescription className="text-[10px] uppercase tracking-widest font-bold">
                            Cargar soporte de transferencia bancaria
                        </DialogDescription>
                    </DialogHeader>
                    {selectedExpense && (
                        <div className="space-y-6 pt-4">
                            <div className="p-4 bg-muted/10 rounded-2xl border border-border flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-muted-foreground">Total a transferir:</span>
                                <span className="text-2xl font-black text-fuchsia-500">${selectedExpense.amount.toFixed(2)}</span>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comprobante (PDF/IMG)</label>
                                <Input type="file" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-fuchsia-500/10 file:text-fuchsia-500 hover:file:bg-fuchsia-500/20 h-14" />
                            </div>
                            <Button onClick={handleProcessPayment} className="w-full h-14 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black uppercase tracking-widest text-[10px]">
                                Confirmar Depósito
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
