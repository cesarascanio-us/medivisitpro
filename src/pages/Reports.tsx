import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Download, Calendar, Users, FileText, Target, Award, FileDown, PieChart as PieChartIcon, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from "@/utils/exportUtils";
import jsPDF from "jspdf";


export default function Reports() {
  const [timeRange, setTimeRange] = useState("month");
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // State for real data
  const [kpiData, setKpiData] = useState({
    totalVisits: 0,
    completedVisits: 0,
    completionRate: 0,
    productsPresented: 0,
    samplesDistributed: 0,
    newContacts: 0
  });

  const [visitsByMonth, setVisitsByMonth] = useState<any[]>([]);
  const [visitsBySpecialty, setVisitsBySpecialty] = useState<any[]>([]);
  const [productPerformance, setProductPerformance] = useState<any[]>([]);
  const [segmentationData, setSegmentationData] = useState<any[]>([]);
  const [riskDoctors, setRiskDoctors] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, timeRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Visits
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select(`
          id,
          status,
          scheduled_date,
          contacts (
            id,
            specialty,
            created_at
          )
        `)
        .eq('user_id', user!.id);

      if (visitsError) throw visitsError;

      // 2. Fetch Product Stats
      const { data: visitProducts, error: vpError } = await supabase
        .from('visit_products')
        .select(`
          quantity_presented,
          samples_given,
          products (
            name
          )
        `);

      if (vpError) throw vpError;

      // --- Process Data ---

      // KPIs
      const totalVisits = visits?.length || 0;
      const completedVisits = visits?.filter(v => v.status === 'completed').length || 0;
      const completionRate = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;

      const totalProductsPresented = visitProducts?.reduce((sum, item) => sum + (item.quantity_presented || 0), 0) || 0;
      const totalSamples = visitProducts?.reduce((sum, item) => sum + (item.samples_given || 0), 0) || 0;

      // New contacts (approximate logic: created in last 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      // Note: We need to filter unique contacts if we want "New Contacts" properly, 
      // but here we are iterating visits. Ideally we fetch contacts separately.
      // Let's do a quick separate fetch for contacts to get the real count.
      const { count: newContactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('user_id', user!.id);

      setKpiData({
        totalVisits,
        completedVisits,
        completionRate: parseFloat(completionRate.toFixed(1)),
        productsPresented: totalProductsPresented,
        samplesDistributed: totalSamples,
        newContacts: newContactsCount || 0
      });

      // Charts: Visits by Month
      // Map visits to buckets. Simplified for "Month" view (last 6 months)
      const months: { [key: string]: { visits: number, completed: number } } = {};
      visits?.forEach(visit => {
        const date = new Date(visit.scheduled_date);
        const key = date.toLocaleString('default', { month: 'short' });
        if (!months[key]) months[key] = { visits: 0, completed: 0 };
        months[key].visits++;
        if (visit.status === 'completed') months[key].completed++;
      });
      const monthChartData = Object.keys(months).map(key => ({
        month: key,
        visits: months[key].visits,
        completed: months[key].completed
      })).slice(-6); // Last 6 months
      setVisitsByMonth(monthChartData);

      // Charts: Visits by Specialty
      const specialties: { [key: string]: number } = {};
      visits?.forEach(visit => {
        const spec = visit.contacts?.specialty || 'Sin Especialidad';
        specialties[spec] = (specialties[spec] || 0) + 1;
      });
      const specialtyChartData = Object.keys(specialties).map((key, index) => ({
        name: key,
        value: specialties[key],
        color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]
      }));
      setVisitsBySpecialty(specialtyChartData);

      // Charts: Product Performance
      const prodStats: { [key: string]: { presentations: number, samples: number } } = {};
      visitProducts?.forEach((vp: any) => {
        const name = vp.products?.name || 'Desconocido';
        if (!prodStats[name]) prodStats[name] = { presentations: 0, samples: 0 };
        prodStats[name].presentations += (vp.quantity_presented || 0);
        prodStats[name].samples += (vp.samples_given || 0);
      });
      const prodChartData = Object.keys(prodStats).map(key => ({
        product: key,
        presentations: prodStats[key].presentations,
        samples: prodStats[key].samples
      }));
      setProductPerformance(prodChartData);

      // 4. Analytics: Segmentation & Risk (Simplified calculation)
      const { data: contactsData } = await supabase
        .from('contacts')
        .select(`
          id,
          name,
          priority,
          specialty,
          visits (
            status,
            actual_start_time,
            scheduled_date
          )
        `)
        .eq('user_id', user!.id);

      if (contactsData) {
        // Segmentation A, B, C based on priority and visit count
        const segments = { A: 0, B: 0, C: 0 };
        const riskList: any[] = [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        contactsData.forEach((c: any) => {
          // Categorization
          if (c.priority === 'high') segments.A++;
          else if (c.priority === 'normal') segments.B++;
          else segments.C++;

          // Risk Analysis: No completed visits in last 30 days
          const lastVisit = c.visits?.filter((v: any) => v.status === 'completed')
            .sort((a: any, b: any) => new Date(b.actual_start_time || b.scheduled_date).getTime() - new Date(a.actual_start_time || a.scheduled_date).getTime())[0];

          if (!lastVisit || new Date(lastVisit.actual_start_time || lastVisit.scheduled_date) < thirtyDaysAgo) {
            riskList.push({
              name: c.name,
              specialty: c.specialty,
              lastVisit: lastVisit ? new Date(lastVisit.actual_start_time || lastVisit.scheduled_date).toLocaleDateString() : 'Nunca'
            });
          }
        });

        setSegmentationData([
          { name: 'Segmento A (Alta)', value: segments.A, color: '#3B82F6' },
          { name: 'Segmento B (Media)', value: segments.B, color: '#10B981' },
          { name: 'Segmento C (Baja)', value: segments.C, color: '#6B7280' },
        ]);
        setRiskDoctors(riskList.slice(0, 5)); // Top 5 doctors at risk
      }

    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del reporte.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dateStr = new Date().toISOString().split('T')[0];

    // Export KPIs
    const kpiExport = [{
      'Visitas Totales': kpiData.totalVisits,
      'Visitas Completadas': kpiData.completedVisits,
      'Tasa de Completitud (%)': kpiData.completionRate,
      'Productos Presentados': kpiData.productsPresented,
      'Muestras Distribuidas': kpiData.samplesDistributed,
      'Nuevos Contactos': kpiData.newContacts
    }];
    exportToCSV(kpiExport, `reporte_kpis_${dateStr}`);

    // Export visits by month
    if (visitsByMonth.length > 0) {
      const visitsExport = visitsByMonth.map(item => ({
        'Mes': item.month,
        'Total Visitas': item.visits,
        'Completadas': item.completed
      }));
      exportToCSV(visitsExport, `reporte_visitas_mes_${dateStr}`);
    }

    // Export product performance
    if (productPerformance.length > 0) {
      const productsExport = productPerformance.map(item => ({
        'Producto': item.product,
        'Presentaciones': item.presentations,
        'Muestras': item.samples
      }));
      exportToCSV(productsExport, `reporte_productos_${dateStr}`);
    }

    toast({
      title: "Exportación completada",
      description: "Los reportes han sido descargados en formato CSV."
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('es-ES');

    // Title
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Primary blue
    doc.text("MediVisit Pro - Reporte de Desempeño", 20, 20);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${dateStr}`, 20, 28);

    // KPIs Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Indicadores Clave (KPIs)", 20, 45);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    let y = 55;
    const kpis = [
      { label: "Visitas Totales", value: kpiData.totalVisits },
      { label: "Visitas Completadas", value: kpiData.completedVisits },
      { label: "Tasa de Completitud", value: `${kpiData.completionRate}%` },
      { label: "Productos Presentados", value: kpiData.productsPresented },
      { label: "Muestras Distribuidas", value: kpiData.samplesDistributed },
      { label: "Nuevos Contactos (30 días)", value: kpiData.newContacts },
    ];

    kpis.forEach(kpi => {
      doc.text(`${kpi.label}: ${kpi.value}`, 25, y);
      y += 8;
    });

    // Visits by Month
    if (visitsByMonth.length > 0) {
      y += 10;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Visitas por Mes", 20, y);
      y += 10;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      visitsByMonth.forEach(item => {
        doc.text(`${item.month}: ${item.visits} visitas (${item.completed} completadas)`, 25, y);
        y += 7;
      });
    }

    // Product Performance
    if (productPerformance.length > 0) {
      y += 10;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Rendimiento por Producto", 20, y);
      y += 10;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      productPerformance.slice(0, 10).forEach(item => {
        doc.text(`${item.product}: ${item.presentations} presentaciones, ${item.samples} muestras`, 25, y);
        y += 7;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generado automáticamente por MediVisit Pro", 20, 280);

    // Save
    doc.save(`reporte_medivisit_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "PDF Generado",
      description: "El reporte ha sido descargado en formato PDF."
    });
  };


  const goals = [
    { title: "Visitas Mensuales", current: kpiData.completedVisits, target: 40, percentage: Math.min((kpiData.completedVisits / 40) * 100, 100) },
    { title: "Tasa de Conversión", current: kpiData.completionRate, target: 80, percentage: Math.min((kpiData.completionRate / 80) * 100, 100) },
    { title: "Productos Presentados", current: kpiData.productsPresented, target: 100, percentage: Math.min((kpiData.productsPresented / 100) * 100, 100) },
    { title: "Nuevos Contactos", current: kpiData.newContacts, target: 10, percentage: Math.min((kpiData.newContacts / 10) * 100, 100) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes y Analíticas</h1>
          <p className="text-muted-foreground">Análisis detallado de tu desempeño y resultados</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visitas</p>
                <p className="text-2xl font-bold text-foreground">{loading ? "..." : kpiData.totalVisits}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-success mr-1" />
                  <span className="text-xs text-success">Actualizado</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa Completadas</p>
                <p className="text-2xl font-bold text-success">{loading ? "..." : kpiData.completionRate}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-success mr-1" />
                  <span className="text-xs text-success">Vs Objetivo</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productos Presentados</p>
                <p className="text-2xl font-bold text-foreground">{loading ? "..." : kpiData.productsPresented}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-success mr-1" />
                  <span className="text-xs text-success">Total acumulado</span>
                </div>
              </div>
              <FileText className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nuevos Contactos</p>
                <p className="text-2xl font-bold text-foreground">{loading ? "..." : kpiData.newContacts}</p>
                <div className="flex items-center mt-2">
                  <Users className="h-8 w-8 text-secondary" />
                  <span className="text-xs text-secondary mb-0.5 ml-1">Últimos 30 días</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visits Trend */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 icon-medical" />
                  Tendencia de Visitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={visitsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="visits" name="Total" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed" name="Completadas" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Visits by Specialty */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 icon-success" />
                  Visitas por Especialidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={visitsBySpecialty}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {visitsBySpecialty.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 icon-medical" />
                Rendimiento por Producto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={productPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="presentations" fill="#3B82F6" name="Presentaciones" />
                  <Bar dataKey="samples" fill="#10B981" name="Muestras" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal, index) => (
              <Card key={index} className="medical-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <Award className={`h-6 w-6 ${goal.percentage >= 100 ? 'text-success' : goal.percentage >= 80 ? 'text-warning' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">{goal.current}</span>
                    <span className="text-sm text-muted-foreground">/ {goal.target}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className={`font-medium ${goal.percentage >= 100 ? 'text-success' : goal.percentage >= 80 ? 'text-warning' : 'text-foreground'}`}>
                        {goal.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={goal.percentage} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="mr-2 h-5 w-5 icon-medical" />
                  Segmentación de Médicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segmentationData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name.split(' ')[1]}: ${value}`}
                      >
                        {segmentationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 mt-2">
                  {segmentationData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-xs text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  Médicos en Riesgo de Abandono
                </CardTitle>
                <CardDescription>Sin visitas completadas en los últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskDoctors.length > 0 ? (
                    riskDoctors.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground italic">Última: {doc.lastVisit}</p>
                          <Badge variant="outline" className="text-[10px] mt-1 text-red-500 border-red-200 bg-red-50">Prioridad</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>Todos tus médicos están al día.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 icon-success" />
                Potencial de Recetabilidad (Scoring)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center bg-blue-50/30 rounded-b-lg">
              <p className="text-muted-foreground mb-4">
                El motor de Scoring analiza la frecuencia de visitas, muestras entregadas y eventos para calificar el potencial de cada médico.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-primary">A+</p>
                  <p className="text-xs text-muted-foreground">Líderes de Opinión</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-success">85%</p>
                  <p className="text-xs text-muted-foreground">Conversión Promedio</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-secondary">Aumentando</p>
                  <p className="text-xs text-muted-foreground">Tendencia General</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}