import React, { useState } from 'react';
import { 
  Bookmark, 
  Clock, 
  Eye, 
  Share2, 
  Sparkles,
  Heart,
  BookmarkCheck,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  MinusCircle,
  BookOpen,
  Check,
  Copy,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { NewsArticle } from '../types';
import { analyzeArticleSentiment } from '../utils/sentimentEngine';
import { getArticleReadingTime } from '../utils/readingTime';
import { ArticleMiniPodcast } from './ArticleMiniPodcast';
import { UniversalShareModal } from './UniversalShareModal';

export interface ArticleShareButtonProps {
  article: NewsArticle;
  placement?: 'top' | 'bottom';
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'button' | 'badge';
}

export const ArticleShareButton: React.FC<ArticleShareButtonProps> = ({
  article,
  placement = 'top',
  className = '',
  size = 'md',
  variant = 'button',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#/article/${article.slug || article.id}`
    : `https://arunnews.id/#/article/${article.slug || article.id}`;
  const cleanExcerpt = article.excerpt || article.content?.substring(0, 160) || '';
  const shareText = `📰 *${article.title}*\n\n${cleanExcerpt}...\n\n👉 Baca warta di Arun News:\n${shareUrl}`;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      let file: File | null = null;
      if (article.imageUrl && typeof navigator !== 'undefined' && navigator.canShare) {
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

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: article.title,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
        return;
      }
    } catch {
      // User cancelled
    }
    // Fallback: open full modal
    setIsFullModalOpen(true);
    setIsOpen(false);
  };

  const btnClasses = size === 'sm'
    ? 'px-2 py-1 text-[11px] gap-1'
    : 'px-2.5 py-1.5 text-xs gap-1.5';

  return (
    <>
      <div 
        className={`relative inline-block ${className}`} 
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          id={`card-share-btn-${article.id}`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }}
          className={`flex items-center rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-2xs ${btnClasses} ${
            variant === 'badge'
              ? isOpen
                ? 'bg-yellow-400 text-sky-950 font-black'
                : 'text-yellow-400 hover:text-white hover:bg-sky-900/60'
              : isOpen
                ? 'bg-yellow-400 text-sky-950 border border-yellow-500 font-black ring-2 ring-yellow-400/50'
                : 'bg-sky-50 hover:bg-yellow-100 text-sky-900 hover:text-sky-950 border border-sky-200 hover:border-yellow-400'
          }`}
          title="Bagikan Berita (Gambar, Teks & Tautan)"
          aria-label="Bagikan Berita"
          aria-expanded={isOpen}
        >
          <Share2 className={`w-3.5 h-3.5 ${variant === 'badge' ? (isOpen ? 'text-sky-950' : 'text-yellow-400') : 'text-sky-700'}`} />
          <span className="font-bold">Bagikan</span>
        </button>

        {isOpen && (
          <div 
            className={`absolute ${
              placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            } right-0 w-72 bg-white rounded-2xl shadow-2xl border-2 border-yellow-400 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-left`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-100">
              <div className="flex items-center gap-1.5 text-xs font-black text-sky-950 uppercase">
                <Share2 className="w-3.5 h-3.5 text-yellow-500" />
                <span>Bagikan Berita</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup Menu Bagikan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* Primary: Bagikan Lengkap (Gambar, Teks & Link) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullModalOpen(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-sky-950 font-black transition-all shadow-xs cursor-pointer border border-yellow-500 active:scale-98"
                title="Buka menu bagikan lengkap beserta gambar dan teks"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-950" />
                  <span className="font-mono uppercase text-[11px]">Bagikan Gambar + Teks</span>
                </div>
                <span className="text-[10px] bg-sky-950 text-yellow-400 font-bold px-1.5 py-0.5 rounded">
                  Lengkap
                </span>
              </button>

              {/* 1. Salin Tautan */}
              <button
                type="button"
                onClick={handleCopy}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-bold border cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-sky-50 hover:bg-yellow-200/70 text-sky-950 border-sky-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-sky-700" />}
                  <span>{copied ? 'Tautan Tersalin! ✓' : 'Salin Tautan'}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-black ${
                  copied ? 'bg-emerald-700 text-emerald-100' : 'bg-sky-200/60 text-sky-800'
                }`}>
                  {copied ? 'OK' : 'Salin'}
                </span>
              </button>

              {/* 2. WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs cursor-pointer"
                title="Bagikan ke WhatsApp"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
                  </svg>
                  <span>Kirim ke WhatsApp</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-100 font-bold">Kirim</span>
              </a>

              {/* 3. X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`📰 ${article.title}`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs border border-slate-700 cursor-pointer"
                title="Bagikan ke X"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Bagikan ke X</span>
                </div>
                <span className="text-[10px] font-mono text-slate-300 font-bold">Post</span>
              </a>

              {/* 4. Native Web Share / Menu Lengkap */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all text-xs cursor-pointer border border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Semua Aplikasi Lainnya...</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Universal Share Modal */}
      {isFullModalOpen && (
        <UniversalShareModal
          article={article}
          isOpen={isFullModalOpen}
          onClose={() => setIsFullModalOpen(false)}
        />
      )}
    </>
  );
};

interface SocialShareProps {
  article: NewsArticle;
  variant?: 'compact' | 'bar';
}

export const SocialShareGroup: React.FC<SocialShareProps> = ({ article, variant = 'bar' }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/article/${article.slug || article.id}`
    : `https://arunnews.id/article/${article.slug || article.id}`;
  const shareText = `${article.title} - Warta Terpercaya di Arun News`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const btnBase = variant === 'compact'
    ? 'p-1 rounded-md text-xs transition-all active:scale-90 flex items-center justify-center cursor-pointer shadow-2xs'
    : 'p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-2xs';

  return (
    <div 
      className="flex items-center gap-1 sm:gap-1.5" 
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`${btnBase} bg-emerald-600 hover:bg-emerald-500 text-white`}
        title="Bagikan ke WhatsApp"
        aria-label="Bagikan ke WhatsApp"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
        </svg>
        <span className="hidden xl:inline text-[10px]">WA</span>
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`${btnBase} ${variant === 'compact' ? 'hidden sm:flex' : ''} bg-slate-900 hover:bg-slate-800 text-white border border-slate-700`}
        title="Bagikan ke X"
        aria-label="Bagikan ke X"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span className="hidden xl:inline text-[10px]">X</span>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`${btnBase} ${variant === 'compact' ? 'hidden sm:flex' : ''} bg-blue-600 hover:bg-blue-500 text-white`}
        title="Bagikan ke Facebook"
        aria-label="Bagikan ke Facebook"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span className="hidden xl:inline text-[10px]">FB</span>
      </a>

      {/* Salin Link */}
      <button
        type="button"
        onClick={handleCopy}
        className={`${btnBase} relative ${
          copied
            ? 'bg-emerald-600 text-white border border-emerald-500'
            : 'bg-sky-100 hover:bg-yellow-300 text-sky-950 border border-sky-300'
        }`}
        title={copied ? 'Tautan Tersalin ke Papan Klip!' : 'Salin Tautan Berita'}
        aria-label="Salin Tautan"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-white" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-sky-800" />
        )}
        <span className="hidden xl:inline text-[10px]">{copied ? 'Tersalin' : 'Salin'}</span>

        {/* Animated Copied Tooltip Badge */}
        {copied && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-sky-950 text-yellow-300 text-[10px] font-black whitespace-nowrap shadow-lg border border-yellow-400/40 pointer-events-none z-30 animate-in fade-in zoom-in-90 duration-150">
            Tersalin! ✓
          </span>
        )}
      </button>
    </div>
  );
};

