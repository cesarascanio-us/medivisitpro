
import { useState, useEffect } from 'react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { LandingContent, saveLandingContent } from '@/lib/landing-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function LandingEditor() {
    const { content: initialContent, loading: initialLoading } = useLandingContent();
    const [content, setContent] = useState<LandingContent | null>(null);
    const [saving, setSaving] = useState(false);
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

            // Upload the file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('landing-assets')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                toast({ title: "Error al subir", description: "Verifica que el bucket 'landing-assets' exista y sea público.", variant: "destructive" });
                return null;
            }

            // Get Public URL
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

    // Helper Component for Image Fields
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
                <Label>{label}</Label>
                <div className="flex gap-2 items-center">
                    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." className="flex-1" />
                    <div className="relative">
                        <Button type="button" variant="outline" disabled={uploading} className="relative overflow-hidden">
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
                        <img src={value} alt="Preview" className="h-32 object-contain rounded-lg border border-slate-700 bg-slate-900/50" />
                    </div>
                )}
            </div>
        );
    };

    // Helper functions for updating state safely with TS
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

    // For features array inside intelligence
    const updateIntelFeature = (index: number, value: string) => {
        if (!content) return;
        const newFeats = [...content.intelligence.features];
        newFeats[index] = value;
        setContent(prev => prev ? ({ ...prev, intelligence: { ...prev.intelligence, features: newFeats } }) : null);
    };

    const updateFeatures = (field: keyof LandingContent['features'], value: any) => {
        if (!content) return;
        setContent(prev => prev ? ({ ...prev, features: { ...prev.features, [field]: value } }) : null);
    };

    const updateFeatureItem = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
        if (!content) return;
        const newItems = [...content.features.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setContent(prev => prev ? ({ ...prev, features: { ...prev.features, items: newItems } }) : null);
    };

    const updateTestimonials = (field: keyof LandingContent['testimonials'], value: string) => {
        if (!content) return;
        setContent(prev => prev ? ({ ...prev, testimonials: { ...prev.testimonials, [field]: value } }) : null);
    };

    const updateFaq = (index: number, field: 'q' | 'a', value: string) => {
        if (!content) return;
        const newFaq = [...content.faq];
        newFaq[index] = { ...newFaq[index], [field]: value };
        setContent(prev => prev ? ({ ...prev, faq: newFaq }) : null);
    };

    const updateCta = (field: keyof LandingContent['cta'], value: string) => {
        if (!content) return;
        setContent(prev => prev ? ({ ...prev, cta: { ...prev.cta, [field]: value } }) : null);
    };


    if (initialLoading || !content) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500" /></div>;
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Editor de Landing Page</h1>
                    <p className="text-slate-400">Personaliza los textos e imágenes de la página principal.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => window.open('/', '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" /> Ver Página
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Cambios
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="hero" className="w-full">
                <TabsList className="bg-slate-800 text-slate-400 mb-6">
                    <TabsTrigger value="hero">Hero (Inicio)</TabsTrigger>
                    <TabsTrigger value="intelligence">Inteligencia</TabsTrigger>
                    <TabsTrigger value="features">Beneficios</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="cta">Cierre</TabsTrigger>
                </TabsList>

                {/* HERO EDITOR */}
                <TabsContent value="hero" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader><CardTitle>Sección Principal</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Badge Superior</Label>
                                    <Input value={content.hero.badge} onChange={e => updateHero('badge', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Texto Resaltado (Gradiente)</Label>
                                    <Input value={content.hero.title_highlight} onChange={e => updateHero('title_highlight', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Título Principal (Parte 1)</Label>
                                <Input value={content.hero.title_part1} onChange={e => updateHero('title_part1', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtítulo</Label>
                                <Textarea className="h-24" value={content.hero.subtitle} onChange={e => updateHero('subtitle', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Botón Principal</Label>
                                    <Input value={content.hero.cta_primary} onChange={e => updateHero('cta_primary', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Texto Secundario (bajo botones)</Label>
                                    <Input value={content.hero.cta_secondary} onChange={e => updateHero('cta_secondary', e.target.value)} />
                                </div>
                            </div>
                            <ImageField
                                label="Imagen Hero 3D"
                                value={content.hero.hero_image}
                                onChange={(url) => updateHero('hero_image', url)}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader>
                            <CardTitle>Métricas (Stats)</CardTitle>
                            <CardDescription>Los 4 números que aparecen bajo el carrusel.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            {content.stats.map((stat, i) => (
                                <div key={i} className="p-4 border border-slate-800 rounded-lg space-y-2">
                                    <Label>Stat {i + 1} Valor</Label>
                                    <Input value={stat.value} onChange={e => updateStats(i, 'value', e.target.value)} />
                                    <Label>Stat {i + 1} Etiqueta</Label>
                                    <Input value={stat.label} onChange={e => updateStats(i, 'label', e.target.value)} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* INTELLIGENCE EDITOR */}
                <TabsContent value="intelligence" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-700">
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input value={content.intelligence.title} onChange={e => updateIntelligence('title', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtítulo</Label>
                                <Textarea value={content.intelligence.subtitle} onChange={e => updateIntelligence('subtitle', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Características (Lista)</Label>
                                {content.intelligence.features.map((feat, i) => (
                                    <Input key={i} value={feat} onChange={e => updateIntelFeature(i, e.target.value)} className="mb-2" />
                                ))}
                            </div>
                            <ImageField
                                label="Imagen de Sección"
                                value={content.intelligence.image}
                                onChange={(url) => updateIntelligence('image', url)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FEATURES EDITOR */}
                <TabsContent value="features" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader>
                            <CardTitle>Sección de Beneficios</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título Sección</Label>
                                <Input value={content.features.title} onChange={e => updateFeatures('title', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtítulo Sección</Label>
                                <Textarea value={content.features.subtitle} onChange={e => updateFeatures('subtitle', e.target.value)} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {content.features.items.map((item, i) => (
                                    <div key={i} className="p-4 border border-slate-800 rounded-lg space-y-2">
                                        <div className="font-bold text-white mb-2">Card {i + 1}</div>
                                        <Label>Icono (Nombre Lucide)</Label>
                                        <Input value={item.icon} onChange={e => updateFeatureItem(i, 'icon', e.target.value)} />
                                        <Label>Título</Label>
                                        <Input value={item.title} onChange={e => updateFeatureItem(i, 'title', e.target.value)} />
                                        <Label>Descripción</Label>
                                        <Textarea className="h-20" value={item.description} onChange={e => updateFeatureItem(i, 'description', e.target.value)} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TESTIMONIALS EDITOR */}
                <TabsContent value="testimonials" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-700">
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label>Cita Principal</Label>
                                <Textarea className="h-24" value={content.testimonials.quote} onChange={e => updateTestimonials('quote', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Autor</Label>
                                    <Input value={content.testimonials.author} onChange={e => updateTestimonials('author', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rol / Cargo</Label>
                                    <Input value={content.testimonials.role} onChange={e => updateTestimonials('role', e.target.value)} />
                                </div>
                            </div>
                            <ImageField
                                label="Avatar de Testimonio"
                                value={content.testimonials.avatar}
                                onChange={(url) => updateTestimonials('avatar', url)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FAQ EDITOR */}
                <TabsContent value="faq" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader><CardTitle>Preguntas Frecuentes</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {content.faq.map((item, i) => (
                                <div key={i} className="space-y-2 p-4 border border-slate-800 rounded-lg">
                                    <Label>Pregunta {i + 1}</Label>
                                    <Input value={item.q} onChange={e => updateFaq(i, 'q', e.target.value)} />
                                    <Label>Respuesta</Label>
                                    <Textarea value={item.a} onChange={e => updateFaq(i, 'a', e.target.value)} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CTA EDITOR */}
                <TabsContent value="cta" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader><CardTitle>Llamada a la Acción Final</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input value={content.cta.title} onChange={e => updateCta('title', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtítulo</Label>
                                <Textarea value={content.cta.subtitle} onChange={e => updateCta('subtitle', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Texto Botón Primario</Label>
                                    <Input value={content.cta.button_primary} onChange={e => updateCta('button_primary', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Texto Botón Secundario</Label>
                                    <Input value={content.cta.button_secondary} onChange={e => updateCta('button_secondary', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
