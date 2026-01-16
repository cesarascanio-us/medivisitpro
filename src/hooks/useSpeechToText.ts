import { useState, useCallback, useEffect, useRef } from 'react';

// Type definitions for Web Speech API (not in standard TS lib)
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export interface UseSpeechToTextOptions {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onTranscript?: (text: string) => void;
}

export interface UseSpeechToTextReturn {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

/**
 * Custom hook for Speech-to-Text using Web Speech API
 * Optimized for Spanish (Venezuela) language
 */
export function useSpeechToText(
    options: UseSpeechToTextOptions = {}
): UseSpeechToTextReturn {
    const {
        lang = 'es-VE',
        continuous = true,
        interimResults = true,
        onTranscript,
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Check browser support
    const isSupported =
        typeof window !== 'undefined' &&
        (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

    // Initialize recognition instance
    useEffect(() => {
        if (!isSupported) return;

        const SpeechRecognitionAPI =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript((prev) => {
                    const newTranscript = prev ? `${prev} ${finalTranscript}` : finalTranscript;
                    onTranscript?.(newTranscript);
                    return newTranscript;
                });
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);

            let errorMessage = 'Error de reconocimiento de voz';
            switch (event.error) {
                case 'not-allowed':
                    errorMessage = 'Permiso de micrófono denegado';
                    break;
                case 'no-speech':
                    errorMessage = 'No se detectó voz';
                    break;
                case 'network':
                    errorMessage = 'Error de red';
                    break;
                case 'audio-capture':
                    errorMessage = 'No se encontró micrófono';
                    break;
            }

            setError(errorMessage);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, [isSupported, lang, continuous, interimResults, onTranscript]);

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Tu navegador no soporta reconocimiento de voz');
            return;
        }

        setError(null);
        try {
            recognitionRef.current?.start();
        } catch (err) {
            // Already started, ignore
            console.warn('Recognition already started');
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        isSupported,
        transcript,
        error,
        startListening,
        stopListening,
        resetTranscript,
    };
}
