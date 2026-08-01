/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React from 'react';

interface WizardProgressProps {
    currentStep: number;
    totalSteps: number;
    steps: { label: string; icon?: React.ReactNode }[];
}

export function WizardProgress({ currentStep, totalSteps, steps }: WizardProgressProps) {
    return (
        <div className="w-full space-y-2">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center gap-1 flex-1">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isActive
                                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110'
                                            : isCompleted
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {isCompleted ? '✓' : stepNumber}
                                </div>
                                <span
                                    className={`text-xs font-medium hidden sm:block ${isActive ? 'text-foreground' : 'text-muted-foreground'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`h-1 flex-1 rounded-full transition-all ${isCompleted ? 'bg-primary' : 'bg-muted'
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
