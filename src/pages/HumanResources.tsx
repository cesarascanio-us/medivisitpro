/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppRoles } from "@/hooks/useAppRoles";
import { UserEditDialog } from "@/components/users/UserEditDialog";
import { UserDossierDialog } from "@/components/users/UserDossierDialog";
import { useToast } from "@/hooks/use-toast";
import {
    Calculator,
    ShieldCheck,
    Users,
    TrendingUp,
    Scale,
    Plus,
    Calendar,
    ChevronRight,
    FileCheck,
    FileText,
    Search,
    UserRound,
    AlertCircle,
    Loader2,
    Trash2,
    Check,
    Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Tabs,
    TabsContent,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { EliteTabsList, EliteTabsTrigger, EliteKPICard, EliteHeader } from "@/components/layout/DesignSystem";

// Data is fetched dynamically from Supabase

export default function HumanResources() {
    const [searchTerm, setSearchTerm] = useState("");
    const { profile, isMaster, canManageUsers } = useAuth();
    const { data: appRoles } = useAppRoles();
    const { toast } = useToast();
    
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDossierUserId, setSelectedDossierUserId] = useState<string | null>(null);
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    
    const [selectedEditUserId, setSelectedEditUserId] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const getRoleLabel = (slug: string) => appRoles?.find(r => r.slug === slug)?.name || slug;

    useEffect(() => {
        loadEmployees();
    }, [profile, appRoles]);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('user_roles')
                .select(`
                    id,
                    user_id,
                    role,
                    is_active,
                    created_at,
                    profiles:user_id (
                        email,
                        first_name,
                        last_name
                    )
                `);

            if (!isMaster && profile?.organization_id) {
                query = query.eq('organization_id', profile.organization_id);
            }

            const { data, error } = await query;
            if (error) throw error;
            
            const mapped = (data || []).map((u: any) => ({
                id: u.user_id,
                name: `${u.profiles?.first_name || ''} ${u.profiles?.last_name || ''}`.trim() || u.profiles?.email,
                role: getRoleLabel(u.role),
                hireDate: new Date(u.created_at).toISOString().split('T')[0],
                status: u.is_active ? 'activo' : 'inactivo',
                salary: 1500, 
                lottt_status: '100% cumplido',
                pending_vacations: 0,
                seniority_months: Math.max(0, Math.floor((new Date().getTime() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)))
            }));
            
            setEmployees(mapped);
        } catch (error) {
            console.error("Error loading employees:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('user_roles')
                .update({ is_active: !currentStatus })
                .eq('user_id', userId);

            if (error) throw error;

            setEmployees(employees.map(emp =>
                emp.id === userId ? { ...emp, status: !currentStatus ? 'activo' : 'inactivo' } : emp
            ));

            toast({
                title: !currentStatus ? "Acceso Restaurado" : "Acceso Revocado",
                description: "El estado del colaborador ha sido modificado en la red central."
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Fallo de Sistema",
                description: "No se pudo alterar el estado de acceso del usuario."
            });
        }
    };

    const filteredEmployees = employees.filter(emp => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return emp.name?.toLowerCase().includes(s) || emp.role?.toLowerCase().includes(s);
    });

    return (
        <div className="space-y-6">
            <EliteHeader
                title="Talento Humano"
                subtitle="Gestión Integral y Estrategia Corporativa"
                icon={ShieldCheck}
                badgeText="Estrategia 2026"
                statusText="Gestión Integral • V06-CA"
                statusColor="bg-indigo-500"
                rightContent={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-12 px-6 border-border/40 hover:bg-card bg-transparent rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                            <Scale className="mr-2 h-4 w-4" /> Auditoría
                        </Button>
                        <Button className="btn-elite-primary h-12 px-8">
                            <Plus className="h-5 w-5 mr-3" /> Nuevo Contrato
                        </Button>
                    </div>
                }
            />

            {/* KPI GRID - NATURISTA STYLE */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 overflow-visible">
                <EliteKPICard 
                    title="Colaboradores"
                    value={loading ? "..." : employees.length.toString()}
                    icon={Users}
                    color="indigo"
                />
                <EliteKPICard 
                    title="Cumplimiento"
                    value="94.2%"
                    icon={ShieldCheck}
                    color="emerald"
                />
                <EliteKPICard 
                    title="Provisión Vac."
                    value="$4,250"
                    icon={Calendar}
                    color="amber"
                />
                <EliteKPICard 
                    title="Prestaciones"
                    value="$12.8K"
                    icon={TrendingUp}
                    color="blue"
                />
            </div>

            {/* CONTENT MODULES */}
            <Tabs defaultValue="directory" className="flex-1 min-h-0 flex flex-col gap-8 overflow-hidden">
                <EliteTabsList>
                    <EliteTabsTrigger value="directory" label="Directorio Industrial" icon={Users} />
                    <EliteTabsTrigger value="legal" label="Expediente Legal" icon={Scale} />
                    <EliteTabsTrigger value="simulator" label="Motor de Prestaciones" icon={Calculator} />
                </EliteTabsList>

                {/* Directorio de Empleados */}
                <TabsContent value="directory" className="flex-1 min-h-0 flex flex-col gap-6 animate-in slide-in-from-bottom-5 duration-700">
                    <Card className="card-elite p-4 shrink-0 bg-card border border-border/40 rounded-2xl shadow-premium-sm">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="BUSCA POR NOMBRE, CARGO O ROL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-16 h-14 bg-muted/10 border-none focus-visible:ring-primary/20 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-inner text-foreground transition-all"
                            />
                        </div>
                    </Card>

                    <Card className="flex-1 min-h-0 bg-card border border-border rounded-[2rem] shadow-soft overflow-hidden flex flex-col p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {loading ? (
                                <div className="col-span-3 text-center py-12 text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
                                    Cargando matriz de colaboradores...
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="col-span-3 text-center py-12 text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                                    Ningún colaborador encontrado en la matriz.
                                </div>
                            ) : filteredEmployees.map((employee) => (
                                <div key={employee.id} className="bg-muted/10 rounded-2xl border border-border p-6 hover:bg-muted/20 transition-all group relative overflow-hidden flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-card border border-border shadow-inner flex items-center justify-center group-hover:scale-110 transition-all group-hover:bg-indigo-600">
                                                <UserRound className="h-6 w-6 text-slate-400 group-hover:text-white" />
                                            </div>
                                            <Badge className={cn("px-3 py-1 font-black text-[8px] uppercase tracking-widest rounded-full", employee.status === 'activo' ? 'bg-emerald-500/10 text-emerald-500 border-none' : 'bg-rose-500/10 text-rose-500 border-none')}>
                                                {employee.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 mb-6">
                                            <h3 className="text-lg font-black text-foreground tracking-tight uppercase line-clamp-1">{employee.name}</h3>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60 leading-none">{employee.role}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border">
                                            <div className="space-y-1">
                                                <p className="text-[8px] uppercase text-slate-400 font-black tracking-widest">Antigüedad</p>
                                                <p className="text-xs font-black text-foreground">{employee.seniority_months} Meses</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] uppercase text-slate-400 font-black tracking-widest">Cumplimiento</p>
                                                <p className="text-xs font-black text-indigo-500 uppercase tracking-tighter">{employee.lottt_status}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => {
                                                setSelectedDossierUserId(employee.id);
                                                setIsDossierOpen(true);
                                            }}
                                            className="flex-1 h-12 rounded-xl gap-2 text-slate-400 hover:text-indigo-600 transition-all font-bold text-[10px] uppercase tracking-widest border border-transparent hover:border-indigo-500/20 bg-card hover:bg-indigo-500/5 shadow-sm"
                                        >
                                            Ver Expediente
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>

                                        {canManageUsers && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedEditUserId(employee.id);
                                                        setIsEditOpen(true);
                                                    }}
                                                    className="h-12 w-12 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all shadow-sm border border-transparent hover:border-primary/20 bg-card"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {isMaster && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleActive(employee.id, employee.status === 'activo')}
                                                        className={cn(
                                                            "h-12 w-12 rounded-xl transition-all shadow-sm border border-transparent bg-card",
                                                            employee.status === 'activo'
                                                                ? "text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20"
                                                                : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20"
                                                        )}
                                                    >
                                                        {employee.status === 'activo' ? (
                                                            <Trash2 className="h-4 w-4" />
                                                        ) : (
                                                            <Check className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                {/* Módulo Legal LOTTT */}
                <TabsContent value="legal" className="mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 border border-border shadow-soft rounded-[2rem] bg-card overflow-hidden">
                            <CardHeader className="px-10 py-8 border-b border-border bg-muted/5">
                                <CardTitle className="text-xl font-black uppercase tracking-tight  flex items-center gap-3">
                                    <FileCheck className="h-6 w-6 text-indigo-600" /> 
                                    Bóveda de Documentos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-3">
                                {[
                                    { doc: "Anexo Cálculo Prestaciones Anual", date: "2026-01-30", status: "Certificado" },
                                    { doc: "Libro de Control de Vacaciones", date: "2026-02-15", status: "Actualizado" },
                                    { doc: "Contrato de Confidencialidad (NDA)", date: "2026-02-20", status: "Firma Pendiente" },
                                    { doc: "Reporte Salud Ocupacional", date: "2025-12-05", status: "Vencido" }
                                ].map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-muted/5 border border-border group hover:bg-muted/10 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                                                <FileText className="h-5 w-5 text-slate-400 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground uppercase text-xs tracking-tight">{doc.doc}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Auditado: {doc.date}</p>
                                            </div>
                                        </div>
                                        <Badge className={cn("px-3 py-1 font-black text-[8px] uppercase tracking-widest rounded-full",
                                            doc.status === 'Certificado' || doc.status === 'Actualizado' ? 'bg-emerald-50 text-emerald-600 border-none' : 
                                            doc.status === 'Vencido' ? 'bg-rose-50 text-rose-600 border-none' : 'bg-amber-50 text-amber-600 border-none'
                                        )}>
                                            {doc.status}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-none shadow-xl shadow-indigo-500/10 rounded-[2rem] bg-indigo-600 text-white overflow-hidden p-8 relative">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-background/10 rounded-full blur-2xl"></div>
                                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3 relative z-10 mb-6 font-outfit leading-none">
                                    <AlertCircle className="h-5 w-5" /> Notificaciones
                                </CardTitle>
                                <div className="space-y-4 relative z-10">
                                    <div className="p-5 bg-background/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-background/20 transition-all">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1 leading-none">Urgente</p>
                                        <p className="text-xs font-black  uppercase leading-tight">Actualizar Expediente Morffe</p>
                                    </div>
                                    <div className="p-5 bg-background/5 rounded-xl border border-white/5 opacity-80">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1 leading-none">Nómina</p>
                                        <p className="text-xs font-black  uppercase leading-tight">Cierre Ciclo Vacacional</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <UserDossierDialog
                        userId={selectedDossierUserId}
                        isOpen={isDossierOpen}
                        onClose={() => setIsDossierOpen(false)}
                        onEditClick={() => {
                            setSelectedEditUserId(selectedDossierUserId);
                            setIsEditOpen(true);
                        }}
                    />

                    <UserEditDialog
                        userId={selectedEditUserId}
                        isOpen={isEditOpen}
                        onClose={() => setIsEditOpen(false)}
                        onSuccess={loadEmployees}
                    />
                </TabsContent>

                <TabsContent value="simulator" className="mt-8">
                    <Card className="border border-border shadow-soft bg-card rounded-[2rem] max-w-xl mx-auto overflow-hidden">
                        <div className="p-8 text-center border-b border-border">
                            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase ">Simulador de Prestaciones</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Motor de proyección LOTTT v6.0</p>
                        </div>
                        <CardContent className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Fecha de Ingreso</label>
                                    <Input type="date" className="h-12 rounded-xl border-slate-100 bg-muted/10 font-bold text-foreground" defaultValue="2024-01-15" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Salario Base ($)</label>
                                    <Input type="number" className="h-12 rounded-xl border-slate-100 bg-muted/10 font-bold text-foreground" defaultValue="1500" />
                                </div>
                            </div>
                            <div className="bg-indigo-600 p-8 rounded-2xl border border-indigo-400 shadow-xl shadow-indigo-500/20 relative overflow-hidden text-center text-white">
                                <div className="text-white/60 font-black uppercase text-[9px] tracking-widest mb-1">Pasivo Laboral Estimado</div>
                                <div className="text-5xl font-black text-white tracking-tighter  leading-none">$2,250.00</div>
                            </div>
                            <Button className="w-full h-14 text-[10px] font-black uppercase tracking-widest shadow-lg rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all">Generar Reporte (PDF)</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

             {/* Footer Industrial Elite */}
             <div className="mt-8 flex items-center justify-between text-slate-400 px-2 shrink-0">
                <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="h-3.5 w-3.5" /> Directiva de Talento Humano César Ascanio CA
                </p>
                <div className="flex gap-4">
                    <span className="text-[9px] font-bold">V 6.0.0</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Compliance OK</span>
                </div>
            </div>
        </div>
    );
}
