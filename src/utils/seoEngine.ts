import { NewsArticle, SEOMetadata, SEOSettings, SiteSettings } from '../types';

export interface SeoCheckItem {
  id: string;
  title: string;
  passed: boolean;
  score: number; // 0 - 10
  importance: 'kritis' | 'penting' | 'rekomendasi';
  message: string;
  tip?: string;
}

export interface SeoAnalysisResult {
  score: number; // 0 - 100
  rating: 'Sangat Baik' | 'Baik' | 'Perlu Perbaikan' | 'Kritis';
  ratingColor: string;
  passedCount: number;
  totalChecks: number;
  checks: SeoCheckItem[];
  keywordDensity: number;
  wordCount: number;
  charCount: number;
  estimatedReadTime: string;
  snippetPreview: {
    desktopTitle: string;
    mobileTitle: string;
    displayedUrl: string;
    metaDescription: string;
  };
}

export const DEFAULT_SEO_SETTINGS: SEOSettings = {
  siteTitleTemplate: '%title% | Arun News - Berita Terkini Nusantara',
  defaultMetaDescription: 'Arun News menyajikan kabar terkini nasional, bisnis, teknologi, olahraga, dan isu internasional dengan akurat, cepat, independen, dan berimbang.',
  defaultOgImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  googleSiteVerification: 'arun-news-google-verify-892305819',
  bingSiteVerification: 'arun-news-bing-verify-4019241',
  googleNewsPublisherId: 'pub-arunnews-id-2026',
  sitemapEnabled: true,
  rssFeedEnabled: true,
  jsonLdEnabled: true,
  breadcrumbsEnabled: true,
  canonicalDomain: 'https://arunnews.id',
  robotsTxtContent: `User-agent: *
Allow: /
Disallow: /editorial/
Disallow: /api/
Disallow: /admin/

Sitemap: https://arunnews.id/sitemap.xml
Sitemap: https://arunnews.id/sitemap-news.xml`,
  globalSeoScore: 94
};

/**
 * Calculates real-time SEO score and produces structured audit feedback
 */
