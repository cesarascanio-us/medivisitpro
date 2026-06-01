/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, ShoppingCart, Plus, Trash2, FileText, Send, Save, Package, User, Building2, AlertCircle, ChevronsUpDown, Check } from "lucide-react";
import { CartItem } from "@/types/commercial";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function OrderBuilder() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [mode, setMode] = useState<'quote' | 'order'>('order');
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const location = useLocation();

    // Contact Selection
    const [contacts, setContacts] = useState<any[]>([]);
    const [openContactCombobox, setOpenContactCombobox] = useState(false);
    const [selectedContact, setSelectedContact] = useState<any | null>(null);

    // Header Data (Legacy support)
    const [clientName, setClientName] = useState("");
    const [clientId, setClientId] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
        loadContacts();
    }, []);

    // Effect to handle navigation state from Visits
    useEffect(() => {
        if (location.state?.initialContact) {
            const initial = location.state.initialContact;
            // Immediate set if we trust the passed object, rendering "Seleccionar..." obsolete immediately
            setSelectedContact(initial);
            setClientName(initial.name);
            setClientId(initial.id);
            setOpenContactCombobox(false); // Ensure dropdown is closed
        }
    }, [location.state]);

    const loadContacts = async () => {
        try {
            const { data } = await supabase
                .from('contacts')
                .select('*')
                .order('name');
            setContacts(data || []);
        } catch (error) {
            console.error("Error loading contacts", error);
        }
    };

    const loadProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('name');
        setProducts(data || []);
    };

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.product_id === product.id);
            if (existing) {
                return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, {
                product_id: product.id,
                product_name: product.name,
                unit_price: product.price || 0,
                quantity: 1,
                discount: 0,
                bonus: 0
            }];
        });
        toast({ title: "Agregado", description: `${product.name} añadido al carrito.` });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.product_id === id) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i.product_id !== id));
    };

    const filteredProducts = products.filter(p => {
        // Text Search
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.active_ingredients?.some((i: string) => i.toLowerCase().includes(searchTerm.toLowerCase()));

        // Specialty Filter
        let matchesSpecialty = true;
        if (selectedContact && selectedContact.contact_type === 'doctor' && selectedContact.specialty) {
            // Check if product has specialties defined
            if (p.medical_specialties) {
                // p.medical_specialties is likely a comma-separated string or array depending on implementation
                // Based on previous step, it's stored as a string "Spec1, Spec2"
                const productSpecialties = p.medical_specialties.split(',').map((s: string) => s.trim().toLowerCase());
                const doctorSpecialty = selectedContact.specialty.trim().toLowerCase();

                // If product has specialties, it must match the doctor's specialty
                // If product has NO specialties, it might be general purpose (optional: decide to show or hide)
                // Assuming: strict filtering -> product must list the specialty
                matchesSpecialty = productSpecialties.includes(doctorSpecialty);
            }
            // If product has no medical_specialties field, we verify if we should show it? 
            // For now, let's assume if no specialties are listed on product, it's visible to all or none. 
            // Better safe: if product is specialized, filter. If generic (null), show.
            if (p.medical_specialties && p.medical_specialties.length > 0) {
                const productSpecialties = p.medical_specialties.split(',').map((s: string) => s.trim().toLowerCase());
                const doctorSpecialty = selectedContact.specialty.trim().toLowerCase();
                matchesSpecialty = productSpecialties.includes(doctorSpecialty);
            }
        }

        return matchesSearch && matchesSpecialty;
    });

    const calculateTotal = () => {
        return cart.reduce((acc, item) => {
            const itemTotal = item.quantity * item.unit_price * (1 - (item.discount / 100));
            return acc + itemTotal;
        }, 0);
    };

    const handleSave = async () => {
        if (!clientName) {
            toast({ title: "Faltan datos", description: "Ingresa el nombre del cliente", variant: "destructive" });
            return;
        }
        if (cart.length === 0) {
            toast({ title: "Carrito vacío", description: "Agrega productos antes de guardar", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            if (mode === 'quote') {
                // Save Quote
                const { data: quote, error: qError } = await supabase
                    .from('quotes')
                    .insert({
                        user_id: user.id,
                        pharmacy_name: clientName,
                        contact_id: clientId,
                        total_amount: calculateTotal(),
                        status: 'draft'
                    })
                    .select()
                    .single();

                if (qError) throw qError;

                // Save Items
                const items = cart.map(i => ({
                    quote_id: quote.id,
                    product_id: i.product_id,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                    discount: i.discount
                }));

                const { error: iError } = await supabase.from('quote_items').insert(items);
                if (iError) throw iError;

                toast({ title: "Cotización Guardada", description: "Se ha guardado correctamente como borrador." });
            } else {
                // Save Order (Transfer)
                // Note: Logic simplified for 'OrderBuilder'. Full logic usually in TransferOrders.tsx with Drugstore selection.
                // Here we just create the 'transfer_order' drafts.

                const { data: order, error: oError } = await (supabase
                    .from('transfer_orders' as any)
                    .insert({
                        user_id: user.id,
                        pharmacy_name: clientName,
                        contact_id: clientId,
                        status: 'pending',
                        order_type: 'direct_sale',
                        total: calculateTotal(),
                        products: cart // Legacy JSONB support
                    })
                    .select()
                    .single()) as any;

                if (oError) throw oError;

                // Save Detailed Items
                const items = cart.map(i => ({
                    transfer_order_id: order.id,
                    product_id: i.product_id,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                    bonus_units: i.bonus,
                    subtotal: i.quantity * i.unit_price
                }));

                const { error: iError } = await supabase.from('transfer_order_items').insert(items);
                if (iError) throw iError;

                toast({ title: "Pedido Guardado", description: "Se ha generado el pedido correctamente." });
            }
            // Clear or Redirect
            setCart([]);
            setClientName("");
        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
            {/* Left: Product Catalog */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
                <Card className="flex-1 flex flex-col min-h-0">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle>Catálogo</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar producto..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pt-0">
                        {selectedContact && selectedContact.contact_type === 'doctor' && (
                            <Alert className="mb-4 bg-blue-50 border-blue-200 text-slate-900">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-800">Filtrado por Especialidad</AlertTitle>
                                <AlertDescription className="text-blue-700 text-xs">
                                    Mostrando productos para <strong>{selectedContact.specialty}</strong>.
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredProducts.length === 0 ? (
                                <div className="col-span-2 text-center py-8 text-muted-foreground">
                                    <p>No se encontraron productos.</p>
                                    {selectedContact?.contact_type === 'doctor' && (
                                        <p className="text-xs mt-1">Intenta con otra búsqueda o contacta a soporte si falta un producto para esta especialidad.</p>
                                    )}
                                </div>
                            ) : (
                                filteredProducts.map(product => (
                                    <div key={product.id} className="border rounded-lg p-3 hover:border-blue-400 transition-colors bg-card shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-sm line-clamp-2 text-foreground">{product.name}</h4>
                                                <span className="font-bold text-green-600 text-sm">${product.price}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                                {product.medical_specialties || product.active_ingredients?.join(', ') || product.category}
                                            </p>
                                            {product.medical_specialties && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {product.medical_specialties.split(',').slice(0, 2).map((s: string, idx: number) => (
                                                        <Badge key={idx} variant="outline" className="text-[10px] px-1 h-5">{s.trim()}</Badge>
                                                    ))}
                                                    {product.medical_specialties.split(',').length > 2 && (
                                                        <Badge variant="outline" className="text-[10px] px-1 h-5">+{product.medical_specialties.split(',').length - 2}</Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => addToCart(product)}>
                                            <Plus className="h-4 w-4 mr-2" /> Agregar
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Cart / Builder */}
            <div className="w-full lg:w-[450px] flex flex-col gap-4">
                <Card className="h-full flex flex-col shadow-lg border-blue-100">
                    <CardHeader className="bg-slate-50 border-b pb-4 text-slate-900">
                        <div className="flex justify-between items-center mb-4">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-blue-600" />
                                {mode === 'quote' ? 'Cotizador' : 'Pedido'}
                            </CardTitle>
                            <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-[180px]">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="quote">Cotizar</TabsTrigger>
                                    <TabsTrigger value="order">Pedido</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div className="space-y-2">
                            <Popover open={openContactCombobox} onOpenChange={setOpenContactCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openContactCombobox}
                                        className="w-full justify-between"
                                    >
                                        {selectedContact ? (
                                            <div className="flex items-center gap-2 truncate">
                                                {selectedContact.contact_type === 'doctor' ? (
                                                    <User className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <Building2 className="h-4 w-4 text-green-500" />
                                                )}
                                                <span className="truncate">{selectedContact.name}</span>
                                                {selectedContact.contact_type === 'doctor' && (
                                                    <span className="text-muted-foreground text-xs ml-1">({selectedContact.specialty})</span>
                                                )}
                                            </div>
                                        ) : (
                                            "Seleccionar Cliente..."
                                        )}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[350px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Buscar médico o farmacia..." />
                                        <CommandList>
                                            <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                                            <CommandGroup heading="Médicos">
                                                {contacts.filter(c => c.contact_type === 'doctor').map((contact) => (
                                                    <CommandItem
                                                        key={contact.id}
                                                        value={contact.name}
                                                        onSelect={() => {
                                                            setSelectedContact(contact);
                                                            setClientName(contact.name);
                                                            setClientId(contact.id);
                                                            setOpenContactCombobox(false);
                                                            setCart([]); // Clear cart on client change to avoid invalid products
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedContact?.id === contact.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        <div className="flex flex-col">
                                                            <span>{contact.name}</span>
                                                            <span className="text-xs text-muted-foreground">{contact.specialty}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                            <CommandGroup heading="Farmacias">
                                                {contacts.filter(c => c.contact_type === 'pharmacy').map((contact) => (
                                                    <CommandItem
                                                        key={contact.id}
                                                        value={contact.name}
                                                        onSelect={() => {
                                                            setSelectedContact(contact);
                                                            setClientName(contact.name);
                                                            setClientId(contact.id);
                                                            setOpenContactCombobox(false);
                                                            setCart([]); // Clear cart
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedContact?.id === contact.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        {contact.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {/* Hidden Input for backward compatibility or direct edit if needed, currently reusing clientName state but UI controlled by Select */}
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-0">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <Package className="h-12 w-12 mb-3 opacity-20" />
                                <p>El carrito está vacío</p>
                                <p className="text-sm">Selecciona productos del catálogo</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50%]">Producto</TableHead>
                                        <TableHead className="text-center">Cant.</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-[30px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.map(item => (
                                        <TableRow key={item.product_id}>
                                            <TableCell className="py-2">
                                                <div className="font-medium text-xs">{item.product_name}</div>
                                                <div className="text-xs text-muted-foreground">${item.unit_price}</div>
                                            </TableCell>
                                            <TableCell className="text-center py-2">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, -1)}>-</Button>
                                                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, 1)}>+</Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right py-2 text-sm font-semibold">
                                                ${(item.quantity * item.unit_price).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => removeFromCart(item.product_id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>

                    <div className="p-4 bg-slate-50 border-t text-slate-900">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-muted-foreground">Total Estimado</span>
                            <span className="text-2xl font-bold text-foreground">${calculateTotal().toFixed(2)}</span>
                        </div>
                        <Button className="w-full h-12 text-lg font-bold gap-2 btn-medical" onClick={handleSave} disabled={loading}>
                            {loading ? 'Guardando...' : (
                                <>
                                    <Save className="h-5 w-5" />
                                    {mode === 'quote' ? 'Guardar Cotización' : 'Confirmar Pedido'}
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
