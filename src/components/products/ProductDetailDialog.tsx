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
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="mr-2 h-5 w-5 icon-medical" />
              {productData.name}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Descargar Ficha
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="aspect-square bg-gradient-subtle rounded-lg flex items-center justify-center mb-4">
                <Package className="h-24 w-24 text-primary/50" />
              </div>
              {productData.price && (
                <div className="text-center">
                  <span className="text-3xl font-bold text-success">€{productData.price}</span>
                  <p className="text-sm text-muted-foreground">Precio sugerido</p>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-foreground">{productData.name}</h2>
                  <Badge className="bg-primary/10 text-primary">
                    {productData.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{productData.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Área Terapéutica:</label>
                  <p className="text-foreground">{productData.therapeutic_area}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Presentación:</label>
                  <p className="text-foreground">{productData.presentation}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dosificación:</label>
                  <p className="text-foreground">{productData.dosage}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vía de Administración:</label>
                  <p className="text-foreground">Oral</p>
                </div>
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
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Agregar a Favoritos
              </Button>
              <Button size="sm" className="btn-success">
                Solicitar Muestras
              </Button>
              <Button size="sm" className="btn-medical">
                Usar en Visita
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}