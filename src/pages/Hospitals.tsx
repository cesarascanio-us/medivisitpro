/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useRef } from "react";
import { Plus, Building, Phone, Mail, MapPin, Search, Bed, Users, Download, Upload, Printer, HelpCircle, FileSpreadsheet, Trash2, Lightbulb, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";

import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { InstructionCard } from "@/components/ui/InstructionCard";

interface AdminFilterState {
    region?: string;
    state?: string;
    zoneId?: string;
    repId?: string;
}

interface Hospital {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
    priority: string | null;
}

export default function Hospitals() {
    const { user, canViewAllData, isSupervisor, zoneId } = useAuth();
    const { toast } = useToast();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [adminFilters, setAdminFilters] = useState<AdminFilterState>({});
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        notes: "",
        priority: "medium"
    });
    const [showHelp, setShowHelp] = useState(false);
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);

    useEffect(() => {
        if (user) loadHospitals();
    }, [user, adminFilters]);

    const loadHospitals = async () => {
        try {
            setLoading(true);
            let query: any = supabase
                .from('contacts')
                .select('*')
                .eq('contact_type', 'hospital');

            if (isSupervisor && zoneId) {
                query = query.eq('zone_id', zoneId);
                if (adminFilters.repId && adminFilters.repId !== 'all') {
                    query = query.eq('user_id', adminFilters.repId);
                }
            } else if (!canViewAllData) {
                query = query.eq('user_id', user.id);
            } else {
                if (adminFilters.repId && adminFilters.repId !== 'all') {
                    query = query.eq('user_id', adminFilters.repId);
                }
                if (adminFilters.zoneId && adminFilters.zoneId !== 'all') {
                    query = query.eq('zone_id', adminFilters.zoneId);
                }
            }

            const { data, error } = await query.order('name', { ascending: true });

            if (error) throw error;
            setHospitals(data || []);
        } catch (error) {
            console.error('Error loading hospitals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user || !formData.name) return;

        try {
            const { error } = await supabase.from('contacts').insert({
                user_id: user.id,
                name: formData.name,
                contact_type: 'hospital' as const,
                address: formData.address || null,
                city: formData.city || null,
                phone: formData.phone || null,
                email: formData.email || null,
                notes: formData.notes || null,
                priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent'
            });

            if (error) throw error;

            toast({ title: "Hospital agregado", description: "El hospital ha sido registrado exitosamente." });
            setDialogOpen(false);
            setFormData({ name: "", address: "", city: "", phone: "", email: "", notes: "", priority: "medium" });
            loadHospitals();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo agregar el hospital.", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Hospital eliminado", description: "El hospital ha sido eliminado." });
            loadHospitals();
        } catch (error) {
            console.error('Error deleting hospital:', error);
            toast({ title: "Error", description: "No se pudo eliminar el hospital.", variant: "destructive" });
        }
    };

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
                    const XLSX = await import('xlsx');
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (!jsonData || jsonData.length === 0) {
                        throw new Error("El archivo está vacío o no tiene el formato correcto.");
                    }

                    const hospitalsToInsert = jsonData.map((row: any) => ({
                        user_id: user?.id,
                        name: row['Nombre'] || row['nombre'] || row['Name'],
                        contact_type: 'hospital' as const,
                        address: row['Direccion'] || row['direccion'] || row['Address'] || null,
                        city: row['Ciudad'] || row['ciudad'] || row['City'] || null,
                        phone: row['Telefono'] || row['telefono'] || row['Phone'] || null,
                        email: row['Email'] || row['email'] || null,
                        notes: row['Notas'] || row['notas'] || row['Notes'] || null,
                        priority: row['Prioridad'] || row['prioridad'] || row['Priority'] || 'medium'
                    })).filter(h => h.name);

                    if (hospitalsToInsert.length === 0) {
                        throw new Error("No se encontraron hospitales válidos para importar.");
                    }

                    const { error } = await supabase
                        .from('contacts')
                        .insert(hospitalsToInsert);

                    if (error) throw error;

                    toast({
                        title: "Importación exitosa",
                        description: `Se han importado ${hospitalsToInsert.length} hospitales correctamente.`
                    });
                    loadHospitals();
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

    const handleExport = () => {
        exportToCSV(filteredHospitals, `hospitales_${new Date().toISOString().split('T')[0]}`);
        toast({ title: "Exportación exitosa", description: "El listado de hospitales se ha descargado correctamente." });
    };

    const getPriorityBadge = (priority: string | null) => {
        const styles: Record<string, string> = {
            high: "bg-red-100 text-red-800",
            medium: "bg-yellow-100 text-yellow-800",
            low: "bg-green-100 text-green-800"
        };
        const labels: Record<string, string> = {
            high: "Alta",
            medium: "Media",
            low: "Baja"
        };
        return <Badge className={styles[priority || 'medium']}>{labels[priority || 'medium']}</Badge>;
    };

    const filteredHospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
            />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Hospitales</h1>
                    <p className="text-muted-foreground">Administra tus centros hospitalarios</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Ayuda de Importación">
                                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Estructura de Archivo para Importación</DialogTitle>
                                <DialogDescription>
                                    Para importar hospitales, utiliza un archivo Excel (.xlsx) o CSV con las siguientes columnas.
                                    La primera fila debe contener los encabezados exactos.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="border rounded-md overflow-hidden">
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
                                            <TableCell>Nombre del hospital (Obligatorio)</TableCell>
                                            <TableCell>Hospital General</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Ciudad</TableCell>
                                            <TableCell>Ciudad de ubicación</TableCell>
                                            <TableCell>Caracas</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Telefono</TableCell>
                                            <TableCell>Número de contacto</TableCell>
                                            <TableCell>+58 414 1234567</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Email</TableCell>
                                            <TableCell>Correo electrónico</TableCell>
                                            <TableCell>hospital@example.com</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Direccion</TableCell>
                                            <TableCell>Dirección completa</TableCell>
                                            <TableCell>Av. Libertador 456</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={triggerImport} disabled={importing} title="Importar desde Excel">
                        {importing ? <FileSpreadsheet className="h-4 w-4 animate-pulse md:mr-2" /> : <Upload className="h-4 w-4 md:mr-2" />}
                        <span className="hidden md:inline">Importar</span>
                    </Button>

                    <Button variant="outline" onClick={handleExport} title="Exportar a CSV">
                        <Download className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Exportar</span>
                    </Button>

                    <Button variant="outline" onClick={() => handlePrint()} title="Imprimir Listado">
                        <Printer className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Imprimir</span>
                    </Button>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="btn-medical">
                                <Plus className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">Nuevo Hospital</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Registrar Nuevo Hospital</DialogTitle>
                                <DialogDescription>Ingresa los detalles administrativos del centro hospitalario.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nombre del Hospital *</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Hospital Central"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Prioridad</Label>
                                        <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Prioridad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Baja</SelectItem>
                                                <SelectItem value="medium">Media</SelectItem>
                                                <SelectItem value="high">Alta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Dirección</Label>
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Av. Principal, Edif. 1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ciudad</Label>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="Caracas"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Teléfono</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+58 212 0000000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="contacto@hospital.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notas</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Departamentos de interés, contactos clave..."
                                    />
                                </div>
                                <Button onClick={handleSubmit} className="w-full btn-medical">Guardar Hospital</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-4 text-muted-foreground font-medium">Cargando hospitales...</p></div>
            ) : filteredHospitals.length === 0 ? (
                <Card className="medical-card">
                    <CardContent className="text-center py-20">
                        <Building className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No se encontraron hospitales</h3>
                        <p className="text-muted-foreground mb-6">Ajusta los filtros o agrega una nueva institución para comenzar.</p>
                        <Button onClick={() => setDialogOpen(true)} variant="outline" className="border-primary text-primary hover:bg-primary/5">
                            <Plus className="mr-2 h-4 w-4" /> Agregar Hospital
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredHospitals.map((hospital) => (
                        <Card key={hospital.id} className="medical-card hover:shadow-xl transition-all duration-300 group flex flex-col">
                            <CardHeader className="pb-3 border-b border-muted/50 bg-muted/5 min-h-[90px] flex flex-row items-start justify-between">
                                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                    {hospital.name}
                                </CardTitle>
                                {getPriorityBadge(hospital.priority)}
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4 flex-grow">
                                {hospital.address && (
                                    <div className="flex items-start text-sm text-muted-foreground leading-tight">
                                        <MapPin className="mr-3 h-4 w-4 text-primary shrink-0" />
                                        <span>{hospital.address}</span>
                                    </div>
                                )}
                                {hospital.city && (
                                    <div className="flex items-center text-sm text-muted-foreground underline decoration-primary/20 underline-offset-4">
                                        <Building className="mr-3 h-4 w-4 text-primary shrink-0" />
                                        <span>{hospital.city}</span>
                                    </div>
                                )}
                                {hospital.phone && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Phone className="mr-3 h-4 w-4 text-primary shrink-0" />
                                        <span>{hospital.phone}</span>
                                    </div>
                                )}
                                {hospital.email && (
                                    <div className="flex items-center text-sm text-muted-foreground break-all ">
                                        <Mail className="mr-3 h-4 w-4 text-primary shrink-0" />
                                        <span>{hospital.email}</span>
                                    </div>
                                )}
                            </CardContent>
                            <div className="p-4 border-t border-muted/50 bg-muted/5 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary hover:bg-primary/10">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar hospital?</AlertDialogTitle>
                                            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará permanentemente {hospital.name}.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(hospital.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
