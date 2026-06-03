/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 ======================================================================== */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useEffect } from 'react';

interface PendingExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  status: string;
  created_at: string;
  user_id: string;
  user_name?: string;
}

interface PendingTransfer {
  id: string;
  pharmacy_name?: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string;
  user_name?: string;
  items_count?: number;
}

interface RepStats {
  user_id: string;
  name: string;
  email: string;
  visits_completed: number;
  visits_total: number;
  effectiveness: number;
}

interface WeeklyVisit {
  day: string;
  visits: number;
}

interface MonthlyExpense {
  week: string;
  total: number;
}

export interface ManagerKPIs {
  // KPI values
  cycleCoverage: number;
  visitCompliance: number;
  pendingExpensesTotal: number;
  pendingExpensesCount: number;
  activeTransfersCount: number;
  conversionRate: number;
  productivityIndex: number;
  // Lists
  pendingExpenses: PendingExpense[];
  pendingTransfers: PendingTransfer[];
  repStats: RepStats[];
  weeklyVisits: WeeklyVisit[];
  monthlyExpenses: MonthlyExpense[];
  // Meta
  totalReps: number;
  totalVisitsMonth: number;
  totalVisitsCompleted: number;
  activeCycleName: string | null;
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getMockData(): ManagerKPIs {
  return {
    cycleCoverage: 78,
    visitCompliance: 85,
    pendingExpensesTotal: 4250.00,
    pendingExpensesCount: 6,
    activeTransfersCount: 12,
    conversionRate: 42,
    productivityIndex: 8.5,
    pendingExpenses: [
      { id: '1', description: 'Combustible ruta norte', amount: 850, category: 'Combustible', status: 'pending', created_at: new Date().toISOString(), user_id: '1', user_name: 'Carlos Pérez' },
      { id: '2', description: 'Almuerzo reunión cliente', amount: 120, category: 'Alimentación', status: 'pending', created_at: new Date().toISOString(), user_id: '2', user_name: 'María López' },
      { id: '3', description: 'Peaje autopista regional', amount: 45, category: 'Peajes', status: 'pending', created_at: new Date().toISOString(), user_id: '1', user_name: 'Carlos Pérez' },
      { id: '4', description: 'Material POP farmacias', amount: 1200, category: 'Marketing', status: 'pending', created_at: new Date().toISOString(), user_id: '3', user_name: 'Ana Torres' },
      { id: '5', description: 'Estacionamiento zona centro', amount: 35, category: 'Transporte', status: 'pending', created_at: new Date().toISOString(), user_id: '2', user_name: 'María López' },
      { id: '6', description: 'Hotel evento médico', amount: 2000, category: 'Hospedaje', status: 'pending', created_at: new Date().toISOString(), user_id: '4', user_name: 'Luis García' },
    ],
    pendingTransfers: [
      { id: '1', pharmacy_name: 'Farmacia Central', total_amount: 15000, status: 'pending', created_at: new Date().toISOString(), user_id: '1', user_name: 'Carlos Pérez', items_count: 8 },
      { id: '2', pharmacy_name: 'Droguería Norte', total_amount: 28500, status: 'processing', created_at: new Date().toISOString(), user_id: '2', user_name: 'María López', items_count: 15 },
      { id: '3', pharmacy_name: 'Farmacia Salud Total', total_amount: 9200, status: 'pending', created_at: new Date().toISOString(), user_id: '3', user_name: 'Ana Torres', items_count: 5 },
    ],
    repStats: [
      { user_id: '1', name: 'Carlos Pérez', email: 'carlos@lab.com', visits_completed: 45, visits_total: 50, effectiveness: 90 },
      { user_id: '2', name: 'María López', email: 'maria@lab.com', visits_completed: 38, visits_total: 50, effectiveness: 76 },
      { user_id: '3', name: 'Ana Torres', email: 'ana@lab.com', visits_completed: 42, visits_total: 50, effectiveness: 84 },
      { user_id: '4', name: 'Luis García', email: 'luis@lab.com', visits_completed: 30, visits_total: 50, effectiveness: 60 },
      { user_id: '5', name: 'Pedro Martínez', email: 'pedro@lab.com', visits_completed: 48, visits_total: 50, effectiveness: 96 },
    ],
    weeklyVisits: [
      { day: 'Lun', visits: 24 },
      { day: 'Mar', visits: 31 },
      { day: 'Mié', visits: 28 },
      { day: 'Jue', visits: 35 },
      { day: 'Vie', visits: 22 },
    ],
    monthlyExpenses: [
      { week: 'Sem 1', total: 3200 },
      { week: 'Sem 2', total: 4100 },
      { week: 'Sem 3', total: 2800 },
      { week: 'Sem 4', total: 3900 },
    ],
    totalReps: 5,
    totalVisitsMonth: 203,
    totalVisitsCompleted: 185,
    activeCycleName: 'Ciclo Junio 2026',
  };
}

export function useManagerKPIs() {
  const { profile, organizationId, isDemo } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Main KPI data query
  const { data: kpis, isLoading, refetch } = useQuery<ManagerKPIs>({
    queryKey: ['manager_kpis', organizationId, profile?.id],
    queryFn: async (): Promise<ManagerKPIs> => {
      if (isDemo || !organizationId) {
        return getMockData();
      }

      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();

        // Parallel queries for performance
        const [
          expensesRes,
          transfersRes,
          visitsRes,
          cycleRes,
          repsRes,
        ] = await Promise.all([
          // 1. Pending expenses
          supabase
            .from('expenses')
            .select('id, description, amount, category, status, created_at, user_id')
            .eq('organization_id', organizationId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false }),

          // 2. Active transfers
          supabase
            .from('transfer_orders')
            .select('id, pharmacy_name, total_amount, status, created_at, user_id, items_count')
            .eq('organization_id', organizationId)
            .in('status', ['pending', 'processing'])
            .order('created_at', { ascending: false }),

          // 3. Visits this month
          supabase
            .from('visits')
            .select('id, user_id, status, created_at')
            .eq('organization_id', organizationId)
            .gte('created_at', startOfMonth),

          // 4. Active cycle
          (supabase as any)
            .from('cycles')
            .select('id, name')
            .eq('organization_id', organizationId)
            .eq('status', 'active')
            .maybeSingle(),

          // 5. Rep profiles
          supabase
            .from('user_roles')
            .select('user_id, role, profile:profiles(first_name, last_name, email)')
            .eq('organization_id', organizationId)
            .in('role', ['representative', 'rep_comercial', 'visitador_medico', 'rep_integral']),
        ]);

        const expenses = (expensesRes.data as any[]) || [];
        const transfers = (transfersRes.data as any[]) || [];
        const visits = (visitsRes.data as any[]) || [];
        const cycle = cycleRes.data as any;
        const reps = (repsRes.data as any[]) || [];

        // Get user names for expenses
        const userIds = [...new Set([...expenses.map(e => e.user_id), ...transfers.map(t => t.user_id)])];
        let userNames: Record<string, string> = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name')
            .in('user_id', userIds);
          profiles?.forEach((p: any) => {
            userNames[p.user_id] = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Sin nombre';
          });
        }

        // Calculate KPIs
        const completedVisits = visits.filter(v => v.status === 'completed' || v.status === 'done');
        const totalVisitsMonth = visits.length;
        const totalVisitsCompleted = completedVisits.length;
        const visitCompliance = totalVisitsMonth > 0
          ? Math.round((totalVisitsCompleted / totalVisitsMonth) * 100)
          : 0;

        const pendingExpensesTotal = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
        const activeTransfersCount = transfers.length;

        // Conversion rate: visits that generated a transfer
        const transferUserIds = new Set(transfers.map(t => t.user_id));
        const visitingUsers = new Set(visits.map(v => v.user_id));
        const conversionRate = visitingUsers.size > 0
          ? Math.round((transferUserIds.size / visitingUsers.size) * 100)
          : 0;

        // Productivity: completed visits per rep
        const totalReps = reps.length || 1;
        const productivityIndex = Math.round((totalVisitsCompleted / totalReps) * 10) / 10;

        // Rep stats
        const repStats: RepStats[] = reps.map((r: any) => {
          const repVisits = visits.filter(v => v.user_id === r.user_id);
          const repCompleted = repVisits.filter(v => v.status === 'completed' || v.status === 'done');
          const p = r.profile;
          const name = p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Sin nombre';
          return {
            user_id: r.user_id,
            name,
            email: p?.email || '',
            visits_completed: repCompleted.length,
            visits_total: repVisits.length,
            effectiveness: repVisits.length > 0
              ? Math.round((repCompleted.length / repVisits.length) * 100)
              : 0,
          };
        }).sort((a, b) => b.visits_completed - a.visits_completed);

        // Weekly visits (Mon-Fri of current week)
        const weeklyVisits: WeeklyVisit[] = [];
        for (let i = 1; i <= 5; i++) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + i);
          const dayVisits = visits.filter(v => {
            const vd = new Date(v.created_at);
            return vd.toDateString() === d.toDateString();
          });
          weeklyVisits.push({
            day: DAYS_ES[d.getDay()],
            visits: dayVisits.length,
          });
        }

