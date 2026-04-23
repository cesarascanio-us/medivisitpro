/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Search,
    Filter,
    Users,
    TrendingUp,
    Target,
    Clock,
    MoreHorizontal,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight,
    Loader2,
    ShieldAlert,
    Zap,
    Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";

// Mock CRM Data (Leads)
const CRM_LEADS = [
    {
        id: "1",
        name: "Corporación Delta",
        contact: "Carlos Méndez",
        value: "$12,400",
        score: 92,
        status: "Negociación",
        time: "1h ago",
        source: "Webhook WhatsApp",
        avatar: "CD",
        tags: ["High Value", "Urgent", "Tech"]
    },
    {
        id: "2",
        name: "Inversiones Polar",
        contact: "Luisa Ortega",
        value: "$8,500",
        score: 78,
        status: "Nuevo Lead",
        time: "4h ago",
        source: "Landing Page",
        avatar: "IP",
        tags: ["Retail", "Standard"]
    },
    {
        id: "3",
        name: "Tech Solutions Inc",
        contact: "Robert Watson",
        value: "$25,000",
        score: 96,
        status: "Propuesta",
        time: "6h ago",
        source: "Referal",
        avatar: "TS",
        tags: ["Gold Partner", "Strategic"]
    },
    {
        id: "4",
        name: "Logística Express",
        contact: "Juan Pérez",
        value: "$3,200",
        score: 64,
        status: "Contactado",
        time: "1d ago",
        source: "Cold Call",
        avatar: "LE",
        tags: ["SME", "Follow-up"]
    }
];

const STATUS_COLORS: Record<string, string> = {
    "Nuevo Lead": "bg-[#00a0e9]",
    "Contactado": "bg-amber-500",
    "Propuesta": "bg-indigo-500",
    "Negociación": "bg-emerald-500",
    "Cerrado": "bg-slate-500"
};

export default function CRMDashboard() {
    const { isMaster, organizationId } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // [STRICT] Tenant 0 / AdminGuard Validation
    const isTenantZero = organizationId === '00000000-0000-0000-0000-000000000000';
    const hasAccess = isMaster || isTenantZero;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (!hasAccess && !isLoading) {
        console.error("AdminGuard: Access denied to CRM Dashboard. Redirecting to public fallback.");
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#0056b3]" />
                <p className="text-slate-500 font-medium animate-pulse">Sincronizando Pipeline de Ventas...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f6f8] p-4 md:p-8 space-y-8 font-sans overflow-x-hidden">
            <EliteHeader 
                title="Centro de Mandos CRM"
                subtitle="Gestión de Inteligencia Comercial y Pipeline"
                icon={Target}
                badgeText="TENANT 0 • ISO 27001"
                statusText="Sincronización de n8n Activa"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="h-14 px-8 rounded-2xl bg-card border-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-premium-sm hover:shadow-premium-md transition-all">
                            <ArrowUpRight className="h-5 w-5 mr-3 text-primary" /> Reporte de Conversión
                        </Button>
                        <Button className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-premium-md font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3">
                            <Zap className="h-6 w-6" /> Nuevo Lead Manual
                        </Button>
                    </div>
                }
            />

            {/* EVM Driven Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <EliteKPICard 
                    title="Leads Totales" 
                    value="48" 
                    subtitle="Prospectos en radar"
                    icon={Users}
                    color="indigo"
                />
                <EliteKPICard 
                    title="Valor Pipeline" 
                    value="$184k" 
                    subtitle="Valor potencial acumulado"
                    icon={TrendingUp}
                    trend={12.5}
                    color="emerald"
                />
                <EliteKPICard 
                    title="Tasa de Cierre" 
                    value="24%" 
                    subtitle="Eficiencia de conversión"
                    icon={Target}
                    color="amber"
                />
                <EliteKPICard 
                    title="SPI Comercial" 
                    value="1.05" 
                    subtitle="Schedule Performance Index"
                    icon={Clock}
                    color="indigo"
                />
            </div>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-background/60 backdrop-blur-md p-4 rounded-lg border border-white/80 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar leads por empresa, contacto o etiqueta..."
                        className="pl-12 h-14 bg-card border-slate-100 focus:ring-2 focus:ring-[#00a0e9]/20 transition-all rounded-lg text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 border-slate-200 bg-card rounded-lg font-bold text-slate-600 gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros de Pipeline
                </Button>
            </div>

            {/* Sales Feed */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-2">
                    Feed de Leads en Tiempo Real (n8n Webhook)
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </h2>

                <div className="grid grid-cols-1 gap-4 pb-12">
                    <AnimatePresence mode="popLayout">
                        {CRM_LEADS
                            .filter(lead =>
                                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                lead.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                            )
                            .map((lead, i) => (
                                <m.div
                                    key={lead.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card className="bg-card border-none shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-300 group cursor-pointer overflow-hidden rounded-lg">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row lg:items-center">
                                                {/* Score / Conversion Column */}
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
                                                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tighter text-center leading-none">Deal Score</p>
                                                </div>

                                                {/* Information Column */}
                                                <div className="flex-1 p-6">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                        <div className="flex gap-4">
                                                            <div className="h-14 w-14 rounded-full bg-[#f4f6f8] flex items-center justify-center border-2 border-white shadow-sm font-black text-[#0056b3] text-xl">
                                                                {lead.avatar}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#0056b3] transition-colors">{lead.name}</h3>
                                                                <p className="text-slate-500 font-bold flex items-center gap-2">
                                                                    <Users className="h-3 h-3" />
                                                                    {lead.contact}
                                                                </p>
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
                                                            <div className="text-2xl font-black text-slate-800 tracking-tighter">
                                                                {lead.value}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn("h-2.5 w-2.5 rounded-full", STATUS_COLORS[lead.status])} />
                                                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{lead.status}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                                            <Briefcase className="h-3 h-3 text-[#00a0e9]" />
                                                            {lead.source}
                                                            <span className="mx-2">•</span>
                                                            <Clock className="h-3 h-3" />
                                                            Última act. {lead.time}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#0056b3]">
                                                                <Mail className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#0056b3]">
                                                                <Phone className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" className="text-[#0056b3] font-bold hover:bg-[#0056b3]/5 gap-2 h-8">
                                                                Gestionar Lead
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </m.div>
                            ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer SaaS Note */}
            <div className="text-center pb-8 pt-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                    Powered by Antigravity OS • Master CRM Engine • Empresa CA
                </p>
            </div>
        </div>
    );
}
