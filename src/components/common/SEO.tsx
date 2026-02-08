
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
}

export const SEO = ({
    title = "MediVisit Pro - Gestión Profesional para Visitadores Médicos",
    description = "Plataforma integral para la gestión de visitas médicas, control de inventario y análisis de desempeño. Optimiza tu labor profesional.",
    keywords = "visitador médico, gestión de visitas, crm médico, farmacias, doctores, control de inventario",
    canonical
}: SEOProps) => { // id: 9
    const siteTitle = "MediVisit Pro";
    const fullTitle = title === siteTitle ? siteTitle : `${title} | ${siteTitle}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
};
