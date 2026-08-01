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
import { Calculator, Wallet, ArrowRightLeft, ArrowLeftRight, Store, Users, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

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

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
            {/* Header Financiero */}
            <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex flex-col gap-4 text-slate-100">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Selector de Canal y Droguería */}
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="bg-black/20 p-1 rounded-xl border border-white/10 shadow-inner">
                            <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as any)} className="justify-start">
                                <ToggleGroupItem value="transfer" className="data-[state=on]:bg-blue-500/80 data-[state=on]:text-white data-[state=on]:shadow-md hover:bg-white/10 text-slate-300 gap-2 px-4 rounded-lg transition-all">
                                    <ArrowRightLeft className="h-4 w-4" />
                                    <span className="text-xs font-semibold">Transferencia</span>
                                </ToggleGroupItem>
                                <ToggleGroupItem value="direct" className="data-[state=on]:bg-emerald-500/80 data-[state=on]:text-white data-[state=on]:shadow-md hover:bg-white/10 text-slate-300 gap-2 px-4 rounded-lg transition-all">
                                    <Store className="h-4 w-4" />
                                    <span className="text-xs font-semibold">Venta Directa</span>
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>

                        {/* Distributor Select - Only in Transfer Mode */}
                        <AnimatePresence>
                            {mode === 'transfer' && (
                                <motion.div 
                                    initial={{ opacity: 0, width: 0, marginLeft: -10 }}
                                    animate={{ opacity: 1, width: 'auto', marginLeft: 0 }}
                                    exit={{ opacity: 0, width: 0, marginLeft: -10 }}
                                    className="bg-black/20 rounded-xl border border-white/10 shadow-inner overflow-hidden"
                                >
                                    <Select value={selectedDrugstoreId} onValueChange={setSelectedDrugstoreId}>
                                        <SelectTrigger className="h-10 border-0 bg-transparent text-white focus:ring-0 focus:ring-offset-0 w-[200px]">
                                            <SelectValue placeholder="Seleccionar Droguería..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            {drugstores.map(d => (
                                                <SelectItem key={d.id} value={d.id} className="focus:bg-white/10">{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Tasa BCV Input */}
                    <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-xl border border-white/10 shadow-inner ml-auto">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasa BCV</span>
                        <div className="flex items-center">
                            <span className="text-slate-500 font-bold mr-1">Bs.</span>
                            <input
                                type="number"
                                value={exchangeRate}
                                onChange={handleExchangeRateChange}
                                className="w-16 text-right font-bold text-emerald-400 focus:outline-none border-b border-dashed border-emerald-500/50 focus:border-emerald-400 bg-transparent transition-colors"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* 1. Precios Comparativos */}
                <AnimatePresence mode="wait">
                    {mode === 'direct' ? (
                        <motion.div key="direct" variants={itemVariants} initial="hidden" animate="show" exit="hidden" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Competencia */}
                            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/10 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-8 -mt-8 z-0 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Mercado (Ref)
                                    </span>
                                    {competitorPrice > 0 ? (
                                        <>
                                            <div className="text-3xl font-black text-slate-500 line-through decoration-red-500/50 mt-2">
                                                ${competitorPrice.toFixed(2)}
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">Precio sugerido cadena</p>
                                        </>
                                    ) : (
                                        <div className="text-sm text-slate-500 mt-2">Sin referencia</div>
                                    )}
                                </div>
                            </div>

                            {/* Alpha BMT */}
                            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-bl-full -mr-8 -mt-8 z-0 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" /> Precio Alpha BMT
                                    </span>
                                    <div className="text-4xl font-black text-white mt-2 flex items-baseline gap-1 drop-shadow-sm">
                                        ${activeBasePrice.toFixed(2)}
                                        <span className="text-sm font-medium text-emerald-200/50">/unidad</span>
                                    </div>
                                    <p className="text-sm text-emerald-400 font-medium mt-1">Contado</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Modo Transferencia Header */
                        <motion.div key="transfer" variants={itemVariants} initial="hidden" animate="show" exit="hidden" className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-10 -mt-10 z-0 group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="space-y-1 relative z-10">
                                <span className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                    <ArrowRightLeft className="h-4 w-4" />
                                    {isWholesale
                                        ? "PRECIO DISTRIBUIDOR (MAYORISTA)"
                                        : `PRECIO TRANSFERENCIA (${drugstores.find(d => d.id === selectedDrugstoreId)?.name || 'DROGUERÍA'})`
                                    }
                                </span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-4xl font-black text-white tracking-tight drop-shadow-sm">
                                        {isWholesale
                                            ? `$${priceDistributor.toFixed(2)}`
                                            : `$${activeBasePrice.toFixed(2)}`
                                        }
                                    </span>
                                    <span className="text-sm font-medium text-blue-200/50">/unidad</span>
                                </div>
                            </div>
                            {/* Only show refresh button if NOT wholesale */}
                            {!isWholesale && (
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-blue-400 relative z-10 transition-transform hover:rotate-180 duration-500">
                                    <ArrowLeftRight className="h-5 w-5" />
                                </Button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-px bg-white/10 w-full rounded-full"></div>

                {/* 2. Zona de Pedido */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-slate-300 font-medium ml-1">Cantidad a Pedir</Label>
                            <div className="relative group">
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="pl-4 h-12 text-xl font-bold bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 rounded-xl transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 group-hover:text-slate-400 transition-colors">unidades</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discount" className="text-slate-300 font-medium ml-1">Descuento (%)</Label>
                            <Select
                                value={discount}
                                onValueChange={setDiscount}
                            >
                                <SelectTrigger id="discount" className="h-12 bg-black/20 border-white/10 text-white font-medium focus:ring-emerald-500/50 rounded-xl transition-all">
                                    <SelectValue placeholder="Seleccionar desct..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                    <SelectItem value="0" className="focus:bg-white/10 font-medium">0% - Precio Base</SelectItem>
                                    <SelectItem value="3" className="focus:bg-white/10 font-medium">3% - Volumen</SelectItem>
                                    <SelectItem value="5" className="focus:bg-white/10 font-medium">5% - Pronto Pago</SelectItem>
                                </SelectContent>
                            </Select>
                            {!isWholesale && <span className="text-xs text-slate-500 ml-1 block mt-1">* Se reinicia al cambiar de modo.</span>}
                        </div>

                        {/* Wholesale Safety Catch Toggle */}
                        {isWholesale && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm"
                            >
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="safety-catch"
                                        className="h-5 w-5 rounded border-amber-500/50 bg-black/20 text-amber-500 focus:ring-amber-500/50 focus:ring-offset-0"
                                        checked={requiresApproval}
                                        onChange={(e) => setRequiresApproval(e.target.checked)}
                                    />
                                    <Label htmlFor="safety-catch" className="text-sm font-bold text-amber-400 cursor-pointer flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Pedido Excede Límites
                                    </Label>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* 3. La Matemagia - Resultados */}
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex flex-col justify-center text-slate-100 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                        
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                            <span className="text-sm text-slate-400 font-medium">Subtotal</span>
                            <span className="font-bold text-slate-300 text-lg">${subtotal.toFixed(2)}</span>
                        </div>
                        
                        <AnimatePresence>
                            {discountPercent > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto', marginTop: '12px' }} 
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="flex justify-between items-center text-emerald-400 overflow-hidden"
                                >
                                    <span className="text-sm font-semibold flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" /> Descuento ({discountPercent}%)
                                    </span>
                                    <span className="font-black">-${discountAmount.toFixed(2)}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-4 mt-auto">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-lg font-black text-white">Total a Pagar</span>
                                <motion.span 
                                    key={totalUSD}
                                    initial={{ scale: 0.9, color: '#94a3b8' }}
                                    animate={{ scale: 1, color: '#ffffff' }}
                                    className="text-5xl font-black tracking-tighter drop-shadow-lg"
                                >
                                    ${totalUSD.toFixed(2)}
                                </motion.span>
                            </div>
                            <div className="flex justify-end">
                                <div className="text-right text-sm font-bold text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-inner inline-block">
                                    Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 4. EL AHORRO (Hero Metric) - Solo "Direct Mode" */}
                <AnimatePresence>
                    {mode === 'direct' && showComparison && totalSavingsUSD > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 rounded-2xl p-1 shadow-2xl shadow-emerald-500/20 mt-4 overflow-hidden"
                        >
                            <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-tr-full pointer-events-none"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-center gap-2 text-emerald-50 font-bold mb-2 uppercase tracking-widest text-sm drop-shadow-md">
                                        <Wallet className="h-5 w-5" />
                                        Ahorro Estimado Hoy
                                    </div>
                                    <div className="text-5xl md:text-6xl font-black text-white drop-shadow-xl tracking-tighter mb-3">
                                        ${totalSavingsUSD.toFixed(2)}
                                    </div>
                                    <div className="text-emerald-50 font-bold mt-1 text-sm bg-black/20 backdrop-blur-md inline-block px-4 py-1.5 rounded-xl border border-white/10 shadow-inner">
                                        ~ Bs. {totalSavingsBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 5. Footer Legal y Acciones */}
            <div className="bg-black/40 border-t border-white/5 px-8 py-5 flex flex-col gap-4 text-slate-100 backdrop-blur-md">
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
            </div>
        </motion.div>
    );
}
