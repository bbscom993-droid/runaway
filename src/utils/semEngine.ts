import { AdSlot, SEMSettings } from '../types';

export interface SemProjectionResult {
  estimatedImpressions: number;
  estimatedClicks: number;
  projectedCtr: number;
  effectiveCpc: number;
  estimatedConversions: number;
  targetAudienceReach: string;
  recommendedKeywords: string[];
}

export const DEFAULT_AD_SLOTS: AdSlot[] = [
  {
    id: 'slot-top-billboard',
    name: 'Header Top Billboard (970x90 / 728x90)',
    position: 'top_billboard',
    isEnabled: true,
    type: 'custom_banner',
    advertiserName: 'Bank Digital Nusantara - Solusi Finansial Pintar',
    bannerImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://example.com/promo-bank-digital?utm_source=arunnews&utm_medium=billboard&utm_campaign=fintech2026',
    impressions: 142500,
    clicks: 4890
  },
  {
    id: 'slot-in-article',
    name: 'In-Article Responsive MPU (300x250 / 336x280)',
    position: 'in_article',
    isEnabled: true,
    type: 'advertorial',
    advertiserName: 'Ekosistem Kendaraan Listrik Nasional',
    bannerImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://example.com/ev-indonesia?utm_source=arunnews&utm_medium=in_article&utm_campaign=green_mobility',
    impressions: 89300,
    clicks: 3120
  },
  {
    id: 'slot-sidebar-sticky',
    name: 'Sidebar Sticky Skyscraper (300x600)',
    position: 'sidebar_sticky',
    isEnabled: true,
    type: 'custom_banner',
    advertiserName: 'Festival Wisata Bahari Raja Ampat',
    bannerImage: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=600&q=80',
    targetUrl: 'https://example.com/wisata-bahari?utm_source=arunnews&utm_medium=sidebar&utm_campaign=pesona_nusantara',
    impressions: 64200,
    clicks: 1980
  },
  {
    id: 'slot-bottom-sticky',
    name: 'Bottom Sticky Mobile Anchor (728x90)',
    position: 'bottom_sticky',
    isEnabled: false,
    type: 'custom_banner',
    advertiserName: 'Aplikasi Pembelajaran Sains Online',
    bannerImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://example.com/edu-sains?utm_source=arunnews&utm_medium=bottom_anchor',
    impressions: 31000,
    clicks: 840
  }
];

export const DEFAULT_SEM_SETTINGS: SEMSettings = {
  gtmId: 'GTM-ARUN92X',
  ga4MeasurementId: 'G-ARUN2026NEWS',
  googleAdsConversionId: 'AW-892174092',
  metaPixelId: 'PIXEL-4019284019',
  tiktokPixelId: 'TT-ARUNMEDIA99',
  enableAdPlacements: true,
  adSlots: DEFAULT_AD_SLOTS
};

/**
 * Builds standard UTM Campaign URL for Search Engine Marketing
 */
export function buildUtmUrl(
  baseUrl: string,
  source: string = 'google',
  medium: string = 'cpc',
  campaign: string = 'berita_utama_nasional',
  content?: string,
  term?: string
): string {
  try {
    const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
    if (source) url.searchParams.set('utm_source', source.toLowerCase().replace(/\s+/g, '_'));
    if (medium) url.searchParams.set('utm_medium', medium.toLowerCase().replace(/\s+/g, '_'));
    if (campaign) url.searchParams.set('utm_campaign', campaign.toLowerCase().replace(/\s+/g, '_'));
    if (content) url.searchParams.set('utm_content', content.toLowerCase().replace(/\s+/g, '_'));
    if (term) url.searchParams.set('utm_term', term.toLowerCase().replace(/\s+/g, '+'));
    return url.toString();
  } catch {
    const params = [
      `utm_source=${encodeURIComponent(source)}`,
      `utm_medium=${encodeURIComponent(medium)}`,
      `utm_campaign=${encodeURIComponent(campaign)}`,
      content ? `utm_content=${encodeURIComponent(content)}` : '',
      term ? `utm_term=${encodeURIComponent(term)}` : ''
    ].filter(Boolean).join('&');
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params}`;
  }
}

/**
 * Simulates SEM Google Ads / Sponsored News campaign projection
 */
export function simulateSemCampaign(
  budgetRupiah: number,
  targetChannel: 'google_search' | 'google_display' | 'meta_ads' | 'sponsored_discovery',
  category: string
): SemProjectionResult {
  const channelMultipliers = {
    google_search: { avgCpc: 1800, ctr: 4.8, convRate: 3.2, reachFactor: 18 },
    google_display: { avgCpc: 650, ctr: 1.2, convRate: 0.9, reachFactor: 85 },
    meta_ads: { avgCpc: 950, ctr: 2.6, convRate: 2.1, reachFactor: 42 },
    sponsored_discovery: { avgCpc: 800, ctr: 3.4, convRate: 2.8, reachFactor: 35 }
  };

  const config = channelMultipliers[targetChannel] || channelMultipliers.google_search;
  const effectiveCpc = config.avgCpc;
  const estimatedClicks = Math.max(1, Math.round(budgetRupiah / effectiveCpc));
  const estimatedImpressions = Math.round((estimatedClicks / (config.ctr / 100)));
  const estimatedConversions = Math.round(estimatedClicks * (config.convRate / 100));

  const keywordMap: Record<string, string[]> = {
    ekonomi: ['investasi reksadana 2026', 'saham bumn dividen tinggi', 'bunga kpr perbankan terendah', 'peluang bisnis umkm'],
    teknologi: ['gadget ai terbaru', 'paket internet satelit 5g', 'kecerdasan buatan indonesia', 'keamanan data siber'],
    olahraga: ['jadwal timnas garuda', 'tiket final piala asia', 'rekap pertandingan badminton', 'jersey timnas original'],
    nasional: ['layanan ikd online', 'kebijakan ekonomi ikn', 'syarat perpanjang paspor kilat', 'bansos digital pemda'],
    lingkungan: ['smart farming iot', 'panel surya rumah hemat', 'mobil listrik subsidi', 'kredit karbon indonesia']
  };

  const recommendedKeywords = keywordMap[category.toLowerCase()] || [
    'berita terkini hari ini',
    'portal warta terpercaya',
    'kabar nasional terhangat',
    'analisis kebijakan publik'
  ];

  return {
    estimatedImpressions,
    estimatedClicks,
    projectedCtr: config.ctr,
    effectiveCpc,
    estimatedConversions,
    targetAudienceReach: `${(estimatedImpressions * 0.75 / 1000).toFixed(1)}K Pengguna Aktif`,
    recommendedKeywords
  };
}
