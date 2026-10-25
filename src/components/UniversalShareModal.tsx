import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  Download,
  Image as ImageIcon,
  X,
  ExternalLink,
  Quote,
  Sparkles,
  Smartphone,
  Send,
  FileText,
  MessageCircle,
  Camera,
  Layers,
  CheckCircle2,
  Info
} from 'lucide-react';
import { NewsArticle } from '../types';
import { 
  getArticleShareUrl, 
  getArticleImageFile, 
  createBrandedShareCard,
  copyArticleImageToClipboard,
  shareArticleViaWebShare,
  getWhatsAppShareText 
} from '../utils/shareUtils';

export interface UniversalShareModalProps {
  article: NewsArticle;
  isOpen: boolean;
  onClose: () => void;
  onTrackShare?: (platform: string) => void;
}

export const UniversalShareModal: React.FC<UniversalShareModalProps> = ({
  article,
  isOpen,
  onClose,
  onTrackShare
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [isSharingNative, setIsSharingNative] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Opsi Format Gambar: Apakah menggunakan kartu ber-watermark sumber atau foto asli
  const [useBrandedCard, setUseBrandedCard] = useState<boolean>(true);
  const [brandedCardPreview, setBrandedCardPreview] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Generate live branded share card preview with source
      let isMounted = true;
      setIsGeneratingCard(true);
      createBrandedShareCard(article).then((res) => {
        if (isMounted && res) {
          setBrandedCardPreview(res.dataUrl);
        }
        if (isMounted) setIsGeneratingCard(false);
      }).catch(() => {
        if (isMounted) setIsGeneratingCard(false);
      });
      return () => {
        isMounted = false;
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      setShareFeedback(null);
      setBrandedCardPreview(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, article]);

  if (!isOpen) return null;

  const shareUrl = getArticleShareUrl(article);
  const shareFullText = getWhatsAppShareText(article);
  const cleanExcerpt = article.excerpt || (article.paragraphs && article.paragraphs[0]) || article.content?.substring(0, 160) || '';

  const triggerFeedback = (msg: string) => {
    setShareFeedback(msg);
    setTimeout(() => {
      setShareFeedback(null);
    }, 4500);
  };

  // 1. Kirim ke WhatsApp (Beserta Foto & Tautan Sumber Resmi)
  const handleShareToWhatsApp = async () => {
    setIsSharingWhatsApp(true);
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : null;

      // Dapatkan file foto (baik kartu ber-watermark sumber resmi atau foto asli)
      let file: File | null = null;
      if (useBrandedCard) {
        const cardRes = await createBrandedShareCard(article);
        file = cardRes?.file || null;
      }
      if (!file) {
        file = await getArticleImageFile(article);
      }

      // 1. Jika Web Share API mendukung lampiran file (paling optimal di smartphone / HP)
      if (nav && typeof nav.canShare === 'function' && file && nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          title: article.title,
          text: shareFullText,
          url: shareUrl,
        });
        if (onTrackShare) onTrackShare('whatsapp_files_with_source');
        triggerFeedback('✓ Berhasil! Foto berita & teks sumber resmi telah dikirim ke WhatsApp.');
        return;
      }

      // 2. Fallback WhatsApp Web / Desktop (Salin foto ke clipboard otomatis + buka WhatsApp)
      const copiedImg = await copyArticleImageToClipboard(article, { useBrandedCard });
      if (nav && nav.clipboard) {
        await nav.clipboard.writeText(shareFullText);
      }
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareFullText)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (onTrackShare) onTrackShare('whatsapp_direct_with_source');

      if (copiedImg) {
        triggerFeedback('✓ Foto warta & link sumber telah disalin! Di chat WhatsApp, tekan Tempel (Ctrl+V) untuk melampirkan fotonya.');
      } else {
        triggerFeedback('✓ Membuka WhatsApp dengan judul warta & link sumber resmi.');
      }
    } catch {
      // User cancelled or closed dialog
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  // 2. Native Web Share via Sistem Perangkat
  const handleNativeShareFull = async () => {
    setIsSharingNative(true);
    try {
      const res = await shareArticleViaWebShare(article, {
        useBrandedCard,
        onSuccess: () => {
          if (onTrackShare) onTrackShare('native_files');
          triggerFeedback('✓ Berita, foto warta & link sumber berhasil dibagikan!');
        },
        onError: () => {
          handleCopyFullText();
        }
      });

      if (res.method === 'clipboard') {
        setCopiedText(true);
        triggerFeedback('✓ Teks & sumber warta telah disalin ke clipboard.');
        setTimeout(() => setCopiedText(false), 2500);
      }
    } catch {
      // User cancelled
    } finally {
      setIsSharingNative(false);
    }
  };

  // 3. Salin Teks Lengkap + Tautan Sumber ke Clipboard
  const handleCopyFullText = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareFullText);
      setCopiedText(true);
      if (onTrackShare) onTrackShare('copy_full_text');
      triggerFeedback('✓ Judul, ringkasan & link sumber resmi berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  // 4. Salin Tautan Sumber Saja
  const handleCopyLink = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      if (onTrackShare) onTrackShare('copy_link');
      triggerFeedback('✓ Tautan sumber artikel berhasil disalin!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // 5. Salin Gambar Berita ke Clipboard (Siap Paste di WhatsApp Web)
  const handleCopyImage = async () => {
    try {
      const ok = await copyArticleImageToClipboard(article, { useBrandedCard });
      if (ok) {
        setCopiedImage(true);
        if (onTrackShare) onTrackShare('copy_image');
        triggerFeedback('✓ Foto warta berhasil disalin ke clipboard! Tekan Tempel / Ctrl+V di WhatsApp untuk melampirkannya.');
        setTimeout(() => setCopiedImage(false), 3000);
        return;
      }
      throw new Error('ClipboardItem write not supported');
    } catch {
      handleDownloadImage();
      triggerFeedback('ℹ️ Gambar warta diunduh otomatis ke perangkat Anda.');
    }
  };

  // 6. Unduh Foto Warta (dengan Watermark Sumber atau Foto Asli)
  const handleDownloadImage = async () => {
    try {
      if (useBrandedCard) {
        const card = await createBrandedShareCard(article);
        if (card) {
          const a = document.createElement('a');
          a.href = card.dataUrl;
          a.download = `arun-news-${article.slug || 'warta'}-kartu-sumber.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          if (onTrackShare) onTrackShare('download_branded_card');
          triggerFeedback('✓ Kartu berita ber-watermark sumber resmi berhasil diunduh!');
          return;
        }
      }

      if (article.imageUrl) {
        const resp = await fetch(article.imageUrl, { mode: 'cors' });
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `arun-news-${article.slug || 'warta'}-foto.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        if (onTrackShare) onTrackShare('download_image');
        triggerFeedback('✓ Foto warta berhasil diunduh ke galeri perangkat!');
      }
    } catch {
      if (article.imageUrl) window.open(article.imageUrl, '_blank');
    }
  };

  // 7. Sitasi Formal Format APA 7th Edition
  const generateApaCitation = () => {
    const authorName = article.author?.name || 'Redaksi Arun News';
    const year = new Date().getFullYear();
    const formattedDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    return `${authorName}. (${year}). ${article.title}. Arun News Portal Pers Independen. Diakses pada ${formattedDate}, dari ${shareUrl}`;
  };

  const handleCopyCitation = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(generateApaCitation());
      setCopiedCitation(true);
      if (onTrackShare) onTrackShare('copy_citation');
      triggerFeedback('✓ Sitasi formal APA 7th ed. beserta sumber warta berhasil disalin!');
      setTimeout(() => setCopiedCitation(false), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 border-2 border-yellow-400 shadow-2xl relative my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Tutup Dialog Bagikan"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-md border border-yellow-500 flex-shrink-0">
            <Share2 className="w-5 h-5 text-sky-950" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-sky-950 uppercase tracking-tight">
              Bagikan Warta (Gambar &amp; Sumber)
            </h3>
            <p className="text-[11px] text-sky-800 font-bold">
              Kirim berita ke WhatsApp lengkap beserta lampiran foto dan tautan sumber resmi
            </p>
          </div>
        </div>

        {/* Global Feedback Toast */}
        {shareFeedback && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-150 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="flex-1 leading-snug">{shareFeedback}</span>
          </div>
        )}

        {/* Toggle Pilihan Format Foto: Kartu Ber-Watermark Sumber vs Foto Asli */}
        <div className="mb-3 p-2 bg-sky-50 rounded-2xl border border-sky-200">
          <div className="flex items-center justify-between gap-1 text-xs">
            <span className="text-[11px] font-mono font-bold text-sky-900 flex items-center gap-1.5 pl-1">
              <Layers className="w-3.5 h-3.5 text-yellow-600" />
              <span>Format Gambar:</span>
            </span>

            <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-sky-200">
              <button
                type="button"
                onClick={() => setUseBrandedCard(true)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  useBrandedCard 
                    ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black' 
                    : 'text-slate-600 hover:text-sky-950'
                }`}
                title="Sertakan watermark judul berita & sumber resmi pada gambar"
              >
                + Watermark Sumber
              </button>
              <button
                type="button"
                onClick={() => setUseBrandedCard(false)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  !useBrandedCard 
                    ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black' 
                    : 'text-slate-600 hover:text-sky-950'
                }`}
                title="Gunakan foto jurnalistik asli tanpa watermark teks"
              >
                Foto Asli
              </button>
            </div>
          </div>
        </div>

        {/* Card Preview (Gambar yang Akan Dikirim Beserta Sumber) */}
        <div className="p-3 bg-gradient-to-br from-sky-950 via-sky-900 to-slate-900 rounded-2xl border-2 border-yellow-400 text-white mb-4 shadow-inner">
          <div className="space-y-2.5">
            {/* Visual Image Preview */}
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-yellow-400/80 shadow-md group bg-slate-900">
              <img
                src={(useBrandedCard && brandedCardPreview) ? brandedCardPreview : article.imageUrl}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 bg-yellow-400 text-sky-950 text-[9px] font-black font-mono px-2 py-0.5 rounded shadow-sm uppercase">
                {useBrandedCard ? 'KARTU RESMI + SUMBER' : 'FOTO WARTA ASLI'}
              </span>
              <span className="absolute bottom-2 right-2 bg-emerald-500 text-slate-950 text-[9px] font-black font-mono px-2 py-0.5 rounded shadow-sm">
                ✓ Siap Dikirim ke WhatsApp
              </span>
              {isGeneratingCard && useBrandedCard && (
                <div className="absolute inset-0 bg-sky-950/70 backdrop-blur-2xs flex items-center justify-center gap-2 text-yellow-300 font-mono text-xs">
                  <Sparkles className="w-4 h-4 animate-spin text-yellow-400" />
                  <span>Merender watermark sumber resmi...</span>
                </div>
              )}
            </div>

            {/* Info Sumber Warta & Judul */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-yellow-400 text-sky-950 text-[9px] font-black font-mono uppercase">
                  {article.categoryLabel}
                </span>
                <span className="text-[10px] text-sky-300 font-mono">
                  {article.date} • Reporter: {article.author?.name || 'Redaksi'}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                {article.title}
              </h4>

              {/* Tautan Sumber Resmi Highlighted */}
              <div className="p-2 bg-sky-900/80 rounded-xl border border-sky-700/80 text-[10px] font-mono text-sky-200 mt-1.5 space-y-0.5">
                <div className="text-yellow-300 font-bold flex items-center gap-1">
                  <span>👉 TAUTAN SUMBER RESMI:</span>
                </div>
                <div className="text-sky-100 truncate font-semibold">
                  {shareUrl}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TOMBOL UTAMA 1: SHARE KE WHATSAPP (GAMBAR + SUMBER)     */}
        {/* ======================================================== */}
        <div className="mb-3 space-y-1.5">
          <button
            type="button"
            onClick={handleShareToWhatsApp}
            disabled={isSharingWhatsApp}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer border-2 border-emerald-400 active:scale-98"
            title="Bagikan warta ini langsung ke WhatsApp beserta foto dan link sumber resmi"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>{isSharingWhatsApp ? 'Menyiapkan Gambar & Sumber...' : 'Share WhatsApp (Gambar + Sumber Berita)'}</span>
            <span className="text-[9px] bg-yellow-400 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
              Foto + Link
            </span>
          </button>
          <p className="text-[10px] text-emerald-800 font-mono text-center font-bold">
            💬 Otomatis melampirkan foto warta dan tautan sumber resmi ke chat / grup WhatsApp Anda.
          </p>
        </div>

        {/* ======================================================== */}
        {/* TOMBOL 2: BAGIKAN VIA WEB SHARE API SISTEM PERANGKAT    */}
        {/* ======================================================== */}
        <div className="mb-3">
          <button
            type="button"
            onClick={handleNativeShareFull}
            disabled={isSharingNative}
            className="w-full py-3 px-4 rounded-2xl bg-sky-900 hover:bg-sky-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-sky-700 active:scale-98"
            title="Buka menu berbagi bawaan sistem perangkat dengan file foto warta dan tautan sumber"
          >
            <Smartphone className="w-4 h-4 text-yellow-400" />
            <span>Bagikan via Menu Sistem (Web Share API)</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* TOMBOL 3: SALIN TEKS LENGKAP + SUMBER (1-KLIK)          */}
        {/* ======================================================== */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleCopyFullText}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-500 active:scale-98"
            title="Salin judul berita, ringkasan dan tautan sumber resmi ke clipboard"
          >
            {copiedText ? <Check className="w-4 h-4 text-sky-950" /> : <Copy className="w-4 h-4 text-sky-950" />}
            <span>{copiedText ? '✓ Teks & Sumber Warta Berhasil Disalin!' : 'Salin Teks Lengkap + Sumber Berita'}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TINDAKAN CEPAT: SALIN GAMBAR, UNDUH, SALIN LINK, SITASI  */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {/* Salin Gambar ke Clipboard */}
          <button
            type="button"
            onClick={handleCopyImage}
            className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
              copiedImage 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-sky-50 hover:bg-yellow-100 text-sky-950 border-sky-200'
            }`}
            title="Salin foto warta ke clipboard untuk dipaste (Ctrl+V) di WhatsApp"
          >
            {copiedImage ? <Check className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4 text-sky-700" />}
            <span className="text-[10px] font-black uppercase">Salin Foto</span>
            <span className="text-[9px] font-mono opacity-80">{copiedImage ? 'Tersalin!' : 'Clipboard'}</span>
          </button>

          {/* Unduh Foto (Beserta Sumber) */}
          <button
            type="button"
            onClick={handleDownloadImage}
            className="p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer bg-sky-50 hover:bg-yellow-100 text-sky-950 border-sky-200"
            title="Unduh foto berita ber-watermark sumber resmi ke galeri perangkat"
          >
            <Download className="w-4 h-4 text-sky-700" />
            <span className="text-[10px] font-black uppercase">Unduh Foto</span>
            <span className="text-[9px] font-mono opacity-80">{useBrandedCard ? '+ Sumber' : 'File Foto'}</span>
          </button>

          {/* Salin Tautan Sumber Saja */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
              copiedLink 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-sky-50 hover:bg-yellow-100 text-sky-950 border-sky-200'
            }`}
            title="Salin link artikel berita resmi"
          >
            {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-sky-700" />}
            <span className="text-[10px] font-black uppercase">Salin Link</span>
            <span className="text-[9px] font-mono opacity-80">{copiedLink ? 'Tersalin!' : 'Link Sumber'}</span>
          </button>

          {/* Sitasi APA */}
          <button
            type="button"
            onClick={handleCopyCitation}
            className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
              copiedCitation 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-sky-50 hover:bg-yellow-100 text-sky-950 border-sky-200'
            }`}
            title="Salin format sitasi jurnalisme formal APA 7th ed."
          >
            {copiedCitation ? <Check className="w-4 h-4 text-white" /> : <Quote className="w-4 h-4 text-sky-700" />}
            <span className="text-[10px] font-black uppercase">Sitasi APA</span>
            <span className="text-[9px] font-mono opacity-80">{copiedCitation ? 'Tersalin!' : 'Akademik'}</span>
          </button>
        </div>

        {/* Footer Info Transparansi Sumber */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1 text-slate-600">
            <Info className="w-3.5 h-3.5 text-sky-700" />
            <span>Hak Cipta © 2026 Arun News</span>
          </span>
          <span className="text-sky-800 font-bold">
            Dewan Pers RI No. 892/DP/K/VIII/2026
          </span>
        </div>

      </div>
    </div>
  );
};
