/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

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
import { motion, AnimatePresence } from "framer-motion";

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
    isPediatric?: boolean;
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
    concentration,
    isPediatric
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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            ref={containerRef}
            className={`rounded-2xl ${isFullscreen ? 'p-8 h-screen overflow-y-auto bg-slate-950' : ''}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex justify-between items-start mb-8 text-white">
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
                            <Package className="h-7 w-7 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{productName}</h2>
                            <p className="text-slate-400 font-medium mt-1">
                                {description || "Sin descripción"}
                            </p>
                        </div>
                    </div>

                    {/* Key Message */}
                    {keyMessage && (
                        <div className="flex items-start gap-3 p-4 rounded-xl max-w-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md shadow-inner">
                            <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-400" />
                            <p className="text-sm font-medium text-amber-200/90 leading-relaxed">"{keyMessage}"</p>
                        </div>
                    )}

                    {/* Active Ingredients Badges */}
                    {activeIngredients && activeIngredients.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {activeIngredients.slice(0, 3).map((ingredient, i) => (
                                <Badge key={i} variant="secondary" className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs shadow-sm hover:bg-emerald-500/30 transition-colors">
                                    {ingredient}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="gap-2 bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-xl transition-all"
                >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    {isFullscreen ? 'Salir' : 'Pantalla Completa'}
                </Button>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Visual Content */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">

                    {/* Image/Video Viewer */}
                    <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-white/5 backdrop-blur-xl">
                        {/* Media Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                className="w-full h-full"
                            >
                                {activeAsset ? (
                                    activeAsset.type === 'video' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-900/50 text-white">
                                            <div className="text-center transform hover:scale-110 transition-transform duration-300">
                                                <div className="w-24 h-24 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-emerald-500/40 shadow-lg shadow-emerald-500/20">
                                                    <PlayCircle className="h-12 w-12 text-emerald-400" />
                                                </div>
                                                <p className="text-emerald-400/80 font-medium tracking-wide">Click para reproducir</p>
                                            </div>
                                        </div>
                                    ) : imageError ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center p-8">
                                                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                                                    <Package className="h-10 w-10 text-slate-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-300">{productName}</h3>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={activeAsset.url}
                                            alt={activeAsset.title}
                                            className="w-full h-full object-contain p-4 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                                            onError={() => setImageError(true)}
                                        />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                                                <Package className="h-10 w-10 text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-300">{productName}</h3>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        {assets.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 h-12 w-12"
                                    onClick={prevAsset}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 h-12 w-12"
                                    onClick={nextAsset}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            </>
                        )}

                        {/* Caption Bar */}
                        {activeAsset && (
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white drop-shadow-md">{activeAsset.title}</h3>
                                        {activeAsset.description && (
                                            <p className="text-sm text-slate-300 mt-1 max-w-lg">{activeAsset.description}</p>
                                        )}
                                    </div>
                                    {assets.length > 1 && (
                                        <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-sm shadow-lg">
                                            {activeIndex + 1} / {assets.length}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Thumbnails Strip */}
                    {assets.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                            {assets.map((asset, i) => (
                                <button
                                    key={asset.id}
                                    onClick={() => {
                                        setImageError(false);
                                        setActiveIndex(i);
                                    }}
                                    className={`
                                        relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 
                                        transition-all duration-300 shadow-md
                                        ${i === activeIndex
                                            ? 'border-2 border-emerald-400 ring-4 ring-emerald-500/20 scale-105 opacity-100'
                                            : 'border border-white/10 opacity-50 hover:opacity-100 hover:scale-105'}
                                    `}
                                >
                                    {asset.type === 'video' ? (
                                        <div className="w-full h-full bg-slate-800/80 backdrop-blur flex items-center justify-center">
                                            <PlayCircle className="h-6 w-6 text-emerald-400" />
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

                </motion.div>

                {/* Right Column: Resumen & Tools */}
                <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
                    {/* Panel de Resumen Principal */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-colors">
                        <CardHeader className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/5 py-4">
                            <CardTitle className="text-base flex items-center gap-3 text-white">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                </div>
                                Información General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {description && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Descripción</h4>
                                    <p className="text-sm leading-relaxed text-slate-300">
                                        {description}
                                    </p>
                                </div>
                            )}
                            {activeIngredients && activeIngredients.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Principios Activos</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {activeIngredients.map((ingredient, i) => (
                                            <Badge key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 text-xs font-medium">
                                                {ingredient}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {!description && (!activeIngredients || activeIngredients.length === 0) && (
                                <p className="text-slate-400 text-sm italic">No hay información general disponible.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dosing Calculator - Only for Pediatric Products */}
                    {isPediatric && (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden p-1">
                            <DosingCalculator
                                productName={productName}
                                standardDoseMgPerKg={standardDose || 10}
                                concentrationMgPerMl={concentration || 20}
                            />
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Bottom Section: Details Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {/* Indications */}
                {indications && (
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-colors">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <CardTitle className="text-base flex items-center gap-3 text-blue-300">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Activity className="h-5 w-5 text-blue-400" />
                                </div>
                                Indicaciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm leading-relaxed text-slate-300">
                                {indications}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Dosage */}
                {dosage && (
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-colors">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <CardTitle className="text-base flex items-center gap-3 text-emerald-300">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Pill className="h-5 w-5 text-emerald-400" />
                                </div>
                                Dosificación
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm leading-relaxed text-slate-300">
                                {dosage}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Safety Information */}
                {safetyInfo && (
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-colors">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <CardTitle className="text-base flex items-center gap-3 text-amber-300">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Shield className="h-5 w-5 text-amber-400" />
                                </div>
                                Seguridad
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm leading-relaxed text-slate-300">
                                {safetyInfo}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Composition */}
                {composition && (
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-colors">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <CardTitle className="text-base flex items-center gap-3 text-purple-300">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Beaker className="h-5 w-5 text-purple-400" />
                                </div>
                                Composición
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm leading-relaxed text-slate-300">
                                {composition}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </motion.div>
        </motion.div>
    );
}
