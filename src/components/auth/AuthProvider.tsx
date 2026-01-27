import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";


// Master user email - has full access
const MASTER_EMAIL = 'cesar.ascanio@gmail.com';
const DEMO_EMAIL = 'demo.medivisitpro@gmail.com';
const DEMO_ORG_ID = 'd3300000-0000-0000-0000-000000000001';

// Role definitions
export type UserRole =
    | 'master'
    | 'admin'
    | 'manager'
    | 'chief'
    | 'coordinator'
    | 'supervisor'
    | 'telemarketing'
    | 'representative'
    | 'doctor'
    | 'pharmacist'
    | 'service_chief'
    | 'store_manager';

export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    organization_id: string | null;
    zone_id: string | null;
    state: string | null;
    region: string | null;
    is_master: boolean;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    profile: UserProfile | null;
    role: UserRole;
    permissions: string[];
    hasPermission: (code: string) => boolean;
    signOut: () => Promise<void>;
    // Derived state
    isAuthenticated: boolean;
    isDemo: boolean;
    // Role checks
    isMaster: boolean;
    isAdmin: boolean;
    isManager: boolean;
    isChief: boolean;
    isCoordinator: boolean;
    isSupervisor: boolean;
    isTelemarketing: boolean;
    isRepresentative: boolean;
    // Specialized checks
    isDoctor: boolean;
    isPharmacist: boolean;
    isServiceChief: boolean;
    isSpecializedRole: boolean;
    // Permissions
    canManageUsers: boolean;
    canViewAllData: boolean;
    canManageCompany: boolean;
    canApproveExpenses: boolean;
    canAssignObjectives: boolean;
    canManageZones: boolean;
    canViewAnalytics: boolean;
    canManageProducts: boolean;
    canViewProducts: boolean;
    canManageSamples: boolean;
    canViewMedicalInfo: boolean;
    canManageService: boolean;
    canViewVisitHistory: boolean;
    // Audit Mode
    isAuditMode: boolean;
    enterAuditMode: (orgId: string) => void;
    exitAuditMode: () => void;
    // Zone/Location
    organizationName: string | null;
    organizationId: string | null;
    zoneId: string | null;
    userState: string | null;
    userRegion: string | null;
    // Feature Flags
    canUseSales: boolean;
    canUseWarehouse: boolean;
    canUseTelemarketing: boolean;
    canUseEvents: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [role, setRole] = useState<UserRole>('representative');
    const [permissions, setPermissions] = useState<string[]>([]);
    const DEFAULT_FEATURES = {
        sales_module: true,
        samples_module: true,
        pop_module: true,
        work_processes: true,
        inventory_module: true,
        events_module: true,
        warehouse_module: false,
        telemarketing_module: false
    };

    const [features, setFeatures] = useState<Record<string, boolean>>(DEFAULT_FEATURES);
    const [organizationName, setOrganizationName] = useState<string | null>(null);

    // Audit/God Mode State
    const [auditOrgId, setAuditOrgId] = useState<string | null>(null);
    const [originalRole, setOriginalRole] = useState<UserRole | null>(null);

    const enterAuditMode = async (orgId: string) => {
        if (!orgId) return;
        console.log("Entering Audit Mode for Org:", orgId);
        setOriginalRole(role); // Save real role (master)
        setAuditOrgId(orgId);

        // Fetch organization features for Audit Mode
        try {
            const { data: orgData } = await supabase
                .from('organizations')
                .select('settings, name')
                .eq('id', orgId)
                .single();

            const orgFeatures = (orgData?.settings as any)?.features || {};
            setFeatures({ ...DEFAULT_FEATURES, ...orgFeatures });
            setOrganizationName(orgData?.name || null);
        } catch (error) {
            console.error("Error loading features for Audit Mode:", error);
        }

        // Mock the profile to look like a Manager of that Org
        if (profile) {
            setProfile({
                ...profile,
                organization_id: orgId,
                role: 'admin' // Simulate Organization Admin (God Mode)
            });
        }
        setRole('admin'); // Switch context to Admin
    };

    const exitAuditMode = () => {
        console.log("Exiting Audit Mode");
        setAuditOrgId(null);
        if (originalRole && user) {
            // Reload original profile
            loadUserRole(user.id, user.email || '');
        }
    };

    const loadUserRole = async (userId: string, email: string) => {
        if (!email) return;

        const lowerEmail = email.trim().toLowerCase();
        const masterEmailLower = MASTER_EMAIL.trim().toLowerCase();
        const demoEmailLower = DEMO_EMAIL.trim().toLowerCase();

        const isHardcodedMaster = lowerEmail === masterEmailLower;
        const isHardcodedDemo = lowerEmail === demoEmailLower;

        // [NUCLEAR FAIL-SAFE] Absolute Bypass
        if (isHardcodedMaster || isHardcodedDemo) {
            console.log('AuthProvider: NUCLEAR BYPASS triggered for', lowerEmail);
            const finalRole = isHardcodedMaster ? 'master' : 'representative';
            const finalOrgId = isHardcodedMaster ? null : DEMO_ORG_ID;

            const combinedProfile: UserProfile = {
                id: userId,
                email: email,
                role: finalRole as UserRole,
                organization_id: finalOrgId,
                zone_id: null,
                state: null,
                region: null,
                is_master: isHardcodedMaster
            };

            setProfile(combinedProfile);
            setRole(finalRole as UserRole);
            setPermissions(['*']); // Master gets all
            setLoading(false);
            return; // EXIT IMMEDIATELY - DO NOT PROCEED TO TRY/CATCH
        }

        try {
            console.log('Cargando perfil (Modo Normal) para:', email);

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (profileError) {
                console.error('Error cargando perfil:', profileError);
            }

            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role, organization_id, zone_id, state, region')
                .eq('user_id', userId)
                .maybeSingle();

            if (roleError) {
                console.error('Error cargando rol:', roleError);
            }

            console.log('Datos de rol obtenidos:', roleData);

            let finalRole = roleData?.role as UserRole || 'representative';
            let finalOrgId = roleData?.organization_id || profileData?.organization_id || null;

            const combinedProfile: UserProfile = {
                id: userId,
                email: email,
                role: finalRole as UserRole,
                organization_id: finalOrgId,
                zone_id: roleData?.zone_id || null,
                state: roleData?.state || null,
                region: roleData?.region || null,
                is_master: finalRole === 'master'
            };

            console.log('Perfil combinado final:', combinedProfile);
            setProfile(combinedProfile);
            setRole(finalRole);

            // Load Permissions
            const { data: permsData } = await supabase
                .from('role_permissions')
                .select('permission_code')
                .eq('role_slug', finalRole);

            setPermissions(permsData?.map(p => p.permission_code) || []);

            // Load Organization Features and Name
            if (finalOrgId) {
                const { data: orgData } = await supabase
                    .from('organizations')
                    .select('name, settings')
                    .eq('id', finalOrgId)
                    .single();

                setOrganizationName(orgData?.name || null);
                const orgFeatures = (orgData?.settings as any)?.features || {};
                setFeatures({ ...DEFAULT_FEATURES, ...orgFeatures });
            } else {
                setOrganizationName(null);
                setFeatures(DEFAULT_FEATURES);
            }
        } catch (e) {
            console.error('Error in loadUserRole:', e);
            setRole('representative');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                loadUserRole(currentUser.id, currentUser.email || '');
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                loadUserRole(currentUser.id, currentUser.email || '');
            } else {
                setProfile(null);
                setRole('representative');
                setPermissions([]);
                setFeatures({});
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setRole('representative');
        setPermissions([]);
        setFeatures({});
        setUser(null);
        setSession(null);
    };

    // --- Derived Permissions ---
    const isMaster = role === 'master';
    const isAdmin = role === 'master' || role === 'admin';
    const isManager = isAdmin || role === 'manager' || role === 'store_manager';
    const isChief = isManager || role === 'chief';
    const isCoordinator = isChief || role === 'coordinator';
    const isSupervisor = isCoordinator || role === 'supervisor';
    const isTelemarketing = isSupervisor || role === 'telemarketing';
    const isRepresentative = role === 'representative';

    const isDoctor = role === 'doctor';
    const isPharmacist = role === 'pharmacist';
    const isServiceChief = role === 'service_chief';
    const isSpecializedRole = isDoctor || isPharmacist || isServiceChief;

    const hasPermission = (code: string) => {
        if (isMaster) return true;
        if (permissions.includes('*')) return true;
        return permissions.includes(code);
    };

    const value: AuthContextType = {
        user,
        session,
        loading,
        profile,
        role,
        permissions,
        hasPermission,
        signOut,
        isAuthenticated: !!user,
        isDemo: profile?.organization_id === 'd3300000-0000-0000-0000-000000000001',
        isMaster,
        isAdmin,
        isManager,
        isChief,
        isCoordinator,
        isSupervisor,
        isTelemarketing,
        isRepresentative,
        isDoctor,
        isPharmacist,
        isServiceChief,
        isSpecializedRole,
        canManageUsers: isMaster || role === 'admin',
        canViewAllData: isMaster || role === 'admin' || role === 'manager',
        canManageCompany: isMaster || role === 'admin',
        canApproveExpenses: isManager || role === 'supervisor' || role === 'coordinator',
        canAssignObjectives: isManager || role === 'supervisor' || role === 'coordinator',
        canManageZones: isMaster || role === 'admin',
        canViewAnalytics: isManager || role === 'coordinator',
        canManageProducts: isManager,
        canViewProducts: isManager || isPharmacist || isDoctor,
        canManageSamples: isManager || isPharmacist,
        canViewMedicalInfo: isSupervisor || isDoctor,
        canManageService: isServiceChief || isManager,
        canViewVisitHistory: isSupervisor || isDoctor || isPharmacist,
        zoneId: profile?.zone_id || null,
        organizationId: profile?.organization_id || null,
        userState: profile?.state || null,
        userRegion: profile?.region || null,
        // Feature Flags (Default logic)
        canUseSales: isMaster || features.sales_module !== false, // Default ON
        canUseWarehouse: isMaster || features.warehouse_module === true || role === 'store_manager', // Default OFF
        canUseTelemarketing: isMaster || features.telemarketing_module === true, // Default OFF
        canUseEvents: isMaster || features.events_module === true, // Default OFF

        // Audit Mode
        isAuditMode: !!auditOrgId,
        enterAuditMode,
        exitAuditMode,
        organizationName,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
