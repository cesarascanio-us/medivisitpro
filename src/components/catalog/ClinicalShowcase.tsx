import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    // Additional product data
    composition?: string;
    indications?: string;
    dosage?: string;
    safetyInfo?: string;
    keyMessage?: string;
    activeIngredients?: string[];
    // Dosing props
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
            className={`
                ${isFullscreen
                    ? 'p-8 h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                    : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/30'}
                rounded-xl
            `}
        >
            {/* Premium Header with Gradient */}
            <div className={`
                relative overflow-hidden rounded-t-xl
                ${isFullscreen
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600'
                    : 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800'}
                px-6 py-8 mb-6
            `}>
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">{productName}</h2>
                                {activeIngredients && activeIngredients.length > 0 && (
                                    <p className="text-white/70 text-sm mt-1">
                                        {activeIngredients.slice(0, 3).join(" • ")}
                                    </p>
                                )}
                            </div>
                        </div>

                        {keyMessage && (
                            <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 max-w-xl">
                                <Sparkles className="h-5 w-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                                <p className="text-white/90 text-sm italic">"{keyMessage}"</p>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        {isFullscreen ? 'Salir' : 'Pantalla Completa'}
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-6 ${isFullscreen ? 'text-white' : ''}`}>

                {/* Left Column: Visual Content */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Hero Image/Video Viewer */}
                    <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden border border-slate-200 shadow-xl group">
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                                backgroundSize: '24px 24px'
                            }} />
                        </div>

                        {/* Media Content */}
                        {activeAsset ? (
                            activeAsset.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                    <div className="text-center">
                                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/20 transition-colors">
                                            <PlayCircle className="h-12 w-12 text-white" />
                                        </div>
                                        <p className="text-white/70">Click para reproducir</p>
                                    </div>
                                </div>
                            ) : imageError ? (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                                    <div className="text-center p-8">
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                                            <Package className="h-12 w-12 text-emerald-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-700">{productName}</h3>
                                        <p className="text-slate-500 text-sm mt-2">Material visual en preparación</p>
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
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                                        <Package className="h-12 w-12 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-700">{productName}</h3>
                                    <p className="text-slate-500 text-sm mt-2">Producto farmacéutico</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Arrows */}
                        {assets.length > 1 && (
                            <>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    onClick={prevAsset}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    onClick={nextAsset}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </>
                        )}

                        {/* Caption Bar */}
                        {activeAsset && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-white">{activeAsset.title}</h3>
                                        {activeAsset.description && (
                                            <p className="text-xs text-white/70 mt-1">{activeAsset.description}</p>
                                        )}
                                    </div>
                                    {assets.length > 1 && (
                                        <Badge className="bg-white/20 text-white border-0">
                                            {activeIndex + 1} / {assets.length}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Thumbnails Strip */}
                    {assets.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {assets.map((asset, i) => (
                                <button
                                    key={asset.id}
                                    onClick={() => {
                                        setImageError(false);
                                        setActiveIndex(i);
                                    }}
                                    className={`
                                        relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 
                                        transition-all duration-200 
                                        ${i === activeIndex
                                            ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105'
                                            : 'opacity-60 hover:opacity-100'}
                                    `}
                                >
                                    {asset.type === 'video' ? (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <PlayCircle className="h-6 w-6 text-white" />
                                        </div>
                                    ) : (
                                        <img
                                            src={asset.url}
                                            alt={asset.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '';
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Key Information Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Indications Card */}
                        {indications && (
                            <Card className={`border-0 shadow-lg ${isFullscreen ? 'bg-white/10 backdrop-blur-sm' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
                                <CardContent className="pt-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isFullscreen ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                            <Activity className={`h-5 w-5 ${isFullscreen ? 'text-blue-300' : 'text-blue-600'}`} />
                                        </div>
                                        <h4 className={`font-semibold ${isFullscreen ? 'text-white' : 'text-blue-900'}`}>Indicaciones</h4>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${isFullscreen ? 'text-white/80' : 'text-slate-600'}`}>
                                        {indications}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Dosage Card */}
                        {dosage && (
                            <Card className={`border-0 shadow-lg ${isFullscreen ? 'bg-white/10 backdrop-blur-sm' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
                                <CardContent className="pt-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isFullscreen ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                            <Pill className={`h-5 w-5 ${isFullscreen ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                        </div>
                                        <h4 className={`font-semibold ${isFullscreen ? 'text-white' : 'text-emerald-900'}`}>Dosificación</h4>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${isFullscreen ? 'text-white/80' : 'text-slate-600'}`}>
                                        {dosage}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Safety Information */}
                    {safetyInfo && (
                        <Card className={`border-0 shadow-lg ${isFullscreen ? 'bg-white/10 backdrop-blur-sm' : 'bg-gradient-to-br from-amber-50 to-orange-50'}`}>
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isFullscreen ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                                        <Shield className={`h-5 w-5 ${isFullscreen ? 'text-amber-300' : 'text-amber-600'}`} />
                                    </div>
                                    <h4 className={`font-semibold ${isFullscreen ? 'text-white' : 'text-amber-900'}`}>Información de Seguridad</h4>
                                </div>
                                <p className={`text-sm leading-relaxed ${isFullscreen ? 'text-white/80' : 'text-slate-600'}`}>
                                    {safetyInfo}
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

                    {/* Clinical Evidence Card */}
                    <Card className={`border-0 shadow-lg overflow-hidden ${isFullscreen ? 'bg-white/10 backdrop-blur-sm' : ''}`}>
                        <div className={`px-5 py-4 ${isFullscreen ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}>
                            <div className="flex items-center gap-2">
                                <Award className={`h-5 w-5 ${isFullscreen ? 'text-purple-300' : 'text-white'}`} />
                                <h4 className={`font-semibold ${isFullscreen ? 'text-white' : 'text-white'}`}>Evidencia Clínica</h4>
                            </div>
                        </div>
                        <CardContent className="pt-5">
                            <ul className={`space-y-3 ${isFullscreen ? 'text-white/80' : 'text-slate-600'}`}>
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">Estudio Randomizado Doble Ciego 2024 (N=500)</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">Reducción del 40% en síntomas a la semana 2</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <Shield className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">Perfil de seguridad superior a placebo</span>
                                </li>
                            </ul>
                            <Button
                                variant="ghost"
                                className={`w-full mt-4 gap-2 ${isFullscreen ? 'text-purple-300 hover:text-purple-200' : 'text-purple-600 hover:text-purple-700'}`}
                            >
                                <BookOpen className="h-4 w-4" />
                                Ver Bibliografía Completa
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Composition Card */}
                    {composition && (
                        <Card className={`border-0 shadow-lg ${isFullscreen ? 'bg-white/10 backdrop-blur-sm' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isFullscreen ? 'bg-slate-500/20' : 'bg-slate-200'}`}>
                                        <Beaker className={`h-5 w-5 ${isFullscreen ? 'text-slate-300' : 'text-slate-600'}`} />
                                    </div>
                                    <h4 className={`font-semibold ${isFullscreen ? 'text-white' : 'text-slate-900'}`}>Composición</h4>
                                </div>
                                <p className={`text-sm leading-relaxed ${isFullscreen ? 'text-white/80' : 'text-slate-600'}`}>
                                    {composition}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
