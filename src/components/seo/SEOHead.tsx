import React, { useEffect } from 'react';
import { NewsArticle, SiteSettings } from '../../types';
import { generateJsonLd, generateWebsiteJsonLd } from '../../utils/seoEngine';

interface SEOHeadProps {
  article?: NewsArticle | null;
  siteSettings: SiteSettings;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ article, siteSettings }) => {
  useEffect(() => {
    const portalName = siteSettings.portalName || 'Arun News';
    const canonicalDomain = siteSettings.seoSettings?.canonicalDomain || 'https://arunnews.id';
    
    // 1. Calculate Page Title
    let pageTitle = `${portalName} - ${siteSettings.portalTagline || 'Jembatan Informasi Nusantara'}`;
    let pageDescription = siteSettings.seoSettings?.defaultMetaDescription || siteSettings.subTagline || 'Arun News menyajikan kabar terkini nusantara dengan akurat dan berimbang.';
    let pageKeywords = 'Arun News, Berita Terkini, Kabar Nasional, Ekonomi, Bisnis, Teknologi, Olahraga, Internasional, Iklim';
    let ogImage = siteSettings.seoSettings?.defaultOgImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
    let canonicalUrl = canonicalDomain;
    let ogType = 'website';
    let robotsContent = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

    if (article) {
      pageTitle = article.seo?.metaTitle || `${article.title} | ${portalName}`;
      pageDescription = article.seo?.metaDescription || article.excerpt || article.content?.slice(0, 160) || pageDescription;
      pageKeywords = (article.tags && article.tags.length > 0 ? article.tags.join(', ') : '') + ', ' + pageKeywords;
      ogImage = article.imageUrl || ogImage;
      canonicalUrl = article.seo?.canonicalUrl || `${canonicalDomain}/warta/${article.slug || article.id}`;
      ogType = article.seo?.ogType || 'article';

      const isIndex = article.seo ? article.seo.robotsIndex : true;
      const isFollow = article.seo ? article.seo.robotsFollow : true;
      robotsContent = `${isIndex ? 'index' : 'noindex'}, ${isFollow ? 'follow' : 'nofollow'}, max-snippet:-1, max-image-preview:large`;
    }

    // Set Document Title
    document.title = pageTitle;

    // Helper to update or create meta tags
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Metas
    setMetaTag('name', 'description', pageDescription);
    setMetaTag('name', 'keywords', pageKeywords);
    setMetaTag('name', 'robots', robotsContent);
    setMetaTag('name', 'author', article ? article.author.name : portalName);
    
    // Verification Tags (SEO)
    if (siteSettings.seoSettings?.googleSiteVerification) {
      setMetaTag('name', 'google-site-verification', siteSettings.seoSettings.googleSiteVerification);
    }
    if (siteSettings.seoSettings?.bingSiteVerification) {
      setMetaTag('name', 'msvalidate.01', siteSettings.seoSettings.bingSiteVerification);
    }

    // OpenGraph Metas (Facebook, WhatsApp, LinkedIn)
    setMetaTag('property', 'og:site_name', portalName);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:locale', 'id_ID');

    // Twitter Card Metas (X)
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', '@ArunNews');
    setMetaTag('name', 'twitter:creator', '@ArunNews');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDescription);
    setMetaTag('name', 'twitter:image', ogImage);

    // Canonical Tag
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl);

    // Schema.org JSON-LD Script Injection
    let schemaElement = document.getElementById('arun-news-jsonld') as HTMLScriptElement | null;
    if (!schemaElement) {
      schemaElement = document.createElement('script');
      schemaElement.id = 'arun-news-jsonld';
      schemaElement.type = 'application/ld+json';
      document.head.appendChild(schemaElement);
    }

    if (article) {
      schemaElement.textContent = generateJsonLd(article, siteSettings);
    } else {
      schemaElement.textContent = generateWebsiteJsonLd(siteSettings);
    }

    return () => {
      // Optional cleanup
    };
  }, [article, siteSettings]);

  return null; // Head manager runs as side-effect
};
