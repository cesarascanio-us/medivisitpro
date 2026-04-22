/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Mail, Phone, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface MasterDataCardProps {
    directoryItemId: string;
    currentEmail?: string | null;
    currentPhone?: string | null;
    onUpdate: (data: { email?: string; phone?: string }) => void;
}

/**
 * Card shown during "Conquest" scenario to capture missing master data
 */
export function MasterDataCard({
    directoryItemId,
    currentEmail,
    currentPhone,
    onUpdate,
}: MasterDataCardProps) {
    const [email, setEmail] = useState(currentEmail || '');
    const [phone, setPhone] = useState(currentPhone || '');

    const handleEmailChange = (value: string) => {
        setEmail(value);
        onUpdate({ email: value, phone });
    };

    const handlePhoneChange = (value: string) => {
        setPhone(value);
        onUpdate({ email, phone: value });
    };

    const needsEmail = !currentEmail;
    const needsPhone = !currentPhone;

    if (!needsEmail && !needsPhone) return null;

    return (
        <Card className="bg-amber-50 border-amber-200 border-2">
            <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                        <UserPlus className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-amber-900">
                                    Primera Visita - Actualiza Datos
                                </h3>
                                <Badge className="bg-amber-500 text-white text-xs">Conquista</Badge>
                            </div>
                            <p className="text-xs text-amber-700">
                                Completa la información de contacto para futuras comunicaciones
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {needsEmail && (
                                <div className="space-y-1">
                                    <Label className="text-xs text-amber-800 flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> Email
                                    </Label>
                                    <Input
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        value={email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        className="bg-background border-amber-300 focus:border-amber-500 h-9 text-sm"
                                    />
                                </div>
                            )}

                            {needsPhone && (
                                <div className="space-y-1">
                                    <Label className="text-xs text-amber-800 flex items-center gap-1">
                                        <Phone className="h-3 w-3" /> Teléfono
                                    </Label>
                                    <Input
                                        type="tel"
                                        placeholder="+58 412 123 4567"
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        className="bg-background border-amber-300 focus:border-amber-500 h-9 text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
