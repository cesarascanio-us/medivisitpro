import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTexts } from '@/hooks/useTexts';
import {
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Store, Stethoscope, Hospital, Pill, Target, PackageCheck, Package,
  FileText, Presentation, AlertTriangle, Printer, LayoutDashboard, Search
} from 'lucide-react';
import { EliteHeader, EliteKPICard, EliteCard, EliteButton, EliteInput, EliteTable } from '@/components/layout/DesignSystem';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))'
];

export default function DashboardManager({ organizationId }: { organizationId: string }) {
  const rawTexts = useTexts();
  const t = {
    ...rawTexts,
    create: rawTexts.btn_create,
    export: rawTexts.btn_export,
    import: rawTexts.btn_import,
  };
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
    { label: "Centros de Salud", value: 78, sub: "8 hospitales activos", trend: "88% en registro", bar: 88, icon: Hospital },
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
    { dia: "Lunes", act: "Auditoría Inventario", zona: "Santa Rita", color: "bg-primary/10 text-primary" },
    { dia: "Martes", act: "Fidelización", zona: "Casco Central", color: "bg-chart-2/10 text-chart-2" },
    { dia: "Miércoles", act: "Rotación", zona: "SurOeste", color: "bg-amber-500/10 text-amber-500" },
    { dia: "Jueves", act: "Jornada de Impulso", zona: "Farmatodo Delta", color: "bg-destructive/10 text-destructive" },
    { dia: "Viernes", act: "Entorno 360", zona: "Zona Norte HCM", color: "bg-chart-4/10 text-chart-4" }
  ];

  const feed = [
    { icon: Store, text: "Jornada Impulso PRO-013 — Farmacias", time: "hace 2 días", color: "text-primary bg-primary/10" },
    { icon: Package, text: "Transferencia — Farmacia Malanga (DroNena)", time: "hace 4 días", color: "text-chart-2 bg-chart-2/10" },
    { icon: Store, text: "Visita Inventario zona Norte", time: "hace 5 días", color: "text-primary bg-primary/10" },
    { icon: FileText, text: "Cotización aprobada — Vista Alegre", time: "hace 6 días", color: "text-amber-500 bg-amber-500/10" },
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
    <div className="flex flex-col w-full min-h-screen bg-background space-y-6 p-4 md:p-8 pb-24 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* SECCIÓN 1 — Subheader */}
      <EliteHeader
        title={`${organizationName || 'Empresa'} — Centro de Comando`}
        subtitle={`Representante: ${user?.user_metadata?.full_name || profile?.first_name || 'Gerente'}`}
        icon={LayoutDashboard}
        badgeText="Ciclo Abril 2026"
        statusText="VIGENTE"
        statusColor="bg-primary"
        rightContent={
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground font-semibold">{time.toLocaleTimeString()}</p>
            </div>
            <EliteButton 
              variant="secondary" 
              size="sm" 
              onClick={() => window.print()} 
              className="gap-2 text-xs h-12 px-6 rounded-2xl font-black uppercase tracking-wider shadow-premium-sm"
              icon={Printer}
            >
              {t.export}
            </EliteButton>
          </div>
        }
      />

      {/* SECCIÓN 2 — Barra de filtros */}
      <EliteCard className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={filters.ciclo} onValueChange={v => setFilters({...filters, ciclo: v})}>
              <SelectTrigger className="w-[140px] h-10 text-xs bg-muted/20 border-none font-bold rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border/40">
                {['Sep 2025', 'Oct 2025', 'Nov 2025', 'Dic 2025', 'Abr 2026'].map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-[60vw]">
              {['Todas', 'Norte', 'Centro', 'Sur', 'Este', 'Oeste'].map(z => (
                <Badge key={z} variant={filters.zona === z ? 'default' : 'secondary'}
                  className={`cursor-pointer whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${filters.zona === z ? 'bg-primary/10 text-primary border border-primary hover:bg-primary/20' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}
                  onClick={() => setFilters({...filters, zona: z})}>
                  {z}
                </Badge>
              ))}
              <div className="w-px h-6 bg-border mx-2 self-center" />
              {['Todas', 'Cadena', 'Mini Cadena', 'Independiente'].map(s => (
                <Badge key={s} variant={filters.segmento === s ? 'default' : 'secondary'}
                  className={`cursor-pointer whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${filters.segmento === s ? 'bg-primary/10 text-primary border border-primary hover:bg-primary/20' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}
                  onClick={() => setFilters({...filters, segmento: s})}>
                  {s}
                </Badge>
              ))}
              <div className="w-px h-6 bg-border mx-2 self-center" />
              {['Todos', 'Alto', 'Medio', 'Bajo'].map(p => (
                <Badge key={p} variant={filters.potencial === p ? 'default' : 'secondary'}
                  className={`cursor-pointer whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${filters.potencial === p ? 'bg-primary/10 text-primary border border-primary hover:bg-primary/20' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}
                  onClick={() => setFilters({...filters, potencial: p})}>
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          <div className="w-full md:w-80 shrink-0">
            <EliteInput 
              icon={Search}
              placeholder="Buscar farmacia, médico, producto..." 
              value={filters.busqueda} 
              onChange={e => setFilters({...filters, busqueda: e.target.value})} 
              className="h-10 text-xs bg-muted/20 border-none font-bold rounded-xl text-foreground transition-all shadow-inner pl-12"
            />
          </div>
        </div>
      </EliteCard>

      {/* SECCIÓN 3 — 6 KPI Cards Elite */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k, i) => {
          const colors = ['primary', 'secondary', 'accent', 'indigo', 'emerald', 'amber'] as const;
          const trendNum = parseInt(k.trend) || 0;
          return (
            <EliteKPICard
              key={i}
              title={k.label.toUpperCase()}
              value={<AnimatedNumber value={k.value} />}
              subtitle={k.sub}
              icon={k.icon}
              trend={trendNum}
              color={colors[i % colors.length]}
              delay={i * 100}
            />
          );
        })}
      </div>

      {/* SECCIÓN 4 — Fila 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <EliteCard className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Segmentación Farmacias</h4>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} innerRadius={68} outerRadius={90} dataKey="value" stroke="none">
                    {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-display tracking-tight text-foreground">197</span>
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Farmacias</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl mt-6 shadow-inner">
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed"><span className="text-primary font-bold mr-1">💡</span> 68% de las farmacias son independientes, foco de fidelización actual.</p>
          </div>
        </EliteCard>

        <EliteCard className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Cobertura por Zona</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius={70}>
                  <PolarGrid stroke="var(--border)" opacity={0.4} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }} />
                  <Radar name="Farmacias" dataKey="farmacias" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
                  <Radar name="Médicos" dataKey="medicos" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl mt-6 shadow-inner">
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed"><span className="text-primary font-bold mr-1">💡</span> Zona Centro lidera en ambos segmentos con alta densidad.</p>
          </div>
        </EliteCard>

        <EliteCard className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Médicos por Especialidad</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barEspData} margin={{ left: -20, right: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }} interval={0} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.15 }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
                  <Bar dataKey="value" barSize={28} radius={[6, 6, 0, 0]}>
                    {barEspData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl mt-6 shadow-inner">
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed"><span className="text-primary font-bold mr-1">💡</span> Medicina Interna es el pilar para la línea Gastro y Pediátrica.</p>
          </div>
        </EliteCard>
      </div>

      {/* SECCIÓN 5 — Area Chart */}
      <EliteCard className="p-6">
        <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Visitas Efectivas por Ciclo (Meta 20/día)</h4>
        <div className="h-[240px]">
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
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 600 }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-premium-md)' }} />
              <ReferenceLine y={20} label={{ position: 'top', value: 'Meta (20)', fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }} stroke="hsl(var(--chart-3))" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="farmacias" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorF)" />
              <Area type="monotone" dataKey="medicos" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorM)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </EliteCard>

      {/* SECCIÓN 6 — 3 columnas Gantt + Rings + Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <EliteCard className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Línea de Tiempo de Ciclos</h4>
            <div className="relative h-40 border-l border-b border-border pl-2 pb-2 mt-4">
              {[{n:"Sep 25", i:0, d:15, s:"P"}, {n:"Oct 25", i:18, d:15, s:"P"}, {n:"Nov 25", i:36, d:15, s:"P"}, {n:"Dic 25", i:54, d:15, s:"P"}, {n:"Abr 26", i:72, d:20, s:"V"}].map((c, i) => (
                <div key={i} className="flex items-center text-xs mb-3">
                  <span className="w-12 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{c.n}</span>
                  <div className="relative h-4 flex-1 mx-2 bg-muted/20 rounded-full overflow-hidden">
                    <div className={`absolute top-0 h-full rounded-full transition-all ${c.s === 'V' ? 'bg-primary/40 border border-primary' : 'bg-muted border border-border'}`} style={{ left: `${c.i}%`, width: `${c.d}%` }}></div>
                    {c.s === 'V' && <div className="absolute top-0 bottom-0 w-0.5 bg-warning z-10" style={{ left: `${c.i + c.d * 0.68}%` }}></div>}
                  </div>
                </div>
              ))}
              <div className="absolute bottom-[-16px] left-[72%] text-[9px] font-black uppercase text-amber-500 tracking-wider">Hoy (68%)</div>
            </div>
          </div>
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl mt-6 shadow-inner">
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed"><span className="text-primary font-bold mr-1">💡</span> Ciclo actual finaliza en 9 días hábiles.</p>
          </div>
        </EliteCard>

        <EliteCard className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Cumplimiento del Plan</h4>
            <div className="flex justify-around items-end h-32">
              {anillosSvg.map((r, i) => <SvgRing key={i} pct={r.pct} color={r.color} label={r.label} val={r.value} />)}
            </div>
          </div>
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl mt-6 shadow-inner">
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed"><span className="text-primary font-bold mr-1">💡</span> Desfase en cobertura de farmacias (43%) vs entrega de unidades (87%).</p>
          </div>
        </EliteCard>

        <EliteCard className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Impacto por Territorio</h4>
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
              {zonasMap.map(z => <span key={z.nombre} className="text-[9px] font-black uppercase text-muted-foreground/80 flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: z.color}}></div>{z.nombre}</span>)}
            </div>
          </div>
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl mt-2 shadow-inner">
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed"><span className="text-primary font-bold mr-1">💡</span> Clic en un polígono para filtrar globalmente por zona.</p>
          </div>
        </EliteCard>
      </div>

      {/* SECCIÓN 7 — 2 columnas Scatter + Bar Horizontal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EliteCard className="p-6">
          <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Estatus de Transferencias (Volumen vs Frecuencia)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <XAxis type="number" dataKey="x" name="Días" tick={{ fontSize: 10, fontWeight: 600 }} />
                <YAxis type="number" dataKey="y" name="Vol." tick={{ fontSize: 10, fontWeight: 600 }} />
                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: 'var(--shadow-premium-md)' }} />
                <Scatter name="Procesado" data={scatterData1} fill="hsl(var(--primary))" opacity={0.8} />
                <Scatter name="Pendiente" data={scatterData2} fill="hsl(var(--warning))" opacity={0.8} />
                <Scatter name="Revisión" data={scatterData3} fill="hsl(var(--destructive))" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </EliteCard>

        <EliteCard className="p-6">
          <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Top Farmacias en Sell-Out</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={barFarmacias} margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.15 }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: 'var(--shadow-premium-md)' }} />
                <Bar dataKey="value" barSize={12} radius={[0, 6, 6, 0]}>
                  {barFarmacias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 2 ? 'hsl(var(--primary))' : index < 5 ? 'hsl(var(--chart-2))' : 'var(--muted-foreground)'} opacity={index >= 5 ? 0.4 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </EliteCard>
      </div>

      {/* SECCIÓN 8 — 2 columnas Droguerías + Muestras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EliteCard className="p-6">
          <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Inventario en Droguerías (Unidades)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barDroguerias} margin={{ left: -10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted-foreground)', fontWeight: 600 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }} />
                <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.15 }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: 'var(--shadow-premium-md)' }} />
                <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </EliteCard>

        <EliteCard className="p-6">
          <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Stock de Muestras Médicas (Disponibilidad)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={muestrasData} margin={{ left: -10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted-foreground)', fontWeight: 600 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }} />
                <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.15 }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: 'var(--shadow-premium-md)' }} />
                <Bar dataKey="inicial" fill="hsl(var(--chart-2))" fillOpacity={0.4} radius={[6, 6, 0, 0]} />
                <Bar dataKey="disponible" radius={[6, 6, 0, 0]}>
                  {muestrasData.map((d, i) => (
                    <Cell key={i} fill={d.alerta === 'true' ? 'hsl(var(--destructive))' : d.alerta === 'warn' ? 'hsl(var(--warning))' : 'hsl(var(--chart-2))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </EliteCard>
      </div>

      {/* SECCIÓN 9 — Heatmap + Tabla (1.5fr / 1fr) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <EliteCard className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Densidad de Actividad (Semanas)</h4>
            <div className="flex flex-wrap gap-2 max-w-[600px] mt-2">
              {intensidades.map((val, i) => {
                let bg = 'bg-muted/40';
                if (val > 0) bg = 'bg-primary/20';
                if (val > 2) bg = 'bg-primary/45';
                if (val > 4) bg = 'bg-primary/70';
                if (val > 6) bg = 'bg-primary';
                return <div key={i} className={`w-4.5 h-4.5 sm:w-6 sm:h-6 rounded-lg ${bg} hover:scale-125 transition-transform cursor-pointer border border-border/20 shadow-inner`} title={`Semana ${i+1}: ${val} acciones`} />
              })}
            </div>
          </div>
          <div className="flex gap-3 items-center text-xs font-bold text-muted-foreground mt-6">
            <span className="uppercase tracking-wider">Menos</span>
            <div className="flex gap-1.5">
              <div className="w-4.5 h-4.5 bg-muted/40 border border-border/10 rounded-sm"></div>
              <div className="w-4.5 h-4.5 bg-primary/20 border border-primary/10 rounded-sm"></div>
              <div className="w-4.5 h-4.5 bg-primary/70 border border-primary/20 rounded-sm"></div>
              <div className="w-4.5 h-4.5 bg-primary border border-primary/30 rounded-sm"></div>
            </div>
            <span className="uppercase tracking-wider">Más</span>
          </div>
        </EliteCard>

        <EliteTable
          title="Plan Estratégico Semanal"
          description="Actividades clave planificadas para el territorio"
        >
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/40">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-black">Día</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-black">Actividad Clave</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-black">Territorio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estrategia.map((e, i) => (
                <TableRow key={i} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4 text-xs font-black uppercase text-foreground">{e.dia}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest ${e.color} border-transparent px-3 py-1.5 rounded-xl`}>
                      {e.act}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-xs text-muted-foreground font-bold">{e.zona}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </EliteTable>
      </div>

      {/* SECCIÓN 10 — 3 columnas Alerta + Feed + Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <EliteCard className="border-l-4 border-l-destructive bg-destructive/5 p-6 relative flex flex-col justify-between rounded-elite-xl">
          <div>
            <div className="flex justify-between items-start mb-4">
              <Badge variant="destructive" className="animate-pulse text-[9px] font-black uppercase tracking-widest px-3 py-1">NOVEDAD ACTIVA — Lote 249301</Badge>
              <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
            </div>
            <h4 className="font-black text-sm uppercase tracking-wider font-display text-destructive">PRO-027 Limonada Laxante</h4>
            <p className="text-xs text-muted-foreground mt-3 font-bold">Lugar: Farmacias Mundo Total (Av. Bolívar)</p>
            <p className="text-xs text-muted-foreground font-bold">Regente: Dr. David Romero · 0414-5892156</p>
          </div>
          <EliteButton variant="secondary" className="w-full mt-6 h-12 text-xs font-black uppercase tracking-widest bg-destructive hover:bg-destructive/95 text-destructive-foreground rounded-xl shadow-premium-sm transition-all hover:scale-105 active:scale-95">
            Ver Protocolo →
          </EliteButton>
        </EliteCard>

        <EliteCard className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black mb-4 text-foreground uppercase tracking-widest font-display">Feed Operacional</h4>
            <ScrollArea className="h-[140px] pr-2">
              <div className="space-y-4">
                {feed.map((f, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer hover:bg-muted/50 p-2 rounded-xl transition-all border border-transparent hover:border-border/20">
                    <div className={`p-2 rounded-xl shrink-0 h-min ${f.color} border border-border/10 shadow-inner`}><f.icon className="h-4 w-4" /></div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-foreground">{f.text}</p>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1">{f.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </EliteCard>

        <EliteCard className="p-6">
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="relative">
              <Avatar className="h-20 w-20 border border-border/40 shadow-premium-md">
                <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">CA</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-emerald-500 border-4 border-card rounded-full animate-pulse"></div>
            </div>
            <h4 className="font-black text-base mt-4 uppercase tracking-tighter font-display leading-none">César A. Ascanio Méndez</h4>
            <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-wider text-muted-foreground/80">Representante Ejecutivo · Zona Aragua</p>
            <Badge variant="outline" className="mt-3 text-[9px] font-black uppercase tracking-widest border-border/40 bg-muted/20 px-3 py-1 rounded-full">Ciclo Abril 2026</Badge>
            
            <div className="grid grid-cols-3 gap-4 w-full mt-6 pt-6 border-t border-border/40">
              <div><p className="text-lg font-black text-primary leading-none">11</p><p className="text-[9px] uppercase tracking-wider font-black text-muted-foreground/60 mt-2">Visitas</p></div>
              <div className="border-x border-border/40"><p className="text-lg font-black text-primary leading-none">19</p><p className="text-[9px] uppercase tracking-wider font-black text-muted-foreground/60 mt-2">Transf.</p></div>
              <div><p className="text-lg font-black text-primary leading-none">2</p><p className="text-[9px] uppercase tracking-wider font-black text-muted-foreground/60 mt-2">Eventos</p></div>
            </div>
          </div>
        </EliteCard>
      </div>

      {/* SECCIÓN 11 — 2 columnas Carrusel + Semáforos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EliteCard className="p-6 h-full flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Productos Estrella (Impulso)</h4>
            <div className="relative overflow-hidden w-full max-w-[300px] mx-auto py-2">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {prodCarousel.map((p, i) => (
                  <div key={i} className="min-w-full text-center px-4">
                    <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                      <Pill className="h-7 w-7 text-primary" />
                    </div>
                    <Badge variant="secondary" className="mb-3 text-[9px] font-black uppercase tracking-wider">{p.code}</Badge>
                    <h3 className="text-sm font-black uppercase tracking-wider">{p.name}</h3>
                    <p className="text-xs text-muted-foreground font-bold mt-1">{p.cat}</p>
                    <p className="text-xs font-black mt-3 text-primary uppercase tracking-widest">Stock: {p.stock} u.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-6">
            {prodCarousel.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${currentSlide === i ? 'w-6 bg-primary' : 'w-2 bg-muted'}`} />
            ))}
          </div>
        </EliteCard>

        <EliteCard className="p-6">
          <h4 className="text-sm font-black mb-6 text-foreground uppercase tracking-widest font-display">Salud Operacional de la Zona</h4>
          <div className="grid grid-cols-2 gap-y-8 gap-x-6">
            {semaforos.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 60 60" className="-rotate-90 w-full h-full">
                    <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="6" />
                    <circle cx="30" cy="30" r="26" fill="none" stroke={s.color} strokeWidth="6"
                      strokeDasharray="163" strokeDashoffset={163 * (1 - s.pct)} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{color: s.color}}>
                    {Math.round(s.pct * 100)}%
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-foreground">{s.label}</p>
                  <p className="text-xs font-black uppercase tracking-widest mt-1" style={{color: s.color}}>{s.status}</p>
                </div>
              </div>
            ))}
          </div>
        </EliteCard>
      </div>

    </div>
  );
}
