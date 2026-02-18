import React, { createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MOCK_DATA } from '@/data/mockDemoData';

/**
 * Mock Data Context for Demo Mode
 * When isDemo = true, provides mock data instead of Supabase queries
 */

interface MockDataContextType {
    isDemo: boolean;
    pharmacies: typeof MOCK_DATA.pharmacies;
    doctors: typeof MOCK_DATA.doctors;
    contacts: typeof MOCK_DATA.contacts;
    drugstores: typeof MOCK_DATA.drugstores;
    drugstoreInventory: typeof MOCK_DATA.drugstoreInventory;
    healthCenters: typeof MOCK_DATA.healthCenters;
    products: typeof MOCK_DATA.products;
    materialPop: typeof MOCK_DATA.materialPop;
    visits: typeof MOCK_DATA.visits;
    inventory: typeof MOCK_DATA.inventory;
    objectives: typeof MOCK_DATA.objectives;
    dashboardStats: typeof MOCK_DATA.dashboardStats;
    cycles: typeof MOCK_DATA.cycles;
    weeklyPlans: typeof MOCK_DATA.weeklyPlans;
    planDetails: typeof MOCK_DATA.planDetails;
    sampleBanks: typeof MOCK_DATA.sampleBanks;
    bankInventory: typeof MOCK_DATA.bankInventory;
    events: typeof MOCK_DATA.events;
    sampleMovements: typeof MOCK_DATA.sampleMovements;
    pharmacyInventory: typeof MOCK_DATA.pharmacyInventory;
    transfers: typeof MOCK_DATA.transfers;
    transferHistory: typeof MOCK_DATA.transferHistory;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

interface MockDataProviderProps {
    children: ReactNode;
}

export const MockDataProvider: React.FC<MockDataProviderProps> = ({ children }) => {
    const { isDemo } = useAuth();

    const value: MockDataContextType = {
        isDemo: isDemo || false,
        pharmacies: MOCK_DATA.pharmacies,
        doctors: MOCK_DATA.doctors,
        contacts: MOCK_DATA.contacts,
        drugstores: MOCK_DATA.drugstores,
        drugstoreInventory: MOCK_DATA.drugstoreInventory,
        healthCenters: MOCK_DATA.healthCenters,
        products: MOCK_DATA.products,
        materialPop: MOCK_DATA.materialPop,
        visits: MOCK_DATA.visits,
        inventory: MOCK_DATA.inventory,
        objectives: MOCK_DATA.objectives,
        dashboardStats: MOCK_DATA.dashboardStats,
        cycles: MOCK_DATA.cycles,
        weeklyPlans: MOCK_DATA.weeklyPlans,
        planDetails: MOCK_DATA.planDetails,
        sampleBanks: MOCK_DATA.sampleBanks,
        bankInventory: MOCK_DATA.bankInventory,
        events: MOCK_DATA.events,
        sampleMovements: MOCK_DATA.sampleMovements,
        pharmacyInventory: MOCK_DATA.pharmacyInventory,
        transfers: MOCK_DATA.transfers,
        transferHistory: MOCK_DATA.transferHistory
    };

    return (
        <MockDataContext.Provider value={value}>
            {children}
        </MockDataContext.Provider>
    );
};

/**
 * Hook to access mock data in demo mode
 * Returns null if not in demo mode
 */
export const useDemoData = () => {
    const context = useContext(MockDataContext);
    const location = useLocation();
    const { isMaster, isSystemAdmin, user } = useAuth();

    // 1. If context doesn't exist, we can't do anything
    if (!context) return null;

    // 2. FORCED DEMO: If the route explicitly starts with /demo, ALWAYS use mock data
    if (location.pathname.startsWith('/demo/')) {
        return context;
    }

    // 3. AUTO DEMO: If user is in demo org but NOT a master, use mock data
    const isTrialUser = context.isDemo && !isMaster && !isSystemAdmin;
    if (isTrialUser) {
        return context;
    }

    // Default: Real data
    if (context.isDemo) {
        console.log('[useDemoData] User in Demo Org but Master/Admin status detected. Bypassing demo data.', {
            isMaster,
            isSystemAdmin,
            email: user?.email
        });
    }
    return null;
};

/**
 * Hook that automatically returns mock data in demo mode
 * or executes the provided async function for real data
 */
export const useDataWithDemoFallback = <T,>(
    mockData: T,
    fetchRealData: () => Promise<T>
): { data: T | null; loading: boolean; error: Error | null } => {
    const demoData = useDemoData();
    const [data, setData] = React.useState<T | null>(demoData ? mockData : null);
    const [loading, setLoading] = React.useState(!demoData);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        if (demoData) {
            // Demo mode - use mock data immediately
            setData(mockData);
            setLoading(false);
            return;
        }

        // Real mode - fetch from Supabase
        const loadData = async () => {
            try {
                setLoading(true);
                const result = await fetchRealData();
                setData(result);
            } catch (e) {
                setError(e instanceof Error ? e : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [demoData, mockData, fetchRealData]);

    return { data, loading, error };
};

export default MockDataProvider;
