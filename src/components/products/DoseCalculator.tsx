import { useState } from "react";
import { Calculator, Info, RefreshCw, Scale, User, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DoseCalculatorProps {
    productName?: string;
    defaultDosage?: string;
    activeIngredient?: string;
    onClose?: () => void;
}

export function DoseCalculator({ productName, defaultDosage, activeIngredient, onClose }: DoseCalculatorProps) {
    // Patient data
    const [weight, setWeight] = useState<number | ''>('');
    const [age, setAge] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [sex, setSex] = useState<'male' | 'female'>('male');

    // Dosage params
    const [dosePerKg, setDosePerKg] = useState<number | ''>('');
    const [frequency, setFrequency] = useState<string>('24');
    const [concentration, setConcentration] = useState<number | ''>(100);
    const [unit, setUnit] = useState<string>('mg');

    // Results
    const [calculatedDose, setCalculatedDose] = useState<{
        totalDose: number;
        dosePerTime: number;
        volume: number;
        bsa: number;
    } | null>(null);

    // Calculate Body Surface Area (BSA) using Mosteller formula
    const calculateBSA = (weightKg: number, heightCm: number): number => {
        return Math.sqrt((weightKg * heightCm) / 3600);
    };

    // Calculate dose
    const calculateDose = () => {
        if (!weight || !dosePerKg) return;

        const weightNum = Number(weight);
        const doseNum = Number(dosePerKg);
        const freqNum = Number(frequency);
        const concNum = Number(concentration) || 1;

        // Total daily dose
        const totalDose = doseNum * weightNum;

        // Dose per administration
        const timesPerDay = 24 / freqNum;
        const dosePerTime = totalDose / timesPerDay;

        // Volume if concentration provided
        const volume = dosePerTime / concNum;

        // BSA if height provided
        let bsa = 0;
        if (height && weightNum) {
            bsa = calculateBSA(weightNum, Number(height));
        }

        setCalculatedDose({
            totalDose: Math.round(totalDose * 100) / 100,
            dosePerTime: Math.round(dosePerTime * 100) / 100,
            volume: Math.round(volume * 100) / 100,
            bsa: Math.round(bsa * 100) / 100
        });
    };

    const reset = () => {
        setWeight('');
        setAge('');
        setHeight('');
        setDosePerKg('');
        setCalculatedDose(null);
    };

    // Age-based dose recommendation (Pediatric)
    const getAgeCategory = (ageYears: number) => {
        if (ageYears < 1) return { category: 'Neonato/Lactante', adjustment: '25-50% de la dosis adulta' };
        if (ageYears < 6) return { category: 'Preescolar', adjustment: '25-50% de la dosis adulta' };
        if (ageYears < 12) return { category: 'Escolar', adjustment: '50-75% de la dosis adulta' };
        if (ageYears < 18) return { category: 'Adolescente', adjustment: '75-100% de la dosis adulta' };
        if (ageYears >= 65) return { category: 'Adulto Mayor', adjustment: 'Considerar ajuste renal/hepático' };
        return { category: 'Adulto', adjustment: 'Dosis estándar' };
    };

    const ageInfo = age ? getAgeCategory(Number(age)) : null;

    return (
        <Card className="medical-card w-full max-w-2xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center">
                            <Calculator className="mr-2 h-5 w-5 text-primary" />
                            Calculadora de Dosis
                        </CardTitle>
                        <CardDescription>
                            {productName ? `Calcular dosis para: ${productName}` : 'Cálculo de dosificación personalizada'}
                        </CardDescription>
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Product Info */}
                {(productName || activeIngredient || defaultDosage) && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Información del Producto</AlertTitle>
                        <AlertDescription className="mt-2 space-y-1">
                            {productName && <p><strong>Producto:</strong> {productName}</p>}
                            {activeIngredient && <p><strong>Principio Activo:</strong> {activeIngredient}</p>}
                            {defaultDosage && <p><strong>Dosificación Sugerida:</strong> {defaultDosage}</p>}
                        </AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="weight" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="weight">Por Peso</TabsTrigger>
                        <TabsTrigger value="bsa">Por Superficie</TabsTrigger>
                        <TabsTrigger value="pediatric">Pediátrico</TabsTrigger>
                    </TabsList>

                    <TabsContent value="weight" className="space-y-4 mt-4">
                        {/* Patient Data */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight" className="flex items-center">
                                    <Scale className="h-4 w-4 mr-1" />
                                    Peso (kg)
                                </Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    placeholder="70"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age" className="flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    Edad (años)
                                </Label>
                                <Input
                                    id="age"
                                    type="number"
                                    placeholder="35"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height" className="flex items-center">
                                    <Ruler className="h-4 w-4 mr-1" />
                                    Altura (cm)
                                </Label>
                                <Input
                                    id="height"
                                    type="number"
                                    placeholder="170"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sexo</Label>
                                <Select value={sex} onValueChange={(v) => setSex(v as 'male' | 'female')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Masculino</SelectItem>
                                        <SelectItem value="female">Femenino</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        {/* Dosage Parameters */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dosePerKg">Dosis (mg/kg)</Label>
                                <Input
                                    id="dosePerKg"
                                    type="number"
                                    step="0.1"
                                    placeholder="5"
                                    value={dosePerKg}
                                    onChange={(e) => setDosePerKg(e.target.value ? Number(e.target.value) : '')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Frecuencia</Label>
                                <Select value={frequency} onValueChange={setFrequency}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6">Cada 6 horas</SelectItem>
                                        <SelectItem value="8">Cada 8 horas</SelectItem>
                                        <SelectItem value="12">Cada 12 horas</SelectItem>
                                        <SelectItem value="24">Cada 24 horas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="concentration">Concentración</Label>
                                <Input
                                    id="concentration"
                                    type="number"
                                    placeholder="100"
                                    value={concentration}
                                    onChange={(e) => setConcentration(e.target.value ? Number(e.target.value) : '')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Unidad</Label>
                                <Select value={unit} onValueChange={setUnit}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mg">mg/mL</SelectItem>
                                        <SelectItem value="mcg">mcg/mL</SelectItem>
                                        <SelectItem value="units">U/mL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button className="btn-medical flex-1" onClick={calculateDose} disabled={!weight || !dosePerKg}>
                                <Calculator className="mr-2 h-4 w-4" />
                                Calcular Dosis
                            </Button>
                            <Button variant="outline" onClick={reset}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Limpiar
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="bsa" className="space-y-4 mt-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Cálculo por Superficie Corporal</AlertTitle>
                            <AlertDescription>
                                Ingresa peso y altura para calcular la Superficie Corporal (BSA) usando la fórmula de Mosteller.
                                <br />
                                <strong>BSA (m²) = √(Peso × Altura / 3600)</strong>
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Peso (kg)</Label>
                                <Input
                                    type="number"
                                    placeholder="70"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Altura (cm)</Label>
                                <Input
                                    type="number"
                                    placeholder="170"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                                />
                            </div>
                        </div>

                        {weight && height && (
                            <div className="p-4 bg-primary/10 rounded-lg">
                                <p className="text-lg font-bold">
                                    BSA = {calculateBSA(Number(weight), Number(height)).toFixed(2)} m²
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Utiliza este valor para calcular dosis basadas en superficie corporal
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="pediatric" className="space-y-4 mt-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Dosificación Pediátrica</AlertTitle>
                            <AlertDescription>
                                La dosificación en pediatría se ajusta según el peso y la edad del paciente.
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Edad (años)</Label>
                                <Input
                                    type="number"
                                    placeholder="5"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Peso (kg)</Label>
                                <Input
                                    type="number"
                                    placeholder="20"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                                />
                            </div>
                        </div>

                        {ageInfo && (
                            <div className="p-4 bg-secondary/10 rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{ageInfo.category}</Badge>
                                </div>
                                <p className="text-sm"><strong>Recomendación:</strong> {ageInfo.adjustment}</p>
                            </div>
                        )}

                        {age && Number(age) < 12 && (
                            <Alert variant="default" className="border-yellow-500 bg-yellow-50">
                                <AlertTitle className="text-yellow-800">⚠️ Precaución</AlertTitle>
                                <AlertDescription className="text-yellow-700">
                                    La dosificación pediátrica requiere especial atención. Siempre verifique con fuentes oficiales y considere factores individuales del paciente.
                                </AlertDescription>
                            </Alert>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Results */}
                {calculatedDose && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                        <h4 className="font-semibold mb-4 flex items-center">
                            <Calculator className="mr-2 h-5 w-5" />
                            Resultados del Cálculo
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-background rounded-lg">
                                <p className="text-xs text-muted-foreground">Dosis Total Diaria</p>
                                <p className="text-xl font-bold text-primary">{calculatedDose.totalDose} {unit}</p>
                            </div>
                            <div className="p-3 bg-background rounded-lg">
                                <p className="text-xs text-muted-foreground">Dosis por Toma</p>
                                <p className="text-xl font-bold text-green-600">{calculatedDose.dosePerTime} {unit}</p>
                            </div>
                            <div className="p-3 bg-background rounded-lg">
                                <p className="text-xs text-muted-foreground">Volumen por Toma</p>
                                <p className="text-xl font-bold text-blue-600">{calculatedDose.volume} mL</p>
                            </div>
                            {calculatedDose.bsa > 0 && (
                                <div className="p-3 bg-background rounded-lg">
                                    <p className="text-xs text-muted-foreground">BSA</p>
                                    <p className="text-xl font-bold text-purple-600">{calculatedDose.bsa} m²</p>
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-4">
                            * Estos cálculos son orientativos. Siempre verifique la dosificación con fuentes oficiales antes de prescribir.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
