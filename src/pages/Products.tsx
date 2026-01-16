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
import { InstructionCard } from "@/components/ui/InstructionCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { exportToCSV } from "@/utils/exportUtils";
import * as XLSX from 'xlsx';

import { useDemoData } from "@/contexts/MockDataProvider";

export default function Products() {
  const { user, isMaster } = useAuth();
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

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Catálogo de Productos
          </h1>
          <p className="text-muted-foreground">Explora y gestiona tu portafolio médico completo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} title="Ver Ayuda">
            <span className="sr-only">Ayuda</span>
            <Lightbulb className="h-5 w-5 text-yellow-500" />
          </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Productos</p>
                <p className="text-2xl font-bold text-foreground">{productStats.total}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        {Object.entries(productStats.byCategory).slice(0, 3).map(([category, count]) => (
          <Card key={category} className="medical-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground truncate max-w-[150px]">{category}</p>
                  <p className="text-2xl font-bold text-foreground">{count as number}</p>
                </div>
                <Package className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos, principios activos, categorías..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Ayuda de Importación">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Estructura de Archivo para Importación</DialogTitle>
                <DialogDescription>Para importar productos, utiliza un archivo Excel o CSV con estas columnas:</DialogDescription>
              </DialogHeader>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Columna</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Ejemplo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">Nombre</TableCell>
                      <TableCell>Nombre del producto (Obligatorio)</TableCell>
                      <TableCell>CardioMax Pro</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">Categoria</TableCell>
                      <TableCell>Categoría (General por defecto)</TableCell>
                      <TableCell>Cardiovascular</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">Principios Activos</TableCell>
                      <TableCell>Ingredientes activos</TableCell>
                      <TableCell>Losartán 50mg</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">Precio</TableCell>
                      <TableCell>Precio unitario</TableCell>
                      <TableCell>45.99</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={triggerImport} disabled={importing} title="Importar desde Excel">
            {importing ? <FileSpreadsheet className="h-4 w-4 animate-pulse md:mr-2" /> : <Upload className="h-4 w-4 md:mr-2" />}
            <span className="hidden md:inline">Importar</span>
          </Button>

          <Button variant="outline" onClick={handleExport} title="Exportar a CSV">
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Exportar</span>
          </Button>

          <ProductFormDialog
            onSuccess={loadProducts}
            trigger={
              <Button className="btn-medical">
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Nuevo Producto</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Products Grid */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grid">Vista Rejilla</TabsTrigger>
          <TabsTrigger value="list">Vista Lista</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-white border border-slate-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-200 group">
                <CardContent className="p-4">
                  {/* Header with icon and actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg flex items-center justify-center border border-emerald-100">
                      <Package className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 ${isFavorite(product.id) ? 'text-red-500' : 'text-slate-400'} hover:text-red-500`}
                        onClick={(e) => handleToggleFavorite(e, product.id)}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                      </Button>
                      <ProductFormDialog
                        productToEdit={product}
                        onSuccess={loadProducts}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-emerald-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => handleDelete(product.id, product.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2 min-h-[40px]">
                    {product.name}
                  </h3>

                  {/* Category & Price */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 font-medium">
                      {product.category || 'General'}
                    </Badge>
                    {product.price && (
                      <span className="text-sm font-bold text-emerald-600">
                        ${product.price}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <ProductDetailDialog
                      trigger={
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50">
                          <Eye className="mr-1.5 h-3 w-3" />
                          Detalles
                        </Button>
                      }
                      productData={product}
                    />

                    <ProductSamplesDialog
                      trigger={
                        <Button size="sm" className="flex-1 h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                          Muestras
                        </Button>
                      }
                      productData={product}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No se encontraron productos. ¡Crea uno nuevo o importa un archivo CSV!
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="medical-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                        <div className="flex items-center space-x-2">
                          <ProductFormDialog
                            productToEdit={product}
                            onSuccess={loadProducts}
                            trigger={
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                                <Edit className="h-4 w-4 mr-1" /> Editar
                              </Button>
                            }
                          />
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(product.id, product.name)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {product.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm font-medium text-success">€{product.price || '0.00'}</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{product.description}</p>

                      <div className="flex items-center space-x-2 mt-4">
                        <ProductDetailDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-3 w-3" />
                              Ver Detalles
                            </Button>
                          }
                          productData={product}
                        />
                        <ProductSamplesDialog
                          trigger={
                            <Button size="sm" className="btn-success">
                              Gestionar Muestras
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

        <TabsContent value="favorites" className="mt-6">
          {favoritesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : getFavoriteProductIds().length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tienes favoritos aún</h3>
              <p>Haz clic en el corazón de cualquier producto para agregarlo a tu lista.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products
                .filter(product => isFavorite(product.id))
                .map((product) => (
                  <Card key={product.id} className="bg-white border border-slate-200 hover:shadow-lg hover:border-red-300 transition-all duration-200 group">
                    <CardContent className="p-4">
                      {/* Header with icon and actions */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg flex items-center justify-center border border-red-100">
                          <Package className="h-6 w-6 text-red-400" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={(e) => handleToggleFavorite(e, product.id)}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2 min-h-[40px]">
                        {product.name}
                      </h3>

                      {/* Category & Price */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 font-medium">
                          {product.category || 'General'}
                        </Badge>
                        {product.price && (
                          <span className="text-sm font-bold text-emerald-600">
                            ${product.price}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <ProductDetailDialog
                          trigger={
                            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50">
                              <Eye className="mr-1.5 h-3 w-3" />
                              Detalles
                            </Button>
                          }
                          productData={product}
                        />

                        <ProductSamplesDialog
                          trigger={
                            <Button size="sm" className="flex-1 h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                              Muestras
                            </Button>
                          }
                          productData={product}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div >
  );
}