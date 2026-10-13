import React, { useState } from 'react';
import { ExternalLink, Info, Megaphone, Sparkles, X } from 'lucide-react';
import { AdSlot } from '../../types';

interface AdBannerSlotProps {
  slot?: AdSlot;
  position: 'top_billboard' | 'in_article' | 'sidebar_sticky' | 'bottom_sticky';
  onDismiss?: () => void;
  className?: string;
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({
  slot,
  position,
  onDismiss,
  className = ''
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (isDismissed || (slot && !slot.isEnabled)) {
    return null;
  }

  // Fallback defaults if slot not explicitly passed
  const adTitle = slot?.advertiserName || 'Sponsor Terverifikasi Arun News';
  const adImage = slot?.bannerImage || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80';
  const targetUrl = slot?.targetUrl && !slot.targetUrl.includes('example.com')
    ? slot.targetUrl
    : 'https://wa.me/62895626941900?text=' + encodeURIComponent('Halo Redaksi Arun News, saya ingin menghubungi redaksi terkait informasi mitra dan iklan portal.');

  if (position === 'top_billboard') {
    return (
      <div className={`w-full max-w-7xl mx-auto px-4 py-2 ${className}`}>
        <div className="relative bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-md group">
          
          {/* Disclosure Bar */}
          <div className="bg-slate-950/90 backdrop-blur-xs px-3 py-1 text-[10px] flex items-center justify-between text-slate-400 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold">
              <Megaphone className="w-3 h-3 text-amber-400" />
              <span>Iklan Mitra Redaksi • SEM Placement (970x90)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                className="hover:text-amber-400 transition-colors flex items-center gap-0.5 text-[10px]"
                title="Informasi Transparansi Iklan & Kemitraan Digital"
              >
                <Info className="w-3 h-3" />
                <span className="hidden sm:inline">Transparansi</span>
              </button>
            </div>
          </div>

          {/* Ad Content */}
          <a
            href={targetUrl}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 hover:bg-slate-800/80 transition-colors"
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <img
                src={adImage}
                alt={adTitle}
                referrerPolicy="no-referrer"
                className="w-16 h-12 sm:w-24 sm:h-14 rounded-xl object-cover border border-slate-700 flex-shrink-0"
              />
              <div>
                <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {adTitle}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Jelajahi penawaran eksklusif mitra resmi</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs transition-all shadow-xs flex-shrink-0">
                <span>Hubungi Redaksi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          </a>

          {/* Info Modal/Tooltip */}
          {showInfo && (
            <div className="p-3 bg-slate-950 text-slate-300 text-[11px] border-t border-slate-800 flex items-start justify-between gap-2">
              <p>
                Sesuai Pedoman Pemberitaan Media Siber & Dewan Pers, konten promosi ini berlabel resmi <strong>Iklan Berbayar / SEM</strong> dan dikelola secara terpisah dari independensi ruang redaksi.
              </p>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (position === 'in_article') {
    return (
      <div className={`my-6 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-xs not-prose ${className}`}>
        <div className="flex items-center justify-between text-[10px] uppercase font-mono text-amber-900 font-bold mb-2 pb-1.5 border-b border-amber-200">
          <span className="flex items-center gap-1">
            <Megaphone className="w-3 h-3 text-amber-600" />
            Warta Bersponsor / Advertorial Mitra
          </span>
          <span className="text-amber-700">SEM Placement (MPU 300x250)</span>
        </div>

        <a
          href={targetUrl}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="flex flex-col sm:flex-row items-center gap-3.5 group"
        >
          <img
            src={adImage}
            alt={adTitle}
            referrerPolicy="no-referrer"
            className="w-full sm:w-36 h-28 rounded-xl object-cover border border-amber-300 shadow-2xs group-hover:scale-[1.02] transition-transform"
          />
          <div className="flex-1">
            <h4 className="font-extrabold text-sky-950 text-sm sm:text-base group-hover:text-amber-700 transition-colors leading-snug">
              {adTitle}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
              Dapatkan wawasan solusi terkini serta penawaran kolaborasi program khusus mitra terverifikasi.
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:text-amber-800">
              <span>Pelajari Selengkapnya</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </a>
      </div>
    );
  }

  if (position === 'sidebar_sticky') {
    return (
      <div className={`bg-white rounded-2xl border-2 border-sky-100 p-3.5 shadow-xs ${className}`}>
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center justify-between mb-2">
          <span>Iklan Mitra (300x600)</span>
          <span className="text-amber-600 font-bold">SPONSORED</span>
        </div>
        <a
          href={targetUrl}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="block group"
        >
          <div className="overflow-hidden rounded-xl mb-2.5 bg-slate-100">
            <img
              src={adImage}
              alt={adTitle}
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h5 className="text-xs font-bold text-sky-950 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
            {adTitle}
          </h5>
          <div className="mt-2 text-[11px] font-bold text-sky-700 flex items-center gap-1">
            <span>Buka Tautan Resmi</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </a>
      </div>
    );
  }

  // Bottom Sticky Anchor
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 bg-sky-950 text-white border-t-2 border-amber-400 shadow-2xl p-2.5 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="px-2 py-0.5 rounded bg-amber-400 text-sky-950 font-mono font-black text-[9px] uppercase flex-shrink-0">
            Iklan
          </span>
          <div className="truncate text-xs font-bold text-white">
            {adTitle}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={targetUrl}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-sky-950 font-bold text-xs flex items-center gap-1 shadow-xs"
          >
            <span>Buka</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => {
              setIsDismissed(true);
              if (onDismiss) onDismiss();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            title="Tutup Iklan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
