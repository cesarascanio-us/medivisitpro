import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PackagePlus, Trash2, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Material {
    id: string;
    name: string;
}

interface Profile {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
}

interface AssignmentItem {
    material_id: string;
    material_name: string;
    quantity: number;
}

export function POPAssignmentManager() {
    const { user, isMaster, isAdmin, isManager, isSupervisor, role } = useAuth();
    const { toast } = useToast();

    const [recipients, setRecipients] = useState<Profile[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<string>("");
    const [selectedMaterial, setSelectedMaterial] = useState<string>("");
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

        const { data: rolesData } = await supabase
            .from('user_roles')
            .select('user_id, role')
            .in('role', rolesToLoad)
            .eq('is_active', true);

        if (rolesData && rolesData.length > 0) {
            const userIds = rolesData.map(r => r.user_id);
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('user_id, first_name, last_name, email')
                .in('user_id', userIds);

            if (profilesData) {
                const combined = profilesData.map((profile: any) => {
                    const roleInfo = rolesData.find(r => r.user_id === profile.user_id);
                    return { ...profile, role: roleInfo?.role || 'representative' };
                });
                // Sort: supervisors first (if present), then representatives
                combined.sort((a, b) => {
                    if (a.role === 'supervisor' && b.role !== 'supervisor') return -1;
                    if (a.role !== 'supervisor' && b.role === 'supervisor') return 1;
                    return 0;
                });
                setRecipients(combined as any);
            }
        }

        // Load Materials
        const { data: matData } = await (supabase as any)
            .from('pop_materials')
            .select('id, name')
            .eq('is_active', true)
            .order('name');

        if (matData) setMaterials(matData);
    };

    const handleAddItem = () => {
        if (!selectedMaterial || quantity <= 0) return;

        const material = materials.find(m => m.id === selectedMaterial);
        if (!material) return;

        const exists = items.find(i => i.material_id === selectedMaterial);
        if (exists) {
            setItems(items.map(i => i.material_id === selectedMaterial ? { ...i, quantity: i.quantity + quantity } : i));
        } else {
            setItems([...items, { material_id: selectedMaterial, material_name: material.name, quantity }]);
        }

        setSelectedMaterial("");
        setQuantity(0);
    };

    const handleRemoveItem = (materialId: string) => {
        setItems(items.filter(i => i.material_id !== materialId));
    };

    const handleSubmit = async () => {
        if (!selectedRecipient || items.length === 0) {
            toast({ title: "Error", description: "Selecciona destinatario y agrega materiales.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // Create assignment
            const { data: assignment, error: assignError } = await (supabase as any)
                .from('pop_assignments')
                .insert([{
                    created_by: user?.id,
                    representative_id: selectedRecipient,
                    status: 'pending'
                }])
                .select('id')
                .single();

            if (assignError) throw assignError;

            // Create items
            const itemsPayload = items.map(item => ({
                assignment_id: assignment.id,
                material_id: item.material_id,
                quantity: item.quantity
            }));

            const { error: itemsError } = await (supabase as any)
                .from('pop_assignment_items')
                .insert(itemsPayload);

            if (itemsError) throw itemsError;

            // Create notification for recipient
            const itemsCount = items.length;
            const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
            await supabase
                .from('notifications')
                .insert([{
                    user_id: selectedRecipient,
                    title: 'Material POP Asignado',
                    message: `Se te ha asignado ${totalQuantity} unidades de ${itemsCount} material${itemsCount > 1 ? 'es' : ''} POP. Revisa y acepta en el módulo Material POP.`,
                    notification_type: 'info',
                    category: 'assignment',
                    priority: 'normal',
                    is_read: false,
                    action_url: '/material-pop'
                }]);

            toast({
                title: "Asignación Enviada",
                description: "El material POP ha sido asignado correctamente.",
                className: "bg-green-50 border-green-200"
            });

            setItems([]);
            setSelectedRecipient("");

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
                        Nueva Asignación POP
                    </CardTitle>
                    <CardDescription>
                        Selecciona un destinatario y los materiales a enviar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Asignar a</Label>
                        <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar destinatario..." />
                            </SelectTrigger>
                            <SelectContent>
                                {recipients.map((r: any) => (
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
                        <h4 className="text-sm font-medium">Agregar Materiales</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Material</Label>
                                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Material..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materials.map(m => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
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
                        <Button variant="secondary" size="sm" onClick={handleAddItem} className="w-full" disabled={!selectedMaterial || quantity <= 0}>
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
                                    <TableHead>Material</TableHead>
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
                                        <TableRow key={item.material_id}>
                                            <TableCell>{item.material_name}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveItem(item.material_id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <Button onClick={handleSubmit} disabled={loading || items.length === 0 || !selectedRecipient} className="w-full btn-medical">
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
