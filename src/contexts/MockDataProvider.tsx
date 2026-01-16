import React, { createContext, useContext, ReactNode } from 'react';
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
        sampleMovements: MOCK_DATA.sampleMovements
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

    // If context doesn't exist or not in demo mode, return null
    if (!context || !context.isDemo) {
        return null;
    }

    return context;
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
