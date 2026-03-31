/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import {
    Maximize2, Minimize2, ChevronLeft, ChevronRight,
    Package, X, FileText, CheckCircle, PenLine, Send, AlertTriangle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { deductSamplesFromInventory, checkSampleAvailability } from "@/services/inventoryService";

interface Product {
    id: string;
    name: string;
    description?: string;
    indications?: string;
    dosage?: string;
    active_ingredients?: string[];
    therapeutic_area?: string;
    contraindications?: string;
    side_effects?: string;
    presentation?: string;
    image_url?: string;
}

interface PresentationModeProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    visitId?: string;
    doctorName?: string;
    onComplete?: (data: {
        productsPresented: string[];
        notes: string;
        signature?: string;
        samplesGiven: { productId: string; quantity: number }[];
    }) => void;
}

export function PresentationMode({
    isOpen,
    onClose,
    products,
    visitId,
    doctorName,
    onComplete
}: PresentationModeProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [presentedProducts, setPresentedProducts] = useState<Set<string>>(new Set());
    const [samples, setSamples] = useState<Record<string, number>>({});
    const [notes, setNotes] = useState("");
    const [showSummary, setShowSummary] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [availabilityWarnings, setAvailabilityWarnings] = useState<Record<string, string>>({});

    const currentProduct = products[currentIndex];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                nextProduct();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevProduct();
            } else if (e.key === 'Escape') {
                if (isFullscreen) {
                    exitFullscreen();
                } else {
                    onClose();
                }
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, isFullscreen, products.length]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            exitFullscreen();
        }
    };

    const exitFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setIsFullscreen(false);
    };

    const nextProduct = () => {
        // Mark current as presented
        if (currentProduct) {
            setPresentedProducts(prev => new Set(prev).add(currentProduct.id));
        }

        if (currentIndex < products.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowSummary(true);
        }
    };

    const prevProduct = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const goToProduct = (index: number) => {
        setCurrentIndex(index);
        setShowSummary(false);
    };

    const updateSamples = (productId: string, quantity: number) => {
        setSamples(prev => ({
            ...prev,
            [productId]: Math.max(0, quantity)
        }));
        // Clear warning when quantity changes
        setAvailabilityWarnings(prev => {
            const { [productId]: _, ...rest } = prev;
            return rest;
        });
    };

    // Check availability when showing summary
    const checkAvailability = async () => {
        if (!user) return;

        const samplesToCheck = Object.entries(samples)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, quantity]) => ({ productId, quantity }));

        if (samplesToCheck.length === 0) return;

        const { available, details } = await checkSampleAvailability(user.id, samplesToCheck);

        const warnings: Record<string, string> = {};
        details.forEach(d => {
            if (d.available < d.requested) {
                warnings[d.productId] = `Solo ${d.available} disponibles (solicitados: ${d.requested})`;
            }
        });
        setAvailabilityWarnings(warnings);
    };

    // Check availability when entering summary
    useEffect(() => {
        if (showSummary) {
            checkAvailability();
        }
    }, [showSummary]);

    const handleComplete = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "No se pudo identificar al usuario",
                variant: "destructive"
            });
            return;
        }

        const samplesGiven = Object.entries(samples)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, quantity]) => ({ productId, quantity }));

        setIsProcessing(true);

        try {
            // Automatically deduct samples from inventory
            if (samplesGiven.length > 0) {
                const result = await deductSamplesFromInventory(user.id, samplesGiven, visitId);

                if (result.failed.length > 0) {
                    // Show warning for failed deductions
                    const failedNames = result.failed.map(f => {
                        const product = products.find(p => p.id === f.productId);
                        return product?.name || f.productId;
                    });

                    toast({
                        title: "Advertencia de Inventario",
                        description: `No se pudieron descontar algunas muestras: ${failedNames.join(', ')}. ${result.failed[0].reason}`,
                        variant: "destructive"
                    });
                }

                if (result.deducted.length > 0) {
                    toast({
                        title: "Inventario Actualizado",
                        description: `Se descontaron ${result.deducted.reduce((sum, d) => sum + d.quantity, 0)} muestras del inventario automáticamente.`,
                    });
                }
            }

            // Call onComplete callback
            onComplete?.({
                productsPresented: Array.from(presentedProducts),
                notes,
                samplesGiven
            });

            exitFullscreen();
            onClose();

        } catch (error) {
            console.error('Error completing presentation:', error);
            toast({
                title: "Error",
                description: "Ocurrió un error al finalizar la presentación",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        exitFullscreen();
        onClose();
    };

    if (!isOpen || products.length === 0) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className={`${isFullscreen ? 'max-w-full h-screen w-screen m-0 rounded-none' : 'max-w-5xl h-[90vh]'} p-0 overflow-hidden`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-primary/80 text-white">
                    <div>
                        <h2 className="text-xl font-bold">Modo Presentación</h2>
                        {doctorName && <p className="text-sm opacity-80">Presentando a: Dr. {doctorName}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                            {currentIndex + 1} / {products.length}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex w-full h-1 bg-gray-200">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className={`flex-1 transition-colors cursor-pointer ${presentedProducts.has(product.id)
                                ? 'bg-green-500'
                                : index === currentIndex
                                    ? 'bg-primary'
                                    : 'bg-gray-300'
                                }`}
                            onClick={() => goToProduct(index)}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {showSummary ? (
                        // Summary View
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="text-center mb-8">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold">Presentación Completada</h3>
                                <p className="text-muted-foreground">
                                    Se presentaron {presentedProducts.size} de {products.length} productos
                                </p>
                            </div>

                            {/* Products Summary */}
                            <div className="space-y-3">
                                <h4 className="font-semibold">Productos Presentados:</h4>
                                {products.map(product => (
                                    <div
                                        key={product.id}
                                        className={`p-3 rounded-lg border flex items-center justify-between ${presentedProducts.has(product.id) ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {presentedProducts.has(product.id) ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2" />
                                            )}
                                            <span>{product.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm">Muestras:</Label>
                                                <Input
                                                    type="number"
                                                    className={`w-20 ${availabilityWarnings[product.id] ? 'border-orange-400' : ''}`}
                                                    value={samples[product.id] || 0}
                                                    onChange={(e) => updateSamples(product.id, parseInt(e.target.value) || 0)}
                                                    min={0}
                                                />
                                            </div>
                                            {availabilityWarnings[product.id] && (
                                                <span className="text-xs text-orange-600 flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {availabilityWarnings[product.id]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <PenLine className="h-4 w-4" />
                                    Notas de la Presentación
                                </Label>
                                <Textarea
                                    placeholder="Observaciones, acuerdos, preguntas del médico..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setShowSummary(false)} className="flex-1" disabled={isProcessing}>
                                    Volver a Productos
                                </Button>
                                <Button
                                    className="btn-medical flex-1"
                                    onClick={handleComplete}
                                    disabled={isProcessing || Object.keys(availabilityWarnings).length > 0}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Finalizar Presentación
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : currentProduct ? (
                        // Product View
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                            {/* Product Image */}
                            <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
                                {currentProduct.image_url ? (
                                    <img
                                        src={currentProduct.image_url}
                                        alt={currentProduct.name}
                                        className="max-h-80 object-contain rounded-lg shadow-lg"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <Package className="h-32 w-32 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-400">Sin imagen disponible</p>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {currentProduct.therapeutic_area && (
                                            <Badge variant="secondary">{currentProduct.therapeutic_area}</Badge>
                                        )}
                                        {presentedProducts.has(currentProduct.id) && (
                                            <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Presentado</Badge>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-bold text-foreground">{currentProduct.name}</h2>
                                    {currentProduct.presentation && (
                                        <p className="text-lg text-muted-foreground mt-1">{currentProduct.presentation}</p>
                                    )}
                                </div>

                                {currentProduct.active_ingredients && currentProduct.active_ingredients.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">PRINCIPIOS ACTIVOS</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {currentProduct.active_ingredients.map((ing, i) => (
                                                <Badge key={i} variant="outline">{ing}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentProduct.indications && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">INDICACIONES</h4>
                                        <p className="text-foreground leading-relaxed">{currentProduct.indications}</p>
                                    </div>
                                )}

                                {currentProduct.dosage && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">DOSIFICACIÓN</h4>
                                        <p className="text-foreground leading-relaxed">{currentProduct.dosage}</p>
                                    </div>
                                )}

                                {currentProduct.contraindications && (
                                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                        <h4 className="font-semibold text-sm text-red-800 mb-2">⚠️ CONTRAINDICACIONES</h4>
                                        <p className="text-red-700 text-sm">{currentProduct.contraindications}</p>
                                    </div>
                                )}

                                {/* Samples Input */}
                                <div className="flex items-center gap-4 pt-4 border-t">
                                    <Label>Muestras a entregar:</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateSamples(currentProduct.id, (samples[currentProduct.id] || 0) - 1)}
                                        >
                                            -
                                        </Button>
                                        <Input
                                            type="number"
                                            className="w-20 text-center"
                                            value={samples[currentProduct.id] || 0}
                                            onChange={(e) => updateSamples(currentProduct.id, parseInt(e.target.value) || 0)}
                                            min={0}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateSamples(currentProduct.id, (samples[currentProduct.id] || 0) + 1)}
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Navigation Footer */}
                {!showSummary && (
                    <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                        <Button
                            variant="outline"
                            onClick={prevProduct}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Anterior
                        </Button>

                        {/* Product Thumbnails */}
                        <div className="flex gap-2 overflow-x-auto max-w-md">
                            {products.map((product, index) => (
                                <button
                                    key={product.id}
                                    onClick={() => goToProduct(index)}
                                    className={`w-12 h-12 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${index === currentIndex
                                        ? 'border-primary bg-primary/10'
                                        : presentedProducts.has(product.id)
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-xs font-medium">{index + 1}</span>
                                </button>
                            ))}
                        </div>

                        <Button
                            className="btn-medical"
                            onClick={nextProduct}
                        >
                            {currentIndex === products.length - 1 ? (
                                <>
                                    Finalizar
                                    <CheckCircle className="ml-2 h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Siguiente
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Keyboard Hints */}
                <div className="absolute bottom-4 left-4 text-xs text-muted-foreground space-x-4">
                    <span>← → Navegar</span>
                    <span>F Pantalla completa</span>
                    <span>ESC Salir</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
