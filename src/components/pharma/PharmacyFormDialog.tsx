/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    Building2,
    MapPin,
    Phone,
    User,
    Mail,
    Instagram,
    Target,
    Activity,
    ChevronRight,
    Search,
    Info,
    LayoutDashboard,
    Clock,
    ShieldCheck
} from "lucide-react";
import { ProductMultiSelect } from "@/components/common/ProductMultiSelect";
import { GeocodingButton } from "@/components/forms/GeocodingButton";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface PharmacyFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    isEditing?: boolean;
    trigger?: React.ReactNode;
    showTrigger?: boolean;
}

export function PharmacyFormDialog({ open, onOpenChange, formData, setFormData, onSubmit, isEditing = false, trigger, showTrigger = true }: PharmacyFormDialogProps) {
    const [activeTab, setActiveTab] = useState("basico");
    const { toast } = useToast();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {showTrigger && (
                trigger ? (
                    <DialogTrigger asChild>{trigger}</DialogTrigger>
                ) : (
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-bold px-6 rounded-xl transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Nueva Farmacia
                        </Button>
                    </DialogTrigger>
                )
            )}
            <DialogContent aria-describedby={undefined} className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl max-h-[90vh] flex flex-col">
                {/* Header Section */}
                <div className="bg-primary px-8 py-10 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Building2 className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-background/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-black tracking-tight text-white mb-1">
                                {isEditing ? 'Gestión de Farmacia' : 'Registro de Canal'}
                            </DialogTitle>
                            <p className="text-indigo-200/70 font-bold text-xs uppercase tracking-widest mt-1">
                                Módulo de Farmacia & PDV 🏥
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full min-h-0">
                    <div className="px-8 pt-4 pb-2 border-b border-border/40 shrink-0 bg-background">
                        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="basico" className="rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" /> <span className="hidden md:inline">Información Básica</span><span className="md:hidden">Básico</span>
                            </TabsTrigger>
                            <TabsTrigger value="contacto" className="rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> <span className="hidden md:inline">Contacto Detalle</span><span className="md:hidden">Contacto</span>
                            </TabsTrigger>
                            <TabsTrigger value="segmentacion" className="rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                                <Target className="w-3.5 h-3.5" /> <span className="hidden md:inline">Segmentación</span><span className="md:hidden">Segment.</span>
                            </TabsTrigger>
                            <TabsTrigger value="seguimiento" className="rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" /> <span className="hidden md:inline">Seguimiento</span><span className="md:hidden">Seguim.</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="px-8 py-6 overflow-y-auto custom-scrollbar flex-1 bg-card">
                            {/* Tab 1: Información Básica */}
                            <TabsContent value="basico" className="m-0 space-y-8 mt-0 animate-in fade-in slide-in-from-right-2">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full text-white" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Datos Legales</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nombre Comercial *</Label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50 group-hover:text-blue-600 transition-colors" />
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Ej: Farmacia Central"
                                                    className="h-12 pl-10 border-slate-200 rounded-xl font-bold focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">RIF / Identificación</Label>
                                            <div className="relative group">
                                                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50 group-hover:text-blue-600 transition-colors" />
                                                <Input
                                                    value={formData.rif}
                                                    onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
                                                    placeholder="J-123456789"
                                                    className="h-12 pl-10 border-slate-200 rounded-xl font-mono font-bold focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Dirección Exacta</Label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50 group-hover:text-blue-600 transition-colors" />
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="Av. Principal, Edificio, Referencias..."
                                                className="h-12 pl-10 border-slate-200 rounded-xl font-bold focus:ring-blue-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Ciudad</Label>
                                            <Input
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="Ej: Caracas"
                                                className="h-12 border-slate-200 rounded-xl font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Sector</Label>
                                            <Input
                                                value={formData.sector}
                                                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                                placeholder="Ej: Los Palos Grandes"
                                                className="h-12 border-slate-200 rounded-xl font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Estado</Label>
                                            <Input
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                placeholder="Ej: Miranda"
                                                className="h-12 border-slate-200 rounded-xl font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* Geocoding Section Card */}
                                    <div className="bg-card rounded-2xl p-6 border border-border/40 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800">Geolocalización</h4>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Vincular con el Mapa de Cobertura</p>
                                                </div>
                                            </div>
                                            <GeocodingButton
                                                address={{
                                                    street: formData.address,
                                                    city: formData.city,
                                                    state: formData.state,
                                                    country: "Venezuela"
                                                }}
                                                onCoordinatesFound={(lat, lng) => {
                                                    setFormData({ ...formData, latitude: lat, longitude: lng });
                                                    toast({
                                                        title: "Éxito",
                                                        description: "Ubicación detectada correctamente."
                                                    });
                                                }}
                                                disabled={!formData.city}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="relative group">
                                                <Input
                                                    type="number"
                                                    value={formData.latitude || ""}
                                                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || null })}
                                                    placeholder="Latitud"
                                                    className="h-10 text-xs font-mono font-bold rounded-lg"
                                                />
                                            </div>
                                            <div className="relative group">
                                                <Input
                                                    type="number"
                                                    value={formData.longitude || ""}
                                                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || null })}
                                                    placeholder="Longitud"
                                                    className="h-10 text-xs font-mono font-bold rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </TabsContent>

                            {/* Tab 2: Contacto */}
                            <TabsContent value="contacto" className="m-0 space-y-8 mt-0 animate-in fade-in slide-in-from-right-2">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full text-white" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Canales de Comunicación</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Teléfonos</Label>
                                            <div className="space-y-3">
                                                <div className="relative group">
                                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                    <Input
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="Principal: +58 414..."
                                                        className="h-12 pl-10 border-slate-200 rounded-xl font-bold"
                                                    />
                                                </div>
                                                <Input
                                                    value={formData.contact_phone}
                                                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                                    placeholder="Administrativo: +58 212..."
                                                    className="h-12 border-slate-200 rounded-xl font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Atención Digital</Label>
                                            <div className="space-y-3">
                                                <div className="relative group">
                                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                    <Input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="email@proveedor.com"
                                                        className="h-12 pl-10 border-slate-200 rounded-xl font-bold"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500/50" />
                                                    <Input
                                                        value={formData.instagram}
                                                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                                        placeholder="@farmacia_oficial"
                                                        className="h-12 pl-10 border-slate-200 rounded-xl font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-slate-100 text-slate-900" />

                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full text-white" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Responsables</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Contacto Principal</Label>
                                            <div className="relative group">
                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                <Input
                                                    value={formData.contact_name}
                                                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                                    placeholder="Ej: Lic. Juan Pérez"
                                                    className="h-12 pl-10 border-slate-200 rounded-xl font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Cargo / Posición</Label>
                                            <Input
                                                value={formData.contact_position}
                                                onChange={(e) => setFormData({ ...formData, contact_position: e.target.value })}
                                                placeholder="Ej: Regente / Dueño"
                                                className="h-12 border-slate-200 rounded-xl font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Horario Comercial</Label>
                                            <div className="relative group">
                                                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                <Input
                                                    value={formData.business_hours}
                                                    onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
                                                    placeholder="8:00 AM - 8:00 PM"
                                                    className="h-12 pl-10 border-slate-200 rounded-xl font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </TabsContent>

                            {/* Tab 3: Segmentación */}
                            <TabsContent value="segmentacion" className="m-0 space-y-8 mt-0 animate-in fade-in slide-in-from-right-2">
                                <section className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full text-white" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Perfil Estratégico</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nivel de Segmentación</Label>
                                            <Select value={formData.segmentation} onValueChange={(v) => setFormData({ ...formData, segmentation: v })}>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold bg-slate-50 shadow-inner group transition-all text-slate-900">
                                                    <SelectValue placeholder="Categorizar..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                    <SelectItem value="A" className="font-bold py-3">💎 Categoría A (Top Tier)</SelectItem>
                                                    <SelectItem value="B" className="font-bold py-3">🌟 Categoría B (Medium Tier)</SelectItem>
                                                    <SelectItem value="C" className="font-bold py-3">📊 Categoría C (Low Tier)</SelectItem>
                                                    <SelectItem value="Premium" className="font-bold py-3">✨ Premium Partner</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Potencial de Venta</Label>
                                            <Select value={formData.potential} onValueChange={(v) => setFormData({ ...formData, potential: v })}>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold bg-slate-50 shadow-inner text-slate-900">
                                                    <SelectValue placeholder="Potencial..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                    <SelectItem value="Alto" className="font-black text-indigo-700 uppercase tracking-widest text-[10px]">📈 ALTO POTENCIAL</SelectItem>
                                                    <SelectItem value="Medio" className="font-black text-amber-600 uppercase tracking-widest text-[10px]">⚖️ POTENCIAL MEDIO</SelectItem>
                                                    <SelectItem value="Bajo" className="font-black text-slate-400 uppercase tracking-widest text-[10px]">📉 BAJO POTENCIAL</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Portafolio de Interés</Label>
                                            <ProductMultiSelect
                                                selectedProducts={formData.product_interest_ids || []}
                                                onProductsChange={(products) => setFormData({ ...formData, product_interest_ids: products })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Portafolio Promocionado</Label>
                                            <ProductMultiSelect
                                                selectedProducts={formData.promoted_products || []}
                                                onProductsChange={(products) => setFormData({ ...formData, promoted_products: products })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nivel de Prioridad de Visita</Label>
                                        <div className="flex gap-3">
                                            {['high', 'medium', 'low'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, priority: p })}
                                                    className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${formData.priority === p
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                                        : 'bg-card border-border/40 text-slate-400 hover:border-blue-100'
                                                        }`}
                                                >
                                                    {p === 'high' ? 'Crítica' : p === 'medium' ? 'Regular' : 'Baja'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </TabsContent>

                            {/* Tab 4: Seguimiento */}
                            <TabsContent value="seguimiento" className="m-0 space-y-8 mt-0 animate-in fade-in slide-in-from-right-2">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full text-white" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Control & Status</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Última Auditoría / Visita</Label>
                                            <Input
                                                type="date"
                                                value={formData.last_visit}
                                                onChange={(e) => setFormData({ ...formData, last_visit: e.target.value })}
                                                className="h-14 rounded-2xl border-slate-200 font-bold bg-slate-50 text-slate-900"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Estado de la Cuenta</Label>
                                            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold bg-slate-50 text-slate-900">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                    <SelectItem value="Activo" className="font-black text-indigo-700 uppercase tracking-widest text-[10px]">🟢 CLIENTE ACTIVO</SelectItem>
                                                    <SelectItem value="Inactivo" className="font-black text-slate-400 uppercase tracking-widest text-[10px]">⚪ CLIENTE INACTIVO</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Hoja de Ruta / Próximas Acciones</Label>
                                        <Textarea
                                            value={formData.follow_up_action}
                                            onChange={(e) => setFormData({ ...formData, follow_up_action: e.target.value })}
                                            placeholder="Describa el plan de acción para este cliente..."
                                            className="min-h-[180px] rounded-2xl border-slate-200 font-medium p-6 resize-none focus:ring-blue-500/10"
                                        />
                                    </div>
                                </section>
                            </TabsContent>
                        </div>
                </Tabs>

                <div className="bg-muted/10 border-t border-border/40 px-8 py-6 flex items-center justify-between gap-4 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-12 px-6 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                    >
                        Descartar Operación
                    </Button>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={onSubmit}
                            className="h-12 px-10 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]"
                        >
                            {isEditing ? 'Actualizar Master Record' : 'Finalizar Registro'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
