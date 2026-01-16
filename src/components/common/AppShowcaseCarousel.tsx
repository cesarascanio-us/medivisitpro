import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Star, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const slides = [
    {
        image: '/img/showcase/dashboard.png',
        title: 'Dashboard Inteligente',
        description: 'Gestión 360 de tu jornada diaria con indicadores clave en tiempo real.',
        tags: ['Daily Route', 'Sales KPIs', 'Visits Summary']
    },
    {
        image: '/img/showcase/medicos.png',
        title: 'Gestión de Médicos',
        description: 'Directorio profesional detallado con filtros avanzados por especialidad y zona.',
        tags: ['CRM Medico', 'Filtros Pro', 'Ubicación']
    },
    {
        image: '/img/showcase/visitas.png',
        title: 'Control de Visitas',
        description: 'Seguimiento riguroso de cada interacción con reportes de ejecución inmediatos.',
        tags: ['Check-in Gps', 'Firmas Digitales', 'Muestras']
    }
];

export const AppShowcaseCarousel: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrent((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="relative w-full max-w-6xl mx-auto mt-20 group">
            {/* Premium Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

            {/* Main Container */}
            <div
                className="relative aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] bg-slate-800 border-4 border-slate-700/50 overflow-hidden shadow-2xl backdrop-blur-xl cursor-pointer"
                onClick={() => navigate('/demo')}
            >
                {/* Images */}
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={cn(
                            "absolute inset-0 transition-all duration-1000 ease-in-out transform",
                            index === current ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                        )}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover object-top"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10" />

                        {/* Content Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 transition-all duration-500 delay-300 transform translate-y-0 opacity-100">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {slide.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest backdrop-blur-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">{slide.title}</h3>
                            <p className="text-slate-300 text-sm md:text-lg max-w-2xl leading-relaxed">{slide.description}</p>
                        </div>
                    </div>
                ))}

                {/* Floating Badges */}
                <div className="absolute top-8 left-8 z-30 flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md animate-bounce-slow">
                        <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                        <span className="text-xs font-semibold text-white">Top Rated CRM 2024</span>
                    </div>
                </div>


                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/50 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500 hover:border-emerald-500"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/50 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500 hover:border-emerald-500"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                            className={cn(
                                "h-1 transition-all rounded-full",
                                i === current ? "w-8 bg-emerald-500" : "w-2 bg-white/30 hover:bg-white/50"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
