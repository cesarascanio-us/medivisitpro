/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProcessDiagramEditor } from '@/components/shared/ProcessDiagramEditor';
import { RiskMatrix } from '@/components/shared/RiskMatrix';
import { useWorkProcesses, WorkProcess } from '@/hooks/useWorkProcesses';
import {
    FileText,
    GitBranch,
    AlertTriangle,
    Save,
    Plus,
    Building2,
    Users,
    ClipboardList,
    Loader2,
    Trash2,
    ChevronRight
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function WorkProcesses() {
    const { processes, loading, saving, createProcess, updateProcess, deleteProcess, refreshProcesses } = useWorkProcesses();
    const [activeTab, setActiveTab] = useState('list');
    const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);

    const [currentProcess, setCurrentProcess] = useState<Partial<WorkProcess>>({
        name: '',
        description: '',
        department: '',
        responsible_person: '',
        objectives: '',
        scope: '',
        diagram_nodes: [],
        diagram_edges: [],
        risks: [],
    });

    // Load selected process data
    useEffect(() => {
        if (selectedProcessId) {
            const process = processes.find(p => p.id === selectedProcessId);
            if (process) {
                setCurrentProcess({
                    ...process,
                    diagram_nodes: process.diagram_nodes || [],
                    diagram_edges: process.diagram_edges || [],
                    risks: process.risks || []
                });
            }
        }
    }, [selectedProcessId, processes]);

    const handleNewProcess = async () => {
        const newProcess = await createProcess({
            name: 'Nuevo Proceso',
            description: '',
            department: '',
            responsible_person: '',
            objectives: '',
            scope: '',
            diagram_nodes: [],
            diagram_edges: [],
            risks: []
        });

        if (newProcess) {
            setSelectedProcessId(newProcess.id);
            setEditMode(true);
            setActiveTab('info');
        }
    };

    const handleSaveInfo = async () => {
        if (!selectedProcessId) return;

        await updateProcess(selectedProcessId, {
            name: currentProcess.name,
            description: currentProcess.description,
            department: currentProcess.department,
            responsible_person: currentProcess.responsible_person,
            objectives: currentProcess.objectives,
            scope: currentProcess.scope
        });
    };

    const handleSaveDiagram = async (nodes: any[], edges: any[]) => {
        if (!selectedProcessId) return;

        setCurrentProcess({
            ...currentProcess,
            diagram_nodes: nodes,
            diagram_edges: edges,
        });

        await updateProcess(selectedProcessId, {
            diagram_nodes: nodes,
            diagram_edges: edges
        });
    };

    const handleSaveRisks = async (risks: any[]) => {
        if (!selectedProcessId) return;

        setCurrentProcess({
            ...currentProcess,
            risks: risks,
        });

        await updateProcess(selectedProcessId, {
            risks: risks
        });
    };

    const handleDeleteProcess = async (id: string) => {
        await deleteProcess(id);
        if (selectedProcessId === id) {
            setSelectedProcessId(null);
            setActiveTab('list');
        }
    };

    const handleSelectProcess = (process: WorkProcess) => {
        setSelectedProcessId(process.id);
        setCurrentProcess(process);
        setActiveTab('info');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Procesos de Trabajo</h1>
                    <p className="text-muted-foreground">
                        Caracterización, diagramación y análisis de riesgos de procesos
                    </p>
                </div>
                <Button className="btn-medical" onClick={handleNewProcess} disabled={saving}>
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="mr-2 h-4 w-4" />
                    )}
                    Nuevo Proceso
                </Button>
            </div>

            {/* Main Content with Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="list" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Lista
                    </TabsTrigger>
                    <TabsTrigger value="info" className="flex items-center gap-2" disabled={!selectedProcessId}>
                        <FileText className="h-4 w-4" />
                        Información
                    </TabsTrigger>
                    <TabsTrigger value="diagram" className="flex items-center gap-2" disabled={!selectedProcessId}>
                        <GitBranch className="h-4 w-4" />
                        Diagrama
                    </TabsTrigger>
                    <TabsTrigger value="risks" className="flex items-center gap-2" disabled={!selectedProcessId}>
                        <AlertTriangle className="h-4 w-4" />
                        Riesgos
                    </TabsTrigger>
                </TabsList>

                {/* Process List Tab */}
                <TabsContent value="list" className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : processes.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    No hay procesos de trabajo
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Comienza creando tu primer proceso de trabajo
                                </p>
                                <Button className="btn-medical" onClick={handleNewProcess}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear Primer Proceso
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {processes.map((process) => (
                                <Card
                                    key={process.id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${selectedProcessId === process.id ? 'ring-2 ring-primary' : ''
                                        }`}
                                    onClick={() => handleSelectProcess(process)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg">{process.name}</CardTitle>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Eliminar proceso?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Se eliminarán todos los datos del proceso.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteProcess(process.id)}
                                                            className="bg-destructive text-destructive-foreground"
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                        {process.department && (
                                            <Badge variant="secondary" className="w-fit">
                                                {process.department}
                                            </Badge>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {process.description || 'Sin descripción'}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>
                                                {(process.diagram_nodes as any[])?.length || 0} nodos • {(process.risks as any[])?.length || 0} riesgos
                                            </span>
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Information Tab */}
                <TabsContent value="info" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" />
                                Caracterización del Proceso
                            </CardTitle>
                            <CardDescription>
                                Define los datos generales del proceso de trabajo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del Proceso</Label>
                                    <Input
                                        id="name"
                                        value={currentProcess.name || ''}
                                        onChange={(e) =>
                                            setCurrentProcess({ ...currentProcess, name: e.target.value })
                                        }
                                        placeholder="Ej: Recepción de Mercancía"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Departamento</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="department"
                                            value={currentProcess.department || ''}
                                            onChange={(e) =>
                                                setCurrentProcess({ ...currentProcess, department: e.target.value })
                                            }
                                            placeholder="Ej: Almacén"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="responsible">Responsable</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="responsible"
                                            value={currentProcess.responsible_person || ''}
                                            onChange={(e) =>
                                                setCurrentProcess({ ...currentProcess, responsible_person: e.target.value })
                                            }
                                            placeholder="Nombre del responsable"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={currentProcess.description || ''}
                                    onChange={(e) =>
                                        setCurrentProcess({ ...currentProcess, description: e.target.value })
                                    }
                                    placeholder="Describe el proceso..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="objectives">Objetivos</Label>
                                    <Textarea
                                        id="objectives"
                                        value={currentProcess.objectives || ''}
                                        onChange={(e) =>
                                            setCurrentProcess({ ...currentProcess, objectives: e.target.value })
                                        }
                                        placeholder="Lista los objetivos del proceso..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="scope">Alcance</Label>
                                    <Textarea
                                        id="scope"
                                        value={currentProcess.scope || ''}
                                        onChange={(e) =>
                                            setCurrentProcess({ ...currentProcess, scope: e.target.value })
                                        }
                                        placeholder="Define el alcance del proceso..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveInfo} disabled={saving}>
                                    {saving ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Guardar Información
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Diagram Tab */}
                <TabsContent value="diagram" className="h-[600px]">
                    <ProcessDiagramEditor
                        key={selectedProcessId || 'new'} // FORCE RENDER on change
                        initialNodes={(currentProcess.diagram_nodes as any) || []}
                        initialEdges={(currentProcess.diagram_edges as any) || []}
                        onSave={handleSaveDiagram}
                        title={`Diagrama: ${currentProcess.name || 'Nuevo Proceso'}`}
                    />
                </TabsContent>

                {/* Risks Tab */}
                <TabsContent value="risks">
                    <RiskMatrix
                        risks={(currentProcess.risks as any) || []}
                        onSave={handleSaveRisks}
                        title={`Riesgos: ${currentProcess.name || 'Nuevo Proceso'}`}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
