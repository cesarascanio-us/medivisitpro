/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Stethoscope, AlertCircle, Quote, Activity, CheckCircle2, User,
    BarChart, ShoppingBag, Clock, Tag, FileCheck, DollarSign, Users as UsersIcon, Scale, Leaf as LeafIcon
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { VisitScenario } from "@/services/visitAutomationService";

// --- Types ---

export interface ProfilingData {
    // 1. Identificación
    specialty: string;
    sub_specialty: string;
    institution_type: string;
    positions: string;
    // 2. Volumen
    patients_per_day: string;
    patient_ses: string;
    age_group: string;
    top_pathologies: string; // Stored as comma-separated string for simplicity
    // 3. Hábitos
    decision_criteria: string[]; // Multi-select
    adoption_profile: string;
    brand_loyalty: string;
    sample_usage: string;
    // 4. Logística
    consultation_days: string[]; // Multi-select
    best_time: string;
    appointment_management: string;
    assistant_name: string;
    // 5. Categorización
    manual_classification: string;
}

export interface CommerceProfilingData {
    // 1. Estatus Legal (Checklist)
    legal_docs: string[]; // ['rif', 'sanitary_permit', 'habitability']
    // 2. Capacidad y Finanzas
    est_monthly_volume: string;
    payment_condition: 'cash' | 'credit' | 'mixed' | '';
    // 3. Decisor
    decision_maker_role: string; // 'owner', 'manager', 'accountant'
    // 4. Perfil Comercial
    store_focus: string; // 'natural', 'pharmacological', 'mixed'
    delivery_frequency: string;
}

export interface ValidationData {
    samples_used: 'yes' | 'no' | 'partial' | '';
    flavor_acceptance: string;
    tolerance_observation: string;
}

export interface MaintenanceData {
    anemia_handling: string;
    nutraceutical_opinion: string;
    competitor_comparison: string;
}

export type DynamicInterviewData = {
    type: 'conquest';
    data: ProfilingData | CommerceProfilingData;
} | {
    type: 'development';
    data: ValidationData;
} | {
    type: 'maturity';
    data: MaintenanceData;
};

interface DynamicInterviewFormProps {
    scenario: VisitScenario;
    data: any; // We'll cast this internally based on scenario
    onChange: (data: any) => void;
    errors?: string[];
    lastVisitSamples?: string | null;
    entityType?: string;
}

// --- Specific Forms ---

