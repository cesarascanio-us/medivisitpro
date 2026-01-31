import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, Download, Calendar, Users,
  FileText, Target, Award, FileDown, PieChart as PieChartIcon,
  AlertCircle, Map as MapIcon, ShieldAlert, DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import VisitHeatmap from "@/components/map/VisitHeatmap";

export default function Reports() {
  const [timeRange, setTimeRange] = useState("month");
  const { user, role: userRole, isManager: isAdminOrManager, isMaster, profile } = useAuth();
  const organizationId = profile?.organization_id;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [heatmapType, setHeatmapType] = useState<"pharmacy" | "natural_store">("pharmacy");

  // State for SQL View Data
  const [gerencialKpis, setGerencialKpis] = useState<{
    total_sales: number;
    visit_effectiveness: number;
    portfolio_coverage: number;
  }>({ total_sales: 0, visit_effectiveness: 0, portfolio_coverage: 0 });

  const [ventasZona, setVentasZona] = useState<any[]>([]);
  const [productMix, setProductMix] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  // Check for admin/manager role
  // const isAdminOrManager = ['master', 'admin', 'manager', 'supervisor'].includes(userRole || '');

  useEffect(() => {
    if (user) {
      loadNextGenData();
    }
  }, [user, timeRange, userRole]);

  useEffect(() => {
    if (user) {
      loadHeatmapData();
    }
  }, [user, heatmapType]);

  const loadNextGenData = async () => {
    if (!isAdminOrManager) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch Gerencial KPIs
      let kpiQuery = supabase.from('view_gerencial_kpis' as any).select('*');
      if (!isMaster && organizationId) kpiQuery = kpiQuery.eq('organization_id', organizationId);
      const { data: kpiData, error: kpiError } = await kpiQuery.maybeSingle();

      if (kpiError) throw kpiError;
      if (kpiData) setGerencialKpis(kpiData as any);

      // 2. Fetch Sales by Zone
      let zonaQuery = supabase.from('view_ventas_por_zona' as any).select('*');
      if (!isMaster && organizationId) zonaQuery = zonaQuery.eq('organization_id', organizationId);
      const { data: zonaData, error: zonaError } = await zonaQuery;

      if (zonaError) throw zonaError;
      setVentasZona(zonaData || []);

      // 3. Fetch Product Mix
      let mixQuery = supabase.from('view_product_mix' as any).select('*');
      if (!isMaster && organizationId) mixQuery = mixQuery.eq('organization_id', organizationId);
      const { data: mixData, error: mixError } = await mixQuery;

      if (mixError) throw mixError;
      setProductMix(mixData || []);

    } catch (error) {
      console.error("Error fetching Next-Gen reports:", error);
      toast({
        title: "Error de Datos",
        description: "No se pudieron cargar las métricas del backend. Verifica que las vistas SQL estén activas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHeatmapData = async () => {
    try {
      let query = supabase
        .from('contacts')
        .select('latitude, longitude, contact_type')
        .eq('contact_type', heatmapType)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (!isMaster && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formatted = (data || []).map(c => ({
        latitude: c.latitude,
        longitude: c.longitude,
        intensity: 0.8
      }));
      setHeatmapData(formatted);
    } catch (error) {
      console.error("Error heatmap:", error);
    }
  };

  if (!isAdminOrManager) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive opacity-50" />
        <h2 className="text-2xl font-bold">Acceso Restringido</h2>
        <p className="text-muted-foreground max-w-md">
          Lo sentimos, esta sección del Dashboard Gerencial está reservada para roles de administración.
          Los representantes pueden ver sus metas individuales en el Dashboard principal.
        </p>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Next-Gen Reporting Suite</h1>
          <p className="text-muted-foreground">Gerencial Dashboard | Business Intelligence en Tiempo Real</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 px-3 py-1">
            <TrendingUp className="mr-1 h-3 w-3" />
            Backend Sync Active
          </Badge>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-background">
              <Calendar className="mr-2 h-4 w-4 opacity-50" />
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Trimestre Actual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* NIVEL 1: Impact KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ventas Totales (Mes)</p>
                <p className="text-3xl font-bold mt-1">
                  ${gerencialKpis.total_sales.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <Badge variant="secondary" className="mr-2">Real-time</Badge>
              Facturación acumulada confirmada
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Efectividad de Visita</p>
                <p className="text-3xl font-bold mt-1 text-success">
                  {gerencialKpis.visit_effectiveness.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl">
                <Target className="h-6 w-6 text-success" />
              </div>
            </div>
            <Progress value={gerencialKpis.visit_effectiveness} className="h-2 mt-4" />
            <p className="text-[10px] mt-2 text-muted-foreground">Ratio: Pedidos generados / Visitas ejecutadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cobertura de Cartera</p>
                <p className="text-3xl font-bold mt-1 text-warning">
                  {gerencialKpis.portfolio_coverage.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl">
                <Users className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span>Contactos Visitados</span>
                <span className="font-bold">Vs Base Total</span>
              </div>
              <Progress value={gerencialKpis.portfolio_coverage} className="h-2 bg-warning/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NIVEL 2: Geospatial War Room */}
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-slate-900 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center text-xl">
                <MapIcon className="mr-2 h-6 w-6 text-primary" />
                The War Room: Geospatial Intelligence
              </CardTitle>
              <CardDescription className="text-slate-400">
                Densidad de presencia y cobertura geográfica
              </CardDescription>
            </div>
            <div className="flex bg-slate-800 p-1 rounded-lg">
              <Button
                variant={heatmapType === 'pharmacy' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs h-8 ${heatmapType === 'pharmacy' ? 'bg-primary' : 'text-slate-400'}`}
                onClick={() => setHeatmapType('pharmacy')}
              >
                Farmacias
              </Button>
              <Button
                variant={heatmapType === 'natural_store' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs h-8 ${heatmapType === 'natural_store' ? 'bg-primary' : 'text-slate-400'}`}
                onClick={() => setHeatmapType('natural_store')}
              >
                Tiendas Nat.
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative h-[450px]">
          <MapContainer
            center={[4.5709, -74.2973]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <VisitHeatmap visits={heatmapData} show={true} radius={35} blur={20} />
          </MapContainer>
          <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 text-white text-[10px] space-y-2">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              <span>Alta Densidad</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <span>Baja Densidad</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NIVEL 3: Product & Zone Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Zone */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Comparativa de Ventas por Zona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasZona} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="zona" type="category" width={80} style={{ fontSize: '12px' }} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="total_ventas" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20}>
                    {ventasZona.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Product Mix */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-secondary" />
              Sales Mix: Unidades por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total_quantity"
                    nameKey="category"
                  >
                    {productMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
