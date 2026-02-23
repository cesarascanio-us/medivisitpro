/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { forwardRef, useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { cn } from '@/lib/utils';

interface VoiceInputProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onValueChange: (value: string) => void;
    label?: string;
}

/**
 * VoiceInput - A Textarea with integrated voice-to-text capability
 * Features a floating microphone button that pulses red when recording
 */
export const VoiceInput = forwardRef<HTMLTextAreaElement, VoiceInputProps>(
    ({ value, onValueChange, label, className, placeholder, ...props }, ref) => {
        const [localError, setLocalError] = useState<string | null>(null);

        const {
            isListening,
            isSupported,
            transcript,
            error,
            startListening,
            stopListening,
            resetTranscript,
        } = useSpeechToText({
            lang: 'es-VE',
            continuous: true,
            interimResults: true,
        });

        // Append transcript to value when it changes
        useEffect(() => {
            if (transcript) {
                const newValue = value ? `${value} ${transcript}` : transcript;
                onValueChange(newValue.trim());
                resetTranscript();
            }
        }, [transcript, value, onValueChange, resetTranscript]);

        // Handle errors
        useEffect(() => {
            if (error) {
                setLocalError(error);
                // Auto-clear error after 3 seconds
                const timer = setTimeout(() => setLocalError(null), 3000);
                return () => clearTimeout(timer);
            }
        }, [error]);

        const toggleListening = () => {
            if (isListening) {
                stopListening();
            } else {
                setLocalError(null);
                startListening();
            }
        };

        return (
            <div className="space-y-2">
                {label && (
                    <label className="text-sm font-medium text-slate-700">{label}</label>
                )}
                <div className="relative">
                    <Textarea
                        ref={ref}
                        value={value}
                        onChange={(e) => onValueChange(e.target.value)}
                        placeholder={placeholder}
                        className={cn(
                            'pr-12 min-h-[80px] resize-none',
                            isListening && 'ring-2 ring-red-400 border-red-400',
                            className
                        )}
                        {...props}
                    />

                    {/* Floating Mic Button */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleListening}
                        disabled={!isSupported}
                        className={cn(
                            'absolute right-2 top-2 h-8 w-8 rounded-full transition-all',
                            isListening
                                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                            !isSupported && 'opacity-50 cursor-not-allowed'
                        )}
                        title={
                            !isSupported
                                ? 'Tu navegador no soporta dictado por voz'
                                : isListening
                                    ? 'Detener grabación'
                                    : 'Iniciar dictado por voz'
                        }
                    >
                        {isListening ? (
                            <MicOff className="h-4 w-4" />
                        ) : (
                            <Mic className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Error Message */}
                {localError && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>{localError}</span>
                    </div>
                )}

                {/* Recording Indicator */}
                {isListening && (
                    <div className="flex items-center gap-2 text-xs text-red-600">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span>Escuchando... Habla ahora</span>
                    </div>
                )}

                {/* Browser Support Warning */}
                {!isSupported && (
                    <p className="text-xs text-amber-600">
                        ⚠️ Tu navegador no soporta dictado por voz. Usa Chrome o Edge.
                    </p>
                )}
            </div>
        );
    }
);

VoiceInput.displayName = 'VoiceInput';
