/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
    drogueria_id: string;
    nombre_drogueria: string;
    tipo_drogueria: string;
    precio_venta_farmacia: number;
    cantidad: number;
    semaforo_stock: 'Alto' | 'Bajo' | 'Agotado';
    ranking_opcion: number;
}

interface OrderSuggestionWidgetProps {
    productId: string;
    onSelectDrogueria?: (drogueriaId: string, price: number) => void;
}

export function OrderSuggestionWidget({ productId, onSelectDrogueria }: OrderSuggestionWidgetProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (productId) {
            loadSuggestions();
        }
    }, [productId]);

    const loadSuggestions = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await (supabase as any)
                .from('view_opciones_abastecimiento')
                .select('*')
                .eq('producto_id', productId)
                .gt('cantidad', 0) // Hide out of stock as per requirement
                .order('precio_venta_farmacia', { ascending: true });

            if (error) throw error;

            setSuggestions(data as any[]); // Type casting until types are generated
        } catch (err: any) {
            console.error("Error fetching suggestions:", err);
            setError("No se pudieron cargar las sugerencias.");
        } finally {
            setLoading(false);
        }
    };

    if (!productId) return null;

    if (loading) {
        return <div className="flex items-center justify-center p-4 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Buscando mejores precios...</div>;
    }

    if (error) {
        return <div className="text-destructive text-sm p-2">{error}</div>;
    }

    if (suggestions.length === 0) {
        return (
            <Card className="bg-muted/50 border-dashed">
                <CardContent className="py-6 text-center text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay disponibilidad en droguerías registradas.</p>
                </CardContent>
            </Card>
        );
    }

    // Find the best price (first one since we ordered by price)
    const bestPrice = suggestions[0]?.precio_venta_farmacia;

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    Opciones de Abastecimiento Inteligente
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[200px] p-4 pt-0">
                    <div className="space-y-3">
                        {suggestions.map((option, index) => {
                            const isBestOption = option.precio_venta_farmacia === bestPrice;

                            return (
                                <div
                                    key={option.drogueria_id}
                                    className={cn(
                                        "flex flex-col p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent/50",
                                        isBestOption ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800" : "bg-card"
                                    )}
                                    onClick={() => onSelectDrogueria?.(option.drogueria_id, option.precio_venta_farmacia)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{option.nombre_drogueria}</span>
                                            {isBestOption && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] h-5 px-1.5 flex items-center gap-0.5 border-green-200">
                                                    <CheckCircle2 className="h-3 w-3" /> Mejor Precio
                                                </Badge>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "font-bold font-mono",
                                            isBestOption ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                                        )}>
                                            ${option.precio_venta_farmacia.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>{option.tipo_drogueria}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span>Stock:</span>
                                            <span className={cn(
                                                "font-medium",
                                                option.semaforo_stock === 'Alto' ? "text-green-500" :
                                                    option.semaforo_stock === 'Bajo' ? "text-orange-500" : "text-destructive"
                                            )}>
                                                {option.semaforo_stock} ({option.cantidad})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
