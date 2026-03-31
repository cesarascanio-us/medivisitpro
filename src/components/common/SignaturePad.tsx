/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useRef, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eraser, Check, PenTool } from "lucide-react";

export interface SignaturePadRef {
    getDataUrl: () => string | null;
    isEmpty: () => boolean;
    clear: () => void;
}

interface SignaturePadProps {
    title?: string;
    subtitle?: string;
    required?: boolean;
    onSave?: (dataUrl: string) => void;
    width?: number;
    height?: number;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
    ({ title = "Firma del Receptor", subtitle, required = false, onSave, width = 400, height = 200 }, ref) => {
        const sigCanvas = useRef<SignatureCanvas>(null);

        useImperativeHandle(ref, () => ({
            getDataUrl: () => {
                if (sigCanvas.current?.isEmpty()) return null;
                return sigCanvas.current?.toDataURL("image/png") || null;
            },
            isEmpty: () => sigCanvas.current?.isEmpty() ?? true,
            clear: () => sigCanvas.current?.clear()
        }));

        const handleClear = () => {
            sigCanvas.current?.clear();
        };

        const handleSave = () => {
            if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
                const dataUrl = sigCanvas.current.toDataURL("image/png");
                onSave?.(dataUrl);
            }
        };

        return (
            <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <PenTool className="h-5 w-5 text-primary" />
                        {title}
                        {required && <span className="text-red-500">*</span>}
                    </CardTitle>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </CardHeader>
                <CardContent className="space-y-3">
                    <div
                        className="border-2 border-gray-300 rounded-lg bg-white touch-none"
                        style={{ width: "100%", maxWidth: width }}
                    >
                        <SignatureCanvas
                            ref={sigCanvas}
                            penColor="black"
                            canvasProps={{
                                width: width,
                                height: height,
                                className: "rounded-lg w-full",
                                style: {
                                    touchAction: "none",
                                    width: "100%",
                                    height: height
                                }
                            }}
                            dotSize={2}
                            minWidth={1}
                            maxWidth={3}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                            className="flex-1"
                        >
                            <Eraser className="h-4 w-4 mr-2" />
                            Limpiar
                        </Button>
                        {onSave && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSave}
                                className="flex-1 btn-medical"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Confirmar Firma
                            </Button>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        Firme con el dedo o mouse en el recuadro superior
                    </p>
                </CardContent>
            </Card>
        );
    }
);

SignaturePad.displayName = "SignaturePad";

// Helper function to convert data URL to Blob for upload
export function dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
