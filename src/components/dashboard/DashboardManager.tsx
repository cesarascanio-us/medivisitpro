/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useManagerKPIs } from "@/hooks/useManagerKPIs";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Crown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Target,
  Activity,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  Zap,
  FileCheck,
  Truck,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

interface DashboardManagerProps {
  organizationId?: string | null;
}

export default function DashboardManager({ organizationId }: DashboardManagerProps) {
  const { profile, user, isDemo } = useAuth();
  const { kpis, isLoading, refetch, approveExpense, approveTransfer } = useManagerKPIs();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [approvalTab, setApprovalTab] = useState("expenses");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-44 rounded-[2rem]" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-36 rounded-[1.5rem]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-[1.5rem]" />
          <Skeleton className="h-80 rounded-[1.5rem]" />
        </div>
      </div>
    );
  }

  const firstName = profile?.first_name || user?.email?.split("@")[0] || "Gerente";

  return (
    <div className="flex flex-col min-h-full space-y-6 pb-8">
      {/* ═══════════════════════════════════════════════
          HEADER EJECUTIVO GERENCIAL
      ═══════════════════════════════════════════════ */}
      <header className="bg-card px-8 md:px-12 py-8 rounded-[2rem] shadow-xl shadow-primary/5 border border-border relative overflow-hidden mx-1">
        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-transform">
              <Crown className="text-white h-8 w-8" />
            </div>
            <div>
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Panel Gerencial
              </p>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                ¡Hola, {firstName}!
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className="bg-blue-600/10 text-blue-600 border-none font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider">
                  Gerencia
                </Badge>
                {kpis.activeCycleName && (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold text-[10px] px-2.5 py-0.5">
                    {kpis.activeCycleName}
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted border border-border">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    En línea
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  {currentTime.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </div>
              </div>
              <Button
                onClick={() => refetch()}
                size="icon"
                variant="outline"
                className="w-12 h-12 rounded-[1rem] border-border bg-muted shadow-sm hover:shadow-md transition-all active:scale-95 group"
              >
                <RefreshCw
                  className={cn(
                    "h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors",
                    isLoading && "animate-spin"
                  )}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Summary bar */}
        <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">{kpis.totalReps} Representantes</span>
          </div>
          <div className="h-4 w-px bg-border hidden md:block" />
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">{kpis.totalVisitsMonth} Visitas este mes</span>
          </div>
          <div className="h-4 w-px bg-border hidden md:block" />
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-600">
              {kpis.pendingExpensesCount + kpis.activeTransfersCount} Pendientes de aprobación
            </span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          6 KPIs ESTRATÉGICOS
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <KPICard
          title="Cobertura del Ciclo"
          value={`${kpis.cycleCoverage}%`}
          subtitle="Médicos visitados vs universo"
          icon={<Target />}
          color="blue"
          trend={kpis.cycleCoverage >= 75 ? "up" : "down"}
        />
        <KPICard
          title="Cumplimiento Visitas"
          value={`${kpis.visitCompliance}%`}
          subtitle={`${kpis.totalVisitsCompleted} completadas de ${kpis.totalVisitsMonth}`}
          icon={<FileCheck />}
          color="emerald"
          trend={kpis.visitCompliance >= 80 ? "up" : "down"}
        />
        <KPICard
          title="Gastos Pendientes"
          value={`$${kpis.pendingExpensesTotal.toLocaleString()}`}
          subtitle={`${kpis.pendingExpensesCount} solicitudes por aprobar`}
          icon={<DollarSign />}
          color="amber"
          trend="neutral"
          urgent={kpis.pendingExpensesCount > 5}
        />
        <KPICard
          title="Transferencias Activas"
          value={kpis.activeTransfersCount.toString()}
          subtitle="Pedidos en proceso"
          icon={<Truck />}
          color="purple"
          trend="neutral"
        />
        <KPICard
          title="Tasa de Conversión"
          value={`${kpis.conversionRate}%`}
          subtitle="Visitas → Pedidos"
          icon={<Zap />}
          color="rose"
          trend={kpis.conversionRate >= 40 ? "up" : "down"}
        />
        <KPICard
          title="Productividad / Rep"
          value={kpis.productivityIndex.toFixed(1)}
          subtitle="Visitas completadas promedio"
          icon={<BarChart3 />}
          color="cyan"
          trend={kpis.productivityIndex >= 8 ? "up" : "down"}
        />
      </div>

      {/* ═══════════════════════════════════════════════
          CENTRO DE APROBACIONES RÁPIDAS
      ═══════════════════════════════════════════════ */}
      <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
        <CardHeader className="pb-2 px-8 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black text-foreground uppercase tracking-tight">
                Centro de Aprobaciones
              </CardTitle>
              <CardDescription className="text-xs font-semibold">
                Gestiona solicitudes pendientes del equipo
              </CardDescription>
            </div>
            <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-xs px-3 py-1">
              {kpis.pendingExpensesCount + kpis.activeTransfersCount} pendientes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs value={approvalTab} onValueChange={setApprovalTab} className="w-full">
            <TabsList className="bg-muted/50 rounded-xl p-1 mb-6 w-full sm:w-auto">
              <TabsTrigger value="expenses" className="rounded-lg font-bold text-xs px-6 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <DollarSign className="h-3.5 w-3.5 mr-2" />
                Gastos ({kpis.pendingExpensesCount})
              </TabsTrigger>
              <TabsTrigger value="transfers" className="rounded-lg font-bold text-xs px-6 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Package className="h-3.5 w-3.5 mr-2" />
                Transferencias ({kpis.activeTransfersCount})
              </TabsTrigger>
            </TabsList>

            {/* Tab: Gastos Pendientes */}
            <TabsContent value="expenses" className="space-y-3 mt-0">
              {kpis.pendingExpenses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-400" />
                  <p className="font-bold text-sm">No hay gastos pendientes</p>
                  <p className="text-xs mt-1">Todo al día ✓</p>
                </div>
              ) : (
                kpis.pendingExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <DollarSign className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground truncate">{expense.description}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{expense.user_name}</span>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-bold">{expense.category}</Badge>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(expense.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <span className="text-lg font-black text-foreground tabular-nums">
                        ${Number(expense.amount).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                          onClick={() => approveExpense.mutate({ expenseId: expense.id, action: "approved" })}
                          disabled={approveExpense.isPending}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-600"
                          onClick={() => approveExpense.mutate({ expenseId: expense.id, action: "rejected" })}
                          disabled={approveExpense.isPending}
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Tab: Transferencias Pendientes */}
            <TabsContent value="transfers" className="space-y-3 mt-0">
              {kpis.pendingTransfers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-400" />
                  <p className="font-bold text-sm">No hay transferencias pendientes</p>
                  <p className="text-xs mt-1">Todas procesadas ✓</p>
                </div>
              ) : (
                kpis.pendingTransfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground truncate">
                          {transfer.pharmacy_name || `Pedido #${transfer.id.slice(0, 8)}`}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{transfer.user_name}</span>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground">{transfer.items_count || 0} productos</span>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[9px] px-1.5 py-0 h-4 font-bold uppercase",
                              transfer.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                            )}
                          >
                            {transfer.status === "pending" ? "Pendiente" : "En Proceso"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <span className="text-lg font-black text-foreground tabular-nums">
                        ${Number(transfer.total_amount).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                          onClick={() => approveTransfer.mutate({ transferId: transfer.id, action: "approved" })}
                          disabled={approveTransfer.isPending}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-600"
                          onClick={() => approveTransfer.mutate({ transferId: transfer.id, action: "rejected" })}
                          disabled={approveTransfer.isPending}
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════
          GRÁFICOS DE TENDENCIA
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
        {/* Weekly Visits */}
        <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Visitas de la Semana
            </CardTitle>
            <CardDescription className="text-xs font-semibold">Actividad de campo Lunes a Viernes</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.weeklyVisits} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} visitas`, 'Total']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))',
                      fontWeight: 700,
                    }}
                  />
                  <Bar
                    dataKey="visits"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses Trend */}
        <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-tight text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-500" />
              Gastos del Mes
            </CardTitle>
            <CardDescription className="text-xs font-semibold">Acumulado por semana</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpis.monthlyExpenses} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                    tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))',
                      fontWeight: 700,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: "#f59e0b", strokeWidth: 2, stroke: "hsl(var(--card))", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════
          RANKING DE REPRESENTANTES
      ═══════════════════════════════════════════════ */}
      <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
        <CardHeader className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Ranking de Representantes
              </CardTitle>
              <CardDescription className="text-xs font-semibold">Rendimiento del equipo este mes</CardDescription>
            </div>
            <Badge variant="secondary" className="font-bold text-xs">{kpis.totalReps} activos</Badge>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">#</th>
                  <th className="text-left py-3 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Representante</th>
                  <th className="text-center py-3 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Visitas</th>
                  <th className="text-center py-3 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Completadas</th>
                  <th className="text-center py-3 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Efectividad</th>
                </tr>
              </thead>
              <tbody>
                {kpis.repStats.map((rep, index) => (
                  <tr key={rep.user_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black",
                        index === 0 ? "bg-amber-500/10 text-amber-600" :
                        index === 1 ? "bg-slate-400/10 text-slate-500" :
                        index === 2 ? "bg-orange-600/10 text-orange-600" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-black">
                          {rep.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{rep.name}</p>
                          <p className="text-[10px] text-muted-foreground">{rep.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="text-sm font-bold text-foreground tabular-nums">{rep.visits_total}</span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="text-sm font-bold text-foreground tabular-nums">{rep.visits_completed}</span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={rep.effectiveness} className="w-14 h-2" />
                        <span className={cn(
                          "text-sm font-black tabular-nums",
                          rep.effectiveness >= 80 ? "text-emerald-600" :
                          rep.effectiveness >= 60 ? "text-amber-600" :
                          "text-red-500"
                        )}>
                          {rep.effectiveness}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {kpis.repStats.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold text-sm">No hay representantes registrados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   KPI CARD COMPONENT
═══════════════════════════════════════════════ */

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "amber" | "purple" | "rose" | "cyan";
  trend?: "up" | "down" | "neutral";
  urgent?: boolean;
}

const COLOR_MAP = {
  blue:    { bg: "bg-blue-500/10",    icon: "text-blue-600 bg-blue-500/15",    ring: "ring-blue-500/20" },
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-600 bg-emerald-500/15", ring: "ring-emerald-500/20" },
  amber:   { bg: "bg-amber-500/10",   icon: "text-amber-600 bg-amber-500/15",  ring: "ring-amber-500/20" },
  purple:  { bg: "bg-purple-500/10",  icon: "text-purple-600 bg-purple-500/15", ring: "ring-purple-500/20" },
  rose:    { bg: "bg-rose-500/10",    icon: "text-rose-600 bg-rose-500/15",    ring: "ring-rose-500/20" },
  cyan:    { bg: "bg-cyan-500/10",    icon: "text-cyan-600 bg-cyan-500/15",    ring: "ring-cyan-500/20" },
};

function KPICard({ title, value, subtitle, icon, color, trend = "neutral", urgent }: KPICardProps) {
  const c = COLOR_MAP[color];

  return (
    <Card className={cn(
      "border-none shadow-xl shadow-primary/5 bg-card rounded-[1.75rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300",
      urgent && "ring-2 ring-amber-500/30"
    )}>
      <CardContent className="p-5 relative">
        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", c.bg)} />

        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.12em] leading-tight">{title}</p>
            <p className="text-2xl lg:text-3xl font-black text-foreground tracking-tight tabular-nums leading-none mt-2">
              {value}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground mt-1.5 truncate">{subtitle}</p>
          </div>
          <div className="flex flex-col items-center gap-2 ml-2 shrink-0">
            <div className={cn("p-3 rounded-[1rem] transition-all duration-300 group-hover:scale-110", c.icon)}>
              {icon}
            </div>
            {trend !== "neutral" && (
              <div className={cn(
                "flex items-center gap-0.5",
                trend === "up" ? "text-emerald-500" : "text-red-500"
              )}>
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
