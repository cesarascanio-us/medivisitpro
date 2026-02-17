
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
}

export const SEO = ({
    title = "MediVisit Pro - Aumenta tus Prescripciones Médicas",
    description = "El arma secreta de los visitadores médicos top. Gestiona territorio, muestras y objetivos en una sola app. Optimiza rutas y recupera 10+ horas semanales.",
    keywords = "visitador médico, gestión de visitas, crm médico, farmacias, doctores, control de inventario, pharma crm, offline crm",
    canonical
}: SEOProps) => {
    const siteTitle = "MediVisit Pro";
    const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
    const ogImage = "/og-image.png"; // Default image path

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <meta name="theme-color" content="#10b981" />
            <meta name="robots" content="index, follow" />

            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonical || "https://medivisitpro.com/"} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content="MediVisit Pro" />
            <meta property="og:locale" content="es_ES" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@medivisitpro" />
            <meta name="twitter:creator" content="@medivisitpro" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* LinkedIn / Others */}
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
        </Helmet>
    );
};