export function calculateSeoScore(
  article: Partial<NewsArticle>,
  focusKeywordInput?: string,
  metaTitleInput?: string,
  metaDescInput?: string
): SeoAnalysisResult {
  const title = (metaTitleInput || article.title || '').trim();
  const rawContent = article.paragraphs?.join(' ') || article.content || '';
  const metaDesc = (metaDescInput || article.excerpt || '').trim();
  const keyword = (focusKeywordInput || article.seo?.focusKeyword || '').trim().toLowerCase();
  const slug = (article.slug || '').trim().toLowerCase();
  const hasImage = Boolean(article.imageUrl && article.imageUrl.trim());
  const hasCaption = Boolean(article.imageCaption && article.imageCaption.trim());
  const keyTakeawaysCount = article.keyTakeaways ? article.keyTakeaways.filter(Boolean).length : 0;

  // Words calculation
  const words = rawContent.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = rawContent.length;
  const estimatedReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} mnt baca`;

  // Keyword Density
  let keywordOccurrences = 0;
  if (keyword && wordCount > 0) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = rawContent.match(regex);
    keywordOccurrences = matches ? matches.length : 0;
  }
  const keywordDensity = wordCount > 0 ? Number(((keywordOccurrences / wordCount) * 100).toFixed(2)) : 0;

  const checks: SeoCheckItem[] = [];

  // 1. Focus Keyword presence
  const hasFocusKeyword = keyword.length >= 3;
  checks.push({
    id: 'focus_keyword',
    title: 'Kata Kunci Utama (Focus Keyword)',
    passed: hasFocusKeyword,
    score: hasFocusKeyword ? 10 : 0,
    importance: 'kritis',
    message: hasFocusKeyword
      ? `Kata kunci fokus ditetapkan: "${keyword}"`
      : 'Kata kunci fokus belum diatur. Tetapkan 1 frasa kata kunci utama agar mesin pencari dapat mengindeks topik spesifik.',
    tip: 'Pilih kata kunci 2-4 kata yang sering diketikkan pengguna Google (misal: "investasi hijau nasional").'
  });

  // 2. Title length (ideal: 40 - 70 chars for Google Desktop & Mobile)
  const titleLen = title.length;
  const isTitleLengthIdeal = titleLen >= 40 && titleLen <= 70;
  checks.push({
    id: 'title_length',
    title: 'Panjang Judul SEO (Meta Title)',
    passed: isTitleLengthIdeal,
    score: isTitleLengthIdeal ? 10 : titleLen >= 25 ? 6 : 2,
    importance: 'kritis',
    message: isTitleLengthIdeal
      ? `Panjang judul optimal (${titleLen} karakter). Pas di SERP Google tanpa terpotong.`
      : titleLen < 40
      ? `Judul terlalu pendek (${titleLen}/70 karakter). Tambahkan konteks yang lebih spesifik.`
      : `Judul terlalu panjang (${titleLen}/70 karakter). Berisiko terpotong "..." di hasil pencarian Google.`,
    tip: 'Google menampilkan rata-rata 55-65 karakter judul sebelum terpotong.'
  });

  // 3. Focus keyword in title
  const isKeywordInTitle = Boolean(keyword && title.toLowerCase().includes(keyword));
  checks.push({
    id: 'keyword_in_title',
    title: 'Kata Kunci pada Judul SEO',
    passed: isKeywordInTitle,
    score: isKeywordInTitle ? 10 : 0,
    importance: 'kritis',
    message: isKeywordInTitle
      ? 'Kata kunci fokus ditemukan di dalam judul berita.'
      : 'Kata kunci fokus belum tercantum di judul berita.',
    tip: 'Letakkan kata kunci sedekat mungkin ke awal judul untuk bobot peringkat CTR lebih tinggi.'
  });

  // 4. Meta description length (ideal: 110 - 160 chars)
  const metaDescLen = metaDesc.length;
  const isMetaDescIdeal = metaDescLen >= 110 && metaDescLen <= 160;
  checks.push({
    id: 'meta_desc_length',
    title: 'Panjang Deskripsi Cuplikan (Meta Description)',
    passed: isMetaDescIdeal,
    score: isMetaDescIdeal ? 10 : metaDescLen >= 60 ? 6 : 2,
    importance: 'penting',
    message: isMetaDescIdeal
      ? `Panjang meta deskripsi pas (${metaDescLen} karakter).`
      : metaDescLen < 110
      ? `Meta deskripsi terlalu ringkas (${metaDescLen}/160 karakter). Perkaya ringkasan fakta.`
      : `Meta deskripsi terlalu panjang (${metaDescLen}/160 karakter). Berpotensi terpotong di hasil pencarian.`,
    tip: 'Gunakan formula 5W+1H ringkas agar mengundang klik pembaca di Google SERP.'
  });

  // 5. Focus keyword in meta description
  const isKeywordInMetaDesc = Boolean(keyword && metaDesc.toLowerCase().includes(keyword));
  checks.push({
    id: 'keyword_in_meta_desc',
    title: 'Kata Kunci pada Meta Deskripsi',
    passed: isKeywordInMetaDesc,
    score: isKeywordInMetaDesc ? 10 : 0,
    importance: 'penting',
    message: isKeywordInMetaDesc
      ? 'Kata kunci fokus tercantum di ringkasan deskripsi (Google akan menebalkan kata ini).'
      : 'Kata kunci fokus belum ada di meta deskripsi.',
    tip: 'Google memberikan efek teks tebal (bold) pada kata pencarian yang cocok di meta deskripsi.'
  });

  // 6. Keyword in first paragraph
  const firstParagraph = (article.paragraphs && article.paragraphs[0]) || rawContent.slice(0, 300);
  const isKeywordInFirstPara = Boolean(keyword && firstParagraph.toLowerCase().includes(keyword));
  checks.push({
    id: 'keyword_in_intro',
    title: 'Kata Kunci di Paragraf Pembuka (Teras Berita)',
    passed: isKeywordInFirstPara,
    score: isKeywordInFirstPara ? 10 : 0,
    importance: 'penting',
    message: isKeywordInFirstPara
      ? 'Kata kunci muncul di teras berita pembuka (100 kata pertama).'
      : 'Kata kunci belum terdeteksi di paragraf pembuka.',
    tip: 'Mesin crawler Google memprioritaskan 100 kata pertama untuk memahami topik utama warta.'
  });

  // 7. Word count (> 300 words recommended for news, > 600 words for deep report)
  const isWordCountGood = wordCount >= 300;
  checks.push({
    id: 'word_count',
    title: 'Kedalaman Isi Naskah (Word Count)',
    passed: isWordCountGood,
    score: wordCount >= 500 ? 10 : wordCount >= 300 ? 8 : wordCount >= 150 ? 4 : 1,
    importance: 'penting',
    message: isWordCountGood
      ? `Panjang naskah memadai (${wordCount} kata). Memenuhi standar liputan komprehensif Google News.`
      : `Naskah terlalu ringkas (${wordCount} kata). Minimal 300 kata agar tidak dinilai 'Thin Content' oleh algoritma Google Helpful Content.`,
    tip: 'Google News lebih menyukai artikel dengan uraian fakta minimal 300 - 800 kata.'
  });

  // 8. Keyword density check (0.5% - 2.8% is optimal)
  const isDensityHealthy = keywordDensity >= 0.5 && keywordDensity <= 3.0;
  checks.push({
    id: 'keyword_density',
    title: 'Kerapatan Kata Kunci (Keyword Density)',
    passed: isDensityHealthy,
    score: isDensityHealthy ? 10 : keywordDensity > 3.0 ? 3 : 5,
    importance: 'rekomendasi',
    message: isDensityHealthy
      ? `Kerapatan kata kunci ideal (${keywordDensity}% • ${keywordOccurrences} kali muncul). Alami dan tidak berlebihan.`
      : keywordDensity > 3.0
      ? `Kerapatan kata kunci terlalu tinggi (${keywordDensity}%). Hindari penumpukan kata (Keyword Stuffing).`
      : `Kerapatan kata kunci rendah (${keywordDensity}%). Sebutkan kata kunci secara natural 2-4 kali.`,
    tip: 'Jaga rasio pengulangan kata kunci antara 1% hingga 2.5% dari total kata artikel.'
  });

  // 9. Slug / URL Friendly check
  const isSlugGood = Boolean(slug && slug.length >= 5 && /^[a-z0-9-]+$/.test(slug));
  const isKeywordInSlug = Boolean(
    isSlugGood && keyword && slug.includes(keyword.replace(/\s+/g, '-').slice(0, 15))
  );
  checks.push({
    id: 'slug_optimization',
    title: 'Optimasi Tautan Permanen (URL Slug)',
    passed: isSlugGood && isKeywordInSlug,
    score: isSlugGood && isKeywordInSlug ? 10 : isSlugGood ? 7 : 2,
    importance: 'rekomendasi',
    message: isSlugGood && isKeywordInSlug
      ? `Slug URL bersih dan memuat kata kunci: "/warta/${slug}"`
      : isSlugGood
      ? `Slug sudah bersih namun belum memuat kata kunci fokus.`
      : 'Slug URL belum ramah SEO. Hindari karakter aneh atau angka acak.',
    tip: 'URL ringkas dan deskriptif mempermudah pembagian tautan di media sosial dan WhatsApp.'
  });

  // 10. Featured Image & Caption ALT
  const isImageOptimized = hasImage && hasCaption;
  checks.push({
    id: 'image_seo',
    title: 'Optimasi Gambar Utama & Teks Deskripsi (ALT)',
    passed: isImageOptimized,
    score: isImageOptimized ? 10 : hasImage ? 6 : 0,
    importance: 'rekomendasi',
    message: isImageOptimized
      ? 'Gambar utama memiliki resolusi tinggi serta keterangan (caption/ALT text).'
      : hasImage
      ? 'Gambar utama sudah ada namun belum memiliki keterangan (caption/ALT).'
      : 'Artikel belum memiliki gambar utama. Google Discover memerlukan gambar minimal 1200px.',
    tip: 'Google Discover dan Google Images mensyaratkan gambar beresolusi tajam (rasio 16:9).'
  });

  // 11. Structured Subheadings & Key Takeaways
  const hasStructuredContent = keyTakeawaysCount >= 2;
  checks.push({
    id: 'structured_takeaways',
    title: 'Struktur Poin Kunci (Key Takeaways / Rich Snippets)',
    passed: hasStructuredContent,
    score: hasStructuredContent ? 10 : 3,
    importance: 'rekomendasi',
    message: hasStructuredContent
      ? `Terdapat ${keyTakeawaysCount} poin kunci terstruktur yang siap dijadikan Google Featured Snippet.`
      : 'Tambahkan minimal 2 poin penting (Key Takeaways) untuk mengaktifkan cuplikan kaya (Rich Snippets).',
    tip: 'Format poin-poin memudahkan Google Assistant membacakan intisari berita.'
  });

  // Compute Total Score (Normalized to 100)
  const totalScoreRaw = checks.reduce((acc, c) => acc + c.score, 0);
  const maxPossible = checks.length * 10;
  const score = Math.min(100, Math.max(0, Math.round((totalScoreRaw / maxPossible) * 100)));

  let rating: SeoAnalysisResult['rating'] = 'Sangat Baik';
  let ratingColor = 'text-emerald-600 bg-emerald-50 border-emerald-300';
  if (score < 50) {
    rating = 'Kritis';
    ratingColor = 'text-rose-600 bg-rose-50 border-rose-300';
  } else if (score < 70) {
    rating = 'Perlu Perbaikan';
    ratingColor = 'text-amber-600 bg-amber-50 border-amber-300';
  } else if (score < 85) {
    rating = 'Baik';
    ratingColor = 'text-sky-600 bg-sky-50 border-sky-300';
  }

  const passedCount = checks.filter((c) => c.passed).length;

  return {
    score,
    rating,
    ratingColor,
    passedCount,
    totalChecks: checks.length,
    checks,
    keywordDensity,
    wordCount,
    charCount,
    estimatedReadTime,
    snippetPreview: {
      desktopTitle: `${title || 'Judul Warta Belum Diisi'} | Arun News`,
      mobileTitle: title || 'Judul Warta Belum Diisi',
      displayedUrl: `https://arunnews.id › warta › ${slug || 'berita-terbaru'}`,
      metaDescription: metaDesc || 'Deskripsi berita belum diisi. Pratinjau cuplikan Google akan otomatis mengambil teks awal berita...'
    }
  };
}

