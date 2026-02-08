import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Stethoscope,
  Calendar,
  BarChart3,
  Users,
  MapPin,
  Package,
  ArrowRight,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Zap,
  Smartphone
} from 'lucide-react';
import { AppShowcaseCarousel } from '@/components/common/AppShowcaseCarousel';
import { SEO } from '@/components/common/SEO';
import { trackEvent } from '@/lib/analytics';
import { PricingSection } from '@/components/landing/PricingSection';
import { CommissionCalculator } from '@/components/landing/CommissionCalculator';

const features = [
  {
    icon: Calendar,
    title: 'Recupera 10+ Horas Semanales',
    description: 'Olvídate de organizar la agenda manualmente. Nuestro algoritmo optimiza tus rutas y visitas automáticamente.'
  },
  {
    icon: Users,
    title: 'Relaciones que Generan Ventas',
    description: 'Historial detallado de cada médico y farmacia. Llega a la visita sabiendo exactamente qué necesitan.'
  },
  {
    icon: BarChart3,
    title: 'Tus Métricas, Tu Ascenso',
    description: 'Demuestra tu rendimiento con reportes automáticos. KPIs claros para negociar tus comisiones.'
  },
  {
    icon: Package,
    title: 'Cero Muestras Perdidas',
    description: 'Control total de tu inventario promocional. Nunca más te quedes sin material para un médico clave.'
  },
  {
    icon: ShieldCheck,
    title: 'Funciona Offline',
    description: '¿Sin señal en el hospital? No hay problema. Tu información está siempre disponible y se sincroniza después.'
  },
  {
    icon: Smartphone,
    title: 'Oficina en tu Bolsillo',
    description: 'Toda la potencia de un CRM corporativo, diseñado para la pantalla de tu móvil.'
  }
];

const schemaData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "MediVisit Pro",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, Android, iOS",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "520"
  },
  "description": "Plataforma integral para la gestión de visitas médicas. Optimiza rutas, controla inventario y mejora el rendimiento comercial.",
  "featureList": "Agenda Inteligente, CRM Médico, Control de Muestras, Reportes Offline"
};

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('view_landing');
  }, []);

  const handleAuthNavigation = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      trackEvent('click_login');
      navigate('/auth');
    }
  };

  const handleStartFree = () => {
    trackEvent('click_start_free');
    handleAuthNavigation();
  };

  const handleDemo = () => {
    trackEvent('click_demo');
    navigate('/demo');
  };

  const handleWhatsApp = () => {
    trackEvent('click_whatsapp');
    window.open("https://api.whatsapp.com/send?phone=584123411879&text=Hola,%20MediVisitPro,%20quiero%20mejorar%20mis%20ventas", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      <SEO
        title="MediVisit Pro - Aumenta tus Prescripciones Médicas"
        description="El arma secreta de los visitadores médicos top. Gestiona territorio, muestras y objetivos en una sola app. Pruébalo gratis hoy."
        keywords="visitador médico app, crm visita médica, gestión farmacéutica, control muestras médicas, software visitadores"
        canonical="https://medivisitpro.com/"
      />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">MediVisitPro</span>
            </div>
            <Button
              onClick={handleAuthNavigation}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all font-medium"
            >
              {user ? 'Ir al Dashboard' : 'Iniciar Sesión'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Nuevo: Modo Offline Inteligente
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
              Domina tu Territorio.
              <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent pb-2">
                Supera tus Cuotas.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              Deja de perder tiempo en reportes y enfócate en lo que importa: <strong>las relaciones con tus médicos</strong>.
              La única herramienta diseñada por y para visitadores de alto rendimiento.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <Button
                onClick={handleDemo}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/40 px-10 h-16 text-lg font-bold rounded-xl"
              >
                <Rocket className="mr-3 h-6 w-6" />
                Probar Demo Interactiva
              </Button>
              <Button
                onClick={handleStartFree}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-slate-600 text-white hover:bg-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 px-10 h-16 text-lg font-semibold rounded-xl bg-transparent"
              >
                Crear Cuenta Gratis
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-400 mt-10 animate-in fade-in duration-1000 delay-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Plan Gratuito Permanente</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>No requiere tarjeta</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Instalación en 1 min</span>
              </div>
            </div>
          </div>

          <div className="mt-20 animate-in fade-in zoom-in duration-1000 delay-500">
            <AppShowcaseCarousel />
          </div>

          {/* Social Proof Numbers */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-slate-800/50 pt-12">
            {[
              { value: '+30%', label: 'Más Visitas/Día' },
              { value: '100%', label: 'Control de Stock' },
              { value: '0', label: 'Errores de Reporte' },
              { value: '4.9/5', label: 'Valoración Usuarios' }
            ].map((stat, i) => (
              <div key={i} className="text-center group hover:bg-slate-800/20 p-4 rounded-xl transition-colors">
                <div className="text-3xl sm:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-emerald-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Tu Ventaja Competitiva
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">
              Mientras otros pierden el tiempo llenando excels, tú estarás cerrando tratos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-emerald-500/10 flex items-center justify-center mb-6 transition-colors border border-slate-700 group-hover:border-emerald-500/50">
                  <feature.icon className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Magnet: Commission Calculator */}
      <CommissionCalculator />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-8 sm:p-16 rounded-[2.5rem] bg-gradient-to-br from-emerald-900/50 via-teal-900/30 to-slate-900 border border-emerald-500/30 overflow-hidden">
            {/* Glossy Effect */}
            <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                ¿Listo para ser el N°1 de tu zona?
              </h2>
              <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
                No necesitas tarjeta de crédito. Empieza a usar MediVisitPro hoy y nota la diferencia en tu primera semana.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={handleStartFree}
                  size="lg"
                  className="bg-white text-emerald-900 hover:bg-slate-100 shadow-xl px-12 h-14 text-lg font-bold rounded-xl"
                >
                  Empezar Ahora - Es Gratis
                </Button>
                <Button
                  onClick={handleDemo}
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-800/50 hover:border-emerald-400 px-12 h-14 text-lg font-medium rounded-xl"
                >
                  Ver Demo Primero
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">MediVisitPro</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              Potenciando profesionales de la salud con tecnología simple y poderosa.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-slate-400">
            <Link to="/auth" className="hover:text-emerald-400 transition-colors">Login</Link>
            <Link to="/demo" className="hover:text-emerald-400 transition-colors">Demo</Link>
            <span>© 2024 MediVisitPro</span>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center group animate-in fade-in zoom-in duration-300"
        aria-label="Contactar por WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap ml-0 group-hover:ml-3 font-semibold">
          Chatea con nosotros
        </span>
      </button>
    </div>
  );
}