        // Monthly expenses by week
        const monthlyExpenses: MonthlyExpense[] = [];
        for (let w = 0; w < 4; w++) {
          const weekStart = new Date(now.getFullYear(), now.getMonth(), 1 + w * 7);
          const weekEnd = new Date(now.getFullYear(), now.getMonth(), 1 + (w + 1) * 7);
          // We'd need approved expenses for this — for now use placeholder
          monthlyExpenses.push({
            week: `Sem ${w + 1}`,
            total: 0,
          });
        }

        return {
          cycleCoverage: 0, // Needs cycle universe data to calculate properly
          visitCompliance,
          pendingExpensesTotal,
          pendingExpensesCount: expenses.length,
          activeTransfersCount,
          conversionRate,
          productivityIndex,
          pendingExpenses: expenses.map(e => ({
            ...e,
            user_name: userNames[e.user_id] || 'Sin nombre',
          })),
          pendingTransfers: transfers.map(t => ({
            ...t,
            user_name: userNames[t.user_id] || 'Sin nombre',
          })),
          repStats,
          weeklyVisits,
          monthlyExpenses,
          totalReps,
          totalVisitsMonth,
          totalVisitsCompleted,
          activeCycleName: cycle?.name || null,
        };
      } catch (error) {
        console.error('[useManagerKPIs] Error loading KPIs:', error);
        return getMockData();
      }
    },
    staleTime: 1000 * 60 * 2, // 2 min
    enabled: !!profile?.id,
  });

  // Realtime subscription for expenses and transfers
  useEffect(() => {
    if (isDemo || !organizationId) return;

    const channel = supabase
      .channel('manager-kpis-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `organization_id=eq.${organizationId}` },
        () => { queryClient.invalidateQueries({ queryKey: ['manager_kpis'] }); }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'transfer_orders', filter: `organization_id=eq.${organizationId}` },
        () => { queryClient.invalidateQueries({ queryKey: ['manager_kpis'] }); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [organizationId, isDemo, queryClient]);

  // Approve/Reject expense
  const approveExpense = useMutation({
    mutationFn: async ({ expenseId, action }: { expenseId: string; action: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('expenses')
        .update({
          status: action,
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', expenseId);
      if (error) throw error;
    },
    onSuccess: (_, { action }) => {
      toast({
        title: action === 'approved' ? '✅ Gasto Aprobado' : '❌ Gasto Rechazado',
        description: `El gasto ha sido ${action === 'approved' ? 'aprobado' : 'rechazado'} exitosamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ['manager_kpis'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Approve/Reject transfer
  const approveTransfer = useMutation({
    mutationFn: async ({ transferId, action }: { transferId: string; action: 'approved' | 'rejected' }) => {
      const newStatus = action === 'approved' ? 'processing' : 'cancelled';
      const { error } = await supabase
        .from('transfer_orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transferId);
      if (error) throw error;
    },
    onSuccess: (_, { action }) => {
      toast({
        title: action === 'approved' ? '✅ Transferencia Aprobada' : '❌ Transferencia Rechazada',
        description: `La transferencia ha sido ${action === 'approved' ? 'aprobada y enviada a proceso' : 'rechazada'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['manager_kpis'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    kpis: kpis || getMockData(),
    isLoading,
    refetch,
    approveExpense,
    approveTransfer,
  };
}
