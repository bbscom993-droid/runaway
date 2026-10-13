import React, { useState } from 'react';
import { Megaphone, ExternalLink, Info, Sparkles, Sliders, X, MessageCircle } from 'lucide-react';
import { AdSlot, SiteSettings } from '../types';

interface AdBannerProps {
  type: 'header' | 'sidebar' | 'inline';
  onOpenAdvertisingModal?: () => void;
  siteSettings?: SiteSettings;
  title?: string;
  subtitle?: string;
  dimensions?: string;
  price?: string;
  sampleBrand?: {
    name: string;
    description: string;
    ctaText: string;
    bgGradient: string;
    badgeText?: string;
  };
  slot?: AdSlot;
  enablePlacements?: boolean;
  showTransparencyNotice?: boolean;
  allowPublicRentButton?: boolean;
  onTrackClick?: (slotId: string) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  type,
  onOpenAdvertisingModal,
  siteSettings,
  title,
  subtitle,
  dimensions,
  price,
  sampleBrand,
  slot,
  enablePlacements = true,
  showTransparencyNotice = true,
  allowPublicRentButton = true,
  onTrackClick,
}) => {
  const [headerAdSize, setHeaderAdSize] = useState<'compact' | 'standard' | 'large'>('standard');
  const [showDisclosureInfo, setShowDisclosureInfo] = useState(false);

  // If master toggle for ad placements is turned off, or this specific slot is disabled, hide it
  if (!enablePlacements || (slot && !slot.isEnabled)) {
    return null;
  }

  const effectiveTitle = slot?.title || slot?.advertiserName || title;
  const effectiveSubtitle = slot?.subtitle || subtitle;
  const effectivePrice = slot?.priceRate || price;
  const effectiveDim = slot?.dimensions || dimensions;
  const effectiveImage = slot?.bannerImage;
  const effectiveUrl = slot?.targetUrl;

  // Nomor WhatsApp Redaksi & Link Langsung WhatsApp
  const rawWa = siteSettings?.officialContacts?.hotlineWhatsapp || siteSettings?.hotlinePhone || '0895-6269-41900';
  const cleanWa = rawWa.replace(/[^0-9]/g, '');
  const waNumber = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa || '62895626941900';
  const redaksiWaUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo Redaksi Arun News, saya ingin menghubungi redaksi terkait informasi mitra dan pemasangan iklan portal untuk: "${effectiveTitle || 'Iklan Portal'}".`
  )}`;

  // Ganti 'Kunjungi Mitra' menjadi 'Hubungi Redaksi' langsung link ke WhatsApp
  const isKunjungiMitra = !slot?.ctaText || slot.ctaText === 'Kunjungi Mitra' || slot.ctaText.toLowerCase().includes('mitra');
  const effectiveCta = isKunjungiMitra ? 'Hubungi Redaksi' : slot.ctaText;
  const effectiveTargetUrl = (!effectiveUrl || effectiveUrl.includes('example.com') || isKunjungiMitra) ? redaksiWaUrl : effectiveUrl;

  const handleClickBanner = () => {
    if (slot && onTrackClick) {
      onTrackClick(slot.id);
    }
  };

  // ==========================================
  // HEADER BANNER (Top Billboard)
  // ==========================================
  if (type === 'header') {
    const sizeClasses = {
      compact: 'py-2.5 px-3 sm:px-4',
      standard: 'p-4 sm:p-6',
      large: 'p-6 sm:p-8'
    };

    const currentDim = headerAdSize === 'compact' ? '1200 x 90 px (Leaderboard)' : headerAdSize === 'standard' ? '1200 x 180 px (Standard Banner)' : '1200 x 280 px (Billboard Header)';
    const currentPrice = headerAdSize === 'compact' ? 'Rp 1.500.000 / bln' : headerAdSize === 'standard' ? 'Rp 2.500.000 / bln' : 'Rp 4.000.000 / bln';

    return (
      <div className="w-full mb-6">
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 border border-sky-800 shadow-md transition-all hover:shadow-lg">
          {/* Top Label with Size Selector & Rent Button */}
          <div className="bg-sky-900/90 text-sky-200 text-[10px] font-mono px-3 py-1.5 border-b border-sky-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span>{slot?.badgeText || 'Ruang Iklan Header'}</span>
              <span className="bg-yellow-400/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-400/30 text-[9px]">
                {effectiveDim || currentDim}
              </span>
            </div>

            {/* Ad Size Adjuster Controls */}
            <div className="flex items-center gap-1.5 bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-800">
              <Sliders className="w-3 h-3 text-yellow-400" />
              <span className="text-[9px] text-sky-300 font-bold hidden sm:inline">Ukuran:</span>
              <button
                onClick={() => setHeaderAdSize('compact')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-colors ${headerAdSize === 'compact' ? 'bg-yellow-400 text-sky-950' : 'text-sky-300 hover:text-white'}`}
                title="Ukuran Compact (1200x90)"
              >
                S
              </button>
              <button
                onClick={() => setHeaderAdSize('standard')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-colors ${headerAdSize === 'standard' ? 'bg-yellow-400 text-sky-950' : 'text-sky-300 hover:text-white'}`}
                title="Ukuran Standard (1200x180)"
              >
                M
              </button>
              <button
                onClick={() => setHeaderAdSize('large')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-colors ${headerAdSize === 'large' ? 'bg-yellow-400 text-sky-950' : 'text-sky-300 hover:text-white'}`}
                title="Ukuran Large Billboard (1200x280)"
              >
                L
              </button>
            </div>

            <div className="flex items-center gap-2">
              {showTransparencyNotice && (
                <button
                  type="button"
                  onClick={() => setShowDisclosureInfo(!showDisclosureInfo)}
                  className="text-sky-300 hover:text-yellow-300 text-[10px] flex items-center gap-1 transition-colors"
                  title="Informasi Transparansi Pedoman Dewan Pers"
                >
                  <Info className="w-3 h-3" />
                  <span className="hidden sm:inline">Transparansi</span>
                </button>
              )}

              <span className="text-yellow-400 font-bold">{effectivePrice || currentPrice}</span>

              {allowPublicRentButton && (
                <button
                  type="button"
                  onClick={onOpenAdvertisingModal}
                  className="bg-yellow-400 hover:bg-yellow-300 text-sky-950 text-[10px] font-black px-2.5 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Megaphone className="w-3 h-3" />
                  <span>Sewa Slot Ini</span>
                </button>
              )}
            </div>
          </div>

          {/* Transparency Info Box */}
          {showDisclosureInfo && (
            <div className="p-3 bg-sky-950 text-slate-200 text-[11px] border-b border-sky-800 flex items-start justify-between gap-3">
              <p>
                Sesuai Pedoman Pemberitaan Media Siber & Dewan Pers, konten promosi ini berlabel resmi <strong>Iklan Berbayar / SEM Placement</strong> dan dikelola secara terpisah dari independensi ruang redaksi Arun News.
              </p>
              <button
                type="button"
                onClick={() => setShowDisclosureInfo(false)}
                className="text-sky-300 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Banner Content Area */}
          <div className={`${sizeClasses[headerAdSize]} flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300`}>
            <div className="flex items-center gap-4 text-center md:text-left w-full md:w-auto">
              {effectiveImage && (
                <img
                  src={effectiveImage}
                  alt={effectiveTitle || 'Banner Sponsor'}
                  className="w-20 h-14 sm:w-28 sm:h-20 rounded-xl object-cover border border-sky-700 shadow-sm flex-shrink-0 group-hover/card:scale-105 transition-transform"
                />
              )}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 text-xs font-mono font-bold border border-yellow-400/20 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slot?.advertiserName || sampleBrand?.badgeText || 'Peluang Promosi Bisnis Anda'}</span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-white font-mono tracking-tight group-hover/card:text-yellow-300 transition-colors">
                  {effectiveTitle || sampleBrand?.name || 'Posisi Iklan Strategis Header ARUN NEWS'}
                </h3>
                <p className="text-xs sm:text-sm text-sky-200 max-w-2xl font-medium">
                  {effectiveSubtitle || sampleBrand?.description || 'Jangkau puluhan ribu pembaca aktif setiap hari. Tampil paling atas di seluruh halaman utama dan artikel berita.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-shrink-0 w-full md:w-auto">
              <a
                href={effectiveTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClickBanner}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs font-mono tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group-hover:scale-102 active:scale-95 border border-emerald-400"
                title="Hubungi Redaksi via WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                <span>{effectiveCta}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // INLINE BANNER (In-Article / Middle)
  // ==========================================
  if (type === 'inline') {
    return (
      <div className="w-full my-8">
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-400/15 to-amber-500/10 border-2 border-dashed border-yellow-400/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {effectiveImage ? (
              <img
                src={effectiveImage}
                alt={effectiveTitle || 'Iklan Mitra'}
                className="w-20 h-14 rounded-xl object-cover border border-amber-300 shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="p-3 rounded-2xl bg-yellow-400 text-sky-950 font-black shadow-xs flex-shrink-0">
                <Megaphone className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-950 text-yellow-300 text-[10px] font-mono font-bold uppercase">
                  {slot?.badgeText || 'Ruang Iklan Artikel / Sisipan'}
                </span>
                <span className="text-xs font-mono font-bold text-sky-950">
                  {effectiveDim || '728 x 90 px'}
                </span>
              </div>
              <h4 className="font-black text-sky-950 text-sm sm:text-base mt-0.5 font-mono">
                {effectiveTitle || 'Promosikan Produk / Layanan Anda Di Sini'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                {effectiveSubtitle || 'Lokasi berada di tengah halaman berita & katalog artikel untuk engagement pembaca maksimal.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
            <a
              href={effectiveTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClickBanner}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer whitespace-nowrap border border-emerald-400 active:scale-95"
              title="Hubungi Redaksi via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-700" />
              <span>{effectiveCta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SIDEBAR BANNER
  // ==========================================
  return (
    <div className="w-full my-4">
      <div className="relative group overflow-hidden rounded-2xl bg-white border border-sky-200 shadow-xs p-4 text-center space-y-3">
        <div className="flex items-center justify-between border-b border-sky-100 pb-2">
          <span className="text-[10px] font-mono font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            {slot?.badgeText || 'Ruang Iklan Sidebar'}
          </span>
          <span className="text-[10px] font-mono text-slate-500 bg-sky-50 px-1.5 py-0.5 rounded">
            {effectiveDim || '300 x 250 px'}
          </span>
        </div>

        <div className="py-4 px-2 rounded-xl bg-sky-50 border border-dashed border-sky-300 space-y-2">
          {effectiveImage ? (
            <img
              src={effectiveImage}
              alt={effectiveTitle || 'Sidebar Sponsor'}
              className="w-full h-32 rounded-xl object-cover border border-sky-200 mb-2 shadow-xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-sky-950 font-black flex items-center justify-center mx-auto shadow-2xs">
              <Megaphone className="w-5 h-5" />
            </div>
          )}
          <h4 className="font-black text-sky-950 text-xs sm:text-sm font-mono uppercase tracking-tight">
            {effectiveTitle || 'Banner Sidebar Kanan'}
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium max-w-xs mx-auto">
            {effectiveSubtitle || 'Menempel pada kolom kanan seluruh halaman utama, artikel, dan kategori berita.'}
          </p>
          <div className="text-xs font-mono font-black text-sky-950">
            {effectivePrice || 'Rp 1.500.000 / bulan'}
          </div>
        </div>

        <a
          href={effectiveTargetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClickBanner}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-mono uppercase tracking-wider transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400 active:scale-95"
          title="Hubungi Redaksi via WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-700" />
          <span>{effectiveCta}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
