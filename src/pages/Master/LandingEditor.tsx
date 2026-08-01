/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from 'react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { LandingContent, saveLandingContent, DEFAULT_LANDING_CONTENT } from '@/lib/landing-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ExternalLink, Layout, Globe, Rocket, ShieldCheck, Users, BarChart3 } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EliteHeader, EliteCard, EliteTabsList, EliteTabsTrigger } from '@/components/layout/DesignSystem';

export default function LandingEditor() {
    const { content: initialContent, loading: initialLoading } = useLandingContent();
    const [content, setContent] = useState<LandingContent | null>(null);
    const [saving, setSaving] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!initialLoading && initialContent) {
            setContent(initialContent);
        }
    }, [initialLoading, initialContent]);

    const handleSave = async () => {
        if (!content) return;
        setSaving(true);
        try {
            await saveLandingContent(content);
            toast({ title: "Guardado", description: "La Landing Page ha sido actualizada exitosamente." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // --- IMAGE UPLOAD LOGIC ---
    const handleImageUpload = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('landing-assets')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                toast({ title: "Error al subir", description: "Verifica que el bucket 'landing-assets' exista y sea público.", variant: "destructive" });
                return null;
            }

            const { data } = supabase.storage
                .from('landing-assets')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Unexpected error:', error);
            toast({ title: "Error", description: "Ocurrió un error inesperado al subir la imagen.", variant: "destructive" });
            return null;
        }
    };

    const ImageField = ({ label, value, onChange }: { label: string, value: string, onChange: (url: string) => void }) => {
        const [uploading, setUploading] = useState(false);

        const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files || e.target.files.length === 0) return;
            setUploading(true);
            const url = await handleImageUpload(e.target.files[0]);
            if (url) onChange(url);
            setUploading(false);
        };

        return (
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</Label>
                <div className="flex gap-2 items-center">
                    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." className="input-elite flex-1" />
                    <div className="relative">
                        <Button type="button" variant="outline" disabled={uploading} className="btn-elite-secondary relative overflow-hidden">
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <span className="mr-2">📂</span>}
                            {uploading ? 'Subiendo...' : 'Subir Imagen'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={uploading}
                            />
                        </Button>
                    </div>
                </div>
                {value && (
                    <div className="mt-2">
                        <img src={value} alt="Preview" className="h-32 object-contain rounded-elite-md border border-border bg-muted/50" />
                    </div>
                )}
            </div>
        );
    };

    const updateHero = (field: keyof LandingContent['hero'], value: string) => {
        if (!content) return;
        setContent(prev => prev ? ({ ...prev, hero: { ...prev.hero, [field]: value } }) : null);
    };

    const updateStats = (index: number, field: 'value' | 'label', value: string) => {
        if (!content) return;
        const newStats = [...content.stats];
        newStats[index] = { ...newStats[index], [field]: value };
        setContent(prev => prev ? ({ ...prev, stats: newStats }) : null);
    };

    const updateIntelligence = (field: keyof LandingContent['intelligence'], value: any) => {
        if (!content) return;
        setContent(prev => prev ? ({ ...prev, intelligence: { ...prev.intelligence, [field]: value } }) : null);
    };

    const updateIntelFeature = (index: number, value: string) => {
        if (!content) return;
        const newFeats = [...content.intelligence.features];
        newFeats[index] = value;
        setContent(prev => prev ? ({ ...prev, intelligence: { ...prev.intelligence, features: newFeats } }) : null);
    };

    const updateFeatures = (field: 'title' | 'subtitle', value: string) => {
        if (!content) return;
        setContent(prev => prev ? ({ ...prev, features: { ...prev.features, [field]: value } }) : null);
    };

    const updateFeatureItem = (index: number, field: 'icon' | 'title' | 'description', value: string) => {
        if (!content) return;
        const newItems = [...content.features.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setContent(prev => prev ? ({ ...prev, features: { ...prev.features, items: newItems } }) : null);
    };

    const updateTestimonials = (field: keyof LandingContent['testimonials'], value: string) => {
        if (!content) return;
        setContent(prev => prev ? ({ ...prev, testimonials: { ...prev.testimonials, [field]: value } }) : null);
    };

    const updateSecurity = (field: 'title', value: string) => {
        if (!content) return;
        setContent(prev => prev ? ({ ...prev, security: { ...prev.security, [field]: value } }) : null);
    };

    const updateSecurityItem = (index: number, field: 'icon' | 'title' | 'subtitle', value: string) => {
        if (!content) return;
        const newItems = [...(content.security?.items || [])];
        if (newItems[index]) {
            newItems[index] = { ...newItems[index], [field]: value };
            setContent(prev => prev ? ({ ...prev, security: { ...prev.security, items: newItems } }) : null);
        }
    };

    if (initialLoading || !content) {
        return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-transparent relative overflow-hidden p-4 md:p-8 pb-24 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            <div className="relative z-10 w-full h-full space-y-6">
                <EliteHeader 
                    title="Editor de Landing"
                    subtitle="Personaliza la narrativa visual y técnica de tu página pública"
                    icon={Layout}
                    badgeText="MARKETING & PRESENCIA"
                    statusText="EN VIVO"
                    statusColor="bg-emerald-500"
                    rightContent={
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowRestoreDialog(true)}
                                className="border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300"
                            >
                                Restaurar Elite
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.open('/', '_blank')}
                                className="border-white/10 bg-background/50 hover:bg-muted"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" /> Ver Página
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] border border-primary/20"
                            >
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    }
                />

                <Tabs defaultValue="hero" className="w-full space-y-6">
                    <EliteTabsList>
                        <EliteTabsTrigger value="hero" label="Inicio" icon={Globe} />
                        <EliteTabsTrigger value="stats" label="Cifras" icon={BarChart3} />
                        <EliteTabsTrigger value="intelligence" label="Inteligencia" icon={Rocket} />
                        <EliteTabsTrigger value="features" label="Beneficios" icon={Layout} />
                        <EliteTabsTrigger value="testimonials" label="Testimonios" icon={Users} />
                        <EliteTabsTrigger value="security" label="Seguridad" icon={ShieldCheck} />
                    </EliteTabsList>

                    <TabsContent value="hero" className="space-y-6 mt-6">
                        <EliteCard className="p-8">
                            <h3 className="text-xl font-bold mb-1">Sección Hero</h3>
                            <p className="text-xs text-muted-foreground mb-6">Primaria narrativa y visual</p>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Badge Superior</Label>
                                        <Input value={content.hero.badge} onChange={e => updateHero('badge', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Texto Gradiente</Label>
                                        <Input value={content.hero.title_highlight} onChange={e => updateHero('title_highlight', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Título Principal (Fijo)</Label>
                                    <Input value={content.hero.title_part1} onChange={e => updateHero('title_part1', e.target.value)} className="text-lg font-bold h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subtítulo Descriptivo</Label>
                                    <Textarea className="min-h-[100px] py-3" value={content.hero.subtitle} onChange={e => updateHero('subtitle', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CTA Principal</Label>
                                        <Input value={content.hero.cta_primary} onChange={e => updateHero('cta_primary', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nota bajo botones</Label>
                                        <Input value={content.hero.cta_secondary} onChange={e => updateHero('cta_secondary', e.target.value)} />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/10">
                                    <ImageField
                                        label="Imagen Hero Proyectada"
                                        value={content.hero.hero_image}
                                        onChange={(url) => updateHero('hero_image', url)}
                                    />
                                </div>
                            </div>
                        </EliteCard>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-6 mt-6">
                        <EliteCard className="p-8">
                            <h3 className="text-xl font-bold mb-1">Cifras Maestras (Stats)</h3>
                            <p className="text-xs text-muted-foreground mb-6">Efecto de validación social inmediata</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {content.stats.map((stat, i) => (
                                    <div key={i} className="p-6 bg-muted/30 rounded-xl border border-white/5 shadow-inner space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Valor</Label>
                                            <Input value={stat.value} onChange={e => updateStats(i, 'value', e.target.value)} className="font-black text-xl h-12 text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Etiqueta</Label>
                                            <Input value={stat.label} onChange={e => updateStats(i, 'label', e.target.value)} className="font-bold" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </EliteCard>
                    </TabsContent>

                    <TabsContent value="intelligence" className="space-y-6 mt-6">
                        <EliteCard className="p-8">
                            <h3 className="text-xl font-bold mb-6">Módulo de Inteligencia</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Encabezado</Label>
                                    <Input value={content.intelligence.title} onChange={e => updateIntelligence('title', e.target.value)} className="font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subtítulo</Label>
                                    <Textarea value={content.intelligence.subtitle} onChange={e => updateIntelligence('subtitle', e.target.value)} className="min-h-[100px] py-3" />
                                </div>
                                <div className="space-y-4 pt-4">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Puntos Clave</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {content.intelligence.features.map((feat, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</div>
                                                <Input value={feat} onChange={e => updateIntelFeature(i, e.target.value)} className="flex-1 font-medium" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/10">
                                    <ImageField
                                        label="Imagen de Apoyo"
                                        value={content.intelligence.image}
                                        onChange={(url) => updateIntelligence('image', url)}
                                    />
                                </div>
                            </div>
                        </EliteCard>
                    </TabsContent>

                    <TabsContent value="features" className="space-y-6 mt-6">
                        <EliteCard className="p-8">
                            <h3 className="text-xl font-bold mb-6">Red de Beneficios</h3>
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-white/10">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Título Sección</Label>
                                        <Input value={content.features.title} onChange={e => updateFeatures('title', e.target.value)} className="font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subtítulo</Label>
                                        <Input value={content.features.subtitle} onChange={e => updateFeatures('subtitle', e.target.value)} className="font-bold" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {content.features.items.map((item, i) => (
                                        <div key={i} className="p-6 bg-muted/30 rounded-xl border border-white/5 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="w-12 h-12 rounded-xl bg-accent text-primary flex items-center justify-center">
                                                    <Layout className="w-6 h-6" />
                                                </div>
                                                <Badge className="bg-muted text-muted-foreground">Card {i + 1}</Badge>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Icono (Lucide ID)</Label>
                                                    <Input value={item.icon} onChange={e => updateFeatureItem(i, 'icon', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Título</Label>
                                                    <Input value={item.title} onChange={e => updateFeatureItem(i, 'title', e.target.value)} className="font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Descripción</Label>
                                                    <Textarea className="min-h-[80px] py-2" value={item.description} onChange={e => updateFeatureItem(i, 'description', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </EliteCard>
                    </TabsContent>

                    <TabsContent value="testimonials" className="space-y-6 mt-6">
                        <EliteCard className="p-8">
                            <h3 className="text-xl font-bold mb-6">Prueba Social (Testimonios)</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Badge Superior</Label>
                                        <Input value={content.testimonials.badge} onChange={e => updateTestimonials('badge', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Título Principal</Label>
                                        <Input value={content.testimonials.title} onChange={e => updateTestimonials('title', e.target.value)} className="font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cita / Frase del Cliente</Label>
                                    <Textarea value={content.testimonials.quote} onChange={e => updateTestimonials('quote', e.target.value)} className="min-h-[100px] py-3 italic" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/10">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre del Autor</Label>
                                        <Input value={content.testimonials.author} onChange={e => updateTestimonials('author', e.target.value)} className="font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cargo / Rol</Label>
                                        <Input value={content.testimonials.role} onChange={e => updateTestimonials('role', e.target.value)} />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <ImageField
                                        label="Avatar del Autor"
                                        value={content.testimonials.avatar}
                                        onChange={(url) => updateTestimonials('avatar', url)}
                                    />
                                </div>
                            </div>
                        </EliteCard>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6 mt-6">
                        <EliteCard className="p-8">
                            <h3 className="text-xl font-bold mb-6">Certeza Operativa (Seguridad)</h3>
                            <div className="space-y-8">
                                <div className="space-y-2 pb-6 border-b border-white/10">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Título Sección</Label>
                                    <Input value={content.security?.title || ""} onChange={e => updateSecurity('title', e.target.value)} className="font-bold max-w-md" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {content.security?.items?.map((item, i) => (
                                        <div key={i} className="p-6 bg-muted/30 rounded-xl border border-white/5 space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Icono (Lucide ID)</Label>
                                                <Input value={item.icon} onChange={e => updateSecurityItem(i, 'icon', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Título</Label>
                                                <Input value={item.title} onChange={e => updateSecurityItem(i, 'title', e.target.value)} className="font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subtítulo</Label>
                                                <Input value={item.subtitle} onChange={e => updateSecurityItem(i, 'subtitle', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </EliteCard>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de Confirmación */}
            <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                <AlertDialogContent className="bg-card border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">¿Restaurar Diseño Elite?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Estás a punto de sobreescribir todos los textos e imágenes con la versión original de "Visita Médica de Élite". Esto reemplazará lo que tienes actualmente en pantalla. (Tus cambios no serán definitivos hasta que presiones "Guardar Cambios").
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 hover:bg-white/10 text-white border-white/10">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20"
                            onClick={() => {
                                setContent(DEFAULT_LANDING_CONTENT);
                                toast({ title: "Restaurado", description: "Se han cargado los textos por defecto. Haz clic en Guardar Cambios para aplicar." });
                                setShowRestoreDialog(false);
                            }}
                        >
                            Sí, Restaurar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
