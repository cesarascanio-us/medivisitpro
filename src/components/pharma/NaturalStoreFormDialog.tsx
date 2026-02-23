/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
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
import { Leaf, User, Building, MapPin, Phone, Mail, Globe, ShieldCheck, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NaturalStoreFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    isEditing: boolean;
}

export function NaturalStoreFormDialog({
    open,
    onOpenChange,
    formData,
    setFormData,
    onSubmit,
    isEditing
}: NaturalStoreFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-3xl rounded-[2rem] bg-white">
                {/* Elite Header with Gradient */}
                <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 px-8 py-10 text-white relative">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-inner">
                            <Leaf className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight text-white m-0">
                                {isEditing ? "Gestión de Punto de Venta" : "Alta Comercial Elite"}
                            </DialogTitle>
                            <p className="text-indigo-200/70 text-xs font-bold uppercase tracking-widest mt-1">
                                Canal Naturista & Herbolaria 🌿
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
                    {/* Section 1: Business Profile */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Perfil del Establecimiento</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nombre de Fantasía *</Label>
                                <div className="relative group">
                                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Herbolaria Vital"
                                        className="h-14 pl-10 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">RIF / ID Fiscal *</Label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    <Input
                                        value={formData.rif}
                                        onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
                                        placeholder="J-12345678-9"
                                        className="h-14 pl-10 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-indigo-500/10 focus:border-indigo-500 font-mono font-bold transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Propietario o Gerente</Label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    <Input
                                        value={formData.owner_name}
                                        onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                        placeholder="Nombre completo"
                                        className="h-14 pl-10 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center h-full pt-6">
                                <label
                                    htmlFor="permits"
                                    className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all w-full shadow-sm"
                                >
                                    <Checkbox
                                        id="permits"
                                        checked={formData.sanitary_permits}
                                        onCheckedChange={(checked) => setFormData({ ...formData, sanitary_permits: checked })}
                                        className="w-5 h-5 rounded-md data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                    />
                                    <span className="text-xs font-black uppercase tracking-tight text-slate-600">Certificación Sanitaria al Día</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* Section 2: Contact & Location */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-8 bg-indigo-400 rounded-full" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logística & Comunicación</h3>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Dirección de Despacho</Label>
                            <div className="relative group">
                                <MapPin className="absolute left-3.5 top-5 h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                <Input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Avenida, Calle, Edificio, Local..."
                                    className="h-16 pl-10 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Ciudad Principal</Label>
                                <div className="relative group">
                                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Ej: Caracas"
                                        className="h-14 pl-10 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Línea de Contacto</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+58 412 1234567"
                                        className="h-14 pl-10 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Correo Corporativo</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contacto@tienda.com"
                                    className="h-14 pl-10 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-slate-50 border-t border-slate-100 px-10 py-8 flex items-center justify-between gap-6">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-14 px-8 font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all text-[10px] uppercase tracking-widest"
                    >
                        Descartar
                    </Button>
                    <Button
                        onClick={onSubmit}
                        className="h-14 px-12 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-3xl shadow-indigo-500/30 transition-all hover:scale-[1.05]"
                    >
                        {isEditing ? "Actualizar Sede" : "Completar Registro"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
