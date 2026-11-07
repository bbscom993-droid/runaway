import React, { useState } from 'react';
import { 
  Megaphone, 
  ExternalLink, 
  Info, 
  Sparkles, 
  X, 
  MessageCircle, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Layers,
  PhoneCall
} from 'lucide-react';
import { AdSlot, SiteSettings } from '../types';

interface SidebarAdColumnProps {
  slot?: AdSlot;
  siteSettings?: SiteSettings;
  enablePlacements?: boolean;
  showTransparencyNotice?: boolean;
  allowPublicRentButton?: boolean;
  onTrackClick?: (slotId: string) => void;
  onOpenAdvertisingModal?: () => void;
}

export const SidebarAdColumn: React.FC<SidebarAdColumnProps> = ({
  slot,
  siteSettings,
  enablePlacements = true,
  showTransparencyNotice = true,
  allowPublicRentButton = true,
  onTrackClick,
  onOpenAdvertisingModal,
}) => {
  const [showDisclosureInfo, setShowDisclosureInfo] = useState<boolean>(false);

  // If master toggle for ad placements is turned off, hide it
  if (!enablePlacements || (slot && !slot.isEnabled)) {
    return null;
  }

  // Fallback defaults for prime sidebar commercial sponsor
  const effectiveAdvertiser = slot?.advertiserName || 'Festival Wisata Bahari & UMKM Pesisir Nusantara';
  const effectiveTitle = slot?.title || 'Eksplorasi Keindahan Bahari & Destinasi Wisata Pesisir';
  const effectiveSubtitle = slot?.subtitle || 'Dapatkan paket liburan bahari eksklusif, tiket penyeberangan terpadu, dan ragam kuliner khas nusantara dengan diskon hingga 40%.';
  const effectiveImage = slot?.bannerImage || 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=600&q=80';
  const effectiveDimensions = slot?.dimensions || '300 x 250 px (MPU Sidebar)';
  const effectivePrice = slot?.priceRate || 'Rp 1.500.000 / bln';

  // Hotline & WhatsApp Redaksi Iklan
  const rawWa = siteSettings?.officialContacts?.hotlineWhatsapp || siteSettings?.hotlinePhone || '0895-6269-41900';
  const cleanWa = rawWa.replace(/[^0-9]/g, '');
  const waNumber = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa || '62895626941900';
  
  const sponsorWaUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo Redaksi Iklan Arun News, saya tertarik dengan informasi sponsor "${effectiveTitle}" dan ingin berkonsultasi pemasangan iklan di Kolom Sidebar Portal.`
  )}`;

  const directTargetUrl = slot?.targetUrl && !slot.targetUrl.includes('example.com')
    ? slot.targetUrl
    : sponsorWaUrl;

  const handleClickAd = () => {
    if (slot?.id && onTrackClick) {
      onTrackClick(slot.id);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-sky-100 dark:border-slate-800 shadow-md overflow-hidden transition-all">
      {/* Brand Accent Top Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500" />

      {/* Header Bar */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-br from-sky-50/90 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-sky-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center shadow-xs shrink-0 font-black">
              <Megaphone className="w-4 h-4 text-sky-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-black text-sky-950 dark:text-white uppercase tracking-tight font-mono">
                  Kolom Iklan & Mitra
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 font-mono text-[9px] font-black uppercase tracking-wider border border-yellow-400/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Slot Aktif
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Ruang Promosi Strategis Arun News
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            {showTransparencyNotice && (
              <button
                type="button"
                onClick={() => setShowDisclosureInfo(!showDisclosureInfo)}
                className="p-1.5 text-slate-400 hover:text-sky-900 dark:hover:text-yellow-300 rounded-lg hover:bg-sky-100/60 dark:hover:bg-slate-800 transition-colors"
                title="Transparansi Pedoman Dewan Pers RI"
                aria-label="Pedoman Transparansi Iklan"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
            {allowPublicRentButton && onOpenAdvertisingModal && (
              <button
                type="button"
                onClick={onOpenAdvertisingModal}
                className="px-2.5 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-[10px] uppercase font-mono tracking-wider transition-all shadow-2xs cursor-pointer border border-yellow-500 active:scale-95"
                title="Pasang Iklan Brand Anda di Sini"
              >
                Pasang Iklan
              </button>
            )}
          </div>
        </div>

        {/* Transparency Disclosure Notice */}
        {showDisclosureInfo && (
          <div className="mt-3 p-2.5 rounded-xl bg-sky-950 text-white text-[11px] leading-relaxed border border-sky-800 flex items-start justify-between gap-2 animate-in fade-in duration-150">
            <div className="flex items-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p>
                <strong>Pedoman Media Siber Dewan Pers RI:</strong> Kolom ini dialokasikan untuk materi promosi berbayar (commercial placement) dan dikelola terpisah dari independensi ruang redaksi warta Arun News.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDisclosureInfo(false)}
              className="text-sky-300 hover:text-white p-0.5 shrink-0"
              aria-label="Tutup Informasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Advertisement Content */}
      <div className="p-3.5 sm:p-4 space-y-3.5">
        {/* Banner Media Card */}
        <div className="group relative rounded-xl overflow-hidden border border-sky-200 dark:border-slate-700 bg-slate-950 shadow-xs">
          {slot?.videoUrl ? (
            <div className="relative w-full h-44 bg-black">
              <video
                src={slot.videoUrl}
                poster={effectiveImage}
                controls
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-amber-500 text-sky-950 font-black text-[9px] font-mono px-1.5 py-0.5 rounded shadow">
                VIDEO ADS
              </span>
            </div>
          ) : (
            <div className="relative w-full h-44 overflow-hidden">
              <img
                src={effectiveImage}
                alt={effectiveTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              
              {/* Badge Overlay */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="bg-sky-950/90 text-yellow-300 border border-yellow-400/40 text-[9px] font-mono font-black px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-xs">
                  {slot?.badgeText || 'Sponsor Pilihan'}
                </span>
                <span className="bg-slate-900/80 text-slate-300 text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                  {effectiveDimensions}
                </span>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <p className="text-[10px] text-yellow-300 font-mono font-bold uppercase tracking-wider truncate">
                  {effectiveAdvertiser}
                </p>
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight line-clamp-2">
                  {effectiveTitle}
                </h4>
              </div>
            </div>
          )}
        </div>

        {/* Description & Rate */}
        <div className="space-y-1 text-left">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {effectiveSubtitle}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono">
            <span className="text-slate-500 dark:text-slate-400">Tarif Resmi Slot:</span>
            <span className="font-black text-sky-950 dark:text-yellow-400">{effectivePrice}</span>
          </div>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* WhatsApp Direct Action */}
          <a
            href={sponsorWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClickAd}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs font-mono uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-emerald-500 active:scale-98"
            title="Hubungi Redaksi via WhatsApp untuk info iklan ini"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-700 shrink-0" />
            <span>Hubungi Redaksi via WhatsApp</span>
            <ExternalLink className="w-3 h-3 text-emerald-200" />
          </a>

          {/* Visit Target or Rent Slot Action */}
          {slot?.targetUrl && !slot.targetUrl.includes('example.com') ? (
            <a
              href={directTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClickAd}
              className="w-full py-2 px-3 rounded-xl bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-950 dark:text-sky-200 font-bold text-[11px] font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-sky-200 dark:border-slate-700"
            >
              <span>Kunjungi Laman Resmi Sponsor</span>
              <ExternalLink className="w-3 h-3 text-sky-600" />
            </a>
          ) : (
            allowPublicRentButton && onOpenAdvertisingModal && (
              <button
                type="button"
                onClick={onOpenAdvertisingModal}
                className="w-full py-2 px-3 rounded-xl bg-sky-50 dark:bg-slate-800 hover:bg-yellow-100 dark:hover:bg-slate-700 text-sky-950 dark:text-yellow-300 font-bold text-[11px] font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-sky-200 dark:border-slate-700 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                <span>Lihat Rate Card & Pasang Iklan</span>
              </button>
            )
          )}
        </div>

        {/* Value Proposition Box: Why Advertise on Arun News */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-sky-900 to-sky-950 text-white text-left space-y-2 border border-sky-800 shadow-2xs">
          <div className="flex items-center justify-between border-b border-sky-800/80 pb-1.5">
            <span className="text-[10px] font-mono font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-yellow-400" />
              Keunggulan Iklan Portal
            </span>
            <span className="text-[9px] font-mono text-sky-300">
              Dewan Pers No. 892
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-1.5 rounded-lg bg-sky-950/60 border border-sky-800/60">
              <span className="block text-slate-400 text-[9px]">Jangkauan Pembaca:</span>
              <span className="font-mono font-black text-white text-xs">85.000+ /bln</span>
            </div>
            <div className="p-1.5 rounded-lg bg-sky-950/60 border border-sky-800/60">
              <span className="block text-slate-400 text-[9px]">Posisi Penempatan:</span>
              <span className="font-mono font-black text-yellow-300 text-xs">Above the Fold</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 text-[10px] text-sky-200">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              Konsultasi desain iklan gratis
            </span>
            <span className="font-mono font-bold text-yellow-300">{cleanWa ? `0895-6269-41900` : 'Hotline Redaksi'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarAdColumn;
