
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Check, X } from "lucide-react";

export function VisualAidModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300">
                    <Info className="h-4 w-4" />
                    Ver Comparativo: Citrato vs Carbonato
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center text-blue-400 mb-2">
                        Comparativa de Absorción
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                            <h3 className="font-bold text-emerald-400 text-lg mb-2">Citrato (Calzinc D)</h3>
                            <ul className="text-sm text-emerald-100/80 space-y-2 text-left">
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                    <span>Absorción independiente del pH gástrico.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                    <span>No requiere ingerirse con alimentos.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                    <span>Menor riesgo de litiasis renal.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                    <span>Alta tolerancia gastrointestinal.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center opacity-80">
                            <h3 className="font-bold text-slate-400 text-lg mb-2">Carbonato</h3>
                            <ul className="text-sm text-slate-400 space-y-2 text-left">
                                <li className="flex items-start gap-2">
                                    <X className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                                    <span>Requiere ácido gástrico para absorberse.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <X className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                                    <span>Debe tomarse con las comidas.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <X className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                                    <span>Puede causar gases y estreñimiento.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
