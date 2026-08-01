/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { geocodeAddress, formatAddressForGeocoding } from '@/services/nominatimService';

interface GeocodingButtonProps {
    address: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
    };
    onCoordinatesFound: (lat: number, lng: number) => void;
    onError?: (message: string) => void;
    disabled?: boolean;
    className?: string;
}

export function GeocodingButton({
    address,
    onCoordinatesFound,
    onError,
    disabled = false,
    className = ''
}: GeocodingButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeocode = async () => {
        setError(null);

        // Validar que tengamos al menos ciudad
        if (!address.city) {
            const errorMsg = 'Se requiere al menos una ciudad para geocodificar';
            setError(errorMsg);
            onError?.(errorMsg);
            return;
        }

        // Formatear dirección
        const formattedAddress = formatAddressForGeocoding(
            address.street,
            address.city,
            address.state,
            address.country || 'Venezuela'
        );

        setLoading(true);

        try {
            const coords = await geocodeAddress(formattedAddress, 've');

            if (coords) {
                onCoordinatesFound(coords.lat, coords.lng);
                setError(null);
            } else {
                const errorMsg = 'No se encontró la dirección. Intenta ser más específico.';
                setError(errorMsg);
                onError?.(errorMsg);
            }
        } catch (err) {
            const errorMsg = 'Error al geocodificar. Intenta nuevamente.';
            setError(errorMsg);
            onError?.(errorMsg);
            console.error('Geocoding error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                type="button"
                variant="outline"
                onClick={handleGeocode}
                disabled={loading || disabled}
                className={className}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Geocodificando...
                    </>
                ) : (
                    <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Obtener Coordenadas
                    </>
                )}
            </Button>

            {error && (
                <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        {error}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
