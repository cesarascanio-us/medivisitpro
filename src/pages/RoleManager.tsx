/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Shield, Save, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AppRole {
    slug: string;
    name: string;
    is_system: boolean;
}

interface AppPermission {
    code: string;
    name: string;
    module: string;
    description: string;
}

interface RolePermission {
    role_slug: string;
    permission_code: string;
    access_level: 'full' | 'read_only';
}

// Matrix State: [roleSlug][permissionCode] = 'full' | 'read_only' | null
type MatrixState = Record<string, Record<string, 'full' | 'read_only' | null>>;

export default function RoleManager() {
    const { isMaster, isAdmin } = useAuth();
    const { toast } = useToast();
    
    const [roles, setRoles] = useState<AppRole[]>([]);
    const [permissions, setPermissions] = useState<AppPermission[]>([]);
    const [matrix, setMatrix] = useState<MatrixState>({});
    const [originalMatrix, setOriginalMatrix] = useState<MatrixState>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isMaster || isAdmin) {
            loadData();
        }
    }, [isMaster, isAdmin]);

    const loadData = async () => {
        setLoading(true);
        try {
            let query = supabase.from('app_roles').select('*').order('name');
            if (!isMaster) {
                query = query.neq('slug', 'master'); // Hide master from non-master admins
            }
            const { data: rolesData, error: rolesError } = await query;
            if (rolesError) throw rolesError;

            // Fetch Permissions
            let { data: permsData, error: permsError } = await supabase
                .from('app_permissions')
                .select('*')
                .order('module, code');
            if (permsError) throw permsError;

            // [Auto-Seed] Inject 'map.view' permission if missing
            if (permsData && !permsData.find(p => p.code === 'map.view')) {
                await supabase.from('app_permissions').insert([{
                    code: 'map.view',
                    name: 'Ver Mapa de Cobertura',
                    module: 'GESTIÓN TERRITORIAL',
                    description: 'Acceso al mapa interactivo de contactos y rutas'
                }]);
                
                const { data: newPermsData } = await supabase
                    .from('app_permissions')
                    .select('*')
                    .order('module, code');
                if (newPermsData) permsData = newPermsData;
            }

            // Fetch mappings
            const { data: rolePermsData, error: rpError } = await supabase
                .from('role_permissions')
                .select('role_slug, permission_code, access_level');
            if (rpError) {
                // If the column doesn't exist yet, it will throw an error. 
                // We'll fallback to a basic fetch if access_level column is missing.
                console.warn("access_level column might be missing. Run the migration.");
            }

            const initialState: MatrixState = {};
            rolesData?.forEach(r => {
                initialState[r.slug] = {};
                permsData?.forEach(p => {
                    initialState[r.slug][p.code] = r.slug === 'master' ? 'full' : null;
                });
            });

            rolePermsData?.forEach(rp => {
                if (initialState[rp.role_slug]) {
                    // Si no existe access_level en la DB (error viejo), por defecto será full
                    initialState[rp.role_slug][rp.permission_code] = rp.access_level || 'full';
                }
            });

            setRoles(rolesData || []);
            setPermissions(permsData || []);
            setMatrix(JSON.parse(JSON.stringify(initialState)));
            setOriginalMatrix(JSON.parse(JSON.stringify(initialState)));

        } catch (error: any) {
            console.error('Error loading RBAC matrix:', error);
            toast({
                title: "Error cargando matriz",
                description: "Asegúrate de haber ejecutado el script SQL para añadir 'access_level'.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCell = (roleSlug: string, permCode: string) => {
        setMatrix(prev => {
            const current = prev[roleSlug][permCode];
            let next: 'full' | 'read_only' | null = null;

            if (current === null) next = 'full';
            else if (current === 'full') next = 'read_only';
            else next = null;

            return {
                ...prev,
                [roleSlug]: {
                    ...prev[roleSlug],
                    [permCode]: next
                }
            };
        });
    };

    const handleSaveMatrix = async () => {
        setSaving(true);
        try {
            // Process each role sequentially to avoid payload limits and connection timeouts
            for (const role of roles) {
                // Delete existing for this specific role
                const { error: delError } = await supabase
                    .from('role_permissions')
                    .delete()
                    .eq('role_slug', role.slug);

                if (delError) throw delError;

                // Build inserts for this role
                const roleInserts: RolePermission[] = [];
                permissions.forEach(perm => {
                    const access = matrix[role.slug][perm.code];
                    if (access !== null) {
                        roleInserts.push({
                            role_slug: role.slug,
                            permission_code: perm.code,
                            access_level: access
                        });
                    }
                });

                // Insert in batches per role
                if (roleInserts.length > 0) {
                    const { error: insError } = await supabase
                        .from('role_permissions')
                        .insert(roleInserts);
                    if (insError) throw insError;
                }
            }

            setOriginalMatrix(JSON.parse(JSON.stringify(matrix)));
            toast({ title: "Matriz Guardada", description: "Todos los privilegios han sido actualizados." });

        } catch (error: any) {
            console.error('Save matrix error:', error);
            toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = JSON.stringify(matrix) !== JSON.stringify(originalMatrix);

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, curr) => {
        if (!acc[curr.module]) acc[curr.module] = [];
        acc[curr.module].push(curr);
        return acc;
    }, {} as Record<string, AppPermission[]>);

    if (!isMaster && !isAdmin) return <div className="p-8 text-center text-red-500">Acceso Denegado</div>;

    return (
        <div className="flex flex-col h-full bg-transparent relative overflow-hidden p-4 md:p-6 max-w-[100vw] animate-in fade-in duration-500">
            
            <div className="relative z-10 w-full h-full flex flex-col space-y-6 max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-premium-sm ring-1 ring-white/5 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                            <Shield className="text-primary h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Matriz de Accesos</h1>
                            <p className="text-sm text-muted-foreground">Configuración global de privilegios</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground bg-muted/30 px-6 py-3 rounded-xl border border-white/5 backdrop-blur-sm">
                        <span className="flex items-center gap-2"><span className="text-emerald-500 text-lg font-bold">✓</span> Acceso completo</span>
                        <span className="flex items-center gap-2"><span className="text-amber-500 text-lg font-bold">◐</span> Acceso parcial / lectura</span>
                        <span className="flex items-center gap-2"><span className="text-muted-foreground text-lg font-bold">—</span> Sin acceso</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button onClick={loadData} variant="outline" size="icon" className="h-10 w-10 shrink-0 border-white/10 bg-background/50 hover:bg-muted" disabled={loading || saving}>
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                        <Button 
                            onClick={handleSaveMatrix} 
                            disabled={!hasChanges || saving}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] border border-primary/20"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Guardando..." : "Guardar Matriz"}
                        </Button>
                    </div>
                </div>

            <Tabs defaultValue={Object.keys(groupedPermissions)[0]} className="flex-1 flex flex-col bg-card/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-premium-md overflow-hidden relative">
                <div className="p-4 border-b border-white/5 bg-muted/20 backdrop-blur-sm">
                    <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start">
                        {Object.keys(groupedPermissions).map(moduleName => (
                            <TabsTrigger 
                                key={moduleName} 
                                value={moduleName}
                                className="uppercase text-xs font-bold tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_rgba(var(--primary),0.3)] data-[state=active]:border-primary/50 text-muted-foreground border border-transparent hover:text-foreground transition-all rounded-lg"
                            >
                                {moduleName}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                    <TabsContent key={moduleName} value={moduleName} className="flex-1 m-0 p-0 outline-none">
                        <ScrollArea className="h-full w-full">
                            <div className="min-w-[max-content] p-0 pb-8">
                                <table className="w-full border-collapse text-left text-[11px] font-sans">
                                    <thead className="sticky top-0 z-20 bg-muted/40 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                                        <tr>
                                            <th className="p-4 border-r border-white/5 font-bold text-foreground uppercase tracking-wider min-w-[280px] bg-muted/40 backdrop-blur-md sticky left-0 z-30 shadow-[1px_0_0_rgba(255,255,255,0.05)]">
                                                Acción
                                            </th>
                                            {roles.map(role => (
                                                <th key={role.slug} className="border-r border-white/5 align-bottom bg-muted/40 backdrop-blur-md">
                                                    <div className="w-[45px] h-[160px] mx-auto flex items-end pb-4 justify-center">
                                                        <span 
                                                            className="text-[10px] font-bold text-muted-foreground whitespace-nowrap"
                                                            style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                                                        >
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {perms.map(perm => (
                                            <tr key={perm.code} className="hover:bg-muted/30 transition-colors border-b border-white/5">
                                                <td className="px-4 py-3 text-foreground font-semibold sticky left-0 bg-card/90 backdrop-blur-sm border-r border-white/5 group-hover:bg-muted/30 z-10 shadow-[1px_0_0_rgba(255,255,255,0.05)]">
                                                    {perm.name}
                                                </td>
                                                {roles.map(role => {
                                                    const val = matrix[role.slug]?.[perm.code];
                                                    return (
                                                        <td 
                                                            key={`${role.slug}-${perm.code}`} 
                                                            className="border-r border-white/5 text-center p-0 cursor-pointer hover:bg-white/5 transition-colors"
                                                            onClick={() => handleToggleCell(role.slug, perm.code)}
                                                        >
                                                            <div className="w-full h-full min-h-[40px] flex items-center justify-center select-none">
                                                                {val === 'full' && <span className="text-emerald-500 text-sm font-bold">✓</span>}
                                                                {val === 'read_only' && <span className="text-amber-500 text-sm font-bold">◐</span>}
                                                                {val === null && <span className="text-muted-foreground text-xs font-bold">—</span>}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
        </div>
    );
}
