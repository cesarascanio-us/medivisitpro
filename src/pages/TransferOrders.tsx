/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { InstructionCard } from "@/components/ui/InstructionCard";
import {
    FileText, Plus, Send, Download, Edit, Trash2, Eye, Clock,
    Building, Package, DollarSign, CheckCircle, XCircle, AlertCircle,
    Store, Printer, RefreshCw, Search, Filter, Sparkles, Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { OrderSuggestionWidget } from "@/components/orders/OrderSuggestionWidget";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { StatusStepper } from "@/components/common/StatusStepper";
import { History } from "lucide-react";
import { getStatesInRegion } from "@/constants/regions";

interface AdminFilterState {
    region?: string;
    state?: string;
    zoneId?: string;
    repId?: string;
}

interface Drugstore {
    id: string;
    name: string;
    code: string;
    contact_name: string;
    phone: string;
    email: string;
    contact_id?: string;
}

interface TransferProduct {
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
}

// Snapshot item for historical price protection
interface SnapshotItem {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface TransferOrder {
    id: string;
    order_number: string;
    pharmacy_name: string;
    pharmacy_address: string;
    pharmacy_phone: string;
    drugstore_name: string;
    drugstore_code: string;
    drugstore_id: string;
    products: TransferProduct[];
    items_snapshot?: SnapshotItem[];  // Historical price snapshot
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    order_type: 'transfer' | 'direct_sale';
    order_date: string;
    delivery_date: string | null;
    notes: string;
    created_at: string;
}

interface AuditLog {
    id: string;
    operation: string;
    old_data: any;
    new_data: any;
    changed_at: string;
    changed_by: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    sent: { label: 'Enviado', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Send },
    confirmed: { label: 'Confirmado', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: CheckCircle },
    delivered: { label: 'Entregado', color: 'bg-slate-900 text-white border-transparent', icon: Package },
    cancelled: { label: 'Cancelado', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
};

export default function TransferOrders() {
    const { user, canViewAllData, isSupervisor, isManager, zoneId, hasPermission } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<TransferOrder[]>([]);
    const [drugstores, setDrugstores] = useState<Drugstore[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});

    // Dialog states
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [drugstoreDialogOpen, setDrugstoreDialogOpen] = useState(false);
    const [recommendationDialogOpen, setRecommendationDialogOpen] = useState(false);
    const [recommendationProduct, setRecommendationProduct] = useState("");
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<TransferOrder | null>(null);
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    // New order form
    const [newOrder, setNewOrder] = useState({
        contact_id: '',
        pharmacy_name: '',
        pharmacy_address: '',
        pharmacy_phone: '',
        drugstore_id: '',
        drugstore_code: '',
        order_type: 'transfer' as 'transfer' | 'direct_sale',
        products: [] as TransferProduct[],
        notes: '',
        delivery_date: ''
    });

    // New drugstore form
    const [newDrugstore, setNewDrugstore] = useState({
        name: '',
        code: '',
        contact_name: '',
        phone: '',
        email: ''
    });

    const location = useLocation();

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, adminFilters]);

    // Handle navigation from Visits
    useEffect(() => {
        if (location.state?.initialContact && location.state?.orderType === 'transfer') {
            const initial = location.state.initialContact;
            setNewOrder(prev => ({
                ...prev,
                contact_id: initial.id,
                pharmacy_name: initial.name,
                pharmacy_address: initial.address || ''
            }));
            setOrderDialogOpen(true);
            toast({
                title: "Iniciando Transferencia",
                description: `Creando pedido para ${initial.name}`
            });
        }
    }, [location.state]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Base query helper with adminFilters support
            const applyFilters = (query: any, table: 'transfer_orders' | 'drugstores' | 'contacts' = 'transfer_orders') => {
                // Hierarchical filtering logic
                if (isSupervisor && zoneId) {
                    // Supervisor: Base scope is their zone, but AdminFilter can refine it
                    if (adminFilters.repId && adminFilters.repId !== 'all') {
                        query = query.eq('user_id', adminFilters.repId);
                    } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                        // Only filter by zone_id if the table has it
                        if (table === 'transfer_orders') {
                            query = query.eq('zone_id', adminFilters.zoneId);
                        }
                    } else {
                        // Default to assigned zone - only if table has it
                        if (table === 'transfer_orders') {
                            query = query.eq('zone_id', zoneId);
                        }
                    }
                    return query;
                }

                if (!canViewAllData) {
                    // Representative: Restricted to their own data
                    return query.eq('user_id', user?.id);
                }

                // Master/Manager: Full access narrowed by admin filters
                if (adminFilters.repId && adminFilters.repId !== 'all') {
                    query = query.eq('user_id', adminFilters.repId);
                } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                    // Only filter by zone_id if the table has it
                    if (table === 'transfer_orders') {
                        query = query.eq('zone_id', adminFilters.zoneId);
                    }
                }
                return query;
            };

            // Load transfer orders
            let ordersQuery = supabase
                .from('transfer_orders')
                .select('*', { count: 'exact' });

            ordersQuery = applyFilters(ordersQuery, 'transfer_orders');
            const ordersRes: any = await ordersQuery.order('created_at', { ascending: false });
            setOrders(ordersRes.data || []);

            // Load drugstores
            let drugstoresQuery = supabase
                .from('drugstores')
                .select('*')
                .eq('is_active', true);

            drugstoresQuery = applyFilters(drugstoresQuery, 'drugstores');
            const drugstoresRes: any = await drugstoresQuery;
            setDrugstores(drugstoresRes.data || []);

            // Load pharmacy contacts
            let contactsQuery = supabase.from('contacts' as any).select('*').eq('contact_type', 'pharmacy');
            contactsQuery = applyFilters(contactsQuery);
            const contactsRes: any = await contactsQuery;
            setContacts(contactsRes.data || []);

            // Load products
            const productsRes: any = await supabase
                .from('products' as any)
                .select('*');
            setProducts(productsRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContactSelect = (contactId: string) => {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            setNewOrder(prev => ({
                ...prev,
                contact_id: contactId,
                pharmacy_name: contact.name,
                pharmacy_address: contact.address || '',
                pharmacy_phone: contact.phone || ''
            }));
        }
    };

    const handleDrugstoreSelect = (drugstoreId: string) => {
        const drugstore = drugstores.find(d => d.id === drugstoreId);
        if (drugstore) {
            setNewOrder(prev => ({
                ...prev,
                drugstore_id: drugstoreId,
                drugstore_code: drugstore.code || ''
            }));
        }
    };

    const addProductToOrder = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product && !newOrder.products.find(p => p.id === productId)) {
            setNewOrder(prev => ({
                ...prev,
                products: [...prev.products, {
                    id: product.id,
                    name: product.name,
                    quantity: 1,
                    unit_price: product.price || 0
                }]
            }));
        }
    };

    const updateProductQuantity = (productId: string, quantity: number) => {
        setNewOrder(prev => ({
            ...prev,
            products: prev.products.map(p =>
                p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
            )
        }));
    };

    const removeProduct = (productId: string) => {
        setNewOrder(prev => ({
            ...prev,
            products: prev.products.filter(p => p.id !== productId)
        }));
    };

    const calculateTotals = () => {
        const subtotal = newOrder.products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0);
        const tax = subtotal * 0.16; // 16% IVA
        return { subtotal, tax, total: subtotal + tax };
    };

    const handleNewDrugstoreNameChange = (name: string) => {
        setNewDrugstore(prev => {
            const updated = { ...prev, name };
            // Find template data from existing drugstores with the same name
            const existing = drugstores.find(d => d.name.toLowerCase().trim() === name.toLowerCase().trim());
            if (existing) {
                return {
                    ...updated,
                    contact_name: existing.contact_name || '',
                    phone: existing.phone || '',
                    email: existing.email || ''
                };
            }
            return updated;
        });
    };

    const handleCreateDrugstore = async () => {
        if (!newDrugstore.name.trim()) {
            toast({ title: "Error", description: "El nombre de la droguería es requerido", variant: "destructive" });
            return;
        }
        try {
            const { data, error } = await (supabase.from('drugstores' as any).insert({
                user_id: user?.id,
                contact_id: newOrder.contact_id || null, // Auto-associate if a pharmacy is selected
                ...newDrugstore
            }).select().single()) as any;

            if (error) throw error;
            toast({ title: "Droguería creada", description: `${newDrugstore.name} ha sido registrada y afiliada.` });
            setDrugstores(prev => [...prev, data as any]);

            // If we are creating it from a new order, auto-select it
            setNewOrder(prev => ({
                ...prev,
                drugstore_id: data.id,
                drugstore_code: data.code || ''
            }));

            setNewDrugstore({ name: '', code: '', contact_name: '', phone: '', email: '' });
            setDrugstoreDialogOpen(false);
        } catch (error) {
            console.error("Error creating drugstore:", error);
            toast({ title: "Error", description: "No se pudo crear la droguería", variant: "destructive" });
        }
    };

    const handleCreateOrder = async () => {
        if (!newOrder.pharmacy_name || newOrder.products.length === 0) {
            toast({ title: "Error", description: "Completa los campos requeridos y añade al menos un producto", variant: "destructive" });
            return;
        }

        const totals = calculateTotals();
        const drugstore = drugstores.find(d => d.id === newOrder.drugstore_id);

        // Create items_snapshot with frozen prices for historical integrity
        const itemsSnapshot = newOrder.products.map(p => ({
            product_id: p.id,
            product_name: p.name,
            quantity: p.quantity,
            unit_price: p.unit_price,  // Precio congelado al momento del pedido
            subtotal: p.quantity * p.unit_price
        }));

        try {
            const { error } = await (supabase.from('transfer_orders' as any).insert({
                user_id: user?.id,
                contact_id: newOrder.contact_id || null,
                pharmacy_name: newOrder.pharmacy_name,
                pharmacy_address: newOrder.pharmacy_address,
                pharmacy_phone: newOrder.pharmacy_phone,
                drugstore_id: newOrder.order_type === 'transfer' ? (newOrder.drugstore_id || null) : null,
                drugstore_name: newOrder.order_type === 'transfer' ? (drugstore?.name || '') : 'Venta Directa',
                drugstore_code: newOrder.order_type === 'transfer' ? newOrder.drugstore_code : 'DIRECT',
                order_type: newOrder.order_type,
                products: newOrder.products,
                items_snapshot: itemsSnapshot,  // Snapshot de precios protegidos
                subtotal: totals.subtotal,
                tax: totals.tax,
                total: totals.total,
                notes: newOrder.notes,
                delivery_date: newOrder.delivery_date || null,
                status: 'pending'
            })) as any;

            if (error) throw error;
            toast({ title: "Pedido creado", description: "El pedido ha sido registrado correctamente." });
            setNewOrder({ contact_id: '', pharmacy_name: '', pharmacy_address: '', pharmacy_phone: '', drugstore_id: '', drugstore_code: '', order_type: 'transfer', products: [], notes: '', delivery_date: '' });
            setOrderDialogOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo crear el pedido", variant: "destructive" });
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await (supabase
                .from('transfer_orders' as any)
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', orderId)) as any;

            if (error) throw error;
            toast({ title: "Estado actualizado" });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" });
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        try {
            const { error } = await (supabase.from('transfer_orders' as any).delete().eq('id', orderId)) as any;
            if (error) throw error;
            toast({ title: "Pedido eliminado" });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar el pedido", variant: "destructive" });
        }
    };

    const handleViewHistory = async (orderId: string) => {
        try {
            // Fetch logs from audit_logs table
            const { data, error } = await (supabase
                .from('audit_logs' as any)
                .select('*')
                .eq('record_id', orderId)
                .order('changed_at', { ascending: false })) as any;

            if (error) throw error;
            setAuditLogs(data || []);
            setHistoryDialogOpen(true);
        } catch (error) {
            console.error("Error fetching history:", error);
            toast({ title: "Error", description: "No se pudo cargar el historial", variant: "destructive" });
        }
    };

    const generatePDF = (order: TransferOrder) => {
        // Create a printable HTML document
        const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pedido ${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #1a5f7a; margin-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .info-box h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; }
          .info-box p { margin: 5px 0; font-size: 13px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #1a5f7a; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .totals { text-align: right; margin-top: 20px; }
          .totals p { margin: 5px 0; }
          .total-final { font-size: 18px; font-weight: bold; color: #1a5f7a; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; }
          .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; }
          .notes { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PEDIDO DE TRANSFERENCIA</h1>
          <p><strong>Nº ${order.order_number}</strong></p>
          <p>Fecha: ${new Date(order.order_date).toLocaleDateString('es-ES')}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <h3>📍 FARMACIA</h3>
            <p><strong>${order.pharmacy_name}</strong></p>
            <p>${order.pharmacy_address || 'Sin dirección'}</p>
            <p>Tel: ${order.pharmacy_phone || 'N/A'}</p>
          </div>
          <div class="info-box">
            <h3>🏢 DROGUERÍA</h3>
            <p><strong>${order.drugstore_name || 'No especificada'}</strong></p>
            <p>Código: ${order.drugstore_code || 'N/A'}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items_snapshot || order.products).map((p: any) => `
              <tr>
                <td>${p.product_name || p.name}</td>
                <td>${p.quantity}</td>
                <td>$${p.unit_price.toFixed(2)}</td>
                <td>$${(p.subtotal || p.quantity * p.unit_price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
          <p>IVA (16%): $${order.tax.toFixed(2)}</p>
          <p class="total-final">TOTAL: $${order.total.toFixed(2)}</p>
        </div>
        
        ${order.notes ? `<div class="notes"><strong>Notas:</strong> ${order.notes}</div>` : ''}
        
        <div class="footer">
          <p>Documento generado por MedVisit Pro - ${new Date().toLocaleString('es-ES')}</p>
        </div>
      </body>
      </html>
    `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 500);
        }

        toast({ title: "Documento generado", description: "Se ha abierto la ventana de impresión. Puedes guardar como PDF." });
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.pharmacy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.drugstore_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: loading ? '...' : orders.length,
        pending: loading ? '...' : orders.filter(o => o.status === 'pending').length,
        sent: loading ? '...' : orders.filter(o => o.status === 'sent').length,
        confirmed: loading ? '...' : orders.filter(o => o.status === 'confirmed').length,
    };

    const totals = calculateTotals();

    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Pedidos / Transferencias
                    </h1>
                    <p className="text-muted-foreground">Gestiona pedidos de transferencia a droguerías</p>
                </div>
            </div>

            {/* Admin Filters */}
            <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />

            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} title="Ver Ayuda">
                    <span className="sr-only">Ayuda</span>
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                </Button>


                <Dialog open={drugstoreDialogOpen} onOpenChange={setDrugstoreDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                            <Building className="h-4 w-4 mr-2" />
                            Nueva Droguería
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Nueva Droguería</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre de la Droguería *</Label>
                                    <Input
                                        value={newDrugstore.name}
                                        onChange={e => handleNewDrugstoreNameChange(e.target.value)}
                                        placeholder="Ej: Droguería ABC"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Código Asignado</Label>
                                    <Input
                                        value={newDrugstore.code}
                                        onChange={e => setNewDrugstore({ ...newDrugstore, code: e.target.value })}
                                        placeholder="Ej: DRG-001"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Persona de Contacto</Label>
                                <Input
                                    value={newDrugstore.contact_name}
                                    onChange={e => setNewDrugstore({ ...newDrugstore, contact_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Teléfono</Label>
                                    <Input
                                        value={newDrugstore.phone}
                                        onChange={e => setNewDrugstore({ ...newDrugstore, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={newDrugstore.email}
                                        onChange={e => setNewDrugstore({ ...newDrugstore, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button className="w-full btn-medical" onClick={handleCreateDrugstore}>
                                <Plus className="h-4 w-4 mr-2" />
                                Guardar Droguería
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-medical">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Pedido
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Crear Pedido de Transferencia</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label>Tipo de Pedido</Label>
                                <Select
                                    value={newOrder.order_type}
                                    onValueChange={(v: any) => setNewOrder(prev => ({ ...prev, order_type: v }))}
                                >
                                    <SelectTrigger className="w-full bg-blue-50/50 border-blue-100">
                                        <SelectValue placeholder="Seleccionar tipo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="transfer">Transferencia (vía Droguería)</SelectItem>
                                        <SelectItem value="direct_sale">Venta Directa (Despacho Central)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Separator />

                            {/* Pharmacy Selection */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Store className="h-4 w-4" />
                                    Datos de la Farmacia
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Seleccionar Farmacia Existente</Label>
                                        <Select onValueChange={handleContactSelect}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contacts.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nombre de Farmacia *</Label>
                                        <Input
                                            value={newOrder.pharmacy_name}
                                            onChange={e => setNewOrder({ ...newOrder, pharmacy_name: e.target.value })}
                                            placeholder="Farmacia XYZ"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Dirección</Label>
                                        <Input
                                            value={newOrder.pharmacy_address}
                                            onChange={e => setNewOrder({ ...newOrder, pharmacy_address: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Teléfono</Label>
                                        <Input
                                            value={newOrder.pharmacy_phone}
                                            onChange={e => setNewOrder({ ...newOrder, pharmacy_phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {newOrder.order_type === 'transfer' && (
                                <>
                                    <div className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Droguería
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Seleccionar Droguería</Label>
                                                <Select onValueChange={handleDrugstoreSelect}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(() => {
                                                            const affiliated = drugstores.filter(d => d.contact_id === newOrder.contact_id);
                                                            const others = drugstores.filter(d => d.contact_id !== newOrder.contact_id);

                                                            return (
                                                                <>
                                                                    {affiliated.length > 0 && (
                                                                        <>
                                                                            <div className="px-2 py-1 text-xs font-bold text-primary bg-primary/5">Afiliadas a esta farmacia</div>
                                                                            {affiliated.map(d => (
                                                                                <SelectItem key={d.id} value={d.id}>{d.name} {d.code && `(${d.code})`}</SelectItem>
                                                                            ))}
                                                                            <Separator className="my-1" />
                                                                            <div className="px-2 py-1 text-xs font-bold text-muted-foreground">Otras droguerías</div>
                                                                        </>
                                                                    )}
                                                                    {others.map(d => (
                                                                        <SelectItem key={d.id} value={d.id}>{d.name} {d.contact_id ? `(Otra farmacia)` : '(Template)'}</SelectItem>
                                                                    ))}
                                                                </>
                                                            );
                                                        })()}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Código de la Farmacia en Droguería</Label>
                                                <Input
                                                    value={newOrder.drugstore_code}
                                                    onChange={e => setNewOrder({ ...newOrder, drugstore_code: e.target.value })}
                                                    placeholder="Código asignado por la droguería"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                </>
                            )}

                            {/* Products */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Productos
                                </h3>
                                <div className="flex gap-2">
                                    <Select onValueChange={addProductToOrder}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Añadir producto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.filter(p => !newOrder.products.find(op => op.id === p.id)).map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name} - ${p.price || 0}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {newOrder.products.length > 0 && (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="w-24">Cantidad</TableHead>
                                                <TableHead className="w-28">P. Unitario</TableHead>
                                                <TableHead className="w-28">Total</TableHead>
                                                <TableHead className="w-16"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {newOrder.products.map(p => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{p.name}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={p.quantity}
                                                            onChange={e => updateProductQuantity(p.id, parseInt(e.target.value))}
                                                            className="w-20"
                                                        />
                                                    </TableCell>
                                                    <TableCell>${p.unit_price.toFixed(2)}</TableCell>
                                                    <TableCell>${(p.quantity * p.unit_price).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Button size="sm" variant="ghost" onClick={() => removeProduct(p.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                                {newOrder.products.length > 0 && (
                                    <div className="text-right space-y-1">
                                        <p className="text-sm text-muted-foreground">Subtotal: ${totals.subtotal.toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground">IVA (16%): ${totals.tax.toFixed(2)}</p>
                                        <p className="text-lg font-bold">Total: ${totals.total.toFixed(2)}</p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Notes and Delivery */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha de Entrega Estimada</Label>
                                    <Input
                                        type="date"
                                        value={newOrder.delivery_date}
                                        onChange={e => setNewOrder({ ...newOrder, delivery_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Notas / Observaciones</Label>
                                <Textarea
                                    value={newOrder.notes}
                                    onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })}
                                    placeholder="Instrucciones especiales, comentarios..."
                                    rows={2}
                                />
                            </div>

                            <Button className="w-full" onClick={handleCreateOrder}>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Pedido
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>


                <Dialog open={recommendationDialogOpen} onOpenChange={setRecommendationDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-indigo-600" />
                                Asistente de Compra Inteligente
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Selecciona un producto clave para ver qué droguería ofrece el mejor precio y disponibilidad.
                            </p>
                            <div className="space-y-2">
                                <Label>Producto de Referencia</Label>
                                <Select value={recommendationProduct} onValueChange={setRecommendationProduct}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Buscar producto..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {recommendationProduct && (
                                <OrderSuggestionWidget
                                    productId={recommendationProduct}
                                    onSelectDrogueria={(drogueriaId, price) => {
                                        handleDrugstoreSelect(drogueriaId);
                                        toast({
                                            title: "Droguería Seleccionada",
                                            description: "Se ha establecido la droguería con la mejor oferta seleccionada."
                                        });
                                        setRecommendationDialogOpen(false);
                                    }}
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {
                showHelp && (
                    <InstructionCard
                        title="Gestión de Pedidos"
                        description="Centraliza tus pedidos-transfer a droguerías."
                        items={[
                            "Crea nuevos pedidos seleccionando farmacia y droguería.",
                            "Gestiona el estado de tus órdenes desde 'Pendiente' hasta 'Entregado'.",
                            "Imprime comprobantes para tus registros físicos."
                        ]}
                    />
                )
            }

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Pedidos</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-primary opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Pendientes</p>
                                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-warning opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Enviados</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                            </div>
                            <Send className="h-8 w-8 text-blue-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Confirmados</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-emerald-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="medical-card">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por farmacia, número de pedido..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="pending">Pendientes</SelectItem>
                                <SelectItem value="sent">Enviados</SelectItem>
                                <SelectItem value="confirmed">Confirmados</SelectItem>
                                <SelectItem value="delivered">Entregados</SelectItem>
                                <SelectItem value="cancelled">Cancelados</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={loadData} className="border-primary/20">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card className="medical-card overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nº Pedido</TableHead>
                                <TableHead>Farmacia</TableHead>
                                <TableHead>Droguería</TableHead>
                                <TableHead>Productos</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No hay pedidos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map(order => {
                                    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono font-medium">
                                                {order.order_number}
                                                <div className="mt-1">
                                                    <Badge variant="outline" className={order.order_type === 'direct_sale' ? 'text-[9px] bg-blue-50 text-blue-700 border-blue-200 uppercase' : 'text-[9px] bg-purple-50 text-purple-700 border-purple-200 uppercase'}>
                                                        {order.order_type === 'direct_sale' ? 'Venta Directa' : 'Transferencia'}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>{order.pharmacy_name}</TableCell>
                                            <TableCell>
                                                {order.order_type === 'direct_sale' ? (
                                                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">DESPACHO CENTRAL</Badge>
                                                ) : (
                                                    <>
                                                        {order.drugstore_name || '-'}
                                                        {order.drugstore_code && <span className="text-xs text-muted-foreground ml-1">({order.drugstore_code})</span>}
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell>{order.products?.length || 0} items</TableCell>
                                            <TableCell className="font-semibold">${order.total?.toFixed(2)}</TableCell>
                                            <TableCell>
                                                {hasPermission('orders.approve') ? (
                                                    <Select value={order.status} onValueChange={(v) => handleUpdateStatus(order.id, v)}>
                                                        <SelectTrigger className="w-32 h-8">
                                                            <Badge className={status.color}>{status.label}</Badge>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pendiente</SelectItem>
                                                            <SelectItem value="sent">Enviado</SelectItem>
                                                            <SelectItem value="confirmed">Confirmado</SelectItem>
                                                            <SelectItem value="delivered">Entregado</SelectItem>
                                                            <SelectItem value="cancelled">Cancelado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Badge className={status.color}>{status.label}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{new Date(order.order_date).toLocaleDateString('es-ES')}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="sm" variant="ghost" onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => generatePDF(order)}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="ghost" className="text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Eliminar pedido?</AlertDialogTitle>
                                                                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>Eliminar</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Order Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalle del Pedido {selectedOrder?.order_number}</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4 py-4">
                            {/* Stepper Status */}
                            <StatusStepper status={selectedOrder.status} />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Farmacia</p>
                                    <p className="font-medium">{selectedOrder.pharmacy_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.pharmacy_address}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Droguería</p>
                                    <p className="font-medium">{selectedOrder.drugstore_name || 'No especificada'}</p>
                                    <p className="text-sm text-muted-foreground">Código: {selectedOrder.drugstore_code || 'N/A'}</p>
                                </div>
                            </div>
                            <Separator />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Cant.</TableHead>
                                        <TableHead>P. Unit.</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedOrder.products?.map((p, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.quantity}</TableCell>
                                            <TableCell>${p.unit_price.toFixed(2)}</TableCell>
                                            <TableCell>${(p.quantity * p.unit_price).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="text-right">
                                <p className="text-lg font-bold">Total: ${selectedOrder.total?.toFixed(2)}</p>
                            </div>
                            {selectedOrder.notes && (
                                <div className="bg-muted p-3 rounded-lg">
                                    <p className="text-sm"><strong>Notas:</strong> {selectedOrder.notes}</p>
                                </div>
                            )}
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                                <Button variant="ghost" size="sm" onClick={() => handleViewHistory(selectedOrder.id)}>
                                    <History className="h-4 w-4 mr-2" />
                                    Ver Historial de Cambios
                                </Button>
                                <Button variant="outline" onClick={() => generatePDF(selectedOrder)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Generar PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Historial de Cambios</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {auditLogs.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No hay registros de cambios para este pedido.</p>
                        ) : (
                            <div className="space-y-4">
                                {auditLogs.map((log) => (
                                    <Card key={log.id} className="border-l-4 border-l-primary">
                                        <CardContent className="pt-4 text-sm">
                                            <div className="flex justify-between mb-2">
                                                <Badge variant="outline" className="font-mono">{log.operation}</Badge>
                                                <span className="text-xs text-muted-foreground">{new Date(log.changed_at).toLocaleString()}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="bg-red-50 p-2 rounded">
                                                    <p className="font-bold text-red-700 mb-1">Antes:</p>
                                                    <pre className="whitespace-pre-wrap overflow-x-auto">{JSON.stringify(log.old_data, null, 2)}</pre>
                                                </div>
                                                <div className="bg-green-50 p-2 rounded">
                                                    <p className="font-bold text-green-700 mb-1">Después:</p>
                                                    <pre className="whitespace-pre-wrap overflow-x-auto">{JSON.stringify(log.new_data, null, 2)}</pre>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
