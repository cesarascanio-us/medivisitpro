import { useQuery } from "@tanstack/react-query";
import { dashboardService, DashboardFilters } from "@/services/dashboardService";
import { kpiService } from "@/services/kpiService";



export function useDashboardVisits(startDate: string, filters: DashboardFilters) {
    return useQuery({
        queryKey: ['dashboard', 'visits', startDate, filters],
        queryFn: () => dashboardService.getVisits(startDate, filters)
    });
}

export function useDashboardOrders(startDate: string, filters: DashboardFilters) {
    return useQuery({
        queryKey: ['dashboard', 'orders', startDate, filters],
        queryFn: () => dashboardService.getOrders(startDate, filters)
    });
}

export function useDashboardProfilesRoles() {
    return useQuery({
        queryKey: ['dashboard', 'profiles-roles'],
        queryFn: () => dashboardService.getProfilesAndRoles()
    });
}

export function useDashboardZones() {
    return useQuery({
        queryKey: ['dashboard', 'zones'],
        queryFn: () => dashboardService.getZones()
    });
}

export function useDashboardKPIs() {
    return useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: () => dashboardService.getKpiData()
    });
}

export function usePendingOrders(filters?: DashboardFilters) {
    return useQuery({
        queryKey: ['dashboard', 'pending-orders', filters],
        queryFn: () => dashboardService.getPendingOrders(filters)
    });
}

export function useDashboardDroguerias() {
    return useQuery({
        queryKey: ['dashboard', 'droguerias'],
        queryFn: () => dashboardService.getDroguerias()
    });
}

export function useKpiSummary(userId: string) {
    return useQuery({
        queryKey: ['kpis', 'summary', userId],
        queryFn: () => kpiService.getSummary(userId),
        enabled: !!userId
    });
}

