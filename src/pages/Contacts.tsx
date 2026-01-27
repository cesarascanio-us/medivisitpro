import { useState, useEffect, useRef } from "react";
import { Search, Plus, Filter, User, MapPin, Phone, Mail, Star, Calendar, Building2, Edit, Printer, Download, Trash2, Upload, HelpCircle, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ContactDialog } from "@/components/contacts/ContactDialog";
import { VisitDialog } from "@/components/agenda/VisitDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from 'xlsx';

import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useDemoData } from "@/contexts/MockDataProvider";

interface AdminFilterState {
  region?: string;
  state?: string;
  zoneId?: string;
  repId?: string;
}

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const { user, organizationId, canViewAllData, isSupervisor, zoneId } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});

  // Demo mode hook
  const demoData = useDemoData();

  useEffect(() => {
    loadContacts();
  }, [user, adminFilters, organizationId]);

  const loadContacts = async () => {
    if (!user || !organizationId) {
      setLoading(false);
      return;
    }

    // DEMO MODE: Use mock data
    if (demoData) {
      console.log("Contacts: Using mock demo data");
      setContacts(demoData.contacts as any[]);
      setLoading(false);
      return;
    }

    try {
      const baseFilter = (query: any, tableName: string = 'contacts') => {
        query = query.eq('organization_id', organizationId);

        // Apply role-based zone/user filtering
        if (isSupervisor && zoneId) {
          // Supervisors see their entire zone by default
          if (adminFilters.repId && adminFilters.repId !== 'all') {
            query = query.eq('user_id', adminFilters.repId);
          } else {
            query = query.eq('zone_id', zoneId);
          }
        }
        else if (!canViewAllData) {
          // Regular reps only see their own data
          query = query.eq('user_id', user.id);
        }
        else {
          // Master/Manager - apply optional filters
          if (adminFilters.repId && adminFilters.repId !== 'all') {
            query = query.eq('user_id', adminFilters.repId);
          }
          if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
            query = query.eq('zone_id', adminFilters.zoneId);
          }
        }

        // Apply state filter for tables that have a state column
        // doctors and pharmacies have state column, contacts may not
        if (adminFilters.state && adminFilters.state !== 'all') {
          if (tableName === 'pharmacies' || tableName === 'doctors') {
            // Both have a 'state' column
            query = query.ilike('state', `%${adminFilters.state}%`);
          } else {
            // contacts - try matching on city
            query = query.ilike('city', `%${adminFilters.state}%`);
          }
        }

        return query;
      };

      // 1. Fetch Generic Contacts
      let contactsQuery = supabase
        .from('contacts')
        .select(`
          *,
          contact_health_centers (
            health_center_id,
            health_centers (
              id,
              name
            )
          )
        `);
      contactsQuery = baseFilter(contactsQuery, 'contacts');

      // 2. Fetch Doctors
      let doctorsQuery = supabase.from('doctors').select('*');
      doctorsQuery = baseFilter(doctorsQuery, 'doctors');

      // 3. Fetch Pharmacies
      let pharmaciesQuery = supabase.from('pharmacies').select('*');
      pharmaciesQuery = baseFilter(pharmaciesQuery, 'pharmacies');

      const [contactsRes, doctorsRes, pharmaciesRes] = await Promise.all([
        contactsQuery,
        doctorsQuery,
        pharmaciesQuery
      ]);

      if (contactsRes.error) console.error('Error fetching contacts:', contactsRes.error);
      if (doctorsRes.error) console.error('Error fetching doctors:', doctorsRes.error);
      if (pharmaciesRes.error) console.error('Error fetching pharmacies:', pharmaciesRes.error);

      // Normalize Data
      const unifiedContacts: any[] = [];

      // Process Generic Contacts
      if (contactsRes.data) {
        contactsRes.data.forEach((c: any) => {
          unifiedContacts.push({
            ...c,
            source: 'contacts',
            displayType: c.contact_type || 'Contacto',
            visitCount: 0,
            rating: 0,
            lastVisit: c.created_at
          });
        });
      }

      // Process Doctors
      if (doctorsRes.data) {
        doctorsRes.data.forEach((d: any) => {
          unifiedContacts.push({
            id: d.id,
            user_id: d.user_id,
            name: d.name,
            specialty: d.specialty,
            phone: d.phone,
            email: d.email,
            address: d.address || d.office_address,
            city: d.city,
            source: 'doctors',
            displayType: 'Médico',
            contact_type: 'doctor',
            priority: d.priority || 'medium',
            lastVisit: d.last_visit || d.created_at,
            visitCount: d.visit_count || 0,
            rating: d.rating || 0,
            hospital: d.work_center
          });
        });
      }

      // Process Pharmacies
      if (pharmaciesRes.data) {
        pharmaciesRes.data.forEach((p: any) => {
          unifiedContacts.push({
            id: p.id,
            user_id: p.user_id,
            name: p.name,
            specialty: 'Farmacia',
            phone: p.phone,
            email: p.email,
            address: p.address,
            city: p.city,
            source: 'pharmacies',
            displayType: 'Farmacia',
            contact_type: 'pharmacy',
            priority: p.priority || 'medium',
            lastVisit: p.last_visit || p.created_at,
            visitCount: 0,
            rating: 0,
            status: p.status
          });
        });
      }

      // Sort by Name
      unifiedContacts.sort((a, b) => a.name.localeCompare(b.name));

      setContacts(unifiedContacts);
    } catch (error) {
      console.error('Error loading unified contacts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar todos los contactos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
      loadContacts();
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

          const contactsToInsert = jsonData.map((row: any) => ({
            user_id: user?.id,
            name: row['Nombre'] || row['nombre'] || row['Name'],
            specialty: row['Especialidad'] || row['especialidad'] || row['Specialty'] || null,
            contact_type: row['Tipo'] || row['tipo'] || 'doctor',
            address: row['Direccion'] || row['direccion'] || row['Address'] || null,
            city: row['Ciudad'] || row['ciudad'] || row['City'] || null,
            phone: row['Telefono'] || row['telefono'] || row['Phone'] || null,
            email: row['Email'] || row['email'] || null,
            work_hours: row['Horario'] || row['horario'] || null,
            priority: row['Prioridad'] || row['prioridad'] || 'medium',
            notes: row['Notas'] || row['notas'] || null
          })).filter(c => c.name); // Filter out rows without name

          if (contactsToInsert.length === 0) {
            throw new Error("No se encontraron contactos válidos para importar.");
          }

          const { error } = await supabase
            .from('contacts')
            .insert(contactsToInsert);

          if (error) throw error;

          toast({
            title: "Importación exitosa",
            description: `Se han importado ${contactsToInsert.length} contactos correctamente.`
          });
          loadContacts();
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

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    false
  );

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

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Directorio de Contactos</h1>
          <p className="text-muted-foreground font-medium">Gestiona tu red de profesionales médicos</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            onContactSaved={loadContacts}
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
            <Button variant="outline" className="border-border text-foreground hover:bg-muted">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
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
          <div className="text-2xl font-bold text-foreground">{Math.round(contacts.reduce((acc, c) => acc + c.rating, 0) / contacts.length * 10) / 10}</div>
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
                      {contact.name.split(' ').map((n: string) => n[0]).join('')}
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
                          {chc.health_centers.name}
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
                  onContactSaved={loadContacts}
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
                <VisitDialog
                  trigger={
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-medium">
                      Programar Visita
                    </Button>
                  }
                  onVisitSaved={loadContacts}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card className="medical-card">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron contactos</h3>
            <p className="text-muted-foreground">
              Intenta ajustar tu búsqueda o añade nuevos contactos a tu directorio.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}