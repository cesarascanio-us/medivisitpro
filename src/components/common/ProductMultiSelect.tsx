import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ProductMultiSelectProps {
    selectedProducts: string[];
    onProductsChange: (products: string[]) => void;
    placeholder?: string;
}

export function ProductMultiSelect({
    selectedProducts,
    onProductsChange,
    placeholder = "Seleccionar productos..."
}: ProductMultiSelectProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, [user]);

    const loadProducts = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('id, name')
            .eq('user_id', user.id)
            .order('name');

        if (error) {
            console.error('Error loading products:', error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    const handleSelect = (productId: string) => {
        if (selectedProducts.includes(productId)) {
            // Remove product
            onProductsChange(selectedProducts.filter(id => id !== productId));
        } else {
            // Add product
            onProductsChange([...selectedProducts, productId]);
        }
    };

    const handleRemove = (productId: string) => {
        onProductsChange(selectedProducts.filter(id => id !== productId));
    };

    const getProductName = (productId: string) => {
        const product = products.find(p => p.id === productId);
        return product?.name || productId;
    };

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {selectedProducts.length > 0
                            ? `${selectedProducts.length} producto(s) seleccionado(s)`
                            : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Buscar producto..." />
                        <CommandEmpty>
                            {loading ? "Cargando..." : "No se encontraron productos"}
                        </CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={product.name}
                                    onSelect={() => handleSelect(product.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedProducts.includes(product.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {product.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Selected Products Badges */}
            {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((productId) => (
                        <Badge key={productId} variant="secondary" className="gap-1">
                            {getProductName(productId)}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleRemove(productId)}
                            />
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
