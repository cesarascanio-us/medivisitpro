/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, Minus, AlertTriangle, CheckCircle2, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ProductSamplesDialogProps {
  trigger: React.ReactNode;
  productData: any;
}

export function ProductSamplesDialog({ trigger, productData }: ProductSamplesDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState("request");
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState("");
  const [selectedContact, setSelectedContact] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);

  // Inventory State
  const [inventory, setInventory] = useState(0);
  const [movements, setMovements] = useState<any[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open && user && productData?.id) {
      fetchInventoryData();
      fetchContacts();
    }
  }, [open, user, productData]);

  const fetchContacts = async () => {
    const { data } = await supabase.from('contacts').select('id, name, specialty').eq('user_id', user?.id);
    if (data) setContacts(data);
  };

  const fetchInventoryData = async () => {
    try {
      // 1. Get Current Inventory
      const { data: invData, error: invError } = await supabase
        .from('product_inventory')
        .select('quantity')
        .eq('user_id', user?.id)
        .eq('product_id', productData.id)
        .maybeSingle(); // Use maybeSingle to avoid error if not found

      if (!invError) {
        setInventory(invData?.quantity || 0);
      }

      // 2. Get Recent Movements
      const { data: movData, error: movError } = await supabase
        .from('inventory_movements')
        .select('*, contacts(name)')
        .eq('user_id', user?.id)
        .eq('product_id', productData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!movError && movData) {
        setMovements(movData);
      }

    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let quantityChange = 0;
      let type = selectedAction;
      let contactId = null;

      if (selectedAction === "request" || selectedAction === "inventory") {
        quantityChange = quantity; // Adding stock
      } else if (selectedAction === "distribute") {
        quantityChange = -quantity; // Removing stock
        contactId = selectedContact;

        if (quantity > inventory) {
          throw new Error("No hay suficiente inventario disponible.");
        }
      }

      // 1. Insert Movement Log
      const { error: movError } = await supabase.from('inventory_movements').insert({
        user_id: user.id,
        product_id: productData.id,
        quantity_change: quantityChange,
        movement_type: type,
        contact_id: contactId,
        notes: notes
      });

      if (movError) throw movError;

      // 2. Update/Upsert Inventory
      // First check if row exists to decide insert vs update, 
      // or simpler: use upsert with onConflict if unique constraint exists.
      // We have UNIQUE(user_id, product_id).

      // Calculate new total. Since we might not have a row yet, we careful.
      const newTotal = Math.max(0, inventory + quantityChange);

      const { error: invError } = await supabase
        .from('product_inventory')
        .upsert({
          user_id: user.id,
          product_id: productData.id,
          quantity: newTotal,
          last_updated: new Date().toISOString()
        }, { onConflict: 'user_id, product_id' });

      if (invError) throw invError;

      toast({
        title: "Operación exitosa",
        description: `Inventario actualizado. Nuevo total: ${newTotal}`,
      });

      // Refresh data
      fetchInventoryData();

      // If it was a distribution, maybe clear form but keep dialog open?
      // Or close dialog.
      if (selectedAction === 'distribute') {
        setSelectedContact("");
      }
      setNotes("");

    } catch (error: any) {
      console.error("Error in transaction:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la solicitud.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-slate-900 px-8 py-6 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Package className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight m-0 uppercase">Inventario de Muestras</DialogTitle>
              <p className="text-indigo-200/50 text-[10px] font-black uppercase tracking-widest mt-1">{productData.name}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Inventory Summary */}
          <div className="grid grid-cols-2 gap-4 px-8 pt-6">
            <div className="text-center p-6 bg-indigo-50/50 border border-indigo-100 rounded-[1.5rem] group hover:bg-white transition-all">
              <div className="text-3xl font-black text-indigo-600 tracking-tighter mb-1">{inventory}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stock Disponible</div>
            </div>
            <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] group hover:bg-white transition-all">
              <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{movements.length}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Operaciones Mes</div>
            </div>
          </div>

          <Separator />

          {/* Action Selection */}
          <div>
            <Label className="text-base font-semibold">Acción a realizar</Label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="request">Solicitar/Ingresar Stock</SelectItem>
                <SelectItem value="distribute">Entregar a Médico</SelectItem>
                <SelectItem value="adjustment">Ajuste de Inventario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {(selectedAction === "request" || selectedAction === "inventory") && (
              <div className="bg-indigo-50 p-4 rounded-xl text-xs font-bold text-indigo-700 border border-indigo-100 flex items-center mb-2">
                <Plus className="h-4 w-4 mr-2" />
                Esta acción SUMARÁ unidades al inventario maestro.
              </div>
            )}

            {selectedAction === "distribute" && (
              <div className="bg-amber-50 p-4 rounded-xl text-xs font-bold text-amber-700 border border-amber-100 flex items-center mb-2">
                <Minus className="h-4 w-4 mr-2" />
                Esta acción RESTARÁ unidades del inventario personal.
              </div>
            )}

            <div className="space-y-4">
              {selectedAction === "distribute" && (
                <div>
                  <Label htmlFor="doctor">Médico destinatario</Label>
                  <Select value={selectedContact} onValueChange={setSelectedContact} required>
                    <SelectTrigger id="doctor" className="mt-2">
                      <SelectValue placeholder="Seleccionar médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} - {c.specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="quantity">Cantidad</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 5))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-24 text-center"
                    min="1"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 5)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas / Referencia</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={selectedAction === 'request' ? "Ej. Pedido mensual #123" : "Notas opcionales..."}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
              <Button type="submit" disabled={loading} className="btn-medical">
                {loading ? "Procesando..." : "Confirmar Operación"}
              </Button>
            </div>
          </form>

          <Separator />

          {/* Recent History */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Historial Reciente</h3>
            <div className="space-y-2">
              {movements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No hay movimientos registrados.</p>
              ) : (
                movements.map((mov) => (
                  <div key={mov.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
                    <div className="flex items-center space-x-3">
                      {mov.quantity_change > 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                      ) : (
                        <Minus className="h-4 w-4 text-slate-400" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {mov.movement_type === 'distribute' && mov.contacts
                            ? `Entregado a: ${mov.contacts.name}`
                            : mov.movement_type === 'request'
                              ? "Ingreso de Stock"
                              : "Ajuste"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(mov.created_at).toLocaleDateString()} - {mov.notes || "Sin notas"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={mov.quantity_change > 0 ? "secondary" : "outline"}>
                      {mov.quantity_change > 0 ? "+" : ""}{mov.quantity_change} un.
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
