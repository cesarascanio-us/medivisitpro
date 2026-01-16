import { useState, useEffect, useRef } from "react";
import { InstructionCard } from "@/components/ui/InstructionCard";
import {
    Plus, Building2, Phone, Mail, MapPin, Search, Store, Send, Package,
    Clock, CheckCircle, XCircle, Eye, Download, Trash2, History, FileText,
    RefreshCw, Edit, Building, AlertCircle, Calendar, Upload, Printer, HelpCircle, FileSpreadsheet, ClipboardList, Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import * as XLSX from 'xlsx';
import { PharmacyFormDialog } from "@/components/pharma/PharmacyFormDialog";
import { PharmacyInventoryDialog } from "@/components/pharma/PharmacyInventoryDialog";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { getStatesInRegion } from "@/constants/regions";
import { useDemoData } from "@/contexts/MockDataProvider";

interface AdminFilterState {
    region?: string;
    state?: string;
    zoneId?: string;
    repId?: string;
}

// Interfaces
interface Pharmacy {
    id: string;
    user_id: string;
    zone_id: string | null;
    representative_id: string | null;

    // Información básica
    name: string;
    rif: string | null;
    address: string | null;
    city: string | null;
    sector: string | null;
    state: string | null;

    // Contacto
    phone: string | null;
    contact_phone: string | null;
    contact_name: string | null;
    email: string | null;
    main_contact: string | null;
    contact_position: string | null;

    // Horarios
    schedule: string | null;
    business_hours: string | null;

    // Productos y clasificación
    promoted_products: string[] | null;
    product_interest: string | null;
    segmentation: string | null;
    potential: 'Alto' | 'Medio' | 'Bajo' | null;

    // Seguimiento
    follow_up_action: string | null;
    last_visit: string | null;
    status: 'Activo' | 'Inactivo';

    // Redes sociales
    instagram: string | null;

    // Campos adicionales
    notes: string | null;
    priority: string | null;

    // Metadata
    created_at: string;
    updated_at: string;
}

interface Drugstore {
    id: string;
    name: string;
    code: string;
    contact_name: string;
    phone: string;
    email: string;
}

interface TransferProduct {
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
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
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    order_type?: 'transfer' | 'direct_sale';
    order_date: string;
    delivery_date: string | null;
    notes: string;
    document_generated: boolean;
    document_url: string | null;
    created_at: string;
}

interface TransferHistory {
    id: string;
    transfer_order_id: string;
    action: string;
    changes_description: string;
    created_at: string;
}

interface Visit {
    id: string;
    contact_id: string;
    status: string;
    scheduled_date: string;
}

interface PharmacyStock {
    id: string;
    pharmacy_id: string;
    product_id: string;
    quantity: number;
}

interface PharmacyReport {
    id: string;
    pharmacy_id: string;
    title: string;
    status: string;
}

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
    sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Send },
    confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
    delivered: { label: 'Entregado', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Package },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    created: { label: 'Creado', color: 'bg-blue-500' },
    updated: { label: 'Modificado', color: 'bg-yellow-500' },
    status_changed: { label: 'Estado Cambiado', color: 'bg-purple-500' },
    document_generated: { label: 'Documento Generado', color: 'bg-green-500' },
    cancelled: { label: 'Cancelado', color: 'bg-red-500' },
    deleted: { label: 'Eliminado', color: 'bg-gray-500' },
};

