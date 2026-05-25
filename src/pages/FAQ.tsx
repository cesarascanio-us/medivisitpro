import { useState, useMemo } from "react";
import { EliteHeader, EliteCard } from "@/components/layout/DesignSystem";
import { HelpCircle, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// Import local JSON data
import faqDataRaw from "@/data/faq_detailed.json";

// Type definition for FAQ Item based on the JSON
interface FAQItem {
  Id_QyA: number;
  "Nombre del Producto": string;
  "Tipo de Pregunta": string;
  "Pregunta del Médico": string;
  "Lógica del Médico": string;
  "Respuesta Técnica del Visitador Médico": string;
}

const faqData = faqDataRaw as FAQItem[];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");

  // Group data by Product
  const dataByProduct = useMemo(() => {
    const grouped: Record<string, FAQItem[]> = {};
    
    faqData.forEach(item => {
      // Filter by search term if provided
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || 
        item["Pregunta del Médico"].toLowerCase().includes(term) ||
        item["Respuesta Técnica del Visitador Médico"].toLowerCase().includes(term) ||
        item["Lógica del Médico"]?.toLowerCase().includes(term) ||
        item["Tipo de Pregunta"].toLowerCase().includes(term);

      if (matchesSearch) {
        const product = item["Nombre del Producto"];
        if (!grouped[product]) grouped[product] = [];
        grouped[product].push(item);
      }
    });

    return grouped;
  }, [searchTerm]);

  const products = Object.keys(dataByProduct).sort();
  const defaultProduct = products.length > 0 ? products[0] : "";

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <EliteHeader 
        title="Preguntas y Respuestas"
        subtitle="Argumentario Clínico y Base de Conocimiento"
        icon={HelpCircle}
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por pregunta, respuesta o categoría..." 
            className="pl-10 h-12 bg-card border-white/5 rounded-2xl shadow-inner font-display"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <EliteCard className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight font-display mb-2">Sin Resultados</h2>
          <p className="text-muted-foreground max-w-md">
            No se encontraron preguntas que coincidan con tu búsqueda. Intenta con otros términos.
          </p>
        </EliteCard>
      ) : (
        <Tabs defaultValue={defaultProduct} className="w-full">
          <div className="overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <TabsList className="inline-flex h-12 items-center justify-start rounded-2xl bg-card p-1 shadow-inner border border-white/5">
              {products.map(product => (
                <TabsTrigger 
                  key={product} 
                  value={product}
                  className="rounded-xl px-6 py-2 font-black uppercase tracking-wider text-[10px] transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  {product}
                  <Badge variant="secondary" className="ml-2 bg-background/50 text-foreground/70">
                    {dataByProduct[product].length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {products.map(product => {
            // Group by Category inside each product
            const byCategory: Record<string, FAQItem[]> = {};
            dataByProduct[product].forEach(item => {
              const cat = item["Tipo de Pregunta"];
              if (!byCategory[cat]) byCategory[cat] = [];
              byCategory[cat].push(item);
            });

            return (
              <TabsContent key={product} value={product} className="space-y-6 mt-0">
                {Object.entries(byCategory).map(([category, items]) => (
                  <EliteCard key={category} className="p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2" />
                      {category}
                    </h3>
                    <Accordion type="multiple" className="w-full space-y-2">
                      {items.map((item, idx) => (
                        <AccordionItem 
                          key={item.Id_QyA || idx} 
                          value={`item-${item.Id_QyA || idx}`}
                          className="border border-white/5 rounded-xl bg-background/50 px-4"
                        >
                          <AccordionTrigger className="text-left font-display font-medium text-foreground/90 hover:text-primary py-4 hover:no-underline">
                            {item["Pregunta del Médico"]}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                            {item["Lógica del Médico"] && (
                              <div className="mb-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                                <strong className="text-blue-400 uppercase text-[10px] tracking-widest block mb-1">Por qué lo pregunta:</strong>
                                <span className="text-foreground/80">{item["Lógica del Médico"]}</span>
                              </div>
                            )}
                            <div className="pl-4 border-l-2 border-primary/30 mt-2">
                              {item["Respuesta Técnica del Visitador Médico"]}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </EliteCard>
                ))}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
