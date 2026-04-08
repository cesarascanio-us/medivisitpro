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
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-display">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Cargando Bóveda de Talento...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8 font-display overflow-x-hidden animate-in fade-in duration-700">
            {/* Header SaaS Style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-premium-md">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-4 uppercase font-display">
                        <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
                            <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        Búsqueda & Selección
                    </h1>
                    <p className="text-slate-400 mt-3 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 ml-14">
                        <ShieldAlert className="h-4 w-4 text-primary" />
                        Entorno de Reclutamiento Certificado PMBOK 8 / ISO 27001
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 border-slate-100 bg-white shadow-soft hover:shadow-md transition-all rounded-xl text-slate-600 font-black uppercase text-[10px] tracking-widest px-6">
                        <ArrowUpRight className="h-4 w-4 mr-2 text-primary" />
                        Exportar Reporte
                    </Button>
                    <Button className="h-12 bg-primary hover:bg-primary/90 text-white shadow-premium-md transition-all rounded-xl px-8 font-black uppercase text-[10px] tracking-widest active:scale-95">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Aprobar Candidato
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Nuevos Leads", value: "12", icon: Users, color: "text-primary" },
                    { label: "En Proceso", value: "08", icon: Clock, color: "text-blue-500" },
                    { label: "Top Match Score", value: "95%", icon: Star, color: "text-amber-500" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2rem] shadow-premium-md border border-slate-100 group hover:border-primary/20 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <stat.icon className={cn("h-5 w-5", stat.color)} />
                        </div>
                        <p className="text-4xl font-black text-slate-900 mt-3 tabular-nums tracking-tighter">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="BUSCAR CANDIDATOS POR NOMBRE, HABILIDAD O CARGO..."
                        className="pl-16 h-14 bg-slate-50 border-none focus-visible:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-14 px-8 border-slate-100 bg-white rounded-xl font-black text-slate-600 gap-3 uppercase text-[10px] tracking-widest shadow-soft hover:bg-slate-50 transition-all">
                    <Filter className="h-5 w-5 text-primary" />
                    Filtros Avanzados
                </Button>
            </div>

            {/* Dynamic Feed SaaS Style */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 px-4 uppercase tracking-tighter font-display">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    Feed de Candidatos en Tiempo Real
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-glow shadow-emerald-500/50" />
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
                                    <Card className="bg-white border border-slate-100 shadow-premium-md hover:shadow-premium-lg transition-all duration-500 group cursor-pointer overflow-hidden rounded-[2rem]">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row lg:items-center">
                                                {/* Score Column */}
                                                <div className="lg:w-40 bg-slate-50/50 p-8 flex flex-col items-center justify-center border-r border-slate-100 group-hover:bg-primary/5 transition-colors">
                                                    <div className="relative h-20 w-20 flex items-center justify-center">
                                                        <svg className="h-20 w-20 transform -rotate-90">
                                                            <circle
                                                                cx="40" cy="40" r="34"
                                                                stroke="currentColor" strokeWidth="5"
                                                                fill="transparent" className="text-white shadow-inner"
                                                            />
                                                            <circle
                                                                cx="40" cy="40" r="34"
                                                                stroke="currentColor" strokeWidth="5"
                                                                fill="transparent" strokeDasharray={213}
                                                                strokeDashoffset={213 - (213 * lead.score) / 100}
                                                                className={cn(
                                                                    lead.score > 90 ? "text-emerald-500" : "text-primary",
                                                                    "transition-all duration-1000 shadow-glow"
                                                                )}
                                                            />
                                                        </svg>
                                                        <span className="absolute text-2xl font-black text-slate-900 tabular-nums ">{lead.score}</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest text-center leading-none">Match Score</p>
                                                </div>

                                                {/* Content Column */}
                                                <div className="flex-1 p-10">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                        <div className="flex gap-6">
                                                            <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center border border-white shadow-sm font-black text-primary text-2xl uppercase tracking-tighter">
                                                                {lead.avatar}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors tracking-tighter uppercase font-display">{lead.name}</h3>
                                                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mt-1 ">{lead.role}</p>
                                                                <div className="flex flex-wrap gap-2 mt-4">
                                                                    {lead.tags.map(tag => (
                                                                        <Badge key={tag} className="bg-slate-50 text-slate-500 border border-slate-100 font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-3 items-end">
                                                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                                                <div className={cn("h-2 w-2 rounded-full", STATUS_COLORS[lead.status] || "bg-slate-400")} />
                                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{lead.status}</span>
                                                            </div>
                                                            <div className="flex gap-3 text-slate-300">
                                                                <Mail className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
                                                                <Phone className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
                                                                <MapPin className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                                                        <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="h-3 w-3 text-primary" />
                                                                {lead.location}
                                                            </div>
                                                            <span className="opacity-30">•</span>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-3 w-3 text-primary" />
                                                                Ingresó {lead.time}
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 gap-3 rounded-xl px-5 h-10 shadow-soft">
                                                            Expediente Completo
                                                            <ArrowUpRight className="h-4 w-4" />
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
