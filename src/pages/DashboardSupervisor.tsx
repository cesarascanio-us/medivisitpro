/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, cloneElement } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Users,
    Target,
    TrendingUp,
    Calendar,
    MapPin,
    UserCheck,
    Activity,
    Award,
    ChevronRight,
    BarChart3,
    Wifi,
    WifiOff,
    RefreshCcw,
    Clock,
    LayoutDashboard,
    RefreshCw
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface RepresentativeStats {
    id: string;
    name: string;
    email: string;
    visitsThisMonth: number;
    visitsThisWeek: number;
    objectivesCompleted: number;
    objectivesTotal: number;
    doctorsVisited: number;
    pharmaciesVisited: number;
}

interface ZoneStats {
    id: string;
    name: string;
    totalVisits: number;
    repsCount: number;
    avgVisitsPerRep: number;
}

interface DashboardData {
    totalVisitsMonth: number;
    totalVisitsWeek: number;
    totalReps: number;
    avgCompletionRate: number;
    repStats: RepresentativeStats[];
    zoneStats: ZoneStats[];
    weeklyTrend: { day: string; visits: number }[];
}

const CHART_COLORS = ['#10b981', '#14b8a6', '#0ea5e9', '#6366f1', '#f59e0b', '#ef4444'];

export default function DashboardSupervisor() {
    const { user, userRegion, organizationName, role, isSystemAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user, selectedPeriod]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Get representatives assigned to this supervisor
            const { data: roleData } = await supabase
                .from('user_roles')
                .select('user_id')
                .eq('supervisor_id', user?.id)
                .eq('role', 'representative');

            const repIdsForSupervisor = roleData?.map(r => r.user_id) || [];

            // If no reps found, show empty state
            if (repIdsForSupervisor.length === 0) {
                setData({
                    totalVisitsMonth: 0,
                    totalVisitsWeek: 0,
                    totalReps: 0,
                    avgCompletionRate: 0,
                    repStats: [],
                    zoneStats: [],
                    weeklyTrend: []
                });
                setLoading(false);
                return;
            }

            // Get profiles for these representatives
            const { data: profiles } = await supabase
                .from('profiles')
                .select('user_id, first_name, last_name, email')
                .in('user_id', repIdsForSupervisor);

            const repIds = profiles?.map(p => p.user_id) || [];

            // Get visits for these reps
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();

            const { data: visits } = await supabase
                .from('visits')
                .select('id, user_id, created_at, status')
                .in('user_id', repIds)
                .gte('created_at', startOfMonth);

            // Get objectives for these reps
            const { data: objectives } = await supabase
                .from('objectives')
                .select('id, user_id, current_value, target_value, status')
                .in('user_id', repIds);

            // Calculate stats per representative
            const repStats: RepresentativeStats[] = (profiles || []).map(profile => {
                const repVisits = visits?.filter(v => v.user_id === profile.user_id) || [];
                const repObjectives = objectives?.filter(o => o.user_id === profile.user_id) || [];
                const weekVisits = repVisits.filter(v => new Date(v.created_at) >= new Date(startOfWeek));

                return {
                    id: profile.user_id,
                    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
                    email: profile.email,
                    visitsThisMonth: repVisits.length,
                    visitsThisWeek: weekVisits.length,
                    objectivesCompleted: repObjectives.filter(o => o.status === 'completed').length,
                    objectivesTotal: repObjectives.length,
                    doctorsVisited: 0, // Would need join with contacts
                    pharmaciesVisited: 0
                };
            });

            // Calculate weekly trend (last 7 days)
            const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const today = new Date();
            const weeklyTrend = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dayVisits = visits?.filter(v => {
                    const visitDate = new Date(v.created_at);
                    return visitDate.toDateString() === date.toDateString();
                }).length || 0;
                weeklyTrend.push({
                    day: days[date.getDay()],
                    visits: dayVisits
                });
            }

            // Get zones
            const { data: zones } = await (supabase as any)
                .from('zones')
                .select('id, name')
                .eq('region', userRegion || '');

            const zoneStats: ZoneStats[] = (zones || []).map((zone: any) => ({
                id: zone.id,
                name: zone.name,
                totalVisits: 0,
                repsCount: repStats.length,
                avgVisitsPerRep: 0
            }));

            // Calculate totals
            const totalVisitsMonth = visits?.length || 0;
            const totalVisitsWeek = visits?.filter(v => new Date(v.created_at) >= new Date(startOfWeek)).length || 0;
            const totalObjectives = objectives?.length || 0;
            const completedObjectives = objectives?.filter(o => o.status === 'completed').length || 0;
            const avgCompletionRate = totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

            setData({
                totalVisitsMonth,
                totalVisitsWeek,
                totalReps: repStats.length,
                avgCompletionRate,
                repStats,
                zoneStats,
                weeklyTrend
            });
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background space-y-6">
            {/* Premium White Header Container */}
            <header className="bg-card px-6 py-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-border relative overflow-hidden -mt-2 mx-1">
                {/* Decorative backgrounds */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-60 text-slate-900"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none transform transition-transform hover:scale-105">
                            <Users className="text-white h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Panel de Supervisión Regional</p>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                                ¡Hola, {user?.email?.split('@')[0]}!
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[10px] px-2.5 py-0.5 uppercase tracking-wider">
                                    Supervisor
                                </Badge>
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted border border-border">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{userRegion || 'Región'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </div>
                            </div>
                            <Button
                                onClick={loadDashboardData}
                                size="icon"
                                variant="outline"
                                className="w-12 h-12 rounded-2xl border-border bg-muted shadow-sm hover:shadow-md transition-all active:scale-95 group"
                            >
                                <RefreshCw className={cn("h-5 w-5 text-muted-foreground group-hover:text-emerald-600 transition-colors", loading && "animate-spin")} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Performance Summary Bar */}
                <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center gap-x-8 gap-y-3">
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">Filtrar Periodo:</p>
                        <Select value={selectedPeriod} onValueChange={(v: 'week' | 'month') => setSelectedPeriod(v)}>
                            <SelectTrigger className="w-44 bg-muted border-none h-10 font-bold rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Esta Semana</SelectItem>
                                <SelectItem value="month">Este Mes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="h-8 w-px bg-border hidden md:block"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <p className="text-xs font-bold text-muted-foreground">
                            {data?.totalReps || 0} Representantes en línea
                        </p>
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Visitas del Mes"
                    value={data?.totalVisitsMonth || 0}
                    icon={<Calendar />}
                    color="emerald"
                    subtitle={`${data?.totalVisitsWeek || 0} esta semana`}
                />
                <KPICard
                    title="Representantes"
                    value={data?.totalReps || 0}
                    icon={<Users />}
                    color="blue"
                    subtitle="Activos en tu región"
                />
                <KPICard
                    title="Cumplimiento"
                    value={`${data?.avgCompletionRate || 0}%`}
                    icon={<Target />}
                    color="amber"
                    subtitle="Objetivos logrados"
                />
                <KPICard
                    title="Promedio/Rep"
                    value={data?.totalReps ? Math.round((data?.totalVisitsMonth || 0) / data.totalReps) : 0}
                    icon={<Activity />}
                    color="purple"
                    subtitle="Visitas por representante"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Trend */}
                <Card className="bg-white border-slate-200 shadow-sm text-slate-900">
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-emerald-500" />
                            Tendencia Semanal de Visitas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data?.weeklyTrend || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="day" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="visits"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Visits per Representative */}
                <Card className="bg-white border-slate-200 shadow-sm text-slate-900">
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            Visitas por Representante
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.repStats?.slice(0, 6) || []} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#64748b" />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="#64748b"
                                        width={100}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar dataKey="visitsThisMonth" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Representatives Table */}
            <Card className="bg-white border-slate-200 shadow-sm text-slate-900">
                <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-500" />
                        Rendimiento del Equipo
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-card/50 border-none">
                                    <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Representante</th>
                                    <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visitas Mes</th>
                                    <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visitas Sem.</th>
                                    <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Objetivos</th>
                                    <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cumplimiento</th>
                                    <th className="text-right py-4 px-6"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.repStats?.map((rep, index) => {
                                    const completionRate = rep.objectivesTotal > 0
                                        ? Math.round((rep.objectivesCompleted / rep.objectivesTotal) * 100)
                                        : 0;

                                    return (
                                        <tr key={rep.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        {rep.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{rep.name}</p>
                                                        <p className="text-xs text-slate-500">{rep.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <span className="text-lg font-semibold text-slate-800">{rep.visitsThisMonth}</span>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <span className="text-lg font-semibold text-slate-800">{rep.visitsThisWeek}</span>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <span className="text-slate-600">{rep.objectivesCompleted}/{rep.objectivesTotal}</span>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Progress value={completionRate} className="w-16 h-2" />
                                                    <span className={`text-sm font-medium ${completionRate >= 80 ? 'text-emerald-600' : completionRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {completionRate}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                <ChevronRight className="h-4 w-4 text-slate-400" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {(!data?.repStats || data.repStats.length === 0) && (
                            <div className="text-center py-8 text-slate-500">
                                No hay representantes en tu región
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function KPICard({ title, value, icon, color, subtitle }: any) {
    const variants: any = {
        emerald: {
            bg: "bg-emerald-500/10",
            icon: "text-emerald-600 bg-emerald-500/20",
        },
        blue: {
            bg: "bg-blue-500/10",
            icon: "text-blue-600 bg-blue-500/20",
        },
        amber: {
            bg: "bg-amber-500/10",
            icon: "text-amber-600 bg-amber-500/20",
        },
        purple: {
            bg: "bg-purple-500/10",
            icon: "text-purple-600 bg-purple-500/20",
        },
    };

    const v = variants[color] || variants.emerald;

    return (
        <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none bg-card rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6 relative">
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity duration-500", v.bg)}></div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.15em]">{title}</p>
                        <p className="text-3xl font-black text-foreground tracking-tight tabular-nums">
                            {value}
                        </p>
                        {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-1">{subtitle}</p>}
                    </div>
                    <div className={cn("p-4 rounded-[1.25rem] transition-all duration-300 group-hover:scale-110", v.icon)}>
                        {cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: 2.5 })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
