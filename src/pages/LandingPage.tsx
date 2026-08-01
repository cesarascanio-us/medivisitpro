/* ========================================================================
 MASTER FRAMEWORK - CESAR ASCANIO CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CommissionCalculator } from '@/components/landing/CommissionCalculator';
import { ContactSection } from '@/components/landing/ContactSection';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/common/SEO';
import { trackEvent } from '@/lib/analytics';
import { useLandingContent } from '@/hooks/useLandingContent';
import { useTheme } from 'next-themes';
import { m } from 'framer-motion';
import { Sun, Moon, Lock, Smartphone, Menu, X, PlayCircle, ArrowRight, Stethoscope, Calendar, BarChart3, Package, ShieldCheck, Zap, Globe, Send, CheckCircle2, Users, MapPin, Rocket, Quote } from 'lucide-react';

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
        <div className="min-h-screen bg-background font-display text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
            <SEO
                title="MediVisit Pro - El Sistema Inteligente para Visitadores Médicos"
                description="Orquestación de visita médica de alto desempeño. Calidad ISO 9000, analíticas Sentinel y gestión operativa de élite."
                keywords="visitador médico, gestión visita médica, crm farma, calidad iso 9000, software farmacéutica"
                canonical="https://medivisitpro.vercel.app/"
            />

            {/* Navbar - Elite Glassmorphism */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-card/80 backdrop-blur-[20px] border-b border-border/50 shadow-premium-md' : 'bg-transparent py-8'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-[#38BDF8]/20 group-hover:scale-110 transition-all duration-500">
                                <Stethoscope className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                            </div>
                            <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight">MediVisit<span className="text-primary font-black">Pro</span></span>
                        </div>

                        {/* Navigation - Professional Case */}
                        <nav className="hidden md:flex items-center gap-10">
                            {['Capacidades', 'Seguridad', 'Contacto'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>

                        {/* Action CTA */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAuthNavigation}
                                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-all border border-transparent"
                            >
                                <Lock className="w-4 h-4 text-primary" />
                                <span>Acceso</span>
                            </button>

                            <button
                                onClick={() => {
                                    trackEvent('click_contact_sales_header');
                                    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-white hover:text-primary-foreground shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all transform hover:-translate-y-0.5 active:scale-95"
                            >
                                Contactar Ventas
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <section className="relative min-h-[85vh] flex items-center py-20 lg:py-32 overflow-hidden bg-background">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"></div>

                <div className="absolute top-0 right-0 w-full max-w-[800px] h-full max-h-[800px] bg-primary/10 rounded-full blur-[150px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full max-w-[600px] h-full max-h-[600px] bg-card/50 rounded-full blur-[120px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 pt-8 lg:pt-16">
                    {/* Left Column: Text & CTAs */}
                    <m.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="text-center lg:text-left w-full lg:w-[55%] max-w-2xl space-y-8 lg:space-y-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold tracking-wide text-primary">{content.hero?.badge || "Tecnología de Grado Operativo"}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
                            {content.hero?.title_part1 || "Orquestación inteligente de"} <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                                {content.hero?.title_highlight || "Visita Médica de Élite"}
                            </span>
                        </h1>

                        <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-medium">
                            {content.hero?.subtitle || "Diseñado para la administración médica de élite. Arquitectura totalmente compatible con ISO 9000, pensada para entornos empresariales de alto rendimiento."}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4 w-full">
                            <button
                                onClick={() => {
                                    trackEvent('click_contact_hero');
                                    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full sm:w-auto px-10 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_0_30px_rgba(var(--primary),0.2)] transition-all text-lg font-bold group flex items-center justify-center gap-3 active:scale-95 border border-primary/20"
                            >
                                {content.hero?.cta_primary || "Contactar Ventas"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={handleAuthNavigation}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 h-16 text-foreground hover:bg-muted font-bold transition-all text-sm group bg-background border border-border rounded-2xl shadow-sm"
                            >
                                <PlayCircle className="w-6 h-6 text-primary" />
                                {content.hero?.cta_secondary || "Ver Ecosistema"}
                            </button>
                        </div>
                    </m.div>

                    {/* Right Column: Image Showcase */}
                    <m.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                        className="relative w-full lg:w-[45%] max-w-2xl mx-auto lg:ml-auto mt-8 lg:mt-0"
                    >
                        <div className="relative z-10 bg-card/80 backdrop-blur-[20px] rounded-[2rem] lg:rounded-[3rem] shadow-premium-xl border border-border/50 p-2 transform hover:-rotate-1 hover:scale-105 transition-all duration-700 group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[2rem] lg:rounded-[3rem]"></div>
                            <div className="relative overflow-hidden rounded-[1.8rem] lg:rounded-[2.8rem] aspect-square sm:aspect-video lg:aspect-[4/3]">
                                <img
                                    src={content.hero?.hero_image || "/img/landing/hero-premium.png"}
                                    alt="MediVisitPro Interface"
                                    className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </div>
                        <div className="absolute -inset-6 bg-primary/20 blur-[100px] rounded-full -z-10 animate-pulse"></div>
                    </m.div>
                </div>
            </section>

            {/* Stats Section */}
            {content.stats && content.stats.length > 0 && (
                <section className="relative z-20 -mt-16 sm:-mt-24 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 shadow-premium-lg rounded-3xl p-8 lg:p-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50">
                            {content.stats.map((stat, i) => (
                                <div key={i} className="text-center px-4">
                                    <div className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 mb-2">{stat.value}</div>
                                    <div className="text-sm font-bold tracking-widest text-muted-foreground uppercase">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Intelligence Section */}
            {content.intelligence && (
                <section id="inteligencia" className="py-20 lg:py-32 px-6 sm:px-8 lg:px-10 bg-background border-t border-border/50">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                                <Rocket className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold tracking-wide text-primary">{content.intelligence.badge || "Inteligencia de Datos"}</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">{content.intelligence.title}</h2>
                            <p className="text-lg lg:text-xl text-muted-foreground font-medium">{content.intelligence.subtitle}</p>
                            
                            <div className="space-y-6 pt-4">
                                {content.intelligence.features?.map((feat, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="text-lg font-bold text-foreground">{feat}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-8">
                                <button onClick={() => {
                                    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
                                }} className="px-8 h-14 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-xl font-bold transition-all flex items-center gap-3">
                                    {content.intelligence.cta || "Explorar"} <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 relative">
                            <div className="relative z-10 bg-card border border-border/50 rounded-[2rem] overflow-hidden shadow-premium-lg p-2 transform rotate-1 hover:rotate-0 transition-all duration-500">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                                <img src={content.intelligence.image || "/img/landing/territory-3d.png"} alt="Intelligence Data" className="w-full rounded-[1.8rem] aspect-[4/3] object-cover" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>
                        </div>
                    </div>
                </section>
            )}

            <section id="capacidades" className="py-20 lg:py-32 px-6 sm:px-8 lg:px-10 bg-background border-t border-border/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 lg:mb-8 tracking-tight">
                            {content.features?.title || "Capacidades de Grado Maestro"}
                        </h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-6 lg:mb-8" />
                        <p className="text-muted-foreground text-lg lg:text-xl font-medium">
                            {content.features?.subtitle || "Diseñado para organizaciones que exigen la perfección operativa y la trazabilidad absoluta en cada visita médica."}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
                        {/* Card 1 */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="group bg-card/50 backdrop-blur-[20px] p-8 lg:p-12 rounded-[2rem] border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-premium-md"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-500">
                                <Calendar className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">{activeFeatures[0]?.title || "Visit Management 2.0"}</h3>
                            <p className="text-muted-foreground leading-relaxed text-base font-medium">
                                {activeFeatures[0]?.description || "Motor automatizado de programación predictiva y orquestación para territorios complejos. Routing inteligente con balanceo de carga."}
                            </p>
                        </m.div>

                        {/* Card 2 */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="group bg-card/50 backdrop-blur-[20px] p-8 lg:p-12 rounded-[2rem] border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-premium-md"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-500">
                                <Package className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">{activeFeatures[1]?.title || "Sample Vault"}</h3>
                            <p className="text-muted-foreground leading-relaxed text-base font-medium">
                                {activeFeatures[1]?.description || "Inventario inmutable certificado de muestras médicas. Rastreo de alta seguridad desde calibración en bodega hasta entrega en el consultorio."}
                            </p>
                        </m.div>

                        {/* Card 3 - Full Width */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="group md:col-span-2 bg-card/50 backdrop-blur-[20px] p-8 lg:p-12 rounded-[2rem] border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-premium-md flex flex-col md:flex-row items-center gap-10"
                        >
                            <div className="flex-1">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-500">
                                    <BarChart3 className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">{activeFeatures[2]?.title || "Intelligent Dashboard"}</h3>
                                <p className="text-muted-foreground leading-relaxed text-base font-medium">
                                    {activeFeatures[2]?.description || "Analíticas predictivas en tiempo real. Monitorea la cobertura y desempeño de zona con micro-ajustes operativos en vivo."}
                                </p>
                            </div>
                            <div className="flex-1 relative w-full overflow-hidden rounded-[1.5rem] border border-border/50 group-hover:border-primary/20 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
                                <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1200&auto=format&fit=crop" alt="Dashboard Chart" className="w-full h-64 object-cover object-bottom" />
                            </div>
                        </m.div>
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            {content.testimonials && (
                <section id="testimonios" className="py-20 lg:py-32 px-6 sm:px-8 lg:px-10 bg-muted/30 border-t border-border/50 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-1/3 h-full bg-primary/5 blur-[150px] -z-10"></div>
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
                        <div className="w-full md:w-1/3 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                                <span className="text-xs font-bold tracking-wide text-primary">{content.testimonials.badge || "Casos de Éxito"}</span>
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-bold text-foreground tracking-tight">{content.testimonials.title}</h2>
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="bg-card/80 backdrop-blur-xl border border-border/50 p-10 lg:p-14 rounded-[2rem] relative shadow-premium-lg">
                                <Quote className="absolute top-8 left-8 text-primary/20 w-16 h-16 opacity-50" />
                                <p className="text-xl lg:text-2xl text-muted-foreground italic font-medium leading-relaxed relative z-10 pl-12">
                                    "{content.testimonials.quote}"
                                </p>
                                <div className="flex items-center gap-4 mt-10 pl-12">
                                    <img src={content.testimonials.avatar} alt={content.testimonials.author} className="w-16 h-16 rounded-full border-2 border-primary/50" />
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground">{content.testimonials.author}</h4>
                                        <p className="text-primary text-sm font-bold uppercase tracking-wide">{content.testimonials.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Security Section */}
            {content.security && (
                <section id="seguridad" className="py-20 lg:py-32 bg-muted/20 border-y border-border/50 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                        <h2 className="text-3xl font-bold text-foreground mb-16 tracking-tight">{content.security.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {content.security.items?.map((item, i) => {
                                const IconComponent = IconMap[item.icon] || ShieldCheck;
                                return (
                                    <div key={i} className="flex flex-col items-center bg-card p-10 rounded-3xl border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-premium-md">
                                        <IconComponent className="w-12 h-12 text-primary mb-6" />
                                        <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm font-medium">{item.subtitle}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            <CommissionCalculator />

            <ContactSection />

            <footer className="bg-white dark:bg-slate-950 py-12 text-slate-400 border-t border-slate-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                    <Stethoscope className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">MediVisit<span className="text-blue-500 font-black">Pro</span></span>
                            </div>
                            <p className="text-sm max-w-sm font-medium leading-relaxed">
                                Liderando la orquestación digital de la visita médica con tecnología de grado operativo.
                            </p>
                        </div>
                        <div className="text-xs font-bold tracking-widest uppercase opacity-40">
                            © 2026 Cesar Ascanio CA - MediVisitPro
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
