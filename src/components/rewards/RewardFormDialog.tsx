import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RewardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isEditing: boolean;
}

export function RewardFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isEditing
}: RewardFormDialogProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === "points_cost" || name === "stock" ? Number(value) : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl p-0">
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 flex flex-col items-center justify-center relative">
          <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight">
            {isEditing ? "Modificar Premio" : "Nuevo Premio"}
          </DialogTitle>
          <DialogDescription className="text-indigo-200 mt-2 text-center text-sm">
            {isEditing ? "Actualiza los detalles del premio." : "Configura un nuevo premio para el catálogo."}
          </DialogDescription>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Nombre del Premio *</Label>
              <Input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Ej. Termo Yeti..."
                className="bg-slate-50 border-slate-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Costo en Puntos *</Label>
              <Input
                name="points_cost"
                type="number"
                value={formData.points_cost || 0}
                onChange={handleChange}
                className="bg-slate-50 border-slate-200"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold text-slate-700">Descripción</Label>
              <Textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Breve descripción del premio..."
                className="bg-slate-50 border-slate-200 min-h-[100px]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold text-slate-700">URL de Imagen</Label>
              <Input
                name="image_url"
                value={formData.image_url || ""}
                onChange={handleChange}
                placeholder="https://..."
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Stock Inicial *</Label>
              <Input
                name="stock"
                type="number"
                value={formData.stock || 0}
                onChange={handleChange}
                className="bg-slate-50 border-slate-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Estatus</Label>
              <select
                name="status"
                value={formData.status || "active"}
                onChange={handleChange}
                className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-sm"
              >
                <option value="active">Activo / Visible</option>
                <option value="inactive">Inactivo / Oculto</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-8 font-bold">
              Cancelar
            </Button>
            <Button onClick={onSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 font-bold">
              {isEditing ? "Guardar Cambios" : "Crear Premio"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
