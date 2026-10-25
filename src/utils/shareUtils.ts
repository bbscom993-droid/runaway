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
 * Format teks pesan warta resmi dengan rincian SUMBER LENGKAP:
 * Judul tebal, kanal, wartawan penanggung jawab, tanggal rilis, ringkasan warta,
 * dan URL Sumber Berita Resmi di baris tersendiri yang mudah diklik di WhatsApp.
 */
export function getManualShareText(article: NewsArticle): string {
  const url = getArticleShareUrl(article);
  const rawExcerpt = article.excerpt || (article.paragraphs && article.paragraphs[0]) || article.content?.substring(0, 160) || '';
  const cleanExcerpt = rawExcerpt.length > 180 ? rawExcerpt.slice(0, 180) + '...' : rawExcerpt;
  const authorName = article.author?.name || 'Redaksi Arun News';
  const categoryName = (article.categoryLabel || article.category || 'Berita').toUpperCase();
  const dateStr = article.publishedAt || (article as { date?: string }).date || 'Hari ini';

  return `📰 *${article.title}*\n\n📂 *Kanal:* ${categoryName}  |  ✍️ *Wartawan:* ${authorName}  |  🗓️ ${dateStr}\n\n"${cleanExcerpt}"\n\n🌐 *BACA SUMBER BERITA LENGKAP:*\n👉 ${url}\n\n🏛️ _Sumber Resmi: Portal Arun News — Media Siber Independen Terverifikasi Dewan Pers RI_`;
}

export function getWhatsAppShareText(article: NewsArticle): string {
  return getManualShareText(article);
}

/**
 * Salin teks & link sumber warta ke clipboard (Manual Share)
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
 * Mengonversi gambar warta asli (article.imageUrl) menjadi objek File browser
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
 * Membuat Kartu Gambar Warta Ber-Watermark Sumber Resmi (Composite Share Card)
 * Menggabungkan foto berita dengan watermark judul besar, logo portal, tanggal, dan tautan sumber
 * sehingga saat dibagikan ke WhatsApp atau media sosial, SUMBER BERITA tampak jelas di dalam fotonya.
 */
