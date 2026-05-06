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
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";
import { cn } from "@/lib/utils";

import { useDemoData } from "@/contexts/MockDataProvider";

export default function Products() {
  const { user, isMaster, organizationId } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();
  const { isFavorite, toggleFavorite, getFavoriteProductIds } = useFavorites();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const demoData = useDemoData();

  useEffect(() => {
    loadProducts();
  }, [organizationId]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      if (demoData) {
        setProducts(demoData.products || []);
        return;
      }

      if (!organizationId) {
          setLoading(false);
          return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error de carga",
        description: "No se pudieron cargar los productos.",
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
      toast({ title: "Sin datos", description: "No hay productos para exportar.", variant: "destructive" });
      return;
    }

    const exportData = filteredProducts.map(p => ({
      ...p,
      active_ingredients: Array.isArray(p.active_ingredients) ? p.active_ingredients.join(", ") : p.active_ingredients,
      document_urls: Array.isArray(p.document_urls) ? p.document_urls.join(", ") : p.document_urls
    }));

    exportToCSV(exportData, `productos_${new Date().toISOString().split('T')[0]}`);
    toast({ title: "Exportación exitosa", description: "El catálogo se ha descargado correctamente." });
  };

  const triggerImport = () => fileInputRef.current?.click();

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

          if (!jsonData || jsonData.length === 0) throw new Error("El archivo está vacío.");

          const productsToInsert = jsonData.map((row: any) => ({
            user_id: user?.id,
            organization_id: organizationId,
            product_code: row['Codigo'] || row['codigo'] || row['ID_Producto'] || null,
            name: row['Nombre'] || row['nombre'] || '',
            active_ingredients: row['Principios Activos'] || row['principios_activos'] || null,
            presentation: row['Presentacion'] || row['presentacion'] || null,
            category: row['Categoria'] || row['categoria'] || 'General',
            indications: row['Indicaciones'] || row['indicaciones'] || null,
            therapeutic_area: row['Area Terapeutica'] || row['area_terapeutica'] || null,
            price: row['Precio'] ? parseFloat(String(row['Precio']).replace(/[^0-9.]/g, '')) : null,
          })).filter(p => p.name);

          if (productsToInsert.length === 0) throw new Error("No se encontraron productos válidos.");

          const { error } = await supabase.from('products').insert(productsToInsert);
          if (error) throw error;

          toast({ title: "Importación completa", description: `Se han importado ${productsToInsert.length} productos.` });
          loadProducts();
        } catch (error: any) {
          toast({ title: "Error de Importación", description: error.message, variant: "destructive" });
        } finally {
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setImporting(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const productStats = {
    total: products.length,
    byCategory: categories.reduce((acc, cat) => {
      acc[cat] = products.filter(p => p.category === cat).length;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-8 pb-10">
      <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />

      <EliteHeader
        title="Vademécum Alpha"
        subtitle="Gestión de Inteligencia de Producto e Inventario Científico"
        icon={Package}
        badgeText="Sincronizado"
        statusText={`${products.length} Activos en Red`}
        statusColor="bg-emerald-500"
        rightContent={
          <div className="flex items-center gap-4">
            <ProductFormDialog
              onSuccess={loadProducts}
              trigger={
                <Button className="btn-elite-primary h-12 px-8">
                  <Plus className="h-5 w-5 mr-2" /> Alta de Producto
                </Button>
              }
            />
            <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)} className="w-12 h-12 rounded-xl hover:bg-amber-50 text-amber-500 transition-all">
              <Lightbulb className="h-6 w-6" />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EliteKPICard title="Total Activos" value={productStats.total} icon={Package} color="blue" subtitle="Inventario General" />
        {Object.entries(productStats.byCategory).slice(0, 3).map(([category, count], i) => (
          <EliteKPICard key={category} title={category} value={count as number} icon={Package} color={i % 2 === 0 ? "indigo" : "emerald"} subtitle="Segmento Red" />
        ))}
      </div>

      <Card className="card-elite p-6 border border-border/40 bg-card rounded-[2rem] shadow-premium-sm">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="LOCALIZAR POR NOMBRE, PRINCIPIO ACTIVO O INDICACIÓN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-14 pl-16 bg-muted/10 border-none focus-visible:ring-primary/20 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-inner placeholder:text-muted-foreground/30 text-foreground"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-14 w-full md:w-64 bg-muted/10 border-none focus:ring-primary/20 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-inner text-foreground px-8">
                <SelectValue placeholder="CATEGORÍA" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/40 bg-card font-black text-[10px] uppercase tracking-widest">
                <SelectItem value="all">TODOS LOS PRODUCTOS</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="h-8 w-[1px] bg-border/40 mx-2 hidden xl:block" />
            <Button variant="outline" onClick={triggerImport} disabled={importing} className="h-14 px-8 border-border/40 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 hover:text-primary transition-all shadow-premium-sm flex items-center gap-3">
              {importing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />} Importar
            </Button>
            <Button variant="outline" onClick={handleExport} className="h-14 px-8 border-border/40 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 hover:text-primary transition-all shadow-premium-sm flex items-center gap-3">
              <Download className="h-5 w-5" /> Exportar
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setHelpDialogOpen(true)} className="h-14 w-14 border border-border/40 rounded-2xl bg-muted/10 shadow-inner hover:bg-card text-muted-foreground hover:text-primary transition-all">
              <HelpCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="grid" className="w-full space-y-8">
        <TabsList className="flex w-full md:w-[400px] p-1 bg-muted/10 rounded-2xl border border-border/40 shadow-inner">
          <TabsTrigger value="grid" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary transition-all h-10">Cuadrícula</TabsTrigger>
          <TabsTrigger value="list" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary transition-all h-10">Lista</TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:text-rose-500 transition-all h-10">Favoritos</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} loadProducts={loadProducts} isFavorite={isFavorite(product.id)} toggleFavorite={toggleFavorite} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductListItem key={product.id} product={product} loadProducts={loadProducts} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {products.filter(p => isFavorite(p.id)).length === 0 ? (
            <PremiumEmptyState icon={Heart} title="Sin favoritos" description="Marca productos para acceso rápido." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.filter(p => isFavorite(p.id)).map((product) => (
                <ProductCard key={product.id} product={product} loadProducts={loadProducts} isFavorite={true} toggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductCard({ product, loadProducts, isFavorite, toggleFavorite }: any) {
  return (
    <Card className="border-border/40 shadow-premium-sm bg-card rounded-[2rem] overflow-hidden hover:shadow-premium-md hover:border-primary/20 transition-all duration-500 group">
      <CardContent className="p-4">
        <div className="relative mb-4 rounded-[1.5rem] overflow-hidden bg-muted/10 border border-border/40 aspect-square flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="h-10 w-10 text-muted-foreground/20" />
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg shadow-premium-sm" onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}>
              <Heart className={cn("h-4 w-4", isFavorite && "fill-rose-500 text-rose-500")} />
            </Button>
            <ProductFormDialog productToEdit={product} onSuccess={loadProducts} trigger={
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg shadow-premium-sm"><Edit className="h-4 w-4" /></Button>
            } />
          </div>
        </div>
        <div className="space-y-3">
          <Badge className="bg-muted/20 text-muted-foreground border-none font-black text-[8px] h-4 px-2 uppercase tracking-widest">{product.category || 'General'}</Badge>
          <h3 className="text-xs font-black text-foreground tracking-tight line-clamp-2 min-h-[32px] leading-tight uppercase font-display">{product.name}</h3>
          <div className="flex items-center justify-between pt-3 border-t border-border/10">
            <p className="text-base font-black text-foreground font-display tracking-tighter">${product.price || '0.00'}</p>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></Button></DialogTrigger>
                <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-[3rem]"><ProductDetailView productId={product.id} onBack={() => {}} /></DialogContent>
              </Dialog>
              <ProductSamplesDialog trigger={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"><Package className="h-4 w-4" /></Button>} productData={product} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductListItem({ product, loadProducts }: any) {
  return (
    <Card className="border-border/40 shadow-premium-sm bg-card rounded-[2rem] overflow-hidden hover:shadow-premium-md transition-all duration-500 group">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/10 border border-border/40 flex items-center justify-center shrink-0">
            {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-2xl" /> : <Package className="h-8 w-8 text-muted-foreground/20" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-black text-foreground tracking-tighter uppercase font-display">{product.name}</h3>
              <Badge className="bg-muted/20 text-muted-foreground border-none font-black text-[8px] h-4 px-2 uppercase tracking-widest">{product.category || 'General'}</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight line-clamp-1">{product.description || "S/D"}</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-xl font-black text-foreground font-display tracking-tighter">${product.price || '0.00'}</p>
            <div className="flex gap-2">
              <ProductSamplesDialog trigger={<Button variant="outline" className="h-10 px-6 border-border/40 rounded-xl font-black uppercase text-[9px] tracking-widest">Muestras</Button>} productData={product} />
              <Dialog>
                <DialogTrigger asChild><Button className="h-10 w-10 bg-primary text-white rounded-xl shadow-premium-md flex items-center justify-center"><Eye className="h-4 w-4" /></Button></DialogTrigger>
                <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-[3rem]"><ProductDetailView productId={product.id} onBack={() => {}} /></DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
