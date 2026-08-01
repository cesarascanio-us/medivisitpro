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
import { Briefcase, Search, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDemoData } from "@/contexts/MockDataProvider";

interface RepSummary {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    inventory_items: number;
    last_update: string;
}

interface InventoryItem {
    product_name: string;
    quantity: number;
    updated_at: string;
}

export function RepSupervisorDashboard() {
    const [reps, setReps] = useState<RepSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRep, setSelectedRep] = useState<RepSummary | null>(null);
    const [repInventory, setRepInventory] = useState<InventoryItem[]>([]);
    const demoData = useDemoData();

    useEffect(() => {
        loadReps();
    }, [demoData]);

    const loadReps = async () => {
        setLoading(true);

        if (demoData) {
            console.log("RepSupervisorDashboard: Loading demo reps");
            const demoReps = [
                {
                    id: 'demo-user-1',
                    first_name: 'Representante',
                    last_name: 'Uno',
                    email: 'rep1@demo.com',
                    inventory_items: 5,
                    last_update: new Date().toLocaleDateString()
                },
                {
                    id: 'demo-user-2',
                    first_name: 'Representante',
                    last_name: 'Dos',
                    email: 'rep2@demo.com',
                    inventory_items: 8,
                    last_update: new Date().toLocaleDateString()
                }
            ];
            setReps(demoReps);
            setLoading(false);
            return;
        }

        // Get all profiles first (simplified approach)
        const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name, email');

        if (!profiles) {
            setLoading(false);
            return;
        }

        // For each, count inventory items (inefficient for large scale, but works for MVP)
        // A better approach would be a view or a join if relations were simpler
        const summaries: RepSummary[] = [];

        for (const profile of profiles) {
            const { count, data } = await supabase
                .from('rep_inventory')
                .select('updated_at', { count: 'exact' })
                .eq('user_id', profile.user_id)
                .gt('quantity', 0); // Active items

            // Get latest update if any
            let lastUpdate = "-";
            if (data && data.length > 0) {
                // Sort locally or query properly above
                // Simplifying: just taking current date if has items, ideally fetch max(updated_at)
                lastUpdate = new Date().toLocaleDateString();
            }

            summaries.push({
                id: profile.user_id,
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || '',
                inventory_items: count || 0,
                last_update: lastUpdate
            });
        }

        setReps(summaries);
        setLoading(false);
    };

    const loadRepDetail = async (repId: string) => {
        if (demoData) {
            console.log("RepSupervisorDashboard: Loading demo rep detail");
            const items = (demoData.inventory || []).map((d: any) => ({
                product_name: d.products?.name,
                quantity: d.quantity,
                updated_at: new Date().toISOString()
            }));
            setRepInventory(items);
            return;
        }

        const { data } = await supabase
            .from('rep_inventory')
            .select(`
                quantity,
                updated_at,
                products ( name )
            `)
            .eq('user_id', repId)
            .order('quantity', { ascending: false });

        if (data) {
            const items = data.map((d: any) => ({
                product_name: d.products?.name,
                quantity: d.quantity,
                updated_at: d.updated_at
            }));
            setRepInventory(items);
        }
    };

    const handleSelectRep = async (rep: RepSummary) => {
        setSelectedRep(rep);
        await loadRepDetail(rep.id);
    };

    const filteredReps = reps.filter(r =>
        (r.first_name + ' ' + r.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 bg-background p-4 rounded-lg border">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar representante..."
                        className="pl-8 w-full md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Inventario Global de Representantes
                    </CardTitle>
                    <CardDescription>
                        Supervisa el stock actual en posesión de cada visitador.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-center">Items en Maletín</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell>
                                </TableRow>
                            ) : filteredReps.map(rep => (
                                <TableRow key={rep.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelectRep(rep)}>
                                    <TableCell className="font-medium">{rep.first_name} {rep.last_name}</TableCell>
                                    <TableCell>{rep.email}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={rep.inventory_items > 0 ? "bg-blue-500/10 text-blue-400" : ""}>
                                            {rep.inventory_items} Productos
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Ver Maletín
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedRep} onOpenChange={(o) => !o && setSelectedRep(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Maletín: {selectedRep?.first_name} {selectedRep?.last_name}</DialogTitle>
                        <DialogDescription>Detalle de productos en posesión.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 max-h-[400px] overflow-y-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                    <TableHead className="text-right">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {repInventory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Maletín Vacío</TableCell>
                                    </TableRow>
                                ) : (
                                    repInventory.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{item.product_name}</TableCell>
                                            <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                {item.quantity < 10 ? (
                                                    <Badge variant="destructive" className="text-xs">Bajo</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-400 bg-green-500/10 border-green-500/20 text-xs">OK</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
