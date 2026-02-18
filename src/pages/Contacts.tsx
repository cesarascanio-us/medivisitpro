import { useState, useEffect, useRef } from "react";
import { Search, Plus, Filter, User, MapPin, Phone, Mail, Star, Calendar, Building2, Edit, Printer, Download, Trash2, Upload, HelpCircle, FileSpreadsheet, Leaf as LeafIcon, Share2, MoreHorizontal, ExternalLink, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useOrganization, useSubscriptionStatus } from "@/hooks/useOrganization";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ContactDialog } from "@/components/contacts/ContactDialog";
import { useContacts, type Contact } from "@/hooks/useContacts";
import { VisitDetailDialog } from "@/components/visits/VisitDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from 'xlsx';
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";

import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useDemoData } from "@/contexts/MockDataProvider";

interface AdminFilterState {
  region?: string;
  state?: string;
  zoneId?: string;
  repId?: string;
}

export default function Contacts() {
  const [importing, setImporting] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const { user, organizationId, canViewAllData, isSupervisor, zoneId } = useAuth();
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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Demo mode hook
  const demoData = useDemoData();

  const handleDelete = async (contact: any) => {
    try {
      // Validate deletion target
      const table = contact.source || 'contacts';
      const id = contact.id;

      if (!id) throw new Error("ID de contacto inválido");

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId); // Added organization_id filter

      if (error) throw error;
      toast({ title: "Contacto eliminado", description: "El contacto ha sido eliminado." });
      refresh();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({ title: "Error", description: "No se pudo eliminar el contacto.", variant: "destructive" });
    }
  }

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

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

          if (!jsonData || jsonData.length === 0) {
            throw new Error("El archivo está vacío o no tiene el formato correcto.");
          }

          const doctorsToInsert: any[] = [];
          const pharmaciesToInsert: any[] = [];
          const genericContactsToInsert: any[] = [];

          jsonData.forEach((row: any) => {
            const type = row['Tipo'] || row['tipo'] || 'doctor';
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
              doctorsToInsert.push({
                ...baseData,
                specialty: row['Especialidad'] || row['especialidad'] || row['Specialty'] || null,
                observations: row['Notas'] || row['notas'] || null,
                potential: 'Medio'
              });
            } else if (type === 'pharmacy') {
              pharmaciesToInsert.push({
                ...baseData,
                notes: row['Notas'] || row['notas'] || null,
                potential: 'Medio'
              });
            } else {
              genericContactsToInsert.push({
                ...baseData,
                contact_type: type,
                specialty: row['Especialidad'] || row['especialidad'] || row['Specialty'] || null,
                notes: row['Notas'] || row['notas'] || null,
                priority: row['Prioridad'] || row['prioridad'] || 'medium',
              });
            }
          });

          const totalToImport = doctorsToInsert.length + pharmaciesToInsert.length + genericContactsToInsert.length;

          if (totalToImport === 0) {
            throw new Error("No se encontraron contactos válidos para importar.");
          }

          // Execute inserts in parallel
          const promises = [];
          if (doctorsToInsert.length > 0) promises.push(supabase.from('doctors').insert(doctorsToInsert));
          if (pharmaciesToInsert.length > 0) promises.push(supabase.from('pharmacies').insert(pharmaciesToInsert));
          if (genericContactsToInsert.length > 0) promises.push(supabase.from('contacts').insert(genericContactsToInsert));

          const results = await Promise.all(promises);
          const firstError = results.find(r => r.error);

          if (firstError) throw firstError.error;

          toast({
            title: "Importación exitosa",
            description: `Se han importado ${totalToImport} contactos correctamente en sus respectivos catálogos.`
          });
          refresh();
        } catch (error: any) {
          console.error("Import parsing error:", error);
          toast({
            title: "Error de Importación",
            description: error.message || "Hubo un error al procesar el archivo.",
            variant: "destructive"
          });
        } finally {
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File reading error:", error);
      setImporting(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.specialty?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || contact.contact_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning-foreground border border-warning/20';
      case 'low':
        return 'status-active';
      default:
        return 'status-inactive';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta Prioridad';
      case 'medium':
        return 'Prioridad Media';
      case 'low':
        return 'Prioridad Baja';
      default:
        return 'Sin prioridad';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-warning fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  const isFreePlan = planTier === 'free';
  const hasReachedLimit = isFreePlan && contacts.length >= 50;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Directorio de Contactos</h1>
          <p className="text-muted-foreground italic">Red Médica & Comercial</p>
        </div>
        <div className="flex items-center gap-2">
          {isFreePlan && (
            <Badge variant="outline" className="mr-2 bg-primary/5 text-primary border-primary/20">
              {contacts.length}/50 Médicos (Plan Básico)
            </Badge>
          )}
          <ContactDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            trigger={
              <Button disabled={hasReachedLimit} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Contacto
              </Button>
            }
            onContactSaved={refresh}
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Ayuda de Importación" className="text-muted-foreground hover:text-primary">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card">
              <DialogHeader>
                <DialogTitle>Estructura de Archivo para Importación</DialogTitle>
                <DialogDescription>
                  Para importar contactos, utiliza un archivo Excel (.xlsx) o CSV con las siguientes columnas.
                  La primera fila debe contener los encabezados exactos.
                </DialogDescription>
              </DialogHeader>
              <div className="border rounded-md overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Columna</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Ejemplo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Nombre</TableCell>
                      <TableCell>Nombre completo (Obligatorio)</TableCell>
                      <TableCell>Dr. Juan Pérez</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Especialidad</TableCell>
                      <TableCell>Especialidad médica</TableCell>
                      <TableCell>Cardiología</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tipo</TableCell>
                      <TableCell>doctor, pharmacy, hospital, clinic</TableCell>
                      <TableCell>doctor</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Telefono</TableCell>
                      <TableCell>Número de contacto</TableCell>
                      <TableCell>+58 414 1234567</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Email</TableCell>
                      <TableCell>Correo electrónico</TableCell>
                      <TableCell>juan@example.com</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Ciudad</TableCell>
                      <TableCell>Ciudad de ubicación</TableCell>
                      <TableCell>Caracas</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => exportToCSV(filteredContacts, 'contactos')} className="bg-card border-border text-foreground hover:bg-muted">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>

          <Button variant="outline" onClick={triggerImport} disabled={importing} className="bg-card border-border text-foreground hover:bg-muted">
            {importing ? <FileSpreadsheet className="mr-2 h-4 w-4 animate-pulse" /> : <Upload className="mr-2 h-4 w-4" />}
            {importing ? "Importando..." : "Importar"}
          </Button>

          <Button variant="outline" onClick={handlePrint} className="hidden sm:flex bg-card border-border text-foreground hover:bg-muted">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>

          <ContactDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo
              </Button>
            }
            onContactSaved={refresh}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border border-border rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre, especialidad o hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-input focus-visible:ring-ring"
              />
            </div>

            <div className="w-full md:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-background border-input">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Tipo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="doctor">Médicos</SelectItem>
                  <SelectItem value="pharmacy">Farmacias</SelectItem>
                  <SelectItem value="natural_store">Tiendas Naturistas</SelectItem>
                  <SelectItem value="drugstore">Droguerías</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Filters */}
      <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border rounded-xl shadow-sm text-center p-4">
          <div className="text-2xl font-bold text-primary">{contacts.length}</div>
          <div className="text-sm text-muted-foreground font-medium">Total Contactos</div>
        </Card>
        <Card className="bg-card border border-border rounded-xl shadow-sm text-center p-4">
          <div className="text-2xl font-bold text-emerald-600">{contacts.filter(c => c.priority === 'high').length}</div>
          <div className="text-sm text-muted-foreground font-medium">Alta Prioridad</div>
        </Card>
        <Card className="medical-card text-center p-4">
          <div className="text-2xl font-bold text-amber-500">{contacts.filter(c => new Date(c.lastVisit) > new Date('2024-01-01')).length}</div>
          <div className="text-sm text-muted-foreground">Visitados Este Mes</div>
        </Card>
        <Card className="medical-card text-center p-4">
          <div className="text-2xl font-bold text-foreground">
            {contacts.length > 0
              ? Math.round(contacts.reduce((acc, c) => acc + c.rating, 0) / contacts.length * 10) / 10
              : 0}
          </div>
          <div className="text-sm text-muted-foreground">Rating Promedio</div>
        </Card>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-1 ring-border">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                      {contact.contact_type === 'natural_store' || contact.contact_type === 'drugstore' ? <LeafIcon className="h-6 w-6" /> : (contact.name || '').split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{contact.name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">{contact.specialty}</p>
                  </div>
                </div>
                <Badge className={getPriorityColor(contact.priority)}>
                  {getPriorityText(contact.priority)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                {/* Health Centers */}
                {contact.contact_health_centers && contact.contact_health_centers.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center text-sm font-semibold text-foreground mb-2">
                      <Building2 className="h-4 w-4 mr-2 text-primary" />
                      Centros de Salud
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {contact.contact_health_centers.map((chc: any) => (
                        <Badge key={chc.health_center_id} variant="secondary" className="text-xs bg-muted text-muted-foreground hover:bg-muted/80">
                          {chc.health_centers?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    {contact.hospital && <div className="font-medium text-foreground">{contact.hospital}</div>}
                    {contact.address && <div>{contact.address}</div>}
                    {!contact.hospital && !contact.address && <span className="text-muted-foreground italic">Sin dirección</span>}
                  </div>
                </div>
                {contact.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {contact.phone}
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {contact.email}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Última visita:</span>
                    <span className="font-medium text-foreground">{new Date(contact.lastVisit || Date.now()).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-bold text-primary">{contact.visitCount || 0}</span> visitas
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                  {renderStars(contact.rating || 0)}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <ContactDialog
                  trigger={
                    <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-primary hover:border-primary/20">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  }
                  contactData={contact}
                  onContactSaved={refresh}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
                      <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(contact)} className="bg-rose-600 hover:bg-rose-700 text-white">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <VisitDetailDialog
                  trigger={
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-medium">
                      Programar Visita
                    </Button>
                  }
                  visitData={{
                    contact_id: contact.id,
                    visit_type: contact.contact_type || 'doctor'
                  }}
                  onVisitSaved={refresh}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <PremiumEmptyState
          icon={User}
          title="No se encontraron contactos"
          description="Intenta ajustar tu búsqueda o añade nuevos contactos a tu directorio para ampliar tu red profesional."
          actionLabel="Añadir Contacto"
          onAction={() => setIsDialogOpen(true)}
        />
      )}
    </div>
  );
}