/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useRef } from "react";
import { Search, Plus, Filter, User, MapPin, Phone, Mail, Star, Download, Trash2, Upload, HelpCircle, FileSpreadsheet, Leaf as LeafIcon, Edit, RefreshCw, Smartphone } from "lucide-react";
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
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { cn } from "@/lib/utils";
import { useTexts } from "@/hooks/useTexts";
import { EliteHeader, EliteKPICard, EliteCard, EliteButton, EliteInput, EliteTable, EliteTabsList, EliteTabsTrigger } from '@/components/layout/DesignSystem';

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
  const t = useTexts();

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
          const XLSX = await import('xlsx');
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
    <div className="flex flex-col min-h-full space-y-10 font-sans transition-colors duration-500 text-foreground pb-20 animate-in fade-in duration-700">
      <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx, .xls, .csv" className="hidden" />

      {/* Premium Header */}
      <EliteHeader
        title={t.contacts_title || "Directorio de Contactos"}
        subtitle={t.contacts_subtitle || "Red Médica & Comercial Pro"}
        icon={User}
        badgeText="Network Master"
        statusText="Operativo v6.0"
        rightContent={
          <div className="flex flex-wrap items-center gap-3">
            <ContactDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              trigger={
                <EliteButton variant="primary" disabled={hasReachedLimit} className="shadow-2xl" icon={Plus}>
                  {t.btn_create || "Añadir Contacto"}
                </EliteButton>
              }
              onContactSaved={refresh}
            />
            <EliteButton variant="secondary" onClick={triggerImport} disabled={importing} icon={importing ? RefreshCw : Upload}>
              {t.btn_import || "Importar"}
            </EliteButton>
            <EliteButton variant="secondary" onClick={() => exportToCSV(contacts, 'directorio')} icon={Download}>
              {t.btn_export || "Exportar"}
            </EliteButton>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <EliteKPICard
          title="Total Contactos"
          value={contacts.length}
          icon={User}
          color="primary"
        />
        <EliteKPICard
          title="Alta Prioridad"
          value={contacts.filter(c => c.priority === 'high').length}
          icon={Star}
          color="rose"
        />
        <EliteKPICard
          title="Visitados Hoy"
          value={contacts.filter(c => new Date(c.lastVisit).toDateString() === new Date().toDateString()).length}
          icon={RefreshCw}
          color="emerald"
        />
        <EliteKPICard
          title="Rating VIP"
          value={contacts.filter(c => c.rating >= 4).length}
          icon={Smartphone}
          color="amber"
        />
      </div>

      {/* Advanced Filters */}
      <EliteCard className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 relative w-full group">
            <EliteInput
              icon={Search}
              placeholder="Buscar por nombre, especialidad o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-64">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-14 bg-background/50 border-border/40 rounded-2xl shadow-inner font-bold text-foreground">
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
        <div className="mt-6 pt-6 border-t border-border/40">
          <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />
        </div>
      </EliteCard>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {contacts.map((contact) => (
            <EliteCard key={contact.id} className="group overflow-hidden">
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 rounded-[1.75rem] border-4 border-white dark:border-zinc-950 shadow-xl ring-1 ring-slate-100 dark:ring-zinc-800 transition-transform group-hover:scale-105 group-hover:rotate-2">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-2xl font-black">
                        {contact.contact_type === 'natural_store' || contact.contact_type === 'drugstore' ? <LeafIcon className="h-8 w-8" /> : (contact.name || '?').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-black text-foreground tracking-tight leading-none mb-2 group-hover:text-primary transition-colors">{contact.name}</h3>
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
                        <EliteButton variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5">
                          <Edit className="h-5 w-5" />
                        </EliteButton>
                      }
                      contactData={contact}
                      onContactSaved={refresh}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <EliteButton variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5">
                          <Trash2 className="h-5 w-5" />
                        </EliteButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-black text-foreground tracking-tight">¿Eliminar Contacto?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground font-bold">Esta acción eliminará permanentemente a {contact.name} de tu directorio.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-3">
                          <AlertDialogCancel asChild>
                            <EliteButton variant="secondary" className="h-12 rounded-[1rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center">Cancelar</EliteButton>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <EliteButton onClick={() => handleDelete(contact)} className="h-12 rounded-[1rem] bg-rose-500 hover:bg-rose-600 font-black text-[11px] uppercase tracking-widest text-white shadow-premium-md shadow-rose-500/20 flex items-center justify-center">ELIMINAR AHORA</EliteButton>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <span className="truncate">{contact.address || 'Ubicación no registrada'}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/5 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-emerald-500/10 transition-colors text-slate-900">
                          <Phone className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="truncate">{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-muted/10 rounded-3xl p-6 border border-border/40 group-hover:bg-card transition-colors group-hover:shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Historial de Visitas</p>
                      <div className="flex items-center text-amber-400">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        <span className="text-sm font-black">{contact.rating || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-black text-foreground leading-none">{contact.visitCount || 0}</p>
                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter mt-1">Visitas totales</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-foreground leading-none">{contact.lastVisit ? new Date(contact.lastVisit).toLocaleDateString() : 'Never'}</p>
                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter mt-1">Última Visita</p>
                      </div>
                    </div>
                  </div>
                </div>

                <VisitDetailDialog
                  trigger={
                    <EliteButton className="w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all">
                      <Smartphone className="mr-2 h-5 w-5" />
                      Programar Nueva Visita
                    </EliteButton>
                  }
                  visitData={{
                    contact_id: contact.id,
                    visit_type: contact.contact_type || 'doctor'
                  }}
                  onVisitSaved={refresh}
                />
              </div>
            </EliteCard>
          ))}
        </div>
      )}
    </div>
  );
}
