import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Scale } from "lucide-react";

interface DosingCalculatorProps {
    productName: string;
    standardDoseMgPerKg: number; // Ej: 15mg/kg
    concentrationMgPerMl: number; // Ej: 100mg/5ml -> 20mg/ml
}

export function DosingCalculator({ productName, standardDoseMgPerKg = 10, concentrationMgPerMl = 20 }: DosingCalculatorProps) {
    const [weight, setWeight] = useState<number | "">("");

    // Cálculo
    // Dosis Total (mg) = Peso (kg) * Dosis (mg/kg)
    // Vol Total (ml) = Dosis Total (mg) / Concentración (mg/ml)

    const doseMg = typeof weight === 'number' ? weight * standardDoseMgPerKg : 0;
    const doseMl = doseMg > 0 ? (doseMg / concentrationMgPerMl).toFixed(1) : 0;

    return (
        <Card className="bg-slate-50 border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Calculator className="h-4 w-4" /> Calculadora de Dosis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Peso del Paciente (kg)</Label>
                    <div className="relative">
                        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="number"
                            placeholder="Ej: 25 kg"
                            className="pl-9 bg-white"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : "")}
                        />
                    </div>
                </div>

                {typeof weight === 'number' && weight > 0 && (
                    <div className="bg-blue-600 text-white p-4 rounded-lg text-center animate-in zoom-in-95 duration-200">
                        <div className="text-sm opacity-90 mb-1">Dosis Recomendada ({standardDoseMgPerKg} mg/kg)</div>
                        <div className="text-3xl font-bold">{doseMl} ml</div>
                        <div className="text-xs opacity-75 mt-1">por toma / {productName}</div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
