/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadInputProps {
    value?: string | null;
    onUpload: (url: string) => void;
    onDelete?: () => void;
    bucket?: string;
    path?: string;
    maxSizeMB?: number;
    label?: string;
    required?: boolean;
    className?: string;
}

/**
 * Universal Image Upload Component
 * Supports both file selection and camera capture
 * Automatically uploads to Supabase Storage
 */
export function ImageUploadInput({
    value,
    onUpload,
    onDelete,
    bucket = 'medivisitpro-media',
    path = 'visits',
    maxSizeMB = 2,
    label = 'Foto',
    required = false,
    className,
}: ImageUploadInputProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Compress image before upload
    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimensions
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1920;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Canvas to Blob failed'));
                            }
                        },
                        'image/jpeg',
                        0.85 // Quality
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const uploadImage = async (file: File) => {
        try {
            setUploading(true);
            setError(null);

            // Validate file size
            const fileSizeMB = file.size / 1024 / 1024;
            if (fileSizeMB > maxSizeMB) {
                throw new Error(`El archivo debe ser menor a ${maxSizeMB}MB`);
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Solo se permiten imágenes (JPG, PNG)');
            }

            // Compress image
            const compressedBlob = await compressImage(file);

            // Generate unique filename
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, compressedBlob, {
                    contentType: 'image/jpeg',
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            onUpload(urlData.publicUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadImage(file);
        }
    };

    const handleDelete = async () => {
        if (!value) return;

        try {
            // Extract path from URL
            const url = new URL(value);
            const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);

            if (pathMatch) {
                const filePath = pathMatch[1];
                await supabase.storage.from(bucket).remove([filePath]);
            }

            onDelete?.();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const triggerFileInput = () => fileInputRef.current?.click();
    const triggerCamera = () => cameraInputRef.current?.click();

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label className="text-sm font-medium">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
            )}

            {/* Preview */}
            {value && (
                <div className="relative inline-block">
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full max-w-sm h-48 object-cover rounded-lg border"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleDelete}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Upload Buttons */}
            {!value && (
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={triggerCamera}
                        disabled={uploading}
                        className="flex-1"
                    >
                        {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Camera className="h-4 w-4 mr-2" />
                        )}
                        Cámara
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={triggerFileInput}
                        disabled={uploading}
                        className="flex-1"
                    >
                        {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        Archivo
                    </Button>
                </div>
            )}

            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Error message */}
            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {error}
                </p>
            )}

            {/* Info message */}
            {!value && !error && (
                <p className="text-xs text-muted-foreground">
                    JPG o PNG, máx. {maxSizeMB}MB. La imagen será comprimida automáticamente.
                </p>
            )}
        </div>
    );
}
