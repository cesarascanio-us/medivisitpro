import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import DataImporter from "@/components/shared/DataImporter";
import { cn } from "@/lib/utils";

interface ImportDialogProps {
  onImport: (data: Record<string, any>[]) => Promise<void>;
  expectedColumns: { key: string; label: string; required?: boolean }[];
  title: string;
  description: string;
  triggerText?: string;
  className?: string;
}

export function ImportDialog({ onImport, expectedColumns, title, description, triggerText = "Importar", className }: ImportDialogProps) {
  const [open, setOpen] = useState(false);

  const handleImport = async (data: Record<string, any>[]) => {
    await onImport(data);
    setTimeout(() => setOpen(false), 1500); // Close shortly after success
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className={cn("flex items-center justify-center gap-1 md:gap-2", className)}>
          <Upload className="h-4 w-4" />
          <span className="hidden md:inline">{triggerText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-card border-border/40 p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <DataImporter 
          onImport={handleImport}
          expectedColumns={expectedColumns}
          title={title}
          description="Sube tu archivo .xlsx o .csv con los datos"
        />
        
      </DialogContent>
    </Dialog>
  );
}
