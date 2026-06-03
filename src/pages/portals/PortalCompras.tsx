/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 ======================================================================== */

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building, FileSignature, Landmark, TrendingUp, ChevronRight, Phone } from "lucide-react";

export default function PortalCompras() {
  const { profile, user } = useAuth();
  const institutionName = profile?.first_name || user?.email?.split("@")[0] || "Institución";

  return (
    <div className="flex flex-col min-h-full space-y-6 pb-8">
      {/* HEADER INSTITUCIONAL */}
      <header className="bg-card px-8 md:px-12 py-8 rounded-[2rem] shadow-xl shadow-amber-700/5 border border-border relative overflow-hidden mx-1">
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-amber-700/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-700 to-amber-900 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-amber-900/20">
              <Landmark className="text-white h-8 w-8" />
            </div>
            <div>
              <p className="text-amber-700 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Portal Institucional
              </p>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                {institutionName}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-amber-700/10 text-amber-700 border-none font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider">
                  Cuenta Corporativa
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <Button className="bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl h-10 px-6 shadow-md">
              <FileSignature className="h-4 w-4 mr-2" />
              Nueva Cotización
            </Button>
          </div>
        </div>
      </header>

      {/* KPIS INSTITUCIONALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[1.5rem] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">Licitaciones Activas</p>
                <p className="text-3xl font-black tabular-nums tracking-tight text-foreground">3</p>
                <p className="text-[10px] font-bold text-amber-600">Revisión pendiente</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-700">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[1.5rem] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">Volumen de Compra (YTD)</p>
                <p className="text-3xl font-black tabular-nums tracking-tight text-foreground">$142.5k</p>
                <p className="text-[10px] font-bold text-emerald-600">+12% vs año anterior</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-700">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[1.5rem] overflow-hidden">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground mb-2">Key Account Manager</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-sm">Carlos Mendoza</p>
                  <p className="text-xs text-muted-foreground">Ventas Institucionales</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4 font-bold text-xs h-8">
              <Phone className="h-3 w-3 mr-2" /> Contactar
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* COTIZACIONES */}
        <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-amber-700" />
              Estado de Cotizaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-4">
              {[
                { id: "COT-2026-089", status: "Aprobada", date: "01 Jun", items: 12, amount: 45000 },
                { id: "COT-2026-092", status: "En Revisión", date: "28 May", items: 45, amount: 120000 },
                { id: "COT-2026-095", status: "Borrador", date: "Ayer", items: 5, amount: 8500 }
              ].map(cot => (
                <div key={cot.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/50 transition-colors group">
                  <div>
                    <p className="font-bold text-sm">{cot.id}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={cn(
                        "text-[9px] px-1.5 py-0 h-4 uppercase",
                        cot.status === 'Aprobada' ? 'bg-emerald-500/10 text-emerald-600' :
                        cot.status === 'En Revisión' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-slate-500/10 text-slate-600'
                      )}>
                        {cot.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">• {cot.items} items</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-black text-sm tabular-nums">${cot.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{cot.date}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-amber-700 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LISTA DE PRECIOS */}
        <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-amber-700" />
              Lista de Precios Institucional
            </CardTitle>
            <CardDescription className="text-xs font-semibold">Condiciones comerciales vigentes</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-3 px-4 font-black text-xs text-muted-foreground uppercase">Línea</th>
                    <th className="text-right py-3 px-4 font-black text-xs text-muted-foreground uppercase">Descuento Base</th>
                    <th className="text-right py-3 px-4 font-black text-xs text-muted-foreground uppercase">Volumen {'>'} 10k</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-4 font-bold">Cardiología</td>
                    <td className="text-right py-3 px-4 font-semibold text-emerald-600 tabular-nums">25%</td>
                    <td className="text-right py-3 px-4 font-semibold text-emerald-600 tabular-nums">+5%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Gastroenterología</td>
                    <td className="text-right py-3 px-4 font-semibold text-emerald-600 tabular-nums">30%</td>
                    <td className="text-right py-3 px-4 font-semibold text-emerald-600 tabular-nums">+8%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Antibióticos</td>
                    <td className="text-right py-3 px-4 font-semibold text-emerald-600 tabular-nums">40%</td>
                    <td className="text-right py-3 px-4 font-semibold text-emerald-600 tabular-nums">+10%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Button variant="outline" className="w-full mt-4 font-bold text-xs h-9 rounded-xl">
              Descargar Tarifario PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
