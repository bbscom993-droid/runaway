import { NewsArticle } from '../types';

/**
 * Mendapatkan Public Portal Origin resmi yang dapat diakses publik dari WhatsApp
 * Otomatis mengganti subdomain internal dev preview ('ais-dev-') dan localhost 
 * menjadi Public Shared App URL resmi agar pengguna lain di WhatsApp dapat langsung membuka tautan tanpa error/login barrier.
 */
export function getPublicPortalOrigin(): string {
  if (typeof window === 'undefined') {
    return 'https://ais-pre-42ghfhr3ragfvzkpemkvnw-42487289899.asia-east1.run.app';
  }

  const origin = window.location.origin || '';
  const hostname = window.location.hostname || '';

  // 1. Jika di lingkungan dev AI Studio ('ais-dev-'), ubah ke public preview ('ais-pre-')
  if (origin.includes('ais-dev-')) {
    return origin.replace('ais-dev-', 'ais-pre-');
  }

  // 2. Jika di localhost / 127.0.0.1, gunakan URL Shared App publik agar tautan WA di smartphone tidak mengarah ke localhost HP penerima
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    return 'https://ais-pre-42ghfhr3ragfvzkpemkvnw-42487289899.asia-east1.run.app';
  }

  return origin;
}

/**
 * Menghasilkan tautan resmi artikel warta yang langsung menuju sumber berita saat diklik
 */
export function getArticleShareUrl(article: { id?: string; slug?: string }): string {
  const origin = getPublicPortalOrigin();
  const target = encodeURIComponent((article.slug || article.id || 'art-1').trim());
  return `${origin}/article/${target}`;
}

/**
 * Format teks pesan WhatsApp resmi: Judul tebal, ringkasan warta, dan URL sumber di baris tersendiri
 * Format ini memastikan WhatsApp Crawler mendeteksi URL dan langsung menampilkan Open Graph Card Preview dengan foto berita
 */
export function getWhatsAppShareText(article: NewsArticle): string {
  const url = getArticleShareUrl(article);
  const rawExcerpt = article.excerpt || (article.paragraphs && article.paragraphs[0]) || article.content?.substring(0, 160) || '';
  const cleanExcerpt = rawExcerpt.length > 150 ? rawExcerpt.slice(0, 150) + '...' : rawExcerpt;

  return `📰 *${article.title}*\n\n${cleanExcerpt}\n\n👉 *Baca Selengkapnya Langsung di Portal Arun News:*\n${url}`;
}

/**
 * Membuka aplikasi WhatsApp langsung di smartphone (whatsapp://) atau web WhatsApp di desktop (api.whatsapp.com)
 */
export function openWhatsAppShare(article: NewsArticle): void {
  const message = getWhatsAppShareText(article);
  const encoded = encodeURIComponent(message);
  const waWebUrl = `https://api.whatsapp.com/send?text=${encoded}`;

  // Menggunakan window.open agar URL dan posisi halaman portal tidak berubah atau hilang
  try {
    const opened = window.open(waWebUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
    }
  } catch {
    window.open(waWebUrl, '_blank', 'noopener,noreferrer');
  }
}
