/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

// MediVisitPro - Optimized with Lazy Loading & SEO
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ModuleGuard } from "@/components/guards/ModuleGuard";
import { OrganizationProvider } from "./hooks/useOrganization";
import { AuthProvider } from "./components/auth/AuthProvider";
import { DemoDataSeeder } from "@/components/demo/DemoDataSeeder";
import { MockDataProvider } from "@/contexts/MockDataProvider";
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeProvider as CustomThemeProvider } from "@/context/ThemeContext";
import { LazyMotion } from "framer-motion";

// Theme Builder visually customizable SaaS console
const ThemeBuilder = lazy(() => import("@/components/theme/ThemeBuilder"));

const loadFeatures = () => import('./lib/framer-features').then(r => r.default);

// Eager load critical pages for faster First Contentful Paint (FCP)
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

// Lazy load everything else to reduce initial bundle size
const DashboardRouter = lazy(() => import("./components/dashboard/DashboardRouter"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Visits = lazy(() => import("./pages/Visits"));
const Products = lazy(() => import("./pages/Products"));
const Reports = lazy(() => import("./pages/Reports"));
const HealthCenters = lazy(() => import("./pages/HealthCenters"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));
const WorkProcesses = lazy(() => import("./pages/WorkProcesses"));
const Events = lazy(() => import("./pages/Events"));
const Objectives = lazy(() => import("./pages/Objectives"));
const Samples = lazy(() => import("./pages/Samples"));
const MaterialPOP = lazy(() => import("./pages/MaterialPOP"));
const SampleBanks = lazy(() => import("./pages/SampleBanks"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Help = lazy(() => import("./pages/Help"));
const Planner = lazy(() => import("./pages/Planner"));
const Doctors = lazy(() => import("./pages/Doctors"));
const Pharmacies = lazy(() => import("./pages/Pharmacies_Elite"));
const NaturalStores = lazy(() => import("./pages/NaturalStores"));
const Commerces = lazy(() => import("./pages/Commerces"));
const Specialties = lazy(() => import("./pages/Specialties"));
const Drugstores = lazy(() => import("./pages/Drugstores_Elite"));
const DemoPage = lazy(() => import("./pages/DemoPage"));

const Users = lazy(() => import("./pages/Users"));
const Zones = lazy(() => import("./pages/Zones"));
const MasterPanel = lazy(() => import("./pages/MasterPanel"));
const TransferOrders = lazy(() => import("./pages/TransferOrders"));
const CoverageMap = lazy(() => import("./pages/CoverageMap"));
const PromotionalCycles = lazy(() => import("./pages/PromotionalCycles"));
const HumanResources = lazy(() => import("./pages/HumanResources"));
const HRRecruitment = lazy(() => import("./pages/HRRecruitment"));
const PMBOKMaster = lazy(() => import("./pages/PMBOKMaster"));
const CRMDashboard = lazy(() => import("./pages/CRMDashboard"));
const SalesPipeline = lazy(() => import("./pages/SalesPipeline"));
const FinanceMonitor = lazy(() => import("./pages/FinanceMonitor"));
const DocumentCenter = lazy(() => import("./pages/DocumentCenter"));

const PublicProductPage = lazy(() => import("./pages/Public/ProductPage"));
const Documentation = lazy(() => import("./pages/Documentation"));

const Billing = lazy(() => import("./pages/Billing"));
const TicketList = lazy(() => import("./pages/Master/Tickets/TicketList"));
const AuditLogs = lazy(() => import("./pages/Master/Logs/AuditLogs"));
const BillingManager = lazy(() => import("./pages/Master/Billing/BillingManager"));
const SystemAlerts = lazy(() => import("./pages/Master/Reminders/SystemAlerts"));
const PlanManager = lazy(() => import("./pages/Master/Memberships/PlanManager"));
const LandingEditor = lazy(() => import("./pages/Master/LandingEditor"));
const CompensationConfig = lazy(() => import("./pages/Master/CompensationConfig"));
const PayoutDashboard = lazy(() => import("./pages/Commercial/PayoutDashboard"));
const OnboardingWizard = lazy(() => import("./components/onboarding/OnboardingWizard"));

const WarehouseLayout = lazy(() => import("@/components/warehouse/WarehouseLayout"));

// Lazy loaded placeholder components
const Quotes = lazy(() => import("./pages/Quotes"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Baremos = lazy(() => import("./pages/Baremos"));
const Cycles = lazy(() => import("./pages/Planning/Cycles"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Wrapper component to force re-mount of children when route changes
const RoutesWithRemount = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    console.log('[RoutesWithRemount] Route changed to:', location.pathname);
    
    // CONTROL DE ACCESO ELITE: Si detectamos un código de demo CA-72-
    if (location.pathname.includes('/demo/CA-72-')) {
      const demoId = location.pathname.split('CA-72-').pop();
      console.log('[Security] Demo Code Detected:', `CA-72-${demoId}`);
      // Aquí podríamos añadir validación contra Supabase en el futuro
      // Por ahora, permitimos que el flujo continúe hacia la DemoPage
    }
  }, [location.pathname]);

  return <div style={{ display: 'contents' }}>{children}</div>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 2,
    },
  },
});

// Centralized App Content to avoid duplication between / and /demo
const AppContent = () => (
  <Routes>
    {/* Protected Routes */}
    <Route path="dashboard" element={
      <ProtectedRoute>
        <Layout><DashboardRouter /></Layout>
      </ProtectedRoute>
    } />
    <Route path="agenda" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="agenda">
          <Layout><Agenda /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="planner" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="agenda">
          <Layout><Planner /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="events" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="agenda">
          <Layout><Events /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="contacts" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="contacts">
          <Layout><Contacts /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="doctors" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="doctors">
          <Layout><Doctors /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="pharmacies" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="pharmacies">
          <Layout><Pharmacies /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="natural-stores" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="pharmacies">
          <Layout><NaturalStores /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="commerces" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="pharmacies">
          <Layout><Commerces /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="specialties" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="doctors">
          <Layout><Specialties /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="drugstores" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="pharmacies">
          <Layout><Drugstores /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />

    <Route path="warehouse" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'store_manager']}>
        <Layout><WarehouseLayout /></Layout>
      </ProtectedRoute>
    } />

    <Route path="visits" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="visits">
          <Layout><Visits /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="products" element={
      <ProtectedRoute>
        <Layout><Products /></Layout>
      </ProtectedRoute>
    } />
    <Route path="muestras" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="sample_banks">
          <Layout><Samples /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="material-pop" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="sample_banks">
          <Layout><MaterialPOP /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="sample-banks" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="sample_banks">
          <Layout><SampleBanks /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="quotes" element={
      <ProtectedRoute>
        <Layout><Quotes /></Layout>
      </ProtectedRoute>
    } />
    <Route path="faq" element={
      <ProtectedRoute>
        <Layout><FAQ /></Layout>
      </ProtectedRoute>
    } />
    <Route path="baremos" element={
      <ProtectedRoute>
        <Layout><Baremos /></Layout>
      </ProtectedRoute>
    } />
    <Route path="cycles" element={
      <ProtectedRoute>
        <Layout><Cycles /></Layout>
      </ProtectedRoute>
    } />
    <Route path="objectives" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="objectives">
          <Layout><Objectives /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="expenses" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="expenses">
          <Layout><Expenses /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="reports" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'coordinator', 'supervisor']}>
        <ModuleGuard moduleKey="reports">
          <Layout><Reports /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="health-centers" element={
      <ProtectedRoute>
        <Layout><HealthCenters /></Layout>
      </ProtectedRoute>
    } />
    <Route path="work-processes" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="pmbok">
          <Layout><WorkProcesses /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="notifications" element={
      <ProtectedRoute>
        <Layout><Notifications /></Layout>
      </ProtectedRoute>
    } />
    <Route path="users" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'coordinator', 'supervisor']}>
        <Layout><Users /></Layout>
      </ProtectedRoute>
    } />
    <Route path="zones" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <ModuleGuard moduleKey="zones">
          <Layout><Zones /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="hr" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <ModuleGuard moduleKey="hr">
          <Layout><HumanResources /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="admin/hr/recruitment" element={
      <ProtectedRoute allowedRoles={['master']}>
        <ModuleGuard moduleKey="hr">
          <Layout><HRRecruitment /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="admin/pmbok-master" element={
      <ProtectedRoute allowedRoles={['master']}>
        <ModuleGuard moduleKey="pmbok">
          <Layout><PMBOKMaster /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="admin/crm" element={<Navigate to="/sales-pipeline" replace />} />
    <Route path="sales-pipeline" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="sales_pipeline">
          <Layout><SalesPipeline /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="master-panel" element={
      <ProtectedRoute allowedRoles={['master']}>
        <Layout><MasterPanel /></Layout>
      </ProtectedRoute>
    } />
    <Route path="admin/theme-builder" element={
      <ProtectedRoute allowedRoles={['master', 'admin']}>
        <Layout><ThemeBuilder /></Layout>
      </ProtectedRoute>
    } />
    <Route path="dashboard-master" element={
      <ProtectedRoute allowedRoles={['master', 'admin']}>
        <Layout><Navigate to="/dashboard" replace /></Layout>
      </ProtectedRoute>
    } />
    <Route path="finance-monitor" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <ModuleGuard moduleKey="finance">
          <Layout><FinanceMonitor /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="documentos" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <ModuleGuard moduleKey="documents">
          <Layout><DocumentCenter /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="settings" element={
      <ProtectedRoute>
        <Layout><Settings /></Layout>
      </ProtectedRoute>
    } />
    <Route path="help" element={
      <ProtectedRoute>
        <Layout><Help /></Layout>
      </ProtectedRoute>
    } />
    <Route path="transfer-orders" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'telemarketing', 'coordinator', 'supervisor', 'representative']}>
        <ModuleGuard moduleKey="transfers">
          <Layout><TransferOrders /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="coverage-map" element={
      <ProtectedRoute>
        <ModuleGuard moduleKey="coverage_map">
          <Layout><CoverageMap /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="promotional-cycles" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'telemarketing']}>
        <ModuleGuard moduleKey="cycles">
          <Layout><PromotionalCycles /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="planning/cycles" element={<Navigate to="/promotional-cycles" replace />} />
    <Route path="documentation" element={
      <ProtectedRoute>
        <Layout><Documentation /></Layout>
      </ProtectedRoute>
    } />
    <Route path="billing" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <ModuleGuard moduleKey="finance">
          <Layout><Billing /></Layout>
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="logs" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <Layout><AuditLogs /></Layout>
      </ProtectedRoute>
    } />

    {/* Master SaaS Modules */}
    <Route path="master/tickets" element={
      <ProtectedRoute allowedRoles={['master']}>
        <Layout><TicketList /></Layout>
      </ProtectedRoute>
    } />
    <Route path="master/logs" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <Layout><AuditLogs /></Layout>
      </ProtectedRoute>
    } />
    <Route path="master/billing" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <Layout><BillingManager /></Layout>
      </ProtectedRoute>
    } />
    <Route path="master/alerts" element={
      <ProtectedRoute allowedRoles={['master']}>
        <Layout><SystemAlerts /></Layout>
      </ProtectedRoute>
    } />
    <Route path="master/plans" element={
      <ProtectedRoute allowedRoles={['master']}>
        <Layout><PlanManager /></Layout>
      </ProtectedRoute>
    } />
    <Route path="master/landing" element={
      <ProtectedRoute allowedRoles={['master']}>
        <Layout><LandingEditor /></Layout>
      </ProtectedRoute>
    } />
    <Route path="master/compensation" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <Layout><CompensationConfig /></Layout>
      </ProtectedRoute>
    } />
    <Route path="commercial/payouts" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'representative']}>
        <Layout><PayoutDashboard /></Layout>
      </ProtectedRoute>
    } />
    {/* Catch-all relative to this component */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <AuthProvider>
          <LazyMotion features={loadFeatures} strict>
            <MockDataProvider>
              <DemoDataSeeder />
              <OrganizationProvider>
                <CustomThemeProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter
                      future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                      }}
                    >
                      <Suspense fallback={<PageLoader />}>
                        <RoutesWithRemount>
                          <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/auth" element={<AuthPage />} />

                            {/* Demo Landing - Initiates Demo Mode */}
                            <Route path="/demo" element={<DemoPage />} />

                            {/* Isolated Demo Routes Cluster */}
                            <Route path="/demo/*" element={<AppContent />} />

                            {/* Main Application Routes Cluster */}
                            <Route path="/*" element={<AppContent />} />

                            <Route path="/onboarding" element={
                              <ProtectedRoute>
                                <OnboardingWizard />
                              </ProtectedRoute>
                            } />
                            <Route path="/product/:id" element={<PublicProductPage />} />

                            {/* Global Catch-all */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </RoutesWithRemount>
                      </Suspense>
                    </BrowserRouter>
                  </TooltipProvider>
                </CustomThemeProvider>
              </OrganizationProvider>
            </MockDataProvider>
          </LazyMotion>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
