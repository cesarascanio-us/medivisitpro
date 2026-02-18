
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LandingContent, DEFAULT_LANDING_CONTENT } from '@/lib/landing-content';

export const useLandingContent = () => {
    const [content, setContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'landing_content')
                    .single();

                if (error) {
                    console.warn('Using default landing content (DB fetch failed or empty)');
                    // No need to setContent, default is already set
                } else if (data) {
                    // Merge with defaults to ensure all keys exist even if DB is partial
                    setContent({ ...DEFAULT_LANDING_CONTENT, ...data.value as any });
                }
            } catch (err) {
                console.error('Unexpected error fetching landing content:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    return { content, loading };
};
