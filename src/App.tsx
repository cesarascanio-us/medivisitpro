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
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext";
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
const VisitExecution = lazy(() => import("./pages/Visits/VisitExecution"));
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
const RoutePlanner = lazy(() => import("./pages/RoutePlanner"));
const NaturalStores = lazy(() => import("./pages/NaturalStores"));
const Commerces = lazy(() => import("./pages/Commerces"));
const Specialties = lazy(() => import("./pages/Specialties"));
const Drugstores = lazy(() => import("./pages/Drugstores_Elite"));
const DemoPage = lazy(() => import("./pages/DemoPage"));

const PortalFarmacia = lazy(() => import("./pages/portals/PortalFarmacia"));
const PortalCompras = lazy(() => import("./pages/portals/PortalCompras"));

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
const FinanceAdmin = lazy(() => import("./pages/FinanceAdmin"));
const OperationsPanel = lazy(() => import("./pages/OperationsPanel"));

const PublicProductPage = lazy(() => import("./pages/Public/ProductPage"));
const Documentation = lazy(() => import("./pages/Documentation"));

const Billing = lazy(() => import("./pages/Billing"));
const TicketList = lazy(() => import("./pages/Master/Tickets/TicketList"));
const AuditLogs = lazy(() => import("./pages/Master/Logs/AuditLogs"));
const BillingManager = lazy(() => import("./pages/Master/Billing/BillingManager"));
const RoleManager = lazy(() => import("./pages/RoleManager"));
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
const CoachingDashboard = lazy(() => import("./pages/CoachingDashboard"));
const University = lazy(() => import("./pages/University"));
const Rewards = lazy(() => import("./pages/Rewards"));
const AcademyAdmin = lazy(() => import("./pages/admin/AcademyAdmin"));
const Baremos = lazy(() => import("./pages/Baremos"));

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
      refetchOnWindowFocus: false, // Prevents app from re-syncing when switching windows
    },
  },
});

