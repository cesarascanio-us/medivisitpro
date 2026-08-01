/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React from 'react';
import { Play, CheckCircle2, Star, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoHeroVideo: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-full max-w-5xl mx-auto mt-20 group cursor-pointer" onClick={() => navigate('/demo')}>
            {/* Premium Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            {/* Video Container / Thumbnail */}
            <div className="relative aspect-video rounded-[2.5rem] bg-slate-800 border-4 border-slate-700/50 overflow-hidden shadow-2xl backdrop-blur-xl text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-transparent z-10" />

                {/* Abstract Preview Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_50%)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-8 opacity-10 blur-sm transform scale-150">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                            <div key={i} className="w-32 h-32 bg-emerald-500/20 rounded-2xl rotate-12" />
                        ))}
                    </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md animate-bounce-slow">
                        <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                        <span className="text-xs font-semibold text-white">Top Rated CRM 2024</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-teal-500/30 backdrop-blur-md animate-bounce-slow" style={{ animationDelay: '1s' }}>
                        <Zap className="w-4 h-4 text-teal-400" />
                        <span className="text-xs font-semibold text-white">AI-Powered Routing</span>
                    </div>
                </div>

                <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-3 items-end">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-blue-500/30 backdrop-blur-md">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-semibold text-white">ISO 27001 Certified</span>
                    </div>
                </div>

                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center z-30">
                    <div className="group/play relative w-24 h-24 flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-40 group-hover/play:opacity-60 transition-opacity animate-pulse" />
                        <div className="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                    </div>
                </div>

                {/* Feature Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-slate-900 to-transparent">
                    <div className="flex items-center justify-center gap-10 text-slate-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm font-medium">Prueba Interactiva</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm font-medium">Datos Realistas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm font-medium">Sin Registro</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoHeroVideo;
