/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

   Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
   Componente: CA Project Master (Tablero A0 PMBOK 8)
   ======================================================================== */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Plus,
    MoreVertical,
    FileText,
    Users,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Loader2,
    Lock,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types ---
interface Project {
    id: string;
    customer_name: string;
    current_phase_id: number;
    description?: string;
    planned_value: number;
    actual_cost: number;
    earned_value: number;
}

interface Phase {
    id: number;
    name: string;
    sequence: number;
}

const N8N_AUTO_RESOLVE_URL = "https://n8n-catools.onrender.com/webhook/pmbok-auto-resolve";

export default function PMBOKMaster() {
    const { isMaster, organizationId } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [phases, setPhases] = useState<Phase[]>([]);
    const [loading, setLoading] = useState(true);
    const [movingId, setMovingId] = useState<string | null>(null);

    // [STRICT] Tenant 0 / MasterGuard Validation
    const isTenantZero = organizationId === '00000000-0000-0000-0000-000000000000';
    const hasAccess = isMaster || isTenantZero;

    useEffect(() => {
        if (hasAccess) {
            fetchInitialData();
        }
    }, [hasAccess]);

    async function fetchInitialData() {
        try {
            const [phasesRes, projectsRes] = await Promise.all([
                supabase.from('pmbok_phases').select('*').order('sequence', { ascending: true }),
                supabase.from('project_lifecycle')
                    .select('service_order_id, current_phase_id, service_orders(customer_name, description)')
            ]);

            if (phasesRes.data) setPhases(phasesRes.data);
            if (projectsRes.data) {
                const formatted = projectsRes.data.map((p: any) => ({
                    id: p.service_order_id,
                    customer_name: p.service_orders.customer_name,
                    description: p.service_orders.description,
                    current_phase_id: p.current_phase_id,
                    planned_value: Number(p.planned_value) || 0,
                    actual_cost: Number(p.actual_cost) || 0,
                    earned_value: Number(p.earned_value) || 0
                }));
                setProjects(formatted);
            }
        } catch (err) {
            console.error("Error fetching PMBOK data:", err);
            toast.error("Error al cargar el Tablero Maestro");
        } finally {
            setLoading(false);
        }
    }

    const triggerAutoResolve = async (projectId: string, missingArtifact: string) => {
        try {
            console.log(`[ORCHESTRATION] Triggering n8n auto-resolve for: ${missingArtifact}`);
            const response = await fetch(N8N_AUTO_RESOLVE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_order_id: projectId,
                    missing_artifact: missingArtifact,
                    timestamp: new Date().toISOString(),
                    triggered_by: 'CA-Project-Master-UI'
                })
            });
            if (response.ok) {
                toast.info("Orquestación Iniciada", {
                    description: `El Agente IA está redactando el documento: ${missingArtifact}`
                });
            }
        } catch (err) {
            console.error("Failed to trigger n8n:", err);
        }
    };

    const moveProject = async (projectId: string, currentPhaseId: number) => {
        if (currentPhaseId >= 5) return;

        const nextPhaseId = currentPhaseId + 1;
        setMovingId(projectId);

        try {
            const { error } = await supabase
                .from('project_lifecycle')
                .update({ current_phase_id: nextPhaseId })
                .eq('service_order_id', projectId);

            if (error) {
                // Captura el error del Trigger de Supabase
                if (error.message.includes("BLOQUEO LOGÍSTICO")) {
                    const missingText = error.message.split(' obligatorio "')[1]?.split('" para avanzar')[0] || "documento";

                    toast.error("Acción Bloqueada", {
                        description: error.message.split(": ")[1],
                        duration: 6000,
                        action: {
                            label: "Auto-Resolver (IA)",
                            onClick: () => triggerAutoResolve(projectId, missingText)
                        }
                    });
                } else {
                    toast.error("Error al mover el proyecto");
                }
                throw error;
            }

            // Update local state if successful
            setProjects(prev => prev.map(p =>
                p.id === projectId ? { ...p, current_phase_id: nextPhaseId } : p
            ));
            toast.success("Fase Actualizada", {
                description: `Proyecto avanzado a ${phases.find(ph => ph.id === nextPhaseId)?.name}`
            });

        } catch (err) {
            console.error(err);
        } finally {
            setMovingId(null);
        }
    };

    const calculateMetrics = (project: Project) => {
        const spi = project.planned_value > 0 ? project.earned_value / project.planned_value : 1.0;
        const cpi = project.actual_cost > 0 ? project.earned_value / project.actual_cost : 1.0;
        return { spi, cpi };
    };

    if (!hasAccess && !loading) return <Navigate to="/" replace />;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#0056b3]" />
                <p className="text-slate-500 font-medium animate-pulse">Sincronizando Matriz PMBOK 8...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f6f8] p-4 md:p-8 space-y-8 font-sans overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="bg-[#0056b3] p-2 rounded-lg shadow-lg">
                            <LayoutDashboard className="h-8 w-8 text-white" />
                        </div>
                        CA Project Master
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#00a0e9]" />
                        Orquestador de Proyectos A0 • Empresa CA
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 border-slate-200 bg-card shadow-sm rounded-lg text-slate-700">
                        <FileText className="h-4 w-4 mr-2" />
                        Auditoría ISO 9001
                    </Button>
                    <Button className="h-12 bg-[#0056b3] hover:bg-[#004494] text-white shadow-lg transition-all rounded-lg px-6 font-bold">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Proyecto
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full pb-10">
                {phases.map((phase) => (
                    <div key={phase.id} className="flex flex-col space-y-4 min-w-[280px]">
                        {/* Phase Title */}
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                {phase.name}
                                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
                                    {projects.filter(p => p.current_phase_id === phase.id).length}
                                </span>
                            </h3>
                            <div className="h-1 flex-1 mx-4 bg-slate-200/50 rounded-full" />
                        </div>

                        {/* List of Projects in this phase */}
                        <div className="flex-1 space-y-4 min-h-[500px]">
                            <AnimatePresence mode="popLayout">
                                {projects
                                    .filter(p => p.current_phase_id === phase.id)
                                    .map((project, idx) => (
                                        <motion.div
                                            key={project.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                        >
                                            <Card className="bg-background/80 backdrop-blur-md border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] transition-all duration-300 group overflow-hidden rounded-xl border-l-4 border-l-[#0056b3]">
                                                <CardContent className="p-5 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <Badge variant="outline" className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-none">
                                                            ID: {project.id.slice(0, 8)}
                                                        </Badge>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <h4 className="font-extrabold text-slate-800 leading-tight group-hover:text-[#0056b3] transition-colors">
                                                                {project.customer_name}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                                {project.description || "Sin descripción de alcance definida."}
                                                            </p>
                                                        </div>

                                                        {/* EVM Metrics Panel */}
                                                        <div className="flex gap-2">
                                                            {(() => {
                                                                const { spi, cpi } = calculateMetrics(project);
                                                                return (
                                                                    <>
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className={cn(
                                                                                "h-5 text-[9px] font-black uppercase tracking-tighter border-none",
                                                                                spi < 1.0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                                                            )}
                                                                        >
                                                                            SPI: {spi.toFixed(2)}
                                                                        </Badge>
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className={cn(
                                                                                "h-5 text-[9px] font-black uppercase tracking-tighter border-none",
                                                                                cpi < 1.0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                                                            )}
                                                                        >
                                                                            CPI: {cpi.toFixed(2)}
                                                                        </Badge>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                        <div className="flex -space-x-2">
                                                            <div className="h-6 w-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-blue-600">CA</div>
                                                            <div className="h-6 w-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                                                                <Users className="h-3 w-3 text-emerald-600" />
                                                            </div>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-[#00a0e9] font-black text-[10px] uppercase tracking-tighter hover:bg-[#00a0e9]/5 p-0 h-6 px-2"
                                                            onClick={() => moveProject(project.id, phase.id)}
                                                            disabled={movingId === project.id || phase.id === 5}
                                                        >
                                                            {movingId === project.id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : phase.id < 5 ? (
                                                                <>Siguiente Fase <ArrowRight className="h-3 w-3 ml-1" /></>
                                                            ) : (
                                                                <span className="text-emerald-500 flex items-center gap-1">Certificado <CheckCircle2 className="h-3 w-3" /></span>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                            </AnimatePresence>

                            {/* Empty State Slot with Glassmorphism Effect */}
                            {projects.filter(p => p.current_phase_id === phase.id).length === 0 && (
                                <div className="border-2 border-dashed border-slate-200 rounded-xl h-32 flex flex-col items-center justify-center text-slate-300 group-hover:border-[#00a0e9]/30 transition-all">
                                    <Lock className="h-6 w-6 mb-2 opacity-20" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Bóveda Vacía</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex justify-center pt-8 border-t border-slate-200/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" />
                    PMBOK 8 Master Engine • Propiedad Confidencial Empresa CA
                </p>
            </div>
        </div>
    );
}
