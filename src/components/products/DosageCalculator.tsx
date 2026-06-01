import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface DosageCalculatorProps {
  productName: string;
}

export function DosageCalculator({ productName }: DosageCalculatorProps) {
  const [weight, setWeight] = useState<string>('');

  // Default formulas
  let formulaAvailable = false;
  let activeIngredient = '';
  let maxDoseMg = Infinity;
  let mgPerKg = 0;
  let mgPerMl = 0;
  let portionMl = 0;

  const nameUpper = productName.toUpperCase();

  if (nameUpper.includes('ZINCOSOL')) {
    formulaAvailable = true;
    activeIngredient = 'Zinc';
    mgPerKg = 1;
    maxDoseMg = 20;
    mgPerMl = 2;
    portionMl = 7.5;
  } else if (nameUpper.includes('FERYFOL')) {
    formulaAvailable = true;
    activeIngredient = 'Hierro';
    mgPerKg = 3;
    maxDoseMg = 60;
    mgPerMl = 1.8;
    portionMl = 10;
  } else if (nameUpper.includes('CALZINC') || nameUpper.includes('CALZINC D')) {
    formulaAvailable = true;
    activeIngredient = 'Calcio';
    mgPerKg = 30;
    maxDoseMg = 1000;
    mgPerMl = 17.5;
    portionMl = 10;
  }

  if (!formulaAvailable) {
    return (
      <Card className="border-indigo-100 bg-indigo-50/50 mt-6 rounded-[2rem] overflow-hidden">
        <div className="bg-indigo-100/50 px-6 py-4 flex items-center gap-3 border-b border-indigo-100">
          <Calculator className="h-5 w-5 text-indigo-600" />
          <h3 className="font-black text-indigo-900 uppercase tracking-tighter">Calculadora de Dosis</h3>
        </div>
        <CardContent className="p-6 text-center">
          <p className="text-sm font-bold text-muted-foreground">La calculadora automatizada no está disponible para este producto específico.</p>
        </CardContent>
      </Card>
    );
  }

  const weightNum = parseFloat(weight);
  const isValidWeight = !isNaN(weightNum) && weightNum > 0;

  // Calculations
  const calculatedMg = isValidWeight ? weightNum * mgPerKg : 0;
  const isCapped = calculatedMg > maxDoseMg;
  const totalMg = isCapped ? maxDoseMg : calculatedMg;
  
  const volumeMl = totalMg / mgPerMl;
  const portions = volumeMl / portionMl;

  return (
    <Card className="border-indigo-100 bg-white mt-6 rounded-[2rem] overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 flex items-center justify-between border-b border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-black text-indigo-900 uppercase tracking-tighter text-lg">Posología Pediátrica</h3>
        </div>
        <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-200">
          {productName}
        </Badge>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Peso del Paciente (KG)</Label>
          <div className="relative">
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ej. 15"
              className="h-16 text-2xl font-black text-center rounded-2xl border-indigo-200 focus:border-indigo-500 transition-colors bg-slate-50"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black">kg</div>
          </div>
        </div>

        {isValidWeight && (
          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100/50">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Volumen Diario</p>
                <p className="text-2xl font-black text-indigo-600">{volumeMl.toFixed(1)} <span className="text-sm">mL</span></p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100/50">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Porciones ({portionMl} mL)</p>
                <p className="text-2xl font-black text-indigo-600">{portions.toFixed(1)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-indigo-100">
              <Info className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
              <div className="text-xs font-medium text-slate-600 space-y-1">
                <p>Cálculo basado en <strong>{mgPerKg} mg de {activeIngredient} por kg/día</strong>.</p>
                {isCapped && (
                  <p className="text-amber-600 font-bold flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> Tope máximo alcanzado ({maxDoseMg} mg/día)
                  </p>
                )}
                {nameUpper.includes('FERYFOL') && (
                  <p className="mt-2 text-indigo-600 font-semibold">• Tomar entre comidas con un sorbo de zumo de naranja.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