function ProfilingForm({ data, onChange, errors = [] }: { data: ProfilingData, onChange: (d: ProfilingData) => void, errors: string[] }) {
    const updateField = (field: keyof ProfilingData, value: any) => onChange({ ...data, [field]: value });
    const hasError = (field: string) => errors.includes(field);

    return (
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full animate-in fade-in slide-in-from-bottom-2">

            {/* 1. Identificación */}
            <AccordionItem value="item-1" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-emerald-400">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-400" />
                        <span>1. Identificación Profesional</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Especialidad Primaria *</Label>
                            <Select value={data.specialty} onValueChange={(v) => updateField('specialty', v)}>
                                <SelectTrigger className={`bg-slate-900 border-slate-700 text-white ${hasError('specialty') ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pediatria">Pediatría</SelectItem>
                                    <SelectItem value="ginecologia">Ginecología</SelectItem>
                                    <SelectItem value="medicina_interna">Medicina Interna</SelectItem>
                                    <SelectItem value="medicina_general">Medicina General</SelectItem>
                                    <SelectItem value="nutricion">Nutrición</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Sub-especialidad</Label>
                            <Input value={data.sub_specialty || ''} onChange={(e) => updateField('sub_specialty', e.target.value)} className="bg-slate-900 border-slate-700 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Tipo de Institución</Label>
                            <Select value={data.institution_type} onValueChange={(v) => updateField('institution_type', v)}>
                                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="private">Privada</SelectItem>
                                    <SelectItem value="public">Pública</SelectItem>
                                    <SelectItem value="mixed">Mixta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Cargos Institucionales (KOL)</Label>
                            <Input value={data.positions || ''} onChange={(e) => updateField('positions', e.target.value)} placeholder="Ej. Jefe de Servicio" className="bg-slate-900 border-slate-700 text-white" />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* 2. Volumen y Perfil */}
            <AccordionItem value="item-2" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-emerald-400">
                    <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-emerald-400" />
                        <span>2. Volumen y Potencial</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Pacientes/Día *</Label>
                            <Input type="number" value={data.patients_per_day || ''} onChange={(e) => updateField('patients_per_day', e.target.value)} className={`bg-slate-900 border-slate-700 text-white ${hasError('patients_per_day') ? 'border-red-500' : ''}`} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Nivel Socioeconómico *</Label>
                            <Select value={data.patient_ses} onValueChange={(v) => updateField('patient_ses', v)}>
                                <SelectTrigger className={`bg-slate-900 border-slate-700 text-white ${hasError('patient_ses') ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">Alto</SelectItem>
                                    <SelectItem value="medium">Medio</SelectItem>
                                    <SelectItem value="low">Bajo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Grupo Etario Predominante</Label>
                            <Select value={data.age_group} onValueChange={(v) => updateField('age_group', v)}>
                                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pediatric">Pediátrico</SelectItem>
                                    <SelectItem value="adult">Adultos</SelectItem>
                                    <SelectItem value="geriatric">Geriátrico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Patologías Top (Separar por coma)</Label>
                            <Input value={data.top_pathologies || ''} onChange={(e) => updateField('top_pathologies', e.target.value)} placeholder="Anemia, Desnutrición..." className="bg-slate-900 border-slate-700 text-white" />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* 3. Hábitos */}
            <AccordionItem value="item-3" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-emerald-400">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-emerald-400" />
                        <span>3. Hábitos de Prescripción</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-1">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-300">Criterio de Elección (Múltiple) *</Label>
                        <ToggleGroup type="multiple" value={data.decision_criteria} onValueChange={(v) => updateField('decision_criteria', v)} className="flex flex-wrap justify-start gap-2">
                            <ToggleGroupItem value="efficacy" aria-label="Eficacia" variant="outline" className="border-slate-700 data-[state=on]:bg-emerald-500 data-[state=on]:text-white">
                                Eficacia
                            </ToggleGroupItem>
                            <ToggleGroupItem value="safety" aria-label="Seguridad" variant="outline" className="border-slate-700 data-[state=on]:bg-emerald-500 data-[state=on]:text-white">
                                Seguridad
                            </ToggleGroupItem>
                            <ToggleGroupItem value="price" aria-label="Precio" variant="outline" className="border-slate-700 data-[state=on]:bg-emerald-500 data-[state=on]:text-white">
                                Precio
                            </ToggleGroupItem>
                            <ToggleGroupItem value="availability" aria-label="Disponibilidad" variant="outline" className="border-slate-700 data-[state=on]:bg-emerald-500 data-[state=on]:text-white">
                                Disponibilidad
                            </ToggleGroupItem>
                            <ToggleGroupItem value="experience" aria-label="Experiencia" variant="outline" className="border-slate-700 data-[state=on]:bg-emerald-500 data-[state=on]:text-white">
                                Experiencia
                            </ToggleGroupItem>
                        </ToggleGroup>
                        {hasError('decision_criteria') && <p className="text-xs text-red-500">Seleccione al menos uno</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Adopción de Nuevas Moléculas</Label>
                            <Select value={data.adoption_profile} onValueChange={(v) => updateField('adoption_profile', v)}>
                                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="early">Innovador / Early Adopter</SelectItem>
                                    <SelectItem value="conservative">Conservador</SelectItem>
                                    <SelectItem value="skeptic">Escéptico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Uso de Muestras</Label>
                            <Select value={data.sample_usage} onValueChange={(v) => updateField('sample_usage', v)}>
                                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="start_treatment">Inicio de Tratamiento</SelectItem>
                                    <SelectItem value="social_aid">Ayuda Social</SelectItem>
                                    <SelectItem value="no_usage">No las utiliza</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* 4. Logística */}
            <AccordionItem value="item-4" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-emerald-400">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-400" />
                        <span>4. Logística</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-1">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-300">Días de Consulta</Label>
                        <ToggleGroup type="multiple" value={data.consultation_days} onValueChange={(v) => updateField('consultation_days', v)} className="justify-start gap-2">
                            {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(day => (
                                <ToggleGroupItem key={day} value={day} variant="outline" className="h-9 w-9 p-0 border-slate-700 data-[state=on]:bg-emerald-500 data-[state=on]:text-white">
                                    {day.charAt(0)}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Mejor Horario</Label>
                            <Select value={data.best_time} onValueChange={(v) => updateField('best_time', v)}>
                                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Mañana</SelectItem>
                                    <SelectItem value="afternoon">Tarde</SelectItem>
                                    <SelectItem value="night">Noche</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Nombre Asistente</Label>
                            <Input value={data.assistant_name || ''} onChange={(e) => updateField('assistant_name', e.target.value)} className="bg-slate-900 border-slate-700 text-white" />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* 5. Categorización */}
            <AccordionItem value="item-5" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-emerald-400">
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-emerald-400" />
                        <span>5. Categorización</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-1">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                        <Label className="text-sm font-bold text-slate-300 mb-4 block">Clasificación Manual Inicial *</Label>
                        <div className="flex gap-4">
                            {['A', 'B', 'C'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => updateField('manual_classification', cat)}
                                    className={`flex-1 py-3 rounded-lg font-bold border transition-all ${data.manual_classification === cat
                                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-emerald-500/50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        {data.manual_classification && (
                            <div className="mt-4 text-center text-sm text-emerald-300 bg-emerald-500/10 py-2 rounded">
                                Frecuencia sugerida:
                                <strong>
                                    {data.manual_classification === 'A' ? ' 2 visitas/mes' : data.manual_classification === 'B' ? ' 1 visita/mes' : ' 1 visita cada 2 meses'}
                                </strong>
                            </div>
                        )}
                        {hasError('manual_classification') && (
                            <p className="text-red-400 text-xs mt-2">Seleccione una categoría</p>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>

        </Accordion>
    );
}

function CommerceProfilingForm({ data, onChange, errors = [] }: { data: CommerceProfilingData, onChange: (d: CommerceProfilingData) => void, errors: string[] }) {
    const updateField = (field: keyof CommerceProfilingData, value: any) => onChange({ ...data, [field]: value });
    const hasError = (field: string) => errors.includes(field);

    const toggleLegalDoc = (docId: string) => {
        const current = data.legal_docs || [];
        const next = current.includes(docId)
            ? current.filter(id => id !== docId)
            : [...current, docId];
        updateField('legal_docs', next);
    };

    return (
        <Accordion type="single" collapsible defaultValue="commerce-1" className="w-full animate-in fade-in slide-in-from-bottom-2">

            {/* 1. Estatus Legal */}
            <AccordionItem value="commerce-1" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-emerald-400">
                    <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-emerald-400" />
                        <span>1. Documentación Legal</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-1">
                    <div className="grid grid-cols-1 gap-3">
                        <Label className="text-xs font-medium text-slate-300 mb-1">Checklist Obligatorio *</Label>
                        {[
                            { id: 'rif', label: 'RIF Vigente' },
                            { id: 'sanitary_permit', label: 'Permiso Sanitario' },
                            { id: 'habitability', label: 'Certificado de Habitabilidad' }
                        ].map(doc => (
                            <div key={doc.id} className="flex items-center space-x-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                <Checkbox
                                    id={doc.id}
                                    checked={data.legal_docs?.includes(doc.id)}
                                    onCheckedChange={() => toggleLegalDoc(doc.id)}
                                    className="border-emerald-500 data-[state=checked]:bg-emerald-500"
                                />
                                <label htmlFor={doc.id} className="text-sm text-slate-200 cursor-pointer flex-1">
                                    {doc.label}
                                </label>
                            </div>
                        ))}
                        {hasError('legal_docs') && <p className="text-xs text-red-500">Faltan documentos legales críticos</p>}
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* 2. Capacidad y Finanzas */}
            <AccordionItem value="commerce-2" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-emerald-400">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span>2. Capacidad de Compra</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Volumen Mensual Est. ($) *</Label>
                            <Input
                                type="number"
                                value={data.est_monthly_volume}
                                onChange={(e) => updateField('est_monthly_volume', e.target.value)}
                                className={`bg-slate-900 border-slate-700 text-white ${hasError('est_monthly_volume') ? 'border-red-500' : ''}`}
                                placeholder="Ej. 1500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Condición de Pago *</Label>
                            <Select value={data.payment_condition} onValueChange={(v) => updateField('payment_condition', v)}>
                                <SelectTrigger className={`bg-slate-900 border-slate-700 text-white ${hasError('payment_condition') ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Contado</SelectItem>
                                    <SelectItem value="credit">Crédito (Aprobación Pend.)</SelectItem>
                                    <SelectItem value="mixed">Mixto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* 3. Decisor y Foco */}
            <AccordionItem value="commerce-3" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-emerald-400">
                    <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-emerald-400" />
                        <span>3. Perfil de Negocio</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Persona que Decide *</Label>
                            <Select value={data.decision_maker_role} onValueChange={(v) => updateField('decision_maker_role', v)}>
                                <SelectTrigger className={`bg-slate-900 border-slate-700 text-white ${hasError('decision_maker_role') ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="owner">Dueño / Propietario</SelectItem>
                                    <SelectItem value="manager">Administrador</SelectItem>
                                    <SelectItem value="accountant">Contador / Compras</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-300">Enfoque del Establecimiento</Label>
                            <Select value={data.store_focus} onValueChange={(v) => updateField('store_focus', v)}>
                                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="natural">Tienda Naturista / Natural</SelectItem>
                                    <SelectItem value="pharmacological">Farmacológico / Clínica</SelectItem>
                                    <SelectItem value="mixed">Mixto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

        </Accordion>
    );
}

function ValidationForm({ data, onChange, errors = [], lastVisitSamples }: { data: ValidationData, onChange: (d: ValidationData) => void, errors: string[], lastVisitSamples?: string | null }) {
    const updateField = (field: keyof ValidationData, value: string) => onChange({ ...data, [field]: value });
    const hasError = (field: string) => errors.includes(field);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {lastVisitSamples && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                    <Quote className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-300 mb-1">Recordatorio de Visita Anterior</h4>
                        <p className="text-sm text-blue-100/80">
                            Entregó: <span className="font-mono text-white bg-blue-500/20 px-1 rounded">{lastVisitSamples}</span>.
                            Pregunte por la experiencia.
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">
                    ¿Tuvo oportunidad de iniciar tratamiento con las muestras? <span className="text-red-500">*</span>
                </Label>
                <Select value={data.samples_used} onValueChange={(v: any) => updateField('samples_used', v)}>
                    <SelectTrigger className={`bg-slate-900 border-slate-700 text-white ${hasError('samples_used') ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="yes">Sí, inicié tratamiento</SelectItem>
                        <SelectItem value="partial">Algunos pacientes</SelectItem>
                        <SelectItem value="no">No tuve oportunidad</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">
                    Reporte sobre Sabor / Aceptación
                </Label>
                <Input
                    value={data.flavor_acceptance || ''}
                    onChange={(e) => updateField('flavor_acceptance', e.target.value)}
                    placeholder="¿Qué dijeron los pacientes/padres?"
                    className="bg-slate-900 border-slate-700 text-white"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">
                    Observaciones de Tolerancia Gástrica
                </Label>
                <Input
                    value={data.tolerance_observation || ''}
                    onChange={(e) => updateField('tolerance_observation', e.target.value)}
                    placeholder="¿Hubo efectos adversos?"
                    className="bg-slate-900 border-slate-700 text-white"
                />
            </div>
        </div>
    );
}

function MaintenanceForm({ data, onChange, errors = [] }: { data: MaintenanceData, onChange: (d: MaintenanceData) => void, errors: string[] }) {
    const updateField = (field: keyof MaintenanceData, value: string) => onChange({ ...data, [field]: value });
    const hasError = (field: string) => errors.includes(field);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">
                    Manejo actual de Anemia Ferropénica
                </Label>
                <Input
                    value={data.anemia_handling || ''}
                    onChange={(e) => updateField('anemia_handling', e.target.value)}
                    placeholder="Estrategia actual..."
                    className="bg-slate-900 border-slate-700 text-white"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">
                    Opinión Línea Nutracéutica (Inmune)
                </Label>
                <Input
                    value={data.nutraceutical_opinion || ''}
                    onChange={(e) => updateField('nutraceutical_opinion', e.target.value)}
                    placeholder="Feedback sobre nuevos productos..."
                    className="bg-slate-900 border-slate-700 text-white"
                />
            </div>
        </div>
    );
}

function SpinFallbackForm({ data, onChange, errors = [] }: { data: any, onChange: (d: any) => void, errors: string[] }) {
    const updateField = (field: string, value: string) => onChange({ ...data, [field]: value });
    const hasError = (field: string) => errors.includes(field);

    return (
        <div className="space-y-6">
             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Situación (S) <span className="text-red-500">*</span></Label>
                <textarea 
                    value={data.situation || ''} 
                    onChange={(e) => updateField('situation', e.target.value)}
                    placeholder="¿Cuál es el contexto actual del paciente/negocio?"
                    className={`w-full bg-slate-900/40 border-slate-700/50 text-white rounded-2xl p-5 min-h-[120px] text-sm focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-600 shadow-inner ${hasError('situation') ? 'border-red-500/50 bg-red-500/5' : ''}`}
                />
            </div>
             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Problema (P) <span className="text-red-500">*</span></Label>
                <textarea 
                    value={data.problem || ''} 
                    onChange={(e) => updateField('problem', e.target.value)}
                    placeholder="¿Qué dificultades o insatisfacciones existen?"
                    className={`w-full bg-slate-900/40 border-slate-700/50 text-white rounded-2xl p-5 min-h-[120px] text-sm focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-600 shadow-inner ${hasError('problem') ? 'border-red-500/50 bg-red-500/5' : ''}`}
                />
            </div>
             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Implicación (I) <span className="text-red-500">*</span></Label>
                <textarea 
                    value={data.implication || ''} 
                    onChange={(e) => updateField('implication', e.target.value)}
                    placeholder="¿Cuáles son las consecuencias de no resolver el problema?"
                    className={`w-full bg-slate-900/40 border-slate-700/50 text-white rounded-2xl p-5 min-h-[120px] text-sm focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-600 shadow-inner ${hasError('implication') ? 'border-red-500/50 bg-red-500/5' : ''}`}
                />
            </div>
             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Necesidad de Beneficio (N) <span className="text-red-500">*</span></Label>
                <textarea 
                    value={data.need_payoff || ''} 
                    onChange={(e) => updateField('need_payoff', e.target.value)}
                    placeholder="¿Cómo ayudaría nuestra solución a resolverlo?"
                    className={`w-full bg-slate-900/40 border-slate-700/50 text-white rounded-2xl p-5 min-h-[120px] text-sm focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-600 shadow-inner ${hasError('need_payoff') ? 'border-red-500/50 bg-red-500/5' : ''}`}
                />
            </div>
        </div>
    );
}


// --- Main Container ---

export function DynamicInterviewForm({ scenario, data, onChange, errors = [], lastVisitSamples, entityType = 'doctor' }: DynamicInterviewFormProps) {
    const isCommerce = entityType === 'pharmacy' || entityType === 'store' || entityType === 'drugstore' || entityType === 'natural_store';

    // Determine title and icon based on scenario
    let title = isCommerce ? "Perfilamiento Comercial" : "Entrevista Clínica";
    let Icon = isCommerce ? (entityType === 'natural_store' ? LeafIcon : Scale) : Stethoscope;
    let colorClass = "text-purple-400";

    if (scenario.type === 'conquest') {
        title = isCommerce ? "Alta Comercial (Prospecto)" : "Perfilamiento Inicial (Visita 1)";
        Icon = isCommerce ? FileCheck : Activity;
        colorClass = "text-emerald-400";
    } else if (scenario.type === 'development') {
        title = isCommerce ? "Validación Comercial" : "Validación y Seguimiento (Visita 2)";
        Icon = CheckCircle2;
        colorClass = "text-blue-400";
    } else if (scenario.type === 'maturity') {
        title = isCommerce ? "Mantenimiento Ventas" : "Mantenimiento y Cross-Selling";
        Icon = isCommerce ? ShoppingBag : Stethoscope;
        colorClass = "text-orange-400";
    }

    return (
        <Card className="border-white/10 bg-slate-950/40 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className={`flex items-center gap-2 text-lg ${colorClass}`}>
                    <div className={`p-2 rounded-lg bg-current/10`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                {errors.length > 0 && (
                    <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <span>Por favor complete los campos obligatorios para el {isCommerce ? 'alta' : 'registro'}.</span>
                    </div>
                )}

                {scenario.type === 'conquest' && (
                    isCommerce ? (
                        <CommerceProfilingForm
                            data={data as CommerceProfilingData}
                            onChange={onChange}
                            errors={errors}
                        />
                    ) : (
                        <ProfilingForm
                            data={data as ProfilingData}
                            onChange={onChange}
                            errors={errors}
                        />
                    )
                )}

                {scenario.type === 'development' && (
                    <ValidationForm
                        data={data as ValidationData}
                        onChange={onChange}
                        errors={errors}
                        lastVisitSamples={lastVisitSamples}
                    />
                )}

                {scenario.id === 'spin-fallback' && (
                    <SpinFallbackForm
                        data={data}
                        onChange={onChange}
                        errors={errors}
                    />
                )}

                {scenario.type === 'maturity' && scenario.id !== 'spin-fallback' && (
                    <MaintenanceForm
                        data={data as MaintenanceData}
                        onChange={onChange}
                        errors={errors}
                    />
                )}
            </CardContent>
        </Card>
    );
}

// --- Validation Helpers ---

export function validateDynamicInterview(scenario: VisitScenario, data: any, entityType: string = 'doctor'): string[] {
    const errors: string[] = [];
    const isCommerce = entityType === 'pharmacy' || entityType === 'store' || entityType === 'drugstore' || entityType === 'natural_store';

    if (scenario.type === 'conquest') {
        if (isCommerce) {
            const d = data as CommerceProfilingData;

            // Critical Documentation check for commerce entities
            if (!d.legal_docs || d.legal_docs.length < 2) errors.push('legal_docs');

            if (!d.est_monthly_volume) errors.push('est_monthly_volume');
            if (!d.payment_condition) errors.push('payment_condition');
            if (!d.decision_maker_role) errors.push('decision_maker_role');
        } else {
            const d = data as ProfilingData;
            if (!d.specialty) errors.push('specialty');
            if (!d.patients_per_day) errors.push('patients_per_day');
            if (!d.patient_ses) errors.push('patient_ses');
            if (!d.decision_criteria || d.decision_criteria.length === 0) errors.push('decision_criteria');
            if (!d.manual_classification) errors.push('manual_classification');
        }
    } else if (scenario.id === 'spin-fallback') {
        if (!data.situation) errors.push('situation');
        if (!data.problem) errors.push('problem');
        if (!data.implication) errors.push('implication');
        if (!data.need_payoff) errors.push('need_payoff');
    } else if (scenario.type === 'development') {
        const d = data as ValidationData;
        if (!d.samples_used) errors.push('samples_used');
    }

    return errors;
}

export function getEmptyInterviewData(scenario: VisitScenario, entityType: string = 'doctor'): any {
    const isCommerce = entityType === 'pharmacy' || entityType === 'store' || entityType === 'drugstore' || entityType === 'natural_store';

    if (scenario.type === 'conquest') {
        if (isCommerce) {
            return {
                legal_docs: [],
                est_monthly_volume: '',
                payment_condition: '',
                decision_maker_role: '',
                store_focus: '',
                delivery_frequency: ''
            } as CommerceProfilingData;
        }
        return {
            specialty: '', sub_specialty: '', institution_type: '', positions: '',
            patients_per_day: '', patient_ses: '', age_group: '', top_pathologies: '',
            decision_criteria: [], adoption_profile: '', brand_loyalty: '', sample_usage: '',
            consultation_days: [], best_time: '', appointment_management: '', assistant_name: '',
            manual_classification: ''
        } as ProfilingData;
    } else if (scenario.type === 'development') {
        return { samples_used: '', flavor_acceptance: '', tolerance_observation: '' } as ValidationData;
    } else {
        return { anemia_handling: '', nutraceutical_opinion: '', competitor_comparison: '' } as MaintenanceData;
    }
}
