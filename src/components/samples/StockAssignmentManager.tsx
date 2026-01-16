import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PackagePlus, User, Search, Trash2, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Product {
    id: string;
    name: string;
}

interface Profile {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface AssignmentItem {
    product_id: string;
    product_name: string;
    quantity: number;
}

export function StockAssignmentManager() {
    const { user, isMaster, isAdmin, isManager, isSupervisor, role } = useAuth();
    const { toast } = useToast();

    const [reps, setReps] = useState<Profile[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedRep, setSelectedRep] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(0);
    const [items, setItems] = useState<AssignmentItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Check if user can assign to supervisors (only master, admin, manager)
    const canAssignToSupervisors = isMaster || isAdmin || isManager;

    useEffect(() => {
        loadData();
    }, [role]);

    const loadData = async () => {
        // Determine which roles to load based on current user's role
        const rolesToLoad = canAssignToSupervisors
            ? ['representative', 'supervisor']
            : ['representative'];  // Supervisors only see representatives

        const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('user_id, role')
            .in('role', rolesToLoad)
            .eq('is_active', true);

        if (rolesError) {
            console.error('Error loading roles:', rolesError);
        }

        // Get profiles for those user_ids
        if (rolesData && rolesData.length > 0) {
            const userIds = rolesData.map(r => r.user_id);
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('user_id, first_name, last_name, email')
                .in('user_id', userIds);

            if (profilesError) {
                console.error('Error loading profiles:', profilesError);
            }

            if (profilesData) {
                // Combine profile data with role info
                const combined = profilesData.map((profile: any) => {
                    const roleInfo = rolesData.find(r => r.user_id === profile.user_id);
                    return {
                        ...profile,
                        role: roleInfo?.role || 'representative'
                    };
                });
                // Sort: supervisors first (if present), then representatives
                combined.sort((a, b) => {
                    if (a.role === 'supervisor' && b.role !== 'supervisor') return -1;
                    if (a.role !== 'supervisor' && b.role === 'supervisor') return 1;
                    return 0;
                });
                setReps(combined as any);
            }
        }

        // Load Products
        const { data: prodData } = await supabase
            .from('products')
            .select('id, name')
            .order('name');

        if (prodData) setProducts(prodData);
    };

    const handleAddItem = () => {
        if (!selectedProduct || quantity <= 0) return;

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        // Check if already added
        const exists = items.find(i => i.product_id === selectedProduct);
        if (exists) {
            setItems(items.map(i => i.product_id === selectedProduct ? { ...i, quantity: i.quantity + quantity } : i));
        } else {
            setItems([...items, { product_id: selectedProduct, product_name: product.name, quantity }]);
        }

        setSelectedProduct("");
        setQuantity(0);
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(i => i.product_id !== id));
    };

    const handleSubmit = async () => {
        if (!user || !selectedRep || items.length === 0) return;
        setLoading(true);

        try {
            // 1. Create Assignment Header
            const { data: assignment, error: assignError } = await supabase
                .from('sample_assignments')
                .insert({
                    representative_id: selectedRep,
                    created_by: user.id,
                    status: 'pending',
                    notes: 'Asignación de Stock por Gerencia'
                })
                .select()
                .single();

            if (assignError) throw assignError;

            // 2. Create Items
            const itemsPayload = items.map(item => ({
                assignment_id: assignment.id,
                product_id: item.product_id,
                quantity: item.quantity
            }));

            const { error: itemsError } = await supabase
                .from('assignment_items')
                .insert(itemsPayload);

            if (itemsError) throw itemsError;

            // 3. Create notification for recipient
            const itemsCount = items.length;
            const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
            await supabase
                .from('notifications')
                .insert([{
                    user_id: selectedRep,
                    title: 'Muestras Médicas Asignadas',
                    message: `Se te han asignado ${totalQuantity} unidades de ${itemsCount} producto${itemsCount > 1 ? 's' : ''}. Revisa y acepta en el módulo Muestras.`,
                    notification_type: 'info',
                    category: 'assignment',
                    priority: 'normal',
                    is_read: false,
                    action_url: '/muestras'
                }]);

            toast({
                title: "Asignación Enviada",
                description: "El representante recibirá la notificación para aceptar el stock.",
                className: "bg-green-50 border-green-200"
            });

            // Reset
            setItems([]);
            setSelectedRep("");

        } catch (error) {
            console.error("Assignment error:", error);
            toast({ title: "Error", description: "No se pudo crear la asignación.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PackagePlus className="h-5 w-5 text-primary" />
                        Nueva Asignación
                    </CardTitle>
                    <CardDescription>
                        Selecciona un representante y los productos a enviar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Asignar a</Label>
                        <Select value={selectedRep} onValueChange={setSelectedRep}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar destinatario..." />
                            </SelectTrigger>
                            <SelectContent>
                                {reps.map((r: any) => (
                                    <SelectItem key={r.user_id} value={r.user_id}>
                                        <span className="flex items-center gap-2">
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${r.role === 'supervisor' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {r.role === 'supervisor' ? 'SUP' : 'REP'}
                                            </span>
                                            {r.first_name || ''} {r.last_name || ''} {!r.first_name && !r.last_name && r.email}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border bg-muted/20 p-4 rounded-md space-y-4">
                        <h4 className="text-sm font-medium">Agregar Productos</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Producto</Label>
                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Producto..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Cantidad</Label>
                                <Input
                                    type="number"
                                    className="h-9"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleAddItem} className="w-full" disabled={!selectedProduct || quantity <= 0}>
                            Agregar a la lista
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resumen de Envío</CardTitle>
                    <CardDescription>
                        Verifica los ítems antes de enviar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md min-h-[200px] mb-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Cant.</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            Lista vacía
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map(item => (
                                        <TableRow key={item.product_id}>
                                            <TableCell>{item.product_name}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveItem(item.product_id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <Button onClick={handleSubmit} disabled={loading || items.length === 0 || !selectedRep} className="w-full btn-medical">
                        {loading ? "Enviando..." : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Confirmar Asignación
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
