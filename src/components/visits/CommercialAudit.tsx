import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, AlertCircle } from "lucide-react";

export interface CommercialAuditData {
    visual_audit: string;
    current_inventory: number | null;
    marked_price: number | null;
    weekly_rotation: number | null;
    purchase_barrier: string;
    vademecum_status: string; // 'active', 'pending', 'not_listed'
    training_offered: boolean;
    shelf_photo_url?: string;
}

import { ImageUploadInput } from "@/components/common/ImageUploadInput";

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

export function CommercialAudit({ data, onChange, errors = [] }: CommercialAuditProps) {
    const updateField = <K extends keyof CommercialAuditData>(
        field: K,
        value: CommercialAuditData[K]
    ) => {
        onChange({ ...data, [field]: value });
    };

    const hasErrors = errors.length > 0;

    return (
        <Card className={`border-2 ${hasErrors ? 'border-red-300 bg-red-50/50' : 'border-emerald-200 bg-emerald-50/30'}`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-800">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    Auditoría 360° (Farmacia/Institución)
                    <span className="text-xs font-normal text-red-500 ml-auto">* Obligatorio</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {hasErrors && (
                    <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Completa todos los campos obligatorios</span>
                    </div>
                )}

                {/* Auditoría Visual */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Auditoría Visual <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={data.visual_audit}
                        onValueChange={(v) => updateField('visual_audit', v)}
                    >
                        <SelectTrigger className={`bg-white ${!data.visual_audit && hasErrors ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder="Estado del producto en anaquel" />
                        </SelectTrigger>
                        <SelectContent>
                            {VISUAL_AUDIT_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Inventario Físico */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Inventario Físico Actual (unidades) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="number"
                        min={0}
                        placeholder="Ej: 12"
                        value={data.current_inventory ?? ''}
                        onChange={(e) => updateField('current_inventory', e.target.value ? parseInt(e.target.value) : null)}
                        className={`bg-white ${data.current_inventory === null && hasErrors ? 'border-red-300' : ''}`}
                    />
                </div>

                {/* Precio Marcado (PVP) */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Precio Marcado en Anaquel (PVP) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="Ej: 15.50"
                            value={data.marked_price ?? ''}
                            onChange={(e) => updateField('marked_price', e.target.value ? parseFloat(e.target.value) : null)}
                            className={`bg-white pl-7 ${data.marked_price === null && hasErrors ? 'border-red-300' : ''}`}
                        />
                    </div>
                </div>

                {/* Rotación Semanal */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Rotación Semanal Estimada (unidades) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="number"
                        min={0}
                        placeholder="Ej: 5"
                        value={data.weekly_rotation ?? ''}
                        onChange={(e) => updateField('weekly_rotation', e.target.value ? parseInt(e.target.value) : null)}
                        className={`bg-white ${data.weekly_rotation === null && hasErrors ? 'border-red-300' : ''}`}
                    />
                    {data.current_inventory !== null && data.weekly_rotation !== null && data.weekly_rotation > 0 && (
                        <p className="text-xs text-muted-foreground">
                            📊 Cobertura: ~{Math.round(data.current_inventory / data.weekly_rotation)} semanas de stock
                        </p>
                    )}
                </div>

                {/* Vademecum & Training (360) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Status Vademécum <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={data.vademecum_status}
                            onValueChange={(v) => updateField('vademecum_status', v)}
                        >
                            <SelectTrigger className={`bg-white ${!data.vademecum_status && hasErrors ? 'border-red-300' : ''}`}>
                                <SelectValue placeholder="Estado Listado" />
                            </SelectTrigger>
                            <SelectContent>
                                {VADEMECUM_STATUS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Relacionamiento
                        </Label>
                        <div className="flex items-center gap-2 p-3 bg-white border rounded-md h-[42px]">
                            <input
                                type="checkbox"
                                id="training_offered"
                                checked={data.training_offered}
                                onChange={(e) => updateField('training_offered', e.target.checked)}
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <label htmlFor="training_offered" className="text-sm text-gray-700 select-none cursor-pointer">
                                ¿Capacitación Ofrecida?
                            </label>
                        </div>
                    </div>
                </div>

                {/* Barrera de Compra */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Barrera de Compra Principal <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={data.purchase_barrier}
                        onValueChange={(v) => updateField('purchase_barrier', v)}
                    >
                        <SelectTrigger className={`bg-white ${!data.purchase_barrier && hasErrors ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder="¿Por qué no compra más?" />
                        </SelectTrigger>
                        <SelectContent>
                            {PURCHASE_BARRIERS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Evidencia Fotográfica (Anaquel) */}
                <div className="pt-4 border-t border-emerald-100">
                    <Label className="text-sm font-bold text-emerald-800 mb-2 block">
                        📸 Evidencia Fotográfica (Anaquel / Exhibición)
                    </Label>
                    <ImageUploadInput
                        value={data.shelf_photo_url || null}
                        onUpload={(url) => updateField('shelf_photo_url', url)}
                        onDelete={() => updateField('shelf_photo_url', undefined)}
                        path="shelf_audits"
                        label="Foto del Anaquel"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 italic">
                        La foto es obligatoria para validar precios de competencia y quiebres de stock.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

// Función de validación
export function validateCommercialAudit(data: CommercialAuditData): string[] {
    const errors: string[] = [];
    if (!data.visual_audit) errors.push('visual_audit');
    if (data.current_inventory === null) errors.push('current_inventory');
    if (data.marked_price === null) errors.push('marked_price');
    if (data.weekly_rotation === null) errors.push('weekly_rotation');
    if (!data.purchase_barrier) errors.push('purchase_barrier');
    if (!data.vademecum_status) errors.push('vademecum_status');
    if (!data.shelf_photo_url) errors.push('shelf_photo_url');
    return errors;
}

// Defaults
export const emptyCommercialAudit: CommercialAuditData = {
    visual_audit: '',
    current_inventory: null,
    marked_price: null,
    weekly_rotation: null,
    purchase_barrier: '',
    vademecum_status: '',
    training_offered: false
};
