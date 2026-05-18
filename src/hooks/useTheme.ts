/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
   ======================================================================== */

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useThemeStorage() {
  const { organizationId } = useAuth();

  /**
   * Upload logo file to Supabase Storage bucket organization-assets
   */
  const uploadLogo = async (file: File): Promise<string> => {
    if (!organizationId) throw new Error("No organization ID associated with user session.");

    const fileExt = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `org-assets/${organizationId}/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("organization-assets")
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type 
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from("organization-assets")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) throw new Error("Failed to retrieve uploaded logo public URL.");

    return data.publicUrl;
  };

  /**
   * Upload favicon file to Supabase Storage bucket organization-assets
   */
  const uploadFavicon = async (file: File): Promise<string> => {
    if (!organizationId) throw new Error("No organization ID associated with user session.");

    const fileExt = file.name.split(".").pop();
    const fileName = `favicon-${Date.now()}.${fileExt}`;
    const filePath = `org-assets/${organizationId}/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("organization-assets")
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type 
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from("organization-assets")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) throw new Error("Failed to retrieve uploaded favicon public URL.");

    return data.publicUrl;
  };

  return { 
    uploadLogo, 
    uploadFavicon 
  };
}
