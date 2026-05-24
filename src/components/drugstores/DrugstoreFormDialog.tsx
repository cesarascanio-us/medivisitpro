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
import { Building2, User, Building, MapPin, ShieldCheck, Mail, Phone, Globe, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DrugstoreFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    isEditing: boolean;
}

export function DrugstoreFormDialog({
    open,
    onOpenChange,
    formData,
    setFormData,
    onSubmit,
    isEditing
}: DrugstoreFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
                {/* Custom Header with Gradient */}
                <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 px-8 py-10 text-white relative shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Building2 className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-background/10 backdrop-blur-xl border border-border/20 flex items-center justify-center shadow-inner">
                            <Building2 className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight text-white m-0 uppercase">
                                {isEditing ? "Gestión de Distribuidor" : "Alta Comercial de Canal"}
                            </DialogTitle>
                            <p className="text-indigo-200/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">
                                Logística & Suministro Estratégico 🚛
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="perfil" className="flex-1 flex flex-col w-full min-h-0">
                    <div className="px-8 pt-4 pb-2 border-b border-border/40 shrink-0 bg-slate-50/50">
                        <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="perfil" className="rounded-lg font-bold text-[11px] uppercase tracking-wider">Perfil del Distribuidor</TabsTrigger>
                            <TabsTrigger value="localizacion" className="rounded-lg font-bold text-[11px] uppercase tracking-wider">Localización & Operaciones</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="px-8 py-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                        <TabsContent value="perfil" className="m-0 space-y-6 mt-0">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full text-white" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Perfil del Distribuidor</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Razón Social *</Label>
                                        <div className="relative group">
                                            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Ej: Distribuidora Nacional"
                                                className="h-12 pl-10 bg-muted border-border rounded-xl focus:ring-slate-500/10 focus:border-slate-500 font-bold shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">RIF / Identificación *</Label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                            <Input
                                                value={formData.rif}
                                                onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
                                                placeholder="J-12345678-9"
                                                className="h-12 pl-10 bg-muted border-border rounded-xl focus:ring-slate-500/10 focus:border-slate-500 font-mono font-bold shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Persona de Contacto / Dueño</Label>
                                        <div className="relative group">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                            <Input
                                                value={formData.owner_name}
                                                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                                placeholder="Nombre completo"
                                                className="h-12 pl-10 bg-muted border-border rounded-xl focus:ring-slate-500/10 focus:border-slate-500 font-bold shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center h-full pt-6">
                                        <label
                                            htmlFor="permits"
                                            className="flex items-center gap-3 p-4 bg-muted border border-border rounded-xl cursor-pointer hover:border-slate-400 transition-all w-full shadow-sm"
                                        >
                                            <Checkbox
                                                id="permits"
                                                checked={formData.sanitary_permits}
                                                onCheckedChange={(checked) => setFormData({ ...formData, sanitary_permits: checked })}
                                                className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                            />
                                            <span className="text-xs font-bold text-slate-600">Permisos de Distribución Vigentes</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="localizacion" className="m-0 space-y-6 mt-0">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-6 bg-slate-400 rounded-full" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Localización & Operaciones</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Dirección Fiscal y Almacén</Label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Zona Industrial, Galpón, Localidad..."
                                            className="h-12 pl-10 bg-muted border-border rounded-xl focus:ring-slate-500/10 focus:border-slate-500 font-bold shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Ciudad de Operación</Label>
                                        <div className="relative group">
                                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                            <Input
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="Ej: Valencia"
                                                className="h-12 pl-10 bg-muted border-border rounded-xl focus:ring-slate-500/10 focus:border-slate-500 font-bold shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Teléfono Central</Label>
                                        <div className="relative group">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+58 241 1234567"
                                                className="h-12 pl-10 bg-muted border-border rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 font-bold shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Correo para Pedidos</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="ventas@drogueria.com"
                                            className="h-12 pl-10 bg-muted border-border rounded-xl focus:ring-slate-500/10 focus:border-slate-500 font-bold shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="bg-card border-t border-border px-8 py-6 flex items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-12 px-6 font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        Descartar
                    </Button>
                    <Button
                        onClick={onSubmit}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-indigo-500/20 flex-1 md:flex-none transition-all hover:scale-[1.02]"
                    >
                        {isEditing ? "Actualizar Master Record" : "Finalizar Alta Comercial"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
