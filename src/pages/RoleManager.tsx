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
    const { isMaster } = useAuth();
    const { toast } = useToast();
    
    const [roles, setRoles] = useState<AppRole[]>([]);
    const [permissions, setPermissions] = useState<AppPermission[]>([]);
    const [matrix, setMatrix] = useState<MatrixState>({});
    const [originalMatrix, setOriginalMatrix] = useState<MatrixState>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isMaster) {
            loadData();
        }
    }, [isMaster]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch Roles (Only show non-system or roles meant for the matrix)
            const { data: rolesData, error: rolesError } = await supabase
                .from('app_roles')
                .select('*')
                // .eq('is_system', false) // Optional: exclude master/admin from grid if desired.
                .not('slug', 'in', '("master")') // Let's hide master from being edited
                .order('name');
            if (rolesError) throw rolesError;

            // Fetch Permissions
            const { data: permsData, error: permsError } = await supabase
                .from('app_permissions')
                .select('*')
                .order('module, code');
            if (permsError) throw permsError;

            // Fetch mappings
            const { data: rolePermsData, error: rpError } = await supabase
                .from('role_permissions')
                .select('role_slug, permission_code, access_level');
            if (rpError) {
                // If the column doesn't exist yet, it will throw an error. 
                // We'll fallback to a basic fetch if access_level column is missing.
                console.warn("access_level column might be missing. Run the migration.");
            }

            // Build Matrix State
            const initialState: MatrixState = {};
            rolesData?.forEach(r => {
                initialState[r.slug] = {};
                permsData?.forEach(p => {
                    initialState[r.slug][p.code] = null;
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
            // 1. Delete all existing permissions for the roles shown in the matrix
            const slugs = roles.map(r => r.slug);
            const { error: delError } = await supabase
                .from('role_permissions')
                .delete()
                .in('role_slug', slugs);

            if (delError) throw delError;

            // 2. Build bulk insert payload
            const inserts: RolePermission[] = [];
            roles.forEach(role => {
                permissions.forEach(perm => {
                    const access = matrix[role.slug][perm.code];
                    if (access !== null) {
                        inserts.push({
                            role_slug: role.slug,
                            permission_code: perm.code,
                            access_level: access
                        });
                    }
                });
            });

            // 3. Insert new matrix
            if (inserts.length > 0) {
                const { error: insError } = await supabase
                    .from('role_permissions')
                    .insert(inserts);
                if (insError) throw insError;
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

    if (!isMaster) return <div className="p-8 text-center text-red-500">Acceso Denegado</div>;

    return (
        <div className="flex flex-col h-full bg-[#FAFBFC] space-y-4 p-4 md:p-6 overflow-hidden max-w-[100vw]">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#EEF5F8] rounded-xl flex items-center justify-center">
                        <Shield className="text-[#0B5C6E] h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#1A2332]">Matriz de Accesos</h1>
                        <p className="text-sm text-slate-500">Configuración global de privilegios</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-[#6B7A8D] bg-[#F7F8FA] px-6 py-3 rounded-xl border border-slate-200">
                    <span className="flex items-center gap-2"><span className="text-[#1D9E75] text-lg font-bold">✓</span> Acceso completo</span>
                    <span className="flex items-center gap-2"><span className="text-[#B45309] text-lg font-bold">◐</span> Acceso parcial / lectura</span>
                    <span className="flex items-center gap-2"><span className="text-[#D1D5DB] text-lg font-bold">—</span> Sin acceso</span>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={loadData} variant="outline" size="icon" className="h-10 w-10 shrink-0" disabled={loading || saving}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                    <Button 
                        onClick={handleSaveMatrix} 
                        disabled={!hasChanges || saving}
                        className="bg-[#0B5C6E] hover:bg-[#084A59] text-white"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Guardando..." : "Guardar Matriz"}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue={Object.keys(groupedPermissions)[0]} className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-[#F7F8FA]">
                    <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start">
                        {Object.keys(groupedPermissions).map(moduleName => (
                            <TabsTrigger 
                                key={moduleName} 
                                value={moduleName}
                                className="uppercase text-xs font-bold tracking-wider data-[state=active]:bg-[#0B5C6E] data-[state=active]:text-white data-[state=active]:shadow-md"
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
                                    <thead className="sticky top-0 z-20 bg-[#F7F8FA] shadow-[0_1px_0_#E2E6EA]">
                                        <tr>
                                            <th className="p-4 border-r border-[#E2E6EA] font-semibold text-[#1A2332] uppercase tracking-wider min-w-[280px] bg-[#F7F8FA] sticky left-0 z-30 shadow-[1px_0_0_#E2E6EA]">
                                                Acción
                                            </th>
                                            {roles.map(role => (
                                                <th key={role.slug} className="border-r border-[#E2E6EA] align-bottom bg-[#F7F8FA]">
                                                    <div className="w-[45px] h-[160px] mx-auto flex items-end pb-4 justify-center">
                                                        <span 
                                                            className="text-[10px] font-semibold text-[#6B7A8D] whitespace-nowrap"
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
                                            <tr key={perm.code} className="hover:bg-[#FAFBFC] transition-colors border-b border-[#E2E6EA]">
                                                <td className="px-4 py-3 text-[#1A2332] font-medium sticky left-0 bg-white border-r border-[#E2E6EA] group-hover:bg-[#FAFBFC] z-10 shadow-[1px_0_0_#E2E6EA]">
                                                    {perm.name}
                                                </td>
                                                {roles.map(role => {
                                                    const val = matrix[role.slug]?.[perm.code];
                                                    return (
                                                        <td 
                                                            key={`${role.slug}-${perm.code}`} 
                                                            className="border-r border-[#E2E6EA] text-center p-0 cursor-pointer hover:bg-slate-50 transition-colors"
                                                            onClick={() => handleToggleCell(role.slug, perm.code)}
                                                        >
                                                            <div className="w-full h-full min-h-[40px] flex items-center justify-center select-none">
                                                                {val === 'full' && <span className="text-[#1D9E75] text-sm font-bold">✓</span>}
                                                                {val === 'read_only' && <span className="text-[#B45309] text-sm font-bold">◐</span>}
                                                                {val === null && <span className="text-[#D1D5DB] text-xs font-bold">—</span>}
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
    );
}
