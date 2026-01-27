import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Stethoscope, ShoppingBag, GraduationCap, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { catalogService } from "@/services/catalogService";
import { ClinicalShowcase, ProductAsset } from "./ClinicalShowcase";
import { CommercialNegotiator, CommercialOffer } from "./CommercialNegotiator";
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                </div>
                <p className="text-slate-500 font-medium">Cargando presentación...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-500 font-medium">Producto no encontrado</p>
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
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 min-h-screen">
            {/* Premium Top Bar */}
            <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="rounded-xl hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="font-bold text-xl text-slate-800">{product.name}</h1>
                        {product.category && (
                            <Badge variant="secondary" className="mt-1 bg-emerald-100 text-emerald-700 border-0">
                                {product.category}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Tabs - Premium Style */}
            <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    {/* Premium Tab List */}
                    <TabsList className="grid w-full grid-cols-3 lg:w-[480px] h-14 p-1.5 bg-slate-100/80 rounded-xl">
                        <TabsTrigger
                            value="clinical"
                            className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 transition-all"
                        >
                            <Stethoscope className="h-4 w-4" />
                            <span className="hidden sm:inline">Médica</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="commercial"
                            className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 transition-all"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            <span className="hidden sm:inline">Comercial</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="training"
                            className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-700 transition-all"
                        >
                            <GraduationCap className="h-4 w-4" />
                            <span className="hidden sm:inline">Entrenamiento</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="clinical" className="animate-in fade-in slide-in-from-left-4 duration-300 mt-6">
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

                    <TabsContent value="commercial" className="animate-in fade-in slide-in-from-right-4 duration-300 mt-6">
                        <CommercialNegotiator
                            basePrice={product.price || 100}
                            offers={offers.length > 0 ? offers : [
                                // Fallback mock
                                { id: '1', title: 'Pack Lanzamiento 10+3', min_quantity: 10, bonus_quantity: 3, discount_percentage: 0, description: 'Compra 10 y lleva 3 bonificadas' },
                                { id: '2', title: 'Descuento Volumétrico', min_quantity: 50, bonus_quantity: 0, discount_percentage: 15, description: '15% Off por caja cerrada' }
                            ]}
                        />
                    </TabsContent>

                    <TabsContent value="training" className="animate-in fade-in zoom-in-95 duration-300 mt-6">
                        <StaffTrainer />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