/**
 * Generates Schema.org NewsArticle JSON-LD structured data compliant with Google News
 */
export function generateJsonLd(article: NewsArticle, siteSettings?: SiteSettings): string {
  const portalName = siteSettings?.portalName || 'Arun News';
  const canonicalDomain = siteSettings?.seoSettings?.canonicalDomain || 'https://arunnews.id';
  const articleUrl = `${canonicalDomain}/warta/${article.slug || article.id}`;
  const keywordsList = article.tags && article.tags.length > 0 ? article.tags.join(', ') : 'Arun News, Berita Nasional';

  const schema = {
    '@context': 'https://schema.org',
    '@type': article.seo?.schemaType || 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    headline: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    image: [
      article.imageUrl,
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'
    ],
    datePublished: '2026-08-14T08:00:00+07:00',
    dateModified: '2026-08-14T09:30:00+07:00',
    articleSection: article.categoryLabel || article.category,
    keywords: keywordsList,
    author: {
      '@type': 'Person',
      name: article.author.name,
      jobTitle: article.author.role,
      image: article.author.avatar,
      url: `${canonicalDomain}/jurnalis/${encodeURIComponent(article.author.name)}`
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: portalName,
      url: canonicalDomain,
      logo: {
        '@type': 'ImageObject',
        url: `${canonicalDomain}/logo.png`,
        width: 600,
        height: 60
      },
      publishingPrinciples: `${canonicalDomain}/pedoman-media-siber`,
      correctionsPolicy: `${canonicalDomain}/hak-jawab-dan-koreksi`,
      diversityPolicy: `${canonicalDomain}/kode-etik-jurnalistik`,
      actionableFeedbackPolicy: `${canonicalDomain}/kontak-redaksi`
    },
    isAccessibleForFree: true,
    hasPart: {
      '@type': 'WebPageElement',
      isAccessibleForFree: true,
      cssSelector: '.article-body'
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.article-headline', '.article-lead', '.key-takeaways']
    },
    ...(article.seo?.isSponsored && {
      sponsor: {
        '@type': 'Organization',
        name: article.seo.sponsorBrand || 'Sponsor Terverifikasi',
        url: article.seo.sponsorUrl || canonicalDomain
      }
    })
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Generates Schema.org WebSite & Organization structured data
 */
export function generateWebsiteJsonLd(siteSettings?: SiteSettings): string {
  const portalName = siteSettings?.portalName || 'Arun News';
  const canonicalDomain = siteSettings?.seoSettings?.canonicalDomain || 'https://arunnews.id';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${canonicalDomain}/#website`,
        url: canonicalDomain,
        name: portalName,
        description: siteSettings?.portalTagline || 'Jembatan Informasi Nusantara',
        publisher: {
          '@id': `${canonicalDomain}/#organization`
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${canonicalDomain}/cari?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        },
        inLanguage: 'id-ID'
      },
      {
        '@type': 'NewsMediaOrganization',
        '@id': `${canonicalDomain}/#organization`,
        name: portalName,
        url: canonicalDomain,
        logo: {
          '@type': 'ImageObject',
          url: `${canonicalDomain}/logo.png`,
          width: 512,
          height: 512
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: siteSettings?.officeAddress || 'Gg gaya, pasar minggu, kec, pasar minggu',
          addressLocality: 'Jakarta Selatan',
          addressRegion: 'DKI Jakarta',
          postalCode: '12520',
          addressCountry: 'ID'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: siteSettings?.hotlinePhone || '0895626941900',
          contactType: 'editorial hotline',
          email: siteSettings?.editorialEmail || 'redaksi@arunnews.id',
          availableLanguage: ['Indonesian', 'English']
        },
        sameAs: [
          siteSettings?.socialLinks?.twitter || 'https://twitter.com/arunnews',
          siteSettings?.socialLinks?.instagram || 'https://instagram.com/arunnews',
          siteSettings?.socialLinks?.youtube || 'https://youtube.com/arunnews',
          siteSettings?.socialLinks?.facebook || 'https://facebook.com/arunnews'
        ]
      }
    ]
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Generates Google News and Standard XML Sitemap
 */
export function generateSitemapXml(articles: NewsArticle[], canonicalDomain: string = 'https://arunnews.id'): string {
  const currentDate = new Date().toISOString();

  const urlEntries = articles.map((art) => {
    const slug = art.slug || art.id;
    const url = `${canonicalDomain}/warta/${slug}`;
    const pubDate = '2026-08-14T08:00:00+07:00';
    const cleanTitle = (art.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cleanKeywords = (art.tags || []).join(', ').replace(/&/g, '&amp;');

    return `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${art.isHeadline ? '1.0' : art.isTrending ? '0.9' : '0.8'}</priority>
    <news:news>
      <news:publication>
        <news:name>Arun News</news:name>
        <news:language>id</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${cleanTitle}</news:title>
      <news:keywords>${cleanKeywords}</news:keywords>
    </news:news>
    <image:image>
      <image:loc>${art.imageUrl || ''}</image:loc>
      <image:title>${cleanTitle}</image:title>
    </image:image>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${canonicalDomain}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Kategori Nasional -->
  <url>
    <loc>${canonicalDomain}/kanal/nasional</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Kategori Bisnis -->
  <url>
    <loc>${canonicalDomain}/kanal/ekonomi</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Kategori Teknologi -->
  <url>
    <loc>${canonicalDomain}/kanal/teknologi</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
${urlEntries.join('\n')}
</urlset>`;
}

/**
 * Generates standard RSS 2.0 / Atom XML Feed
 */
export function generateRssFeedXml(articles: NewsArticle[], siteSettings?: SiteSettings): string {
  const portalName = siteSettings?.portalName || 'Arun News';
  const canonicalDomain = siteSettings?.seoSettings?.canonicalDomain || 'https://arunnews.id';
  const buildDate = new Date().toUTCString();

  const items = articles.map((art) => {
    const slug = art.slug || art.id;
    const url = `${canonicalDomain}/warta/${slug}`;
    const cleanTitle = (art.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cleanExcerpt = (art.excerpt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `    <item>
      <title>${cleanTitle}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${art.excerpt}]]></description>
      <category>${art.categoryLabel || art.category}</category>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${art.author?.name || 'Redaksi Arun News'}</dc:creator>
      <pubDate>${buildDate}</pubDate>
      <enclosure url="${art.imageUrl}" type="image/jpeg" length="124000"/>
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${portalName} - Warta Terkini Nusantara</title>
    <link>${canonicalDomain}</link>
    <description>${siteSettings?.portalTagline || 'Portal Berita Terpercaya & Berimbang'}</description>
    <language>id-ID</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${canonicalDomain}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${canonicalDomain}/logo.png</url>
      <title>${portalName}</title>
      <link>${canonicalDomain}</link>
    </image>
${items.join('\n')}
  </channel>
</rss>`;
}
