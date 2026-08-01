/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { inventoryService } from "@/services/inventoryService";
import { useAuth } from "@/hooks/useAuth";
import { useBankAudit, useBankInventory, useBanks, useInventoryMovement, useRepInventory } from "@/hooks/queries/useInventoryQueries"; // Import hooks
import { Building2, ClipboardCheck, AlertCircle, PackagePlus, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Bank {
    id: string;
    name: string;
    service_name: string;
    health_centers: { name: string };
    last_audit_date: string;
}

interface BankItem {
    id: string;
    product_id: string;
    quantity: number;
    min_stock_alert: number;
    products: { name: string };
}

import { useDemoData } from "@/contexts/MockDataProvider";

export function BankManager() {
    const { user, isMaster, canManageBanks } = useAuth();
    const { toast } = useToast();
    const demoData = useDemoData();

    // State
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [auditOpen, setAuditOpen] = useState(false);
    const [auditValues, setAuditValues] = useState<Record<string, number>>({});
    const [depositOpen, setDepositOpen] = useState(false);
    const [selectedDepositProduct, setSelectedDepositProduct] = useState<string>("");
    const [depositQuantity, setDepositQuantity] = useState<number>(1);

    // Editing State
    const [editingBank, setEditingBank] = useState<Bank | null>(null);
    const [editName, setEditName] = useState("");
    const [editService, setEditService] = useState("");

    // Queries
    const { data: banks = [], isLoading: loadingBanks } = useBanks(user?.id);
    const { data: inventory = [], isLoading: loadingInventory } = useBankInventory(selectedBank?.id || '');
    const { data: myInventory = [] } = useRepInventory(user?.id || '');

    // Mutations
    const auditMutation = useBankAudit();
    const movementMutation = useInventoryMovement();

    useEffect(() => {
        // Auto-select first bank if none selected? Or just wait for user.
        // Existing logic didn't auto-select usually.
    }, [banks]);

    // --- ACCIONES --- //

    const handleAuditSubmit = () => {
        if (!selectedBank) return;

        if (demoData) {
            toast({ title: "Auditoría Simulada", description: "En modo demo los consumos no se guardan en BD." });
            setAuditOpen(false);
            return;
        }

        const updates = [];
        for (const item of inventory) {
            const physicalCount = auditValues[item.id];
            if (physicalCount !== undefined) {
                const consumption = item.quantity - physicalCount;
                if (consumption > 0) {
                    updates.push({
                        user_id: user?.id,
                        product_id: item.product_id,
                        bank_id: selectedBank.id,
                        quantity: consumption,
                        movement_type: 'bank_audit_consumption',
                        notes: `Auditoría: Sistema (${item.quantity}) vs Físico (${physicalCount})`
                    });
                }
            }
        }

        auditMutation.mutate({ bankId: selectedBank.id, movements: updates }, {
            onSuccess: () => {
                toast({ title: "Auditoría Guardada", description: "Se han registrado los consumos." });
                setAuditOpen(false);
                setAuditValues({});
            },
            onError: () => {
                toast({ title: "Error", description: "Fallo al guardar auditoría", variant: "destructive" });
            }
        });
    };

    const handleDepositSubmit = () => {
        if (!selectedBank || !selectedDepositProduct) return;

        if (demoData) {
            toast({ title: "Depósito Simulado", description: "En modo demo el stock no se descuenta de tu maletín." });
            setDepositOpen(false);
            return;
        }

        movementMutation.mutate({
            user_id: user!.id,
            product_id: selectedDepositProduct,
            bank_id: selectedBank.id,
            quantity: depositQuantity,
            movement_type: 'bank_deposit',
            notes: 'Reposición de Stock a Banco'
        }, {
            onSuccess: () => {
                toast({ title: "Depósito Exitoso", description: "Stock transferido al banco." });
                setDepositOpen(false);
                setDepositQuantity(1);
                setSelectedDepositProduct("");
            },
            onError: (e: any) => {
                toast({ title: "Error", description: e.message || "Fallo al depositar stock", variant: "destructive" });
            }
        });
    };

    const handleCreateBank = async () => {
        if (demoData) {
            toast({ title: "Modo Demo", description: "No puedes crear bancos nuevos en el modo demostración." });
            return;
        }
        if (!user) return;
        try {
            // Fetch a default health center for the demo bank
            const { data: center } = await supabase.from('health_centers').select('id').limit(1).single();
            const healthCenterId = center?.id;

            if (!healthCenterId) {
                throw new Error("No hay centros de salud disponibles para asignar el banco.");
            }

            await inventoryService.createBank({
                name: 'Banco de Muestras - Cardiología',
                service_name: 'Cardiología Intervencionista',
                health_center_id: healthCenterId,
                responsible_user_id: user.id
            });

            toast({ title: "Banco Asignado", description: "Se ha creado y asignado un banco de prueba." });
            // The hook useBanks will automatically refresh if it reacts to the mutation (though here we call service directly)
            // But since it's Demo, we don't care about the refresh as much as not crashing.
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error al crear banco",
                description: error.message || error.error_description || "Ocurrió un error desconocido.",
                variant: "destructive"
            });
        }
    };

    const handleUpdateBank = async () => {
        if (!editingBank) return;
        if (demoData) {
            toast({ title: "Modo Demo", description: "No puedes editar bancos en el modo demostración." });
            setEditingBank(null);
            return;
        }
        try {
            const { error } = await supabase
                .from('sample_banks')
                .update({ name: editName, service_name: editService })
                .eq('id', editingBank.id);

            if (error) throw error;

            toast({ title: "Banco Actualizado", description: "Los cambios se han guardado." });
            setEditingBank(null);
            if (selectedBank?.id === editingBank.id) {
                setSelectedBank({ ...selectedBank, name: editName, service_name: editService });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteBank = async (bankId: string) => {
        if (demoData) {
            toast({ title: "Modo Demo", description: "No puedes eliminar bancos en el modo demostración." });
            return;
        }
        try {
            const { error } = await supabase
                .from('sample_banks')
                .delete()
                .eq('id', bankId);

            if (error) throw error;

            toast({ title: "Banco Eliminado", description: "El banco ha sido removido correctamente." });
            if (selectedBank?.id === bankId) setSelectedBank(null);
        } catch (error: any) {
            toast({ title: "Error al eliminar", description: error.message || "Verifique que el banco no tenga stock activo.", variant: "destructive" });
        }
    };

    const openEditDialog = (bank: Bank, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingBank(bank);
        setEditName(bank.name);
        setEditService(bank.service_name);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Mis Bancos a Cargo
                </h2>
                {(canManageBanks || isMaster) && (
                    <Button variant="outline" size="sm" onClick={handleCreateBank} className="border-dashed">
                        + Asignar Banco
                    </Button>
                )}
            </div>

            {banks.length === 0 && (
                <div className="text-center py-8 bg-muted/20 rounded-lg border-2 border-dashed">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium">No tienes bancos asignados</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 mb-4">
                        Ponte en contacto con tu Administrador para que te asigne un Banco de Muestras en tu territorio.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banks.map(bank => (
                    <Card key={bank.id} className={`cursor-pointer transition-colors relative group ${selectedBank?.id === bank.id ? 'border-primary bg-primary/5' : ''}`} onClick={() => setSelectedBank(bank)}>
                        <CardHeader>
                            <CardTitle className="text-base flex justify-between pr-8">
                                {bank.name}
                            </CardTitle>
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={(e) => openEditDialog(bank, e)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción eliminará el banco "{bank.name}" y su historial.
                                                Si tiene inventario activo, podría requerir vaciarlo primero.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteBank(bank.id)}>
                                                Eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{bank.health_centers?.name}</p>
                            <p className="text-sm text-muted-foreground">{bank.service_name}</p>
                            <p className="text-xs mt-2 text-muted-foreground">
                                Última Auditoría: {bank.last_audit_date ? new Date(bank.last_audit_date).toLocaleDateString() : 'Nunca'}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingBank} onOpenChange={(open) => !open && setEditingBank(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Banco</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre del Banco</label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ej: Banco Oncología" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Servicio / Departamento</label>
                            <Input value={editService} onChange={(e) => setEditService(e.target.value)} placeholder="Ej: Piso 3 - Ala Norte" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingBank(null)}>Cancelar</Button>
                        <Button onClick={handleUpdateBank}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {selectedBank && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Inventario: {selectedBank.name}</CardTitle>
                        <div className="flex gap-2">
                            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2 border-green-600 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20">
                                        <PackagePlus className="h-4 w-4" />
                                        Depositar Stock
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Reponer Stock en {selectedBank.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Producto (Desde mi Maletín)</label>
                                            <select
                                                className="w-full border rounded-md p-2"
                                                value={selectedDepositProduct}
                                                onChange={(e) => {
                                                    setSelectedDepositProduct(e.target.value);
                                                    setDepositQuantity(1);
                                                }}
                                            >
                                                <option value="">Seleccionar producto...</option>
                                                {myInventory.map(p => (
                                                    <option key={p.product_id} value={p.product_id}>
                                                        {p.products.name} (Disp: {p.quantity})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {selectedDepositProduct && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Cantidad a Depositar</label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={myInventory.find(p => p.product_id === selectedDepositProduct)?.quantity || 1}
                                                    value={depositQuantity}
                                                    onChange={(e) => setDepositQuantity(parseInt(e.target.value))}
                                                />
                                            </div>
                                        )}
                                        <Button onClick={handleDepositSubmit} className="w-full bg-green-600 hover:bg-green-700" disabled={!selectedDepositProduct}>
                                            Confirmar Depósito
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <ClipboardCheck className="h-4 w-4" />
                                        Realizar Auditoría
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>Auditoría de Banco: {selectedBank.name}</DialogTitle>
                                    </DialogHeader>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="w-[120px]">Sistema</TableHead>
                                                <TableHead className="w-[120px]">Conteo Físico</TableHead>
                                                <TableHead className="w-[120px]">Consumo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inventory.map(item => {
                                                const physical = auditValues[item.id] ?? item.quantity;
                                                const diff = item.quantity - physical;
                                                return (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{item.products?.name}</TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={auditValues[item.id] ?? item.quantity}
                                                                onChange={(e) => setAuditValues({ ...auditValues, [item.id]: parseInt(e.target.value) || 0 })}
                                                                className="h-8"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {diff > 0 ? (
                                                                <span className="text-red-500 font-bold">-{diff}</span>
                                                            ) : diff < 0 ? (
                                                                <span className="text-blue-500">+{Math.abs(diff)}</span>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline" onClick={() => setAuditOpen(false)}>Cancelar</Button>
                                        <Button onClick={handleAuditSubmit}>Confirmar Auditoría</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Stock Actual</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventory.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.products?.name}</TableCell>
                                        <TableCell className="font-mono text-lg">{item.quantity}</TableCell>
                                        <TableCell>
                                            {item.quantity <= item.min_stock_alert && (
                                                <div className="flex items-center text-red-500 text-xs gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Reponer
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
