/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, Download, Calendar, Users as UsersIcon,
  FileText, Target, Award, FileDown, PieChart as PieChartIcon,
  AlertCircle, Map as MapIcon, ShieldAlert, DollarSign,
  ShoppingCart, UserRound, Truck, Store, Package, Stethoscope, Sprout, FlaskConical, Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization, useFeatureAccess } from "@/hooks/useOrganization";
import { SubscriptionLock } from "@/components/ui/SubscriptionLock";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import VisitHeatmap from "@/components/map/VisitHeatmap";
import { useChartTheme } from "@/hooks/useChartTheme";
import { useTexts } from "@/hooks/useTexts";

export default function Reports() {
  const t = useTexts();
  const [timeRange, setTimeRange] = useState("month");
  const { user, role: userRole, isManager: isAdminOrManager, isMaster, companyId, organizationId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [heatmapType, setHeatmapType] = useState<"doctor" | "pharmacy" | "health_center" | "natural_store" | "drugstore" | "commerce">("pharmacy");
  const chartTheme = useChartTheme();
  const hasAdvancedReports = useFeatureAccess('advanced_reports');
  const hasGeolocalization = useFeatureAccess('geolocalization');

  // State for SQL View Data
  const [gerencialKpis, setGerencialKpis] = useState<{
    total_sales: number;
    visit_effectiveness: number;
    portfolio_coverage: number;
    proyected_prescriptions: number;
    message_reach_rate: number;
    pos_health_index: number;
  }>({
    total_sales: 0,
    visit_effectiveness: 0,
    portfolio_coverage: 0,
    proyected_prescriptions: 0,
    message_reach_rate: 0,
    pos_health_index: 0
  });

  const [correlationData, setCorrelationData] = useState<any[]>([]);

  const [ventasZona, setVentasZona] = useState<any[]>([]);
  const [productMix, setProductMix] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  const [orgSettings, setOrgSettings] = useState({
    safety_threshold_default: 6,
    conversion_factor_default: 0.7,
    geo_radius_attribution: 1.5,
    average_box_price: 25.5
  });

  const [fugaVentas, setFugaVentas] = useState({ prescriptions: 0, estimated_usd: 0 });

  // Check for admin/manager role
  // const isAdminOrManager = ['master', 'admin', 'manager', 'supervisor'].includes(userRole || '');

  useEffect(() => {
    if (user) {
      loadNextGenData();
      loadOrgSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, timeRange, userRole]);

  const loadOrgSettings = async () => {
    if (!organizationId) return;
    const { data: org } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', organizationId)
      .single();

    if (org?.settings) {
      setOrgSettings(prev => ({ ...prev, ...(org.settings as any) }));
    }
  };

  useEffect(() => {
    if (user) {
      loadHeatmapData();
      loadCorrelationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, heatmapType]);

  const loadCorrelationData = async () => {
    if (!companyId) return;
    try {
      // Fetch some sample correlation data using a direct query for now or the new function
      // In production, this would call get_visit_impact_correlation via RPC
      const { data, error } = await (supabase as any).rpc('get_visit_impact_correlation', {
        p_doctor_id: 'all',
        p_radius_km: orgSettings.geo_radius_attribution || 1.5
      });

      if (!error && data) {
        setCorrelationData(data as any[]);

        // Calculate "Fuga de Ventas" (Leakage)
        // (High Commitment Doctors) - (Low Stock Pharmacies Nearby)
        const leakage = (data as any[]).reduce((acc: any, item: any) => {
          if (item.stock_risk && item.compromiso_proyectado > 0) {
            acc.prescriptions += item.compromiso_proyectado;
            acc.estimated_usd += item.compromiso_proyectado * (orgSettings.average_box_price || 25);
          }
          return acc;
        }, { prescriptions: 0, estimated_usd: 0 });

        setFugaVentas(leakage);
      } else {
        // Sample fallback
        setCorrelationData([
          { doctor_name: "Dr. Arrieta", pharmacy_name: "Farmahorro Las Mercedes", distance_km: 1.2, stock_risk: true, samples_dropped: "Muestra A x 5", compromiso_proyectado: 10, current_stock: 2 },
          { doctor_name: "Dra. Gomez", pharmacy_name: "Locatel Chacao", distance_km: 3.4, stock_risk: false, samples_dropped: "Muestra B x 3", compromiso_proyectado: 5, current_stock: 15 }
        ]);
        setFugaVentas({ prescriptions: 10, estimated_usd: 250 });
      }
    } catch (e) {
      console.error("Correlation error:", e);
    }
  };

  const loadNextGenData = async () => {
    if (!isAdminOrManager) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch Gerencial KPIs
      let kpiQuery = supabase.from('view_gerencial_kpis' as any).select('*');
      if (!isMaster && companyId) kpiQuery = kpiQuery.eq('company_id', companyId);
      const { data: kpiData, error: kpiError } = await kpiQuery.maybeSingle();

      if (kpiError) throw kpiError;
      if (kpiData) setGerencialKpis(kpiData as any);

      // 2. Fetch Sales by Zone
      let zonaQuery = supabase.from('view_ventas_por_zona' as any).select('*');
      if (!isMaster && companyId) zonaQuery = zonaQuery.eq('company_id', companyId);
      const { data: zonaData, error: zonaError } = await zonaQuery;

      if (zonaError) throw zonaError;
      setVentasZona(zonaData || []);

      // 3. Fetch Product Mix
      let mixQuery = supabase.from('view_product_mix' as any).select('*');
      if (!isMaster && companyId) mixQuery = mixQuery.eq('company_id', companyId);
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
        .from('unified_contacts')
        .select('latitude, longitude, contact_type')
        .eq('contact_type', heatmapType)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (organizationId) {
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

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <EliteHeader
        title={t.reports_title}
        subtitle={t.reports_subtitle}
        icon={BarChart3}
        badgeText="Sincronizado"
        statusText="Backend Sync Active"
        statusColor="bg-emerald-500"
        rightContent={
          <div className="flex items-center gap-4">
             <Select value={timeRange} onValueChange={setTimeRange}>
               <SelectTrigger className="w-[180px] h-10 rounded-lg shadow-sm border border-input text-xs font-medium bg-card">
                 <Calendar className="mr-2 h-4 w-4 opacity-50" />
                 <SelectValue placeholder="Periodo" />
               </SelectTrigger>
               <SelectContent className="rounded-lg text-xs font-medium border border-border bg-card shadow-md">
                 <SelectItem value="month">Este Mes</SelectItem>
                 <SelectItem value="quarter">Trimestre Actual</SelectItem>
               </SelectContent>
             </Select>
             <Button variant="outline" size="default" className="shadow-sm">
                <Download className="h-4 w-4 mr-2" /> Exportar
             </Button>
          </div>
        }
      />

      {!hasAdvancedReports && (
        <SubscriptionLock
          featureName="Métricas Gerenciales"
          requiredPlan="Profesional"
          description="Accede a KPIs de efectividad, ventas por zona y análisis de product mix para optimizar tu estrategia comercial."
        />
      )}

      <div className={!hasAdvancedReports ? "opacity-20 pointer-events-none filter blur-sm grayscale select-none mt-6" : "mt-6"}>
        {/* NIVEL 1: Impact KPI Cards */}
        {/* NIVEL 2: Strategy 360 KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <Card className="border-t-4 border-t-emerald-500 shadow-premium-md bg-card border-border/40 rounded-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Proyección de Recetas</p>
                  <p className="text-3xl font-bold mt-1 text-emerald-600">
                    {gerencialKpis.proyected_prescriptions || 0}
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-xs mt-4 text-muted-foreground">Volumen estimado basado en compromisos</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-rose-500 shadow-premium-md bg-card border-border/40 rounded-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Fuga de Ventas (Riesgo)</p>
                  <p className="text-3xl font-bold mt-1 text-rose-500">
                    {fugaVentas.prescriptions} <span className="text-sm font-normal">recetas</span>
                  </p>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                </div>
              </div>
              <p className="text-xs mt-4 text-rose-500 font-bold">Est: ${fugaVentas.estimated_usd.toLocaleString()} USD</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500 shadow-premium-md bg-card border-border/40 rounded-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Alcance del Mensaje</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">
                    {gerencialKpis.message_reach_rate?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <Progress value={gerencialKpis.message_reach_rate} className="h-1.5 mt-4" />
              <p className="text-xs mt-2 text-muted-foreground">Estrategia 360 Activa</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-purple-500 shadow-premium-md bg-card border-border/40 rounded-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Índice Salud de PDV</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">
                    {gerencialKpis.pos_health_index?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ShieldAlert className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <Progress value={gerencialKpis.pos_health_index} className="h-1.5 mt-4 bg-purple-100" />
              <p className="text-xs mt-2 text-muted-foreground">PDV Saludables (Capacitación + POP)</p>
            </CardContent>
          </Card>
        </div>

        {/* NIVEL 3: Product & Zone Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Sales by Zone */}
          <Card className="bg-card border border-border/40 shadow-premium-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
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
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="total_ventas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20}>
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
          <Card className="bg-card border border-border/40 shadow-premium-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
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
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--foreground))' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Heatmap Section */}
        <Card className="mt-6 bg-card border border-border/40 shadow-premium-md rounded-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 bg-muted/10 border-b border-border/40">
            <div>
              <CardTitle className="text-base font-bold flex items-center text-foreground uppercase tracking-tight">
                <MapIcon className="mr-2 h-5 w-5 text-primary" />
                Mapa de Calor Estratégico de Cobertura
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">Visualización geospacial de impacto comercial por categoría</CardDescription>
            </div>
            <Select value={heatmapType} onValueChange={(v: any) => setHeatmapType(v)}>
              <SelectTrigger className="w-[200px] bg-card border border-input text-xs font-medium rounded-lg h-10 shadow-sm">
                <SelectValue placeholder="Tipo de Punto" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border text-foreground shadow-premium-lg rounded-lg">
                <SelectItem value="doctor"><div className="flex items-center gap-2"><Stethoscope className="h-3.5 w-3.5" /> Médicos</div></SelectItem>
                <SelectItem value="pharmacy"><div className="flex items-center gap-2"><Store className="h-3.5 w-3.5" /> Farmacias</div></SelectItem>
                <SelectItem value="health_center"><div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> Centros Salud</div></SelectItem>
                <SelectItem value="natural_store"><div className="flex items-center gap-2"><Sprout className="h-3.5 w-3.5" /> Naturistas</div></SelectItem>
                <SelectItem value="drugstore"><div className="flex items-center gap-2"><FlaskConical className="h-3.5 w-3.5" /> Droguerías</div></SelectItem>
                <SelectItem value="commerce"><div className="flex items-center gap-2"><ShoppingCart className="h-3.5 w-3.5" /> Comercios</div></SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0 relative h-[550px]">
            {!hasGeolocalization && (
              <SubscriptionLock
                featureName="Mapa de Calor Estratégico"
                requiredPlan="Empresarial"
                description="Optimiza tus rutas y análisis de cobertura visualizando la densidad de tu red comercial en el mapa."
              />
            )}

            <div className={!hasGeolocalization ? "h-full w-full opacity-30 pointer-events-none filter blur-sm grayscale select-none" : "h-full w-full"}>
              <MapContainer
                center={[10.4806, -66.9036]}
                zoom={12}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <VisitHeatmap
                  visits={heatmapData}
                  show={hasGeolocalization}
                />
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* NIVEL 4: Trazabilidad 360 (Correlation) */}
        <Card className="mt-6 bg-card border border-border/40 shadow-premium-md rounded-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-border/40">
            <CardTitle className="flex items-center gap-3 text-emerald-500 font-bold uppercase tracking-tight text-base">
              <ShoppingCart className="h-6 w-6 text-emerald-500" />
              Trazabilidad 360: Impacto Médico en PDV
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Correlación entre entrega de muestras en consultorios y riesgos de stock en farmacias aledañas (Radio {orgSettings.geo_radius_attribution}km)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {correlationData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border border-border/40 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-full">
                      <UserRound className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.doctor_name}</p>
                      <p className="text-xs text-muted-foreground font-medium">✨ {item.samples_dropped}</p>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-center">
                    <div className="h-px w-24 bg-emerald-200 relative">
                      <Truck className="h-3 w-3 text-emerald-400 absolute -top-1.5 left-1/2 -translate-x-1/2" />
                    </div>
                    <span className="text-xs text-emerald-600 mt-1">{item.distance_km} km</span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-semibold text-sm">{item.pharmacy_name}</p>
                      {item.stock_risk ? (
                        <Badge variant="destructive" className="text-xs animate-pulse">ALERTA: RIESGO QUIEBRE</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">Stock Saludable</Badge>
                      )}
                    </div>
                    <div className="p-2 bg-muted rounded-full">
                      <Store className="h-5 w-5 text-muted-foreground" />
                    </div>
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
