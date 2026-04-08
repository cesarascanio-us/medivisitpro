/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    Store,
    Plus,
    Search,
    Download,
    Upload,
    Clock,
    Package,
    AlertCircle,
    MapPin,
    Phone,
    Building2,
    Calendar,
    Send,
    ClipboardList,
    Edit,
    PlusCircle,
    Eye,
    Trash2,
    Mail,
    Building,
    FileText,
    History,
    RefreshCw,
    Clipboard
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { exportToCSV } from "@/utils/exportUtils";
import { PharmacyFormDialog } from "@/components/pharma/PharmacyFormDialog";
import { PharmacyInventoryDialog } from "@/components/pharma/PharmacyInventoryDialog";
import { EliteTabsList, EliteTabsTrigger, EliteKPICard, EliteHeader } from "@/components/layout/DesignSystem";

export default function PharmaciesElite() {
    const { user, organizationId } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [drugstores, setDrugstores] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("pharmacies");
    const [adminFilters, setAdminFilters] = useState<any>({});

    // Dialog States
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewPharmacyDialogOpen, setViewPharmacyDialogOpen] = useState(false);
    const [selectedPharmacyView, setSelectedPharmacyView] = useState<any>(null);
    const [editingPharmacyId, setEditingPharmacyId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({
        name: "",
        rif: "",
        address: "",
        city: "",
        state: "",
        phone: "",
        email: "",
        contact_name: "",
        contact_position: "",
        segmentation: "C",
        potential: "Medio",
        status: "Activo"
    });

    useEffect(() => {
        loadAllData();
    }, [adminFilters]);

    const loadAllData = async () => {
        try {
            setLoading(true);
            
            // Build query with filters - Mapeo de ADN Elite
            let query = supabase.from('contacts').select('*').eq('contact_type', 'pharmacy');
            
            // Filtros de Territorio Industrial
            if (adminFilters.region && adminFilters.region !== 'all') query = query.eq('region', adminFilters.region);
            if (adminFilters.state && adminFilters.state !== 'all') query = query.eq('state', adminFilters.state);
            if (adminFilters.zoneId && adminFilters.zoneId !== 'all') query = query.eq('zone_id', adminFilters.zoneId);
            if (adminFilters.userId && adminFilters.userId !== 'all') query = query.eq('user_id', adminFilters.userId);
            
            const { data: pharmaData, error: pharmaError } = await query;
            if (pharmaError) throw pharmaError;
            setPharmacies(pharmaData || []);

            const { data: drugData, error: drugError } = await supabase.from('contacts').select('*').eq('contact_type', 'drugstore');
            if (drugError) throw drugError;
            setDrugstores(drugData || []);

            const { data: transData, error: transError } = await supabase
                .from('transfer_orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (transError) throw transError;
            setTransfers(transData || []);

            const { data: prodData, error: prodError } = await supabase.from('products').select('*');
            if (prodError) throw prodError;
            setProducts(prodData || []);

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalPharmacies: pharmacies.length,
        pendingVisits: 0,
        activeOrders: transfers.filter(t => t.status === 'pending' || t.status === 'sent').length,
        pendingReports: 0
    };

    const filteredPharmacies = pharmacies.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.rif && p.rif.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-10 pb-10 font-display animate-in fade-in duration-700">
            {/* Header Elite Industrial */}
            <EliteHeader 
                title="Canal Farmacéutico"
                subtitle="Gestión de Establecimientos & Órdenes Estratégicas"
                icon={Store}
                badgeText="V6.0 ELITE"
                statusText="Monitor de Transferencias Activo"
                statusColor="bg-primary"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => exportToCSV(pharmacies, 'farmacias')} className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-premium-sm hover:shadow-premium-md transition-all">
                            <Download className="mr-3 h-5 w-5 text-primary" /> Exportar
                        </Button>
                        <Button
                            onClick={() => {
                                setEditingPharmacyId(null);
                                setFormData({
                                    name: "",
                                    rif: "",
                                    address: "",
                                    city: "",
                                    state: "",
                                    phone: "",
                                    email: "",
                                    contact_name: "",
                                    contact_position: "",
                                    segmentation: "C",
                                    potential: "Medio",
                                    status: "Activo"
                                });
                                setDialogOpen(true);
                            }}
                            className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-premium-md font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3"
                        >
                            <Plus className="h-6 w-6" /> Alta Farmacia
                        </Button>
                    </div>
                }
            />

            {/* KPI Section Elite */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <EliteKPICard title="Total Farmacias" value={stats.totalPharmacies} icon={Store} color="primary" />
                <EliteKPICard title="Visitas Pendientes" value={stats.pendingVisits} icon={Clock} color="amber" />
                <EliteKPICard title="Pedidos Activos" value={stats.activeOrders} icon={Package} color="emerald" />
                <EliteKPICard title="Reportes Pendientes" value={stats.pendingReports} icon={AlertCircle} color="rose" />
            </div>

            {/* Admin Data Filter - Control de Territorio */}
            <AdminDataFilter
                onFilterChange={(filters) => setAdminFilters(filters)}
                moduleType="pharmacies"
            />

            {/* Tabs System Elite */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <EliteTabsList className="mb-10">
                    <EliteTabsTrigger 
                        value="pharmacies" 
                        label="Directorio"
                        icon={Store}
                    />
                    <EliteTabsTrigger 
                        value="transfers" 
                        label="Transferencias"
                        icon={Send}
                    />
                </EliteTabsList>

                <TabsContent value="pharmacies" className="animate-in slide-in-from-bottom-5 duration-700">
                    {/* SEARCH AREA PREMIUM */}
                    <div className="mb-10">
                        <Card className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium-sm p-6 flex-1 flex flex-col md:flex-row gap-6 relative overflow-hidden group/search">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover/search:opacity-100 transition-opacity" />
                            <div className="flex-1 relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within/search:text-primary transition-colors" />
                                <Input
                                    placeholder="FILTRAR POR NOMBRE O RIF..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-16 h-16 bg-slate-50 border-none focus-visible:ring-primary/20 font-black rounded-2xl text-slate-900 placeholder:text-slate-200 transition-all text-xs tracking-widest shadow-inner uppercase"
                                />
                            </div>
                        </Card>
                    </div>

                    <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => <div key={i} className="h-80 bg-white rounded-[3rem] animate-pulse border border-slate-100 shadow-premium-sm" />)
                        ) : filteredPharmacies.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-[4rem] border border-dashed border-slate-200">
                                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-soft mb-6">
                                    <Store className="h-10 w-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2 font-display">Sin Activos Registrados</h3>
                                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Inicie el despliegue dando de alta una nueva farmacia</p>
                            </div>
                        ) : (
                            filteredPharmacies.map(pharma => (
                                <Card key={pharma.id} className="bg-white border-slate-100 rounded-[3rem] overflow-hidden hover:border-primary/30 transition-all duration-700 group relative shadow-premium-sm hover:shadow-premium-xl cursor-pointer" onClick={() => { setSelectedPharmacyView(pharma); setViewPharmacyDialogOpen(true); }}>
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 overflow-hidden">
                                        <div className="h-full bg-primary/20 w-1/4 transition-all duration-1000 group-hover:w-full group-hover:bg-primary" />
                                    </div>
                                    <CardHeader className="p-10 pb-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-3 flex-1">
                                                <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter group-hover:text-primary transition-colors leading-none font-display">{pharma.name}</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">RIF: {pharma.rif || 'S/N'}</Badge>
                                                    <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">{pharma.city || 'GLOBAL'}</Badge>
                                                </div>
                                            </div>
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:bg-primary transition-all group-hover:rotate-6">
                                                <Store className="h-6 w-6 text-slate-300 group-hover:text-white" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 pt-4 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center text-[11px] text-slate-400 font-black uppercase tracking-widest group/item">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-4 group-hover/item:bg-primary/10 transition-colors">
                                                    <Phone className="h-4 w-4 text-primary opacity-60" />
                                                </div>
                                                <span className="truncate">{pharma.phone || 'SIN CONTACTO'}</span>
                                            </div>
                                            <div className="flex items-center text-[11px] text-slate-400 font-black uppercase tracking-widest group/item">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-4 group-hover/item:bg-primary/10 transition-colors">
                                                    <Calendar className="h-4 w-4 text-primary opacity-60" />
                                                </div>
                                                <span className={cn(pharma.last_visit ? "text-emerald-600" : "text-slate-300")}>ÚLTIMA VISITA: {pharma.last_visit ? new Date(pharma.last_visit).toLocaleDateString() : 'PENDIENTE'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-6 bg-slate-50/50 flex items-center gap-3 border-t border-slate-50">
                                        <Button onClick={(e) => { e.stopPropagation(); navigate(`/agenda?pharmacyId=${pharma.id}`); }} className="flex-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 shadow-premium-md h-12">
                                            <Calendar className="h-4 w-4 mr-2" /> AGENDAR
                                        </Button>
                                        <PharmacyInventoryDialog
                                            pharmacyId={pharma.id}
                                            pharmacyName={pharma.name}
                                            trigger={
                                                <Button onClick={(e) => e.stopPropagation()} variant="ghost" className="w-12 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-primary transition-all">
                                                    <Package className="h-5 w-5" />
                                                </Button>
                                            }
                                        />
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="transfers" className="animate-in slide-in-from-bottom-5 duration-700">
                    <Card className="bg-white border border-slate-100 rounded-[3rem] shadow-premium-lg p-10">
                         <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter font-display leading-none">Logística de Transferencia</h2>
                                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-2">Historial de movimientos tácticos de inventario</p>
                            </div>
                            <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-premium-md transition-all active:scale-95">
                                <PlusCircle className="mr-3 h-5 w-5" /> Nueva Orden
                            </Button>
                         </div>
                         
                         <div className="rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-soft">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="pl-10 h-20 uppercase font-black text-[10px] tracking-widest text-slate-400 ">ID Orden</TableHead>
                                        <TableHead className="h-20 uppercase font-black text-[10px] tracking-widest text-slate-400 ">Destino Farmacéutico</TableHead>
                                        <TableHead className="h-20 uppercase font-black text-[10px] tracking-widest text-slate-400 ">Droguería</TableHead>
                                        <TableHead className="h-20 uppercase font-black text-[10px] tracking-widest text-slate-400 ">Timestamp</TableHead>
                                        <TableHead className="h-20 uppercase font-black text-[10px] tracking-widest text-slate-400 ">Monto (USD)</TableHead>
                                        <TableHead className="h-20 uppercase font-black text-[10px] tracking-widest text-slate-400 ">Estado</TableHead>
                                        <TableHead className="pr-10 h-20 text-right uppercase font-black text-[10px] tracking-widest text-slate-400 ">Auditoría</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transfers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-60 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] ">Sin órdenes en el registro operativo</TableCell>
                                        </TableRow>
                                    ) : (
                                        transfers.map(order => (
                                            <TableRow key={order.id} className="border-slate-50 hover:bg-primary/5 transition-all group">
                                                <TableCell className="pl-10 font-mono text-primary font-black text-xs uppercase tracking-tighter">#{order.order_number}</TableCell>
                                                <TableCell className="text-slate-900 font-black uppercase text-xs font-display tracking-tight">{order.pharmacy_name}</TableCell>
                                                <TableCell className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{order.drugstore_name || 'CENTRAL'}</TableCell>
                                                <TableCell className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{new Date(order.order_date).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-slate-900 font-black text-base uppercase tracking-tighter">${order.total?.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("text-[8px] font-black uppercase px-4 py-1 rounded-full border tracking-widest", order.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/10" : "bg-primary/5 text-primary border-primary/20 shadow-sm shadow-primary/10")}>
                                                        {order.status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="pr-10 text-right">
                                                    <Button variant="ghost" className="h-10 w-10 bg-white border border-slate-100 text-slate-400 hover:text-primary rounded-xl transition-all shadow-sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                         </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <PharmacyFormDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen} 
                formData={formData}
                setFormData={setFormData}
                onSubmit={async () => {
                    try {
                        const { error } = editingPharmacyId 
                            ? await supabase.from('contacts').update(formData).eq('id', editingPharmacyId)
                            : await supabase.from('contacts').insert([{ ...formData, contact_type: 'pharmacy', organization_id: organizationId }]);
                        
                        if (error) throw error;
                        
                        toast({ title: "Éxito", description: editingPharmacyId ? "Farmacia actualizada" : "Farmacia registrada" });
                        setDialogOpen(false);
                        loadAllData();
                    } catch (error: any) {
                        toast({ title: "Error", description: error.message, variant: "destructive" });
                    }
                }}
                isEditing={!!editingPharmacyId} 
            />
        </div>
    );
}
