/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
   
   LANDING PAGE: COMPARACIÓN INDUSTRIAL (Excel vs MediVisitPro)
   Nivel de Acceso: PÚBLICO
   ======================================================================== */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, Activity, Database, Shield, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function ComparisonPage() {
    const navigate = useNavigate();

    const features = [
        { name: "Control de Muestras", traditional: "Libretas/Excel (Caos)", mvp: "Stock en Tiempo Real (RLS)", impact: "Evita PÉRDIDAS de $1000+" },
        { name: "Optimización de Rutas", traditional: "Google Maps (Manual)", mvp: "Algoritmo OSRM/TSP", impact: "Ahorro del 30% en gasolina" },
        { name: "Reporte de Visitas", traditional: "WhatsApp (Informativo)", mvp: "Dashboard BI / Auditoría", impact: "Decisiones basadas en DATOS" },
        { name: "Soberanía Digital", traditional: "Dependientes de Google", mvp: "Infraestructura Propia CA", impact: "Seguridad de nivel militar" },
        { name: "Acceso Offline", traditional: "No disponible", mvp: "Sync Automática PWA", impact: "Trabaje en hospitales sin señal" }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Dark Tech Mesh Overlay */}
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
            
            <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-32">
                {/* Hero Section */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="outline" className="mb-6 border-emerald-500/50 text-emerald-400 bg-emerald-500/5 px-4 py-1.5 uppercase tracking-[0.2em] text-[10px] font-black">
                            Análisis de Eficiencia Industrial
                        </Badge>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tightest text-white mb-6 uppercase  leading-none">
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-500">Deja de Perseguir</span><br/>
                            <span className="text-blue-500">Médicos con Excel</span>
                        </h1>
                        <p className="max-w-3xl mx-auto text-slate-500 text-lg md:text-xl font-light mb-10">
                            La diferencia entre una fuerza de ventas convencional y una <span className="text-white font-bold ">Operación de Élite</span> radica en el control soberano de los datos.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                                onClick={() => navigate('/marketing/route-optimizer')}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-8 px-10 rounded-none transform skew-x-[-10deg] transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                            >
                                <span className="skew-x-[10deg] uppercase tracking-widest flex items-center gap-3">
                                    <Zap className="w-5 h-5 fill-white" /> Probar Optimizador Gratis
                                </span>
                            </Button>
                            <Button 
                                onClick={() => navigate('/auth')}
                                variant="outline"
                                className="border-slate-800 text-slate-400 hover:bg-white/5 font-bold py-8 px-10 rounded-none transform skew-x-[-10deg] transition-all"
                            >
                                <span className="skew-x-[10deg] uppercase tracking-widest flex items-center gap-2">
                                    Registrar Empresa <ArrowRight className="w-4 h-4" />
                                </span>
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Comparison Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-24 overflow-hidden rounded-2xl border border-slate-800/50 shadow-3xl bg-slate-900/10 backdrop-blur-sm">
                        
                        {/* Column Traditional */}
                        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-800 hover:bg-red-500/[0.02] transition-colors">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                    <X className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black uppercase  text-slate-400 tracking-tighter">Métodos del Pasado</h3>
                            </div>
                            <div className="space-y-8">
                                {features.map((f, i) => (
                                    <div key={i} className="opacity-40">
                                        <p className="text-[10px] uppercase font-bold text-slate-600 mb-1 tracking-widest">{f.name}</p>
                                        <p className="text-slate-200 font-medium line-through decoration-red-500/50">{f.traditional}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column MediVisitPro */}
                        <div className="p-8 md:p-12 bg-slate-900/30 hover:bg-slate-900/50 transition-all border-l-4 border-l-blue-600">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black uppercase  text-white tracking-tighter">MediVisit Pro <span className="text-[10px] text-blue-500 align-top ml-2">INDUSTRIAL v2.0</span></h3>
                            </div>
                            <div className="space-y-8">
                                {features.map((f, i) => (
                                    <div key={i} className="group cursor-default">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[10px] uppercase font-bold text-blue-500 tracking-widest">{f.name}</p>
                                            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-none text-[8px] px-1 py-0 font-black">+{f.impact.split(' ')[2]}</Badge>
                                        </div>
                                        <p className="text-white font-bold flex items-center gap-2">
                                            <Check className="w-4 h-4 text-emerald-500" /> {f.mvp}
                                        </p>
                                        <p className="text-[10px] text-slate-500  mt-1 font-light group-hover:text-slate-300 transition-colors">Impacto: {f.impact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Trust/Infrastructure Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-[#0c0c0c] border-slate-800 p-8 hover:border-blue-500/30 transition-all group">
                        <Database className="w-8 h-8 text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
                        <h4 className="text-lg font-black uppercase  text-white mb-4">Arquitectura CA</h4>
                        <p className="text-sm text-slate-500 font-light leading-relaxed">
                            Construido sobre el **CA_CORE**, garantizando una sincronización perfecta con Supabase y aislamiento de datos vía Row Level Security (RLS).
                        </p>
                    </Card>
                    <Card className="bg-[#0c0c0c] border-slate-800 p-8 hover:border-blue-500/30 transition-all group">
                        <Shield className="w-8 h-8 text-emerald-600 mb-6 group-hover:scale-110 transition-transform" />
                        <h4 className="text-lg font-black uppercase  text-white mb-4">Control Soberano</h4>
                        <p className="text-sm text-slate-500 font-light leading-relaxed">
                            Somos dueños de nuestro stack. Nada de dependencias de terceros que rastrean sus rutas o contactos médicos. Privacidad absoluta.
                        </p>
                    </Card>
                    <Card className="bg-[#0c0c0c] border-slate-800 p-8 hover:border-blue-500/30 transition-all group shadow-[0_10px_40px_-15px_rgba(37,99,235,0.2)]">
                        <TrendingUp className="w-8 h-8 text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
                        <h4 className="text-lg font-black uppercase  text-white mb-4">Crecimiento Basado en Datos</h4>
                        <p className="text-sm text-slate-500 font-light leading-relaxed">
                            No solo gestiona visitas, genera BI (Business Intelligence) para que su empresa de distribución sepa exactamente dónde invertir.
                        </p>
                    </Card>
                </div>

                {/* Final CTA */}
                <div className="mt-32 text-center p-16 rounded-[40px] bg-gradient-to-b from-blue-600/10 to-transparent border border-blue-500/10">
                    <h2 className="text-3xl md:text-5xl font-black  uppercase text-white mb-8 tracking-tighter">¿Listo para la <span className="text-blue-500 underline decoration-indigo-500 decoration-4 underline-offset-8">Soberanía Digital</span>?</h2>
                    <Button 
                        onClick={() => navigate('/auth')}
                        className="bg-white text-black hover:bg-slate-200 font-black px-12 py-8 rounded-none uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                    >
                        Comenzar Ahora - 100% Gratis
                    </Button>
                </div>
            </div>
        </div>
    );
}
