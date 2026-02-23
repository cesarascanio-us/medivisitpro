/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from 'react';
import { Package, Sparkles, Plus, Check, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getProductsForSpecialty, getSpecialtyMatchScore } from '@/services/suggestionService';
import { supabase } from '@/integrations/supabase/client';

interface Product {
    id: string;
    name: string;
    therapeutic_area: string | null;
    category: string | null;
    description?: string;
    indications?: string;
}

interface ProductSuggestionsProps {
    specialty: string | null;
    doctorName?: string;
    onSelectProduct?: (product: Product) => void;
    selectedProducts?: string[];
    compact?: boolean;
}

export function ProductSuggestions({
    specialty,
    doctorName,
    onSelectProduct,
    selectedProducts = [],
    compact = false
}: ProductSuggestionsProps) {
    const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        loadProducts();
    }, [specialty]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            // Get specialty-matched products
            const matched = await getProductsForSpecialty(specialty);
            setSuggestedProducts(matched);

            // Get all active products
            const { data: products } = await (supabase as any)
                .from('products')
                .select('id, name, therapeutic_area, category, description, indications')
                .eq('is_active', true)
                .order('name');

            setAllProducts(products || []);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMatchScore = (product: Product) => {
        return getSpecialtyMatchScore(specialty, product.therapeutic_area);
    };

    const isSelected = (productId: string) => selectedProducts.includes(productId);

    const displayProducts = showAll ? allProducts : suggestedProducts;

    if (loading) {
        return (
            <Card className="medical-card">
                <CardContent className="p-6 text-center text-muted-foreground">
                    <div className="animate-pulse">
                        Buscando productos recomendados...
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="medical-card">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center text-lg">
                            <Sparkles className="mr-2 h-5 w-5 text-primary" />
                            Productos Sugeridos
                        </CardTitle>
                        <CardDescription>
                            {specialty
                                ? `Recomendados para ${specialty}`
                                : doctorName
                                    ? `Productos para ${doctorName}`
                                    : 'Productos disponibles'
                            }
                        </CardDescription>
                    </div>
                    {suggestedProducts.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? 'Ver sugeridos' : 'Ver todos'}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {displayProducts.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Package className="mx-auto h-10 w-10 mb-2 opacity-50" />
                        <p>No hay productos disponibles</p>
                    </div>
                ) : (
                    <ScrollArea className={compact ? "h-[200px]" : "h-[300px]"}>
                        <div className="space-y-2">
                            {displayProducts.map(product => {
                                const matchScore = getMatchScore(product);
                                const selected = isSelected(product.id);

                                return (
                                    <div
                                        key={product.id}
                                        className={`p-3 rounded-lg border transition-all cursor-pointer ${selected
                                                ? 'bg-primary/10 border-primary'
                                                : matchScore === 100
                                                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:bg-green-100'
                                                    : 'bg-muted/50 hover:bg-muted'
                                            }`}
                                        onClick={() => onSelectProduct?.(product)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-sm truncate">
                                                        {product.name}
                                                    </p>
                                                    {matchScore === 100 && !showAll && (
                                                        <Badge className="bg-green-500 text-white text-xs">
                                                            Match
                                                        </Badge>
                                                    )}
                                                    {selected && (
                                                        <Badge variant="secondary" className="bg-primary text-white">
                                                            <Check className="h-3 w-3 mr-1" />
                                                            Seleccionado
                                                        </Badge>
                                                    )}
                                                </div>
                                                {product.therapeutic_area && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {product.therapeutic_area}
                                                    </p>
                                                )}
                                                {product.indications && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {product.indications}
                                                    </p>
                                                )}
                                            </div>
                                            {onSelectProduct && (
                                                <Button
                                                    size="icon"
                                                    variant={selected ? "default" : "ghost"}
                                                    className="h-8 w-8 flex-shrink-0"
                                                >
                                                    {selected ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <Plus className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}

                {!showAll && suggestedProducts.length > 0 && allProducts.length > suggestedProducts.length && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                        Mostrando {suggestedProducts.length} de {allProducts.length} productos
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default ProductSuggestions;
