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
    Briefcase,
    ChevronRight,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EliteHeader, EliteKPICard, EliteButton, EliteCard } from "@/components/layout/DesignSystem";

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
    "Nuevo Lead": "bg-primary",
    "Contactado": "bg-amber-500",
    "Propuesta": "bg-indigo-500",
    "Negociación": "bg-emerald-500",
    "Cerrado": "bg-muted-foreground/40"
};

export default function CRMDashboard() {
    const { isMaster, organizationId } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

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
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-black text-elite-xs uppercase tracking-widest animate-pulse">Sincronizando Pipeline de Ventas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 font-display">
            <EliteHeader 
                title="Centro de Mandos CRM"
                subtitle="Gestión de Inteligencia Comercial y Pipeline de Leads"
                icon={Target}
                badgeText="TENANT 0 • ISO 27001"
                statusText="Sincronización de n8n Activa"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <EliteButton variant="secondary" className="h-14 px-8" icon={ArrowUpRight}>REPORTES</EliteButton>
                        <EliteButton className="h-14 px-10 shadow-premium-md" icon={Zap}>NUEVO LEAD</EliteButton>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <EliteKPICard title="Leads Totales" value="48" subtitle="Prospectos en radar" icon={Users} color="indigo" />
                <EliteKPICard title="Valor Pipeline" value="$184k" subtitle="Valor potencial acumulado" icon={TrendingUp} trend={12.5} color="emerald" />
                <EliteKPICard title="Tasa de Cierre" value="24%" subtitle="Eficiencia de conversión" icon={Target} color="amber" />
                <EliteKPICard title="SPI Comercial" value="1.05" subtitle="Schedule Performance Index" icon={Clock} color="indigo" />
            </div>

            <EliteCard className="p-4 border border-border/40 bg-card shadow-premium-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="BUSCAR LEADS POR EMPRESA, CONTACTO O ETIQUETA..."
                            className="h-14 pl-16 bg-muted/5 border-border/40 focus-visible:ring-primary/20 rounded-2xl font-black uppercase text-elite-xs tracking-widest shadow-inner text-foreground placeholder:text-muted-foreground/30"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <EliteButton variant="secondary" className="h-14 px-8" icon={Filter}>FILTROS</EliteButton>
                </div>
            </EliteCard>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-foreground uppercase tracking-tighter flex items-center gap-4 font-display">
                        Feed de Leads (n8n Real-Time)
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_currentColor]" />
                    </h2>
                    <Badge className="badge-elite-info border-none">4 RESULTADOS ACTIVOS</Badge>
                </div>

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
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <EliteCard className="p-0 shadow-premium-sm hover:shadow-premium-md transition-all duration-300 group cursor-pointer overflow-hidden border border-border/40">
                                        <div className="flex flex-col lg:flex-row lg:items-stretch">
                                            {/* Score Column */}
                                            <div className="lg:w-32 bg-muted/5 p-8 flex flex-col items-center justify-center border-r border-border/40">
                                                <div className="relative h-16 w-16 flex items-center justify-center">
                                                    <svg className="h-16 w-16 transform -rotate-90">
                                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/10" />
                                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={176} strokeDashoffset={176 - (176 * lead.score) / 100} className={cn(lead.score > 90 ? "text-emerald-500" : "text-primary", "transition-all duration-1000")} />
                                                    </svg>
                                                    <span className="absolute text-xl font-black text-foreground tracking-tighter">{lead.score}</span>
                                                </div>
                                                <p className="text-elite-xs font-black text-muted-foreground mt-3 uppercase tracking-tighter text-center leading-none opacity-60">Deal Score</p>
                                            </div>

                                            {/* Information Column */}
                                            <div className="flex-1 p-8">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                    <div className="flex gap-6">
                                                        <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-premium-md border border-primary/20 font-black text-2xl group-hover:scale-105 transition-transform">
                                                            {lead.avatar}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-1 group-hover:text-primary transition-colors font-display">{lead.name}</h3>
                                                            <p className="text-muted-foreground font-black text-elite-xs uppercase tracking-widest flex items-center gap-2 opacity-60">
                                                                <Users className="h-3 h-3" />
                                                                {lead.contact}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 mt-4">
                                                                {lead.tags.map(tag => (
                                                                    <Badge key={tag} className="bg-muted/10 text-muted-foreground border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-3 items-end">
                                                        <div className="text-3xl font-black text-foreground tracking-tighter font-display tabular-nums">
                                                            {lead.value}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]", STATUS_COLORS[lead.status])} />
                                                            <span className="text-elite-xs font-black text-muted-foreground uppercase tracking-widest opacity-80">{lead.status}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-8 flex items-center justify-between border-t border-border/40 pt-6">
                                                    <div className="flex items-center gap-4 text-muted-foreground text-elite-xs font-black uppercase tracking-widest opacity-60">
                                                        <div className="flex items-center gap-2"><Briefcase className="h-3.5 h-3.5 text-primary" /> {lead.source}</div>
                                                        <span className="opacity-20">|</span>
                                                        <div className="flex items-center gap-2"><Clock className="h-3.5 h-3.5" /> Act. {lead.time}</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Mail className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Phone className="h-4 w-4" /></Button>
                                                        <EliteButton variant="secondary" className="h-10 px-6" icon={ChevronRight}>GESTIONAR</EliteButton>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </EliteCard>
                                </m.div>
                            ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="text-center pb-8 pt-4">
                <p className="text-elite-xs text-muted-foreground/40 font-black uppercase tracking-[0.4em]">
                    Powered by Antigravity OS • Master CRM Engine • Empresa CA
                </p>
            </div>
        </div>
    );
}
