/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useRef } from "react";
import { Search, Plus, Filter, User, MapPin, Phone, Mail, Star, Download, Trash2, Upload, HelpCircle, FileSpreadsheet, Leaf as LeafIcon, Edit, RefreshCw, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionStatus } from "@/hooks/useOrganization";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ContactDialog } from "@/components/contacts/ContactDialog";
import { useContacts, type Contact } from "@/hooks/useContacts";
import { VisitDetailDialog } from "@/components/visits/VisitDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from "@/utils/exportUtils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from 'xlsx';
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { cn } from "@/lib/utils";

export default function Contacts() {
  const [importing, setImporting] = useState(false);
  const { user, organizationId } = useAuth();
  const { planTier } = useSubscriptionStatus();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adminFilters, setAdminFilters] = useState<any>({});
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { contacts, loading, refresh } = useContacts({
    searchTerm,
    typeFilter,
    adminFilters
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async (contact: any) => {
    try {
      const table = contact.source || 'contacts';
      const id = contact.id;
      if (!id) throw new Error("ID de contacto inválido");

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId);

      if (error) throw error;
      toast({ title: "Contacto eliminado", description: "El contacto ha sido eliminado correctamente." });
      refresh();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({ title: "Error", description: "No se pudo eliminar el contacto.", variant: "destructive" });
    }
  }

  const triggerImport = () => fileInputRef.current?.click();

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (!jsonData || jsonData.length === 0) throw new Error("El archivo está vacío.");

          const doctorsToInsert: any[] = [];
          const pharmaciesToInsert: any[] = [];
          const hcToInsert: any[] = [];
          const drugstoresToInsert: any[] = [];
          const commercesToInsert: any[] = [];
          const naturalStoresToInsert: any[] = [];
          const genericContactsToInsert: any[] = [];

          jsonData.forEach((row: any) => {
            const type = (row['Tipo'] || row['tipo'] || 'doctor').toLowerCase();
            const baseData = {
              user_id: user?.id,
              organization_id: organizationId,
              name: row['Nombre'] || row['nombre'] || row['Name'],
              address: row['Direccion'] || row['direccion'] || row['Address'] || null,
              city: row['Ciudad'] || row['ciudad'] || row['City'] || null,
              phone: row['Telefono'] || row['telefono'] || row['Phone'] || null,
              email: row['Email'] || row['email'] || null,
              status: 'Activo'
            };
            if (!baseData.name) return;

            if (type === 'doctor') {
              doctorsToInsert.push({ ...baseData, specialty: row['Especialidad'] || row['especialidad'] || null, potential: 'Medio' });
            } else if (type === 'pharmacy') {
              pharmaciesToInsert.push({ ...baseData, potential: 'Medio' });
            } else if (type === 'health_center' || type === 'hospital' || type === 'clinica') {
              hcToInsert.push({ ...baseData, potential: 'Medio' });
            } else if (type === 'drugstore' || type === 'drogueria') {
              drugstoresToInsert.push({ ...baseData, potential: 'Medio' });
            } else if (type === 'commerce' || type === 'comercio') {
              commercesToInsert.push({ ...baseData, potential: 'Medio' });
            } else if (type === 'natural_store' || type === 'tienda_naturista') {
              naturalStoresToInsert.push({ ...baseData, potential: 'Medio' });
            } else {
              genericContactsToInsert.push({ ...baseData, contact_type: type });
            }
          });

          const total = doctorsToInsert.length + pharmaciesToInsert.length + hcToInsert.length + drugstoresToInsert.length + commercesToInsert.length + naturalStoresToInsert.length + genericContactsToInsert.length;
          if (total === 0) throw new Error("No se encontraron contactos válidos.");

          const promises = [];
          if (doctorsToInsert.length > 0) promises.push(supabase.from('doctors').insert(doctorsToInsert));
          if (pharmaciesToInsert.length > 0) promises.push(supabase.from('pharmacies').insert(pharmaciesToInsert));
          if (hcToInsert.length > 0) promises.push(supabase.from('health_centers').insert(hcToInsert));
          if (drugstoresToInsert.length > 0) promises.push(supabase.from('drugstores').insert(drugstoresToInsert));
          if (commercesToInsert.length > 0) promises.push(supabase.from('commerces').insert(commercesToInsert));
          if (naturalStoresToInsert.length > 0) promises.push(supabase.from('natural_stores').insert(naturalStoresToInsert));
          if (genericContactsToInsert.length > 0) promises.push(supabase.from('contacts').insert(genericContactsToInsert));

          await Promise.all(promises);
          toast({ title: "Importación exitosa", description: `Se han importado ${total} contactos correctamente en sus canales respectivos.` });
          refresh();
        } catch (error: any) {
          toast({ title: "Error de Importación", description: error.message, variant: "destructive" });
        } finally {
          setImporting(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setImporting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500 text-white shadow-soft'; 
      case 'medium': return 'bg-amber-400 text-white shadow-soft';
      case 'low': return 'bg-emerald-400 text-white shadow-soft';
      default: return 'bg-slate-200 text-slate-500';
    }
  };

  const isFreePlan = planTier === 'free';
  const hasReachedLimit = isFreePlan && contacts.length >= 50;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx, .xls, .csv" className="hidden" />

      {/* Premium Header */}
      <Card className="glass-card border-none rounded-[2.5rem] shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="mesh-gradient-primary px-8 py-10 text-white relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-background/10 rounded-full -mr-40 -mt-40 blur-[100px] pointer-events-none"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-background/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl transform hover:rotate-2 transition-transform">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1 drop-shadow-sm leading-none">NETWORK MASTER</p>
                  <h1 className="text-4xl font-black tracking-tight drop-shadow-lg leading-none">Directorio Médico</h1>
                  <p className="text-white/40 text-[9px] font-black mt-1.5 uppercase tracking-[0.2em]  opacity-60 leading-none">Red Médica & Comercial Pro</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ContactDialog
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  trigger={
                    <Button disabled={hasReachedLimit} className="bg-card text-primary hover:bg-background/90 h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95">
                      <Plus className="mr-2 h-5 w-5" />
                      Añadir Contacto
                    </Button>
                  }
                  onContactSaved={refresh}
                />
                <Button variant="ghost" onClick={triggerImport} disabled={importing} className="h-14 w-14 rounded-2xl bg-background/10 border border-white/10 hover:bg-background/20 text-white transition-all">
                  {importing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" onClick={() => exportToCSV(contacts, 'directorio')} className="h-14 w-14 rounded-2xl bg-background/10 border border-white/10 hover:bg-background/20 text-white transition-all">
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Contactos", value: contacts.length, icon: User, color: "primary" },
          { label: "Alta Prioridad", value: contacts.filter(c => c.priority === 'high').length, icon: Star, color: "rose" },
          { label: "Visitados Hoy", value: contacts.filter(c => new Date(c.lastVisit).toDateString() === new Date().toDateString()).length, icon: RefreshCw, color: "emerald" },
          { label: "Rating VIP", value: contacts.filter(c => c.rating >= 4).length, icon: Smartphone, color: "amber" }
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-none rounded-[2rem] p-6 shadow-soft hover:shadow-card transition-all duration-500 transform hover:-translate-y-1 group">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110", `icon-vibrant-${stat.color === 'rose' ? 'danger' : stat.color}`)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Advanced Filters */}
      <Card className="rounded-[2.5rem] border-none shadow-soft bg-background/60 backdrop-blur-sm overflow-hidden p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 relative w-full group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por nombre, especialidad o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-background/50 border-slate-100 rounded-2xl focus-visible:ring-primary/20 shadow-inner text-sm font-semibold"
            />
          </div>

          <div className="w-full md:w-64">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-14 bg-background/50 border-slate-100 rounded-2xl shadow-inner font-bold text-slate-700">
                <div className="flex items-center">
                  <Filter className="mr-3 h-4 w-4 text-primary" />
                  <SelectValue placeholder="Categoría" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                <SelectItem value="all" className="font-bold">Todos los tipos</SelectItem>
                <SelectItem value="doctor" className="font-bold">Médicos</SelectItem>
                <SelectItem value="pharmacy" className="font-bold">Farmacias</SelectItem>
                <SelectItem value="natural_store" className="font-bold">Tiendas Naturistas</SelectItem>
                <SelectItem value="drugstore" className="font-bold">Droguerías</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />
        </div>
      </Card>

      {/* Contacts Dynamic Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-black text-primary uppercase tracking-[0.3em]">Sincronizando Directorio...</p>
        </div>
      ) : contacts.length === 0 ? (
        <PremiumEmptyState
          icon={User}
          title="Directorio Vacío"
          description="Aún no has registrado contactos. Comienza ahora para ver tu red médica crecer."
          actionLabel="Crear Primer Contacto"
          onAction={() => setIsDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {contacts.map((contact) => (
            <Card key={contact.id} className="rounded-[2.5rem] bg-card border-none shadow-soft hover:shadow-card transition-all duration-500 overflow-hidden group">
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 rounded-[1.75rem] border-4 border-white shadow-xl ring-1 ring-slate-100 transition-transform group-hover:scale-105 group-hover:rotate-2">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-2xl font-black">
                        {contact.contact_type === 'natural_store' || contact.contact_type === 'drugstore' ? <LeafIcon className="h-8 w-8" /> : (contact.name || '?').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2 group-hover:text-primary transition-colors">{contact.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border-none px-3 py-1">
                          {contact.specialty || 'General'}
                        </Badge>
                        <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 border-none", getPriorityColor(contact.priority))}>
                          {contact.priority || 'Medium'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ContactDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-primary">
                          <Edit className="h-5 w-5" />
                        </Button>
                      }
                      contactData={contact}
                      onContactSaved={refresh}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-black text-slate-800 tracking-tight">¿Eliminar Contacto?</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-500 font-bold">Esta acción eliminará permanentemente a {contact.name} de tu directorio.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-3">
                          <AlertDialogCancel className="h-12 rounded-[1rem] font-black text-[11px] uppercase tracking-widest">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(contact)} className="h-12 rounded-[1rem] bg-rose-500 hover:bg-rose-600 font-black text-[11px] uppercase tracking-widest text-white">ELIMINAR AHORA</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <span className="truncate">{contact.address || 'Ubicación no registrada'}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                          <Phone className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="truncate">{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 group-hover:bg-card transition-colors group-hover:shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historial de Visitas</p>
                      <div className="flex items-center text-amber-400">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        <span className="text-sm font-black">{contact.rating || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-black text-slate-800 leading-none">{contact.visitCount || 0}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">Visitas totales</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-700 leading-none">{contact.lastVisit ? new Date(contact.lastVisit).toLocaleDateString() : 'Never'}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">Última Visita</p>
                      </div>
                    </div>
                  </div>
                </div>

                <VisitDetailDialog
                  trigger={
                    <Button className="btn-medical w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all">
                      <Smartphone className="mr-2 h-5 w-5" />
                      Programar Nueva Visita
                    </Button>
                  }
                  visitData={{
                    contact_id: contact.id,
                    visit_type: contact.contact_type || 'doctor'
                  }}
                  onVisitSaved={refresh}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
