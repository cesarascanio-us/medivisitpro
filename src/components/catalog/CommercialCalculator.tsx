/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Wallet, ArrowRightLeft, ArrowLeftRight, Store, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CommercialCalculatorProps {
    basePrice: number;       // Precio Alpha (Contado)
    priceDronena?: number;   // Precio Transferencia
    competitorPrice?: number; // Precio Cobeca (Referencia)
    productName?: string;
    onSaveAgreement: (details: any) => void;
    // Wholesale Mode Prop
    isWholesale?: boolean;
    priceDistributor?: number;
    entityType?: string;
}

export function CommercialCalculator({
    basePrice,
    priceDronena = 0,
    competitorPrice = 0,
    productName,
    onSaveAgreement,
    isWholesale = false,
    priceDistributor = 0,
    entityType = 'pharmacy'
}: CommercialCalculatorProps) {
    // States
    const [mode, setMode] = useState<'transfer' | 'direct'>(
        entityType === 'doctor' || entityType === 'natural_store' ? 'direct' : 'transfer'
    );
    const [drugstores, setDrugstores] = useState<any[]>([]);
    const [selectedDrugstoreId, setSelectedDrugstoreId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [discount, setDiscount] = useState<string>('0');
    const [exchangeRate, setExchangeRate] = useState<number>(60.00); // Tasa Simulada

    // Safety Catch State for Wholesale
    const [requiresApproval, setRequiresApproval] = useState<boolean>(false);

    // Load Drugstores
    useEffect(() => {
        const loadDrugstores = async () => {
            const { data } = await supabase.from('drugstores').select('id, name').order('name');
            if (data) {
                setDrugstores(data);
                // Default to DRONENA if exists, otherwise first one
                const dronena = data.find(d => d.name.toUpperCase().includes('DRONENA'));
                if (dronena) setSelectedDrugstoreId(dronena.id);
                else if (data.length > 0) setSelectedDrugstoreId(data[0].id);
            }
        };
        loadDrugstores();
    }, []);

    // Derived Values
    const discountPercent = parseFloat(discount);

    // Determine active base price
    // If Direct: use basePrice
    // If Transfer:
    //    - If Distributor is Dronena -> use priceDronena (fallback basePrice)
    //    - If Distributor is Other -> use basePrice (Standard List Price)
    // If Wholesale: use priceDistributor
    const activeBasePrice = useMemo(() => {
        if (isWholesale) return priceDistributor || basePrice; // Use distributor price for wholesale

        if (mode === 'direct') return basePrice;

        const selectedDrugstore = drugstores.find(d => d.id === selectedDrugstoreId);
        const name = selectedDrugstore?.name.toUpperCase() || '';

        // Dronena Specific Price
        if (name.includes('DRONENA')) return priceDronena || basePrice;

        // Cobeca Specific Price (mapped to competitorPrice/marketRef)
        // If competitorPrice is 0, we fallback to basePrice to avoid showing Free
        if (name.includes('COBECA')) return competitorPrice || basePrice;

        return basePrice; // Fallback / Generic Distributor Price
    }, [mode, selectedDrugstoreId, drugstores, basePrice, priceDronena, competitorPrice, isWholesale, priceDistributor]);

    // 1. Total Calculation
    const subtotal = activeBasePrice * quantity;
    const discountAmount = subtotal * (discountPercent / 100);
    const totalUSD = subtotal - discountAmount;
    const totalBs = totalUSD * exchangeRate;
    const unitPriceFinal = totalUSD / quantity;

    // 2. Opportunity Cost (Competitor) & Savings
    // Only strictly relevant in Direct mode for comparison
    const showComparison = mode === 'direct' && competitorPrice > 0;
    const opportunityCostUSD = showComparison ? competitorPrice * quantity : 0;
    const totalSavingsUSD = showComparison ? (opportunityCostUSD - totalUSD) : 0;
    const totalSavingsBs = totalSavingsUSD * exchangeRate;

    // Discount Semaphore Logic
    const getDiscountStatus = (val: number) => {
        if (val === 0) return { color: "text-slate-600", bg: "bg-slate-100", label: "Precio Lista" };
        if (val <= 3) return { color: "text-emerald-600", bg: "bg-emerald-100", label: "Zona Segura", icon: CheckCircle2 };
        return { color: "text-orange-600", bg: "bg-orange-100", label: "Alto Volumen Requerido", icon: AlertTriangle };
    };
    const discountStatus = getDiscountStatus(discountPercent);

    // Handlers
    const handleExchangeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= 0) setExchangeRate(val);
    };

    return (
        <Card className="border-border bg-card shadow-md overflow-hidden animate-in fade-in duration-300">
            {/* Header Financiero */}
            <div className="bg-slate-50 px-4 py-3 border-b flex flex-col gap-3">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Selector de Canal y Droguería */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <div className="bg-muted p-1 rounded-lg border border-border shadow-sm">
                            <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as any)} className="justify-start">
                                <ToggleGroupItem value="transfer" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white gap-2 px-3">
                                    <ArrowRightLeft className="h-4 w-4" />
                                    <span className="text-xs font-semibold">Transferencia</span>
                                </ToggleGroupItem>
                                <ToggleGroupItem value="direct" className="data-[state=on]:bg-emerald-600 data-[state=on]:text-white gap-2 px-3">
                                    <Store className="h-4 w-4" />
                                    <span className="text-xs font-semibold">Venta Directa</span>
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>

                        {/* Distributor Select - Only in Transfer Mode */}
                        {mode === 'transfer' && (
                            <div className="bg-muted rounded-lg border border-border shadow-sm w-[180px]">
                                <Select value={selectedDrugstoreId} onValueChange={setSelectedDrugstoreId}>
                                    <SelectTrigger className="h-10 border-0 focus:ring-0">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {drugstores.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Tasa BCV Input */}
                    <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg border border-border shadow-sm ml-auto">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tasa BCV</span>
                        <div className="flex items-center">
                            <span className="text-slate-400 font-medium mr-1">Bs.</span>
                            <input
                                type="number"
                                value={exchangeRate}
                                onChange={handleExchangeRateChange}
                                className="w-16 text-right font-bold text-slate-800 focus:outline-none border-b border-dashed border-slate-300 focus:border-blue-500 bg-transparent"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <CardContent className="p-6 space-y-8">
                {/* 1. Precios Comparativos (Solo Visible en Modo Directo) */}
                {mode === 'direct' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-200">
                        {/* Competencia */}
                        <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                            <div className="relative z-10">
                                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Mercado (Ref)</span>
                                {competitorPrice > 0 ? (
                                    <>
                                        <div className="text-2xl font-bold text-slate-400 line-through decoration-red-400/50 mt-1">
                                            ${competitorPrice.toFixed(2)}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Precio sugerido cadena</p>
                                    </>
                                ) : (
                                    <div className="text-sm text-slate-400  mt-2">Sin referencia</div>
                                )}
                            </div>
                        </div>

                        {/* Alpha BMT */}
                        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col justify-between relative overflow-hidden ring-1 ring-emerald-500/20">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                            <div className="relative z-10">
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Precio Alpha BMT</span>
                                <div className="text-3xl font-extrabold text-slate-800 mt-1 flex items-baseline gap-1">
                                    ${activeBasePrice.toFixed(2)}
                                    <span className="text-xs font-normal text-slate-500">/unidad</span>
                                </div>
                                <p className="text-xs text-emerald-600 font-medium mt-1">Contado</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Modo Transferencia Header */
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-500">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                {isWholesale
                                    ? "PRECIO DISTRIBUIDOR (MAYORISTA)"
                                    : `PRECIO TRANSFERENCIA (${drugstores.find(d => d.id === selectedDrugstoreId)?.name || 'DROGUERÍA'})`
                                }
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {isWholesale
                                        ? `$${priceDistributor.toFixed(2)}`
                                        : `$${activeBasePrice.toFixed(2)}`
                                    }
                                </span>
                                <span className="text-sm font-medium text-slate-400">/unidad</span>
                            </div>
                        </div>
                        {/* Only show refresh button if NOT wholesale */}
                        {!isWholesale && (
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-card text-blue-600">
                                <ArrowLeftRight className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                )}

                <Separator />

                {/* 2. Zona de Pedido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-slate-600">Cantidad a Pedir</Label>
                            <div className="relative">
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="pl-4 h-11 text-lg font-semibold bg-muted border-border"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">unid.</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="discount" className="text-slate-600">Descuento (%)</Label>
                            </div>

                            <Select
                                value={discount}
                                onValueChange={setDiscount}
                            >
                                <SelectTrigger id="discount" className="h-11 bg-muted border-border text-foreground">
                                    <SelectValue placeholder="Seleccionar desct..." />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="0" className="text-slate-700">0% - Base</SelectItem>
                                    <SelectItem value="3" className="text-slate-700">3% - Volumen</SelectItem>
                                    <SelectItem value="5" className="text-slate-700">5% - Pronto Pago</SelectItem>
                                </SelectContent>
                            </Select>
                            {!isWholesale && <span className="text-xs text-slate-400">* El descuento se reinicia al cambiar de modo.</span>}
                        </div>

                        {/* Wholesale Safety Catch Toggle */}
                        {isWholesale && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="safety-catch"
                                        className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                                        checked={requiresApproval}
                                        onChange={(e) => setRequiresApproval(e.target.checked)}
                                    />
                                    <Label htmlFor="safety-catch" className="text-sm font-bold text-amber-800 cursor-pointer">
                                        ⚠️ Pedido Excede Límites
                                    </Label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. La Matemagia - Resultados */}
                    <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-center">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                            <span className="text-sm text-slate-600">Subtotal</span>
                            <span className="font-semibold text-slate-700">${subtotal.toFixed(2)}</span>
                        </div>
                        {discountPercent > 0 && (
                            <div className="flex justify-between items-center text-emerald-600">
                                <span className="text-sm font-medium">Descuento ({discountPercent}%)</span>
                                <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="pt-2">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-base font-bold text-slate-800">Total a Pagar</span>
                                <span className="text-3xl font-black text-slate-900 tracking-tight">${totalUSD.toFixed(2)}</span>
                            </div>
                            <div className="text-right text-sm text-slate-500 font-mono bg-card inline-block px-2 py-1 rounded border border-border float-right">
                                Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. EL AHORRO (Hero Metric) - Solo "Direct Mode" */}
                {mode === 'direct' && showComparison && totalSavingsUSD > 0 && (
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-1 shadow-lg shadow-emerald-200 mt-2 animate-in slide-in-from-bottom-2 fade-in duration-500">
                        <div className="bg-background/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                            <div className="flex items-center justify-center gap-2 text-emerald-50 font-medium mb-1 uppercase tracking-wide text-sm">
                                <Wallet className="h-4 w-4" />
                                Ahorro Estimado Hoy
                            </div>
                            <div className="text-4xl font-black text-white drop-shadow-sm">
                                ${totalSavingsUSD.toFixed(2)}
                            </div>
                            <div className="text-emerald-100 font-medium mt-1 text-sm bg-background/10 inline-block px-3 py-0.5 rounded-full">
                                ~ Bs. {totalSavingsBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* 5. Footer Legal */}
            {/* 5. Footer Legal y Acciones */}
            <CardFooter className="bg-slate-50 border-t px-6 py-3 flex flex-col gap-3">
                {onSaveAgreement && (
                    <Button
                        className={`w-full font-bold h-12 shadow-sm animate-in slide-in-from-bottom-2 ${isWholesale && requiresApproval
                            ? "bg-slate-700 hover:bg-slate-800 text-white"
                            : isWholesale
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                        onClick={() => {
                            const numericPrice = isWholesale ? (priceDronena || 0) : activeBasePrice;
                            const numericDiscount = parseInt(discount);
                            const finalPrice = numericPrice * (1 - numericDiscount / 100);
                            const totalUSD = finalPrice * quantity;

                            let notes = "";
                            if (isWholesale && requiresApproval) {
                                notes = "[REQUIERE APROBACIÓN GERENCIAL] ";
                            }

                            // LIGHT ONBOARDING for Doctors: If it's a doctor and we're in direct mode, 
                            // we might want to flag if RIF is missing, but we don't block here.
                            // The actual data collection will happen in handleSaveAgreement in VisitExecution.

                            onSaveAgreement({
                                productName,
                                quantity,
                                price: finalPrice,
                                discountPercent: numericDiscount,
                                totalUSD,
                                drugstoreName: isWholesale ? 'DIRECTO (MAYORISTA)' : (mode === 'direct' ? 'Venta Directa' : (drugstores.find(d => d.id === selectedDrugstoreId)?.name || 'N/A')),
                                notes: notes,
                                isDirectDoctorSale: entityType === 'doctor' && mode === 'direct'
                            });
                        }}
                    >
                        {isWholesale
                            ? (requiresApproval ? "⏳ Guardar como Pendiente de Aprobación" : "💾 Registrar Pedido Mayorista")
                            : "💾 Registrar Acuerdo"}
                    </Button>
                )}
                <p className="text-[10px] text-slate-400 text-center w-full">
                    * Cálculo referencial. Precios y tasas sujetos a cambio sin previo aviso.
                </p>
            </CardFooter>
        </Card >
    );
}
