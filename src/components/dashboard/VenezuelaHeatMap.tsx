/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StateData {
    name: string;
    sales: number;
    visits: number;
    status: 'caliente' | 'tibio' | 'frio';
}

interface VenezuelaHeatMapProps {
    stateData: StateData[];
}

export function VenezuelaHeatMap({ stateData }: VenezuelaHeatMapProps) {
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const getStateColor = (stateName: string): string => {
        const data = stateData.find(s => s.name === stateName);
        if (!data) return "hsl(var(--muted))";

        switch (data.status) {
            case 'caliente':
                return "hsl(var(--primary))";
            case 'tibio':
                return "hsl(var(--chart-2))";
            case 'frio':
                return "hsl(var(--primary)/0.3)";
            default:
                return "hsl(var(--muted))";
        }
    };

    const getStateData = (stateName: string) => {
        return stateData.find(s => s.name === stateName);
    };

    const handleMouseEnter = (stateName: string, event: React.MouseEvent) => {
        setHoveredState(stateName);
        setTooltipPos({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        setTooltipPos({ x: event.clientX, y: event.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredState(null);
    };

    // Simplified Venezuela states representation
    // Using approximate rectangular regions for simplicity
    const states = [
        { name: "Zulia", x: 10, y: 30, width: 15, height: 20 },
        { name: "Falcón", x: 26, y: 28, width: 12, height: 15 },
        { name: "Lara", x: 32, y: 40, width: 10, height: 12 },
        { name: "Yaracuy", x: 40, y: 42, width: 8, height: 10 },
        { name: "Carabobo", x: 44, y: 48, width: 8, height: 10 },
        { name: "Aragua", x: 50, y: 48, width: 10, height: 10 },
        { name: "Miranda", x: 58, y: 48, width: 10, height: 12 },
        { name: "Distrito Capital", x: 57, y: 46, width: 5, height: 5 },
        { name: "La Guaira", x: 55, y: 43, width: 6, height: 4 },
        { name: "Táchira", x: 22, y: 52, width: 10, height: 15 },
        { name: "Mérida", x: 26, y: 48, width: 10, height: 12 },
        { name: "Trujillo", x: 30, y: 44, width: 8, height: 10 },
        { name: "Barinas", x: 32, y: 54, width: 12, height: 16 },
        { name: "Portuguesa", x: 38, y: 52, width: 10, height: 12 },
        { name: "Cojedes", x: 46, y: 54, width: 10, height: 10 },
        { name: "Guárico", x: 54, y: 56, width: 14, height: 14 },
        { name: "Apure", x: 40, y: 66, width: 18, height: 12 },
        { name: "Anzoátegui", x: 68, y: 52, width: 14, height: 14 },
        { name: "Sucre", x: 78, y: 44, width: 12, height: 12 },
        { name: "Nueva Esparta", x: 84, y: 40, width: 6, height: 6 },
        { name: "Monagas", x: 74, y: 56, width: 12, height: 12 },
        { name: "Bolívar", x: 60, y: 68, width: 28, height: 22 },
        { name: "Delta Amacuro", x: 84, y: 60, width: 10, height: 14 },
        { name: "Amazonas", x: 38, y: 78, width: 20, height: 18 }
    ];

    const hoveredData = hoveredState ? getStateData(hoveredState) : null;

    return (
        <Card className="bg-card border border-border/40 shadow-premium-md rounded-lg overflow-hidden">
            <CardHeader className="bg-muted/40 border-b border-border/40 pb-3">
                <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className="font-bold text-foreground tracking-tight text-sm">Mapa de Calor Comercial</span>
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--primary))" }}></div>
                            <span className="text-muted-foreground">Alta</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-2))" }}></div>
                            <span className="text-muted-foreground">Media</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--primary)/0.3)" }}></div>
                            <span className="text-muted-foreground">Baja</span>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-4">
                    <svg
                        width="100%"
                        height="400"
                        viewBox="0 0 100 100"
                        className="rounded-lg bg-muted/30 border border-border/40 shadow-inner text-foreground"
                    >
                        {states.map((state) => (
                            <g key={state.name}>
                                <rect
                                    x={state.x}
                                    y={state.y}
                                    width={state.width}
                                    height={state.height}
                                    fill={getStateColor(state.name)}
                                    stroke="#ffffff"
                                    strokeWidth="0.4"
                                    rx="1"
                                    className="transition-all duration-300 cursor-pointer hover:filter hover:brightness-110"
                                    onMouseEnter={(e) => handleMouseEnter(state.name, e)}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                />
                                <text
                                    x={state.x + state.width / 2}
                                    y={state.y + state.height / 2}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="fill-white font-bold pointer-events-none select-none"
                                    style={{ fontSize: '1.8px', opacity: 0.8 }}
                                >
                                    {state.name.substring(0, 3).toUpperCase()}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* Tooltip */}
                {hoveredData && (
                    <div
                        className="fixed z-[100] bg-card border border-border/40 px-4 py-3 rounded-lg shadow-premium-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                        style={{
                            left: `${tooltipPos.x + 15}px`,
                            top: `${tooltipPos.y + 15}px`,
                        }}
                    >
                        <div className="font-bold text-foreground text-sm mb-2 border-b border-border/40 pb-1">{hoveredData.name}</div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Ventas</span>
                                <span className="text-sm font-bold text-primary">${hoveredData.sales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Visitas</span>
                                <span className="text-sm font-bold text-foreground">{hoveredData.visits}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 pt-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Nivel</span>
                                <Badge className={`text-xs font-bold uppercase ${hoveredData.status === 'caliente' ? 'bg-primary text-primary-foreground' :
                                    hoveredData.status === 'tibio' ? 'bg-chart-2 text-white' :
                                        'bg-primary/20 text-primary'
                                    }`}>
                                    {hoveredData.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
