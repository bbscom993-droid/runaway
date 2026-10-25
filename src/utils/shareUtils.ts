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
 * Format teks pesan warta resmi: Judul tebal, ringkasan warta, dan URL sumber di baris tersendiri
 * Format ini siap disalin secara manual untuk ditempel di WhatsApp, Telegram, email, dsb.
 */
export function getManualShareText(article: NewsArticle): string {
  const url = getArticleShareUrl(article);
  const rawExcerpt = article.excerpt || (article.paragraphs && article.paragraphs[0]) || article.content?.substring(0, 160) || '';
  const cleanExcerpt = rawExcerpt.length > 150 ? rawExcerpt.slice(0, 150) + '...' : rawExcerpt;

  return `📰 *${article.title}*\n\n${cleanExcerpt}\n\n👉 *Baca Selengkapnya Langsung di Portal Arun News:*\n${url}`;
}

export function getWhatsAppShareText(article: NewsArticle): string {
  return getManualShareText(article);
}

/**
 * Salin teks & link warta ke clipboard (Manual Share)
 */
export function copyArticleShareText(article: NewsArticle): boolean {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    const text = getManualShareText(article);
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export function openWhatsAppShare(article: NewsArticle): void {
  copyArticleShareText(article);
}

/**
 * Mengonversi gambar warta (article.imageUrl) menjadi objek File browser
 * yang dapat dilampirkan langsung ke Web Share API (navigator.share)
 * sehingga ketika dibagikan ke WhatsApp, WhatsApp otomatis menampilkan foto warta bersangkutan.
 */
export async function getArticleImageFile(article: NewsArticle): Promise<File | null> {
  if (!article.imageUrl || typeof window === 'undefined') return null;

  const filename = `${(article.slug || article.id || 'warta-arun-news').replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;

  // 1. Coba fetch langsung jika URL gambar mengizinkan CORS
  try {
    const response = await fetch(article.imageUrl, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      const mimeType = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
      return new File([blob], filename, { type: mimeType });
    }
  } catch {
    // Lanjut ke fallback Canvas jika fetch diblokir CORS
  }

  // 2. Fallback Canvas untuk menghasilkan Blob gambar JPEG
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed loading image for canvas'));
      img.src = article.imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.88);
    });

    if (blob) {
      return new File([blob], filename, { type: 'image/jpeg' });
    }
  } catch {
    // Gagal render canvas
  }

  return null;
}

/**
 * Membagikan warta berita secara lengkap beserta LAMPIRAN GAMBAR
 * via Web Share API (navigator.share).
 * Bila pengguna memilih WhatsApp di menu share, WhatsApp akan menerima FOTO WARTA
 * beserta judul, rangkuman, dan link artikel secara bersamaan.
 */
export async function shareArticleViaWebShare(
  article: NewsArticle,
  options?: {
    onSuccess?: () => void;
    onCancel?: () => void;
    onError?: (err: any) => void;
  }
): Promise<{ success: boolean; hasImage: boolean; method: 'files' | 'text' | 'clipboard' }> {
  const shareText = getManualShareText(article);
  const shareUrl = getArticleShareUrl(article);
  const nav = typeof navigator !== 'undefined' ? navigator : null;

  if (nav && typeof nav.share === 'function') {
    try {
      // 1. Coba sertakan file gambar berita jika browser mendukung canShare({ files })
      const imageFile = await getArticleImageFile(article);

      if (imageFile && typeof nav.canShare === 'function' && nav.canShare({ files: [imageFile] })) {
        await nav.share({
          files: [imageFile],
          title: article.title,
          text: shareText,
          url: shareUrl,
        });
        options?.onSuccess?.();
        return { success: true, hasImage: true, method: 'files' };
      }

      // 2. Jika canShare({ files }) tidak didukung, share teks & URL via Web Share API
      await nav.share({
        title: article.title,
        text: shareText,
        url: shareUrl,
      });
      options?.onSuccess?.();
      return { success: true, hasImage: false, method: 'text' };
    } catch (err: any) {
      if (err && (err.name === 'AbortError' || err.name === 'AbortError' || err.code === 20)) {
        options?.onCancel?.();
        return { success: false, hasImage: false, method: 'text' };
      }
      options?.onError?.(err);
    }
  }

  // 3. Fallback: Salin teks & link ke clipboard
  copyArticleShareText(article);
  options?.onSuccess?.();
  return { success: true, hasImage: false, method: 'clipboard' };
}

/**
 * Salin file gambar berita langsung ke Clipboard (Navigator Clipboard API)
 * Berguna saat membuka WhatsApp Web / Telegram di komputer
 * agar pengguna cukup menekan Ctrl+V untuk menempel foto warta
 */
export async function copyArticleImageToClipboard(article: NewsArticle): Promise<boolean> {
  if (!article.imageUrl || typeof navigator === 'undefined' || !navigator.clipboard?.write) {
    return false;
  }

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Gagal memuat gambar untuk clipboard'));
      img.src = article.imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) return false;

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  } catch (e) {
    console.warn('Gagal salin gambar ke clipboard:', e);
    return false;
  }
}
