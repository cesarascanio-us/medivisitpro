/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CommissionCalculator } from '@/components/landing/CommissionCalculator';
import { ContactSection } from '@/components/landing/ContactSection';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  Calendar,
  BarChart3,
  Users,
  MapPin,
  Package,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Smartphone,
  Menu,
  X,
  PlayCircle,
  Globe,
  Lock,
  Send
} from 'lucide-react';
import { useState } from 'react';
import { SEO } from '@/components/common/SEO';
import { trackEvent } from '@/lib/analytics';
import { useLandingContent } from '@/hooks/useLandingContent';

const IconMap: Record<string, any> = {
  Calendar, Users, BarChart3, Package, ShieldCheck, Smartphone, Zap, MapPin, Stethoscope
};

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { content } = useLandingContent();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    trackEvent('view_landing');

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthNavigation = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      trackEvent('click_login');
      navigate('/auth');
    }
  };

  const activeFeatures = content.features?.items || [
    { title: "Gestión de Visitas 2.0", description: "Planifica rutas inteligentes, reporta en tiempo real y optimiza cada segundo de tu jornada médica.", icon: "Calendar" },
    { title: "Bóveda de Muestras", description: "Trazabilidad quirúrgica de muestras médicas alineados a la norma ISO 9000. Evita mermas y asegura entregas de calidad.", icon: "Package" },
    { title: "Dashboard Inteligente", description: "Analíticas avanzadas con visión Sentinel. Descubre oportunidades donde otros ven datos.", icon: "BarChart3" }
  ];

    return (
        <div className="min-h-screen bg-slate-950 font-display text-white selection:bg-blue-600 selection:text-white overflow-x-hidden">
            <SEO
                title="MediVisit Pro - El Sistema Inteligente para Visitadores Médicos"
                description="Orquestación de visita médica de alto desempeño. Calidad ISO 9000, analíticas Sentinel y gestión operativa de élite."
                keywords="visitador médico, gestión visita médica, crm farma, calidad iso 9000, software farmacéutica"
                canonical="https://medivisitpro.vercel.app/"
            />

            {/* Navbar - Elite Glassmorphism */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-slate-950/90 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-8'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-all duration-500">
                                <Stethoscope className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">MediVisit<span className="text-blue-500 font-black">Pro</span></span>
                        </div>

                        {/* Navigation - Professional Case */}
                        <nav className="hidden md:flex items-center gap-10">
                            {['Capacidades', 'Seguridad', 'Simulador', 'Contacto'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-sm font-semibold text-slate-400 hover:text-blue-400 transition-colors"
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>

                        {/* Action CTA */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleAuthNavigation}
                                className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                            >
                                <Lock className="w-4 h-4 text-blue-500" />
                                Acceso Master
                            </button>
                            <button
                                onClick={() => navigate('/demo')}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all"
                            >
                                Probar Demo
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section - Sophisticated Presence */}
            <section className="relative min-h-[85vh] flex items-center py-20 lg:py-32 overflow-hidden bg-slate-950">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
                
                <div className="absolute top-0 right-0 w-full max-w-[800px] h-full max-h-[800px] bg-blue-600/10 rounded-full blur-[150px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full max-w-[600px] h-full max-h-[600px] bg-slate-800/20 rounded-full blur-[120px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        <div className="lg:col-span-7 text-center lg:text-left space-y-8 lg:space-y-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                <Zap className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold tracking-wide text-blue-100">Tecnología de Grado Operativo</span>
                            </div>

                            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                                Orquestación inteligente de <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-200">Visita Médica de Élite</span>
                            </h1>

                            <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                Transforme su gestión operativa con precisión clínica. Cumplimiento ISO 9000, inteligencia de campo y analíticas de alto impacto en una sola plataforma unificada.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 sm:gap-6 pt-4">
                                <button
                                    onClick={() => navigate('/demo')}
                                    className="w-full sm:w-auto px-10 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-2xl shadow-blue-600/20 transition-all text-lg font-bold group flex items-center justify-center gap-3 active:scale-95"
                                >
                                    Solicitar Demo 72h
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={handleAuthNavigation}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 h-16 text-white hover:bg-white/10 font-bold transition-all text-sm group bg-white/5 border border-white/10 rounded-2xl"
                                >
                                    <PlayCircle className="w-6 h-6 text-blue-500" />
                                    Ver Ecosistema
                                </button>
                            </div>

                            <div className="pt-8 lg:pt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 lg:gap-12 border-t border-white/5">
                                <div className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                                    Trusted by <br /> Pharma Leaders
                                </div>
                                <div className="flex gap-8 lg:gap-10 opacity-30 grayscale contrast-125">
                                    <div className="font-bold text-xl sm:text-2xl tracking-tighter">Bayer</div>
                                    <div className="font-bold text-xl sm:text-2xl tracking-tighter">Pfizer</div>
                                    <div className="font-bold text-xl sm:text-2xl tracking-tighter">Roche</div>
                                </div>
                            </div>
                        </div>

                        {/* Interface Showcase */}
                        <div className="lg:col-span-5 relative mt-16 lg:mt-0">
                            <div className="relative z-10 bg-slate-900 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-2xl border border-white/10 p-2 transform hover:rotate-1 transition-all duration-1000 overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                <img
                                    src="/img/landing/hero-premium.png"
                                    alt="MediVisitPro Interface"
                                    className="rounded-[2.2rem] lg:rounded-[3.2rem] w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                            <div className="absolute -inset-6 bg-blue-600/10 blur-[80px] rounded-full -z-10 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Standard Case */}
            <section id="capacidades" className="py-20 lg:py-32 px-6 sm:px-8 lg:px-10 bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 lg:mb-8 tracking-tight">Capacidades de Grado Maestro</h2>
                        <div className="h-1.5 w-24 bg-blue-600 mx-auto mb-6 lg:mb-8" />
                        <p className="text-slate-400 text-lg lg:text-xl font-medium">
                            Diseñado para organizaciones que exigen la perfección operativa y la trazabilidad absoluta en cada visita médica.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                        {activeFeatures.map((feature: any, index: number) => {
                            const Icon = IconMap[feature.icon] || Zap;
                            return (
                                <div
                                    key={index}
                                    className="group bg-white/5 p-8 lg:p-12 rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-500"
                                >
                                    <div className="w-14 lg:w-16 h-14 lg:h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 lg:mb-10 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
                                        <Icon className="w-7 lg:w-8 h-7 lg:h-8 text-blue-500 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6 tracking-tight">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed text-base font-medium">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Security Section - Sentinel Architecture */}
            <section id="seguridad" className="py-20 lg:py-32 bg-blue-600/5 border-y border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Resiliencia Sentinel</h3>
                                <p className="text-blue-400 font-semibold text-xs mt-1 tracking-wide uppercase">Cifrado Militar & Auditoría ISO 27001</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            {['ISO 9001', 'ISO 27001', 'GDPR', 'HIPAA'].map(tag => (
                                <Badge key={tag} className="bg-white/5 text-blue-400 border border-blue-500/20 font-bold text-[10px] tracking-wider py-2 px-5 rounded-xl">
                                    {tag} Ready
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <CommissionCalculator />

            <ContactSection />

            {/* Footer Final - Corporate Deepness */}
            <footer className="bg-slate-950 pt-24 pb-12 text-slate-500 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-12 mb-20">
                        <div className="col-span-2 md:col-span-5 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                    <Stethoscope className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white tracking-tight">MediVisit<span className="text-blue-500 font-black">Pro</span></span>
                            </div>
                            <p className="text-base max-w-sm font-medium leading-relaxed">
                                Liderando la orquestación digital de la visita médica con tecnología de grado operativo y analítica avanzada.
                            </p>
                            <div className="flex items-center gap-4 text-white/50 hover:text-white transition-colors cursor-default">
                                <Globe className="w-5 h-5" /> <span className="font-bold text-xs tracking-wide">Global Operations Network</span>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h4 className="font-bold text-white text-sm tracking-wide">Sistemas</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Sentinel AI</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Offline PWA</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Bóveda ISO</a></li>
                            </ul>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h4 className="font-bold text-white text-sm tracking-wide">Compañía</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Nosotros</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Soporte</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Contacto</a></li>
                            </ul>
                        </div>

                        <div className="md:col-span-3 space-y-6">
                            <h4 className="font-bold text-white text-sm tracking-wide">Newsletter</h4>
                            <p className="text-sm font-medium leading-relaxed">Suscríbase para recibir actualizaciones operativas de élite.</p>
                            <div className="flex gap-2">
                                <Input placeholder="Email" className="bg-white/5 border-white/10 text-white rounded-xl h-11" />
                                <Button className="bg-blue-600 hover:bg-blue-500 h-11 px-4 rounded-xl">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6 text-sm font-medium">
                        <p>© 2026 Empresa CA - MediVisitPro. Nivel de acceso: Confidencial.</p>
                        <div className="flex items-center gap-8">
                            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                            <a href="#" className="hover:text-white transition-colors">Seguridad</a>
                            <a href="#" className="hover:text-white transition-colors">Legal</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* WhatsApp - Elite Action Button */}
            <button
                onClick={handleWhatsApp}
                className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-3xl shadow-[0_20px_40px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_50px_-5px_rgba(37,99,235,0.4)] transition-all hover:scale-110 group"
                aria-label="Contactar Mission Control"
            >
                <Smartphone className="w-7 h-7" />
                <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-bold shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap pointer-events-none border border-white/10 tracking-wide">
                    Conectar con Mission Control
                </span>
            </button>
        </div>
    );

    function handleWhatsApp() {
        trackEvent('click_whatsapp');
        window.open("https://api.whatsapp.com/send?phone=584123411879&text=Hola,%20MediVisitPro,%20solicito%20acceso%20al%20Centro%20de%20Mando", "_blank");
    }
}
