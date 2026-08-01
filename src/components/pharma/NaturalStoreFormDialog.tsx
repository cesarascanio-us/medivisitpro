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
import { Leaf, User, Building, MapPin, Phone, Mail, Globe, ShieldCheck, X, Store } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <DialogContent aria-describedby={undefined} className="max-w-2xl p-0 overflow-hidden border-none shadow-3xl rounded-[2.5rem] bg-card font-outfit max-h-[90vh] flex flex-col">
                {/* Elite Header Industrial */}
                <div className="bg-primary px-10 py-12 text-white relative shrink-0">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-background/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl">
                            <Store className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black uppercase  tracking-tighter">
                                {isEditing ? "Gestión de Punto de Venta" : "Alta Comercial Soberana"}
                            </DialogTitle>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mt-2  leading-none">
                                Canal de Expansión César Ascanio CA 🌿
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="perfil" className="flex-1 flex flex-col w-full min-h-0">
                    <div className="px-10 pt-4 pb-2 border-b border-border/40 shrink-0 bg-background">
                        <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="perfil" className="rounded-lg font-bold text-[11px] uppercase tracking-wider">Identidad Institucional</TabsTrigger>
                            <TabsTrigger value="logistica" className="rounded-lg font-bold text-[11px] uppercase tracking-wider">Logística de Despacho</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="px-10 py-8 overflow-y-auto custom-scrollbar flex-1 bg-background">
                        <TabsContent value="perfil" className="m-0 space-y-8 mt-0">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-1 h-8 bg-emerald-600 rounded-full shadow-glow shadow-emerald-500/20 text-white" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ">Identidad Institucional</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-600 ml-1">Nombre Comercial</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="EJ: HERBOLARÍA VITAL"
                                            className="h-14 bg-muted/30 border-border/40 rounded-2xl focus:ring-emerald-500/20 focus:border-emerald-500/50 font-black  uppercase px-6 text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-600 ml-1">Identificación Fiscal / RIF</Label>
                                        <Input
                                            value={formData.rif}
                                            onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
                                            placeholder="J-00000000-0"
                                            className="h-14 bg-muted/30 border-border/40 rounded-2xl focus:ring-emerald-500/20 focus:border-emerald-500/50 font-black  uppercase px-6 text-foreground tabular-nums"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-600 ml-1">Representante Legal</Label>
                                        <Input
                                            value={formData.owner_name}
                                            onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                            placeholder="NOMBRE Y APELLIDO"
                                            className="h-14 bg-muted/30 border-border/40 rounded-2xl focus:ring-emerald-500/20 font-black  uppercase px-6 text-foreground"
                                        />
                                    </div>
                                    <div className="flex items-center h-full pt-7">
                                        <label
                                            htmlFor="permits"
                                            className="flex items-center gap-4 p-5 bg-muted/30 border border-border/40 rounded-2xl cursor-pointer hover:border-emerald-500/30 transition-all w-full shadow-2xl"
                                        >
                                            <Checkbox
                                                id="permits"
                                                checked={formData.sanitary_permits}
                                                onCheckedChange={(checked) => setFormData({ ...formData, sanitary_permits: checked })}
                                                className="w-5 h-5 rounded-md data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none shadow-glow shadow-emerald-500/20"
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ">Estatus Sanitario Auditado</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="logistica" className="m-0 space-y-8 mt-0">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-1 h-8 bg-indigo-600 rounded-full shadow-glow shadow-indigo-500/20 text-white" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ">Logística de Despacho</h3>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-600 ml-1">Dirección Maestra</Label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="UBICACIÓN EXACTA DE DESPACHO..."
                                        className="h-16 bg-muted/30 border-border/40 rounded-2xl focus:ring-indigo-500/20 font-black  uppercase px-6 text-foreground"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-600 ml-1">Zona / Ciudad</Label>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="CIUDAD DE OPERACIÓN"
                                            className="h-14 bg-muted/30 border-border/40 rounded-2xl font-black  uppercase px-6 text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-600 ml-1">Línea de Contacto</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+58 000 0000000"
                                            className="h-14 bg-muted/30 border-border/40 rounded-2xl font-black  uppercase px-6 text-foreground tabular-nums"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="bg-muted/10 border-t border-border/40 px-10 py-8 flex items-center justify-between gap-6 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-14 px-8 font-black text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all text-[10px] uppercase tracking-widest "
                    >
                        DESCARTAR
                    </Button>
                    <Button
                        onClick={onSubmit}
                        className="h-14 px-12 bg-primary text-white font-black uppercase  tracking-[0.1em] text-[10px] rounded-2xl shadow-premium-md transition-all hover:scale-105 active:scale-95"
                    >
                        {isEditing ? "ACTUALIZAR MASTER RECORD" : "FINALIZAR ALTA COMERCIAL"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
