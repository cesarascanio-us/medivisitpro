// MediVisitPro - Clean Production v1.0.1 - 2025-12-28
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import DashboardRouter from "./pages/DashboardRouter";
import Dashboard from "./pages/Dashboard";
import DashboardSupervisor from "./pages/DashboardSupervisor";
import Agenda from "./pages/Agenda";
import Contacts from "./pages/Contacts";
import Visits from "./pages/Visits";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import HealthCenters from "./pages/HealthCenters";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import WorkProcesses from "./pages/WorkProcesses";
import Events from "./pages/Events";
import Objectives from "./pages/Objectives";
import Samples from "./pages/Samples";
import MaterialPOP from "./pages/MaterialPOP";
import SampleBanks from "./pages/SampleBanks";
import Expenses from "./pages/Expenses";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import Planner from "./pages/Planner";
import Doctors from "./pages/Doctors";
import Pharmacies from "./pages/Pharmacies";
import NaturalStores from "./pages/NaturalStores";
import Specialties from "./pages/Specialties";
import Drugstores from "./pages/Drugstores";
import DemoPage from "./pages/DemoPage";

import Users from "./pages/Users";
import Zones from "./pages/Zones";
import MasterPanel from "./pages/MasterPanel";
import TransferOrders from "./pages/TransferOrders";
import CoverageMap from "./pages/CoverageMap";
import PromotionalCycles from "./pages/PromotionalCycles";
import DashboardMaster from "./pages/DashboardMaster";
import CyclesPage from "./pages/Planning/Cycles";
import WeeklyScheduler from "./pages/Planning/WeeklyScheduler";
import VisitExecutionPage from "./pages/Visits/VisitExecution";
import OrderBuilder from "./pages/Commercial/OrderBuilder";
import ExpenseReport from "./pages/Expenses/ExpenseReport";
import AssetList from "./pages/Resources/AssetList";
import PublicProductPage from "./pages/Public/ProductPage";
import Documentation from "./pages/Documentation";
import Billing from "./pages/Billing";
import TicketList from "./pages/Master/Tickets/TicketList";
import AuditLogs from "./pages/Master/Logs/AuditLogs";
import BillingManager from "./pages/Master/Billing/BillingManager";
import SystemAlerts from "./pages/Master/Reminders/SystemAlerts";
import PlanManager from "./pages/Master/Memberships/PlanManager";
import { OrganizationProvider } from "./hooks/useOrganization";
import { AuthProvider } from "./components/auth/AuthProvider";
import OnboardingWizard from "./components/onboarding/OnboardingWizard";

import WarehouseLayout from "@/components/warehouse/WarehouseLayout";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (for offline)
      retry: 2,
    },
  },
});

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DemoDataSeeder } from "@/components/demo/DemoDataSeeder";
import { MockDataProvider } from "@/contexts/MockDataProvider";

