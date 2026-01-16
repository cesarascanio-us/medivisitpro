import { useParams } from "react-router-dom";
import { ProductDetailView } from "@/components/catalog/ProductDetailView";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function PublicProductPage() {
    const { id } = useParams();

    if (!id) return <div>ID inválido</div>;

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Public Header */}
            <header className="bg-white border-b py-3 px-6 flex justify-between items-center sticky top-0 z-50">
                <div className="font-bold text-xl text-blue-600 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">M</div>
                    MediVisitPro <span className="text-slate-400 font-normal text-sm">| Catálogo Digital</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => window.open('https://medivisitpro.com', '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" /> Sitio Oficial
                </Button>
            </header>

            <main>
                <ProductDetailView
                    productId={id}
                    visitType="default" // Vista pública ve tabs default
                />
            </main>

            {/* Public Footer */}
            <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
                <p>© 2025 MediVisitPro. Información exclusiva para profesionales de la salud.</p>
            </footer>
        </div>
    );
}