export default function Pharmacies() {
    const { user, canViewAllData, isSupervisor, zoneId } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("pharmacies");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pharmacyImporting, setPharmacyImporting] = useState(false);
    const [editingPharmacyId, setEditingPharmacyId] = useState<string | null>(null);
    const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});

    // Demo mode hook - provides mock data when in demo mode
    const demoData = useDemoData();



    // Pharmacies state
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pharmacyFormData, setPharmacyFormData] = useState({
        // Información básica
        name: "",
        rif: "",
        address: "",
        city: "",
        sector: "",
        state: "",

        // Contacto
        phone: "",
        contact_phone: "",
        contact_name: "",
        email: "",
        main_contact: "",
        contact_position: "",

        // Horarios
        schedule: "",
        business_hours: "",

        // Productos y clasificación
        promoted_products: [] as string[],
        product_interest: "",
        segmentation: "",
        potential: "Medio" as 'Alto' | 'Medio' | 'Bajo',

        // Seguimiento
        follow_up_action: "",
        last_visit: "",
        status: "Activo" as 'Activo' | 'Inactivo',

        // Redes sociales
        instagram: "",

        // Otros
        notes: "",
        priority: "medium",
        zone_id: null as string | null,
        representative_id: null as string | null,

        affiliatedDrugstores: [] as { name: string, code: string, contact_name: string, phone: string, email: string }[]
    });

    const resetPharmacyForm = () => {
        setPharmacyFormData({
            name: "", rif: "", address: "", city: "", sector: "", state: "",
            phone: "", contact_phone: "", contact_name: "", email: "", main_contact: "", contact_position: "",
            schedule: "", business_hours: "",
            promoted_products: [], product_interest: "", segmentation: "", potential: "Medio",
            follow_up_action: "", last_visit: "", status: "Activo",
            instagram: "",
            notes: "", priority: "medium", zone_id: null, representative_id: null,
            affiliatedDrugstores: []
        });
        setEditingPharmacyId(null);
    };

    // Drugstores state
    const [drugstores, setDrugstores] = useState<Drugstore[]>([]);
    const [drugstoreDialogOpen, setDrugstoreDialogOpen] = useState(false);
    const [drugstoreForm, setDrugstoreForm] = useState({
        name: '', code: '', contact_name: '', phone: '', email: ''
    });

    // Transfers state
    const [transfers, setTransfers] = useState<TransferOrder[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferOrder | null>(null);
    const [transferHistory, setTransferHistory] = useState<TransferHistory[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");

    // View Pharmacy Details State
    const [selectedPharmacyView, setSelectedPharmacyView] = useState<Pharmacy | null>(null);
    const [viewPharmacyDialogOpen, setViewPharmacyDialogOpen] = useState(false);

    // Real-time metrics state
    const [visits, setVisits] = useState<Visit[]>([]);
    const [allStock, setAllStock] = useState<PharmacyStock[]>([]);
    const [allReports, setAllReports] = useState<PharmacyReport[]>([]);

    // New transfer form
    const [newTransfer, setNewTransfer] = useState({
        pharmacy_id: '',
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

    useEffect(() => {
        if (user) loadAllData();
    }, [user, adminFilters, canViewAllData, zoneId]); // Reload when user auth/role state or filters change

    const loadAllData = async () => {
        setLoading(true);
        try {
            // DEMO MODE: Use mock data instead of Supabase
            if (demoData) {
                console.log("Pharmacies: Using mock demo data");
                setPharmacies(demoData.pharmacies as unknown as Pharmacy[]);
                setDrugstores(demoData.drugstores as unknown as Drugstore[]);
                setProducts(demoData.products);
                setVisits(demoData.visits as any[]);
                setAllStock([]);
                setAllReports([]);
                setTransfers([]);
                setLoading(false);
                return;
            }

            // Base query filter helper - hasStateColumn indicates if the table has a 'state' column
            const applyFilters = (query: any, userColumn = 'user_id', hasStateColumn = false) => {
                // Hierarchical filtering logic
                if (isSupervisor && zoneId) {
                    if (adminFilters.repId && adminFilters.repId !== 'all') {
                        query = query.or(`${userColumn}.eq.${adminFilters.repId},user_id.eq.${adminFilters.repId}`);
                    } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                        query = query.eq('zone_id', adminFilters.zoneId);
                    } else if (hasStateColumn && adminFilters.state && adminFilters.state !== 'all') {
                        query = query.eq('state', adminFilters.state);
                    } else {
                        return query.eq('zone_id', zoneId);
                    }
                    return query;
                }

                if (!canViewAllData) {
                    // Representative: Restricted to their own data
                    if (userColumn === 'representative_id') {
                        return query.or(`representative_id.eq.${user?.id},user_id.eq.${user?.id}`);
                    }
                    return query.or(`${userColumn}.eq.${user?.id},user_id.eq.${user?.id}`);
                }

                // Master/Manager: Full access narrowed by admin filters
                if (adminFilters.repId && adminFilters.repId !== 'all') {
                    if (userColumn === 'representative_id') {
                        query = query.or(`representative_id.eq.${adminFilters.repId},user_id.eq.${adminFilters.repId}`);
                    } else {
                        query = query.eq(userColumn, adminFilters.repId);
                    }
                } else if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                    query = query.eq('zone_id', adminFilters.zoneId);
                } else if (hasStateColumn && adminFilters.state && adminFilters.state !== 'all') {
                    query = query.eq('state', adminFilters.state);
                } else if (hasStateColumn && adminFilters.region && adminFilters.region !== 'all') {
                    const states = getStatesInRegion(adminFilters.region);
                    if (states.length > 0) {
                        query = query.in('state', states);
                    }
                }
                return query;
            };

            // Load pharmacies
            let pharmaciesQuery = supabase
                .from('pharmacies')
                .select('*');

            pharmaciesQuery = applyFilters(pharmaciesQuery, 'representative_id', true); // pharmacies has state column
            const pharmaciesRes = await pharmaciesQuery.order('name', { ascending: true });
            if (pharmaciesRes.error) {
                console.error('Error loading pharmacies:', pharmaciesRes.error);
            }
            setPharmacies((pharmaciesRes.data as unknown as Pharmacy[]) || []);

            // Load drugstores
            let drugstoresQuery = supabase.from('drugstores' as any).select('*').eq('is_active', true);
            drugstoresQuery = applyFilters(drugstoresQuery);
            const drugstoresRes: any = await drugstoresQuery;
            setDrugstores(drugstoresRes.data || []);

            // Load transfers
            let transfersQuery = supabase.from('transfer_orders' as any).select('*');
            transfersQuery = applyFilters(transfersQuery);
            const transfersRes: any = await transfersQuery.order('created_at', { ascending: false });
            setTransfers(transfersRes.data || []);

            // Load products
            const productsRes: any = await supabase.from('products').select('*');
            setProducts(productsRes.data || []);

            // Load Visits
            let visitsQuery = supabase.from('visits').select('id, contact_id, status, scheduled_date');
            visitsQuery = applyFilters(visitsQuery);
            const visitsRes = await visitsQuery;
            setVisits(visitsRes.data || []);

            // Load Stock
            let stockQuery = supabase.from('view_farmacia_stock_actual' as any).select('*');
            stockQuery = applyFilters(stockQuery);
            const stockRes: any = await stockQuery;
            if (stockRes.error) {
                console.error('Error loading stock view:', stockRes.error);
            }

            // Map view fields to PharmacyStock interface
            const mappedStock = (stockRes.data || []).map((item: any) => ({
                id: item.audit_id,
                pharmacy_id: item.pharmacy_id,
                product_id: item.producto_id,
                quantity: item.cantidad_actual || 0
            }));

            setAllStock(mappedStock);

            // Load Reports
            let reportsQuery = supabase.from('pharmacy_reports' as any).select('*');
            reportsQuery = applyFilters(reportsQuery);
            const reportsRes: any = await reportsQuery;
            setAllReports(reportsRes.data || []);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // ============== PHARMACY FUNCTIONS ==============
    const addAffiliatedDrugstore = () => {
        setPharmacyFormData(prev => ({
            ...prev,
            affiliatedDrugstores: [...prev.affiliatedDrugstores, { name: '', code: '', contact_name: '', phone: '', email: '' }]
        }));
    };

    const removeAffiliatedDrugstore = (index: number) => {
        setPharmacyFormData(prev => ({
            ...prev,
            affiliatedDrugstores: prev.affiliatedDrugstores.filter((_, i) => i !== index)
        }));
    };

    const updateAffiliatedDrugstore = (index: number, field: string, value: string) => {
        setPharmacyFormData(prev => {
            const newList = [...prev.affiliatedDrugstores];
            newList[index] = { ...newList[index], [field]: value };

            // Auto-complete logic: find any drugstore with the same name to copy contact info
            if (field === 'name') {
                const existing = drugstores.find(d => d.name.toLowerCase().trim() === value.toLowerCase().trim());
                if (existing) {
                    newList[index] = {
                        ...newList[index],
                        contact_name: existing.contact_name || '',
                        phone: existing.phone || '',
                        email: existing.email || ''
                    };
                }
            }

            return { ...prev, affiliatedDrugstores: newList };
        });
    };

    const handlePharmacySubmit = async () => {
        if (!user || !pharmacyFormData.name) return;
        try {
            if (editingPharmacyId) {
                // Update existing pharmacy
                const { error } = await supabase.from('pharmacies').update({
                    // Información básica
                    name: pharmacyFormData.name,
                    rif: pharmacyFormData.rif || null,
                    address: pharmacyFormData.address || null,
                    city: pharmacyFormData.city || null,
                    sector: pharmacyFormData.sector || null,
                    state: pharmacyFormData.state || null,

                    // Contacto
                    phone: pharmacyFormData.phone || null,
                    contact_phone: pharmacyFormData.contact_phone || null,
                    contact_name: pharmacyFormData.contact_name || null,
                    email: pharmacyFormData.email || null,
                    main_contact: pharmacyFormData.main_contact || null,
                    contact_position: pharmacyFormData.contact_position || null,

                    // Horarios
                    schedule: pharmacyFormData.schedule || null,
                    business_hours: pharmacyFormData.business_hours || null,

                    // Productos y clasificación
                    promoted_products: pharmacyFormData.promoted_products.length > 0 ? pharmacyFormData.promoted_products : null,
                    product_interest: pharmacyFormData.product_interest || null,
                    segmentation: pharmacyFormData.segmentation || null,
                    potential: pharmacyFormData.potential,

                    // Seguimiento
                    follow_up_action: pharmacyFormData.follow_up_action || null,
                    last_visit: pharmacyFormData.last_visit || null,
                    status: pharmacyFormData.status,

                    // Redes sociales
                    instagram: pharmacyFormData.instagram || null,

                    // Otros
                    notes: pharmacyFormData.notes || null,
                    priority: pharmacyFormData.priority,
                    updated_at: new Date().toISOString()
                }).eq('id', editingPharmacyId);

                if (error) throw error;
                toast({ title: "Farmacia actualizada", description: "Los datos han sido guardados." });
            } else {
                // Create new pharmacy
                const { data: pharmacyData, error: pharmacyError } = await supabase.from('pharmacies').insert({
                    user_id: user.id,
                    // Información básica
                    name: pharmacyFormData.name,
                    rif: pharmacyFormData.rif || null,
                    address: pharmacyFormData.address || null,
                    city: pharmacyFormData.city || null,
                    sector: pharmacyFormData.sector || null,
                    state: pharmacyFormData.state || null,

                    // Contacto
                    phone: pharmacyFormData.phone || null,
                    contact_phone: pharmacyFormData.contact_phone || null,
                    contact_name: pharmacyFormData.contact_name || null,
                    email: pharmacyFormData.email || null,
                    main_contact: pharmacyFormData.main_contact || null,
                    contact_position: pharmacyFormData.contact_position || null,

                    // Horarios
                    schedule: pharmacyFormData.schedule || null,
                    business_hours: pharmacyFormData.business_hours || null,

                    // Productos y clasificación
                    promoted_products: pharmacyFormData.promoted_products.length > 0 ? pharmacyFormData.promoted_products : null,
                    product_interest: pharmacyFormData.product_interest || null,
                    segmentation: pharmacyFormData.segmentation || null,
                    potential: pharmacyFormData.potential,

                    // Seguimiento
                    follow_up_action: pharmacyFormData.follow_up_action || null,
                    last_visit: pharmacyFormData.last_visit || null,
                    status: pharmacyFormData.status,

                    // Redes sociales
                    instagram: pharmacyFormData.instagram || null,

                    // Otros
                    notes: pharmacyFormData.notes || null,
                    priority: pharmacyFormData.priority
                }).select().single();

                if (pharmacyError) throw pharmacyError;

                // 2. Create Affiliated Drugstores
                if (pharmacyFormData.affiliatedDrugstores.length > 0) {
                    const drugstoresToInsert = pharmacyFormData.affiliatedDrugstores.map(ds => ({
                        ...ds,
                        user_id: user.id,
                        contact_id: pharmacyData.id,
                        is_active: true
                    }));
                    const { error: dsError } = await supabase.from('drugstores' as any).insert(drugstoresToInsert);
                    if (dsError) throw dsError;
                }

                setDialogOpen(false);
                resetPharmacyForm();
                loadAllData();
            }
        } catch (error) {
            console.error("Error creating pharmacy:", error);
            toast({ title: "Error", description: "No se pudo agregar la farmacia.", variant: "destructive" });
        }
    };

    const triggerPharmacyImport = () => {
        fileInputRef.current?.click();
    };

    const formatStatusForDB = (val: any): 'Activo' | 'Inactivo' | 'Activo' => {

        if (!val) return 'Activo';
        const str = String(val).toLowerCase().trim();
        if (str.includes('inactivo') || str.includes('inactive') || str === 'i' || str === 'false' || str === '0') return 'Inactivo';
        return 'Activo';
    };

    const formatPotentialForDB = (val: any): 'Alto' | 'Medio' | 'Bajo' | 'Medio' => {
        if (!val) return 'Medio';
        const str = String(val).toLowerCase().trim();
        if (str.includes('alto') || str.includes('alta') || str.includes('high') || str === 'a') return 'Alto';
        if (str.includes('bajo') || str.includes('baja') || str.includes('low') || str === 'c') return 'Bajo';
        return 'Medio';
    };

    const formatDateForDB = (dateStr: any): string | null => {
        if (!dateStr) return null;
        try {
            if (typeof dateStr === 'number') {
                const date = new Date((dateStr - (25567 + 2)) * 86400 * 1000);
                return date.toISOString().split('T')[0];
            }
            if (dateStr instanceof Date) return dateStr.toISOString().split('T')[0];
            const cleanStr = String(dateStr).trim();
            if (!cleanStr) return null;
            if (cleanStr.includes('/')) {
                const parts = cleanStr.split('/');
                if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            const date = new Date(cleanStr);
            if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
            return null;
        } catch (e) { return null; }
    };

    const handlePharmacyImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setPharmacyImporting(true);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (!jsonData || jsonData.length === 0) {
                        throw new Error("El archivo está vacío o no tiene el formato correcto.");
                    }

                    // Fetch profiles for representative resolution
                    const { data: profiles } = await supabase.from('profiles').select('id, email');
                    // Fetch zones for resolution
                    const { data: zones } = await supabase.from('zones').select('id, name');

                    const resolveRepId = (val: any) => {
                        if (!val) return null;
                        const strVal = String(val).trim();
                        // UUID check
                        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(strVal)) return strVal;
                        // Email check
                        if (strVal.includes('@') && profiles) {
                            const found = profiles.find((p: any) => p.email?.toLowerCase() === strVal.toLowerCase());
                            if (found) return found.id;
                        }
                        return null;
                    };

                    const resolveZoneId = (val: any) => {
                        if (!val) return null;
                        const strVal = String(val).trim();
                        // UUID check
                        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(strVal)) return strVal;

                        // Try to find by name (fuzzy match)
                        if (zones) {
                            // Exact match first
                            let found = zones.find((z: any) => z.name.toLowerCase() === strVal.toLowerCase());
                            if (found) return found.id;

                            // Includes match
                            found = zones.find((z: any) => z.name.toLowerCase().includes(strVal.toLowerCase()));
                            if (found) return found.id;
                        }
                        return null;
                    };

                    const pharmaciesToInsert = jsonData.map((row: any) => ({
                        user_id: user?.id,
                        // Información básica
                        name: row['Nombre'] || row['nombre'] || row['Name'],
                        rif: row['RIF'] || row['rif'] || null,
                        address: row['Direccion'] || row['Dirección'] || row['direccion'] || row['Address'] || null,
                        city: row['Ciudad'] || row['ciudad'] || row['City'] || null,
                        sector: row['Sector'] || row['sector'] || null,
                        state: row['Estado'] || row['estado'] || row['State'] || null,

                        // Contacto
                        phone: row['Telefono'] || row['Teléfono'] || row['telefono'] || row['Phone'] || null,
                        contact_phone: row['Teléfono Contacto'] || row['Telefono Contacto'] || row['ContactPhone'] || null,
                        contact_name: row['Contacto'] || row['contacto'] || row['ContactName'] || null,
                        email: row['Email'] || row['email'] || null,
                        main_contact: row['ContactoPrincipal'] || row['Contacto Principal'] || row['MainContact'] || null,
                        contact_position: row['CargoContacto'] || row['Cargo Contacto'] || row['ContactPosition'] || null,

                        // Horarios
                        schedule: row['Horario'] || row['horario'] || row['Schedule'] || null,
                        business_hours: row['Horario_Atención'] || row['Horario Atención'] || row['BusinessHours'] || null,

                        // Productos y clasificación
                        promoted_products: row['Productos Promocionados'] ? String(row['Productos Promocionados']).split(',').map((p: string) => p.trim()) : null,
                        product_interest: row['Producto_Interes'] || row['Producto Interés'] || row['ProductInterest'] || null,
                        segmentation: row['Segmentacion'] || row['Segmentación'] || row['Segmentation'] || null,
                        potential: formatPotentialForDB(row['Potencial'] || row['potencial'] || row['Potential']),

                        // Seguimiento
                        follow_up_action: row['Acción de Seguimiento'] || row['Accion de Seguimiento'] || row['FollowUpAction'] || null,
                        last_visit: formatDateForDB(row['Última_Visita'] || row['Ultima Visita'] || row['LastVisit']),
                        status: formatStatusForDB(row['Status'] || row['status'] || row['Estado']),

                        // Redes sociales
                        instagram: row['Instagram'] || row['instagram'] || null,

                        // Otros
                        notes: row['Notas'] || row['notas'] || row['Notes'] || null,
                        priority: row['Prioridad'] || row['prioridad'] || row['Priority'] || 'medium',
                        zone_id: resolveZoneId(row['ZonaID'] || row['zone_id']),
                        representative_id: resolveRepId(row['ID_RepresentanteAsignado'] || row['representative_id'])
                    })).filter(p => p.name);

                    if (pharmaciesToInsert.length === 0) {
                        throw new Error("No se encontraron farmacias válidas para importar.");
                    }

                    const { error } = await supabase
                        .from('pharmacies')
                        .insert(pharmaciesToInsert);

                    if (error) throw error;

                    toast({
                        title: "Importación exitosa",
                        description: `Se han importado ${pharmaciesToInsert.length} farmacias correctamente.`
                    });
                    loadAllData();
                } catch (error: any) {
                    console.error("Import parsing error:", error);
                    toast({
                        title: "Error de Importación",
                        description: error.message || "Hubo un error al procesar el archivo.",
                        variant: "destructive"
                    });
                } finally {
                    setPharmacyImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("File reading error:", error);
            setPharmacyImporting(false);
        }
    };

    const handleViewPharmacy = (pharmacy: Pharmacy) => {
        setSelectedPharmacyView(pharmacy);
        setViewPharmacyDialogOpen(true);
        setViewPharmacyDialogOpen(true);
    };

    const handleEditPharmacy = (e: React.MouseEvent | null, pharmacy: Pharmacy) => {
        if (e) e.stopPropagation();
        setEditingPharmacyId(pharmacy.id);
        setPharmacyFormData({
            name: pharmacy.name,
            rif: pharmacy.rif || "",
            address: pharmacy.address || "",
            city: pharmacy.city || "",
            sector: pharmacy.sector || "",
            state: pharmacy.state || "",
            phone: pharmacy.phone || "",
            contact_phone: pharmacy.contact_phone || "",
            contact_name: pharmacy.contact_name || "",
            email: pharmacy.email || "",
            main_contact: pharmacy.main_contact || "",
            contact_position: pharmacy.contact_position || "",
            schedule: pharmacy.schedule || "",
            business_hours: pharmacy.business_hours || "",
            promoted_products: pharmacy.promoted_products || [],
            product_interest: pharmacy.product_interest || "",
            segmentation: pharmacy.segmentation || "",
            potential: pharmacy.potential as 'Alto' | 'Medio' | 'Bajo' || "Medio",
            follow_up_action: pharmacy.follow_up_action || "",
            last_visit: pharmacy.last_visit || "",
            status: pharmacy.status,
            instagram: pharmacy.instagram || "",
            notes: pharmacy.notes || "",
            priority: pharmacy.priority || "medium",
            zone_id: pharmacy.zone_id,
            representative_id: pharmacy.representative_id,
            affiliatedDrugstores: []
        });
        setDialogOpen(true);
        // If coming from view details, close it
        setViewPharmacyDialogOpen(false);
    };

    const handleNewOrderClick = (e: React.MouseEvent, pharmacy: Pharmacy) => {
        e.stopPropagation();
        handlePharmacySelect(pharmacy.id);
        setTransferDialogOpen(true);
    };


    // ============== DRUGSTORE FUNCTIONS ==============
    const handleDrugstoreSubmit = async () => {
        if (!drugstoreForm.name.trim()) {
            toast({ title: "Error", description: "El nombre de la droguería es requerido", variant: "destructive" });
            return;
        }
        try {
            const { data, error } = await (supabase.from('drugstores' as any).insert({
                user_id: user?.id,
                ...drugstoreForm
            }).select().single()) as any;
            if (error) throw error;
            toast({ title: "Droguería creada", description: `${drugstoreForm.name} ha sido registrada.` });
            setDrugstores(prev => [...prev, data]);
            setDrugstoreForm({ name: '', code: '', contact_name: '', phone: '', email: '' });
            setDrugstoreDialogOpen(false);
        } catch (error) {
            toast({ title: "Error", description: "No se pudo crear la droguería", variant: "destructive" });
        }
    };

    // ============== TRANSFER FUNCTIONS ==============
    const handlePharmacySelect = (pharmacyId: string) => {
        const pharmacy = pharmacies.find(p => p.id === pharmacyId);
        if (pharmacy) {
            setNewTransfer(prev => ({
                ...prev,
                pharmacy_id: pharmacyId,
                pharmacy_name: pharmacy.name,
                pharmacy_address: pharmacy.address || '',
                pharmacy_phone: pharmacy.phone || ''
            }));
        }
    };

    const handleDrugstoreSelect = (drugstoreId: string) => {
        const drugstore = drugstores.find(d => d.id === drugstoreId);
        if (drugstore) {
            setNewTransfer(prev => ({
                ...prev,
                drugstore_id: drugstoreId,
                drugstore_code: drugstore.code || ''
            }));
        }
    };

    const addProductToTransfer = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product && !newTransfer.products.find(p => p.id === productId)) {
            setNewTransfer(prev => ({
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
        setNewTransfer(prev => ({
            ...prev,
            products: prev.products.map(p =>
                p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
            )
        }));
    };

    const removeProduct = (productId: string) => {
        setNewTransfer(prev => ({
            ...prev,
            products: prev.products.filter(p => p.id !== productId)
        }));
    };

    const calculateTotals = () => {
        const subtotal = newTransfer.products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0);
        const tax = subtotal * 0.16;
        return { subtotal, tax, total: subtotal + tax };
    };

    const handleCreateTransfer = async () => {
        if (!newTransfer.pharmacy_name || !newTransfer.drugstore_id || newTransfer.products.length === 0) {
            toast({ title: "Error", description: "Selecciona farmacia, droguería y añade productos", variant: "destructive" });
            return;
        }

        const totals = calculateTotals();
        const drugstore = drugstores.find(d => d.id === newTransfer.drugstore_id);

        try {
            const { data, error } = await (supabase.from('transfer_orders' as any).insert({
                user_id: user?.id,
                contact_id: newTransfer.pharmacy_id || null,
                pharmacy_name: newTransfer.pharmacy_name,
                pharmacy_address: newTransfer.pharmacy_address,
                pharmacy_phone: newTransfer.pharmacy_phone,
                drugstore_id: newTransfer.order_type === 'transfer' ? (newTransfer.drugstore_id || null) : null,
                drugstore_name: newTransfer.order_type === 'transfer' ? (drugstore?.name || '') : 'Venta Directa',
                drugstore_code: newTransfer.order_type === 'transfer' ? newTransfer.drugstore_code : 'DIRECT',
                order_type: newTransfer.order_type,
                products: newTransfer.products,
                subtotal: totals.subtotal,
                tax: totals.tax,
                total: totals.total,
                notes: newTransfer.notes,
                delivery_date: newTransfer.delivery_date || null,
                status: 'pending'
            }).select().single()) as any;

            if (error) throw error;

            // Log history
            await logTransferHistory(data.id, 'created', `Pedido ${data.order_number} creado para ${newTransfer.pharmacy_name}`);

            toast({ title: "Pedido creado", description: "El pedido de transferencia ha sido registrado." });
            resetTransferForm();
            setTransferDialogOpen(false);
            loadAllData();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo crear el pedido", variant: "destructive" });
        }
    };

    const logTransferHistory = async (transferId: string, action: string, description: string) => {
        try {
            await (supabase.from('transfer_order_history' as any).insert({
                transfer_order_id: transferId,
                user_id: user?.id,
                action,
                changes_description: description
            })) as any;
        } catch (error) {
            console.error('Error logging history:', error);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string, orderNumber: string) => {
        try {
            const { error } = await (supabase
                .from('transfer_orders' as any)
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', orderId)) as any;

            if (error) throw error;

            await logTransferHistory(orderId, 'status_changed', `Estado cambiado a: ${STATUS_CONFIG[newStatus]?.label}`);
            toast({ title: "Estado actualizado" });
            loadAllData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" });
        }
    };

    const handleDeleteTransfer = async (orderId: string) => {
        try {
            await logTransferHistory(orderId, 'deleted', 'Pedido eliminado');
            const { error } = await (supabase.from('transfer_orders' as any).delete().eq('id', orderId)) as any;
            if (error) throw error;
            toast({ title: "Pedido eliminado" });
            loadAllData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar el pedido", variant: "destructive" });
        }
    };

    const loadTransferHistory = async (transferId: string) => {
        try {
            const { data }: any = await (supabase
                .from('transfer_order_history' as any)
                .select('*')
                .eq('transfer_order_id', transferId)
                .order('created_at', { ascending: false })) as any;
            setTransferHistory(data || []);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const generatePDF = async (order: TransferOrder) => {
        const printContent = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <title>Pedido ${order.order_number}</title>
                            <style>
                                body {font - family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                                .header {text - align: center; margin-bottom: 30px; border-bottom: 3px solid #1a5f7a; padding-bottom: 20px; }
                                .header h1 {color: #1a5f7a; margin-bottom: 5px; }
                                .info-grid {display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                                .info-box {border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
                                .info-box h3 {margin: 0 0 10px 0; color: #1a5f7a; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                                .info-box p {margin: 5px 0; font-size: 13px; color: #333; }
                                table {width: 100%; border-collapse: collapse; margin: 20px 0; }
                                th {background: #1a5f7a; color: white; padding: 12px; text-align: left; }
                                td {padding: 10px; border-bottom: 1px solid #ddd; }
                                .totals {text - align: right; margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                                .totals p {margin: 5px 0; }
                                .total-final {font - size: 20px; font-weight: bold; color: #1a5f7a; }
                                .footer {margin - top: 40px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
                                .notes {background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>🏪 PEDIDO DE TRANSFERENCIA</h1>
                                <p><strong>Nº ${order.order_number}</strong></p>
                                <p>Fecha: ${new Date(order.order_date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>

                            <div class="info-grid">
                                <div class="info-box">
                                    <h3>📍 FARMACIA SOLICITANTE</h3>
                                    <p><strong>${order.pharmacy_name}</strong></p>
                                    <p>📌 ${order.pharmacy_address || 'Sin dirección'}</p>
                                    <p>📞 ${order.pharmacy_phone || 'N/A'}</p>
                                </div>
                                <div class="info-box">
                                    <h3>🏢 DROGUERÍA PROVEEDORA</h3>
                                    <p><strong>${order.drugstore_name || 'No especificada'}</strong></p>
                                    <p>Código Cliente: <strong>${order.drugstore_code || 'N/A'}</strong></p>
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
                                    ${order.products?.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td style="text-align: center;">${p.quantity}</td>
                                <td style="text-align: right;">$${p.unit_price.toFixed(2)}</td>
                                <td style="text-align: right;"><strong>$${(p.quantity * p.unit_price).toFixed(2)}</strong></td>
                            </tr>
                        `).join('')}
                                </tbody>
                            </table>

                            <div class="totals">
                                <p>Subtotal: $${order.subtotal?.toFixed(2)}</p>
                                <p>IVA (16%): $${order.tax?.toFixed(2)}</p>
                                <p class="total-final">TOTAL A PAGAR: $${order.total?.toFixed(2)}</p>
                            </div>

                            ${order.notes ? `<div class="notes"><strong>📝 Notas:</strong> ${order.notes}</div>` : ''}

                            <div class="footer">
                                <p>Documento generado automáticamente por MedVisit Pro</p>
                                <p>${new Date().toLocaleString('es-ES')}</p>
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

        // Log document generation
        await logTransferHistory(order.id, 'document_generated', 'Documento PDF generado');

        // Update document generated flag
        await (supabase
            .from('transfer_orders' as any)
            .update({ document_generated: true, updated_at: new Date().toISOString() })
            .eq('id', order.id)) as any;

        toast({ title: "Documento generado", description: "Se ha abierto la ventana de impresión." });
        loadAllData();
    };

    const resetTransferForm = () => {
        setNewTransfer({
            pharmacy_id: '', pharmacy_name: '', pharmacy_address: '', pharmacy_phone: '',
            drugstore_id: '', drugstore_code: '', order_type: 'transfer', products: [], notes: '', delivery_date: ''
        });
    };

    const getPriorityBadge = (priority: string | null) => {
        const styles: Record<string, string> = {
            high: "bg-red-100 text-red-800 border-red-300",
            medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
            low: "bg-green-100 text-green-800 border-green-300"
        };
        const labels: Record<string, string> = { high: "Alta", medium: "Media", low: "Baja" };
        return <Badge className={`${styles[priority || 'medium']} border`}>{labels[priority || 'medium']}</Badge>;
    };

    const filteredTransfers = transfers.filter(t => {
        const matchesSearch = t.pharmacy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredPharmacies = pharmacies.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getPharmacyStats = (pharmacyId: string) => {
        const pharmacyStock = allStock.filter(s => s.pharmacy_id === pharmacyId);
        const totalStock = pharmacyStock.reduce((sum, item) => sum + (item.quantity || 0), 0);

        const pharmacyOrders = transfers.filter(t => (t as any).contact_id === pharmacyId);
        const activeOrders = pharmacyOrders.filter(t => ['pending', 'processing', 'sent'].includes(t.status)).length;

        const pharmacyVisits = visits.filter(v => v.contact_id === pharmacyId && v.status === 'completed');
        const lastVisit = pharmacyVisits.length > 0
            ? new Date(Math.max(...pharmacyVisits.map(v => new Date(v.scheduled_date).getTime()))).toLocaleDateString()
            : 'Sin visitas';

        const pharmacyReports = allReports.filter(r => r.pharmacy_id === pharmacyId && r.status === 'pending').length;

        return { totalStock, activeOrders, lastVisit, pharmacyReports };
    };

    const totals = calculateTotals();

    const stats = {
        totalPharmacies: loading ? '...' : pharmacies.length,
        totalDrugstores: loading ? '...' : drugstores.length,
        totalTransfers: loading ? '...' : transfers.length,
        pendingTransfers: loading ? '...' : transfers.filter(t => t.status === 'pending').length,
        sentTransfers: loading ? '...' : transfers.filter(t => t.status === 'sent').length,
        pendingVisits: loading ? '...' : visits.filter(v => v.status === 'scheduled').length,
        activeOrders: loading ? '...' : transfers.filter(t => ['pending', 'processing', 'sent'].includes(t.status)).length,
        pendingReports: loading ? '...' : allReports.filter(r => r.status === 'pending').length,
    };

    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Store className="h-6 w-6 text-primary" />
                        Gestión de Farmacias
                    </h1>
                    <p className="text-muted-foreground">Farmacias, droguerías y pedidos de transferencia</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} title="Ver Ayuda">
                        <span className="sr-only">Ayuda</span>
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                    </Button>
                </div>
            </div>

            {showHelp && (
                <InstructionCard
                    title="Panel de Farmacias"
                    description="Control integral del canal farmacia."
                    items={[
                        "Gestiona tu fichero de farmacias y sus datos clave.",
                        "Genera 'Pedidos de Transferencia' para reponer stock vía droguería.",
                        "Monitorea el estatus de tus pedidos en tiempo real."
                    ]}
                />
            )}

            {/* Admin Data Filter for Master/Manager */}
            <AdminDataFilter
                onFilterChange={(filters) => setAdminFilters(filters)}
                moduleType="pharmacies"
            />



            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Farmacias</p>
                                <p className="text-2xl font-bold text-foreground">{stats.totalPharmacies}</p>
                            </div>
                            <Store className="h-8 w-8 text-primary opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Visitas Pendientes</p>
                                <p className="text-2xl font-bold text-warning">{stats.pendingVisits}</p>
                            </div>
                            <Clock className="h-8 w-8 text-warning opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Pedidos Activos</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.activeOrders}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Reportes Pendientes</p>
                                <p className="text-2xl font-bold text-destructive">{stats.pendingReports}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-destructive opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full max-w-lg">
                    <TabsTrigger value="pharmacies" className="flex items-center gap-2">
                        <Store className="h-4 w-4" /> Farmacias
                    </TabsTrigger>
                    <TabsTrigger value="drugstores" className="flex items-center gap-2">
                        <Building className="h-4 w-4" /> Droguerías
                    </TabsTrigger>
                    <TabsTrigger value="transfers" className="flex items-center gap-2">
                        <Send className="h-4 w-4" /> Transferencias
                    </TabsTrigger>
                </TabsList>

                {/* ============== PHARMACIES TAB ============== */}
                <TabsContent value="pharmacies" className="space-y-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePharmacyImport}
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        className="hidden"
                    />

                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar farmacias..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Ayuda de Importación">
                                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Estructura de Archivo para Importación</DialogTitle>
                                    <DialogDescription>
                                        Para importar farmacias, utiliza un archivo Excel (.xlsx) o CSV con las siguientes columnas.
                                        La primera fila debe contener los encabezados exactos.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="border rounded-md overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Columna</TableHead>
                                                <TableHead>Descripción</TableHead>
                                                <TableHead>Ejemplo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-medium">Nombre</TableCell>
                                                <TableCell>Nombre de la farmacia (Obligatorio)</TableCell>
                                                <TableCell>Farmacia Central</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">RIF</TableCell>
                                                <TableCell>Registro de Información Fiscal</TableCell>
                                                <TableCell>J-123456789</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Direccion</TableCell>
                                                <TableCell>Dirección completa</TableCell>
                                                <TableCell>Av. Principal 123</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Ciudad</TableCell>
                                                <TableCell>Ciudad de ubicación</TableCell>
                                                <TableCell>Caracas</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Sector</TableCell>
                                                <TableCell>Sector o zona</TableCell>
                                                <TableCell>El Rosal</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Estado</TableCell>
                                                <TableCell>Estado o provincia</TableCell>
                                                <TableCell>Miranda</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Telefono</TableCell>
                                                <TableCell>Teléfono principal</TableCell>
                                                <TableCell>+58 414 1234567</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Teléfono Contacto</TableCell>
                                                <TableCell>Teléfono alternativo</TableCell>
                                                <TableCell>+58 212 9876543</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Contacto</TableCell>
                                                <TableCell>Nombre del contacto</TableCell>
                                                <TableCell>Juan Pérez</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Email</TableCell>
                                                <TableCell>Correo electrónico</TableCell>
                                                <TableCell>farmacia@example.com</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">ContactoPrincipal</TableCell>
                                                <TableCell>Contacto principal</TableCell>
                                                <TableCell>María González</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">CargoContacto</TableCell>
                                                <TableCell>Cargo del contacto</TableCell>
                                                <TableCell>Gerente</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Horario</TableCell>
                                                <TableCell>Horario general</TableCell>
                                                <TableCell>Lun-Vie 8am-6pm</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Horario_Atención</TableCell>
                                                <TableCell>Horario de atención</TableCell>
                                                <TableCell>8:00 AM - 8:00 PM</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Productos Promocionados</TableCell>
                                                <TableCell>Lista separada por comas</TableCell>
                                                <TableCell>Prod1, Prod2, Prod3</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Producto_Interes</TableCell>
                                                <TableCell>Productos de interés</TableCell>
                                                <TableCell>Antibióticos</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Segmentacion</TableCell>
                                                <TableCell>Categoría/Segmento</TableCell>
                                                <TableCell>Premium</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Potencial</TableCell>
                                                <TableCell>Alto, Medio o Bajo</TableCell>
                                                <TableCell>Alto</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Acción de Seguimiento</TableCell>
                                                <TableCell>Próxima acción</TableCell>
                                                <TableCell>Llamar la próxima semana</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Última_Visita</TableCell>
                                                <TableCell>Fecha última visita (YYYY-MM-DD)</TableCell>
                                                <TableCell>2024-12-15</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Status</TableCell>
                                                <TableCell>Activo o Inactivo</TableCell>
                                                <TableCell>Activo</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">Instagram</TableCell>
                                                <TableCell>Handle de Instagram</TableCell>
                                                <TableCell>@farmacia_central</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button variant="outline" onClick={() => exportToCSV(filteredPharmacies, 'farmacias')}>
                            <Download className="mr-2 h-4 w-4" />
                            Exportar
                        </Button>

                        <Button variant="outline" onClick={triggerPharmacyImport} disabled={pharmacyImporting}>
                            {pharmacyImporting ? <FileSpreadsheet className="mr-2 h-4 w-4 animate-pulse" /> : <Upload className="mr-2 h-4 w-4" />}
                            {pharmacyImporting ? "Importando..." : "Importar"}
                        </Button>

                        <Button variant="outline" onClick={handlePrint} className="hidden sm:flex">
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                        </Button>


                        <PharmacyFormDialog
                            open={dialogOpen}
                            onOpenChange={(open) => {
                                setDialogOpen(open);
                                if (!open) resetPharmacyForm();
                            }}
                            formData={pharmacyFormData}
                            setFormData={setPharmacyFormData}
                            onSubmit={handlePharmacySubmit}
                            isEditing={!!editingPharmacyId}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
                    ) : filteredPharmacies.length === 0 ? (
                        <Card><CardContent className="text-center py-12">
                            <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No hay farmacias registradas</p>
                        </CardContent></Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPharmacies.map(pharmacy => {
                                const pStats = getPharmacyStats(pharmacy.id);
                                return (
                                    <Card
                                        key={pharmacy.id}
                                        className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/50 cursor-pointer"
                                        onClick={() => handleViewPharmacy(pharmacy)}
                                    >
                                        <CardHeader className="pb-3 border-b bg-muted/20">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg font-bold text-primary">{pharmacy.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                                                        <MapPin className="h-3 w-3 mr-1" /> {pharmacy.address || pharmacy.city || 'Dirección no especificada'}
                                                    </p>
                                                </div>
                                                {getPriorityBadge(pharmacy.priority)}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-4">
                                            {/* Contact Info */}
                                            <div className="grid grid-cols-1 gap-2">
                                                {pharmacy.city && <div className="flex items-center text-sm text-foreground"><Building2 className="mr-2 h-4 w-4 text-muted-foreground" />{pharmacy.city}{pharmacy.state ? `, ${pharmacy.state}` : ''}</div>}
                                                {pharmacy.phone && <div className="flex items-center text-sm text-foreground"><Phone className="mr-2 h-4 w-4 text-muted-foreground" />{pharmacy.phone}</div>}
                                            </div>

                                            <Separator />

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <PharmacyInventoryDialog
                                                    pharmacyId={pharmacy.id}
                                                    pharmacyName={pharmacy.name}
                                                    trigger={
                                                        <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <div className="bg-primary/5 p-2 rounded-md border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors">
                                                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Stock Productos</p>
                                                                <p className="text-lg font-bold flex items-center gap-1">
                                                                    <Package className="h-4 w-4 text-primary" />
                                                                    {loading ? '...' : pStats.totalStock}
                                                                </p>
                                                            </div>
                                                        </DialogTrigger>
                                                    }
                                                />
                                                <div
                                                    className="bg-blue-50 p-2 rounded-md border border-blue-100 cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Pedidos Activos</p>
                                                    <p className="text-lg font-bold flex items-center gap-1 text-blue-700">
                                                        <Send className="h-4 w-4" />
                                                        {loading ? '...' : pStats.activeOrders}
                                                    </p>
                                                </div>
                                                <div
                                                    className="bg-orange-50 p-2 rounded-md border border-orange-100 cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Última Visita</p>
                                                    <p className="text-sm font-semibold flex items-center gap-1 text-orange-700">
                                                        <Calendar className="h-4 w-4" />
                                                        {loading ? '...' : pStats.lastVisit}
                                                    </p>
                                                </div>
                                                <div
                                                    className="bg-destructive/5 p-2 rounded-md border border-destructive/10 cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Reportes Pend.</p>
                                                    <p className="text-lg font-bold flex items-center gap-1 text-destructive">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {loading ? '...' : pStats.pharmacyReports}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2">
                                                <PharmacyInventoryDialog
                                                    pharmacyId={pharmacy.id}
                                                    pharmacyName={pharmacy.name}
                                                    trigger={
                                                        <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="outline" size="sm" className="h-8 text-xs" title="Stock de Anaquel">
                                                                <ClipboardList className="h-3 w-3 mr-1" /> Stock
                                                            </Button>
                                                        </DialogTrigger>
                                                    }
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs"
                                                    onClick={(e) => { e.stopPropagation(); handleViewPharmacy(pharmacy); }}
                                                >
                                                    Ver Detalle
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs"
                                                    onClick={(e) => handleEditPharmacy(e, pharmacy)}
                                                >
                                                    <Edit className="h-3 w-3 mr-1" /> Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-8 text-xs btn-medical"
                                                    onClick={(e) => handleNewOrderClick(e, pharmacy)}
                                                >
                                                    Nuevo Pedido
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* ============== PHARMACY DETAILS VIEW DIALOG ============== */}
                <Dialog open={viewPharmacyDialogOpen} onOpenChange={setViewPharmacyDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detalle de Farmacia</DialogTitle>
                        </DialogHeader>
                        {selectedPharmacyView && (
                            <div className="space-y-6">
                                {/* Header Info */}
                                <div className="flex justify-between items-start border-b pb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-primary">{selectedPharmacyView.name}</h2>
                                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                            <MapPin className="h-4 w-4" />
                                            <span>{selectedPharmacyView.address || 'Sin dirección registrada'}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Badge variant="outline">{selectedPharmacyView.city}</Badge>
                                            {selectedPharmacyView.sector && <Badge variant="secondary">{selectedPharmacyView.sector}</Badge>}
                                            {selectedPharmacyView.state && <Badge variant="outline">{selectedPharmacyView.state}</Badge>}
                                            {getPriorityBadge(selectedPharmacyView.priority)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${selectedPharmacyView.status === 'Activo'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedPharmacyView.status}
                                        </div>
                                        {selectedPharmacyView.rif && <p className="text-sm font-mono mt-1 text-muted-foreground">RIF: {selectedPharmacyView.rif}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Column 1: Contact & General */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                                <Phone className="h-4 w-4" /> Contacto
                                            </h3>
                                            <Card>
                                                <CardContent className="pt-4 space-y-2">
                                                    {selectedPharmacyView.contact_name && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Contacto:</span>
                                                            <span className="font-medium">{selectedPharmacyView.contact_name}</span>
                                                        </div>
                                                    )}
                                                    {selectedPharmacyView.contact_position && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Cargo:</span>
                                                            <span>{selectedPharmacyView.contact_position}</span>
                                                        </div>
                                                    )}
                                                    {selectedPharmacyView.phone && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Teléfono:</span>
                                                            <span className="font-mono">{selectedPharmacyView.phone}</span>
                                                        </div>
                                                    )}
                                                    {selectedPharmacyView.email && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Email:</span>
                                                            <span className="text-blue-600">{selectedPharmacyView.email}</span>
                                                        </div>
                                                    )}
                                                    {selectedPharmacyView.instagram && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Instagram:</span>
                                                            <span className="text-pink-600">{selectedPharmacyView.instagram}</span>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                                <Clock className="h-4 w-4" /> Horarios
                                            </h3>
                                            <div className="bg-muted/30 p-3 rounded-md space-y-1">
                                                <p><span className="font-medium">Horario General:</span> {selectedPharmacyView.schedule || 'No especificado'}</p>
                                                <p><span className="font-medium">Atención:</span> {selectedPharmacyView.business_hours || 'No especificado'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Segmentation & Business */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                                <Building className="h-4 w-4" /> Perfil Comercial
                                            </h3>
                                            <Card>
                                                <CardContent className="pt-4 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-xs text-muted-foreground block">Segmentación</span>
                                                        <span className="font-medium">{selectedPharmacyView.segmentation || '-'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-muted-foreground block">Potencial</span>
                                                        <span className="font-medium">{selectedPharmacyView.potential || '-'}</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-xs text-muted-foreground block">Interés de Producto</span>
                                                        <span className="font-medium">{selectedPharmacyView.product_interest || '-'}</span>
                                                    </div>
                                                    {selectedPharmacyView.promoted_products && selectedPharmacyView.promoted_products.length > 0 && (
                                                        <div className="col-span-2">
                                                            <span className="text-xs text-muted-foreground block mb-1">Productos Promocionados</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {selectedPharmacyView.promoted_products.map((prod, i) => (
                                                                    <Badge key={i} variant="secondary" className="text-xs">{prod}</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {selectedPharmacyView.notes && (
                                            <div>
                                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                                    <FileText className="h-4 w-4" /> Notas
                                                </h3>
                                                <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md text-sm text-yellow-900">
                                                    {selectedPharmacyView.notes}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Acciones Rápidas</p>
                                        <p className="text-xs text-muted-foreground">Operaciones disponibles para esta farmacia</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={(e) => handleNewOrderClick(e, selectedPharmacyView)} className="btn-medical">
                                            <Plus className="mr-2 h-4 w-4" /> Nuevo Pedido
                                        </Button>
                                        <Button variant="outline" onClick={() => handleEditPharmacy(null, selectedPharmacyView)}>
                                            <Edit className="h-4 w-4 mr-2" /> Editar
                                        </Button>
                                        <Button variant="outline" onClick={() => setViewPharmacyDialogOpen(false)}>
                                            Cerrar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ============== DRUGSTORES TAB ============== */}
                <TabsContent value="drugstores" className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar droguerías por nombre o código..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Dialog open={drugstoreDialogOpen} onOpenChange={setDrugstoreDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="btn-medical">
                                        <Plus className="h-4 w-4 mr-2" />
                                        <span className="hidden md:inline">Nueva Droguería</span>
                                        <span className="md:hidden">Nueva</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Registrar Droguería</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Nombre *</Label><Input value={drugstoreForm.name} onChange={e => setDrugstoreForm({ ...drugstoreForm, name: e.target.value })} placeholder="Droguería ABC" /></div>
                                            <div className="space-y-2"><Label>Código</Label><Input value={drugstoreForm.code} onChange={e => setDrugstoreForm({ ...drugstoreForm, code: e.target.value })} placeholder="DRG-001" /></div>
                                        </div>
                                        <div className="space-y-2"><Label>Persona de Contacto</Label><Input value={drugstoreForm.contact_name} onChange={e => setDrugstoreForm({ ...drugstoreForm, contact_name: e.target.value })} /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Teléfono</Label><Input value={drugstoreForm.phone} onChange={e => setDrugstoreForm({ ...drugstoreForm, phone: e.target.value })} /></div>
                                            <div className="space-y-2"><Label>Email</Label><Input type="email" value={drugstoreForm.email} onChange={e => setDrugstoreForm({ ...drugstoreForm, email: e.target.value })} /></div>
                                        </div>
                                        <Button onClick={handleDrugstoreSubmit} className="w-full"><Plus className="h-4 w-4 mr-2" /> Guardar Droguería</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {drugstores.length === 0 ? (
                        <Card><CardContent className="text-center py-12">
                            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No hay droguerías registradas</p>
                        </CardContent></Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {drugstores
                                .filter(d =>
                                    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (d.code && d.code.toLowerCase().includes(searchTerm.toLowerCase()))
                                )
                                .map(d => (
                                    <Card key={d.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg">{d.name}</CardTitle>
                                                {d.code && <Badge variant="outline">{d.code}</Badge>}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {d.contact_name && <p className="text-sm text-muted-foreground">Contacto: {d.contact_name}</p>}
                                            {d.phone && <div className="flex items-center text-sm text-muted-foreground"><Phone className="mr-2 h-4 w-4" />{d.phone}</div>}
                                            {d.email && <div className="flex items-center text-sm text-muted-foreground"><Mail className="mr-2 h-4 w-4" />{d.email}</div>}
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    )}
                </TabsContent>

                {/* ============== TRANSFERS TAB ============== */}
                <TabsContent value="transfers" className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar pedidos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="pending">Pendientes</SelectItem>
                                <SelectItem value="sent">Enviados</SelectItem>
                                <SelectItem value="confirmed">Confirmados</SelectItem>
                                <SelectItem value="delivered">Entregados</SelectItem>
                                <SelectItem value="cancelled">Cancelados</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={loadAllData}><RefreshCw className="h-4 w-4" /></Button>

                        {/* Transfer Dialog Trigger - Button only */}
                        <Button className="btn-medical" onClick={() => setTransferDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Nuevo Pedido
                        </Button>
                    </div>

                    {/* Transfers Table */}
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nº Pedido</TableHead>
                                        <TableHead>Farmacia</TableHead>
                                        <TableHead>Droguería</TableHead>
                                        <TableHead>Productos</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Doc</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransfers.length === 0 ? (
                                        <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No hay pedidos registrados</TableCell></TableRow>
                                    ) : (
                                        filteredTransfers.map(order => {
                                            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                            return (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-mono font-medium">
                                                        {order.order_number}
                                                        <div className="mt-1">
                                                            <Badge variant="outline" className={order.order_type === 'direct_sale' ? 'text-[9px] bg-blue-50 text-blue-700 border-blue-200' : 'text-[9px] bg-purple-50 text-purple-700 border-purple-200'}>
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
                                                        <Select value={order.status} onValueChange={v => handleUpdateStatus(order.id, v, order.order_number)}>
                                                            <SelectTrigger className="w-32 h-8"><Badge className={`${status.color} border`}>{status.label}</Badge></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Pendiente</SelectItem>
                                                                <SelectItem value="sent">Enviado</SelectItem>
                                                                <SelectItem value="confirmed">Confirmado</SelectItem>
                                                                <SelectItem value="delivered">Entregado</SelectItem>
                                                                <SelectItem value="cancelled">Cancelado</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        {order.document_generated ? (
                                                            <Badge className="bg-green-100 text-green-800 border border-green-300"><FileText className="h-3 w-3" /></Badge>
                                                        ) : (
                                                            <Badge variant="outline"><AlertCircle className="h-3 w-3" /></Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{new Date(order.order_date).toLocaleDateString('es-ES')}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button size="sm" variant="ghost" onClick={() => { setSelectedTransfer(order); setViewDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                                                            <Button size="sm" variant="ghost" onClick={() => generatePDF(order)}><Download className="h-4 w-4" /></Button>
                                                            <Button size="sm" variant="ghost" onClick={() => { setSelectedTransfer(order); loadTransferHistory(order.id); setHistoryDialogOpen(true); }}><History className="h-4 w-4" /></Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader><AlertDialogTitle>¿Eliminar pedido?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                                                                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteTransfer(order.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
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
                </TabsContent>
            </Tabs>

            {/* View Transfer Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Detalle del Pedido {selectedTransfer?.order_number}</DialogTitle></DialogHeader>
                    {selectedTransfer && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1"><p className="text-sm text-muted-foreground">Farmacia</p><p className="font-medium">{selectedTransfer.pharmacy_name}</p><p className="text-sm text-muted-foreground">{selectedTransfer.pharmacy_address}</p></div>
                                <div className="space-y-1"><p className="text-sm text-muted-foreground">Droguería</p><p className="font-medium">{selectedTransfer.drugstore_name || 'No especificada'}</p><p className="text-sm text-muted-foreground">Código: {selectedTransfer.drugstore_code || 'N/A'}</p></div>
                            </div>
                            <Separator />
                            <Table>
                                <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Cant.</TableHead><TableHead>P. Unit.</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {selectedTransfer.products?.map((p, i) => (
                                        <TableRow key={i}><TableCell>{p.name}</TableCell><TableCell>{p.quantity}</TableCell><TableCell>${p.unit_price.toFixed(2)}</TableCell><TableCell>${(p.quantity * p.unit_price).toFixed(2)}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="text-right"><p className="text-lg font-bold">Total: ${selectedTransfer.total?.toFixed(2)}</p></div>
                            {selectedTransfer.notes && <div className="bg-muted p-3 rounded-lg"><p className="text-sm"><strong>Notas:</strong> {selectedTransfer.notes}</p></div>}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => generatePDF(selectedTransfer)}><Download className="h-4 w-4 mr-2" /> Generar PDF</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Historial del Pedido</DialogTitle></DialogHeader>
                    <ScrollArea className="h-[400px] pr-4">
                        {transferHistory.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No hay historial registrado</p>
                        ) : (
                            <div className="space-y-4">
                                {transferHistory.map(h => {
                                    const actionConfig = ACTION_LABELS[h.action] || { label: h.action, color: 'bg-gray-500' };
                                    return (
                                        <div key={h.id} className="flex gap-3">
                                            <div className={`w-3 h-3 rounded-full mt-1.5 ${actionConfig.color}`}></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant="outline">{actionConfig.label}</Badge>
                                                    <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString('es-ES')}</span>
                                                </div>
                                                <p className="text-sm mt-1">{h.changes_description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            {/* New Transfer Dialog - Moved Outside Tabs */}
            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Crear Pedido</DialogTitle></DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Tipo de Pedido</Label>
                            <Select
                                value={newTransfer.order_type}
                                onValueChange={(v: any) => setNewTransfer(prev => ({ ...prev, order_type: v }))}
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

                        {/* Pharmacy */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2"><Store className="h-4 w-4" /> Farmacia</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Seleccionar Farmacia *</Label>
                                    <Select onValueChange={handlePharmacySelect} value={newTransfer.pharmacy_id}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>{pharmacies.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label>Nombre</Label><Input value={newTransfer.pharmacy_name} onChange={e => setNewTransfer({ ...newTransfer, pharmacy_name: e.target.value })} /></div>
                            </div>
                        </div>
                        <Separator />

                        {newTransfer.order_type === 'transfer' && (
                            <>
                                {/* Drugstore */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold flex items-center gap-2"><Building className="h-4 w-4" /> Droguería *</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={() => setDrugstoreDialogOpen(true)}><Plus className="h-3 w-3 mr-1" /> Nueva</Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Seleccionar Droguería *</Label>
                                            <Select onValueChange={handleDrugstoreSelect} value={newTransfer.drugstore_id}>
                                                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                <SelectContent>{drugstores.map(d => <SelectItem key={d.id} value={d.id}>{d.name} {d.code && `(${d.code})`}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2"><Label>Código Cliente</Label><Input value={newTransfer.drugstore_code} onChange={e => setNewTransfer({ ...newTransfer, drugstore_code: e.target.value })} placeholder="Código asignado" /></div>
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Products */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Productos *</h3>
                            <Select onValueChange={addProductToTransfer}>
                                <SelectTrigger><SelectValue placeholder="Añadir producto..." /></SelectTrigger>
                                <SelectContent>{products.filter(p => !newTransfer.products.find(op => op.id === p.id)).map(p => <SelectItem key={p.id} value={p.id}>{p.name} - ${p.price || 0}</SelectItem>)}</SelectContent>
                            </Select>
                            {newTransfer.products.length > 0 && (
                                <Table>
                                    <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="w-24">Cantidad</TableHead><TableHead className="w-28">P. Unit.</TableHead><TableHead className="w-28">Total</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {newTransfer.products.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.name}</TableCell>
                                                <TableCell><Input type="number" min="1" value={p.quantity} onChange={e => updateProductQuantity(p.id, parseInt(e.target.value))} className="w-20" /></TableCell>
                                                <TableCell>${p.unit_price.toFixed(2)}</TableCell>
                                                <TableCell>${(p.quantity * p.unit_price).toFixed(2)}</TableCell>
                                                <TableCell><Button size="sm" variant="ghost" onClick={() => removeProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            {newTransfer.products.length > 0 && (
                                <div className="text-right space-y-1">
                                    <p className="text-sm text-muted-foreground">Subtotal: ${totals.subtotal.toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground">IVA (16%): ${totals.tax.toFixed(2)}</p>
                                    <p className="text-lg font-bold">Total: ${totals.total.toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Fecha de Entrega</Label><Input type="date" value={newTransfer.delivery_date} onChange={e => setNewTransfer({ ...newTransfer, delivery_date: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><Label>Notas</Label><Textarea value={newTransfer.notes} onChange={e => setNewTransfer({ ...newTransfer, notes: e.target.value })} placeholder="Observaciones..." rows={2} /></div>
                        <Button onClick={handleCreateTransfer} className="w-full btn-medical"><Plus className="h-4 w-4 mr-2" /> Crear Pedido</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