// Legacy InventorySeeder - now handled by DemoDataSeeder
const InventorySeeder = () => {
  const { user } = useAuth();
  useEffect(() => {
    const seed = async () => {
      if (!user) return;
      console.log("Checking inventory for seeding...");
      const { data } = await supabase.from('inventario_muestras').select('id').eq('user_id', user.id).limit(1);
      if (!data || data.length === 0) {
        console.log("Seeding inventory...");
        const { data: prods } = await supabase.from('products').select('id').limit(1);
        if (prods && prods[0]) {
          await supabase.from('inventario_muestras').insert({
            user_id: user.id,
            product_id: prods[0].id,
            cantidad_asignada: 50,
            lote: 'DEMO-SEED-001',
            fecha_vencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
          });
          console.log("Inventory seeded!");
        }
      }
    };
    seed();
  }, [user]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MockDataProvider>
        <DemoDataSeeder />
        <InventorySeeder />
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

              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingWizard />
                  </ProtectedRoute>
                } />
                <Route path="/product/:id" element={<PublicProductPage />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout><DashboardRouter /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/agenda" element={
                  <ProtectedRoute>
                    <Layout><Agenda /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/planner" element={
                  <ProtectedRoute>
                    <Layout><Planner /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/events" element={
                  <ProtectedRoute>
                    <Layout><Events /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/contacts" element={
                  <ProtectedRoute>
                    <Layout><Contacts /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/doctors" element={
                  <ProtectedRoute>
                    <Layout><Doctors /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/pharmacies" element={
                  <ProtectedRoute>
                    <Layout><Pharmacies /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/natural-stores" element={
                  <ProtectedRoute>
                    <Layout><NaturalStores /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/specialties" element={
                  <ProtectedRoute>
                    <Layout><Specialties /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/drugstores" element={
                  <ProtectedRoute>
                    <Layout><Drugstores /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/warehouse" element={
                  <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'store_manager']}>
                    <Layout><WarehouseLayout /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/visits" element={
                  <ProtectedRoute>
                    <Layout><Visits /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute>
                    <Layout><Products /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/muestras" element={
                  <ProtectedRoute>
                    <Layout><Samples /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/material-pop" element={
                  <ProtectedRoute>
                    <Layout><MaterialPOP /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/sample-banks" element={
                  <ProtectedRoute>
                    <Layout><SampleBanks /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/objectives" element={
                  <ProtectedRoute>
                    <Layout><Objectives /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/expenses" element={
                  <ProtectedRoute>
                    <Layout><Expenses /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'coordinator', 'supervisor']}>
                    <Layout><Reports /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/health-centers" element={
                  <ProtectedRoute>
                    <Layout><HealthCenters /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/work-processes" element={
                  <ProtectedRoute>
                    <Layout><WorkProcesses /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Layout><Notifications /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'coordinator', 'supervisor']}>
                    <Layout><Users /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/zones" element={
                  <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
                    <Layout><Zones /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/master-panel" element={
                  <ProtectedRoute allowedRoles={['master']}>
                    <Layout><MasterPanel /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard-master" element={
                  <ProtectedRoute allowedRoles={['master', 'admin']}>
                    <Layout><DashboardMaster /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout><Settings /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/help" element={
                  <ProtectedRoute>
                    <Layout><Help /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/transfer-orders" element={
                  <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'telemarketing', 'coordinator', 'supervisor']}>
                    <Layout><TransferOrders /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/coverage-map" element={
                  <ProtectedRoute>
                    <Layout><CoverageMap /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/promotional-cycles" element={
                  <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'telemarketing']}>
                    <Layout><PromotionalCycles /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/documentation" element={
                  <ProtectedRoute>
                    <Layout><Documentation /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/billing" element={
                  <ProtectedRoute allowedRoles={['master']}>
                    <Layout><Billing /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/planning/cycles" element={
                  <ProtectedRoute allowedRoles={['master', 'admin', 'manager']}>
                    <Layout><CyclesPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/planning/weekly" element={
                  <ProtectedRoute>
                    <Layout><WeeklyScheduler /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/visits/execution/:id" element={
                  <ProtectedRoute>
                    <Layout><VisitExecutionPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/commercial/builder" element={
                  <ProtectedRoute allowedRoles={['master', 'admin', 'manager', 'telemarketing']}>
                    <Layout><OrderBuilder /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/resources/expenses" element={
                  <ProtectedRoute>
                    <Layout><ExpenseReport /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/resources/assets" element={
                  <ProtectedRoute>
                    <Layout><AssetList /></Layout>
                  </ProtectedRoute>
                } />

                {/* Master SaaS Modules */}
                <Route path="/master/tickets" element={
                  <ProtectedRoute allowedRoles={['master']}>
                    <Layout><TicketList /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/master/logs" element={
                  <ProtectedRoute allowedRoles={['master']}>
                    <Layout><AuditLogs /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/master/billing" element={
                  <ProtectedRoute allowedRoles={['master']}>
                    <Layout><BillingManager /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/master/alerts" element={
                  <ProtectedRoute allowedRoles={['master']}>
                    <Layout><SystemAlerts /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/master/plans" element={
                  <ProtectedRoute allowedRoles={['master']}>
                    <Layout><PlanManager /></Layout>
                  </ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </OrganizationProvider>
      </MockDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

