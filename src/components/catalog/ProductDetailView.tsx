/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Stethoscope, ShoppingBag, GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { catalogService } from "@/services/catalogService";
import { motion, AnimatePresence } from "framer-motion";
import { ClinicalShowcase, ProductAsset } from "./ClinicalShowcase";
import { CommercialCalculator } from "./CommercialCalculator";
import { StaffTrainer } from "./StaffTrainer";
import { getProductImageUrl } from "@/utils/productImages";

// Placeholder interface until we find the real one
export interface CommercialOffer {
    id: string;
    product_id: string;
    title: string;
    discount_percentage: number;
    min_quantity: number;
    active: boolean;
}

interface ProductDetailViewProps {
    productId: string;
    visitType?: 'doctor' | 'pharmacy' | 'default';
    onBack?: () => void;
}

export function ProductDetailView({ productId, visitType = 'default', onBack }: ProductDetailViewProps) {
    const { toast } = useToast();
    const [product, setProduct] = useState<any>(null);
    const [assets, setAssets] = useState<ProductAsset[]>([]);
    const [offers, setOffers] = useState<CommercialOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('clinical');

    // Determine default tab based on visit type
    const defaultTab = visitType === 'pharmacy' ? 'commercial' : 'clinical';

    useEffect(() => {
        setActiveTab(defaultTab);
        loadProductData();
    }, [productId, defaultTab]);

    const loadProductData = async () => {
        try {
            setLoading(true);

            // 1. Get Product Details
            const prodData = await catalogService.getProduct(productId);
            setProduct(prodData);

            // 2. Get Assets
            const assetData = await catalogService.getAssets(productId);
            setAssets(assetData as unknown as ProductAsset[]);

            // 3. Get Offers
            const offerData = await catalogService.getOffers(productId);
            setOffers(offerData as CommercialOffer[]);

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo cargar el producto", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-slate-950">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
                        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                    </div>
                </div>
                <p className="text-slate-400 font-medium animate-pulse">Cargando presentación...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-slate-950">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-2xl">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <p className="text-red-400 font-medium text-lg">Producto no encontrado</p>
                {onBack && (
                    <Button variant="outline" onClick={onBack} className="mt-4 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                )}
            </div>
        );
    }

    // Prepare product image as primary asset if available
    const resolvedImageUrl = getProductImageUrl(product.name, product.image_url);
    const productAssets: ProductAsset[] = assets.length > 0 ? assets : resolvedImageUrl ? [
        { id: 'main', type: 'image' as const, url: resolvedImageUrl, title: product.name, description: 'Presentación oficial de empaque' }
    ] : [];

    // Determine if product is pediatric
    const isPediatric = Boolean(product.is_pediatric) || /(pediátric|pediatric|infantil|kids|jarabe|suspensión|suspension|gotas)/i.test(product.name || '') || /(pediátric|pediatric|infantil|kids|jarabe|suspensión|suspension|gotas)/i.test(product.description || '');

    // Parse active ingredients if available
    const activeIngredients = product.active_ingredients
        ? (typeof product.active_ingredients === 'string'
            ? product.active_ingredients.split(',').map((s: string) => s.trim())
            : product.active_ingredients)
        : [];

    return (
        <div className="flex flex-col h-full bg-slate-950 overflow-hidden relative">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 flex flex-col h-full overflow-y-auto">
                {/* Clean Top Bar with Product Name */}
                <div className="flex items-center justify-between px-6 py-5 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 text-white sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onBack}
                                className="rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <div>
                            <h1 className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                {product.name}
                            </h1>
                        </div>
                    </div>
                    {product.category && (
                        <Badge className="bg-white/5 text-slate-200 border border-white/10 px-3 py-1 text-sm shadow-sm">
                            {product.category}
                        </Badge>
                    )}
                </div>

                {/* Premium Tab Navigation */}
                <div className="px-6 py-4 bg-slate-950/50 backdrop-blur-md border-b border-white/5 sticky top-[81px] z-20">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-7xl mx-auto">
                        <TabsList className="grid w-full grid-cols-3 max-w-lg h-14 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                            <TabsTrigger
                                value="clinical"
                                className="rounded-xl gap-2 text-sm font-semibold text-slate-400 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30 transition-all duration-300"
                            >
                                <Stethoscope className="h-4 w-4" />
                                Médica
                            </TabsTrigger>
                            <TabsTrigger
                                value="commercial"
                                className="rounded-xl gap-2 text-sm font-semibold text-slate-400 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30 transition-all duration-300"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Comercial
                            </TabsTrigger>
                            <TabsTrigger
                                value="training"
                                className="rounded-xl gap-2 text-sm font-semibold text-slate-400 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30 transition-all duration-300"
                            >
                                <GraduationCap className="h-4 w-4" />
                                Entrenamiento
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab Contents with Framer Motion */}
                        <div className="mt-8 relative min-h-[500px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'clinical' && (
                                    <motion.div
                                        key="clinical"
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                        transition={{ duration: 0.3 }}
                                    >
                            <ClinicalShowcase
                                productName={product.name}
                                description={product.description || "Producto farmacéutico de alta calidad"}
                                assets={productAssets}
                                composition={product.composition}
                                indications={product.indications}
                                dosage={product.dosage_instructions || product.dosage}
                                safetyInfo={product.safety_info || product.contraindications}
                                keyMessage={product.key_message || product.selling_points}
                                activeIngredients={product.active_ingredients || product.composition?.split(',')}
                                standardDose={product.standard_dose}
                                concentration={product.concentration}
                                isPediatric={isPediatric}
                            />
                                    </motion.div>
                                )}

                                {activeTab === 'commercial' && (
                                    <motion.div
                                        key="commercial"
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                        transition={{ duration: 0.3 }}
                                    >
                            <CommercialCalculator
                                        basePrice={product.base_price || 0}
                                        priceDronena={product.dronena_price || 0}
                                        competitorPrice={product.competitor_price || 0}
                                        productName={product.name}
                                        onSaveAgreement={(details) => console.log('Agreement Saved:', details)}
                                    />
                                    </motion.div>
                                )}

                                {activeTab === 'training' && (
                                    <motion.div
                                        key="training"
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                        transition={{ duration: 0.3 }}
                                    >
                            <StaffTrainer productName={product.name} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
