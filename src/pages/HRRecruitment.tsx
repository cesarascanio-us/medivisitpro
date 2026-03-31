/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Search,
    Filter,
    Briefcase,
    UserCheck,
    Clock,
    MoreHorizontal,
    Star,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight,
    Loader2,
    ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Mock Recruitment Data
const RECRUITMENT_LEADS = [
    {
        id: "1",
        name: "Elena Rodríguez",
        role: "Desarrollador Fullstack",
        score: 95,
        status: "Entrevista",
        time: "2h ago",
        location: "Caracas, VE",
        avatar: "ER",
        tags: ["React", "Node.js", "ISO 27001"]
    },
    {
        id: "2",
        name: "Marco Tulio",
        role: "Gerente de Operaciones",
        score: 88,
        status: "Pre-Selección",
        time: "5h ago",
        location: "Valencia, VE",
        avatar: "MT",
        tags: ["PMBOK 8", "Liderazgo", "LOTTT"]
    },
    {
        id: "3",
        name: "Sofía Linares",
        role: "Especialista CRM",
        score: 92,
        status: "Nuevo",
        time: "1d ago",
        location: "Maracaibo, VE",
        avatar: "SL",
        tags: ["n8n", "Salesforce", "Customer Success"]
    },
    {
        id: "4",
        name: "Andrés Bello",
        role: "Analista de Datos",
        score: 84,
        status: "Rechazado",
        time: "2d ago",
        location: "Remoto",
        avatar: "AB",
        tags: ["Python", "SQL", "Tableau"]
    }
];

const STATUS_COLORS: Record<string, string> = {
    "Nuevo": "bg-blue-500",
    "Pre-Selección": "bg-amber-500",
    "Entrevista": "bg-emerald-500",
    "Rechazado": "bg-slate-500"
};

export default function HRRecruitment() {
    const { isMaster, organizationId } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // [STRICT] Tenant 0 / MasterGuard Validation
    const isTenantZero = organizationId === '00000000-0000-0000-0000-000000000000';
    const hasAccess = isMaster || isTenantZero;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (!hasAccess && !isLoading) {
        console.error("MasterGuard: Access denied to HR Recruitment. Redirecting to public fallback.");
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#0056b3]" />
                <p className="text-slate-500 font-medium animate-pulse">Cargando Bóveda de Talento...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f6f8] p-4 md:p-8 space-y-8 font-sans overflow-x-hidden">
            {/* Header SaaS Style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="bg-[#0056b3] p-2 rounded-lg shadow-lg">
                            <Briefcase className="h-8 w-8 text-white" />
                        </div>
                        Búsqueda & Selección
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-[#00a0e9]" />
                        Entorno de Reclutamiento Certificado PMBOK 8 / ISO 27001
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 border-slate-200 bg-white shadow-sm hover:shadow-md transition-all rounded-lg text-slate-700">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Exportar Reporte VPE
                    </Button>
                    <Button className="h-12 bg-[#0056b3] hover:bg-[#004494] text-white shadow-[0_4px_14px_rgba(0,86,179,0.39)] transition-all rounded-lg px-6 font-bold">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Aprobar Candidato
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Nuevos Leads", value: "12", icon: Users, color: "text-[#0056b3]" },
                    { label: "En Proceso", value: "08", icon: Clock, color: "text-[#00a0e9]" },
                    { label: "Top Match Score", value: "95%", icon: Star, color: "text-amber-500" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-white/50"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                        </div>
                        <p className="text-3xl font-black text-slate-800 mt-2">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/60 backdrop-blur-md p-4 rounded-lg border border-white/80 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar candidatos por nombre, habilidad o cargo..."
                        className="pl-12 h-14 bg-white border-slate-100 focus:ring-2 focus:ring-[#00a0e9]/20 transition-all rounded-lg text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 border-slate-200 bg-white rounded-lg font-bold text-slate-600 gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros Avanzados
                </Button>
            </div>

            {/* Dynamic Feed SaaS Style */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-2">
                    Feed de Candidatos en Tiempo Real
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {RECRUITMENT_LEADS
                            .filter(lead =>
                                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                lead.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                lead.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                            )
                            .map((lead, i) => (
                                <motion.div
                                    key={lead.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card className="bg-white border-none shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-300 group cursor-pointer overflow-hidden rounded-lg">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row lg:items-center">
                                                {/* Score Column */}
                                                <div className="lg:w-32 bg-slate-50/50 p-6 flex flex-col items-center justify-center border-r border-slate-100">
                                                    <div className="relative h-16 w-16 flex items-center justify-center">
                                                        <svg className="h-16 w-16 transform -rotate-90">
                                                            <circle
                                                                cx="32" cy="32" r="28"
                                                                stroke="currentColor" strokeWidth="4"
                                                                fill="transparent" className="text-slate-100"
                                                            />
                                                            <circle
                                                                cx="32" cy="32" r="28"
                                                                stroke="currentColor" strokeWidth="4"
                                                                fill="transparent" strokeDasharray={176}
                                                                strokeDashoffset={176 - (176 * lead.score) / 100}
                                                                className={cn(
                                                                    lead.score > 90 ? "text-emerald-500" : "text-[#00a0e9]",
                                                                    "transition-all duration-1000"
                                                                )}
                                                            />
                                                        </svg>
                                                        <span className="absolute text-xl font-black text-slate-700">{lead.score}</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tighter text-center leading-none">Match Score</p>
                                                </div>

                                                {/* Content Column */}
                                                <div className="flex-1 p-6">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                        <div className="flex gap-4">
                                                            <div className="h-14 w-14 rounded-full bg-[#f4f6f8] flex items-center justify-center border-2 border-white shadow-sm font-black text-[#0056b3] text-xl">
                                                                {lead.avatar}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#0056b3] transition-colors">{lead.name}</h3>
                                                                <p className="text-slate-500 font-bold">{lead.role}</p>
                                                                <div className="flex flex-wrap gap-2 mt-3">
                                                                    {lead.tags.map(tag => (
                                                                        <Badge key={tag} variant="secondary" className="bg-[#f4f6f8] text-slate-600 border-none font-bold text-[10px]">
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-2 items-end">
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn("h-2.5 w-2.5 rounded-full", STATUS_COLORS[lead.status])} />
                                                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{lead.status}</span>
                                                            </div>
                                                            <div className="flex gap-2 text-slate-400">
                                                                <Mail className="h-5 w-5 hover:text-[#0056b3] cursor-pointer" />
                                                                <Phone className="h-5 w-5 hover:text-[#0056b3] cursor-pointer" />
                                                                <MapPin className="h-5 w-5 hover:text-[#0056b3] cursor-pointer" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                                            <MapPin className="h-3 h-3" />
                                                            {lead.location}
                                                            <span className="mx-2">•</span>
                                                            <Clock className="h-3 h-3" />
                                                            Ingresó {lead.time}
                                                        </div>
                                                        <Button variant="ghost" className="text-[#0056b3] font-bold hover:bg-[#0056b3]/5 gap-2">
                                                            Ver Perfil Completo
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer SaaS Note */}
            <div className="text-center pb-8 pt-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                    Powered by Antigravity OS • Empresa CA Intelligence Unit
                </p>
            </div>
        </div>
    );
}
