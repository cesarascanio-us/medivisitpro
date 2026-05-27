import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  BarChart3, Download, Target, Calendar, DollarSign, PackageCheck, TrendingUp
} from 'lucide-react';
import { 
  EliteHeader, EliteKPICard, EliteCard, EliteButton, EliteTable, EliteBadge 
} from '@/components/layout/DesignSystem';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardManager({ organizationId }: { organizationId: string }) {
  const { user, isManager, isCoordinator, isSupervisor, isSaaSStaff, profile } = useAuth();
  
  if (!isManager && !isCoordinator && !isSupervisor && !isSaaSStaff) {
    return <Navigate to="/unauthorized" replace />;
  }

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (d: Date) => {
    const formatted = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Mock Data
  const visitasData = [
    { day: 'Lun', visitas: 145 },
    { day: 'Mar', visitas: 168 },
    { day: 'Mié', visitas: 152 },
    { day: 'Jue', visitas: 184 },
    { day: 'Vie', visitas: 132 },
  ];

  const rankingData = [
    { id: 1, name: 'Carlos Mendoza', role: 'Representante Sr.', visitas: 42, efectividad: 92, status: 'active' },
    { id: 2, name: 'Ana Silva', role: 'Representante', visitas: 38, efectividad: 88, status: 'active' },
    { id: 3, name: 'Luis Herrera', role: 'Representante', visitas: 35, efectividad: 85, status: 'active' },
    { id: 4, name: 'María Gómez', role: 'Representante Jr.', visitas: 28, efectividad: 76, status: 'review' },
    { id: 5, name: 'Pedro Rojas', role: 'Representante', visitas: 22, efectividad: 65, status: 'pending' },
  ];

  return (
    <div className="flex flex-col w-full space-y-6 max-w-[1200px] mx-auto pb-20">
      
      {/* 1. Header ejecutivo */}
      <EliteHeader
        title={`Resumen Ejecutivo, ${profile?.first_name || 'Gerente'}`}
        subtitle={`${formatDate(time)} — Zona Centro`}
        icon={BarChart3}
        rightContent={
          <EliteButton variant="secondary" icon={Download} onClick={() => window.print()}>
            Exportar Reporte
          </EliteButton>
        }
      />

      {/* 2. EliteKPICard Grid (Métricas Core) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EliteKPICard
          title="Cobertura del Ciclo"
          value="64%"
          subtitle="4% por encima del objetivo"
          trend={4}
          icon={Target}
          color="primary"
        />
        <EliteKPICard
          title="Cumplimiento de Visitas"
          value="82%"
          subtitle="1,245 visitas completadas"
          trend={8}
          icon={Calendar}
          color="success"
        />
        <EliteKPICard
          title="Presupuesto Entregado"
          value="45%"
          subtitle="Gasto controlado"
          trend={-2}
          icon={DollarSign}
          color="indigo"
        />
        <EliteKPICard
          title="Transferencias"
          value="120"
          subtitle="Procesadas esta semana"
          trend={15}
          icon={PackageCheck}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Gráficos - BarChart */}
        <div className="lg:col-span-2">
          <EliteCard 
            title="Visitas por Día" 
            action={<EliteButton variant="ghost" size="sm" icon={TrendingUp}>Ver Detalle</EliteButton>}
            className="h-full"
          >
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="day" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    dy={10}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-premium-md)'
                    }}
                  />
                  <Bar dataKey="visitas" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {visitasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" opacity={0.8 + (index * 0.05)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </EliteCard>
        </div>

        {/* 4. EliteTable - Ranking */}
        <div className="lg:col-span-1">
          <EliteTable
            title="Ranking de Representantes"
            description="Desempeño del ciclo actual"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50">
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground w-1/2">Representante</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground text-center">Visitas</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground text-right">Efectividad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.map((rep) => (
                  <TableRow key={rep.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${rep.name}`} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {rep.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{rep.name}</p>
                          <p className="text-xs text-muted-foreground">{rep.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-sm font-medium">{rep.visitas}</span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <EliteBadge 
                        status={rep.status as 'active' | 'review' | 'pending'} 
                        customLabel={`${rep.efectividad}%`} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </EliteTable>
        </div>
      </div>
      
    </div>
  );
}
