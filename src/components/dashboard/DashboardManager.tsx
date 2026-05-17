import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Store, Stethoscope, Hospital, Pill, Target, PackageCheck, Package,
  FileText, Presentation, AlertTriangle, Printer, LayoutDashboard
} from 'lucide-react';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))'
];

export default function DashboardManager({ organizationId }: { organizationId: string }) {
  const { user, isManager, isSaaSStaff, profile, organizationName } = useAuth();
  
  if (!isManager && !isSaaSStaff) {
    return <Navigate to="/unauthorized" replace />;
  }

  // --- ESTADO ---
  const [time, setTime] = useState(new Date());
  interface Filters {
    ciclo: string;
    zona: string;
    segmento: string;
    potencial: string;
    busqueda: string;
  }

  const [filters, setFilters] = useState<Filters>({
    ciclo: 'Abr 2026',
    zona: 'Todas',
    segmento: 'Todas',
    potencial: 'Todos',
    busqueda: ''
  });

  const { farmacias, medicos, visitas, transferencias, inventario, ciclo } = useDashboardData(organizationId);

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- DATOS ESTÁTICOS Y COMPONENTES ANIMADOS ---
  const kpis = [
    { label: "Farmacias Activas", value: 143, sub: "197 en base total", trend: "73% cobertura", bar: 73, icon: Store },
    { label: "Médicos Activos", value: 167, sub: "6 especialidades", trend: "163 en fichero", bar: 98, icon: Stethoscope },
    { label: "Centros de Salud", value: 78, sub: "8 hospitales activos", trend: "78 en registro", bar: 88, icon: Hospital },
    { label: "Productos Activos", value: 83, sub: "4 categorías", trend: "321 Q&A técnicas", bar: 100, icon: Pill },
    { label: "Meta Ciclo Abril", value: 870, sub: "Objetivo: 1,000 u.", trend: "87% proyectado", bar: 87, icon: Target },
    { label: "Transferencias", value: 19, sub: "5 droguerías activas", trend: "100% procesadas", bar: 100, icon: PackageCheck }
  ];

  const donutData = [
    { name: "Cadena", value: 28 },
    { name: "Mini Cadena", value: 35 },
    { name: "Independiente", value: 134 }
  ];

  const radarData = [
    { subject: "Norte", farmacias: 38, medicos: 28 },
    { subject: "Centro", farmacias: 45, medicos: 42 },
    { subject: "Sur", farmacias: 32, medicos: 18 },
    { subject: "Este", farmacias: 41, medicos: 36 },
    { subject: "Oeste", farmacias: 41, medicos: 43 }
  ];

  const barEspData = [
    { name: "Med. Interna", value: 44 },
    { name: "Med. General", value: 31 },
    { name: "Gastro", value: 28 },
    { name: "Nefrólogo", value: 22 },
    { name: "Pediatría", value: 24 },
    { name: "Urología", value: 18 }
  ];

  const areaData = [
    { name: "Sep 25", farmacias: 8, medicos: 12, meta: 20 },
    { name: "Oct 25", farmacias: 14, medicos: 18, meta: 20 },
    { name: "Nov 25", farmacias: 19, medicos: 22, meta: 20 },
    { name: "Dic 25", farmacias: 11, medicos: 15, meta: 20 },
    { name: "Abr 26", farmacias: 11, medicos: 7, meta: 20 }
  ];

  const anillosSvg = [
    { label: "Farmacias", pct: 0.43, value: "43/100", color: "hsl(var(--primary))" },
    { label: "Unidades", pct: 0.87, value: "870/1000", color: "hsl(var(--warning))" },
    { label: "Eventos", pct: 1.00, value: "2/2", color: "hsl(var(--chart-2))" }
  ];

  const zonasMap = [
    { nombre: "Norte", points: "30,20 130,20 120,75 80,70 40,75", farmacias: 38, color: "var(--primary)" },
    { nombre: "Este", points: "130,20 230,30 220,100 130,80 120,75", farmacias: 41, color: "var(--chart-2)" },
    { nombre: "Centro", points: "80,70 120,75 130,80 115,140 75,140 60,110", farmacias: 45, color: "var(--chart-4)" },
    { nombre: "Oeste", points: "30,20 40,75 60,110 30,150 10,100 8,50", farmacias: 41, color: "var(--warning)" },
    { nombre: "Sur", points: "30,150 75,140 115,140 130,80 220,100 230,180 120,195 40,185", farmacias: 32, color: "var(--destructive)" }
  ];

  const scatterData1 = [{ x: 1, y: 2, z: 8 }, { x: 2, y: 3, z: 10 }, { x: 3, y: 2, z: 6 }, { x: 4, y: 3, z: 12 }, { x: 5, y: 2, z: 8 }, { x: 6, y: 3, z: 9 }];
  const scatterData2 = [{ x: 7, y: 1, z: 7 }];
  const scatterData3 = [{ x: 8, y: 2, z: 5 }];

  const barFarmacias = [
    { name: "Locatel", value: 92 },
    { name: "Farmatodo", value: 88 },
    { name: "Farmacia Mas+", value: 84 },
    { name: "Farma Salud", value: 78 },
    { name: "FarmaVital", value: 74 },
    { name: "Gran Vía", value: 68 },
    { name: "Farma Shop", value: 62 },
    { name: "Solidaria", value: 58 }
  ];

  const barDroguerias = [
    { name: "COBECA", value: 1204 },
    { name: "DroNena", value: 892 },
    { name: "DrovenCentro", value: 678 },
    { name: "VitalClinic", value: 445 },
    { name: "Dromega", value: 334 },
    { name: "Farmasur", value: 280 },
    { name: "DroVentas", value: 210 },
    { name: "Farmed", value: 190 },
    { name: "Distribiomed", value: 165 }
  ];

  const muestrasData = [
    { name: "Leche Mag.", inicial: 12, disponible: 12, alerta: "none" },
    { name: "Calzinc D", inicial: 9, disponible: 9, alerta: "none" },
    { name: "Vitacon C", inicial: 6, disponible: 6, alerta: "none" },
    { name: "Acetafen", inicial: 12, disponible: 12, alerta: "none" },
    { name: "NeutroX", inicial: 12, disponible: 12, alerta: "none" },
    { name: "Calzinc Banco", inicial: 9, disponible: 3, alerta: "true" },
    { name: "Zincosol Banco", inicial: 36, disponible: 18, alerta: "warn" }
  ];

  const intensidades = [0, 0, 1, 0, 0, 0, 2, 3, 1, 0, 0, 0, 5, 4, 3, 5, 8, 7, 2, 1, 0, 0, 0, 1, 2, 4, 6, 8, 5, 3, 4, 3, 2, 1, 0, 0];
  const estrategia = [
    { dia: "Lunes", act: "Auditoría Inventario", zona: "Santa Rita", color: "bg-blue-100 text-blue-800" },
    { dia: "Martes", act: "Fidelización", zona: "Casco Central", color: "bg-green-100 text-green-800" },
    { dia: "Miércoles", act: "Rotación", zona: "SurOeste", color: "bg-yellow-100 text-yellow-800" },
    { dia: "Jueves", act: "Jornada de Impulso", zona: "Farmatodo Delta", color: "bg-red-100 text-red-800" },
    { dia: "Viernes", act: "Entorno 360", zona: "Zona Norte HCM", color: "bg-purple-100 text-purple-800" }
  ];

  const feed = [
    { icon: Store, text: "Jornada Impulso PRO-013 — Farmacias", time: "hace 2 días", color: "text-primary bg-primary/10" },
    { icon: Package, text: "Transferencia — Farmacia Malanga (DroNena)", time: "hace 4 días", color: "text-chart-2 bg-chart-2/10" },
    { icon: Store, text: "Visita Inventario zona Norte", time: "hace 5 días", color: "text-primary bg-primary/10" },
    { icon: FileText, text: "Cotización aprobada — Vista Alegre", time: "hace 6 días", color: "text-warning bg-warning/10" },
    { icon: Presentation, text: "Charla Mundo Pharma — 6 asistentes", time: "hace 7 días", color: "text-chart-4 bg-chart-4/10" },
    { icon: Package, text: "Transferencia — Mi Esperanza (COBECA)", time: "hace 9 días", color: "text-chart-2 bg-chart-2/10" },
    { icon: AlertTriangle, text: "Retiro Lote 249301 — PRO-027", time: "hace 14 días", color: "text-destructive bg-destructive/10" },
    { icon: Store, text: "Inauguración sede El Limón", time: "hace 18 días", color: "text-primary bg-primary/10" }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const prodCarousel = [
    { code: "PRO-013", name: "Zincosol", stock: 127, cat: "Línea Pediátrica" },
    { code: "PRO-026", name: "Leche de Magnesia", stock: 98, cat: "Línea Gastro" },
    { code: "PRO-035", name: "NeutroX", stock: 84, cat: "Línea Gastro" },
    { code: "PRO-002", name: "Calzinc D", stock: 76, cat: "Línea Pediátrica" }
  ];

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(c => (c + 1) % prodCarousel.length), 3500);
    return () => clearInterval(t);
  }, []);

  const semaforos = [
    { label: "Cobertura", pct: 0.73, color: "hsl(var(--primary))", status: "Bueno" },
    { label: "Meta Ventas", pct: 0.87, color: "hsl(var(--warning))", status: "Atención" },
    { label: "Stock Muestras", pct: 0.45, color: "hsl(var(--destructive))", status: "Alerta" },
    { label: "Vigencia Ciclo", pct: 0.70, color: "hsl(var(--chart-2))", status: "Avanzado" }
  ];

  const AnimatedNumber = ({ value }: { value: number }) => {
    const [num, setNum] = useState(0);
    useEffect(() => {
      let step = 0;
      const t = setInterval(() => {
        step += 1;
        setNum(Math.round((value / 40) * step));
        if (step >= 40) clearInterval(t);
      }, 25);
      return () => clearInterval(t);
    }, [value]);
    return <>{num}</>;
  };

  const SvgRing = ({ pct, color, label, val }: any) => {
    const [offset, setOffset] = useState(226);
    useEffect(() => {
      setTimeout(() => setOffset(226 * (1 - pct)), 100);
    }, [pct]);
    return (
      <div className="flex flex-col items-center">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="8" />
          <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray="226" strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute mt-7 text-xs font-bold" style={{ color }}>{val}</div>
        <p className="text-xs text-muted-foreground mt-2 font-medium">{label}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background space-y-4 p-4 md:p-6 pb-24 max-w-[1600px] mx-auto">
      
      {/* SECCIÓN 1 — Subheader */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-lg shadow-premium-md border border-border">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-md">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">{organizationName || 'Empresa'} — Centro de Comando</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-xs text-primary font-medium tracking-wide">Ciclo Abril 2026 — VIGENTE</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user?.user_metadata?.full_name || profile?.first_name || 'Gerente'}</p>
            <p className="text-xs text-muted-foreground">{time.toLocaleTimeString()}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 text-xs">
            <Printer className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* SECCIÓN 2 — Barra de filtros */}
      <Card className="shadow-premium-md">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <Select value={filters.ciclo} onValueChange={v => setFilters({...filters, ciclo: v})}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Sep 2025', 'Oct 2025', 'Nov 2025', 'Dic 2025', 'Abr 2026'].map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar flex-1">
            {['Todas', 'Norte', 'Centro', 'Sur', 'Este', 'Oeste'].map(z => (
              <Badge key={z} variant={filters.zona === z ? 'default' : 'secondary'}
                className={`cursor-pointer whitespace-nowrap ${filters.zona === z ? 'bg-primary/10 text-primary border-primary hover:bg-primary/20' : 'bg-muted text-muted-foreground'}`}
                onClick={() => setFilters({...filters, zona: z})}>
                {z}
              </Badge>
            ))}
            <div className="w-px h-6 bg-border mx-2" />
            {['Todas', 'Cadena', 'Mini Cadena', 'Independiente'].map(s => (
              <Badge key={s} variant={filters.segmento === s ? 'default' : 'secondary'}
                className={`cursor-pointer whitespace-nowrap ${filters.segmento === s ? 'bg-primary/10 text-primary border-primary hover:bg-primary/20' : 'bg-muted text-muted-foreground'}`}
                onClick={() => setFilters({...filters, segmento: s})}>
                {s}
              </Badge>
            ))}
            <div className="w-px h-6 bg-border mx-2" />
            {['Todos', 'Alto', 'Medio', 'Bajo'].map(p => (
              <Badge key={p} variant={filters.potencial === p ? 'default' : 'secondary'}
                className={`cursor-pointer whitespace-nowrap ${filters.potencial === p ? 'bg-primary/10 text-primary border-primary hover:bg-primary/20' : 'bg-muted text-muted-foreground'}`}
                onClick={() => setFilters({...filters, potencial: p})}>
                {p}
              </Badge>
            ))}
          </div>

          <Input placeholder="Buscar farmacia, médico, producto..." className="w-full md:w-64 h-8 text-xs" 
            value={filters.busqueda} onChange={e => setFilters({...filters, busqueda: e.target.value})} />
        </CardContent>
      </Card>

      {/* SECCIÓN 3 — 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k, i) => (
          <Card key={i} className="border-l-2 border-primary shadow-premium-md relative overflow-hidden group">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="rounded-md p-2 bg-primary/10">
                  <k.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-primary font-medium flex items-center">▲ {k.trend}</span>
              </div>
              <h3 className="text-2xl font-bold mt-2"><AnimatedNumber value={k.value} /></h3>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1 truncate">{k.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1 opacity-80">{k.sub}</p>
              
              <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
                <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${k.bar}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SECCIÓN 4 — Fila 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card className="shadow-premium-md flex flex-col">
          <CardContent className="p-4 flex-1">
            <h4 className="text-sm font-semibold mb-4">Segmentación Farmacias</h4>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} innerRadius={68} outerRadius={90} dataKey="value" stroke="none">
                    {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">197</span>
                <span className="text-xs text-muted-foreground uppercase">Farmacias</span>
              </div>
            </div>
            <Card className="bg-primary/5 border-primary/20 p-3 mt-4">
              <p className="text-xs text-muted-foreground leading-relaxed"><span className="text-primary mr-1">💡</span> 68% de las farmacias son independientes, foco de fidelización actual.</p>
            </Card>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md flex flex-col">
          <CardContent className="p-4 flex-1">
            <h4 className="text-sm font-semibold mb-4">Cobertura por Zona</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius={70}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Radar name="Farmacias" dataKey="farmacias" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
                  <Radar name="Médicos" dataKey="medicos" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <Card className="bg-primary/5 border-primary/20 p-3 mt-4">
              <p className="text-xs text-muted-foreground leading-relaxed"><span className="text-primary mr-1">💡</span> Zona Centro lidera en ambos segmentos con alta densidad.</p>
            </Card>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md flex flex-col">
          <CardContent className="p-4 flex-1">
            <h4 className="text-sm font-semibold mb-4">Médicos por Especialidad</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barEspData} margin={{ left: -20, right: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval={0} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="value" barSize={28} radius={[4, 4, 0, 0]}>
                    {barEspData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Card className="bg-primary/5 border-primary/20 p-3 mt-4">
              <p className="text-xs text-muted-foreground leading-relaxed"><span className="text-primary mr-1">💡</span> Medicina Interna es el pilar para la línea Gastro y Pediátrica.</p>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 5 — Area Chart */}
      <Card className="shadow-premium-md">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-4">Visitas Efectivas por Ciclo (Meta 20/día)</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <ReferenceLine y={20} label={{ position: 'top', value: 'Meta (20)', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} stroke="hsl(var(--chart-3))" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="farmacias" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorF)" />
                <Area type="monotone" dataKey="medicos" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorM)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN 6 — 3 columnas Gantt + Rings + Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card className="shadow-premium-md flex flex-col">
          <CardContent className="p-4 flex-1">
            <h4 className="text-sm font-semibold mb-4">Línea de Tiempo de Ciclos</h4>
            <div className="relative h-40 border-l border-b border-border pl-2 pb-2 mt-4">
              {[{n:"Sep 25", i:0, d:15, s:"P"}, {n:"Oct 25", i:18, d:15, s:"P"}, {n:"Nov 25", i:36, d:15, s:"P"}, {n:"Dic 25", i:54, d:15, s:"P"}, {n:"Abr 26", i:72, d:20, s:"V"}].map((c, i) => (
                <div key={i} className="flex items-center text-xs mb-3">
                  <span className="w-12 text-muted-foreground text-[10px]">{c.n}</span>
                  <div className="relative h-4 flex-1 mx-2 bg-muted/20 rounded-full overflow-hidden">
                    <div className={`absolute top-0 h-full rounded-full transition-all ${c.s === 'V' ? 'bg-primary/40 border border-primary' : 'bg-muted border border-border'}`} style={{ left: `${c.i}%`, width: `${c.d}%` }}></div>
                    {c.s === 'V' && <div className="absolute top-0 bottom-0 w-0.5 bg-warning z-10" style={{ left: `${c.i + c.d * 0.68}%` }}></div>}
                  </div>
                </div>
              ))}
              <div className="absolute bottom-[-16px] left-[78%] text-[9px] text-warning">Hoy (68%)</div>
            </div>
            <Card className="bg-primary/5 border-primary/20 p-3 mt-4">
              <p className="text-xs text-muted-foreground leading-relaxed"><span className="text-primary mr-1">💡</span> Ciclo actual finaliza en 9 días hábiles.</p>
            </Card>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md flex flex-col">
          <CardContent className="p-4 flex-1">
            <h4 className="text-sm font-semibold mb-6">Cumplimiento del Plan</h4>
            <div className="flex justify-around items-end h-32">
              {anillosSvg.map((r, i) => <SvgRing key={i} pct={r.pct} color={r.color} label={r.label} val={r.value} />)}
            </div>
            <Card className="bg-primary/5 border-primary/20 p-3 mt-6">
              <p className="text-xs text-muted-foreground leading-relaxed"><span className="text-primary mr-1">💡</span> Desfase en cobertura de farmacias (43%) vs entrega de unidades (87%).</p>
            </Card>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md flex flex-col">
          <CardContent className="p-4 flex-1">
            <h4 className="text-sm font-semibold mb-2">Impacto por Territorio (Aragua)</h4>
            <div className="flex justify-center items-center h-40">
              <svg viewBox="0 0 260 210" className="w-full h-full max-w-[200px] hover:[&>polygon]:stroke-2">
                {zonasMap.map((z, i) => (
                  <g key={i} className="cursor-pointer transition-transform hover:scale-105 origin-center" onClick={() => setFilters({...filters, zona: z.nombre})}>
                    <polygon points={z.points} fill={`${z.color}`} fillOpacity={0.2} stroke={z.color} strokeWidth="1" className="transition-all" />
                    <title>{z.nombre}: {z.farmacias} farmacias</title>
                  </g>
                ))}
              </svg>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {zonasMap.map(z => <span key={z.nombre} className="text-[10px] text-muted-foreground flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: z.color}}></div>{z.nombre}</span>)}
            </div>
            <Card className="bg-primary/5 border-primary/20 p-3 mt-2">
              <p className="text-xs text-muted-foreground leading-relaxed"><span className="text-primary mr-1">💡</span> Clic en un polígono para filtrar globalmente por zona.</p>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 7 — 2 columnas Scatter + Bar Horizontal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-premium-md">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-4">Estatus de Transferencias (Volumen vs Frecuencia)</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <XAxis type="number" dataKey="x" name="Días" tick={{ fontSize: 10 }} />
                  <YAxis type="number" dataKey="y" name="Vol." tick={{ fontSize: 10 }} />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                  <Scatter name="Procesado" data={scatterData1} fill="hsl(var(--primary))" opacity={0.8} />
                  <Scatter name="Pendiente" data={scatterData2} fill="hsl(var(--warning))" opacity={0.8} />
                  <Scatter name="Revisión" data={scatterData3} fill="hsl(var(--destructive))" opacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-4">Top Farmacias en Sell-Out</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={barFarmacias} margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                  <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                    {barFarmacias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 2 ? 'hsl(var(--primary))' : index < 5 ? 'hsl(var(--chart-2))' : 'hsl(var(--muted-foreground))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 8 — 2 columnas Droguerías + Muestras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-premium-md">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-4">Inventario en Droguerías (Unidades)</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barDroguerias} margin={{ left: -10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-4">Stock de Muestras Médicas (Disponibilidad)</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={muestrasData} margin={{ left: -10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                  <Bar dataKey="inicial" fill="hsl(var(--chart-2))" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="disponible" radius={[4, 4, 0, 0]}>
                    {muestrasData.map((d, i) => (
                      <Cell key={i} fill={d.alerta === 'true' ? 'hsl(var(--destructive))' : d.alerta === 'warn' ? 'hsl(var(--warning))' : 'hsl(var(--chart-2))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 9 — Heatmap + Tabla (1.5fr / 1fr) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
        <Card className="shadow-premium-md">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-4">Densidad de Actividad (Semanas)</h4>
            <div className="flex flex-wrap gap-1 max-w-[600px] mt-2">
              {intensidades.map((val, i) => {
                let bg = 'bg-muted/40';
                if (val > 0) bg = 'bg-primary/20';
                if (val > 2) bg = 'bg-primary/40';
                if (val > 4) bg = 'bg-primary/60';
                if (val > 6) bg = 'bg-primary';
                return <div key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-[2px] ${bg} hover:scale-125 transition-transform cursor-pointer`} title={`Semana ${i+1}: ${val} acciones`} />
              })}
            </div>
            <div className="flex gap-2 items-center text-[10px] text-muted-foreground mt-4">
              <span>Menos</span>
              <div className="flex gap-1"><div className="w-3 h-3 bg-muted/40"></div><div className="w-3 h-3 bg-primary/20"></div><div className="w-3 h-3 bg-primary/60"></div><div className="w-3 h-3 bg-primary"></div></div>
              <span>Más</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md overflow-hidden">
          <CardContent className="p-0">
            <h4 className="text-sm font-semibold p-4 pb-2">Plan Estratégico Semanal</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Día</TableHead>
                    <TableHead className="text-xs">Actividad Clave</TableHead>
                    <TableHead className="text-xs">Territorio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estrategia.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-2 text-xs font-medium">{e.dia}</TableCell>
                      <TableCell className="py-2"><Badge variant="outline" className={`text-[10px] font-normal ${e.color} border-transparent`}>{e.act}</Badge></TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{e.zona}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 10 — 3 columnas Alerta + Feed + Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-destructive bg-destructive/5 shadow-premium-md relative">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <Badge variant="destructive" className="animate-pulse">NOVEDAD ACTIVA — Lote 249301</Badge>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h4 className="font-semibold text-sm">PRO-027 Limonada Laxante</h4>
            <p className="text-xs text-muted-foreground mt-1">Lugar: Farmacias Mundo Total (Av. Bolívar)</p>
            <p className="text-xs text-muted-foreground">Regente: Dr. David Romero · 0414-5892156</p>
            <Button variant="destructive" size="sm" className="w-full mt-4 h-8 text-xs">Ver Protocolo →</Button>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3">Feed Operacional</h4>
            <ScrollArea className="h-[140px] pr-4">
              <div className="space-y-3">
                {feed.map((f, i) => (
                  <div key={i} className="flex gap-3 group cursor-pointer hover:bg-muted/50 p-1 rounded-md transition-colors">
                    <div className={`p-1.5 rounded-full shrink-0 h-min ${f.color}`}><f.icon className="h-3 w-3" /></div>
                    <div>
                      <p className="text-xs font-medium">{f.text}</p>
                      <p className="text-[10px] text-muted-foreground">{f.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">CA</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse"></div>
            </div>
            <h4 className="font-semibold text-sm mt-3">César A. Ascanio Méndez</h4>
            <p className="text-xs text-muted-foreground">Representante Ejecutivo · Zona Aragua</p>
            <Badge variant="outline" className="mt-2 text-[10px]">Ciclo Abril 2026</Badge>
            
            <div className="grid grid-cols-3 gap-4 w-full mt-4 pt-4 border-t border-border">
              <div><p className="text-lg font-semibold text-primary">11</p><p className="text-[9px] uppercase text-muted-foreground">Visitas</p></div>
              <div className="border-x border-border"><p className="text-lg font-semibold text-primary">19</p><p className="text-[9px] uppercase text-muted-foreground">Transf.</p></div>
              <div><p className="text-lg font-semibold text-primary">2</p><p className="text-[9px] uppercase text-muted-foreground">Eventos</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 11 — 2 columnas Carrusel + Semáforos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-premium-md overflow-hidden">
          <CardContent className="p-4 h-full flex flex-col justify-center">
            <h4 className="text-sm font-semibold mb-4">Productos Estrella (Impulso)</h4>
            <div className="relative overflow-hidden w-full max-w-[300px] mx-auto">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {prodCarousel.map((p, i) => (
                  <div key={i} className="min-w-full text-center px-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Pill className="h-8 w-8 text-primary" />
                    </div>
                    <Badge variant="secondary" className="mb-2 text-[10px]">{p.code}</Badge>
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.cat}</p>
                    <p className="text-sm font-medium mt-2 text-primary">Stock: {p.stock} u.</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-1 mt-4">
              {prodCarousel.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${currentSlide === i ? 'w-4 bg-primary' : 'w-2 bg-muted'}`} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium-md">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-6">Salud Operacional de la Zona</h4>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              {semaforos.map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="relative w-12 h-12 shrink-0">
                    <svg viewBox="0 0 60 60" className="-rotate-90 w-full h-full">
                      <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="6" />
                      <circle cx="30" cy="30" r="26" fill="none" stroke={s.color} strokeWidth="6"
                        strokeDasharray="163" strokeDashoffset={163 * (1 - s.pct)} className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{color: s.color}}>
                      {Math.round(s.pct * 100)}%
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium">{s.label}</p>
                    <p className="text-[10px]" style={{color: s.color}}>{s.status}</p>
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