export async function createBrandedShareCard(
  article: NewsArticle
): Promise<{ file: File; blob: Blob; dataUrl: string } | null> {
  if (typeof window === 'undefined') return null;

  try {
    const width = 1200;
    const height = 675; // Standar rasio emas 16:9 untuk pratinjau WhatsApp & medsos
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Gambar foto utama sebagai latar belakang
    let imageLoaded = false;
    if (article.imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image failed to load'));
          img.src = article.imageUrl;
        });

        // Cover crop (menjaga proporsi tanpa distorsi)
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = width / height;
        let sWidth = img.naturalWidth;
        let sHeight = img.naturalHeight;
        let sx = 0;
        let sy = 0;

        if (imgRatio > canvasRatio) {
          sWidth = img.naturalHeight * canvasRatio;
          sx = (img.naturalWidth - sWidth) / 2;
        } else {
          sHeight = img.naturalWidth / canvasRatio;
          sy = (img.naturalHeight - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
        imageLoaded = true;
      } catch {
        // Fallback gradasi solid jika foto gagal di-fetch
      }
    }

    if (!imageLoaded) {
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0c4a6e');
      bgGrad.addColorStop(1, '#075985');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Lapisan bayangan gradien gelap di bagian bawah agar teks judul terbaca jelas
    const gradient = ctx.createLinearGradient(0, height * 0.15, 0, height);
    gradient.addColorStop(0, 'rgba(8, 47, 73, 0)');
    gradient.addColorStop(0.4, 'rgba(8, 47, 73, 0.7)');
    gradient.addColorStop(0.85, 'rgba(8, 47, 73, 0.95)');
    gradient.addColorStop(1, 'rgba(8, 47, 73, 0.98)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 3. Pita branding ARUN NEWS di sudut kiri atas
    ctx.fillStyle = 'rgba(12, 74, 110, 0.92)';
    ctx.fillRect(40, 36, 340, 52);
    // Garis aksen kuning
    ctx.fillStyle = '#facc15';
    ctx.fillRect(40, 36, 8, 52);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('ARUN NEWS', 62, 70);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('PORTAL PERS INDEPENDEN', 200, 70);

    // 4. Lencana Rubrik Kategori Berita
    const category = (article.categoryLabel || article.category || 'WARTA').toUpperCase();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    // Gunakan roundRect jika ada, fallback rect standar
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(40, height - 250, 180, 34, 8);
    } else {
      ctx.rect(40, height - 250, 180, 34);
    }
    ctx.fill();

    ctx.fillStyle = '#082f49';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`• ${category.slice(0, 16)}`, 54, height - 227);

    // 5. Teks Judul Berita Utama (Multi-line dengan teks tebal)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const maxTextWidth = width - 90;
    const words = article.title.split(' ');
    let currentLine = '';
    let lineY = height - 175;
    const lineHeight = 46;
    let lineCount = 0;

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && i > 0) {
        ctx.fillText(currentLine, 40, lineY);
        currentLine = words[i];
        lineY += lineHeight;
        lineCount++;
        if (lineCount >= 2 && i < words.length - 1) {
          currentLine += '...';
          break;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      ctx.fillText(currentLine, 40, lineY);
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 6. Bilah Pita Sumber Resmi Berita di Bagian Bawah Gambar
    const shareUrl = getArticleShareUrl(article);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
    ctx.fillRect(0, height - 56, width, 56);
    // Garis aksen emas di atas bilah sumber
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, height - 56, width, 3);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('👉 SUMBER RESMI:', 40, height - 22);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px monospace';
    const displayUrl = shareUrl.length > 55 ? shareUrl.slice(0, 52) + '...' : shareUrl;
    ctx.fillText(displayUrl, 210, height - 22);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Dewan Pers RI No. 892/DP/K/VIII/2026', width - 265, height - 22);

    // 7. Hasilkan Blob dan File
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92);
    });

    if (!blob) return null;

    const filename = `arun-news-${article.slug || 'warta'}-kartu-sumber.jpg`;
    const file = new File([blob], filename, { type: 'image/jpeg' });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    return { file, blob, dataUrl };
  } catch (err) {
    console.warn('Gagal membuat kartu gambar warta:', err);
    return null;
  }
}

/**
 * Membagikan warta berita secara lengkap beserta GAMBAR & SUMBER RESMI
 * via Web Share API (navigator.share).
 * Bila pengguna memilih WhatsApp di menu share, WhatsApp akan menerima FOTO WARTA
 * beserta caption yang berisi SUMBER TAUTAN RESMI artikel secara bersamaan.
 */
export async function shareArticleViaWebShare(
  article: NewsArticle,
  options?: {
    useBrandedCard?: boolean;
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
      // 1. Coba sertakan file gambar berita (baik kartu ber-watermark sumber atau foto asli)
      let imageFile: File | null = null;
      if (options?.useBrandedCard) {
        const card = await createBrandedShareCard(article);
        imageFile = card?.file || null;
      }
      if (!imageFile) {
        imageFile = await getArticleImageFile(article);
      }

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
      if (err && (err.name === 'AbortError' || err.code === 20)) {
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
export async function copyArticleImageToClipboard(
  article: NewsArticle,
  options?: { useBrandedCard?: boolean }
): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.write) {
    return false;
  }

  try {
    let blob: Blob | null = null;

    if (options?.useBrandedCard) {
      const card = await createBrandedShareCard(article);
      blob = card?.blob || null;
    }

    if (!blob && article.imageUrl) {
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
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/png');
        });
      }
    }

    if (!blob) return false;

    // Browser Clipboard API requires image/png
    let pngBlob = blob;
    if (blob.type !== 'image/png') {
      const img = new Image();
      const objUrl = URL.createObjectURL(blob);
      img.src = objUrl;
      await new Promise<void>((resolve) => { img.onload = () => resolve(); });
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const cx = c.getContext('2d');
      cx?.drawImage(img, 0, 0);
      pngBlob = await new Promise<Blob | null>((resolve) => c.toBlob(resolve, 'image/png')) || blob;
      URL.revokeObjectURL(objUrl);
    }

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': pngBlob })
    ]);
    return true;
  } catch (e) {
    console.warn('Gagal salin gambar ke clipboard:', e);
    return false;
  }
}
