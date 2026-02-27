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
    { title: "Bóveda de Muestras", description: "Trazabilidad quirúrgica de muestras médicas bajo norma ISO 9000. Evita mermas y asegura entregas de calidad.", icon: "Package" },
    { title: "Dashboard Nivel Dios", description: "Analíticas avanzadas con visión Sentinel. Descubre oportunidades donde otros ven datos.", icon: "BarChart3" }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-text-main selection:bg-primary selection:text-white">
      <SEO
        title="MediVisit Pro - El Sistema Definitivo para Visitadores Médicos"
        description="Transforma tu gestión de visita médica con IA, calidad bajo estándares ISO 9000 y analíticas de alto impacto. La plataforma #1 en LATAM."
        keywords="visitador médico, gestión visita médica, crm farma, calidad iso 9000, software farmacéutica, iso venezuela"
        canonical="https://medivisitpro.com/"
      />

      {/* Navbar - Institutional Glassmorphism */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-soft py-2' : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tighter">MediVisit<span className="text-primary">Pro</span></span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {['Características', 'Precios', 'Testimonios', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleAuthNavigation}
                className="text-slate-700 hover:text-primary font-bold"
              >
                {user ? 'Ir al Dashboard' : 'Acceso Clientes'}
              </Button>
              <Button
                onClick={() => navigate('/demo')}
                className="bg-primary hover:bg-primary-dark text-white shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 rounded-full px-8 font-bold"
              >
                Prueba Gratis
              </Button>
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
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary-dark text-xs font-bold uppercase tracking-widest animate-in fade-in duration-1000">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Sentinel Intelligence Enabled
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tighter">
                Evoluciona tu <br />
                <span className="text-primary">Visita Médica</span>
              </h1>

              <p className="text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                La orquestación definitiva para visitadores de alto desempeño. Calidad <span className="text-primary font-bold italic">ISO 9000</span> integrada, analíticas en tiempo real y gestión Offline-First.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-6 pt-6">
                <Button
                  size="lg"
                  onClick={() => navigate('/demo')}
                  className="w-full sm:w-auto px-10 h-16 bg-primary hover:bg-primary-dark text-white rounded-2xl shadow-2xl hover:shadow-primary/40 transition-all text-xl font-bold group"
                >
                  Obtener Acceso Pro
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
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

            {/* Interface Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-2 transform perspective-1000 rotate-y-3 hover:rotate-y-0 transition-all duration-700">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                  alt="MediVisitPro Dashboard"
                  className="rounded-2xl w-full h-auto"
                />

                {/* Float Cards */}
                <div className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 animate-bounce-slow max-w-[180px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Calidad</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">ISO 9000 Certified</p>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Confían en nuestro estándar ISO 27001</p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-40 hover:opacity-60 transition-opacity">
            <span className="text-2xl font-black italic text-slate-600">PHARMA-CORE</span>
            <span className="text-2xl font-black text-slate-600">BIO-TECH</span>
            <span className="text-2xl font-black text-slate-600">HEALTH-X</span>
            <span className="text-2xl font-black text-slate-600">GENESIS</span>
            <span className="text-2xl font-black italic text-slate-600">MED-LIFE</span>
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
                Diseñamos herramientas que no solo gestionan, sino que elevan tu estatus profesional frente al gremio médico.
              </p>
            </div>
            <Button variant="outline" className="rounded-xl h-12 border-slate-200">Ver todas las funciones</Button>
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

      {/* Security Banner */}
      <section className="py-12 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/10 blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Resiliencia Sentinel</h3>
              <p className="text-slate-400 text-sm">Cifrado de grado militar y servidores redundantes globales.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 py-1 px-4">ISO 9000 QUALITY</Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 py-1 px-4">ISO 27001 READY</Badge>
            <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-4">GDPR COMPLIANT</Badge>
          </div>
        </div>
      </section>

      <CommissionCalculator />
      <PricingSection />
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
              <p className="text-lg max-w-sm font-medium">Liderando la transformación digital de la visita médica en Iberoamérica con tecnología de grado operativo.</p>
              <div className="flex items-center gap-4">
                <Globe className="w-5 h-5" /> <span className="font-bold">Global Presence</span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Plataforma</h4>
              <ul className="space-y-4 font-medium italic">
                <li><a href="#" className="hover:text-primary transition-colors">Sentinel AI</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Offline PWA</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Compañía</h4>
              <ul className="space-y-4 font-medium italic">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre CA Labs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Legal</a></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-6">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Soporte Mission Control</h4>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-bold text-slate-800 mb-2">¿Necesitas ayuda técnica?</p>
                <p className="text-xs mb-4">Nuestro equipo orquestador está disponible 24/7 para ti.</p>
                <Button className="w-full bg-slate-900 text-white rounded-xl">Inicia Ticket</Button>
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
