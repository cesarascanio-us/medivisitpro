/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  Clock, 
  Eye,
  Building2,
  TrendingUp,
  FileText,
  Activity, Globe, Package, Filter, LayoutDashboard, ShoppingCart, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { EliteHeader, EliteKPICard, EliteTabsList, EliteTabsTrigger } from "@/components/layout/DesignSystem";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface TransferProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface TransferOrder {
  id: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  pharmacy_name: string;
  drugstore_name: string;
  total: number;
  products: any;
}

export default function TransferOrders() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [orders, setOrders] = useState<TransferOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TransferOrder | null>(null);
  
  const [drugstores, setDrugstores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const orgId = organization?.id;

  const [newOrder, setNewOrder] = useState({
    pharmacy_name: '',
    drugstore_id: '',
    products: [] as TransferProduct[],
    delivery_date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (orgId) {
      fetchOrders();
      fetchInitialData();
    }
  }, [orgId]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from('transfer_orders').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error: any) {
      toast({ title: "Error de Sincronización", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [dData, pData] = await Promise.all([
        supabase.from('drugstores').select('*').eq('organization_id', orgId),
        supabase.from('products').select('*').eq('organization_id', orgId)
      ]);
      if (dData.data) setDrugstores(dData.data);
      if (pData.data) setProducts(pData.data);
    } catch (error) { console.error(error); }
  };

  const handleSubmitOrder = async () => {
    if (!newOrder.drugstore_id || newOrder.products.length === 0) return;
    const total = newOrder.products.reduce((acc, p) => acc + p.total, 0);
    const drugstore = drugstores.find(d => d.id === newOrder.drugstore_id);
    try {
      const { error } = await supabase.from('transfer_orders').insert([{
        user_id: user?.id, organization_id: orgId, total, status: 'pending', pharmacy_name: newOrder.pharmacy_name,
        drugstore_id: newOrder.drugstore_id, drugstore_name: drugstore?.name || 'N/A', products: newOrder.products as any,
        delivery_date: newOrder.delivery_date
      } as any]);
      if (error) throw error;
      toast({ title: "Pedido Transmitido con Éxito" });
      setOrderDialogOpen(false);
      fetchOrders();
    } catch (error: any) { toast({ title: "Error", variant: "destructive" }); }
  };

  const filteredOrders = orders.filter(o => o.pharmacy_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="h-full flex items-center justify-center bg-background"><RefreshCw className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="flex flex-col h-full bg-background space-y-8 py-2">
      <EliteHeader 
        title="Gestión Transfer"
        subtitle="Canal de Suministro Industrial"
        icon={ShoppingCart}
        badgeText="Manual Operativo CA"
        statusText="Core V4"
        rightContent={
          <>
            <Button variant="outline" size="icon" className="hidden md:flex h-12 w-12 rounded-2xl border-dashed border-border text-muted-foreground hover:text-primary"><Filter size={18} /></Button>
            <Button onClick={() => setOrderDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 shadow-xl rounded-[2rem] px-8 font-black text-sm uppercase tracking-widest italic transition-all active:scale-95"><Plus size={20} className="mr-3" /> Transmitir Pedido</Button>
          </>
        }
      />

      {/* KPI STRIP - CAPSULE AIR DESIGN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-2">
        <EliteKPICard title="Volumen Global" value={orders.length} icon={<Activity />} color="indigo" />
        <EliteKPICard title="Pedidos Pendientes" value={orders.filter(o => o.status === 'pending').length} icon={<Clock />} color="rose" />
        <EliteKPICard title="Ingreso Neto" value={`$${orders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}`} icon={<TrendingUp />} color="emerald" />
        <EliteKPICard title="Meta Diaria" value="85%" icon={<Globe />} color="amber" />
      </div>

      <Tabs defaultValue="orders" className="space-y-8 px-2">
        <EliteTabsList>
          <EliteTabsTrigger value="orders" label="Monitor de Ordenes" icon={FileText} />
          <EliteTabsTrigger value="drugstores" label="Droguerías Aliadas" icon={Building2} />
        </EliteTabsList>

        <TabsContent value="orders" className="animate-in slide-in-from-bottom-5 duration-500">
          <Card className="border-none shadow-soft rounded-[3rem] overflow-hidden bg-card">
            <div className="p-8 border-b border-border/20 flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/5">
                <h3 className="font-black text-foreground text-xl uppercase tracking-tighter italic">Auditoría Operacional</h3>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input className="pl-12 h-14 bg-muted/20 border-border/30 rounded-2xl text-sm font-bold placeholder:text-muted-foreground/60" placeholder="Filtrar por Farmacia..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
            <Table>
                <TableHeader className="bg-muted/10">
                    <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="py-8 pl-10 text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Fecha Emisión</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Punto de Venta / Canal</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Monto Neto</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Estado</TableHead>
                        <TableHead className="text-right pr-10 text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Control</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOrders.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="py-20 text-center font-black uppercase italic text-muted-foreground tracking-widest opacity-40">Sin Registros Industriales</TableCell></TableRow>
                    ) : (
                        filteredOrders.map(o => (
                            <TableRow key={o.id} className="hover:bg-muted/5 transition-all group">
                                <TableCell className="pl-10 font-mono text-[11px] text-muted-foreground uppercase">{format(new Date(o.created_at), 'dd MMM yyyy')}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-black text-foreground text-base tracking-tight italic uppercase">{o.pharmacy_name}</span>
                                        <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 uppercase tracking-tighter"><Building2 size={12} /> {o.drugstore_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-black text-foreground text-lg tabular-nums">${o.total.toLocaleString()}</TableCell>
                                <TableCell className="text-center">
                                    <Badge className={cn("px-4 py-1 font-black text-[9px] uppercase tracking-widest rounded-full", o.status === 'pending' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500')}>{o.status}</Badge>
                                </TableCell>
                                <TableCell className="pr-10 text-right">
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all group-hover:scale-110" onClick={() => { setSelectedOrder(o); setViewDialogOpen(true); }}>
                                        <Eye size={20} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
