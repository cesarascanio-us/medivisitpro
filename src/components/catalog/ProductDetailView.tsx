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
import { ClinicalShowcase, ProductAsset } from "./ClinicalShowcase";
import { CommercialCalculator } from "./CommercialCalculator";
import { StaffTrainer } from "./StaffTrainer";

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
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-card">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                </div>
                <p className="text-slate-600 font-medium">Cargando presentación...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-card">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-600 font-medium">Producto no encontrado</p>
                {onBack && (
                    <Button variant="outline" onClick={onBack} className="mt-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                )}
            </div>
        );
    }

    // Prepare product image as primary asset if available
    const productAssets: ProductAsset[] = assets.length > 0 ? assets : product.image_url ? [
        { id: 'main', type: 'image' as const, url: product.image_url, title: product.name, description: 'Imagen principal del producto' }
    ] : [];

    // Parse active ingredients if available
    const activeIngredients = product.active_ingredients
        ? (typeof product.active_ingredients === 'string'
            ? product.active_ingredients.split(',').map((s: string) => s.trim())
            : product.active_ingredients)
        : [];

    return (
        <div className="flex flex-col h-full bg-card overflow-y-auto">
            {/* Clean Top Bar with Product Name */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="rounded-xl text-white hover:bg-background/20"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="font-bold text-xl">{product.name}</h1>
                        {product.active_ingredients && (
                            <p className="text-white/70 text-sm mt-0.5">{product.active_ingredients}</p>
                        )}
                    </div>
                </div>
                {product.category && (
                    <Badge className="bg-background/20 text-white border-0 text-sm">
                        {product.category}
                    </Badge>
                )}
            </div>

            {/* Premium Tab Navigation */}
            <div className="px-6 py-4 bg-slate-50 border-b text-slate-900">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-lg h-12 p-1 bg-card rounded-xl shadow-sm border">
                        <TabsTrigger
                            value="clinical"
                            className="rounded-lg gap-2 text-sm font-medium data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                            <Stethoscope className="h-4 w-4" />
                            Médica
                        </TabsTrigger>
                        <TabsTrigger
                            value="commercial"
                            className="rounded-lg gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Comercial
                        </TabsTrigger>
                        <TabsTrigger
                            value="training"
                            className="rounded-lg gap-2 text-sm font-medium data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                            <GraduationCap className="h-4 w-4" />
                            Entrenamiento
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Contents */}
                    <div className="mt-6">
                        <TabsContent value="clinical" className="mt-0 animate-in fade-in duration-200">
                            <ClinicalShowcase
                                productName={product.name}
                                description={product.description || "Producto farmacéutico de alta calidad"}
                                assets={productAssets}
                                composition={product.composition}
                                indications={product.indications}
                                dosage={product.dosage_instructions || product.dosage}
                                safetyInfo={product.safety_info || product.contraindications}
                                keyMessage={product.key_message || product.selling_points}
                                activeIngredients={activeIngredients}
                                standardDose={product.standard_dose || 15}
                                concentration={product.concentration || 20}
                            />
                        </TabsContent>

                        <TabsContent value="commercial" className="mt-0 animate-in fade-in duration-200">
                            <CommercialCalculator
                                basePrice={product.price || 0}
                                priceDronena={product.price_dronena || 0}
                                competitorPrice={product.price_cobeca || 0}
                                productName={product.name}
                            />
                        </TabsContent>

                        <TabsContent value="training" className="mt-0 animate-in fade-in duration-200">
                            <StaffTrainer productName={product.name} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
