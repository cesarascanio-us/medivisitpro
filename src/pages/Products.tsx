/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useRef } from "react";
import { Package, Plus, Search, Filter, Eye, Download, Heart, Upload, Loader2, Edit, Trash2, Lightbulb, HelpCircle, FileSpreadsheet, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductDetailDialog } from "@/components/products/ProductDetailDialog";
import { ProductSamplesDialog } from "@/components/products/ProductSamplesDialog";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { ProductDetailView } from "@/components/catalog/ProductDetailView";
import { InstructionCard } from "@/components/ui/InstructionCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { exportToCSV } from "@/utils/exportUtils";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";

import { useDemoData } from "@/contexts/MockDataProvider";

export default function Products() {
  const { user, isMaster, organizationId } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();
  const { isFavorite, toggleFavorite, getFavoriteProductIds, loading: favoritesLoading } = useFavorites();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showProductView, setShowProductView] = useState(false);
  const demoData = useDemoData();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      if (demoData) {
        console.log("Products: Loading demo products");
        setProducts(demoData.products || []);
        return;
      }

      console.log("DEBUG: Query Organization ID:", organizationId);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', organizationId) // Make sure this matches!
        .order('name', { ascending: true });

      console.log("DEBUG: Products Fetch Result:", { dataLength: data?.length, error }); // NEW DEBUG LOG

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error de carga",
        description: "No se pudieron cargar los productos. Verificando conexión.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.therapeutic_area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.active_ingredients?.some((ingredient: string) =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    await toggleFavorite(productId);
  };

  const handleExport = () => {
    if (filteredProducts.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay productos para exportar.",
        variant: "destructive"
      });
      return;
    }

    // Format for export - flatten arrays if needed
    const exportData = filteredProducts.map(p => ({
      ...p,
      active_ingredients: Array.isArray(p.active_ingredients) ? p.active_ingredients.join(", ") : p.active_ingredients,
      document_urls: Array.isArray(p.document_urls) ? p.document_urls.join(", ") : p.document_urls
    }));

    exportToCSV(exportData, `productos_${new Date().toISOString().split('T')[0]}`);
    toast({
      title: "Exportación exitosa",
      description: "El catálogo se ha descargado correctamente."
    });
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const XLSX = await import('xlsx');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (!jsonData || jsonData.length === 0) {
            throw new Error("El archivo está vacío o no tiene el formato correcto.");
          }

          const productsToInsert = jsonData.map((row: any) => ({
            user_id: user?.id,
            // Basic
            product_code: row['Codigo'] || row['codigo'] || row['Código'] || row['Product Code'] || row['ID_Producto'] || null,
            name: row['Nombre'] || row['nombre'] || row['Name'] || row['Nombre del Producto'] || '',
            active_ingredients: row['Principios Activos'] || row['principios_activos'] || row['Active Ingredients'] || null,
            presentation: row['Presentacion'] || row['presentacion'] || row['Presentación'] || row['Composicion'] || row['Presentation'] || null,
            category: row['Categoria'] || row['categoria'] || row['Categoría'] || row['Category'] || 'General',

            // Medical
            indications: row['Indicaciones'] || row['indicaciones'] || row['Indications'] || null,
            medical_specialties: row['Especialidades'] || row['especialidades'] || row['Medical Specialties'] || null,
            dosage: row['Dosificacion'] || row['dosificacion'] || row['Dosificación'] || row['Dosage'] || null,
            safety_info: row['Seguridad'] || row['seguridad'] || row['Safety'] || row['Contraindicaciones'] || null,

            // Resources
            key_message: row['Mensaje Clave'] || row['mensaje_clave'] || row['Key Message'] || null,
            image_url: row['Imagen'] || row['imagen'] || row['Image'] || row['Image URL'] || null,
            pdf_link: row['PDF'] || row['pdf'] || row['Link PDF'] || row['PDF Link'] || null,

            // Legacy
            description: row['Descripcion'] || row['descripcion'] || row['Descripción'] || row['Description'] || null,
            therapeutic_area: row['Area Terapeutica'] || row['area_terapeutica'] || row['Área Terapéutica'] || row['Therapeutic Area'] || null,
            price: (row['Precio'] || row['precio'] || row['Price']) ? parseFloat(String(row['Precio'] || row['precio'] || row['Price']).replace(/[^0-9.]/g, '')) : null,
            contraindications: row['Contraindicaciones'] || row['contraindicaciones'] || null,
            side_effects: row['Efectos Secundarios'] || row['efectos_secundarios'] || row['Side Effects'] || null
          })).filter(p => p.name);

          if (productsToInsert.length === 0) {
            throw new Error("No se encontraron productos válidos para importar.");
          }

          const { error } = await supabase
            .from('products')
            .insert(productsToInsert);

          if (error) throw error;

          toast({
            title: "Importación completa",
            description: `Se han importado ${productsToInsert.length} productos correctamente.`
          });
          loadProducts();

        } catch (error: any) {
          console.error("Import parsing error:", error);
          toast({
            title: "Error de Importación",
            description: error.message || "Hubo un error al procesar el archivo.",
            variant: "destructive"
          });
        } finally {
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File reading error:", error);
      setImporting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${name}"?`)) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente."
      });
      loadProducts();
    }
  }

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const productStats = {
    total: products.length,
    byCategory: categories.reduce((acc, cat) => {
      acc[cat] = products.filter(p => p.category === cat).length;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".csv"
        className="hidden"
      />

      {/* Header - SCIENTIFIC VAULT */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 bg-card p-10 rounded-[3rem] border border-slate-100 shadow-premium-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-primary/10" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-500 text-white">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight leading-none">Catálogo de Productos</h1>
            <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Gestión de inventario y vademécum farmacéutico
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} className="w-12 h-12 rounded-xl hover:bg-amber-50 text-amber-500 transition-all">
            <Lightbulb className="h-6 w-6" />
          </Button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden xl:block" />
          <ProductFormDialog
            onSuccess={loadProducts}
            trigger={
              <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-md rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Producto
              </Button>
            }
          />
        </div>
      </div>

      {showHelp && (
        <InstructionCard
          title="Gestión de Productos"
          description="Aquí administras tu catálogo de medicamentos y muestras. Puedes filtrar, editar o agregar nuevos productos."
          items={[
            "Usa 'Importar' para cargar productos masivamente desde Excel.",
            "En la pestaña 'Favoritos' verás los productos que has marcado con el corazón.",
            "Puedes gestionar el stock de muestras directamente desde cada tarjeta de producto."
          ]}
        />
      )}

      {/* Stats Cards */}
      {/* Stats Cards - INVENTORY INTELLIGENCE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-100 shadow-sm bg-card rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total productos</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{productStats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:scale-110 transition-transform duration-500">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(productStats.byCategory).slice(0, 3).map(([category, count], i) => (
          <Card key={category} className="border-slate-100 shadow-sm bg-card rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 truncate max-w-[150px]">{category}</p>
                  <p className="text-3xl font-bold text-foreground tracking-tight">{count as number}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 group-hover:rotate-12 transition-all duration-500 text-slate-900">
                   <div className={cn("w-3 h-3 rounded-full", i % 2 === 0 ? "bg-blue-400" : "bg-emerald-400")} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Bar - PRECISION TOOLS */}
      <Card className="border-slate-100 shadow-sm bg-card rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <Input
                placeholder="Buscar por nombre, principio activo o indicación..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-12 pl-12 bg-slate-50 border-none focus-visible:ring-primary rounded-xl font-semibold text-xs shadow-inner placeholder:text-slate-400 text-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-12 w-full md:w-64 bg-slate-50 border-none focus:ring-primary rounded-xl font-bold text-xs shadow-inner text-slate-900">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 font-bold text-xs">
                  <SelectItem value="all">Todos los productos</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden xl:block" />

              <Button variant="outline" onClick={triggerImport} disabled={importing} className="h-12 px-6 border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-primary" />}
                Importar
              </Button>

              <Button variant="outline" onClick={handleExport} className="h-12 px-6 border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                Exportar
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setHelpDialogOpen(true)} className="h-12 w-12 border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-400">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-2xl bg-card rounded-[2.5rem] border-none shadow-premium-2xl p-0 overflow-hidden font-display">
          <div className="bg-slate-50 p-8 border-b border-slate-100 text-slate-900">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Estructura de Manifiesto</h3>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Sincronización de Inventario Científico</p>
          </div>
          <div className="p-10">
            <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-soft">
              <Table>
                <TableHeader className="bg-slate-50 text-slate-900">
                  <TableRow>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-foreground py-4 px-6">Columna</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-foreground py-4 px-6">Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { col: 'Nombre', desc: 'Denominación comercial del producto *Requerido' },
                    { col: 'Categoria', desc: 'Línea terapéutica o clasificación' },
                    { col: 'Principios Activos', desc: 'Composición química principal' },
                    { col: 'Precio', desc: 'Valor unitario de mercado' },
                  ].map((row, i) => (
                    <TableRow key={i} className="border-slate-50">
                      <TableCell className="font-black text-[11px] text-primary uppercase py-4 px-6">{row.col}</TableCell>
                      <TableCell className="text-[10px] font-bold text-slate-500 uppercase tracking-tight py-4 px-6">{row.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setHelpDialogOpen(false)} className="h-12 bg-slate-900 text-white rounded-xl px-10 font-black uppercase text-[10px] tracking-widest shadow-premium-md">Entendido</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Products Display - MASTER VIEWSET */}
      <Tabs defaultValue="grid" className="w-full space-y-8">
        <TabsList className="flex w-full md:w-[400px] p-1 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
          <TabsTrigger value="grid" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9">Cuadrícula</TabsTrigger>
          <TabsTrigger value="list" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-9">Lista</TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1 rounded-lg font-bold text-[11px] data-[state=active]:bg-card data-[state=active]:text-rose-500 data-[state=active]:shadow-sm transition-all h-9">Favoritos</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-slate-100 shadow-sm bg-card rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-500 group">
                <CardContent className="p-4">
                  {/* Product Image */}
                  <div className="relative mb-4 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 text-slate-900">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-10 w-10 text-slate-200" />
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <Button variant="white" size="icon" className="h-8 w-8 rounded-lg shadow-premium-sm text-slate-400 hover:text-rose-500" onClick={(e) => handleToggleFavorite(e, product.id)}>
                         <Heart className={cn("h-4 w-4", isFavorite(product.id) && "fill-rose-500 text-rose-500")} />
                       </Button>
                       <ProductFormDialog
                          productToEdit={product}
                          onSuccess={loadProducts}
                          trigger={
                            <Button variant="white" size="icon" className="h-8 w-8 rounded-lg shadow-premium-sm text-slate-400 hover:text-primary">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Badge className="bg-slate-100 text-slate-400 border-none font-bold text-[8px] h-4 px-2 uppercase tracking-wider mb-2">
                        {product.category || 'General'}
                      </Badge>
                      <h3 className="text-xs font-bold text-foreground tracking-tight line-clamp-2 min-h-[32px] leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                       <p className="text-base font-bold text-foreground tracking-tight">${product.price || '0.00'}</p>
                       <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-primary hover:bg-slate-50">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-[3rem]">
                              <ProductDetailView productId={product.id} onBack={() => {}} />
                            </DialogContent>
                          </Dialog>
                          <ProductSamplesDialog
                            trigger={
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-primary hover:bg-slate-50">
                                <Package className="h-4 w-4" />
                              </Button>
                            }
                            productData={product}
                          />
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-slate-100 shadow-premium-sm bg-card rounded-[2rem] overflow-hidden hover:shadow-premium-md hover:border-primary/20 transition-all duration-500 group">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors text-slate-900">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <Package className="h-8 w-8 text-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-3">
                         <h3 className="text-lg font-black text-foreground tracking-tighter uppercase font-display group-hover:text-primary transition-colors">{product.name}</h3>
                         <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[8px] h-4 px-2 uppercase tracking-widest">{product.category || 'General'}</Badge>
                       </div>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-tight line-clamp-1">{product.description || "Sin descripción científica disponible"}</p>
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-50">
                       <p className="text-xl font-black text-foreground font-display tracking-tighter">${product.price || '0.00'}</p>
                       <div className="flex gap-2">
                          <ProductSamplesDialog
                            trigger={
                              <Button variant="outline" className="h-10 px-6 border-slate-200 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-50 transition-all">Muestras</Button>
                            }
                            productData={product}
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="h-10 w-10 bg-slate-900 text-white rounded-xl shadow-premium-md flex items-center justify-center hover:bg-slate-800 transition-all"><Eye className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-[3rem]">
                              <ProductDetailView productId={product.id} onBack={() => {}} />
                            </DialogContent>
                          </Dialog>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {getFavoriteProductIds().length === 0 ? (
            <PremiumEmptyState
              icon={Heart}
              title="Sin favoritos"
              description="Marca los productos más importantes con el icono del corazón para acceder rápidamente a ellos."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products
                .filter(product => isFavorite(product.id))
                .map((product) => (
                  <Card key={product.id} className="border-red-50 shadow-premium-sm bg-card rounded-[2.5rem] overflow-hidden hover:shadow-premium-md hover:border-red-200 transition-all duration-500 group">
                    <CardContent className="p-6">
                      <div className="relative mb-6 rounded-[1.5rem] overflow-hidden bg-red-50/30 border border-red-50 aspect-square flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-12 w-12 text-red-100" />
                        )}
                        <Button variant="white" size="icon" className="absolute top-3 right-3 h-8 w-8 rounded-lg shadow-premium-sm text-red-500 hover:text-red-600" onClick={(e) => handleToggleFavorite(e, product.id)}>
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-foreground tracking-tight uppercase font-display line-clamp-2 min-h-[40px] leading-tight">{product.name}</h3>
                        <div className="flex items-center justify-between pt-4 border-t border-red-50">
                           <p className="text-lg font-black text-foreground font-display tracking-tighter">${product.price || '0.00'}</p>
                           <ProductSamplesDialog
                              trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50">
                                  <Package className="h-4 w-4" />
                                </Button>
                              }
                              productData={product}
                            />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
