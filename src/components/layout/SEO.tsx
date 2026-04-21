import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
}

export const SEO = ({
  title = 'Aura Studio | Generador Artístico con IA',
  description = 'Transforma tus visiones en obras digitales maestras con Aura Studio, el estudio de arte impulsado por Gemini.',
  canonical = 'https://aurastudio.art/',
  ogTitle,
  ogDescription,
  ogImage = 'https://aurastudio.art/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
}: SEOProps) => {
  const siteTitle = title.includes('Aura Studio') ? title : `${title} | Aura Studio`;

  return (
    <Helmet>
      {/* Base Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content="Aura Studio" />
      <meta property="og:title" content={ogTitle || siteTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || siteTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Aura Studio",
          "operatingSystem": "Web",
          "applicationCategory": "MultimediaApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": description,
          "author": {
            "@type": "Organization",
            "name": "Aura Studio"
          }
        })}
      </script>
    </Helmet>
  );
};
