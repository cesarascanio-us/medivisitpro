import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ShoppingCart, Percent, Gift } from "lucide-react";

export interface CommercialOffer {
    id: string;
    title: string;
    min_quantity: number;
    bonus_quantity: number;
    discount_percentage: number;
    description?: string;
}

interface CommercialNegotiatorProps {
    basePrice: number;
    offers?: CommercialOffer[];
}

export function CommercialNegotiator({ basePrice, offers = [] }: CommercialNegotiatorProps) {
    const [quantity, setQuantity] = useState<number>(10);

    // Calcular la mejor oferta aplicable
    const activeOffer = useMemo(() => {
        // Ordenar ofertas por cantidad mínima descendente para encontrar la "mejor" que aplique
        const applicableOffers = offers
            .filter(o => quantity >= o.min_quantity)
            .sort((a, b) => b.min_quantity - a.min_quantity);

        return applicableOffers.length > 0 ? applicableOffers[0] : null;
    }, [quantity, offers]);

    // Cálculos
    const subtotal = quantity * basePrice;

    let discountAmount = 0;
    let totalUnits = quantity;
    let finalTotal = subtotal;

    if (activeOffer) {
        if (activeOffer.discount_percentage > 0) {
            discountAmount = subtotal * (activeOffer.discount_percentage / 100);
            finalTotal -= discountAmount;
        }
        if (activeOffer.bonus_quantity > 0) {
            // Ejemplo regla: bonus por cada X unidades o bonus fijo?
            // Asumiremos bonus fijo por alcanzar el tier o bonus proporcional?
            // Para "10+2", suele ser proporcional: floor(qty / 10) * 2
            // Simplificación: usaremos lógica proporcional si min_quantity > 0
            const packs = Math.floor(quantity / activeOffer.min_quantity);
            const bonusUnits = packs * activeOffer.bonus_quantity;
            totalUnits += bonusUnits;
        }
    }

    const realUnitCost = finalTotal / totalUnits;
    const margin = basePrice - realUnitCost; // Margen adicional vs precio lista
    const marginPercent = (margin / basePrice) * 100;

    return (
        <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                    <TrendingUp className="h-5 w-5" /> Simulador de Rentabilidad
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Label>Cantidad a Pedir (Unidades)</Label>
                        <div className="relative">
                            <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                                className="pl-9 bg-white text-lg font-semibold"
                            />
                        </div>
                    </div>
                    <div className="text-right pb-2">
                        <div className="text-sm text-slate-500">Precio Lista</div>
                        <div className="font-mono font-medium">${basePrice.toFixed(2)}</div>
                    </div>
                </div>

                {/* Offer Banner */}
                <div className="min-h-[60px]">
                    {activeOffer ? (
                        <div className="bg-emerald-100 border border-emerald-300 p-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                            {activeOffer.bonus_quantity > 0 ? <Gift className="h-5 w-5 text-emerald-600 mt-0.5" /> : <Percent className="h-5 w-5 text-emerald-600 mt-0.5" />}
                            <div>
                                <div className="font-bold text-emerald-800">{activeOffer.title}</div>
                                <div className="text-xs text-emerald-700">
                                    {activeOffer.description || "Oferta aplicada exitosamente"}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-400 text-center italic py-2 border border-dashed rounded-lg">
                            Aumenta la cantidad para desbloquear ofertas
                        </div>
                    )}
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="text-xs text-slate-500 mb-1">Costo Total</div>
                        <div className="text-xl font-bold text-slate-800">${finalTotal.toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="text-xs text-slate-500 mb-1">Unidades Totales</div>
                        <div className="text-xl font-bold text-slate-800">{totalUnits} u.</div>
                    </div>
                </div>

                {/* BIG GREEN ROI */}
                <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg shadow-emerald-200 text-center transform hover:scale-[1.02] transition-transform">
                    <div className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">Costo Real Unitario</div>
                    <div className="text-4xl font-extrabold flex items-center justify-center gap-1">
                        ${realUnitCost.toFixed(2)}
                        {marginPercent > 0 && (
                            <Badge variant="secondary" className="bg-emerald-400 text-emerald-900 ml-2 text-sm">
                                -{marginPercent.toFixed(0)}%
                            </Badge>
                        )}
                    </div>
                    {/* Profit Hint */}
                    <div className="mt-2 text-xs text-emerald-100/80 border-t border-emerald-500/50 pt-2">
                        Margen de ganancia adicional vs Lista: <strong>${margin.toFixed(2)} / unidad</strong>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-center pt-0 pb-4">
                <Button variant="link" className="text-xs text-emerald-700 h-auto p-0">
                    Ver tabla completa de descuentos
                </Button>
            </CardFooter>
        </Card>
    );
}
