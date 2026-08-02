import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Video, FileText, HelpCircle, ChevronDown, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id: string;
  title: string;
  content_type: 'text' | 'video' | 'quiz';
  order_index: number;
  duration_mins: number;
  is_required: boolean;
}

interface Section {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface CourseBuilderProps {
  moduleId: string;
  sections: Section[];
  onRefresh: () => void;
  onEditLesson: (lessonId: string, sectionId: string) => void;
}

const contentTypeConfig = {
  text: { icon: FileText, label: 'Texto', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  video: { icon: Video, label: 'Video', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
  quiz: { icon: HelpCircle, label: 'Quiz', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
};

export default function CourseBuilder({ moduleId, sections, onRefresh, onEditLesson }: CourseBuilderProps) {
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(sections.map(s => s.id)));
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [addingLessonToSection, setAddingLessonToSection] = useState<string | null>(null);
  const [newLessonData, setNewLessonData] = useState({ title: '', content_type: 'text' as const });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      const { error } = await supabase.from('course_sections').insert({
        module_id: moduleId,
        title: newSectionTitle.trim(),
        order_index: sections.length,
      });
      if (error) throw error;
      setNewSectionTitle('');
      setAddingSection(false);
      onRefresh();
      toast({ title: 'Sección creada' });
    } catch (e: any) {
      toast({ title: 'Error al crear sección', description: e.message, variant: 'destructive' });
    }
  };

  const handleUpdateSection = async (sectionId: string) => {
    if (!editingSectionTitle.trim()) return;
    try {
      const { error } = await supabase.from('course_sections')
        .update({ title: editingSectionTitle.trim() })
        .eq('id', sectionId);
      if (error) throw error;
      setEditingSectionId(null);
      onRefresh();
    } catch (e: any) {
      toast({ title: 'Error al actualizar', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('¿Eliminar esta sección y todas sus lecciones?')) return;
    try {
      const { error } = await supabase.from('course_sections').delete().eq('id', sectionId);
      if (error) throw error;
      onRefresh();
      toast({ title: 'Sección eliminada' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleAddLesson = async (sectionId: string, sectionLessonsCount: number) => {
    if (!newLessonData.title.trim()) return;
    try {
      const { error } = await supabase.from('course_lessons').insert({
        section_id: sectionId,
        module_id: moduleId,
        title: newLessonData.title.trim(),
        content_type: newLessonData.content_type,
        order_index: sectionLessonsCount,
        is_required: true,
      });
      if (error) throw error;
      setAddingLessonToSection(null);
      setNewLessonData({ title: '', content_type: 'text' });
      onRefresh();
      toast({ title: 'Lección creada' });
    } catch (e: any) {
      toast({ title: 'Error al crear lección', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('¿Eliminar esta lección?')) return;
    try {
      const { error } = await supabase.from('course_lessons').delete().eq('id', lessonId);
      if (error) throw error;
      onRefresh();
      toast({ title: 'Lección eliminada' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      {/* Sections */}
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        const isEditing = editingSectionId === section.id;

        return (
          <div key={section.id} className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted/80 transition-colors">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
              <button onClick={() => toggleSection(section.id)} className="flex items-center gap-2 flex-1 text-left">
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                {isEditing ? (
                  <Input
                    value={editingSectionTitle}
                    onChange={e => setEditingSectionTitle(e.target.value)}
                    className="h-7 text-sm font-semibold"
                    autoFocus
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdateSection(section.id); if (e.key === 'Escape') setEditingSectionId(null); }}
                  />
                ) : (
                  <span className="text-sm font-semibold text-foreground">{section.title}</span>
                )}
                <Badge variant="outline" className="ml-auto text-xs">{section.lessons.length} lecciones</Badge>
              </button>
              {isEditing ? (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleUpdateSection(section.id)}><Check className="h-3.5 w-3.5 text-emerald-600" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingSectionId(null)}><X className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingSectionId(section.id); setEditingSectionTitle(section.title); }}><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeleteSection(section.id)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></Button>
                </div>
              )}
            </div>

            {/* Lessons */}
            {isExpanded && (
              <div className="divide-y divide-border">
                {section.lessons.sort((a, b) => a.order_index - b.order_index).map((lesson) => {
                  const cfg = contentTypeConfig[lesson.content_type] || contentTypeConfig.text;
                  const Icon = cfg.icon;
                  return (
                    <div key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 group transition-colors">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100" />
                      <div className={`p-1.5 rounded-lg ${cfg.bg} flex-shrink-0`}>
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>
                      <span className="text-sm text-foreground flex-1 truncate">{lesson.title}</span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="outline" className="text-xs">{cfg.label}</Badge>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onEditLesson(lesson.id, section.id)}>
                          <Edit2 className="h-3 w-3 mr-1" /> Editar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeleteLesson(lesson.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Add lesson */}
                {addingLessonToSection === section.id ? (
                  <div className="px-4 py-3 bg-muted/20 flex items-center gap-2">
                    <Input
                      placeholder="Título de la lección..."
                      value={newLessonData.title}
                      onChange={e => setNewLessonData({ ...newLessonData, title: e.target.value })}
                      className="h-8 text-sm flex-1"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleAddLesson(section.id, section.lessons.length); if (e.key === 'Escape') setAddingLessonToSection(null); }}
                    />
                    <select
                      value={newLessonData.content_type}
                      onChange={e => setNewLessonData({ ...newLessonData, content_type: e.target.value as any })}
                      className="h-8 text-xs border border-border rounded-md px-2 bg-background text-foreground"
                    >
                      <option value="text">Texto</option>
                      <option value="video">Video</option>
                      <option value="quiz">Quiz</option>
                    </select>
                    <Button size="sm" className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleAddLesson(section.id, section.lessons.length)}>Añadir</Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setAddingLessonToSection(null)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingLessonToSection(section.id)}
                    className="w-full px-4 py-2 text-xs text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-3.5 w-3.5" /> Añadir lección
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add section */}
      {addingSection ? (
        <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-500/5">
          <Input
            placeholder="Nombre de la sección..."
            value={newSectionTitle}
            onChange={e => setNewSectionTitle(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') setAddingSection(false); }}
          />
          <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white px-3" onClick={handleAddSection}>Crear</Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setAddingSection(false)}><X className="h-3.5 w-3.5" /></Button>
        </div>
      ) : (
        <button
          onClick={() => setAddingSection(true)}
          className="w-full p-3 rounded-xl border-2 border-dashed border-border hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-indigo-600"
        >
          <Plus className="h-4 w-4" /> Añadir Sección
        </button>
      )}
    </div>
  );
}
