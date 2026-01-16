import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
    BarChart3
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
    const { user, userRegion } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month');

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Panel de Supervisor</h1>
                    <p className="text-slate-400">Vista general del rendimiento de tu equipo</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        <MapPin className="h-3 w-3 mr-1" />
                        {userRegion || 'Región'}
                    </Badge>
                    <Select value={selectedPeriod} onValueChange={(v: 'week' | 'month') => setSelectedPeriod(v)}>
                        <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Esta Semana</SelectItem>
                            <SelectItem value="month">Este Mes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border-emerald-200 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Visitas del Mes</p>
                                <p className="text-3xl font-bold text-slate-800">{data?.totalVisitsMonth || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-xs text-emerald-600 mt-2 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {data?.totalVisitsWeek || 0} esta semana
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-blue-200 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Representantes</p>
                                <p className="text-3xl font-bold text-slate-800">{data?.totalReps || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2 flex items-center">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activos en tu región
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-amber-200 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Cumplimiento</p>
                                <p className="text-3xl font-bold text-slate-800">{data?.avgCompletionRate || 0}%</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Target className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                        <Progress value={data?.avgCompletionRate || 0} className="mt-3 h-2" />
                    </CardContent>
                </Card>

                <Card className="bg-white border-purple-200 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Promedio/Rep</p>
                                <p className="text-3xl font-bold text-slate-800">
                                    {data?.totalReps ? Math.round((data?.totalVisitsMonth || 0) / data.totalReps) : 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Activity className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">Visitas por representante</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Trend */}
                <Card className="bg-white border-slate-200 shadow-sm">
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
                <Card className="bg-white border-slate-200 shadow-sm">
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
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-500" />
                        Rendimiento del Equipo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Representante</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Visitas Mes</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Visitas Semana</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Objetivos</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Cumplimiento</th>
                                    <th className="text-right py-3 px-4"></th>
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