// Centralized App Content to avoid duplication between / and /demo
const AppContent = () => (
  <Routes>
    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      {/* Protected Routes */}
    <Route path="dashboard" element={
      
        <DashboardRouter />
      
    } />
    <Route path="agenda" element={
      
        <ModuleGuard moduleKey="agenda">
          <Agenda />
        </ModuleGuard>
      
    } />
    <Route path="planner" element={
      
        <ModuleGuard moduleKey="agenda">
          <Planner />
        </ModuleGuard>
      
    } />
    <Route path="route-planner" element={
      
        <ModuleGuard moduleKey="agenda">
          <RoutePlanner />
        </ModuleGuard>
      
    } />
    <Route path="events" element={
      
        <ModuleGuard moduleKey="agenda">
          <Events />
        </ModuleGuard>
      
    } />
    <Route path="contacts" element={
      
        <ModuleGuard moduleKey="contacts">
          <Contacts />
        </ModuleGuard>
      
    } />
    <Route path="doctors" element={
      
        <ModuleGuard moduleKey="doctors">
          <Doctors />
        </ModuleGuard>
      
    } />
    <Route path="pharmacies" element={
      
        <ModuleGuard moduleKey="pharmacies">
          <Pharmacies />
        </ModuleGuard>
      
    } />
    <Route path="natural-stores" element={
      
        <ModuleGuard moduleKey="pharmacies">
          <NaturalStores />
        </ModuleGuard>
      
    } />
    <Route path="commerces" element={
      
        <ModuleGuard moduleKey="pharmacies">
          <Commerces />
        </ModuleGuard>
      
    } />
    <Route path="specialties" element={
      
        <ModuleGuard moduleKey="doctors">
          <Specialties />
        </ModuleGuard>
      
    } />
    <Route path="drugstores" element={
      
        <ModuleGuard moduleKey="pharmacies">
          <Drugstores />
        </ModuleGuard>
      
    } />

    {/* Portales Externos B2B/Institucional */}
    <Route path="portal/farmacia" element={
      <ProtectedRoute allowedRoles={['farmacia', 'pharmacist', 'master']}>
        <PortalFarmacia />
      </ProtectedRoute>
    } />
    <Route path="portal/compras" element={
      <ProtectedRoute allowedRoles={['compras', 'buyer', 'master']}>
        <PortalCompras />
      </ProtectedRoute>
    } />

    <Route path="warehouse" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'store_manager']}>
        <WarehouseLayout />
      </ProtectedRoute>
    } />

    <Route path="visits" element={
      
        <ModuleGuard moduleKey="visits">
          <Visits />
        </ModuleGuard>
      
    } />
    <Route path="visits/execution/:id" element={
      <ModuleGuard moduleKey="visits">
        <VisitExecution />
      </ModuleGuard>
    } />
    <Route path="products" element={
      
        <Products />
      
    } />
    <Route path="samples" element={
      
        <ModuleGuard moduleKey="sample_banks">
          <Samples />
        </ModuleGuard>
      
    } />
    <Route path="material-pop" element={
      
        <ModuleGuard moduleKey="sample_banks">
          <MaterialPOP />
        </ModuleGuard>
      
    } />
    <Route path="sample-banks" element={
      
        <ModuleGuard moduleKey="sample_banks">
          <SampleBanks />
        </ModuleGuard>
      
    } />
    <Route path="quotes" element={
      
        <Quotes />
      
    } />
    <Route path="coaching" element={
      
        <CoachingDashboard />
      
    } />
    <Route path="university" element={
        
        <University />
        
      } />
      <Route path="rewards" element={
        
        <Rewards />
        
      } />
      <Route path="academy-admin" element={
        <ModuleGuard allowedRoles={['master', 'admin', 'manager', 'gerente']}>
          <AcademyAdmin />
        </ModuleGuard>
      } />
    <Route path="faq" element={
      
        <FAQ />
      
    } />
    <Route path="baremos" element={
      
        <Baremos />
      
    } />
    <Route path="cycles" element={<Navigate to="/promotional-cycles" replace />} />
    <Route path="objectives" element={
      
        <ModuleGuard moduleKey="objectives">
          <Objectives />
        </ModuleGuard>
      
    } />
    <Route path="expenses" element={
      
        <ModuleGuard moduleKey="expenses">
          <Expenses />
        </ModuleGuard>
      
    } />
    <Route path="reports" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'coordinator', 'supervisor']}>
        <ModuleGuard moduleKey="reports">
          <Reports />
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="health-centers" element={
      
        <HealthCenters />
      
    } />
    <Route path="work-processes" element={
      
        <ModuleGuard moduleKey="pmbok">
          <WorkProcesses />
        </ModuleGuard>
      
    } />
    <Route path="notifications" element={
      
        <Notifications />
      
    } />
    <Route path="users" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'coordinator', 'supervisor']}>
        <Users />
      </ProtectedRoute>
    } />
    <Route path="zones" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <ModuleGuard moduleKey="zones">
          <Zones />
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="hr" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <ModuleGuard moduleKey="hr">
          <HumanResources />
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="admin/hr/recruitment" element={
      <ProtectedRoute allowedRoles={['master']}>
        <ModuleGuard moduleKey="hr">
          <HRRecruitment />
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="admin/pmbok-master" element={
      <ProtectedRoute allowedRoles={['master']}>
        <ModuleGuard moduleKey="pmbok">
          <PMBOKMaster />
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="admin/crm" element={<Navigate to="/sales-pipeline" replace />} />
    <Route path="sales-pipeline" element={
      
        <ModuleGuard moduleKey="sales_pipeline">
          <SalesPipeline />
        </ModuleGuard>
      
    } />
    <Route path="master-panel" element={
      <ProtectedRoute allowedRoles={['master']}>
        <MasterPanel />
      </ProtectedRoute>
    } />
    <Route path="admin/theme-builder" element={
      <ProtectedRoute allowedRoles={['master', 'admin']}>
        <ThemeBuilder />
      </ProtectedRoute>
    } />
    <Route path="dashboard-master" element={
      <ProtectedRoute allowedRoles={['master', 'admin']}>
        <Navigate to="/dashboard" replace />
      </ProtectedRoute>
    } />
    <Route path="finance-monitor" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <ModuleGuard moduleKey="finance">
          <FinanceMonitor />
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="finance-admin" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'finance']}>
        <FinanceAdmin />
      </ProtectedRoute>
    } />
    <Route path="operations" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'operations']}>
        <OperationsPanel />
      </ProtectedRoute>
    } />
    <Route path="documentos" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <ModuleGuard moduleKey="documents">
          <DocumentCenter />
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="settings" element={
      
        <Settings />
      
    } />
    <Route path="help" element={
      
        <Help />
      
    } />
    <Route path="transfer-orders" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'telemarketing', 'coordinator', 'supervisor', 'representative']}>
        <ModuleGuard moduleKey="transfers">
          <TransferOrders />
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="coverage-map" element={
      
        <ModuleGuard moduleKey="coverage_map">
          <CoverageMap />
        </ModuleGuard>
      
    } />
    <Route path="promotional-cycles" element={
      
        <PromotionalCycles />
      
    } />
    <Route path="planning/cycles" element={<Navigate to="/promotional-cycles" replace />} />
    <Route path="documentation" element={
      
        <Documentation />
      
    } />
    <Route path="billing" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <ModuleGuard moduleKey="finance">
          <Billing />
        </ModuleGuard>
      </ProtectedRoute>
    } />
    <Route path="logs" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
        <AuditLogs />
      </ProtectedRoute>
    } />

    {/* Master SaaS Modules */}
    <Route path="master/tickets" element={
      <ProtectedRoute allowedRoles={['master']}>
        <TicketList />
      </ProtectedRoute>
    } />
    <Route path="master/logs" element={
      <ProtectedRoute allowedRoles={['master']}>
        <AuditLogs />
      </ProtectedRoute>
    } />
    <Route path="master/billing" element={
      <ProtectedRoute allowedRoles={['master']}>
        <BillingManager />
      </ProtectedRoute>
    } />
    <Route path="master/alerts" element={
      <ProtectedRoute allowedRoles={['master']}>
        <SystemAlerts />
      </ProtectedRoute>
    } />
    <Route path="master/plans" element={
      <ProtectedRoute allowedRoles={['master']}>
        <PlanManager />
      </ProtectedRoute>
    } />
    <Route path="master/landing" element={
      <ProtectedRoute allowedRoles={['master']}>
        <LandingEditor />
      </ProtectedRoute>
    } />

    <Route path="roles" element={
      <ProtectedRoute allowedRoles={['master', 'admin']}>
        <RoleManager />
      </ProtectedRoute>
    } />

    <Route path="master/compensation" element={
      <ProtectedRoute allowedRoles={['master']}>
        <CompensationConfig />
      </ProtectedRoute>
    } />
    <Route path="commercial/payouts" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'representative']}>
        <PayoutDashboard />
      </ProtectedRoute>
    } />
    {/* Catch-all relative to this component */}
    <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
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
                        v7_startTransition: false,
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
