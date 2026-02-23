/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Package, FileText, Download, Heart, Share2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ProductDetailDialogProps {
  trigger: React.ReactNode;
  productData: any;
}

export function ProductDetailDialog({ trigger, productData }: ProductDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-slate-900 px-8 py-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Package className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight m-0 uppercase line-clamp-1">{productData.name}</DialogTitle>
                <p className="text-indigo-200/50 text-[10px] font-black uppercase tracking-widest mt-1">Dossier Científico & Comercial</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white/10 text-white">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white/10 text-white">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="aspect-square bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mb-6 overflow-hidden">
                <Package className="h-16 w-16 text-slate-200" />
              </div>
              {productData.price && (
                <div className="text-center bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
                  <span className="text-3xl font-black text-indigo-600 tracking-tighter">${productData.price}</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Market Value</p>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{productData.name}</h2>
                  <Badge className="bg-indigo-600/10 text-indigo-700 font-black uppercase text-[10px] tracking-widest px-3 py-1 border-none">
                    {productData.category}
                  </Badge>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed">{productData.description || 'Sin descripción disponible para este producto en el catálogo maestro.'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Área Terapéutica</label>
                  <p className="text-slate-800 font-bold">{productData.therapeutic_area || 'General'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Presentación</label>
                  <p className="text-slate-800 font-bold">{productData.presentation || 'No especificada'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Dosificación</label>
                  <p className="text-slate-800 font-bold">{productData.dosage || 'Consulte prospecto'}</p>
                </div>
                <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold text-slate-600 justify-start px-4">
                  <Download className="mr-2 h-4 w-4 text-indigo-500" /> Descargar Prospecto PDF
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Details Tabs */}
          <Tabs defaultValue="composition" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="composition">Composición</TabsTrigger>
              <TabsTrigger value="indications">Indicaciones</TabsTrigger>
              <TabsTrigger value="contraindications">Contraindicaciones</TabsTrigger>
              <TabsTrigger value="effects">Efectos</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="composition" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Principios Activos</h3>
                {productData.active_ingredients && productData.active_ingredients.length > 0 ? (
                  <div className="space-y-2">
                    {productData.active_ingredients.map((ingredient: string, index: number) => (
                      <div key={index} className="flex items-center p-3 bg-muted/50 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-success mr-3" />
                        <span className="text-foreground font-medium">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Información no disponible</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Información Adicional</h4>
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <p className="text-sm text-foreground">
                    Este medicamento ha sido formulado con los más altos estándares de calidad
                    farmacéutica. Todos los principios activos han demostrado eficacia clínica
                    en estudios controlados.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="indications" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Indicaciones Terapéuticas</h3>
                <div className="bg-success/5 border border-success/20 p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">
                    {productData.indications || "Información no disponible"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Población Objetivo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">Adultos</div>
                    <div className="text-sm text-muted-foreground">18+ años</div>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-lg">
                    <div className="text-2xl font-bold text-warning">Supervisión</div>
                    <div className="text-sm text-muted-foreground">Médica requerida</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contraindications" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Contraindicaciones</h3>
                <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-0.5" />
                    <p className="text-foreground whitespace-pre-wrap">
                      {productData.contraindications || "Información no disponible"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Precauciones Especiales</h4>
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-warning mr-3" />
                    <span className="text-foreground">Embarazo y lactancia: consultar con médico</span>
                  </div>
                  <div className="flex items-center p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-warning mr-3" />
                    <span className="text-foreground">Interacciones medicamentosas posibles</span>
                  </div>
                  <div className="flex items-center p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-warning mr-3" />
                    <span className="text-foreground">Función renal y hepática comprometida</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Efectos Secundarios</h3>
                <div className="bg-warning/5 border border-warning/20 p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">
                    {productData.side_effects || "Información no disponible"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Frecuencia de Efectos</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Frecuentes ({'>'}10%)</span>
                      <span className="font-medium text-foreground">Leves</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Ocasionales (1-10%)</span>
                      <span className="font-medium text-foreground">Moderados</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Raros ({'<'}1%)</span>
                      <span className="font-medium text-foreground">Severos</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-destructive h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Documentación Técnica</h3>
                {productData.document_urls && productData.document_urls.length > 0 ? (
                  <div className="space-y-3">
                    {productData.document_urls.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <p className="font-medium text-foreground">{doc}</p>
                            <p className="text-sm text-muted-foreground">Documento PDF</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay documentos disponibles</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Documentos Adicionales</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Monografía del Producto
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Estudios de Seguridad
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Guía de Prescripción
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Material para Pacientes
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t px-8 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Data Sync: {new Date().toLocaleDateString('es-ES')}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 font-bold text-slate-500">
                Favoritos
              </Button>
              <Button className="h-10 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                Usar en Visita
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}