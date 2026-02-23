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
import { Stethoscope, AlertCircle } from "lucide-react";

export interface ClinicalInterviewData {
    patients_per_week: number | null;
    current_prescription_habit: string;
    main_objection: string;
    commitment_level: string;
}

interface ClinicalInterviewProps {
    data: ClinicalInterviewData;
    onChange: (data: ClinicalInterviewData) => void;
    errors?: string[];
}

const PRESCRIPTION_HABITS = [
    { value: 'our_product', label: 'Nuestro Producto' },
    { value: 'competitor_a', label: 'Competencia A' },
    { value: 'competitor_b', label: 'Competencia B' },
    { value: 'generic', label: 'Genérico' },
    { value: 'none', label: 'No receta en esta categoría' }
];

const OBJECTIONS = [
    { value: 'price', label: 'Precio' },
    { value: 'efficacy', label: 'Eficacia' },
    { value: 'adherence', label: 'Adherencia del Paciente' },
    { value: 'safety', label: 'Seguridad / Efectos Secundarios' },
    { value: 'availability', label: 'Disponibilidad en Farmacias' },
    { value: 'none', label: 'Sin Objeciones' }
];

const COMMITMENT_LEVELS = [
    { value: 'start_treatment', label: '✅ Iniciará Tratamiento' },
    { value: 'maintenance', label: '🔄 Mantenimiento (ya receta)' },
    { value: 'consider', label: '🤔 Lo considerará' },
    { value: 'rejection', label: '❌ Rechazo' }
];

export function ClinicalInterview({ data, onChange, errors = [] }: ClinicalInterviewProps) {
    const updateField = <K extends keyof ClinicalInterviewData>(
        field: K,
        value: ClinicalInterviewData[K]
    ) => {
        onChange({ ...data, [field]: value });
    };

    const hasErrors = errors.length > 0;

    return (
        <Card className={`border-2 ${hasErrors ? 'border-red-300 bg-red-50/50' : 'border-purple-200 bg-purple-50/30'}`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Stethoscope className="h-5 w-5 text-purple-600" />
                    </div>
                    Entrevista Clínica
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

                {/* Pacientes por Semana */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Pacientes/Semana en esta patología <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="number"
                        min={0}
                        max={500}
                        placeholder="Ej: 25"
                        value={data.patients_per_week ?? ''}
                        onChange={(e) => updateField('patients_per_week', e.target.value ? parseInt(e.target.value) : null)}
                        className={`bg-white ${!data.patients_per_week && hasErrors ? 'border-red-300' : ''}`}
                    />
                </div>

                {/* Hábito de Prescripción */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Hábito de Prescripción Actual <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={data.current_prescription_habit}
                        onValueChange={(v) => updateField('current_prescription_habit', v)}
                    >
                        <SelectTrigger className={`bg-white ${!data.current_prescription_habit && hasErrors ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder="¿Qué receta actualmente?" />
                        </SelectTrigger>
                        <SelectContent>
                            {PRESCRIPTION_HABITS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Principal Objeción */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Principal Objeción/Dolor <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={data.main_objection}
                        onValueChange={(v) => updateField('main_objection', v)}
                    >
                        <SelectTrigger className={`bg-white ${!data.main_objection && hasErrors ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder="¿Cuál es su principal barrera?" />
                        </SelectTrigger>
                        <SelectContent>
                            {OBJECTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Nivel de Compromiso */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Nivel de Compromiso <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={data.commitment_level}
                        onValueChange={(v) => updateField('commitment_level', v)}
                    >
                        <SelectTrigger className={`bg-white ${!data.commitment_level && hasErrors ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder="¿Qué compromiso obtuvo?" />
                        </SelectTrigger>
                        <SelectContent>
                            {COMMITMENT_LEVELS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}

// Función de validación
export function validateClinicalInterview(data: ClinicalInterviewData): string[] {
    const errors: string[] = [];
    if (!data.patients_per_week && data.patients_per_week !== 0) errors.push('patients_per_week');
    if (!data.current_prescription_habit) errors.push('current_prescription_habit');
    if (!data.main_objection) errors.push('main_objection');
    if (!data.commitment_level) errors.push('commitment_level');
    return errors;
}

// Defaults
export const emptyClinicalInterview: ClinicalInterviewData = {
    patients_per_week: null,
    current_prescription_habit: '',
    main_objection: '',
    commitment_level: ''
};
