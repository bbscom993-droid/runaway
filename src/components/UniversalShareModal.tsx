import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  Download,
  Image as ImageIcon,
  X,
  ExternalLink,
  MessageCircle,
  Quote,
  ArrowRight,
  Sparkles,
  Smartphone,
  Send,
  FileText,
  AlertCircle
} from 'lucide-react';
import { NewsArticle } from '../types';

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
  const [targetWaNumber, setTargetWaNumber] = useState('');
  const [waSendError, setWaSendError] = useState<string | null>(null);
  const [isSharingNative, setIsSharingNative] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShareFeedback(null);
      setWaSendError(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#/article/${article.slug || article.id}`
    : `https://arunnews.id/#/article/${article.slug || article.id}`;

  const cleanExcerpt = article.excerpt || (article.paragraphs && article.paragraphs[0]) || article.content.substring(0, 160) + '...';
  const shareFullText = `📰 *${article.title}*\n\n${cleanExcerpt}\n\n👉 Baca warta selengkapnya di Arun News:\n${shareUrl}`;

  const triggerFeedback = (msg: string) => {
    setShareFeedback(msg);
    setTimeout(() => {
      setShareFeedback(null);
    }, 3500);
  };

  // 1. Native Web Share with Image File, Text, & Link
  const handleNativeShareFull = async () => {
    setIsSharingNative(true);
    try {
      let file: File | null = null;
      if (article.imageUrl) {
        try {
          const resp = await fetch(article.imageUrl, { mode: 'cors' });
          if (resp.ok) {
            const blob = await resp.blob();
            file = new File([blob], `${article.slug || 'arun-news'}.jpg`, { type: blob.type || 'image/jpeg' });
          }
        } catch {
          // CORS fallback
        }
      }

      const nav = typeof navigator !== 'undefined' ? navigator : null;
      if (nav && nav.canShare && file && nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          title: article.title,
          text: shareFullText,
          url: shareUrl,
        });
        if (onTrackShare) onTrackShare('native_files');
        triggerFeedback('✓ Berita, gambar & tautan berhasil dibagikan!');
        return;
      }

      if (nav && nav.share) {
        await nav.share({
          title: article.title,
          text: shareFullText,
          url: shareUrl,
        });
        if (onTrackShare) onTrackShare('native_text');
        triggerFeedback('✓ Tautan & teks warta berhasil dibagikan!');
        return;
      }

      // If neither is supported, copy text and notify
      await navigator.clipboard.writeText(shareFullText);
      setCopiedText(true);
      triggerFeedback('✓ Browser tidak mendukung menu share sistem. Teks & link telah disalin!');
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // User cancelled or dismissed share sheet
    } finally {
      setIsSharingNative(false);
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

  // 3. Salin Teks Lengkap + Tautan
  const handleCopyFullText = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareFullText);
      setCopiedText(true);
      if (onTrackShare) onTrackShare('copy_full_text');
      triggerFeedback('✓ Judul, ringkasan & tautan berhasil disalin!');
      setTimeout(() => setCopiedText(false), 2500);
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
        triggerFeedback('✓ Foto berita tersalin ke clipboard! Siap di-paste di WhatsApp Web, Telegram, dsb.');
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
      triggerFeedback('✓ Foto warta berhasil diunduh ke galeri / folder download!');
    } catch {
      window.open(article.imageUrl, '_blank');
    }
  };

  // 6. Kirim ke WhatsApp Nomor Tertentu
  const handleSendToSpecificWa = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = targetWaNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber.length < 8) {
      setWaSendError('Masukkan nomor WhatsApp yang valid (contoh: 08123456789 atau 628123456789)');
      return;
    }
    const finalWaNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.slice(1) : cleanNumber;
    const waUrl = `https://wa.me/${finalWaNumber}?text=${encodeURIComponent(shareFullText)}`;
    if (onTrackShare) onTrackShare('whatsapp_direct');
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // 7. Sitasi Format APA
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
              Bagikan Warta Berita
            </h3>
            <p className="text-[11px] text-sky-700 font-bold">
              Kirim gambar, teks ringkasan, dan tautan resmi ke aplikasi apa pun
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
        <div className="p-3 bg-gradient-to-br from-sky-950 via-sky-900 to-slate-900 rounded-xl border border-sky-800 text-white mb-4 shadow-inner">
          <div className="flex flex-col sm:flex-row gap-3">
            {article.imageUrl && (
              <div className="relative w-full sm:w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 border border-sky-700 shadow-xs">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-yellow-400 text-sky-950 text-[8px] font-black font-mono px-1 rounded">
                  FOTO WARTA
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
              <div className="text-[10px] text-yellow-300 font-mono pt-1">
                🌐 arunnews.id
              </div>
            </div>
          </div>
        </div>

        {/* 1. Tombol Utama: Bagikan Lengkap ke Sistem (Gambar, Teks & Link) */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleNativeShareFull}
            disabled={isSharingNative}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-sky-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-500 active:scale-98"
            title="Bagikan gambar warta, teks, dan tautan langsung ke menu share perangkat Anda"
          >
            <Smartphone className="w-4 h-4 text-sky-950" />
            <span>Bagikan ke Semua Aplikasi (Gambar, Teks &amp; Link)</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-950" />
          </button>
          <p className="text-[10px] text-slate-500 font-mono mt-1 text-center">
            Membuka jendela berbagi perangkat (WhatsApp, IG Stories, Telegram, Bluetooth, dsb.)
          </p>
        </div>

        {/* 2. Tindakan Cepat (Salin Teks, Gambar, Unduh Foto, Salin Link) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {/* Salin Teks Lengkap + Link */}
          <button
            type="button"
            onClick={handleCopyFullText}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
              copiedText 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-sky-50 hover:bg-yellow-100 text-sky-950 border-sky-200'
            }`}
            title="Salin judul berita, ringkasan, dan tautan lengkap"
          >
            {copiedText ? <Check className="w-4 h-4 text-white" /> : <FileText className="w-4 h-4 text-sky-700" />}
            <span className="text-[10px] font-black uppercase">Teks + Link</span>
            <span className="text-[9px] font-mono opacity-80">{copiedText ? 'Tersalin!' : 'Salin Semua'}</span>
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
            title="Salin gambar berita ke clipboard untuk dipaste di chat / aplikasi"
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
        </div>

        {/* 3. Form Kirim Langsung ke Nomor WhatsApp Tujuan */}
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold font-mono text-emerald-950 uppercase flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              Kirim ke WhatsApp Tujuan:
            </span>
            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-200/60 px-1.5 py-0.5 rounded">
              Langsung Chat
            </span>
          </div>
          <form onSubmit={handleSendToSpecificWa} className="flex gap-1.5">
            <input
              type="tel"
              value={targetWaNumber}
              onChange={(e) => {
                setTargetWaNumber(e.target.value);
                if (waSendError) setWaSendError(null);
              }}
              placeholder="08123456789 atau 62812..."
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-emerald-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>Kirim</span>
            </button>
          </form>
          {waSendError && (
            <p className="text-[10px] text-rose-600 font-bold mt-1">⚠️ {waSendError}</p>
          )}
        </div>

        {/* 4. Grid Media Sosial Populer */}
        <div className="space-y-1.5 mb-4">
          <label className="block text-[11px] font-bold text-sky-950 font-mono uppercase">
            Pilihan Aplikasi Sosial Media Populer:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareFullText)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrackShare && onTrackShare('whatsapp')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-2xs"
              title="Bagikan ke WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>

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

            {/* Threads */}
            <a
              href={`https://www.threads.net/intent/post?text=${encodeURIComponent(shareFullText)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrackShare && onTrackShare('threads')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-colors shadow-2xs"
              title="Bagikan ke Threads"
            >
              <span className="font-mono font-black text-xs">@</span>
              <span>Threads</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(shareFullText)}`}
              onClick={() => onTrackShare && onTrackShare('email')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors shadow-2xs"
              title="Kirim via Email"
            >
              <span>✉️</span>
              <span>Email</span>
            </a>

            {/* Sitasi APA */}
            <button
              type="button"
              onClick={handleCopyCitation}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-colors shadow-2xs border cursor-pointer ${
                copiedCitation
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
              }`}
              title="Salin Sitasi Ilmiah format APA"
            >
              <Quote className="w-3.5 h-3.5 text-amber-800" />
              <span>{copiedCitation ? 'Tersalin!' : 'Sitasi APA'}</span>
            </button>
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
