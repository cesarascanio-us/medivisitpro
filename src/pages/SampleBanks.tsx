/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Package, Building2, FileText, RotateCcw, Package2,
    Users, Stethoscope, Gift, Plus, Download, Search,
    Calendar, AlertTriangle, Pencil, Trash2, Upload, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminDataFilter, type AdminFilterState } from "@/components/admin/AdminDataFilter";
import { ImportDialog } from "@/components/shared/ImportDialog";
import { exportToCSV } from "@/utils/exportUtils";
import { EliteHeader, EliteKPICard, EliteButton, EliteCard, EliteInput } from "@/components/layout/DesignSystem";
import { useTexts } from "@/hooks/useTexts";
import { getStatesInRegion } from "@/constants/regions";
import { cn } from "@/lib/utils";

export default function SampleBanks() {
    const t = useTexts();
    const { user, canViewAllData, isSupervisor, zoneId, organizationId } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("bancos");
    const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});

    // Dropdowns
    const [healthCenters, setHealthCenters] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Lists
    const [banks, setBanks] = useState<any[]>([]);
    const [inventario, setInventario] = useState<any[]>([]);
    const [entregas, setEntregas] = useState<any[]>([]);
    const [detalles, setDetalles] = useState<any[]>([]);
    const [selectedEntregaId, setSelectedEntregaId] = useState<string | null>(null);
    const [reposiciones, setReposiciones] = useState<any[]>([]);
    const [dispensaciones, setDispensaciones] = useState<any[]>([]);
    const [dispensacionesPacientes, setDispensacionesPacientes] = useState<any[]>([]);
    const [entregasVisitas, setEntregasVisitas] = useState<any[]>([]);
    const [materiales, setMateriales] = useState<any[]>([]);

    // Dialog States
    const [bankDialogOpen, setBankDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [bankFormData, setBankFormData] = useState({
        name: "",
        service_name: "",
        health_center_id: "",
        responsible_user_id: ""
    });

    const [loteDialogOpen, setLoteDialogOpen] = useState(false);
    const [loteFormData, setLoteFormData] = useState({
        product_id: "",
        lote: "",
        fecha_fabricacion: "",
        fecha_vencimiento: "",
        cantidad_asignada: "0"
    });

    const [entregaDialogOpen, setEntregaDialogOpen] = useState(false);
    const [entregaFormData, setEntregaFormData] = useState({
        health_center_id: "",
        servicio: "",
        jefe_servicio: "",
        fecha_entrega: new Date().toISOString().split('T')[0],
        entregado_por: ""
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (user) {
            loadAllData();
        }
    }, [user, adminFilters, organizationId]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadBanks(),
                loadInventario(),
                loadEntregas(),
                loadReposiciones(),
                loadDispensaciones(),
                loadDispensacionesPacientes(),
                loadEntregasVisitas(),
                loadMateriales(),
                loadHealthCentersAndDropdowns()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
            toast({ title: "Error", description: "Error al cargar datos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const loadHealthCentersAndDropdowns = async () => {
        if (!organizationId) return;
        try {
            const { data: centersData } = await supabase
                .from('health_centers')
                .select('id, name')
                .eq('organization_id', organizationId)
                .order('name', { ascending: true });
            setHealthCenters(centersData || []);

            const { data: profilesData } = await supabase
                .from('profiles')
                .select('user_id, first_name, last_name, email')
                .eq('organization_id', organizationId)
                .order('first_name', { ascending: true });

            const mappedMembers = (profilesData || []).map(p => ({
                id: p.user_id,
                name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email
            }));
            setMembers(mappedMembers);

            const { data: productsData } = await supabase
                .from('products')
                .select('id, name')
                .order('name', { ascending: true });
            setProducts(productsData || []);
        } catch (error) {
            console.error("Error loading dropdown data:", error);
        }
    };

    const loadBanks = async () => {
        if (!user || !organizationId) return;
        try {
            const { data: orgProfiles } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('organization_id', organizationId);
            const memberUserIds = orgProfiles?.map(p => p.user_id) || [];

            // Determine if we need an inner join on health_centers due to active geographic filtering
            const hasGeoFilter = (adminFilters.zoneId && adminFilters.zoneId !== 'all') ||
                                 (adminFilters.state && adminFilters.state !== 'all') ||
                                 (adminFilters.region && adminFilters.region !== 'all');

            const healthCentersJoin = hasGeoFilter ? 'health_centers!inner' : 'health_centers';

            let query = supabase
                .from('sample_banks')
                .select(`
                    id,
                    name,
                    service_name,
                    health_center_id,
                    responsible_user_id,
                    last_audit_date,
                    created_at,
                    ${healthCentersJoin} ( id, name, state, zone_id, organization_id )
                `)
                .in('responsible_user_id', memberUserIds);

            if (!canViewAllData) {
                if (isSupervisor && zoneId) {
                    const { data: zoneUsers } = await supabase
                        .from('user_roles')
                        .select('user_id')
                        .eq('zone_id', zoneId);
                    const userIds = zoneUsers?.map(u => u.user_id) || [];
                    if (userIds.length > 0) {
                        query = query.in('responsible_user_id', userIds);
                    } else {
                        query = query.eq('responsible_user_id', user.id);
                    }
                } else {
                    query = query.eq('responsible_user_id', user.id);
                }
            } else {
                if (adminFilters.userId && adminFilters.userId !== 'all') {
                    query = query.eq('responsible_user_id', adminFilters.userId);
                }
                if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                    query = query.eq('health_centers.zone_id', adminFilters.zoneId);
                }
                if (adminFilters.state && adminFilters.state !== 'all') {
                    query = query.eq('health_centers.state', adminFilters.state);
                }
                if (adminFilters.region && adminFilters.region !== 'all') {
                    const regionStates = getStatesInRegion(adminFilters.region);
                    if (regionStates.length > 0) {
                        query = query.in('health_centers.state', regionStates);
                    }
                }
            }

            const { data: banksData, error } = await query.order('name', { ascending: true });
            if (error) throw error;

            // Fetch profiles to map responsible user info manually to bypass foreign key cache issue
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('user_id, first_name, last_name, email');

            const profilesMap = (profilesData || []).reduce((acc: any, p: any) => {
                acc[p.user_id] = p;
                return acc;
            }, {});

            const mappedBanks = (banksData || []).map((bank: any) => ({
                ...bank,
                profiles: profilesMap[bank.responsible_user_id] || null
            }));

            setBanks(mappedBanks);
        } catch (error) {
            console.error("Error loading banks:", error);
            throw error;
        }
    };

    const loadInventario = async () => {
        if (!user || !organizationId) return;
        try {
            let query = supabase
                .from('inventario_muestras')
                .select(`
                    *,
                    products (name)
                `);

            const { data: orgProfiles } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('organization_id', organizationId);
            const memberIds = orgProfiles?.map(p => p.user_id) || [];

            if (!canViewAllData) {
                if (isSupervisor && zoneId) {
                    const { data: zoneUsers } = await supabase
                        .from('user_roles')
                        .select('user_id')
                        .eq('zone_id', zoneId);
                    const userIds = zoneUsers?.map(u => u.user_id) || [];
                    if (userIds.length > 0) {
                        query = query.in('user_id', userIds);
                    } else {
                        query = query.eq('user_id', user.id);
                    }
                } else {
                    query = query.eq('user_id', user.id);
                }
            } else {
                if (adminFilters.userId && adminFilters.userId !== 'all') {
                    query = query.eq('user_id', adminFilters.userId);
                } else if (memberIds.length > 0) {
                    query = query.in('user_id', memberIds);
                }
            }

            const { data, error } = await query.order('fecha_vencimiento', { ascending: true });
            if (error) throw error;
            setInventario(data || []);
        } catch (error) {
            console.error("Error loading inventory:", error);
            throw error;
        }
    };

    const loadEntregas = async () => {
        if (!user || !organizationId) return;
        try {
            let query = supabase
                .from('entregas_banco')
                .select(`
                    *,
                    health_centers!inner (id, name, state, zone_id, organization_id)
                `)
                .eq('health_centers.organization_id', organizationId);

            if (!canViewAllData) {
                if (isSupervisor && zoneId) {
                    const { data: zoneUsers } = await supabase
                        .from('user_roles')
                        .select('user_id')
                        .eq('zone_id', zoneId);
                    const userIds = zoneUsers?.map(u => u.user_id) || [];
                    if (userIds.length > 0) {
                        query = query.in('user_id', userIds);
                    } else {
                        query = query.eq('user_id', user.id);
                    }
                } else {
                    query = query.eq('user_id', user.id);
                }
            } else {
                if (adminFilters.userId && adminFilters.userId !== 'all') {
                    query = query.eq('user_id', adminFilters.userId);
                }
                if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                    query = query.eq('health_centers.zone_id', adminFilters.zoneId);
                }
                if (adminFilters.state && adminFilters.state !== 'all') {
                    query = query.eq('health_centers.state', adminFilters.state);
                }
                if (adminFilters.region && adminFilters.region !== 'all') {
                    const regionStates = getStatesInRegion(adminFilters.region);
                    if (regionStates.length > 0) {
                        query = query.in('health_centers.state', regionStates);
                    }
                }
            }

            const { data, error } = await query.order('fecha_entrega', { ascending: false });
            if (error) throw error;
            setEntregas(data || []);
        } catch (error) {
            console.error("Error loading deliveries:", error);
            throw error;
        }
    };

    const loadReposiciones = async () => {
        if (!organizationId) return;
        try {
            const { data: orgProfiles } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('organization_id', organizationId);
            const memberIds = orgProfiles?.map(p => p.user_id) || [];

            let query = supabase
                .from('reposiciones_banco')
                .select(`
                    *,
                    inventario_muestras (products (name), lote)
                `);

            if (memberIds.length > 0) {
                query = query.in('user_id', memberIds);
            }

            const { data, error } = await query.order('fecha_reposicion', { ascending: false });
            if (error) throw error;
            setReposiciones(data || []);
        } catch (error) {
            console.error("Error loading reposiciones:", error);
        }
    };

    const loadDispensaciones = async () => {
        if (!organizationId) return;
        try {
            const { data: orgProfiles } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('organization_id', organizationId);
            const memberIds = orgProfiles?.map(p => p.user_id) || [];

            let query = supabase
                .from('dispensacion_muestras')
                .select(`
                    *,
                    inventario_muestras (products (name), lote)
                `);

            if (memberIds.length > 0) {
                query = query.in('user_id', memberIds);
            }

            const { data, error } = await query.order('fecha_dispensacion', { ascending: false });
            if (error) throw error;
            setDispensaciones(data || []);
        } catch (error) {
            console.error("Error loading dispensaciones:", error);
        }
    };

    const loadDispensacionesPacientes = async () => {
        if (!organizationId) return;
        try {
            const { data: orgProfiles } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('organization_id', organizationId);
            const memberIds = orgProfiles?.map(p => p.user_id) || [];

            let query = supabase
                .from('dispensacion_pacientes')
                .select(`
                    *,
                    products (name),
                    health_centers (name)
                `);

            if (memberIds.length > 0) {
                query = query.in('user_id', memberIds);
            }

            const { data, error } = await query.order('fecha_dispensacion', { ascending: false });
            if (error) throw error;
            setDispensacionesPacientes(data || []);
        } catch (error) {
            console.error("Error loading patient dispensations:", error);
        }
    };

    const loadEntregasVisitas = async () => {
        if (!organizationId) return;
        try {
            const { data: orgProfiles } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('organization_id', organizationId);
            const memberIds = orgProfiles?.map(p => p.user_id) || [];

            // Fetch entrega_muestras without visits join to bypass foreign key cache issues
            let query = supabase
                .from('entrega_muestras')
                .select(`
                    id,
                    visit_id,
                    stock_muestra_id,
                    doctor_id,
                    cantidad_entregada,
                    fecha_entrega,
                    user_id
                `);

            if (memberIds.length > 0) {
                query = query.in('user_id', memberIds);
            }

            const { data: entregasData, error } = await query.order('fecha_entrega', { ascending: false });
            if (error) throw error;

            // Fetch inventario_muestras manually to map product details
            const { data: inventarioData } = await supabase
                .from('inventario_muestras')
                .select(`
                    id,
                    lote,
                    products ( name )
                `);

            const invMap = (inventarioData || []).reduce((acc: any, item: any) => {
                acc[item.id] = item;
                return acc;
            }, {});

            // Fetch doctors
            const { data: doctorsData } = await supabase
                .from('doctors')
                .select('id, name');

            const docMap = (doctorsData || []).reduce((acc: any, item: any) => {
                acc[item.id] = item;
                return acc;
            }, {});

            const mappedVisitas = (entregasData || []).map((ev: any) => {
                const doctorName = docMap[ev.doctor_id]?.name || 'Médico Desconocido';

                return {
                    id: ev.id,
                    fecha_entrega: ev.fecha_entrega,
                    cantidad_entregada: ev.cantidad_entregada,
                    inventario_muestras: invMap[ev.stock_muestra_id] || null,
                    visits: {
                        doctors: {
                            name: doctorName
                        }
                    }
                };
            });

            setEntregasVisitas(mappedVisitas);
        } catch (error) {
            console.error("Error loading visit sample deliveries:", error);
        }
    };

    const loadMateriales = async () => {
        if (!user || !organizationId) return;
        try {
            let query = supabase
                .from('materiales_promocionales')
                .select(`
                    *,
                    products (name)
                `);

            const { data: orgProfiles } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('organization_id', organizationId);
            const memberIds = orgProfiles?.map(p => p.user_id) || [];

            if (!canViewAllData) {
                if (isSupervisor && zoneId) {
                    const { data: zoneUsers } = await supabase
                        .from('user_roles')
                        .select('user_id')
                        .eq('zone_id', zoneId);
                    const userIds = zoneUsers?.map(u => u.user_id) || [];
                    if (userIds.length > 0) {
                        query = query.in('user_id', userIds);
                    } else {
                        query = query.eq('user_id', user.id);
                    }
                } else {
                    query = query.eq('user_id', user.id);
                }
            } else {
                if (adminFilters.userId && adminFilters.userId !== 'all') {
                    query = query.eq('user_id', adminFilters.userId);
                } else if (memberIds.length > 0) {
                    query = query.in('user_id', memberIds);
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            setMateriales(data || []);
        } catch (error) {
            console.error("Error loading promotional materials:", error);
            throw error;
        }
    };

    const loadDetalles = async (entregaId: string) => {
        try {
            const { data, error } = await supabase
                .from('detalle_entrega_banco')
                .select(`
                    *,
                    inventario_muestras (products (name), lote)
                `)
                .eq('entrega_banco_id', entregaId);
            if (error) throw error;
            setDetalles(data || []);
        } catch (error) {
            console.error("Error loading delivery details:", error);
        }
    };

    const getExpirationBadge = (fecha: string) => {
        const today = new Date();
        const expDate = new Date(fecha);
        const daysUntilExp = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExp < 0) {
            return <Badge variant="destructive" className="font-bold text-[9px] uppercase tracking-wider">Vencido</Badge>;
        } else if (daysUntilExp < 30) {
            return <Badge className="bg-orange-500 text-white font-bold text-[9px] uppercase tracking-wider">Próximo ({daysUntilExp}d)</Badge>;
        } else if (daysUntilExp < 90) {
            return <Badge className="bg-yellow-500 text-white font-bold text-[9px] uppercase tracking-wider">⚠️ {daysUntilExp} días</Badge>;
        }
        return <Badge className="bg-green-500 text-white font-bold text-[9px] uppercase tracking-wider">✓ {daysUntilExp} días</Badge>;
    };

    const stats = {
        inventario: inventario.reduce((acc, item) => acc + (item.cantidad_asignada || 0), 0),
        entregas: entregas.length,
        bancos: banks.length,
        proximosVencer: inventario.filter(i => {
            const days = Math.floor((new Date(i.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days < 30 && days >= 0;
        }).length
    };

    // CRUD Bank handlers
    const openCreateBankDialog = () => {
        setBankFormData({
            name: "",
            service_name: "",
            health_center_id: healthCenters[0]?.id || "",
            responsible_user_id: user?.id || ""
        });
        setIsEditing(false);
        setSelectedBank(null);
        setBankDialogOpen(true);
    };

    const openEditBankDialog = (bank: any) => {
        setSelectedBank(bank);
        setBankFormData({
            name: bank.name || "",
            service_name: bank.service_name || "",
            health_center_id: bank.health_center_id || "",
            responsible_user_id: bank.responsible_user_id || ""
        });
        setIsEditing(true);
        setBankDialogOpen(true);
    };

    const handleCreateOrUpdateBank = async () => {
        if (!bankFormData.name) {
            toast({ title: "Validación Fallida", description: "El nombre del banco es obligatorio.", variant: "destructive" });
            return;
        }

        try {
            const payload = {
                name: bankFormData.name,
                service_name: bankFormData.service_name || null,
                health_center_id: (bankFormData.health_center_id && bankFormData.health_center_id !== "none") ? bankFormData.health_center_id : null,
                responsible_user_id: bankFormData.responsible_user_id || user?.id || null
            };

            if (isEditing && selectedBank) {
                const { error } = await supabase
                    .from('sample_banks')
                    .update(payload)
                    .eq('id', selectedBank.id);
                if (error) throw error;
                toast({ title: "Actualización Exitosa", description: "Banco de muestras actualizado correctamente." });
            } else {
                const { error } = await supabase
                    .from('sample_banks')
                    .insert([payload]);
                if (error) throw error;
                toast({ title: "Creación Exitosa", description: "Banco de muestras registrado en la red." });
            }
            setBankDialogOpen(false);
            loadBanks();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteBank = async (bankId: string) => {
        try {
            const { error } = await supabase
                .from('sample_banks')
                .delete()
                .eq('id', bankId);
            if (error) throw error;
            toast({ title: "Eliminado", description: "El banco ha sido removido del sistema." });
            loadBanks();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    // CRUD Lote handlers
    const openCreateLoteDialog = () => {
        setLoteFormData({
            product_id: products[0]?.id || "",
            lote: "",
            fecha_fabricacion: "",
            fecha_vencimiento: "",
            cantidad_asignada: "0"
        });
        setLoteDialogOpen(true);
    };

    const handleCreateLote = async () => {
        if (!loteFormData.product_id || !loteFormData.lote || !loteFormData.fecha_vencimiento || parseInt(loteFormData.cantidad_asignada) <= 0) {
            toast({ title: "Validación Fallida", description: "Complete los campos obligatorios y asigne cantidad válida.", variant: "destructive" });
            return;
        }
        try {
            const { error } = await supabase.from('inventario_muestras').insert([{
                product_id: loteFormData.product_id,
                lote: loteFormData.lote,
                fecha_fabricacion: loteFormData.fecha_fabricacion || null,
                fecha_vencimiento: loteFormData.fecha_vencimiento,
                cantidad_asignada: parseInt(loteFormData.cantidad_asignada),
                user_id: user?.id
            }]);
            if (error) throw error;
            toast({ title: "Lote Creado", description: "El stock ha sido agregado a tu inventario." });
            setLoteDialogOpen(false);
            loadInventario();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    // CRUD Entrega handlers
    const openCreateEntregaDialog = () => {
        setEntregaFormData({
            health_center_id: healthCenters[0]?.id || "",
            servicio: "",
            jefe_servicio: "",
            fecha_entrega: new Date().toISOString().split('T')[0],
            entregado_por: `${user?.email}`
        });
        setEntregaDialogOpen(true);
    };

    const handleCreateEntrega = async () => {
        if (!entregaFormData.health_center_id || !entregaFormData.fecha_entrega) {
            toast({ title: "Validación Fallida", description: "Complete todos los campos obligatorios.", variant: "destructive" });
            return;
        }
        try {
            const { error } = await supabase.from('entregas_banco').insert([{
                health_center_id: entregaFormData.health_center_id,
                servicio: entregaFormData.servicio || null,
                jefe_servicio: entregaFormData.jefe_servicio || null,
                fecha_entrega: entregaFormData.fecha_entrega,
                entregado_por: entregaFormData.entregado_por || null,
                user_id: user?.id
            }]);
            if (error) throw error;
            toast({ title: "Entrega Registrada", description: "La entrega institucional ha sido registrada." });
            setEntregaDialogOpen(false);
            loadEntregas();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    // Bulk buttons logic
    const handleSync = async () => {
        try {
            setSyncing(true);
            await loadAllData();
            toast({ title: "Sincronización Exitosa", description: "Los datos de muestras están al día." });
        } catch (error: any) {
            toast({ title: "Error de Sincronización", description: error.message, variant: "destructive" });
        } finally {
            setSyncing(false);
        }
    };

    const handleEmptyAll = async () => {
        try {
            setSyncing(true);
            if (activeTab === "bancos") {
                const centerIds = healthCenters.map(hc => hc.id);
                if (centerIds.length === 0) return;
                const { error } = await supabase.from('sample_banks').delete().in('health_center_id', centerIds);
                if (error) throw error;
                toast({ title: "Limpieza Completada", description: "Se eliminaron todos los bancos de muestras." });
                loadBanks();
            } else if (activeTab === "inventario") {
                const { error } = await supabase.from('inventario_muestras').delete().eq('user_id', user?.id);
                if (error) throw error;
                toast({ title: "Limpieza Completada", description: "Se vació tu inventario de muestras." });
                loadInventario();
            } else if (activeTab === "entregas") {
                const { error } = await supabase.from('entregas_banco').delete().eq('user_id', user?.id);
                if (error) throw error;
                toast({ title: "Limpieza Completada", description: "Se eliminó el historial de entregas." });
                loadEntregas();
            }
        } catch (error: any) {
            toast({ title: "Error", description: `Error al vaciar: ${error.message}`, variant: "destructive" });
        } finally {
            setSyncing(false);
        }
    };

    const handleExport = () => {
        if (activeTab === "bancos") {
            const exportData = filteredBanks.map(b => ({
                Nombre: b.name,
                Servicio: b.service_name || '',
                "Centro de Salud": b.health_centers?.name || '',
                Responsable: b.profiles ? `${b.profiles.first_name || ''} ${b.profiles.last_name || ''}`.trim() : '',
                "Última Auditoría": b.last_audit_date ? new Date(b.last_audit_date).toLocaleDateString() : 'Nunca'
            }));
            exportToCSV(exportData, 'bancos_muestras');
        } else if (activeTab === "inventario") {
            const exportData = filteredInventario.map(i => ({
                Producto: i.products?.name || 'N/A',
                Lote: i.lote,
                "Fecha Fabricación": i.fecha_fabricacion ? new Date(i.fecha_fabricacion).toLocaleDateString() : 'N/A',
                "Fecha Vencimiento": new Date(i.fecha_vencimiento).toLocaleDateString(),
                Cantidad: i.cantidad_asignada
            }));
            exportToCSV(exportData, 'inventario_muestras');
        } else if (activeTab === "entregas") {
            const exportData = filteredEntregas.map(e => ({
                "Centro de Salud": e.health_centers?.name || 'N/A',
                Servicio: e.servicio || 'N/A',
                "Jefe de Servicio": e.jefe_servicio || 'N/A',
                Fecha: new Date(e.fecha_entrega).toLocaleDateString(),
                "Entregado Por": e.entregado_por || 'N/A'
            }));
            exportToCSV(exportData, 'entregas_centros');
        }
    };

    const handleImport = async (data: Record<string, any>[]) => {
        try {
            setImporting(true);
            if (activeTab === "bancos") {
                const itemsToInsert = data.map((row: any) => {
                    const name = row['Nombre'] || row['nombre'] || row['Name'] || '';
                    const serviceName = row['Servicio'] || row['servicio'] || row['Service'] || '';
                    
                    const centerName = row['Centro de Salud'] || row['centro_de_salud'] || row['Health Center'] || '';
                    const centerMatch = healthCenters.find(hc => hc.name.toLowerCase().trim() === centerName.toLowerCase().trim());
                    const healthCenterId = centerMatch ? centerMatch.id : null;

                    const respInfo = row['Responsable'] || row['responsable'] || row['Responsible'] || '';
                    const respMatch = members.find(m => m.name.toLowerCase().trim() === respInfo.toLowerCase().trim());
                    const responsibleUserId = respMatch ? respMatch.id : user?.id;

                    return {
                        name,
                        service_name: serviceName || null,
                        health_center_id: healthCenterId,
                        responsible_user_id: responsibleUserId
                    };
                }).filter(item => item.name);

                if (itemsToInsert.length > 0) {
                    const { error } = await supabase.from('sample_banks').insert(itemsToInsert);
                    if (error) throw error;
                    toast({ title: "Importación Exitosa", description: `Se importaron ${itemsToInsert.length} bancos de muestras.` });
                    loadBanks();
                }
            } else if (activeTab === "inventario") {
                const itemsToInsert = data.map((row: any) => {
                    const productName = row['Producto'] || row['producto'] || row['Product'] || '';
                    const prodMatch = products.find(p => p.name.toLowerCase().trim() === productName.toLowerCase().trim());
                    
                    return {
                        product_id: prodMatch ? prodMatch.id : null,
                        lote: row['Lote'] || row['lote'] || 'IMPORT-LOT',
                        fecha_fabricacion: row['Fabricacion'] || row['fabricacion'] || null,
                        fecha_vencimiento: row['Vencimiento'] || row['vencimiento'] || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                        cantidad_asignada: parseInt(row['Cantidad'] || row['cantidad'] || '10'),
                        user_id: user?.id
                    };
                }).filter(item => item.product_id);

                if (itemsToInsert.length > 0) {
                    const { error } = await supabase.from('inventario_muestras').insert(itemsToInsert);
                    if (error) throw error;
                    toast({ title: "Importación Exitosa", description: `Se importaron ${itemsToInsert.length} lotes de muestras.` });
                    loadInventario();
                }
            }
        } catch (error: any) {
            console.error('Error:', error);
            toast({ title: "Error", description: `Hubo un error importando los datos: ${error.message || 'Error desconocido'}`, variant: "destructive" });
        } finally {
            setImporting(false);
        }
    };

    // Filter lists
    const filteredBanks = banks.filter(b => 
        (b.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.health_centers?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.service_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInventario = inventario.filter(i => 
        (i.products?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.lote || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEntregas = entregas.filter(e => 
        (e.health_centers?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.servicio || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.entregado_por || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMateriales = materiales.filter(m => 
        (m.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.tipo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-20 font-display animate-in fade-in duration-700 text-foreground">
            {/* Header */}
            <EliteHeader
                title={t.samples_title || "Bancos de Muestras"}
                subtitle={t.samples_subtitle || "Monitoreo e Inventario Institucional"}
                icon={Package}
                badgeText="Logística"
                statusText={syncing ? "Sincronizando..." : "Sistema en línea"}
                statusColor={syncing ? "bg-amber-500" : "bg-emerald-500"}
                rightContent={
                    <div className="flex flex-wrap items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="bg-muted/10 border-border/40 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner hover:bg-muted/20 transition-all"
                        >
                            <Download className="mr-3 h-4 w-4 text-primary" /> Exportar
                        </Button>
                        <ImportDialog
                            onImport={handleImport}
                            title={`Importar ${activeTab === 'bancos' ? 'Bancos' : 'Lotes'}`}
                            description={`Selecciona un archivo Excel o CSV para importar ${activeTab === 'bancos' ? 'bancos de muestras' : 'lotes de muestras'}.`}
                            triggerText="Importar"
                            expectedColumns={[{ key: "Nombre", label: "Nombre", required: true }]}
                        />
                        <Button
                            variant="outline"
                            onClick={handleSync}
                            className="bg-muted/10 border-border/40 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner hover:bg-muted/20 transition-all"
                        >
                            <RefreshCw className={cn("mr-3 h-4 w-4 text-primary", syncing && "animate-spin")} /> Sincronizar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (window.confirm('¿Estás seguro de vaciar todos los registros de esta vista? Esta acción es irreversible.')) {
                                    handleEmptyAll();
                                }
                            }}
                            className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner"
                        >
                            Vaciar Todo
                        </Button>
                        {activeTab === "bancos" && (
                            <Button
                                onClick={openCreateBankDialog}
                                className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-premium-md font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Plus className="h-6 w-6" /> Nuevo Banco
                            </Button>
                        )}
                        {activeTab === "inventario" && (
                            <Button
                                onClick={openCreateLoteDialog}
                                className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-premium-md font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Plus className="h-6 w-6" /> Nuevo Lote
                            </Button>
                        )}
                        {activeTab === "entregas" && (
                            <Button
                                onClick={openCreateEntregaDialog}
                                className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-premium-md font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Plus className="h-6 w-6" /> Nueva Entrega
                            </Button>
                        )}
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <EliteKPICard
                    title="Bancos Activos"
                    value={stats.bancos}
                    icon={Building2}
                    color="indigo"
                />
                <EliteKPICard
                    title="Inventario total"
                    value={stats.inventario}
                    icon={Package}
                    color="primary"
                />
                <EliteKPICard
                    title="Entregas realizadas"
                    value={stats.entregas}
                    icon={Stethoscope}
                    color="success"
                />
                <EliteKPICard
                    title="Próximos a vencer"
                    value={stats.proximosVencer}
                    icon={AlertTriangle}
                    color="warning"
                />
            </div>

            {/* Admin Territory Filter */}
            <AdminDataFilter onFilterChange={(f) => setAdminFilters(f)} moduleType="contacts" />

            {/* Main Tabs Container */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <TabsList className="flex flex-wrap h-auto p-1 bg-muted/20 rounded-xl border border-border shadow-inner overflow-x-auto">
                    <TabsTrigger value="bancos" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4 uppercase tracking-widest">Bancos</TabsTrigger>
                    <TabsTrigger value="inventario" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4 uppercase tracking-widest">Inventario</TabsTrigger>
                    <TabsTrigger value="entregas" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4 uppercase tracking-widest">Entregas</TabsTrigger>
                    <TabsTrigger value="detalles" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4 uppercase tracking-widest">Detalles</TabsTrigger>
                    <TabsTrigger value="reposiciones" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4 uppercase tracking-widest">Reposiciones</TabsTrigger>
                    <TabsTrigger value="dispensacion" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4 uppercase tracking-widest">Dispensación</TabsTrigger>
                    <TabsTrigger value="pacientes" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4 uppercase tracking-widest">Pacientes</TabsTrigger>
                    <TabsTrigger value="visitas" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4 uppercase tracking-widest">Visitas</TabsTrigger>
                    <TabsTrigger value="materiales" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9 px-4 uppercase tracking-widest">Materiales</TabsTrigger>
                </TabsList>

                {/* SEARCH BAR */}
                <Card className="bg-card border border-border/40 rounded-[2.5rem] shadow-premium-sm p-6 relative overflow-hidden group/search">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                        <Input
                            placeholder="LOCALIZAR ACTIVO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-16 h-16 bg-muted/30 border-border focus-visible:ring-primary/20 font-black rounded-2xl text-foreground placeholder:text-muted-foreground/50 transition-all text-xs tracking-widest shadow-inner uppercase"
                        />
                    </div>
                </Card>

                {/* TAB bancos */}
                <TabsContent value="bancos" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-border shadow-premium-sm rounded-[2.5rem] overflow-hidden p-6 bg-card">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <CardTitle className="flex items-center text-sm font-black tracking-widest uppercase font-display">
                                <Building2 className="mr-3 h-6 w-6 text-primary" />
                                Red de Bancos de Muestras
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {filteredBanks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/5 rounded-[2rem] border border-dashed border-border/40">
                                    <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Sin Bancos de Muestras</h3>
                                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Crea o importa un banco para comenzar</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                                <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Banco / Institución</TableHead>
                                                <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Servicio / Dpto</TableHead>
                                                <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Responsable</TableHead>
                                                <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Última Auditoría</TableHead>
                                                <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6 text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredBanks.map((bank) => (
                                                <TableRow key={bank.id} className="border-b border-border/20 hover:bg-muted/50 transition-colors">
                                                    <TableCell className="py-6">
                                                        <div className="font-bold text-foreground text-sm">{bank.name}</div>
                                                        <div className="text-[10px] text-muted-foreground font-semibold mt-1">{bank.health_centers?.name || 'Centro Desconocido'}</div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-xs">{bank.service_name || 'N/A'}</TableCell>
                                                    <TableCell className="font-semibold text-xs text-primary">
                                                        {bank.profiles ? `${bank.profiles.first_name || ''} ${bank.profiles.last_name || ''}`.trim() : 'Sin Asignar'}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-xs text-muted-foreground">
                                                        {bank.last_audit_date ? new Date(bank.last_audit_date).toLocaleDateString() : 'Nunca'}
                                                    </TableCell>
                                                    <TableCell className="text-right py-6">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all" onClick={() => openEditBankDialog(bank)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 transition-all">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="text-2xl font-black text-foreground tracking-tight">¿Eliminar Banco?</AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-muted-foreground font-bold">Esta acción removerá "{bank.name}" del sistema institucional de forma permanente.</AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter className="mt-8 gap-3">
                                                                        <AlertDialogCancel className="h-12 rounded-[1rem] font-black text-[11px] uppercase tracking-widest">Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction className="h-12 rounded-[1rem] bg-rose-500 hover:bg-rose-600 font-black text-[11px] uppercase tracking-widest text-white" onClick={() => handleDeleteBank(bank.id)}>ELIMINAR AHORA</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB inventario */}
                <TabsContent value="inventario" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-border shadow-premium-sm rounded-[2.5rem] overflow-hidden p-6 bg-card">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <CardTitle className="flex items-center text-sm font-black tracking-widest uppercase font-display">
                                <Package className="mr-3 h-6 w-6 text-primary" />
                                Inventario de Muestras
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {filteredInventario.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground font-semibold">No hay muestras en inventario.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Lote</TableHead>
                                                <TableHead>Fabricación</TableHead>
                                                <TableHead>Vencimiento</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredInventario.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-muted/30">
                                                    <TableCell className="font-bold">{item.products?.name || 'N/A'}</TableCell>
                                                    <TableCell className="font-mono text-xs">{item.lote}</TableCell>
                                                    <TableCell className="font-semibold text-xs">
                                                        {item.fecha_fabricacion ? new Date(item.fecha_fabricacion).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-xs">{new Date(item.fecha_vencimiento).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-bold text-sm">{item.cantidad_asignada}</TableCell>
                                                    <TableCell>{getExpirationBadge(item.fecha_vencimiento)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB entregas */}
                <TabsContent value="entregas" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-border shadow-premium-sm rounded-[2.5rem] overflow-hidden p-6 bg-card">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <CardTitle className="flex items-center text-sm font-black tracking-widest uppercase font-display">
                                <Building2 className="mr-3 h-6 w-6 text-primary" />
                                Entregas a Centros de Salud
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {filteredEntregas.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground font-semibold">No hay entregas institucionales.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Centro de Salud</TableHead>
                                                <TableHead>Servicio / Especialidad</TableHead>
                                                <TableHead>Jefe de Servicio</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Entregado Por</TableHead>
                                                <TableHead className="text-right">Detalle</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredEntregas.map((entrega) => (
                                                <TableRow key={entrega.id} className="hover:bg-muted/30">
                                                    <TableCell className="font-bold">{entrega.health_centers?.name || 'N/A'}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{entrega.servicio || 'N/A'}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{entrega.jefe_servicio || 'N/A'}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{new Date(entrega.fecha_entrega).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{entrega.entregado_por || 'N/A'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-primary font-bold text-xs"
                                                            onClick={() => {
                                                                setSelectedEntregaId(entrega.id);
                                                                loadDetalles(entrega.id);
                                                                setActiveTab("detalles");
                                                            }}
                                                        >
                                                            Ver Items
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB detalles */}
                <TabsContent value="detalles" className="space-y-4">
                    <Card className="border-border shadow-premium-sm rounded-[2.5rem] overflow-hidden p-6 bg-card">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <CardTitle className="flex items-center text-sm font-black tracking-widest uppercase font-display">
                                <FileText className="mr-3 h-6 w-6 text-primary" />
                                Detalle de Entrega Seleccionada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {!selectedEntregaId ? (
                                <div className="text-center py-12 text-muted-foreground font-semibold uppercase text-xs tracking-widest">
                                    Seleccione una entrega en la pestaña "Entregas" para ver el desglose de productos.
                                </div>
                            ) : detalles.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground font-semibold">No se encontraron detalles para esta entrega.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Lote</TableHead>
                                                <TableHead>Cantidad Entregada</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {detalles.map((d) => (
                                                <TableRow key={d.id}>
                                                    <TableCell className="font-bold">{d.inventario_muestras?.products?.name || 'N/A'}</TableCell>
                                                    <TableCell className="font-mono text-xs">{d.inventario_muestras?.lote || 'N/A'}</TableCell>
                                                    <TableCell className="font-bold text-sm text-primary">{d.cantidad_inicial}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB reposiciones */}
                <TabsContent value="reposiciones" className="space-y-4">
                    <Card className="border-border shadow-premium-sm rounded-[2.5rem] overflow-hidden p-6 bg-card">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <CardTitle className="flex items-center text-sm font-black tracking-widest uppercase font-display">
                                <RotateCcw className="mr-3 h-6 w-6 text-primary" />
                                Reposiciones Realizadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {reposiciones.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground font-semibold">No hay reposiciones registradas.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Lote</TableHead>
                                                <TableHead>Cantidad Repuesta</TableHead>
                                                <TableHead>Fecha Reposición</TableHead>
                                                <TableHead>Responsable</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reposiciones.map((rep) => (
                                                <TableRow key={rep.id}>
                                                    <TableCell className="font-bold">{rep.inventario_muestras?.products?.name || 'N/A'}</TableCell>
                                                    <TableCell className="font-mono text-xs">{rep.inventario_muestras?.lote || 'N/A'}</TableCell>
                                                    <TableCell className="font-bold text-sm text-primary">{rep.cantidad_repuesta}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{new Date(rep.fecha_reposicion).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{rep.usuario_reposicion || 'N/A'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB dispensacion */}
                <TabsContent value="dispensacion" className="space-y-4">
                    <Card className="border-border shadow-premium-sm rounded-[2.5rem] overflow-hidden p-6 bg-card">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <CardTitle className="flex items-center text-sm font-black tracking-widest uppercase font-display">
                                <Package2 className="mr-3 h-6 w-6 text-primary" />
                                Dispensación Institucional
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {dispensaciones.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground font-semibold">No hay dispensaciones institucionales registradas.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Lote</TableHead>
                                                <TableHead>Fecha Dispensación</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Entregado A</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dispensaciones.map((disp) => (
                                                <TableRow key={disp.id}>
                                                    <TableCell className="font-bold">{disp.inventario_muestras?.products?.name || 'N/A'}</TableCell>
                                                    <TableCell className="font-mono text-xs">{disp.inventario_muestras?.lote || 'N/A'}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{new Date(disp.fecha_dispensacion).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-bold text-sm text-rose-500">-{disp.cantidad_dispensada}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{disp.entregado_a || 'N/A'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB pacientes */}
                <TabsContent value="pacientes" className="space-y-4">
                    <Card className="border-border shadow-premium-sm rounded-[2.5rem] overflow-hidden p-6 bg-card">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <CardTitle className="flex items-center text-sm font-black tracking-widest uppercase font-display">
                                <Users className="mr-3 h-6 w-6 text-primary" />
                                Dispensación Directa a Pacientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {dispensacionesPacientes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground font-semibold">No hay entregas a pacientes registradas.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Paciente</TableHead>
                                                <TableHead>Cédula / ID</TableHead>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Centro</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Fecha</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dispensacionesPacientes.map((dp) => (
                                                <TableRow key={dp.id}>
                                                    <TableCell className="font-bold">{dp.nombre_paciente}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{dp.cedula || 'N/A'}</TableCell>
                                                    <TableCell className="font-bold text-xs">{dp.products?.name || 'N/A'}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{dp.health_centers?.name || 'N/A'}</TableCell>
                                                    <TableCell className="font-bold text-sm text-indigo-500">{dp.cantidad_dispensada}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{new Date(dp.fecha_dispensacion).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB visitas */}
                <TabsContent value="visitas" className="space-y-4">
                    <Card className="border-border shadow-premium-sm rounded-[2.5rem] overflow-hidden p-6 bg-card">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <CardTitle className="flex items-center text-sm font-black tracking-widest uppercase font-display">
                                <Stethoscope className="mr-3 h-6 w-6 text-primary" />
                                Entregas en Visitas Médicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {entregasVisitas.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground font-semibold">No hay entregas en visitas médicas.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Médico</TableHead>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Lote</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Fecha</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {entregasVisitas.map((ev) => (
                                                <TableRow key={ev.id}>
                                                    <TableCell className="font-bold">{ev.visits?.doctors?.name || 'Médico'}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{ev.inventario_muestras?.products?.name || 'N/A'}</TableCell>
                                                    <TableCell className="font-mono text-xs">{ev.inventario_muestras?.lote || 'N/A'}</TableCell>
                                                    <TableCell className="font-bold text-sm text-emerald-500">{ev.cantidad_entregada}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{new Date(ev.fecha_entrega).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB materiales */}
                <TabsContent value="materiales" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-border shadow-premium-sm rounded-[2.5rem] overflow-hidden p-6 bg-card">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <CardTitle className="flex items-center text-sm font-black tracking-widest uppercase font-display">
                                <Gift className="mr-3 h-6 w-6 text-primary" />
                                Materiales Promocionales (POP)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {filteredMateriales.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground font-semibold">No hay materiales promocionales registrados.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Asociado a Producto</TableHead>
                                                <TableHead>Disponible</TableHead>
                                                <TableHead>Inicial</TableHead>
                                                <TableHead>Fecha Recepción</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredMateriales.map((material) => (
                                                <TableRow key={material.id}>
                                                    <TableCell className="font-bold">{material.nombre}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{material.tipo || 'N/A'}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{material.products?.name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={material.cantidad_disponible > 0 ? "default" : "destructive"}>
                                                            {material.shadow_disponible !== undefined ? material.shadow_disponible : material.cantidad_disponible}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-xs">{material.cantidad_inicial}</TableCell>
                                                    <TableCell className="font-semibold text-xs">
                                                        {material.fecha_recepcion ? new Date(material.fecha_recepcion).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* CREATE / EDIT BANK DIALOG */}
            <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 bg-card text-foreground max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">{isEditing ? "Actualizar Banco" : "Nuevo Banco de Muestras"}</DialogTitle>
                        <DialogDescription className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Configure los parámetros del almacén institucional.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Nombre del Banco</Label>
                            <Input value={bankFormData.name} onChange={(e) => setBankFormData({ ...bankFormData, name: e.target.value })} placeholder="Ej: Banco de Muestras Oncológico" className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Servicio / Departamento / Ala</Label>
                            <Input value={bankFormData.service_name} onChange={(e) => setBankFormData({ ...bankFormData, service_name: e.target.value })} placeholder="Ej: Cardiología - Piso 2" className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Centro de Salud Vinculado</Label>
                            <Select value={bankFormData.health_center_id} onValueChange={(val) => setBankFormData({ ...bankFormData, health_center_id: val })}>
                                <SelectTrigger className="h-12 bg-muted/30 border-border rounded-xl">
                                    <SelectValue placeholder="Seleccione Hospital..." />
                                </SelectTrigger>
                                 <SelectContent className="rounded-xl">
                                    <SelectItem value="none" className="font-bold text-xs text-muted-foreground">Ninguno (No Vincular)</SelectItem>
                                    {healthCenters.map(hc => (
                                        <SelectItem key={hc.id} value={hc.id} className="font-bold text-xs">{hc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Visitador / Operador Asignado</Label>
                            <Select value={bankFormData.responsible_user_id} onValueChange={(val) => setBankFormData({ ...bankFormData, responsible_user_id: val })}>
                                <SelectTrigger className="h-12 bg-muted/30 border-border rounded-xl">
                                    <SelectValue placeholder="Seleccione Responsable..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {members.map(m => (
                                        <SelectItem key={m.id} value={m.id} className="font-bold text-xs">{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="h-12 rounded-[1rem] font-black text-[11px] uppercase tracking-widest" onClick={() => setBankDialogOpen(false)}>Cancelar</Button>
                        <Button className="h-12 rounded-[1rem] bg-primary text-white font-black text-[11px] uppercase tracking-widest" onClick={handleCreateOrUpdateBank}>{isEditing ? "Guardar" : "Crear"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CREATE LOTE DIALOG */}
            <Dialog open={loteDialogOpen} onOpenChange={setLoteDialogOpen}>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 bg-card text-foreground max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Agregar Lote de Muestras</DialogTitle>
                        <DialogDescription className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Cargue stock inicial a su maletín operativo.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Producto</Label>
                            <Select value={loteFormData.product_id} onValueChange={(val) => setLoteFormData({ ...loteFormData, product_id: val })}>
                                <SelectTrigger className="h-12 bg-muted/30 border-border rounded-xl">
                                    <SelectValue placeholder="Seleccione Producto..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="font-bold text-xs">{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Código de Lote</Label>
                            <Input value={loteFormData.lote} onChange={(e) => setLoteFormData({ ...loteFormData, lote: e.target.value })} placeholder="Ej: B-9988-EXP" className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Fabricación</Label>
                                <Input type="date" value={loteFormData.fecha_fabricacion} onChange={(e) => setLoteFormData({ ...loteFormData, fecha_fabricacion: e.target.value })} className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Vencimiento</Label>
                                <Input type="date" value={loteFormData.fecha_vencimiento} onChange={(e) => setLoteFormData({ ...loteFormData, fecha_vencimiento: e.target.value })} className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Cantidad Cargada</Label>
                            <Input type="number" value={loteFormData.cantidad_asignada} onChange={(e) => setLoteFormData({ ...loteFormData, cantidad_asignada: e.target.value })} placeholder="Ej: 100" className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 rounded-xl" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="h-12 rounded-[1rem] font-black text-[11px] uppercase tracking-widest" onClick={() => setLoteDialogOpen(false)}>Cancelar</Button>
                        <Button className="h-12 rounded-[1rem] bg-primary text-white font-black text-[11px] uppercase tracking-widest" onClick={handleCreateLote}>Guardar Lote</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CREATE ENTREGA DIALOG */}
            <Dialog open={entregaDialogOpen} onOpenChange={setEntregaDialogOpen}>
                <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 bg-card text-foreground max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Nueva Entrega Institucional</DialogTitle>
                        <DialogDescription className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Registre una entrega física a un hospital o clínica.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Destinatario (Centro Médico)</Label>
                            <Select value={entregaFormData.health_center_id} onValueChange={(val) => setEntregaFormData({ ...entregaFormData, health_center_id: val })}>
                                <SelectTrigger className="h-12 bg-muted/30 border-border rounded-xl">
                                    <SelectValue placeholder="Seleccione Hospital..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {healthCenters.map(hc => (
                                        <SelectItem key={hc.id} value={hc.id} className="font-bold text-xs">{hc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Servicio / Especialidad</Label>
                            <Input value={entregaFormData.servicio} onChange={(e) => setEntregaFormData({ ...entregaFormData, servicio: e.target.value })} placeholder="Ej: Pediatría" className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Jefe de Servicio</Label>
                            <Input value={entregaFormData.jefe_servicio} onChange={(e) => setEntregaFormData({ ...entregaFormData, jefe_servicio: e.target.value })} placeholder="Ej: Dr. Alejandro López" className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Fecha Entrega</Label>
                                <Input type="date" value={entregaFormData.fecha_entrega} onChange={(e) => setEntregaFormData({ ...entregaFormData, fecha_entrega: e.target.value })} className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Entregado Por</Label>
                                <Input value={entregaFormData.entregado_por} onChange={(e) => setEntregaFormData({ ...entregaFormData, entregado_por: e.target.value })} placeholder="Nombre" className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 rounded-xl" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="h-12 rounded-[1rem] font-black text-[11px] uppercase tracking-widest" onClick={() => setEntregaDialogOpen(false)}>Cancelar</Button>
                        <Button className="h-12 rounded-[1rem] bg-primary text-white font-black text-[11px] uppercase tracking-widest" onClick={handleCreateEntrega}>Registrar Entrega</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
