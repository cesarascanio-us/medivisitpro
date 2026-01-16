import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        if (!data) return "#e2e8f0"; // slate-200 default

        switch (data.status) {
            case 'caliente':
                return "#10b981"; // emerald-500
            case 'tibio':
                return "#f59e0b"; // amber-500
            case 'frio':
                return "#ef4444"; // rose-500
            default:
                return "#e2e8f0";
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
        <Card className="relative">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Mapa de Calor - Venezuela</span>
                    <div className="flex gap-4 text-sm font-normal">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#10b981" }}></div>
                            <span className="text-slate-600">Caliente</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f59e0b" }}></div>
                            <span className="text-slate-600">Tibio</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }}></div>
                            <span className="text-slate-600">Frío</span>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <svg
                    width="100%"
                    height="500"
                    viewBox="0 0 100 100"
                    className="border border-slate-200 rounded-lg bg-slate-50"
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
                                strokeWidth="0.5"
                                className="transition-all duration-200 cursor-pointer hover:opacity-80"
                                onMouseEnter={(e) => handleMouseEnter(state.name, e)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            />
                            <text
                                x={state.x + state.width / 2}
                                y={state.y + state.height / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-[2px] fill-white font-semibold pointer-events-none select-none"
                                style={{ fontSize: '2px' }}
                            >
                                {state.name.substring(0, 3).toUpperCase()}
                            </text>
                        </g>
                    ))}
                </svg>

                {/* Tooltip */}
                {hoveredData && (
                    <div
                        className="fixed z-50 bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm pointer-events-none"
                        style={{
                            left: `${tooltipPos.x + 15}px`,
                            top: `${tooltipPos.y + 15}px`,
                        }}
                    >
                        <div className="font-bold mb-1">{hoveredData.name}</div>
                        <div className="text-xs space-y-0.5">
                            <div>Ventas: <span className="font-semibold">${hoveredData.sales.toLocaleString()}</span></div>
                            <div>Visitas: <span className="font-semibold">{hoveredData.visits}</span></div>
                            <div>
                                Estado:
                                <span className={`ml-1 font-semibold ${hoveredData.status === 'caliente' ? 'text-emerald-400' :
                                        hoveredData.status === 'tibio' ? 'text-amber-400' :
                                            'text-rose-400'
                                    }`}>
                                    {hoveredData.status.charAt(0).toUpperCase() + hoveredData.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
