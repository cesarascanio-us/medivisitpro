/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Building2, AlertTriangle, CheckCircle, Search, User, Calendar, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDemoData } from "@/contexts/MockDataProvider";

interface InventoryDetail {
    product_id: string;
    quantity: number;
    min_stock_alert: number;
    products: { name: string };
}

interface BankSummary {
    id: string;
    name: string;
    service_name: string;
    last_audit_date: string | null;
    health_centers: { name: string };
    bank_inventory: InventoryDetail[];
    profiles?: { first_name: string; last_name: string }; // Responsible person
}

export function BankSupervisorDashboard() {
    const [banks, setBanks] = useState<BankSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<BankSummary | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const demoData = useDemoData();

    useEffect(() => {
        loadBanks();
    }, [demoData]);

    const loadBanks = async () => {
        setLoading(true);

        if (demoData) {
            console.log("BankSupervisorDashboard: Loading demo banks");
            // Simulate the join structure expected by the component
            const demoBanks = (demoData.sampleBanks || []).map(bank => ({
                ...bank,
                bank_inventory: (demoData.bankInventory || []).filter(item => item.bank_id === bank.id),
                profiles: { first_name: "Usuario", last_name: "Demo" }
            }));
            // @ts-expect-error - Demo data typing
            setBanks(demoBanks);
            setLoading(false);
            return;
        }

        // Fetch all banks, inventory, and responsible person profile
        const { data, error } = await supabase
            .from('sample_banks')
            .select(`
                id,
                name,
                service_name,
                last_audit_date,
                health_centers ( name ),
                bank_inventory ( quantity, min_stock_alert, products ( name ) ),
                responsible_user_id
            `);

        if (error) {
            console.error("Error loading banks:", error);
        } else {
            // @ts-expect-error - Supabase join typing
            setBanks(data || []);
        }
        setLoading(false);
    };

    const getBankStatus = (inventory: InventoryDetail[]) => {
        const lowStockItems = inventory.filter(i => i.quantity <= (i.min_stock_alert || 10));
        if (lowStockItems.length > 0) {
            return {
                status: 'attention',
                label: `${lowStockItems.length} Productos Bajos`,
                color: 'destructive'
            };
        }
        return {
            status: 'ok',
            label: 'Stock Óptimo',
            color: 'success'
        };
    };

    const filteredBanks = banks.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.health_centers?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Header Tools */}
            <div className="flex items-center gap-4 bg-background p-4 rounded-lg border">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por Banco, Institución o Servicio..."
                        className="pl-8 w-full md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Supervisión Global de Bancos
                    </CardTitle>
                    <CardDescription>
                        Monitoreo de stock y auditorías en tiempo real de todos los bancos institucionales.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando datos globales...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Banco / Institución</TableHead>
                                    <TableHead>Responsable</TableHead>
                                    <TableHead>Última Auditoría</TableHead>
                                    <TableHead>Estatus de Stock</TableHead>
                                    <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBanks.map(bank => {
                                    const { status, label, color } = getBankStatus(bank.bank_inventory);
                                    const responsibleName = bank.responsible_user_id ? 'Usuario Asignado' : 'Sin Asignar';

                                    return (
                                        <TableRow key={bank.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedBank(bank)}>
                                            <TableCell>
                                                <div className="font-medium">{bank.name}</div>
                                                <div className="text-xs text-muted-foreground">{bank.health_centers?.name}</div>
                                                <div className="text-xs text-muted-foreground ">{bank.service_name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    {responsibleName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {bank.last_audit_date
                                                        ? new Date(bank.last_audit_date).toLocaleDateString()
                                                        : <span className="text-amber-600">Nunca</span>
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={color === 'destructive' ? 'destructive' : 'default'} className={color === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                    {status === 'attention' ? <AlertTriangle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                                    {label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBank(bank);
                                                }}>
                                                    Ver Detalle
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={!!selectedBank} onOpenChange={(open) => !open && setSelectedBank(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedBank?.name}</DialogTitle>
                        <DialogDescription>
                            {selectedBank?.health_centers?.name} - {selectedBank?.service_name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Inventario Detallado</h4>
                        <div className="border rounded-md max-h-[400px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Cantidad</TableHead>
                                        <TableHead className="text-right">Min. Alerta</TableHead>
                                        <TableHead className="text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedBank?.bank_inventory.map((item, idx) => {
                                        const isLow = item.quantity <= (item.min_stock_alert || 10);
                                        return (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{item.products?.name}</TableCell>
                                                <TableCell className={`text-right ${isLow ? 'text-destructive font-bold' : ''}`}>
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">{item.min_stock_alert || 10}</TableCell>
                                                <TableCell className="text-center">
                                                    {isLow ? (
                                                        <Badge variant="destructive" className="text-xs">Bajo Stock</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-xs text-nowrap">
                                                            OK
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    {selectedBank?.bank_inventory.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                                Este banco no tiene productos asignados aún.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
