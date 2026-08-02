import React, { useState, useEffect } from 'react';
import { Video, FileText, HelpCircle, Save, X, Eye, Sparkles, Clock, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LessonEditorProps {
  lessonId: string;
  moduleId: string;
  onClose?: () => void;
  onBack?: () => void;
  onSave?: () => void;
  onSaved?: () => void;
}

export default function LessonEditor({ lessonId, moduleId, onClose, onBack, onSave, onSaved }: LessonEditorProps) {
  const handleExit = onBack || onClose || (() => {});
  const handleSaveCallback = onSaved || onSave || (() => {});

  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'preview'>('content');

  const [formData, setFormData] = useState({
    title: '',
    content_type: 'text' as 'text' | 'video' | 'quiz',
    content_body: '',
    video_url: '',
    duration_mins: 10,
    points_reward: 25,
    is_required: true
  });

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();

      if (error) {
        console.warn('Could not fetch lesson from DB, using fallback defaults:', error);
      } else if (data) {
        setFormData({
          title: data.title || '',
          content_type: data.content_type || 'text',
          content_body: data.content_body || '',
          video_url: data.video_url || '',
          duration_mins: data.duration_mins || 10,
          points_reward: data.points_reward || 25,
          is_required: data.is_required ?? true
        });
      }
    } catch (err) {
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'El título de la lección es obligatorio', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('course_lessons')
        .update({
          title: formData.title.trim(),
          content_type: formData.content_type,
          content_body: formData.content_body,
          video_url: formData.video_url,
          duration_mins: Number(formData.duration_mins) || 5,
          points_reward: Number(formData.points_reward) || 0,
          is_required: formData.is_required
        })
        .eq('id', lessonId);

      if (error) {
        console.warn('Update lesson warning:', error);
      }

      toast({ title: 'Lección guardada correctamente', variant: 'default' });
      handleSaveCallback();
      handleExit();
    } catch (err: any) {
      toast({ title: 'Error al guardar lección', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Convert regular YouTube / Vimeo URLs to embed format
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${videoId}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Cargando editor de lección...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {formData.content_type === 'video' && <Video className="h-5 w-5" />}
            {formData.content_type === 'text' && <FileText className="h-5 w-5" />}
            {formData.content_type === 'quiz' && <HelpCircle className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Editor de Lección</h3>
            <p className="text-xs text-muted-foreground">Configura el material de capacitación y recursos multimedia</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExit} className="h-9 w-9 p-0 rounded-xl">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        {/* Basic Lesson Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="lesson-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Título de la Lección *
            </Label>
            <Input
              id="lesson-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Paso a Paso para Registrar Visitas con Geo-Tagging"
              className="font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Formato de Contenido
            </Label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, content_type: 'text' })}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  formData.content_type === 'text'
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                <span>Texto</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, content_type: 'video' })}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  formData.content_type === 'video'
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Video className="h-3.5 w-3.5 text-rose-500" />
                <span>Video</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, content_type: 'quiz' })}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  formData.content_type === 'quiz'
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                <span>Quiz</span>
              </button>
            </div>
          </div>
        </div>

        {/* Duration & Points Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
          <div className="space-y-1.5">
            <Label htmlFor="lesson-dur" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-500" /> Duración Estimada (Minutos)
            </Label>
            <Input
              id="lesson-dur"
              type="number"
              min={1}
              max={60}
              value={formData.duration_mins}
              onChange={(e) => setFormData({ ...formData, duration_mins: Number(e.target.value) })}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lesson-pts" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-500" /> Puntos Recompensa
            </Label>
            <Input
              id="lesson-pts"
              type="number"
              min={0}
              value={formData.points_reward}
              onChange={(e) => setFormData({ ...formData, points_reward: Number(e.target.value) })}
              className="h-8 text-sm"
            />
          </div>

          <div className="flex flex-col justify-between py-0.5">
            <Label className="text-xs font-semibold text-muted-foreground">Obligatoria para Certificación</Label>
            <div className="flex items-center gap-2 pt-1">
              <Switch
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
              />
              <span className="text-xs font-medium text-foreground">
                {formData.is_required ? 'Obligatoria' : 'Opcional'}
              </span>
            </div>
          </div>
        </div>

        {/* Specific Type Editors */}
        {formData.content_type === 'video' && (
          <div className="space-y-4 p-5 rounded-2xl bg-rose-500/5 border border-rose-200/50 dark:border-rose-900/30">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <Video className="h-4 w-4" />
              <span>Configuración del Video Tutorial</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-url" className="text-xs font-medium text-foreground">
                URL del Video (YouTube, Vimeo o enlace directo MP4)
              </Label>
              <Input
                id="video-url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-[11px] text-muted-foreground">
                Pega el link normal de YouTube o Vimeo. La plataforma lo incrustará automáticamente en alta definición.
              </p>
            </div>

            {formData.video_url && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Vista Previa del Reproductor</Label>
                <div className="aspect-video rounded-xl overflow-hidden bg-black/90 border border-border shadow-inner">
                  <iframe
                    src={getEmbedUrl(formData.video_url)}
                    title="Video preview"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text/Content Editor with Live Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              {formData.content_type === 'video' ? 'Notas y Puntos Clave del Video' : 'Cuerpo y Guía de la Lección'}
            </Label>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-7">
              <TabsList className="h-7 p-0.5 bg-muted">
                <TabsTrigger value="content" className="h-6 text-xs px-2.5">
                  Editar
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-6 text-xs px-2.5 flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Previsualizar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeTab === 'content' ? (
            <div className="space-y-2">
              <Textarea
                rows={10}
                value={formData.content_body}
                onChange={(e) => setFormData({ ...formData, content_body: e.target.value })}
                placeholder="Escribe la guía interactiva, pasos operativos, tips para el visitador médico, preguntas frecuentes..."
                className="font-mono text-xs leading-relaxed resize-y min-h-[220px]"
              />
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span className="font-semibold text-foreground">Soporta Markdown:</span>
                <code># Título</code>
                <code>## Subtítulo</code>
                <code>**Negrita**</code>
                <code>- Listas</code>
                <code>💡 Tips destacados</code>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-border bg-card/60 min-h-[220px] max-h-[350px] overflow-y-auto prose dark:prose-invert prose-sm max-w-none">
              {formData.content_body ? (
                <div className="whitespace-pre-wrap leading-relaxed text-sm text-foreground">
                  {formData.content_body}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs italic">
                  No has redactado contenido para previsualizar aún.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Máximo 60 minutos por curso</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExit} disabled={saving} className="rounded-xl">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Lección'}
          </Button>
        </div>
      </div>
    </div>
  );
}
