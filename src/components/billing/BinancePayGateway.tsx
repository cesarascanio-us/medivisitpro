/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Loader2, CreditCard, Wallet, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BinancePayGatewayProps {
    orderData: {
        qrContent: string;
        checkoutUrl: string;
        prepayId: string;
        expireTime: number;
        amount: number;
        currency: string;
    };
    onSuccess: () => void;
    onCancel: () => void;
}

export const BinancePayGateway: React.FC<BinancePayGatewayProps> = ({ orderData, onSuccess, onCancel }) => {
    const { toast } = useToast();
    const [status, setStatus] = useState<'pending' | 'success' | 'expired'>('pending');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default

    useEffect(() => {
        // 1. Timer logic
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setStatus('expired');
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // 2. Polling for payment status
        const pollInterval = setInterval(async () => {
            if (status !== 'pending') return;

            const { data, error } = await supabase.functions.invoke('check-binance-status', {
                body: { prepayId: orderData.prepayId }
            });

            if (data?.status === 'PAID') {
                setStatus('success');
                clearInterval(pollInterval);
                clearInterval(timer);
                setTimeout(onSuccess, 2000);
                toast({
                    title: "¡Pago Confirmado!",
                    description: "Tu suscripción ha sido activada exitosamente con Binance Pay.",
                });
            }
        }, 5000);

        return () => {
            clearInterval(timer);
            clearInterval(pollInterval);
        };
    }, [status]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado", description: "Enlace copiado al portapapeles." });
    };

    if (status === 'success') {
        return (
            <Card className="max-w-md mx-auto border-emerald-500/50 bg-emerald-500/5">
                <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">¡Pago Exitoso!</h2>
                    <p className="text-slate-400">Estamos activando tu cuenta. Redirigiendo...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-md mx-auto border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <CardHeader className="bg-slate-800/50 border-b border-slate-700">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-yellow-500" />
                        Binance Pay
                    </CardTitle>
                    <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                        <span className="text-xs font-bold text-yellow-500 animate-pulse">
                            EXPIRA EN {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
                <CardDescription>Escanea el código QR con tu App de Binance</CardDescription>
            </CardHeader>

            <CardContent className="pt-8 pb-8 flex flex-col items-center">
                {/* QR Code */}
                <div className="p-4 bg-white rounded-3xl mb-6 shadow-xl relative group">
                    {status === 'expired' && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 p-4">
                            <span className="text-slate-900 font-bold mb-2">Enlace Expirado</span>
                            <Button size="sm" onClick={() => window.location.reload()} variant="outline" className="border-slate-300">
                                Reintentar
                            </Button>
                        </div>
                    )}
                    <QRCodeSVG value={orderData.qrContent} size={200} level="H" includeMargin={true} />
                </div>

                {/* Amount Section */}
                <div className="text-center mb-8">
                    <p className="text-sm text-slate-500 mb-1">Total a pagar:</p>
                    <p className="text-4xl font-bold text-white">
                        {orderData.amount} <span className="text-sm text-yellow-500">{orderData.currency}</span>
                    </p>
                </div>

                {/* Buttons */}
                <div className="w-full flex flex-col gap-3">
                    <Button
                        onClick={() => window.open(orderData.checkoutUrl, '_blank')}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12"
                    >
                        Abrir en Binance <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => copyToClipboard(orderData.checkoutUrl)}
                        className="w-full border-slate-700 hover:bg-slate-800 text-slate-300"
                    >
                        Copiar Enlace <Copy className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </CardContent>

            <CardFooter className="bg-slate-800/30 border-t border-slate-700 p-4 text-center">
                <p className="text-[10px] text-slate-500 w-full uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3 h-3" /> Transacción Segura vía Binance Checkout
                </p>
            </CardFooter>
        </Card>
    );
};
