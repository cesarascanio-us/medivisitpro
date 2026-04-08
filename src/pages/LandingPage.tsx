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
import { PricingSection } from '@/components/landing/PricingSection';
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
  Lock
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
    <div className="min-h-screen bg-[#ffffff] font-display text-slate-900 selection:bg-primary selection:text-white overflow-x-hidden">
      <SEO
        title="MediVisit Pro - El Sistema Inteligentepara Visitadores Médicos"
        description="Transforma tu gestión de visita médica con IA, calidad alineados a los estándares ISO 9000 y analíticas de alto impacto. La plataforma #1 en LATAM."
        keywords="visitador médico, gestión visita médica, crm farma, calidad iso 9000, software farmacéutica, iso venezuela"
        canonical="https://medivisitpro.vercel.app/"
      />

      {/* Navbar - Institutional Glassmorphism */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-soft py-2' : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transform transition-transform group-hover:scale-110 duration-500">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">MediVisit<span className="text-primary">Pro</span></span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {['Características', 'Testimonios', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase tracking-[0.2em]"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={handleAuthNavigation}
                className="text-slate-900 hover:text-primary font-black uppercase text-[10px] tracking-widest"
              >
                {user ? 'Ir al Dashboard' : 'Acceso'}
              </Button>
              <a
                href="https://cesarascanio.vercel.app/?demo=medivisit-pro"
                className="bg-primary hover:bg-primary/90 text-white shadow-premium-md hover:shadow-premium-lg transition-all transform hover:-translate-y-1 rounded-2xl px-10 py-3.5 font-black text-[10px] uppercase tracking-[0.2em]"
              >
                Prueba de 72 Horas
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-text-main"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl shadow-2xl border-t border-gray-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            {['Características', 'Precios', 'Testimonios', 'FAQ'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-lg font-bold text-slate-800 py-2 border-b border-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-4 space-y-3">
              <Button onClick={handleAuthNavigation} variant="outline" className="w-full justify-center h-12 rounded-xl border-slate-200">
                Iniciar Sesión
              </Button>
              <Button onClick={() => navigate('/demo')} className="w-full justify-center bg-primary h-12 rounded-xl shadow-lg">
                Comenzar Gratis
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Elite Corporate Aesthetic */}
      <section className="relative pt-40 pb-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_top_right,rgba(0,86,179,0.05),transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Text Column */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-10">


              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight">
                Orquestación de <br />
                <span className="text-primary ">Visita Médica</span>
              </h1>

              <p className="text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                La orquestación definitiva para visitadores de alto desempeño. Calidad <span className="text-primary font-bold ">ISO 9000</span> integrada, analíticas en tiempo real y gestión Offline-First.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-6 pt-6">
                <a
                  href="https://cesarascanio.vercel.app/?demo=medivisit-pro"
                  className="w-full sm:w-auto px-10 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-2xl hover:shadow-emerald-500/40 transition-all text-xl font-bold group flex items-center justify-center"
                >
                  Prueba de 72 Horas
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <button
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 h-16 text-slate-700 hover:text-primary font-bold transition-all text-lg group"
                >
                  <PlayCircle className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  Ver Demo Interactiva
                </button>
              </div>

              <div className="pt-10 flex items-center justify-center lg:justify-start gap-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+150</div>
                </div>
                <div className="text-sm font-bold text-slate-500">
                  <span className="text-slate-900">+1,200</span> Visitadores activos hoy
                </div>
              </div>
            </div>

            {/* Interface Showcase - Fixed for Responsive */}
            <div className="lg:col-span-5 relative mt-12 lg:mt-0 px-4 sm:px-0">
              <div className="relative z-10 bg-white/20 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/30 p-3 transform lg:perspective-1000 lg:rotate-y-6 lg:hover:rotate-y-0 transition-all duration-1000 max-w-full overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <img
                  src="/img/landing/hero-premium.png"
                  alt="MediVisitPro Master Interface"
                  className="rounded-[2.5rem] w-full h-auto object-cover shadow-2xl relative z-10"
                />
              </div>

              {/* Float Cards - Adjusted for Mobile safety */}


              {/* Glow Effect */}
              <div className="absolute inset-0 bg-primary/20 blur-[80px] sm:blur-[120px] rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </section>



      {/* Features Grid */}
      <section id="características" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20 text-center md:text-left">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Capacidades del Grado Maestro</h2>
              <p className="text-slate-500 text-xl font-medium">
                Diseñamos herramientas que no solo gestionan, sino que elevan tu estatus profesional frente al gremio médico y farmacéutico.
              </p>
            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {activeFeatures.map((feature: any, index: number) => {
              const Icon = IconMap[feature.icon] || Zap;
              return (
                <div
                  key={index}
                  className="group bg-slate-50/50 p-10 rounded-3xl border border-transparent hover:border-primary/10 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:bg-primary transition-all">
                    <Icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-lg font-medium">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Banner - PREMIUM LIGHT MODE */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(0,86,179,0.03),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center shadow-premium-md border border-slate-100">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Resiliencia Sentinel</h3>
              <p className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest">Cifrado de grado elite y redundancia global biométrica</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Badge className="bg-white text-primary border border-primary/20 font-black text-[10px] tracking-widest py-3 px-6 rounded-2xl shadow-soft uppercase">ISO 9001 QUALITY</Badge>
            <Badge className="bg-white text-primary border border-primary/20 font-black text-[10px] tracking-widest py-3 px-6 rounded-2xl shadow-soft uppercase">ISO 27001 READY</Badge>
            <Badge className="bg-white text-primary border border-primary/20 font-black text-[10px] tracking-widest py-3 px-6 rounded-2xl shadow-soft uppercase">GDPR COMPLIANT</Badge>
          </div>
        </div>
      </section>

      <CommissionCalculator />

      <ContactSection />

      {/* Footer Final */}
      <footer className="bg-white pt-24 pb-12 text-slate-500 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-12 mb-20">
            <div className="col-span-2 md:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tighter">MediVisitPro</span>
              </div>
              <p className="text-lg max-w-sm font-medium">Liderando la transformación digital de la visita médica con tecnología de grado operativo.</p>
              <div className="flex items-center gap-4">
                <Globe className="w-5 h-5" /> <span className="font-bold">Global Presence</span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Plataforma</h4>
              <ul className="space-y-4 font-medium ">
                <li><a href="#" className="hover:text-primary transition-colors">Sentinel AI</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Offline PWA</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Compañía</h4>
              <ul className="space-y-4 font-medium ">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre CA Labs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Legal</a></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-6">
              <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.3em]">Soporte Mission Control</h4>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                <p className="text-[11px] font-black text-slate-900 mb-3 uppercase tracking-widest">¿Necesitas ayuda técnica?</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-6 leading-relaxed">Nuestro equipo orquestador está disponible 24/7 para garantizar tu éxito operativo.</p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-black uppercase text-[10px] tracking-widest shadow-premium-md">Inicia Ticket</Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-50 text-[11px] font-bold uppercase tracking-widest">
            <p>© 2026 EMPRESA CA - MEDIVISITPRO. NIVEL DE ACCESO: CONFIDENCIAL.</p>
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-primary">Privacidad</a>
              <a href="#" className="hover:text-primary">Seguridad</a>
              <a href="#" className="hover:text-primary">EULA</a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button Elite */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-3xl shadow-[0_20px_40px_-5px_rgba(37,211,102,0.3)] hover:shadow-[0_25px_50px_-5px_rgba(37,211,102,0.4)] transition-all hover:scale-110 group"
        aria-label="Contactar Mission Control"
      >
        <Smartphone className="w-7 h-7" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 px-4 py-2 rounded-2xl text-xs font-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap pointer-events-none border border-slate-100">
          CONECTAR CON MISSION CONTROL
        </span>
      </button>
    </div>
  );

  function handleWhatsApp() {
    trackEvent('click_whatsapp');
    window.open("https://api.whatsapp.com/send?phone=584123411879&text=Hola,%20MediVisitPro,%20solicito%20acceso%20al%20Centro%20de%20Mando", "_blank");
  }
}
