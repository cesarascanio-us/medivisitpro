import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Maximize2, Minimize2, ChevronLeft, ChevronRight, FileText, PlayCircle,
    Image as ImageIcon, Beaker, Shield, Pill, Activity, BookOpen, ArrowRight,
    Sparkles, Award, TrendingUp, CheckCircle2, Package
} from "lucide-react";
import { DosingCalculator } from "./DosingCalculator";

export interface ProductAsset {
    id: string;
    type: 'image' | 'video' | 'pdf' | 'clinical_study';
    url: string;
    title: string;
    description?: string;
}

interface ClinicalShowcaseProps {
    productName: string;
    description: string;
    assets: ProductAsset[];
    composition?: string;
    indications?: string;
    dosage?: string;
    safetyInfo?: string;
    keyMessage?: string;
    activeIngredients?: string[];
    standardDose?: number;
    concentration?: number;
}

export function ClinicalShowcase({
    productName,
    description,
    assets,
    composition,
    indications,
    dosage,
    safetyInfo,
    keyMessage,
    activeIngredients,
    standardDose,
    concentration
}: ClinicalShowcaseProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeAsset = assets[activeIndex] || null;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const nextAsset = () => {
        setImageError(false);
        setActiveIndex((prev) => (prev + 1) % assets.length);
    };
    const prevAsset = () => {
        setImageError(false);
        setActiveIndex((prev) => (prev - 1 + assets.length) % assets.length);
    };

    return (
        <div
            ref={containerRef}
            className={`rounded-xl ${isFullscreen ? 'p-8 h-screen overflow-y-auto bg-slate-900' : 'bg-white'}`}
        >
            {/* Header Section */}
            <div className={`flex justify-between items-start mb-6 ${isFullscreen ? 'text-white' : ''}`}>
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isFullscreen ? 'bg-emerald-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>{productName}</h2>
                            <p className={`text-sm ${isFullscreen ? 'text-slate-300' : 'text-slate-500'}`}>
                                {description || "Sin descripción"}
                            </p>
                        </div>
                    </div>

                    {/* Key Message */}
                    {keyMessage && (
                        <div className={`flex items-start gap-2 p-3 rounded-lg max-w-xl ${isFullscreen ? 'bg-white/10' : 'bg-amber-50 border border-amber-200'}`}>
                            <Sparkles className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isFullscreen ? 'text-amber-400' : 'text-amber-500'}`} />
                            <p className={`text-sm italic ${isFullscreen ? 'text-white' : 'text-amber-800'}`}>"{keyMessage}"</p>
                        </div>
                    )}

                    {/* Active Ingredients Badges */}
                    {activeIngredients && activeIngredients.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {activeIngredients.slice(0, 3).map((ingredient, i) => (
                                <Badge key={i} variant="secondary" className={isFullscreen ? 'bg-white/20 text-white border-0' : 'bg-emerald-100 text-emerald-700 border-0'}>
                                    {ingredient}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <Button
                    variant={isFullscreen ? "secondary" : "outline"}
                    size="sm"
                    onClick={toggleFullscreen}
                    className={`gap-2 ${isFullscreen ? 'bg-white/20 hover:bg-white/30 text-white border-0' : ''}`}
                >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    {isFullscreen ? 'Salir' : 'Modo Presentación'}
                </Button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Visual Content */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Image/Video Viewer */}
                    <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 shadow-lg group ${isFullscreen ? 'border-white/20' : 'border-slate-200'}`}>
                        {/* Media Content */}
                        {activeAsset ? (
                            activeAsset.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                    <div className="text-center">
                                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors">
                                            <PlayCircle className="h-12 w-12 text-white" />
                                        </div>
                                        <p className="text-white/70">Click para reproducir</p>
                                    </div>
                                </div>
                            ) : imageError ? (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                                    <div className="text-center p-8">
                                        <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                            <Package className="h-10 w-10 text-emerald-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-700">{productName}</h3>
                                        <p className="text-slate-500 text-sm mt-1">Imagen del producto</p>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={activeAsset.url}
                                    alt={activeAsset.title}
                                    className="w-full h-full object-contain bg-white"
                                    onError={() => setImageError(true)}
                                />
                            )
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                        <Package className="h-10 w-10 text-emerald-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700">{productName}</h3>
                                    <p className="text-slate-500 text-sm mt-1">Producto farmacéutico</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Arrows */}
                        {assets.length > 1 && (
                            <>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={prevAsset}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={nextAsset}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </>
                        )}

                        {/* Caption Bar */}
                        {activeAsset && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-white">{activeAsset.title}</h3>
                                        {activeAsset.description && (
                                            <p className="text-xs text-white/70 mt-0.5">{activeAsset.description}</p>
                                        )}
                                    </div>
                                    {assets.length > 1 && (
                                        <Badge className="bg-white/20 text-white border-0 text-xs">
                                            {activeIndex + 1} / {assets.length}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Thumbnails Strip */}
                    {assets.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {assets.map((asset, i) => (
                                <button
                                    key={asset.id}
                                    onClick={() => {
                                        setImageError(false);
                                        setActiveIndex(i);
                                    }}
                                    className={`
                                        relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 
                                        border-2 transition-all duration-200 
                                        ${i === activeIndex
                                            ? 'border-emerald-500 ring-2 ring-emerald-200 scale-105'
                                            : 'border-slate-200 opacity-60 hover:opacity-100'}
                                    `}
                                >
                                    {asset.type === 'video' ? (
                                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                            <PlayCircle className="h-6 w-6 text-white" />
                                        </div>
                                    ) : (
                                        <img
                                            src={asset.url}
                                            alt={asset.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Information Cards - 2 column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Indications */}
                        {indications && (
                            <Card className={`border shadow-sm ${isFullscreen ? 'bg-white/10 border-white/20' : 'border-blue-100 bg-blue-50/50'}`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className={`text-base flex items-center gap-2 ${isFullscreen ? 'text-white' : 'text-blue-800'}`}>
                                        <Activity className={`h-5 w-5 ${isFullscreen ? 'text-blue-400' : 'text-blue-600'}`} />
                                        Indicaciones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`text-sm leading-relaxed ${isFullscreen ? 'text-white/80' : 'text-slate-700'}`}>
                                        {indications}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Dosage */}
                        {dosage && (
                            <Card className={`border shadow-sm ${isFullscreen ? 'bg-white/10 border-white/20' : 'border-emerald-100 bg-emerald-50/50'}`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className={`text-base flex items-center gap-2 ${isFullscreen ? 'text-white' : 'text-emerald-800'}`}>
                                        <Pill className={`h-5 w-5 ${isFullscreen ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                        Dosificación
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`text-sm leading-relaxed ${isFullscreen ? 'text-white/80' : 'text-slate-700'}`}>
                                        {dosage}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Safety Information */}
                    {safetyInfo && (
                        <Card className={`border shadow-sm ${isFullscreen ? 'bg-white/10 border-white/20' : 'border-amber-100 bg-amber-50/50'}`}>
                            <CardHeader className="pb-2">
                                <CardTitle className={`text-base flex items-center gap-2 ${isFullscreen ? 'text-white' : 'text-amber-800'}`}>
                                    <Shield className={`h-5 w-5 ${isFullscreen ? 'text-amber-400' : 'text-amber-600'}`} />
                                    Información de Seguridad
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className={`text-sm leading-relaxed ${isFullscreen ? 'text-white/80' : 'text-slate-700'}`}>
                                    {safetyInfo}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Composition */}
                    {composition && (
                        <Card className={`border shadow-sm ${isFullscreen ? 'bg-white/10 border-white/20' : 'border-slate-200'}`}>
                            <CardHeader className="pb-2">
                                <CardTitle className={`text-base flex items-center gap-2 ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>
                                    <Beaker className={`h-5 w-5 ${isFullscreen ? 'text-slate-400' : 'text-slate-600'}`} />
                                    Composición
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className={`text-sm leading-relaxed ${isFullscreen ? 'text-white/80' : 'text-slate-700'}`}>
                                    {composition}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Tools & Clinical Evidence */}
                <div className="space-y-5">
                    {/* Dosing Calculator */}
                    <DosingCalculator
                        productName={productName}
                        standardDoseMgPerKg={standardDose || 10}
                        concentrationMgPerMl={concentration || 20}
                    />

                    {/* Clinical Evidence */}
                    <Card className={`border shadow-md overflow-hidden ${isFullscreen ? 'bg-white/10 border-white/20' : ''}`}>
                        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Evidencia Clínica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ul className={`space-y-3 ${isFullscreen ? 'text-white/80' : 'text-slate-700'}`}>
                                <li className="flex gap-2 items-start">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">Estudio Randomizado Doble Ciego 2024 (N=500)</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">Reducción del 40% en síntomas a la semana 2</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <Shield className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">Perfil de seguridad superior a placebo</span>
                                </li>
                            </ul>
                            <Button
                                variant="ghost"
                                className={`w-full mt-4 gap-2 ${isFullscreen ? 'text-purple-300 hover:text-purple-200' : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'}`}
                            >
                                <BookOpen className="h-4 w-4" />
                                Ver Bibliografía Completa
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
