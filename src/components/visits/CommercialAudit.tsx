/* ========================================================================
 MASTER FRAMEWORK - CESAR ASCANIO CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, AlertCircle, PackageSearch, LayoutPanelTop, MapPin, Plus } from "lucide-react";
import { ImageUploadInput } from "@/components/common/ImageUploadInput";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CommercialAuditData {
    product_identity?: string;
    visual_audit: string;
    current_inventory: number | null;
    marked_price: number | null;
    weekly_rotation: number | null;
    purchase_barrier: string;
    vademecum_status: string;
    training_offered: boolean;
    shelf_photo_url?: string;
    // Retail Expansion Fields
    aisle_number?: string;
    shelf_position?: string;
}

interface CommercialAuditProps {
    data: CommercialAuditData;
    onChange: (data: CommercialAuditData) => void;
    errors?: string[];
}

const VISUAL_AUDIT_OPTIONS = [
    { value: 'out_of_stock', label: '🔴 Agotado' },
    { value: 'critical', label: '🟠 Crítico (< 3 unidades)' },
    { value: 'optimal', label: '🟢 Óptimo' },
    { value: 'overstock', label: '🔵 Sobrestock' }
];

const PURCHASE_BARRIERS = [
    { value: 'no_budget', label: '💰 Sin Presupuesto' },
    { value: 'drugstore_failing', label: '🚚 Falla Droguería' },
    { value: 'low_demand', label: '📉 Baja Demanda' },
    { value: 'low_margin', label: '📊 Margen Bajo' },
    { value: 'none', label: '✅ Sin Barreras' }
];

const VADEMECUM_STATUS = [
    { value: 'active', label: '✅ Activo / Codificado' },
    { value: 'pending', label: '⏳ En Proceso de Codificación' },
    { value: 'not_listed', label: '❌ No Listado' },
    { value: 'unknown', label: '❓ Desconocido' }
];

const SHELF_POSITIONS = [
    { value: 'top', label: 'Nivel Superior (Fuera de alcance)' },
    { value: 'eye_level', label: 'Nivel de Ojos (Venta Caliente)' },
    { value: 'hand_level', label: 'Nivel de Manos' },
    { value: 'floor_level', label: 'Nivel de Suelo' }
];

export function CommercialAudit({ data, onChange, errors = [] }: CommercialAuditProps) {
    const [isCustomBarrier, setIsCustomBarrier] = useState(false);

    const updateField = <K extends keyof CommercialAuditData>(
        field: K,
        value: CommercialAuditData[K]
    ) => {
        onChange({ ...data, [field]: value });
    };

    const hasErrors = errors.length > 0;

    return (
        <Card className={`border-2 transition-all ${hasErrors ? 'border-destructive/50 bg-destructive/5 shadow-2xl shadow-destructive/10' : 'border-emerald-500/20 bg-card'} shadow-sm rounded-2xl overflow-hidden font-outfit`}>
            <CardHeader className="pb-3 bg-muted/20 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-600 dark:text-emerald-400 font-black">
                    <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20 text-white">
                        <Building2 className="h-5 w-5" />
                    </div>
                    Auditoría 360° (Canal Comercio)
                    <Badge variant="destructive" className="ml-auto font-black uppercase text-[10px] tracking-[0.2em] px-3 py-1.5 rounded-full border-none shadow-sm">Protocolo Obligatorio</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {hasErrors && (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-[10px] font-black animate-pulse shadow-sm uppercase tracking-wider">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Faltan campos estratégicos de inteligencia por completar.</span>
                    </div>
                )}

                {/* PRODUCT IDENTITY */}
                <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                        <PackageSearch className="h-4 w-4 text-emerald-500" /> Producto o Marca Auditada
                    </Label>
                    <Input
                        placeholder="Nombre de nuestro producto o marca competencia..."
                        value={data.product_identity || ''}
                        onChange={(e) => updateField('product_identity', e.target.value)}
                        className={`bg-muted/10 border-border focus:border-emerald-500 h-14 rounded-[1.2rem] font-bold text-foreground placeholder:text-muted-foreground/30 ${!data.product_identity && hasErrors ? 'border-destructive ring-2 ring-destructive/10' : 'shadow-sm'}`}
                    />
                </div>

                {/* RETAIL SPECIFIC FIELDS (Dual Tone Aware) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2 ml-1">
                            <MapPin className="h-4 w-4" /> N° de Pasillo / Sector
                        </Label>
                        <Input
                            placeholder="Ej: Pasillo 4 - Bebidas"
                            value={data.aisle_number || ''}
                            onChange={(e) => updateField('aisle_number', e.target.value)}
                            className="bg-card border-emerald-500/20 focus:border-emerald-500 h-14 rounded-[1.2rem] font-bold text-foreground shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2 ml-1">
                            <LayoutPanelTop className="h-4 w-4" /> Posición en Góndola
                        </Label>
                        <Select
                            value={data.shelf_position}
                            onValueChange={(v) => updateField('shelf_position', v)}
                        >
                            <SelectTrigger className="bg-card border-emerald-500/20 h-14 rounded-[1.2rem] font-bold text-foreground shadow-sm focus:ring-emerald-500/10">
                                <SelectValue placeholder="Seleccionar Ubicación..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-card shadow-2xl">
                                {SHELF_POSITIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="font-bold py-3 text-foreground">{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Auditoría Visual */}
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Estado en Percha (KPI)
                        </Label>
                        <Select
                            value={data.visual_audit}
                            onValueChange={(v) => updateField('visual_audit', v)}
                        >
                            <SelectTrigger className={`bg-muted/10 border-border h-14 rounded-[1.2rem] font-bold text-foreground ${!data.visual_audit && hasErrors ? 'border-destructive' : 'shadow-sm'}`}>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border shadow-2xl bg-card">
                                {VISUAL_AUDIT_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="font-bold py-3 text-foreground">{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Vademecum Status */}
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Status Vademécum / Codificación
                        </Label>
                        <Select
                            value={data.vademecum_status}
                            onValueChange={(v) => updateField('vademecum_status', v)}
                        >
                            <SelectTrigger className={`bg-muted/10 border-border h-14 rounded-[1.2rem] font-bold text-foreground ${!data.vademecum_status && hasErrors ? 'border-destructive' : 'shadow-sm'}`}>
                                <SelectValue placeholder="Estado de Codificación" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border shadow-2xl bg-card">
                                {VADEMECUM_STATUS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="font-bold py-3 text-foreground">{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Inventario Físico */}
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1 text-center block">Stock Actual</Label>
                        <Input
                            type="number"
                            min={0}
                            placeholder="Unds"
                            value={data.current_inventory ?? ''}
                            onChange={(e) => updateField('current_inventory', e.target.value ? parseInt(e.target.value) : null)}
                            className={`bg-muted/5 border-border font-black h-14 rounded-[1.2rem] text-center shadow-sm text-foreground text-lg ${data.current_inventory === null && hasErrors ? 'border-destructive' : ''}`}
                        />
                    </div>

                    {/* Precio Marcado (PVP) */}
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1 text-center block">PVP Auditado ($)</Label>
                        <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            value={data.marked_price ?? ''}
                            onChange={(e) => updateField('marked_price', e.target.value ? parseFloat(e.target.value) : null)}
                            className={`bg-muted/5 border-border font-black h-14 rounded-[1.2rem] text-center shadow-sm text-blue-500 dark:text-blue-400 text-lg ${data.marked_price === null && hasErrors ? 'border-destructive' : ''}`}
                        />
                    </div>

                    {/* Rotación Semanal */}
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1 text-center block">Rotación Semanal</Label>
                        <Input
                            type="number"
                            min={0}
                            placeholder="Unds"
                            value={data.weekly_rotation ?? ''}
                            onChange={(e) => updateField('weekly_rotation', e.target.value ? parseInt(e.target.value) : null)}
                            className={`bg-muted/5 border-border font-black h-14 rounded-[1.2rem] text-center shadow-sm text-foreground text-lg ${data.weekly_rotation === null && hasErrors ? 'border-destructive' : ''}`}
                        />
                    </div>
                </div>

                {/* Barrera de Compra con Política 'SIN OTROS' */}
                <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between ml-1">
                        Escenario de Resistencia (Barrera)
                        {!isCustomBarrier && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => { setIsCustomBarrier(true); updateField('purchase_barrier', ''); }}
                                className="h-6 px-3 text-[9px] font-black text-indigo-500 uppercase hover:bg-indigo-500/10 rounded-full tracking-widest shadow-sm border border-indigo-500/10"
                            >
                                <Plus className="h-3 w-3 mr-1" /> Nueva Barrera Real
                            </Button>
                        )}
                    </Label>
                    
                    {!isCustomBarrier ? (
                        <Select
                            value={data.purchase_barrier}
                            onValueChange={(v) => updateField('purchase_barrier', v)}
                        >
                            <SelectTrigger className={`bg-muted/10 border-border h-14 rounded-[1.2rem] font-bold text-foreground ${!data.purchase_barrier && hasErrors ? 'border-destructive' : 'shadow-sm'}`}>
                                <SelectValue placeholder="¿Por qué no compra?" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border shadow-2xl bg-card">
                                {PURCHASE_BARRIERS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="font-bold py-3 text-foreground">{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex gap-2 animate-in slide-in-from-right-2">
                             <Input
                                placeholder="Escribe la barrera detectada en el punto de venta..."
                                value={data.purchase_barrier}
                                onChange={(e) => updateField('purchase_barrier', e.target.value)}
                                className={`bg-indigo-500/5 border-indigo-500/20 focus:border-indigo-500 h-14 rounded-[1.2rem] font-bold text-foreground ${!data.purchase_barrier && hasErrors ? 'border-destructive' : 'shadow-sm'}`}
                            />
                            <Button 
                                variant="outline" 
                                onClick={() => { setIsCustomBarrier(false); updateField('purchase_barrier', ''); }}
                                className="h-14 w-14 rounded-[1.2rem] border-border text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            >
                                ✕
                            </Button>
                        </div>
                    )}
                </div>

                {/* Evidencia Fotográfica (Anaquel) */}
                <div className="pt-6 mt-4 border-t border-border">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-6 block flex items-center justify-between ml-1 leading-none">
                        <span>📸 Registro Forense de Percha</span>
                        <Badge className="bg-red-500 text-white border-none font-black text-[9px] uppercase px-4 py-2 shadow-lg shadow-red-500/20 rounded-full">Evidencia Crítica</Badge>
                    </Label>
                    <div className="bg-muted/5 rounded-3xl p-6 border border-border/50">
                        <ImageUploadInput
                            value={data.shelf_photo_url || null}
                            onUpload={(url) => updateField('shelf_photo_url', url)}
                            onDelete={() => updateField('shelf_photo_url', undefined)}
                            path="shelf_audits"
                            label="Foto del Anaquel / Góndola Master"
                        />
                        <p className="text-[10px] text-muted-foreground/40 mt-6 leading-relaxed font-bold  text-center uppercase tracking-widest px-4">
                            * La captura fotográfica es obligatoria según el Estándar César Ascanio CA.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function validateCommercialAudit(data: CommercialAuditData): string[] {
    const errors: string[] = [];
    if (!data.product_identity) errors.push('product_identity');
    if (!data.visual_audit) errors.push('visual_audit');
    if (data.current_inventory === null) errors.push('current_inventory');
    if (data.marked_price === null) errors.push('marked_price');
    if (data.weekly_rotation === null) errors.push('weekly_rotation');
    if (!data.purchase_barrier) errors.push('purchase_barrier');
    if (!data.vademecum_status) errors.push('vademecum_status');
    if (!data.shelf_photo_url) errors.push('shelf_photo_url');
    return errors;
}

export const emptyCommercialAudit: CommercialAuditData = {
    product_identity: '',
    visual_audit: '',
    current_inventory: null,
    marked_price: null,
    weekly_rotation: null,
    purchase_barrier: '',
    vademecum_status: '',
    training_offered: false
};
