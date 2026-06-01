import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ScanLine, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScan: (decodedText: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [hasCameraError, setHasCameraError] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!open) {
            stopScanning();
            return;
        }

        const startScanner = async () => {
            try {
                // Pequeño timeout para permitir que el modal renderice el DOM donde se inyectará la cámara
                setTimeout(async () => {
                    if (!document.getElementById("reader")) return;
                    
                    const html5QrCode = new Html5Qrcode("reader");
                    scannerRef.current = html5QrCode;

                    await html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 100 },
                            aspectRatio: 1.0,
                        },
                        (decodedText) => {
                            // Success callback
                            playSuccessSound();
                            onScan(decodedText);
                            stopScanning();
                        },
                        (errorMessage) => {
                            // Error callback (ignorado, es normal que no lea nada en cada frame)
                        }
                    );
                    setIsScanning(true);
                    setHasCameraError(false);
                }, 300);
            } catch (err) {
                console.error("Error starting camera", err);
                setHasCameraError(true);
                toast({
                    title: "Error de Cámara",
                    description: "Por favor permite el acceso a la cámara de tu dispositivo.",
                    variant: "destructive"
                });
            }
        };

        startScanner();

        return () => {
            stopScanning();
        };
    }, [open]);

    const stopScanning = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
            setIsScanning(false);
        }
    };

    const handleClose = () => {
        stopScanning();
        onOpenChange(false);
    };

    const playSuccessSound = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, context.currentTime); // Hz
            oscillator.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.5, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.start();
            oscillator.stop(context.currentTime + 0.1);
        } catch (e) {
            // Ignore if audio context not supported
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="max-w-md bg-card border-border/40 rounded-[2rem] shadow-premium-2xl p-0 overflow-hidden font-display">
                <DialogHeader className="p-6 border-b border-border/40 bg-muted/5">
                    <DialogTitle className="text-xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <ScanLine className="h-4 w-4 text-indigo-500" />
                        </div>
                        Escanear Código de Barras
                    </DialogTitle>
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                        Apunta la cámara al código de barras del producto (EAN/UPC)
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 bg-black relative min-h-[300px] flex items-center justify-center">
                    {hasCameraError ? (
                        <div className="text-center text-rose-500 space-y-4 p-4">
                            <X className="h-12 w-12 mx-auto opacity-50" />
                            <p className="font-bold text-sm">No se pudo acceder a la cámara</p>
                            <p className="text-xs text-rose-500/70">Revisa los permisos de tu navegador.</p>
                        </div>
                    ) : (
                        <>
                            <div id="reader" className="w-full h-full rounded-2xl overflow-hidden shadow-inner" />
                            {!isScanning && !hasCameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 text-white z-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Iniciando cámara...</span>
                                </div>
                            )}
                            {/* Overlay estético de la mira */}
                            {isScanning && (
                                <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
                                    <div className="w-[80%] h-[120px] border-2 border-indigo-500/50 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] relative">
                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-6 bg-muted/5 border-t border-border/40 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-border/40"
                    >
                        Cancelar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
