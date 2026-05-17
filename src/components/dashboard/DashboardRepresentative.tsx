import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  MapPin, Clock, Calendar, CheckCircle, Store, Stethoscope, 
  Map, Target, Package, AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardRepresentative({ organizationId, zoneId }: { organizationId: string, zoneId: string | undefined }) {
  const { profile, organizationName, user } = useAuth();
  const { farmacias, medicos, visitas, transferencias, ciclo } = useDashboardData(organizationId, zoneId);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (d: Date) => d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Mock data for UI
  const agendaHoy = [
    { name: 'Farmacia Mas+', address: 'Av. Las Delicias', type: 'Farmacia', time: '09:00 AM' },
    { name: 'Dr. Roberto Mendoza', address: 'Clinica Lugo', type: 'Médico', time: '10:30 AM' },
    { name: 'Farmatodo Base Aragua', address: 'Base Aragua', type: 'Farmacia', time: '02:00 PM' }
  ];

  const ultimasVisitas = visitas.data?.slice(0, 5) || [
    { contact_id: '1', checkin_at: '2026-05-17T08:30:00Z', checkout_at: '2026-05-17T09:00:00Z', out_of_range: false, status: 'completed' },
    { contact_id: '2', checkin_at: '2026-05-17T09:15:00Z', checkout_at: '2026-05-17T09:45:00Z', out_of_range: true, status: 'completed' },
    { contact_id: '3', checkin_at: '2026-05-17T10:00:00Z', checkout_at: '2026-05-17T10:20:00Z', out_of_range: false, status: 'completed' }
  ];

  const transferData = [
    { name: 'Procesado', value: 12 },
    { name: 'Pendiente', value: 4 },
    { name: 'Revisión', value: 1 }
  ];

  const misFarmacias = [
    { name: 'Farmacia La Candelaria', lastVisit: 2, potential: 'Alto' },
    { name: 'Farmahorro Centro', lastVisit: 5, potential: 'Medio' },
    { name: 'Locatel Las Delicias', lastVisit: 16, potential: 'Alto' } // Alert
  ];

  const misMedicos = [
    { name: 'Dr. Luis Gomez', specialty: 'Pediatría', lastVisit: 10 },
    { name: 'Dra. Ana Torres', specialty: 'Gastroenterología', lastVisit: 14 }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-background space-y-4 p-4 md:p-6 pb-24 max-w-[1200px] mx-auto">
      
      {/* SECCIÓN 1 — Saludo */}
      <div className="flex flex-col gap-2 bg-card p-4 rounded-lg shadow-premium-md border border-border">
        <h1 className="text-xl font-serif font-bold">Buenos días, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Representante'}</h1>
        <p className="text-sm text-muted-foreground capitalize">{formatDate(time)}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5">
            <MapPin className="w-3 h-3 mr-1" /> Zona Asignada
          </Badge>
          <Badge className="bg-primary text-white">Ciclo Vigente</Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> GPS Activo
          </Badge>
        </div>
      </div>

      {/* SECCIÓN 2 — KPIs del día */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="shadow-premium-md border-l-2 border-primary">
          <CardContent className="p-4 flex flex-col justify-center">
            <h3 className="text-2xl font-bold">3</h3>
            <p className="text-xs text-muted-foreground uppercase mt-1">Visitas Hoy</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium-md border-l-2 border-chart-2">
          <CardContent className="p-4 flex flex-col justify-center">
            <h3 className="text-2xl font-bold">14</h3>
            <p className="text-xs text-muted-foreground uppercase mt-1">Esta Semana</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium-md border-l-2 border-warning">
          <CardContent className="p-4 flex flex-col justify-center">
            <h3 className="text-2xl font-bold">8</h3>
            <p className="text-xs text-muted-foreground uppercase mt-1">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium-md border-l-2 border-primary">
          <CardContent className="p-4 flex flex-col justify-center">
            <h3 className="text-2xl font-bold">64%</h3>
            <p className="text-xs text-muted-foreground uppercase mt-1">Meta Ciclo</p>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 3 y 4 — Agenda y Últimas Visitas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-premium-md flex flex-col h-full">
          <CardContent className="p-4 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold">Mi Agenda de Hoy</h4>
            </div>
            <div className="space-y-3 flex-1">
              {agendaHoy.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.address}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">{item.type}</Badge>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium mb-2 flex items-center text-muted-foreground"><Clock className="w-3 h-3 mr-1" />{item.time}</span>
                    <Button size="sm" className="h-11 text-xs px-3">Registrar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md flex flex-col h-full">
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="p-4 border-b border-border">
              <h4 className="text-sm font-semibold flex items-center gap-2"><Map className="w-5 h-5 text-primary" />Últimas Visitas Registradas</h4>
            </div>
            <ScrollArea className="h-[250px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs">GPS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ultimasVisitas.map((v: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium">#{v.contact_id.substring(0,4)}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1"/> Completada</Badge></TableCell>
                      <TableCell>
                        {v.out_of_range ? 
                          <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="w-3 h-3 mr-1"/> Fuera Rango</Badge> : 
                          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20"><MapPin className="w-3 h-3 mr-1"/> OK</Badge>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 5 — Estado Transferencias */}
      <Card className="shadow-premium-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-semibold">Estado de Mis Transferencias</h4>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={transferData} margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
                  {transferData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Procesado' ? 'hsl(var(--primary))' : entry.name === 'Pendiente' ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN 6 y 7 — Listas de contactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-premium-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold">Mis Farmacias Prioritarias</h4>
            </div>
            <div className="space-y-3">
              {misFarmacias.map((f, i) => (
                <div key={i} className="flex justify-between items-center p-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs font-semibold">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">Potencial: {f.potential}</p>
                  </div>
                  <div>
                    {f.lastVisit > 15 ? 
                      <Badge variant="destructive" className="text-[10px]">+15 días sin visita</Badge> :
                      <span className="text-xs text-muted-foreground">Hace {f.lastVisit} días</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold">Mis Médicos Activos</h4>
            </div>
            <div className="space-y-3">
              {misMedicos.map((m, i) => (
                <div key={i} className="flex justify-between items-center p-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs font-semibold">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.specialty}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Hace {m.lastVisit} días</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
