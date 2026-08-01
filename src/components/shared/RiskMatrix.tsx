/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Risk {
    id: string;
    name: string;
    description: string;
    likelihood: number; // 1-5
    severity: number;   // 1-5
    controls: string;
}

interface RiskMatrixProps {
    risks?: Risk[];
    onSave?: (risks: Risk[]) => void;
    title?: string;
}

const likelihoodLabels = ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'];
const severityLabels = ['Insignificante', 'Menor', 'Moderado', 'Mayor', 'Catastrófico'];

const getRiskLevel = (likelihood: number, severity: number): { level: string; color: string } => {
    const score = likelihood * severity;
    if (score >= 15) return { level: 'Crítico', color: 'bg-red-600 text-white' };
    if (score >= 10) return { level: 'Alto', color: 'bg-orange-500 text-white' };
    if (score >= 5) return { level: 'Medio', color: 'bg-yellow-400 text-black' };
    return { level: 'Bajo', color: 'bg-green-500 text-white' };
};

const getMatrixCellColor = (likelihood: number, severity: number): string => {
    const score = likelihood * severity;
    if (score >= 15) return 'bg-red-600';
    if (score >= 10) return 'bg-orange-500';
    if (score >= 5) return 'bg-yellow-400';
    return 'bg-green-500';
};

export const RiskMatrix: React.FC<RiskMatrixProps> = ({
    risks: initialRisks = [],
    onSave,
    title = 'Matriz de Riesgos',
}) => {
    const [risks, setRisks] = useState<Risk[]>(initialRisks);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRisk, setNewRisk] = useState<Partial<Risk>>({
        name: '',
        description: '',
        likelihood: 3,
        severity: 3,
        controls: '',
    });

    const addRisk = () => {
        if (!newRisk.name) return;

        const risk: Risk = {
            id: `risk-${Date.now()}`,
            name: newRisk.name || '',
            description: newRisk.description || '',
            likelihood: newRisk.likelihood || 3,
            severity: newRisk.severity || 3,
            controls: newRisk.controls || '',
        };

        setRisks([...risks, risk]);
        setNewRisk({ name: '', description: '', likelihood: 3, severity: 3, controls: '' });
        setIsDialogOpen(false);
    };

    const deleteRisk = (id: string) => {
        setRisks(risks.filter((r) => r.id !== id));
    };

    const handleSave = () => {
        if (onSave) {
            onSave(risks);
        }
    };

    // Count risks in each cell
    const getRisksInCell = (likelihood: number, severity: number) => {
        return risks.filter((r) => r.likelihood === likelihood && r.severity === severity);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            {title}
                        </CardTitle>
                        <CardDescription>
                            Evalúa y gestiona los riesgos identificados en el proceso
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Añadir Riesgo
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nuevo Riesgo</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Nombre del Riesgo</Label>
                                        <Input
                                            value={newRisk.name}
                                            onChange={(e) => setNewRisk({ ...newRisk, name: e.target.value })}
                                            placeholder="Ej: Exposición a químicos"
                                        />
                                    </div>
                                    <div>
                                        <Label>Descripción</Label>
                                        <Textarea
                                            value={newRisk.description}
                                            onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                                            placeholder="Describe el riesgo..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Probabilidad (1-5)</Label>
                                            <select
                                                value={newRisk.likelihood}
                                                onChange={(e) =>
                                                    setNewRisk({ ...newRisk, likelihood: parseInt(e.target.value) })
                                                }
                                                className="w-full px-3 py-2 border rounded-md"
                                            >
                                                {likelihoodLabels.map((label, i) => (
                                                    <option key={i} value={i + 1}>
                                                        {i + 1} - {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Severidad (1-5)</Label>
                                            <select
                                                value={newRisk.severity}
                                                onChange={(e) =>
                                                    setNewRisk({ ...newRisk, severity: parseInt(e.target.value) })
                                                }
                                                className="w-full px-3 py-2 border rounded-md"
                                            >
                                                {severityLabels.map((label, i) => (
                                                    <option key={i} value={i + 1}>
                                                        {i + 1} - {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Medidas de Control</Label>
                                        <Textarea
                                            value={newRisk.controls}
                                            onChange={(e) => setNewRisk({ ...newRisk, controls: e.target.value })}
                                            placeholder="Medidas para mitigar el riesgo..."
                                        />
                                    </div>
                                    <Button onClick={addRisk} className="w-full">
                                        Añadir Riesgo
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-1" />
                            Guardar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 5x5 Matrix Grid */}
                <div className="overflow-x-auto">
                    <div className="min-w-[500px]">
                        <div className="flex">
                            {/* Y-axis label */}
                            <div className="w-20 flex items-center justify-center">
                                <span className="text-sm font-medium -rotate-90 whitespace-nowrap">
                                    Probabilidad →
                                </span>
                            </div>

                            {/* Matrix */}
                            <div className="flex-1">
                                {/* Column headers */}
                                <div className="flex mb-1">
                                    <div className="w-16" />
                                    {severityLabels.map((label, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 text-center text-xs font-medium text-muted-foreground px-1"
                                        >
                                            {label}
                                        </div>
                                    ))}
                                </div>

                                {/* Matrix rows */}
                                {likelihoodLabels
                                    .slice()
                                    .reverse()
                                    .map((rowLabel, rowIndex) => {
                                        const likelihood = 5 - rowIndex;
                                        return (
                                            <div key={rowIndex} className="flex h-16">
                                                <div className="w-16 flex items-center justify-end pr-2 text-xs font-medium text-muted-foreground">
                                                    {rowLabel}
                                                </div>
                                                {severityLabels.map((_, colIndex) => {
                                                    const severity = colIndex + 1;
                                                    const cellRisks = getRisksInCell(likelihood, severity);
                                                    return (
                                                        <div
                                                            key={colIndex}
                                                            className={`flex-1 m-0.5 rounded flex items-center justify-center ${getMatrixCellColor(
                                                                likelihood,
                                                                severity
                                                            )} ${cellRisks.length > 0 ? 'ring-2 ring-white ring-offset-2' : ''}`}
                                                        >
                                                            {cellRisks.length > 0 && (
                                                                <span className="text-white font-bold text-lg">
                                                                    {cellRisks.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}

                                {/* X-axis label */}
                                <div className="text-center text-sm font-medium text-muted-foreground mt-2">
                                    Severidad →
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Risk List */}
                {risks.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium">Riesgos Identificados ({risks.length})</h4>
                        <div className="grid gap-3">
                            {risks.map((risk) => {
                                const { level, color } = getRiskLevel(risk.likelihood, risk.severity);
                                return (
                                    <div
                                        key={risk.id}
                                        className="flex items-start justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{risk.name}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
                                                    {level}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{risk.description}</p>
                                            {risk.controls && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    <span className="font-medium">Controles:</span> {risk.controls}
                                                </p>
                                            )}
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Probabilidad: {likelihoodLabels[risk.likelihood - 1]} | Severidad:{' '}
                                                {severityLabels[risk.severity - 1]}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteRisk(risk.id)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500" />
                        <span>Bajo (1-4)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-400" />
                        <span>Medio (5-9)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500" />
                        <span>Alto (10-14)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-600" />
                        <span>Crítico (15-25)</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RiskMatrix;
