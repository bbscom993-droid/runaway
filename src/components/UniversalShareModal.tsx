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
  Camera
} from 'lucide-react';
import { NewsArticle } from '../types';
import { 
  getArticleShareUrl, 
  getArticleImageFile, 
  copyArticleImageToClipboard,
  shareArticleViaWebShare 
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShareFeedback(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const shareUrl = getArticleShareUrl(article);
  const cleanExcerpt = article.excerpt || (article.paragraphs && article.paragraphs[0]) || article.content.substring(0, 160) + '...';
  const shareFullText = `📰 *${article.title}*\n\n${cleanExcerpt}\n\n👉 *Buka Berita Lengkap di Portal Arun News:*\n${shareUrl}`;

  const triggerFeedback = (msg: string) => {
    setShareFeedback(msg);
    setTimeout(() => {
      setShareFeedback(null);
    }, 4000);
  };

  // 1. Salin Teks Lengkap + Tautan (Manual Share Utama)
  const handleCopyFullText = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareFullText);
      setCopiedText(true);
      if (onTrackShare) onTrackShare('copy_full_text');
      triggerFeedback('✓ Judul, ringkasan & tautan berhasil disalin ke clipboard! Siap ditempel manual.');
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  // 2. Salin Tautan Saja
  const handleCopyLink = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      if (onTrackShare) onTrackShare('copy_link');
      triggerFeedback('✓ Tautan artikel berhasil disalin!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // 3. Native Web Share (Menu Berbagi Sistem Perangkat dengan File Gambar)
  const handleNativeShareFull = async () => {
    setIsSharingNative(true);
    try {
      const res = await shareArticleViaWebShare(article, {
        onSuccess: () => {
          if (onTrackShare) onTrackShare('native_files');
          triggerFeedback('✓ Berita & foto warta berhasil dibagikan via sistem perangkat!');
        },
        onError: () => {
          handleCopyFullText();
        }
      });

      if (res.method === 'clipboard') {
        setCopiedText(true);
        triggerFeedback('✓ Teks & link warta telah disalin ke clipboard.');
        setTimeout(() => setCopiedText(false), 2500);
      }
    } catch {
      // User cancelled or dismissed share sheet
    } finally {
      setIsSharingNative(false);
    }
  };

  // 3b. Kirim ke WhatsApp (Beserta Foto Warta Otomatis)
  const handleShareToWhatsAppWithImage = async () => {
    setIsSharingWhatsApp(true);
    try {
      const file = await getArticleImageFile(article);
      const nav = typeof navigator !== 'undefined' ? navigator : null;

      // Jika Web Share API mendukung kirim file:
      if (nav && nav.canShare && file && nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          title: article.title,
          text: shareFullText,
          url: shareUrl,
        });
        if (onTrackShare) onTrackShare('whatsapp_webshare_files');
        triggerFeedback('✓ Foto warta & teks berita berhasil dibagikan!');
        return;
      }

      // Fallback desktop / browser tanpa file sharing:
      // Salin foto ke clipboard otomatis & buka WhatsApp
      const copiedImg = await copyArticleImageToClipboard(article);
      if (nav && nav.clipboard) {
        await nav.clipboard.writeText(shareFullText);
      }
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareFullText)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (onTrackShare) onTrackShare('whatsapp_direct_clipboard');

      if (copiedImg) {
        triggerFeedback('✓ Foto warta & teks telah disalin! Tekan Tempel / Ctrl+V di chat WhatsApp untuk melampirkan gambar.');
      } else {
        triggerFeedback('✓ Membuka WhatsApp dengan judul & tautan resmi berita.');
      }
    } catch {
      // Cancelled
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  // 4. Salin Gambar ke Clipboard
  const handleCopyImage = async () => {
    if (!article.imageUrl) return;
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = article.imageUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Blob conversion failed');

      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        if (onTrackShare) onTrackShare('copy_image');
        triggerFeedback('✓ Foto warta tersalin ke clipboard! Siap ditempel manual di aplikasi apa saja.');
        setTimeout(() => setCopiedImage(false), 3000);
        return;
      }
      throw new Error('ClipboardItem write not supported');
    } catch (err) {
      // Fallback: download or open image
      handleDownloadImage();
      triggerFeedback('ℹ️ Gambar diunduh otomatis ke perangkat Anda untuk dibagikan.');
    }
  };

  // 5. Unduh Gambar Berita
  const handleDownloadImage = async () => {
    if (!article.imageUrl) return;
    try {
      const resp = await fetch(article.imageUrl, { mode: 'cors' });
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${article.slug || 'arun-news'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      if (onTrackShare) onTrackShare('download_image');
      triggerFeedback('✓ Foto warta berhasil diunduh ke galeri / folder unduhan!');
    } catch {
      window.open(article.imageUrl, '_blank');
    }
  };

  // 6. Sitasi Format APA
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
      triggerFeedback('✓ Sitasi formal APA 7th ed. berhasil disalin!');
      setTimeout(() => setCopiedCitation(false), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 border-2 border-yellow-400 shadow-2xl relative my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Tutup Dialog Bagikan"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-md border border-yellow-500 flex-shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-sky-950 uppercase tracking-tight">
              Bagikan Warta Berita (Manual Share)
            </h3>
            <p className="text-[11px] text-sky-700 font-bold">
              Salin teks warta, gambar, dan tautan resmi untuk dibagikan secara manual
            </p>
          </div>
        </div>

        {/* Global Feedback Toast */}
        {shareFeedback && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0"></span>
            <span>{shareFeedback}</span>
          </div>
        )}

        {/* Card Preview (Gambar + Teks + Info) */}
        <div className="p-3.5 bg-gradient-to-br from-sky-950 via-sky-900 to-slate-900 rounded-2xl border-2 border-yellow-400 text-white mb-4 shadow-inner">
          <div className="flex flex-col sm:flex-row gap-3">
            {article.imageUrl && (
              <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 border-2 border-yellow-400 shadow-md group">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-1.5 left-1.5 bg-yellow-400 text-sky-950 text-[8px] font-black font-mono px-1.5 py-0.5 rounded shadow-sm">
                  FOTO WARTA
                </span>
                <span className="absolute bottom-1.5 right-1.5 bg-emerald-500 text-slate-950 text-[8px] font-black font-mono px-1.5 py-0.5 rounded shadow-sm">
                  ✓ Foto Terlampir
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-yellow-400 text-sky-950 text-[9px] font-black font-mono uppercase">
                  {article.categoryLabel}
                </span>
                <span className="text-[10px] text-sky-300 font-mono">
                  {article.date} • {article.readTime}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                {article.title}
              </h4>
              <p className="text-[11px] text-sky-200 line-clamp-2 leading-relaxed">
                {cleanExcerpt}
              </p>
              <div className="text-[10px] text-yellow-300 font-mono pt-1 flex items-center gap-2">
                <span>🌐 arunnews.id</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">📸 Foto warta siap dikirim</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Tombol Kirim ke WhatsApp (Beserta Foto & Tautan Berita) */}
        <div className="mb-2.5">
          <button
            type="button"
            onClick={handleShareToWhatsAppWithImage}
            disabled={isSharingWhatsApp}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer border-2 border-emerald-400 active:scale-98"
            title="Kirim artikel berita ini langsung ke WhatsApp beserta foto warta"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>{isSharingWhatsApp ? 'Menyiapkan Foto Warta...' : 'Kirim ke WhatsApp (Beserta Foto Berita)'}</span>
            {article.imageUrl && (
              <span className="text-[9px] bg-yellow-400 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                + Foto
              </span>
            )}
          </button>
          <p className="text-[10px] text-emerald-800 font-mono mt-1 text-center font-bold">
            💬 Melampirkan foto berita secara otomatis ke chat / grup WhatsApp Anda.
          </p>
        </div>

        {/* 2. Tombol Bagikan Manual Sistem (Web Share API) */}
        <div className="mb-3">
          <button
            type="button"
            onClick={handleNativeShareFull}
            disabled={isSharingNative}
            className="w-full py-3 px-4 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-sky-700 active:scale-98"
            title="Buka menu berbagi bawaan sistem perangkat Anda dengan foto berita"
          >
            <Smartphone className="w-4 h-4 text-yellow-400" />
            <span>Bagikan via Menu Sistem (Web Share API)</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
          </button>
        </div>

        {/* 3. Salin Teks Lengkap + Tautan Berita */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleCopyFullText}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-500 active:scale-98"
            title="Salin judul warta, ringkasan dan tautan lengkap untuk ditempel manual"
          >
            {copiedText ? <Check className="w-4 h-4 text-sky-950" /> : <Copy className="w-4 h-4 text-sky-950" />}
            <span>{copiedText ? '✓ Teks & Tautan Berhasil Disalin!' : 'Salin Teks Lengkap + Tautan Berita'}</span>
          </button>
        </div>

        {/* 3. Tindakan Cepat (Salin Teks, Salin Link, Gambar, Unduh, Sitasi) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {/* Salin Link Saja */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
              copiedLink 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-sky-50 hover:bg-yellow-100 text-sky-950 border-sky-200'
            }`}
            title="Salin link artikel berita"
          >
            {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-sky-700" />}
            <span className="text-[10px] font-black uppercase">Salin Link</span>
            <span className="text-[9px] font-mono opacity-80">{copiedLink ? 'Tersalin!' : 'Tautan Saja'}</span>
          </button>

          {/* Salin Gambar */}
          <button
            type="button"
            onClick={handleCopyImage}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
              copiedImage 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-sky-50 hover:bg-yellow-100 text-sky-950 border-sky-200'
            }`}
            title="Salin gambar warta ke clipboard untuk dipaste di chat / aplikasi"
          >
            {copiedImage ? <Check className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4 text-sky-700" />}
            <span className="text-[10px] font-black uppercase">Salin Gambar</span>
            <span className="text-[9px] font-mono opacity-80">{copiedImage ? 'Tersalin!' : 'Clipboard'}</span>
          </button>

          {/* Unduh Gambar */}
          <button
            type="button"
            onClick={handleDownloadImage}
            className="p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer bg-sky-50 hover:bg-yellow-100 text-sky-950 border-sky-200"
            title="Unduh file gambar berita ke perangkat Anda"
          >
            <Download className="w-4 h-4 text-sky-700" />
            <span className="text-[10px] font-black uppercase">Unduh Foto</span>
            <span className="text-[9px] font-mono opacity-80">Simpan File</span>
          </button>

          {/* Sitasi APA */}
          <button
            type="button"
            onClick={handleCopyCitation}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
              copiedCitation
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-sky-50 hover:bg-yellow-100 text-sky-950 border-sky-200'
            }`}
            title="Salin format kutipan ilmiah standar APA"
          >
            {copiedCitation ? <Check className="w-4 h-4 text-white" /> : <Quote className="w-4 h-4 text-sky-700" />}
            <span className="text-[10px] font-black uppercase">Sitasi APA</span>
            <span className="text-[9px] font-mono opacity-80">{copiedCitation ? 'Tersalin!' : 'Kutipan'}</span>
          </button>
        </div>

        {/* 4. Pilihan Aplikasi Lain (Tanpa WhatsApp Otomatis) */}
        <div className="space-y-1.5 mb-4">
          <label className="block text-[11px] font-bold text-sky-950 font-mono uppercase">
            Salin &amp; Bagikan ke Platform Lain:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`📰 ${article.title}\n\n${cleanExcerpt}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrackShare && onTrackShare('telegram')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors shadow-2xs"
              title="Bagikan ke Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrackShare && onTrackShare('facebook')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-2xs"
              title="Bagikan ke Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>

            {/* Twitter / X */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`📰 ${article.title}`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrackShare && onTrackShare('twitter')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs"
              title="Bagikan ke X / Twitter"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X (Twitter)</span>
            </a>

            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrackShare && onTrackShare('linkedin')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs transition-colors shadow-2xs"
              title="Bagikan ke LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Arun News Portal Pers Independen</span>
          <button
            onClick={onClose}
            className="text-sky-900 font-bold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
