/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Landmark, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManualPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planName: string;
    amount: number;
}

export function ManualPaymentDialog({ open, onOpenChange, planName, amount }: ManualPaymentDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        bank: "",
        reference: "",
        date: new Date().toISOString().split('T')[0]
    });

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado ✅", description: `${label} copiado al portapapeles` });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.bank || !formData.reference) {
            toast({ title: "Error Táctico", description: "Complete todos los campos de auditoría", variant: "destructive" });
            return;
        }
        setLoading(true);
        // Simulación de Proceso Industrial CA
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            toast({ title: "Reporte Recibido ✅", description: "Nuestro equipo de finanzas validará su pago en breve" });
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] bg-slate-950 border-white/5 rounded-[2.5rem] p-0 overflow-hidden shadow-3xl font-outfit">
                <div className="bg-slate-900 px-8 py-6 border-b border-white/5">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase text-white tracking-tighter">Reporte de Pago Manual</DialogTitle>
                        <DialogDescription className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2">
                             César Ascanio CA Intelligence • Plan: <span className="text-emerald-500">{planName}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8">
                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                            {/* Datos de Transferencia */}
                            <div className="p-6 bg-slate-900 rounded-[2rem] border border-white/5 space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Landmark className="w-4 h-4" /> Datos de Recepción CA
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Banco de Destino</p>
                                            <p className="font-black text-white text-xs mt-2">BANCO MERCANTIL</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard("0105...", "Cuenta")} className="text-slate-600 hover:text-emerald-400"><Copy className="w-4 h-4" /></Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Pago Móvil</p>
                                            <p className="font-black text-white text-xs mt-2">0414-0000000 • J-0000000-0</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard("04140000000", "Número")} className="text-slate-600 hover:text-emerald-400"><Copy className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-center">Monto a Reportar: <span className="text-white text-lg ml-2">${amount} USD</span> (Tasa BCV)</p>
                                </div>
                            </div>

                            {/* Formulario de Reporte */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Banco emisor</Label>
                                    <Input value={formData.bank} onChange={(e) => setFormData(p => ({ ...p, bank: e.target.value }))} placeholder="EJ: BANESCO" className="h-12 bg-slate-900 border-white/5 rounded-xl font-black text-white uppercase px-6" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Referencia</Label>
                                    <Input value={formData.reference} onChange={(e) => setFormData(p => ({ ...p, reference: e.target.value }))} placeholder="NÚMERO DE OPERACIÓN" className="h-12 bg-slate-900 border-white/5 rounded-xl font-black text-white px-6 uppercase" />
                                </div>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full h-14 bg-card text-slate-950 font-black uppercase rounded-2xl shadow-2xl hover:bg-slate-100 transition-all scale-100 active:scale-95">
                                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-3" /> : <Smartphone className="w-5 h-5 mr-3" />}
                                ENVIAR REPORTE DE PAGO
                            </Button>
                        </form>
                    ) : (
                        <div className="py-20 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-700">
                             <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500 border-dashed animate-pulse">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                             </div>
                             <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Misión en Validación</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4 max-w-sm mx-auto leading-relaxed">Su reporte de pago ha sido inyectado en nuestro motor financiero. Será notificado una vez validado.</p>
                             </div>
                             <Button onClick={() => onOpenChange(false)} className="bg-background/5 border border-white/10 text-white rounded-2xl px-12 h-12 font-black uppercase tracking-widest hover:bg-background/10 transition-all">ENTENDIDO</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
