/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 ======================================================================== */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, DollarSign, Search, Tag, TrendingUp, Clock, FileText } from "lucide-react";

export default function PortalFarmacia() {
  const { profile, user } = useAuth();
  const [search, setSearch] = useState("");

  const farmaciaName = profile?.first_name || user?.email?.split("@")[0] || "Farmacia";

  return (
    <div className="flex flex-col min-h-full space-y-6 pb-8">
      {/* HEADER B2B */}
      <header className="bg-card px-8 md:px-12 py-8 rounded-[2rem] shadow-xl shadow-emerald-500/5 border border-border relative overflow-hidden mx-1">
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Package className="text-white h-8 w-8" />
            </div>
            <div>
              <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Portal B2B
              </p>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                Bienvenido, {farmaciaName}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-emerald-600/10 text-emerald-600 border-none font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider">
                  Cliente Frecuente
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Código: CLI-{profile?.id?.slice(0, 6).toUpperCase() || '10294'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-2xl border border-border/50">
            <div className="bg-card p-2 rounded-xl shadow-sm">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Línea de Crédito</p>
              <p className="text-lg font-black text-foreground leading-tight tabular-nums">$15,000.00</p>
            </div>
          </div>
        </div>
      </header>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-3 rounded-[1.5rem] bg-card hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-500/30 transition-all">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-bold">Nuevo Pedido</span>
        </Button>
        <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-3 rounded-[1.5rem] bg-card hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-500/30 transition-all">
          <Clock className="h-6 w-6" />
          <span className="font-bold">Mis Pedidos</span>
        </Button>
        <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-3 rounded-[1.5rem] bg-card hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-500/30 transition-all">
          <Tag className="h-6 w-6" />
          <span className="font-bold">Ofertas del Mes</span>
        </Button>
        <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-3 rounded-[1.5rem] bg-card hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-500/30 transition-all">
          <FileText className="h-6 w-6" />
          <span className="font-bold">Estado de Cuenta</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* CATÁLOGO RÁPIDO */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden flex flex-col">
          <CardHeader className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  Catálogo Destacado
                </CardTitle>
                <CardDescription className="text-xs font-semibold">Productos más pedidos</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar producto..." 
                  className="pl-9 bg-muted border-none h-9 rounded-xl text-xs font-semibold"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8 flex-1">
            <div className="space-y-3">
              {[
                { id: 1, name: "Ibuprofeno 400mg", lab: "Genéricos", qty: "Caja x 50", price: 12.50, stock: "Alto" },
                { id: 2, name: "Amoxicilina 500mg", lab: "Genéricos", qty: "Caja x 100", price: 24.00, stock: "Medio" },
                { id: 3, name: "Omeprazol 20mg", lab: "Gastro", qty: "Caja x 30", price: 18.75, stock: "Alto" },
                { id: 4, name: "Paracetamol 1g", lab: "Genéricos", qty: "Caja x 20", price: 8.90, stock: "Bajo" }
              ].map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-emerald-500/30 bg-card transition-colors">
                  <div>
                    <p className="font-bold text-sm">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground">{product.lab} • {product.qty}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black tabular-nums">${product.price.toFixed(2)}</span>
                    <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-lg px-3">
                      Agregar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PEDIDOS RECIENTES */}
        <Card className="border-none shadow-xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Últimos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-4">
              {[
                { id: "PED-2026-001", status: "En tránsito", amount: 1250, date: "Hoy" },
                { id: "PED-2026-002", status: "Entregado", amount: 840, date: "Hace 2 días" },
                { id: "PED-2026-003", status: "Entregado", amount: 3200, date: "La semana pasada" }
              ].map(order => (
                <div key={order.id} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-xs">{order.id}</p>
                    <Badge variant="secondary" className={cn(
                      "text-[9px] px-1.5 py-0 h-4 uppercase",
                      order.status === 'En tránsito' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
                    )}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-muted-foreground">{order.date}</span>
                    <span className="font-black text-sm tabular-nums">${order.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 font-bold text-xs h-9 rounded-xl">
              Ver Historial
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
