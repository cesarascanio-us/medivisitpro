import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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

    // Determine default tab based on visit type
    const defaultTab = visitType === 'pharmacy' ? 'commercial' : 'clinical';

    useEffect(() => {
        loadProductData();
    }, [productId]);

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



    if (loading) return <div className="p-10 text-center animate-pulse">Cargando catálogo...</div>;
    if (!product) return <div className="p-10 text-center text-red-500">Producto no encontrado</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50/50 min-h-screen">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <h1 className="font-bold text-xl text-slate-800">{product.name}</h1>
                </div>

            </div>

            {/* Content Tabs */}
            <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-1">
                <Tabs defaultValue={defaultTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="clinical">Médica</TabsTrigger>
                        <TabsTrigger value="commercial">Comercial</TabsTrigger>
                        <TabsTrigger value="training">Entrenamiento</TabsTrigger>
                    </TabsList>

                    <TabsContent value="clinical" className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <ClinicalShowcase
                            productName={product.name}
                            description={product.description || "Sin descripción"}
                            assets={assets.length > 0 ? assets : [
                                // Fallback mock 
                                { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop', title: 'Box Shot' },
                                { id: '2', type: 'image', url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop', title: 'Mecanismo de Acción' }
                            ]}
                            standardDose={15} // Mock data si no está en BD
                            concentration={20}
                        />
                    </TabsContent>

                    <TabsContent value="commercial" className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CommercialNegotiator
                            basePrice={product.price || 100}
                            offers={offers.length > 0 ? offers : [
                                // Fallback mock
                                { id: '1', title: 'Pack Lanzamiento 10+3', min_quantity: 10, bonus_quantity: 3, discount_percentage: 0, description: 'Compra 10 y lleva 3 bonificadas' },
                                { id: '2', title: 'Descuento Volumétrico', min_quantity: 50, bonus_quantity: 0, discount_percentage: 15, description: '15% Off por caja cerrada' }
                            ]}
                        />
                    </TabsContent>

                    <TabsContent value="training" className="animate-in fade-in zoom-in-95 duration-300">
                        <StaffTrainer />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
