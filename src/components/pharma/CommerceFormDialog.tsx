/* ========================================================================
 MASTER FRAMEWORK - CESAR ASCANIO CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, User, Building, MapPin, Phone, Mail, Globe, ShieldCheck, X, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CommerceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    isEditing: boolean;
}

export function CommerceFormDialog({
    open,
    onOpenChange,
    formData,
    setFormData,
    onSubmit,
    isEditing
}: CommerceFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-3xl rounded-[2.5rem] bg-card font-outfit">
                {/* Retail Header with Gradient */}
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-800 to-slate-900 px-8 py-12 text-white relative">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-background/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl rotate-3">
                            <ShoppingCart className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-black tracking-tight text-white m-0">
                                {isEditing ? "Gestión de Retail" : "Alta Comercial OTS"}
                            </DialogTitle>
                            <p className="text-emerald-200/70 text-xs font-black uppercase tracking-[0.2em] mt-2">
                                Operación Canal Comercio 🛒
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-10 space-y-10 max-h-[65vh] overflow-y-auto custom-scrollbar bg-card text-foreground">
                    {/* Section 1: Business Profile */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-10 bg-emerald-600 rounded-full" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Identidad del Establecimiento</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Nombre Comercial *</Label>
                                <div className="relative group">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Automercado El Plaza"
                                        className="h-15 pl-12 bg-muted/20 border-border rounded-2xl focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">RIF / ID Fiscal *</Label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
                                    <Input
                                        value={formData.rif}
                                        onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
                                        placeholder="J-00000000-0"
                                        className="h-15 pl-12 bg-muted/20 border-border rounded-2xl focus:ring-emerald-500/10 focus:border-emerald-500 font-mono font-bold transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Gerente de Tienda / Buyer</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
                                    <Input
                                        value={formData.owner_name}
                                        onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                        placeholder="Nombre del responsable"
                                        className="h-15 pl-12 bg-muted/20 border-border rounded-2xl focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center h-full pt-6">
                                <label
                                    htmlFor="permits"
                                    className="flex items-center gap-4 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl cursor-pointer hover:border-emerald-500/30 transition-all w-full shadow-sm"
                                >
                                    <Checkbox
                                        id="permits"
                                        checked={formData.sanitary_permits}
                                        onCheckedChange={(checked) => setFormData({ ...formData, sanitary_permits: checked })}
                                        className="w-6 h-6 rounded-lg data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-emerald-500/30"
                                    />
                                    <span className="text-xs font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400">Permisos de Retail al Día</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Section 2: Contact & Logistics */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-10 bg-emerald-400 rounded-full" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Logística & Ubicación</h3>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Dirección de Despacho Retail</Label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-6 h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
                                <Input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Ubicación exacta del comercio..."
                                    className="h-18 pl-12 bg-muted/20 border-border rounded-2xl focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Ciudad</Label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Ej: Valencia"
                                        className="h-15 pl-12 bg-muted/20 border-border rounded-2xl focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Línea Máster de Contacto</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+58 000 0000"
                                        className="h-15 pl-12 bg-muted/20 border-border rounded-2xl focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">E-mail de Compras</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="compras@cadena.com"
                                    className="h-15 pl-12 bg-muted/20 border-border rounded-2xl focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-muted/10 border-t border-border px-10 py-10 flex items-center justify-between gap-6">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-15 px-8 font-black text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-[1.2rem] transition-all text-[11px] uppercase tracking-[0.2em]"
                    >
                        Descartar
                    </Button>
                    <Button
                        onClick={onSubmit}
                        className="h-15 px-14 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.2rem] shadow-3xl shadow-emerald-500/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
                    >
                        {isEditing ? "Actualizar Retail" : "Autorizar Alta"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
