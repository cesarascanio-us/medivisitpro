import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, MessageSquare, CheckCircle2, Info } from 'lucide-react';

interface RichLessonRendererProps {
  content: string;
}

export function RichLessonRenderer({ content }: RichLessonRendererProps) {
  if (!content) return null;

  // Split content by major sections (e.g. headers or lines)
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentBlockQuote: string[] = [];
  let inBlockQuote = false;

  const flushBlockQuote = (idx: number) => {
    if (currentBlockQuote.length > 0) {
      const text = currentBlockQuote.join(' ');
      const isBrain = text.includes('🧠') || text.toLowerCase().includes('lógica');
      elements.push(
        <div
          key={`bq-${idx}`}
          className={`my-4 p-4 rounded-2xl border ${
            isBrain
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-200'
          } shadow-sm flex items-start gap-3`}
        >
          {isBrain ? (
            <Brain className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
          )}
          <div className="text-xs md:text-sm font-medium leading-relaxed">
            {text.replace(/^>\s*/, '').replace(/\*\*/g, '')}
          </div>
        </div>
      );
      currentBlockQuote = [];
      inBlockQuote = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for Image tag: ![Alt text](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      flushBlockQuote(index);
      const altText = imgMatch[1];
      const imgUrl = imgMatch[2];
      elements.push(
        <div key={`img-${index}`} className="my-6 flex flex-col items-center justify-center">
          <div className="relative group max-w-sm w-full bg-gradient-to-b from-muted/30 to-muted/10 rounded-3xl p-6 border border-border shadow-md flex items-center justify-center overflow-hidden">
            <img
              src={imgUrl}
              alt={altText}
              className="max-h-72 object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {altText && (
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-2">
              {altText}
            </span>
          )}
        </div>
      );
      return;
    }

    // Check for Blockquote
    if (trimmed.startsWith('>')) {
      inBlockQuote = true;
      currentBlockQuote.push(trimmed);
      return;
    } else if (inBlockQuote) {
      flushBlockQuote(index);
    }

    // Level 2 Heading: ## Title
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight mt-6 mb-3 flex items-center gap-2 border-b border-border/50 pb-2"
        >
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          {trimmed.replace('## ', '')}
        </h2>
      );
      return;
    }

    // Level 3 Heading: ### Title
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-sm md:text-base font-bold text-foreground mt-6 mb-2 flex items-center gap-2 text-indigo-700 dark:text-indigo-300"
        >
          {trimmed.replace('### ', '')}
        </h3>
      );
      return;
    }

    // Level 4 Heading: #### Title
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <div
          key={`h4-${index}`}
          className="font-bold text-xs md:text-sm text-foreground bg-muted/40 px-3.5 py-2 rounded-xl mt-4 mb-2 border-l-4 border-indigo-600"
        >
          {trimmed.replace('#### ', '')}
        </div>
      );
      return;
    }

    // Divider: ---
    if (trimmed === '---') {
      elements.push(<hr key={`hr-${index}`} className="my-6 border-border/40" />);
      return;
    }

    // Technical Answer Highlight
    if (trimmed.includes('**💬 Respuesta Técnica Sugerida del Representante:**')) {
      elements.push(
        <div key={`ans-label-${index}`} className="mt-3 mb-1.5 flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          <MessageSquare className="h-4 w-4" />
          <span>Respuesta Técnica Oficial Recomendada</span>
        </div>
      );
      return;
    }

    // Regular Paragraph
    if (trimmed.length > 0) {
      elements.push(
        <p
          key={`p-${index}`}
          className="text-xs md:text-sm text-muted-foreground leading-relaxed font-normal"
        >
          {trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}
        </p>
      );
    }
  });

  flushBlockQuote(lines.length);

  return <div className="space-y-3">{elements}</div>;
}
