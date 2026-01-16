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
  Loader2,
  Rocket
} from 'lucide-react';
import { AppShowcaseCarousel } from '@/components/common/AppShowcaseCarousel';

const features = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Planifica y organiza tus visitas médicas con un calendario optimizado.'
  },
  {
    icon: Users,
    title: 'Gestión de Contactos',
    description: 'Mantén un registro completo de médicos, farmacias y centros de salud.'
  },
  {
    icon: BarChart3,
    title: 'Reportes y Analytics',
    description: 'Analiza tu rendimiento con métricas en tiempo real y reportes detallados.'
  },
  {
    icon: MapPin,
    title: 'Cobertura Geográfica',
    description: 'Visualiza tu territorio y optimiza rutas de visitas.'
  },
  {
    icon: Package,
    title: 'Control de Muestras',
    description: 'Gestiona inventario de muestras médicas y material promocional.'
  },
  {
    icon: CheckCircle2,
    title: 'Objetivos y KPIs',
    description: 'Define metas mensuales y haz seguimiento de tu progreso.'
  }
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // No longer auto-redirecting to dashboard to allow user to see landing page
  // useEffect(() => {
  //   if (!loading && user) {
  //     console.log('User authenticated, redirecting to dashboard...');
  //     navigate('/dashboard');
  //   }
  // }, [user, loading, navigate]);

  const handleAuthNavigation = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
            >
              {user ? 'Ir al Dashboard' : 'Iniciar Sesión'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Plataforma Profesional para Visitadores Médicos
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              Gestiona tus visitas médicas
              <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                de forma inteligente
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              La solución integral para representantes médicos. Organiza tu agenda,
              gestiona contactos, controla muestras y alcanza tus objetivos comerciales.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/demo')}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/40 px-10 h-14 text-lg font-bold relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <Rocket className="mr-3 h-6 w-6 animate-bounce" />
                Probar Demo Gratis
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={handleAuthNavigation}
                size="lg"
                variant="outline"
                className="border-2 border-slate-600 text-white hover:bg-slate-800 hover:border-emerald-500 px-8 h-14 text-base font-semibold"
              >
                Crear Cuenta
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400 mt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Acceso inmediato</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Datos realistas</span>
              </div>
            </div>
          </div>

          <AppShowcaseCarousel />

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '500+', label: 'Usuarios Activos' },
              { value: '10K+', label: 'Visitas Registradas' },
              { value: '99.9%', label: 'Disponibilidad' },
              { value: '4.9★', label: 'Calificación' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Herramientas diseñadas específicamente para optimizar el trabajo del visitador médico profesional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all">
                  <feature.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              ¿Listo para optimizar tu trabajo?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Únete a cientos de representantes médicos que ya confían en MediVisitPro para gestionar sus visitas.
            </p>
            <Button
              onClick={handleAuthNavigation}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 px-10 h-12 text-base"
            >
              Empezar Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-400">MediVisitPro</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 MediVisitPro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
      {/* WhatsApp Floating Button */}
      <a
        href="https://api.whatsapp.com/send?phone=584123411879&text=Hola,%20MediVisitPro,%20estoy%20interesado%20en%20conocer%20m%C3%A1s%20sobre%20su%20app"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center group animate-in fade-in zoom-in duration-300"
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
      </a>
    </div>
  );
}
