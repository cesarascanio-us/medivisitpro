// MediVisitPro - Optimized with Lazy Loading & SEO
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OrganizationProvider } from "./hooks/useOrganization";
import { AuthProvider } from "./components/auth/AuthProvider";
import { DemoDataSeeder } from "@/components/demo/DemoDataSeeder";
import { MockDataProvider } from "@/contexts/MockDataProvider";
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Eager load critical pages for faster First Contentful Paint (FCP)
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

// Lazy load everything else to reduce initial bundle size
const DashboardRouter = lazy(() => import("./pages/DashboardRouter"));
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
const Pharmacies = lazy(() => import("./pages/Pharmacies"));
const NaturalStores = lazy(() => import("./pages/NaturalStores"));
const Specialties = lazy(() => import("./pages/Specialties"));
const Drugstores = lazy(() => import("./pages/Drugstores"));
const DemoPage = lazy(() => import("./pages/DemoPage"));

const Users = lazy(() => import("./pages/Users"));
const Zones = lazy(() => import("./pages/Zones"));
const MasterPanel = lazy(() => import("./pages/MasterPanel"));
const TransferOrders = lazy(() => import("./pages/TransferOrders"));
const CoverageMap = lazy(() => import("./pages/CoverageMap"));
const PromotionalCycles = lazy(() => import("./pages/PromotionalCycles"));
const DashboardMaster = lazy(() => import("./pages/DashboardMaster"));

const PublicProductPage = lazy(() => import("./pages/Public/ProductPage"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Billing = lazy(() => import("./pages/Billing"));
const TicketList = lazy(() => import("./pages/Master/Tickets/TicketList"));
const AuditLogs = lazy(() => import("./pages/Master/Logs/AuditLogs"));
const BillingManager = lazy(() => import("./pages/Master/Billing/BillingManager"));
const SystemAlerts = lazy(() => import("./pages/Master/Reminders/SystemAlerts"));
const PlanManager = lazy(() => import("./pages/Master/Memberships/PlanManager"));
const LandingEditor = lazy(() => import("./pages/Master/LandingEditor"));
const OnboardingWizard = lazy(() => import("./components/onboarding/OnboardingWizard"));

const WarehouseLayout = lazy(() => import("@/components/warehouse/WarehouseLayout"));

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
  }, [location.pathname]);

  return <div key={location.pathname} style={{ display: 'contents' }}>{children}</div>;
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
        <Layout><Agenda /></Layout>
      </ProtectedRoute>
    } />
    <Route path="planner" element={
      <ProtectedRoute>
        <Layout><Planner /></Layout>
      </ProtectedRoute>
    } />
    <Route path="events" element={
      <ProtectedRoute>
        <Layout><Events /></Layout>
      </ProtectedRoute>
    } />
    <Route path="contacts" element={
      <ProtectedRoute>
        <Layout><Contacts /></Layout>
      </ProtectedRoute>
    } />
    <Route path="doctors" element={
      <ProtectedRoute>
        <Layout><Doctors /></Layout>
      </ProtectedRoute>
    } />
    <Route path="pharmacies" element={
      <ProtectedRoute>
        <Layout><Pharmacies /></Layout>
      </ProtectedRoute>
    } />
    <Route path="natural-stores" element={
      <ProtectedRoute>
        <Layout><NaturalStores /></Layout>
      </ProtectedRoute>
    } />
    <Route path="specialties" element={
      <ProtectedRoute>
        <Layout><Specialties /></Layout>
      </ProtectedRoute>
    } />
    <Route path="drugstores" element={
      <ProtectedRoute>
        <Layout><Drugstores /></Layout>
      </ProtectedRoute>
    } />

    <Route path="warehouse" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'store_manager']}>
        <Layout><WarehouseLayout /></Layout>
      </ProtectedRoute>
    } />

    <Route path="visits" element={
      <ProtectedRoute>
        <Layout><Visits /></Layout>
      </ProtectedRoute>
    } />
    <Route path="products" element={
      <ProtectedRoute>
        <Layout><Products /></Layout>
      </ProtectedRoute>
    } />
    <Route path="muestras" element={
      <ProtectedRoute>
        <Layout><Samples /></Layout>
      </ProtectedRoute>
    } />
    <Route path="material-pop" element={
      <ProtectedRoute>
        <Layout><MaterialPOP /></Layout>
      </ProtectedRoute>
    } />
    <Route path="sample-banks" element={
      <ProtectedRoute>
        <Layout><SampleBanks /></Layout>
      </ProtectedRoute>
    } />
    <Route path="objectives" element={
      <ProtectedRoute>
        <Layout><Objectives /></Layout>
      </ProtectedRoute>
    } />
    <Route path="expenses" element={
      <ProtectedRoute>
        <Layout><Expenses /></Layout>
      </ProtectedRoute>
    } />
    <Route path="reports" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'coordinator', 'supervisor']}>
        <Layout><Reports /></Layout>
      </ProtectedRoute>
    } />
    <Route path="health-centers" element={
      <ProtectedRoute>
        <Layout><HealthCenters /></Layout>
      </ProtectedRoute>
    } />
    <Route path="work-processes" element={
      <ProtectedRoute>
        <Layout><WorkProcesses /></Layout>
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
        <Layout><Zones /></Layout>
      </ProtectedRoute>
    } />
    <Route path="master-panel" element={
      <ProtectedRoute allowedRoles={['master']}>
        <Layout><MasterPanel /></Layout>
      </ProtectedRoute>
    } />
    <Route path="dashboard-master" element={
      <ProtectedRoute allowedRoles={['master', 'admin']}>
        <Layout><DashboardMaster /></Layout>
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
        <Layout><TransferOrders /></Layout>
      </ProtectedRoute>
    } />
    <Route path="coverage-map" element={
      <ProtectedRoute>
        <Layout><CoverageMap /></Layout>
      </ProtectedRoute>
    } />
    <Route path="promotional-cycles" element={
      <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'telemarketing']}>
        <Layout><PromotionalCycles /></Layout>
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
        <Layout><Billing /></Layout>
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
    {/* Catch-all relative to this component */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <MockDataProvider>
          <DemoDataSeeder />
          <OrganizationProvider>
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
          </OrganizationProvider>
        </MockDataProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