interface ArticleCardProps {
  article: NewsArticle;
  onSelectArticle: (article: NewsArticle) => void;
  isSaved: boolean;
  onToggleSave: (article: NewsArticle, e: React.MouseEvent) => void;
  layout?: 'grid' | 'horizontal' | 'compact';
  isRead?: boolean;
  readProgress?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSelectArticle,
  isSaved,
  onToggleSave,
  layout = 'grid',
  isRead = false,
  readProgress,
}) => {
  const sentiment = analyzeArticleSentiment(article);
  const readingTimeInfo = getArticleReadingTime(article);
  const effectiveProgress = readProgress !== undefined 
    ? readProgress 
    : (isRead ? 100 : 0);

  const sentimentBadgeColors = {
    Positif: 'bg-emerald-500/15 text-emerald-800 border-emerald-300',
    Netral: 'bg-amber-500/15 text-amber-800 border-amber-300',
    Negatif: 'bg-rose-500/15 text-rose-800 border-rose-300',
  };

  const sentimentIcon = {
    Positif: <TrendingUp className="w-3 h-3 text-emerald-600" />,
    Netral: <MinusCircle className="w-3 h-3 text-amber-600" />,
    Negatif: <ShieldAlert className="w-3 h-3 text-rose-600" />,
  };

  if (layout === 'compact') {
    return (
      <motion.article
        id={`article-card-compact-${article.id}`}
        onClick={() => onSelectArticle(article)}
        className="group bg-white rounded-xl p-3 border border-sky-200 hover:border-yellow-400 hover:shadow-xl hover:shadow-sky-950/5 hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 ease-out cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10px" }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-sky-200 group-hover:border-yellow-400 transition-colors">
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-black uppercase text-sky-800 tracking-wider">
                {article.categoryLabel}
              </span>
              <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded border ${sentimentBadgeColors[sentiment.label]}`}>
                {sentimentIcon[sentiment.label]} {sentiment.label}
              </span>
              {effectiveProgress > 0 && (
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-mono font-black px-1.5 py-0.2 rounded border ${
                  effectiveProgress >= 95 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  <BookOpen className="w-2.5 h-2.5" /> {effectiveProgress}%
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-sky-950 group-hover:text-yellow-600 transition-colors line-clamp-1">
              {article.title}
            </h4>
            <div className="flex items-center gap-2 text-[11px] font-mono text-sky-700 mt-1">
              <span 
                className="flex items-center gap-1 bg-amber-100/90 text-amber-950 font-black px-2 py-0.5 rounded-md border border-amber-300 text-[10px]"
                title={`Estimasi baca berdasarkan ${readingTimeInfo.wordCount} kata`}
              >
                <Clock className="w-3 h-3 text-amber-600" />
                {readingTimeInfo.minutes} mnt ({readingTimeInfo.wordCount} kata)
              </span>
              <span className="flex items-center gap-1 text-sky-800 text-[10px]">
                <Eye className="w-3 h-3 text-sky-500" />
                {article.views.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <ArticleMiniPodcast article={article} variant="compact" />
          <ArticleShareButton article={article} size="sm" placement="bottom" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-sky-600 group-hover:text-yellow-600 flex-shrink-0" />

        {/* Bottom Line Reading Progress Bar */}
        {effectiveProgress > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-sky-100 overflow-hidden z-10">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${effectiveProgress}%` }}
            />
          </div>
        )}
      </motion.article>
    );
  }

  if (layout === 'horizontal') {
    return (
      <motion.article
        id={`article-card-horiz-${article.id}`}
        onClick={() => onSelectArticle(article)}
        className="group bg-white rounded-2xl p-4 sm:p-5 border border-sky-200 hover:border-yellow-400 hover:shadow-xl hover:shadow-sky-950/8 hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-300 ease-out cursor-pointer flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative w-full sm:w-52 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-sky-950">
          <img
            src={article.imageUrl}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <span className="bg-sky-900 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider border border-sky-700">
              {article.categoryLabel}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md border shadow-xs ${sentimentBadgeColors[sentiment.label]}`}>
              {sentimentIcon[sentiment.label]} {sentiment.label}
            </span>
          </div>

          {/* Bottom Edge Reading Progress Bar on Image */}
          {effectiveProgress > 0 && (
            <div className="absolute bottom-0 inset-x-0 h-2 bg-sky-950/80 overflow-hidden z-10">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${effectiveProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full w-full">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-sky-800 mb-1.5 font-mono flex-wrap">
              <span className="font-bold text-sky-900">{article.author.name}</span>
              <div className="flex items-center gap-2">
                {effectiveProgress > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs font-mono uppercase tracking-wider border ${
                    effectiveProgress >= 95 
                      ? 'bg-emerald-600 text-white border-emerald-500' 
                      : 'bg-amber-400 text-sky-950 border-yellow-500'
                  }`}>
                    {effectiveProgress >= 95 ? (
                      <>
                        <Check className="w-3 h-3 text-white" /> 100% Dibaca
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3 h-3 text-sky-950" /> {effectiveProgress}% Dibaca
                      </>
                    )}
                  </span>
                )}
                <span>{article.publishedAt.split('•')[0]}</span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-black text-sky-950 group-hover:text-yellow-600 transition-colors leading-snug line-clamp-2 mb-2">
              {article.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-2 font-medium">
              {article.excerpt}
            </p>

            {/* Mini Audio Player Podcast */}
            <ArticleMiniPodcast article={article} variant="card" />

            {/* Visual Progress Bar Strip in Body */}
            {effectiveProgress > 0 && (
              <div className="mb-3 p-1.5 bg-amber-50 rounded-lg border border-amber-200/80 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-amber-200/80 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 rounded-full transition-all duration-300" 
                    style={{ width: `${effectiveProgress}%` }} 
                  />
                </div>
                <span className="text-[10px] font-mono font-black text-amber-950 whitespace-nowrap flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-600" />
                  {effectiveProgress >= 95 ? '100% Selesai' : `${effectiveProgress}% Dibaca`}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-sky-100 text-xs">
            <div className="flex items-center gap-2 text-sky-700 font-mono text-[11px]">
              <span 
                className="flex items-center gap-1 bg-amber-100/90 text-amber-950 font-black px-2 py-0.5 rounded-md border border-amber-300 shadow-2xs"
                title={`Estimasi waktu baca: ${readingTimeInfo.minutes} menit (berdasarkan ${readingTimeInfo.wordCount} kata)`}
              >
                <Clock className="w-3 h-3 text-amber-600" />
                {readingTimeInfo.minutes} mnt baca ({readingTimeInfo.wordCount} kata)
              </span>
              <span className="flex items-center gap-1 text-sky-800">
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                {article.views.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ArticleShareButton article={article} placement="top" size="sm" />
              <button
                onClick={(e) => onToggleSave(article, e)}
                className={`p-2 rounded-xl transition-all active:scale-95 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
                  isSaved ? 'bg-yellow-400 text-sky-950 shadow-xs border border-yellow-500 font-bold' : 'text-sky-700 hover:text-sky-950 hover:bg-yellow-100 bg-sky-50 sm:bg-transparent'
                }`}
                title={isSaved ? 'Hapus Simpanan' : 'Simpan Berita'}
                aria-label={isSaved ? 'Hapus Simpanan' : 'Simpan Berita'}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-sky-950" /> : <Bookmark className="w-4 h-4 text-sky-700" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Line Reading Progress Bar on Card Container */}
        {effectiveProgress > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-sky-100 overflow-hidden z-20">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 transition-all duration-300 shadow-[0_0_8px_rgba(250,204,21,0.8)]"
              style={{ width: `${effectiveProgress}%` }}
            />
          </div>
        )}
      </motion.article>
    );
  }

  // Default Bento Grid Layout Card
  return (
    <motion.article
      id={`article-card-${article.id}`}
      onClick={() => onSelectArticle(article)}
      className="group bg-white rounded-2xl overflow-hidden border border-sky-200 hover:border-yellow-400 hover:shadow-2xl hover:shadow-sky-950/10 hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between relative"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Card Image */}
      <div className="relative aspect-[16/10] sm:aspect-[16/10] w-full overflow-hidden bg-sky-950">
        <img
          src={article.imageUrl}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
        />
        
        {/* Category tag & hot badge */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className="bg-sky-900/90 backdrop-blur-xs text-white font-black text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md shadow-xs uppercase tracking-wide border border-sky-700">
            {article.categoryLabel}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md border shadow-xs ${sentimentBadgeColors[sentiment.label]}`}>
            {sentimentIcon[sentiment.label]} {sentiment.label}
          </span>
          {article.isBreaking && (
            <span className="bg-yellow-400 text-sky-950 font-black text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md shadow-xs uppercase border border-yellow-500">
              HOT
            </span>
          )}
        </div>

        {/* Action Button Top Right: Bookmark Only */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center gap-1.5 z-10">
          <button
            id={`card-save-btn-${article.id}`}
            onClick={(e) => onToggleSave(article, e)}
            className={`p-2 rounded-xl backdrop-blur-md transition-all active:scale-95 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
              isSaved 
                ? 'bg-yellow-400 text-sky-950 shadow-md border border-yellow-500' 
                : 'bg-sky-950/70 text-white hover:bg-white hover:text-sky-950'
            }`}
            title={isSaved ? 'Tersimpan' : 'Simpan Berita'}
            aria-label={isSaved ? 'Tersimpan' : 'Simpan Berita'}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-sky-950" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        <div 
          className="absolute bottom-2 right-2 sm:bottom-2 sm:right-3 text-[10px] font-mono font-black text-amber-950 bg-amber-300/95 border border-amber-400 px-2 py-0.5 rounded-md z-10 flex items-center gap-1 shadow-xs"
          title={`Estimasi baca: ${readingTimeInfo.minutes} menit berdasarkan ${readingTimeInfo.wordCount} kata`}
        >
          <Clock className="w-3 h-3 text-amber-900 flex-shrink-0" />
          <span>{readingTimeInfo.minutes} mnt ({readingTimeInfo.wordCount} kata)</span>
        </div>

        {/* Saved Reading Progress Badge on Card Image */}
        {effectiveProgress > 0 && (
          <div className={`absolute bottom-2 left-2 sm:bottom-2 sm:left-3 z-10 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs uppercase tracking-wider font-mono border ${
            effectiveProgress >= 95 
              ? 'bg-emerald-600 text-white border-emerald-500' 
              : 'bg-yellow-400 text-sky-950 border-yellow-500'
          }`}>
            {effectiveProgress >= 95 ? (
              <>
                <Check className="w-3 h-3 text-white" /> 100% Dibaca
              </>
            ) : (
              <>
                <BookOpen className="w-3 h-3 text-sky-950" /> {effectiveProgress}% Dibaca
              </>
            )}
          </div>
        )}

        {/* Bottom Edge Reading Progress Bar on Card Image */}
        {effectiveProgress > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-sky-950/80 overflow-hidden z-20">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-300 shadow-[0_0_8px_rgba(250,204,21,0.8)]"
              style={{ width: `${effectiveProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-700 mb-1.5 font-mono flex-wrap">
            <span>{article.publishedAt.split('•')[0]}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-yellow-500" />
              {article.views.toLocaleString('id-ID')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-800 font-bold" title={`Berdasarkan ${readingTimeInfo.wordCount} kata`}>
              <Clock className="w-3 h-3 text-amber-600" />
              {readingTimeInfo.minutes} mnt baca
            </span>
          </div>

          <h3 className="text-base font-black text-sky-950 group-hover:text-yellow-600 transition-colors leading-snug line-clamp-2 mb-2">
            {article.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2 font-medium">
            {article.excerpt}
          </p>

          {/* Mini Audio Player Podcast */}
          <ArticleMiniPodcast article={article} variant="card" />

          {/* Visual Strip Progress Indicator in Card Body */}
          {effectiveProgress > 0 && (
            <div className="mb-2.5 p-1.5 bg-amber-50/90 rounded-lg border border-amber-200/80 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-amber-200/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 rounded-full transition-all duration-300" 
                  style={{ width: `${effectiveProgress}%` }} 
                />
              </div>
              <span className="text-[10px] font-mono font-black text-amber-950 whitespace-nowrap flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-600" />
                {effectiveProgress >= 95 ? '100% Selesai' : `${effectiveProgress}% Dibaca`}
              </span>
            </div>
          )}
        </div>

        {/* Card Author, Bagikan Button and Read Link */}
        <div className="pt-3 border-t border-sky-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover border border-sky-200 shrink-0"
            />
            <span className="text-xs font-bold text-sky-900 truncate max-w-[80px] sm:max-w-[110px]">
              {article.author.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <ArticleShareButton article={article} placement="top" size="sm" />
          </div>

          <span className="inline-flex items-center gap-0.5 text-xs font-black text-sky-900 group-hover:text-yellow-600 uppercase tracking-wider shrink-0">
            Baca <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>

      {/* Bottom Line Reading Progress Bar on Grid Card Container */}
      {effectiveProgress > 0 && (
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-sky-100 overflow-hidden z-20">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 transition-all duration-300 shadow-[0_0_8px_rgba(250,204,21,0.8)]"
            style={{ width: `${effectiveProgress}%` }}
          />
        </div>
      )}
    </motion.article>
  );
};
