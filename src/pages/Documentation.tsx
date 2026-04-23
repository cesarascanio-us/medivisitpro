/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useState, useEffect } from 'react';
import { useDocumentation, SystemDocument } from '@/hooks/useDocumentation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download, Printer, BookOpen, Shield, Settings, FileCode, Edit, Save, Plus, X } from 'lucide-react';

export default function Documentation() {
    const { groupedDocuments, loading, error, saveDocument, createDocument } = useDocumentation();
    const { isMaster, isAdmin } = useAuth();
    const [selectedDoc, setSelectedDoc] = useState<SystemDocument | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState(''); // For header edit

    // New Dialog State
    const [isNewOpen, setIsNewOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('manual');
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state when selected doc changes
    useEffect(() => {
        if (selectedDoc) {
            setEditContent(selectedDoc.content);
            setEditTitle(selectedDoc.title);
            setIsEditing(false); // Reset edit mode on change
        }
    }, [selectedDoc]);

    const canEdit = isMaster || isAdmin;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow && selectedDoc) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>${selectedDoc.title}</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                        h1 { color: #1a365d; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
                        h2 { margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                        pre { white-space: pre-wrap; background: #f5f5f5; padding: 20px; border-radius: 5px; font-family: monospace; }
                        code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-size: 0.9em; }
                        .metadata { color: #666; font-size: 0.9em; margin-bottom: 30px; }
                    </style>
                </head>
                <body>
                    <h1>${selectedDoc.title}</h1>
                    <div class="metadata">
                        <strong>Versión:</strong> ${selectedDoc.version} | <strong>Categoría:</strong> ${selectedDoc.category}
                        <br/>Actualizado: ${new Date(selectedDoc.last_updated).toLocaleDateString()}
                    </div>
                    <!-- Simple markdown conversion for print could go here, for now raw text or we rely on the user to format -->
                    <div style="white-space: pre-wrap;">${selectedDoc.content}</div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    const handleDownload = () => {
        if (!selectedDoc) return;
        const blob = new Blob([selectedDoc.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedDoc.title.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSave = async () => {
        if (!selectedDoc) return;
        setIsSaving(true);
        const updatedDoc = {
            ...selectedDoc,
            content: editContent,
            title: editTitle
        };

        const success = await saveDocument(updatedDoc);
        setIsSaving(false);
        if (success) {
            setIsEditing(false);
            // Ideally we'd update the local selectedDoc or re-fetch, but layout re-render might handle it
            // For immediate feedback
            setSelectedDoc(updatedDoc);
        }
    };

    const handleCreate = async () => {
        if (!newTitle) return;
        setIsSaving(true);
        const success = await createDocument(newTitle, newCategory);
        setIsSaving(false);
        if (success) {
            setIsNewOpen(false);
            setNewTitle('');
            // Optional: Auto-select new doc logic could go here
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (error) return <div className="p-8 text-red-500">Error cargando documentación: {error}</div>;

    const categories = [
        { id: 'manual', label: 'Manuales de Usuario', icon: <BookOpen className="h-4 w-4" /> },
        { id: 'sop', label: 'Procesos (SOPs)', icon: <Settings className="h-4 w-4" /> },
        { id: 'policy', label: 'Políticas', icon: <Shield className="h-4 w-4" /> },
        { id: 'technical', label: 'Técnico', icon: <FileCode className="h-4 w-4" /> },
    ];

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Centro de Documentación</h1>
                    <p className="text-muted-foreground">Biblioteca oficial de procesos, manuales y políticas.</p>
                </div>
                {canEdit && (
                    <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Documento
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Documento</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input
                                        placeholder="Ej. Guía de Ventas 2025"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <Select value={newCategory} onValueChange={setNewCategory}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Manual de Usuario</SelectItem>
                                            <SelectItem value="sop">SOP (Proceso)</SelectItem>
                                            <SelectItem value="policy">Política</SelectItem>
                                            <SelectItem value="technical">Técnico</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
                                <Button onClick={handleCreate} disabled={!newTitle || isSaving}>
                                    {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                    Crear
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Sidebar List */}
                <Card className="col-span-4 flex flex-col min-h-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Biblioteca</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-full px-4">
                            <div className="space-y-6 pb-4">
                                {categories.map(cat => (
                                    <div key={cat.id}>
                                        <h3 className="flex items-center gap-2 font-semibold mb-2 text-sm text-foreground/80 mt-4">
                                            {cat.icon} {cat.label}
                                        </h3>
                                        <div className="space-y-1">
                                            {groupedDocuments[cat.id as keyof typeof groupedDocuments]?.map(doc => (
                                                <Button
                                                    key={doc.id}
                                                    variant={selectedDoc?.id === doc.id ? "secondary" : "ghost"}
                                                    className="w-full justify-start h-auto py-3 text-left"
                                                    onClick={() => setSelectedDoc(doc)}
                                                >
                                                    <FileText className="h-4 w-4 mr-2 min-w-4 flex-shrink-0" />
                                                    <span className="truncate">{doc.title}</span>
                                                </Button>
                                            ))}
                                            {groupedDocuments[cat.id as keyof typeof groupedDocuments]?.length === 0 && (
                                                <p className="text-xs text-muted-foreground pl-6">No hay documentos</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Content Viewer / Editor */}
                <Card className="col-span-8 flex flex-col min-h-0">
                    {selectedDoc ? (
                        <>
                            <CardHeader className="border-b shadow-sm bg-card/50 py-3">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1 flex-1 mr-4">
                                        {isEditing ? (
                                            <Input
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="font-bold text-lg h-9"
                                            />
                                        ) : (
                                            <CardTitle className="text-xl truncate">{selectedDoc.title}</CardTitle>
                                        )}

                                        {!isEditing && (
                                            <div className="flex gap-2">
                                                <Badge variant="outline">v{selectedDoc.version}</Badge>
                                                <Badge variant="secondary">{selectedDoc.category.toUpperCase()}</Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {isEditing ? (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancelar
                                                </Button>
                                                <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving}>
                                                    {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                    Guardar
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                {canEdit && (
                                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={handleDownload} title="Descargar Markdown">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={handlePrint} title="Imprimir">
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 min-h-0 p-0 bg-background relative">
                                {isEditing ? (
                                    <Textarea
                                        className="w-full h-full resize-none p-6 font-mono text-sm border-0 focus-visible:ring-0 rounded-none bg-transparent"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        placeholder="# Escribe tu contenido en Markdown aquí..."
                                    />
                                ) : (
                                    <ScrollArea className="h-full w-full">
                                        <div className="p-8 max-w-4xl mx-auto">
                                            {/* Applying Typography Plugin classes and removing font-mono */}
                                            <article className="prose dark:prose-invert prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-p:leading-7 prose-a:text-primary hover:prose-a:text-primary/80">
                                                <div className="whitespace-pre-wrap font-sans">
                                                    {selectedDoc.content}
                                                </div>
                                            </article>
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                            <p>Selecciona un documento para visualizarlo</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
