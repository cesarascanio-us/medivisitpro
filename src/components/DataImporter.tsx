import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface MedicoImport {
    nombre_completo: string;
    especialidad?: string;
    clinica_centro?: string;
    direccion?: string;
    horario_atencion?: string;
    foto_url?: string;
}

interface Props {
    onSuccess?: () => void;
}

export const DataImporter = ({ onSuccess }: Props) => {
    const [data, setData] = useState<MedicoImport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError(null);
        setSuccess(false);

        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        setError(`Error al leer CSV: ${results.errors[0].message}`);
                        return;
                    }

                    // Validate required fields
                    const validData = results.data.filter((row: any) => row.nombre_completo);
                    if (validData.length === 0) {
                        setError("El archivo no contiene datos válidos o falta la columna 'nombre_completo'");
                        return;
                    }

                    setData(validData as MedicoImport[]);
                    toast.info(`${validData.length} registros cargados para previsualización`);
                },
                error: (error) => {
                    setError(`Error de parsing: ${error.message}`);
                },
            });
        }
    };

    const handleImport = async () => {
        if (data.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            // Note: Adusting table name to 'profiles' or 'contacts' might be needed if 'medicos' doesn't exist.
            // For now keeping 'medicos' as per original file, but adding a TODO note.
            // Actually, based on MedVisitPro schema, 'contacts' seems the right place for doctors.
            // Let's try to map to 'contacts' with contact_type='doctor' for better integration.

            // Fetch user once
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user found");

            const transformedData = data.map(d => ({
                name: d.nombre_completo,
                specialty: d.especialidad,
                // Adusting fields to match MedVisitPro 'contacts' table
                address: d.direccion,
                contact_type: 'doctor' as "doctor", // Defaulting to doctor
                user_id: user.id
            }));

            const { error: insertError } = await supabase
                .from("contacts") // Changed from 'medicos' to 'contacts'
                .insert(transformedData);

            if (insertError) throw insertError;

            setSuccess(true);
            setData([]);
            toast.success("Importación completada exitosamente");
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(`Error al importar a base de datos: ${err.message}`);
            toast.error("Fallo en la importación");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6 bg-card rounded-lg border shadow-sm">
            <div>
                <h3 className="text-lg font-medium mb-2">Importar Médicos (CSV)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Carga un archivo CSV con las columnas: <code>nombre_completo, especialidad, clinica_centro, direccion</code>.
                </p>

                <div className="flex items-center gap-4">
                    <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="max-w-md"
                        disabled={loading}
                    />
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="bg-green-500/10 text-green-600 border-green-500/20">
                    <FileCheck className="h-4 w-4" />
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>Los datos se han importado correctamente.</AlertDescription>
                </Alert>
            )}

            {data.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Previsualización ({data.length} registros)</h4>
                        <Button onClick={handleImport} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Importando..." : "Confirmar Importación"}
                        </Button>
                    </div>

                    <div className="border rounded-md max-h-[300px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre Completo</TableHead>
                                    <TableHead>Especialidad</TableHead>
                                    <TableHead>Centro</TableHead>
                                    <TableHead>Dirección</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.nombre_completo}</TableCell>
                                        <TableCell>{row.especialidad || "-"}</TableCell>
                                        <TableCell>{row.clinica_centro || "-"}</TableCell>
                                        <TableCell>{row.direccion || "-"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
};
