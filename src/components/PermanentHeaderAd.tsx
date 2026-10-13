import React, { useState } from 'react';
import { 
  Megaphone, 
  ExternalLink, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  X,
  BadgeCheck,
  MessageCircle
} from 'lucide-react';
import { AdSlot, SiteSettings } from '../types';

interface PermanentHeaderAdProps {
  slot?: AdSlot;
  siteSettings?: SiteSettings;
  onOpenAdvertisingModal?: () => void;
  onTrackClick?: (slotId: string) => void;
}

export const PermanentHeaderAd: React.FC<PermanentHeaderAdProps> = ({
  slot,
  siteSettings,
  onOpenAdvertisingModal,
  onTrackClick,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showTransparencyNotice, setShowTransparencyNotice] = useState<boolean>(false);

  // Fallback defaults for permanent top billboard sponsor
  const effectiveAdvertiser = slot?.advertiserName || 'Bank Digital Arun Prima & Ekosistem UMKM';
  const effectiveTitle = slot?.title || 'Buka Tabungan Bisnis Digital & Akses Modal Usaha Tanpa Antre';
  const effectiveSubtitle = slot?.subtitle || 'Layanan perbankan digital resmi terdaftar OJK. Nikmati bebas biaya transfer, QRIS instan UMKM, dan cashback transaksi harian.';
  const effectiveBannerImage = slot?.bannerImage || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80';
  const effectiveDimensions = slot?.dimensions || '1200 x 120 px (Leaderboard Permanen)';
  const effectivePrice = slot?.priceRate || 'Rp 2.500.000 / bln';

  // Link langsung ke WhatsApp Pemimpin Redaksi
  const rawPemredWa = siteSettings?.officialContacts?.hotlineWhatsapp || siteSettings?.hotlinePhone || '0895-6269-41900';
  const cleanPemredWa = rawPemredWa.replace(/[^0-9]/g, '');
  const pemredWaNumber = cleanPemredWa.startsWith('0') ? '62' + cleanPemredWa.slice(1) : cleanPemredWa || '62895626941900';
  const promoWaText = encodeURIComponent(
    `Halo Pemimpin Redaksi Arun News, saya ingin klaim promo digital / pasang iklan di header portal untuk: "${effectiveTitle}". Mohon informasi tarif dan persyaratannya.`
  );
  const pemredWhatsAppUrl = `https://wa.me/${pemredWaNumber}?text=${promoWaText}`;

  const handleClickAd = () => {
    if (slot?.id && onTrackClick) {
      onTrackClick(slot.id);
    }
  };

  return (
    <div 
      id="permanent-header-ad-container" 
      className="w-full bg-slate-950/95 border-b-2 border-yellow-400 shadow-md relative z-30 transition-all"
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2">
        {/* Top Mini Header Strip: Official Permanent Ad Badge & Quick Controls */}
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-sky-200 pb-1.5 border-b border-sky-800/60 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-yellow-400 text-sky-950 font-black uppercase tracking-wider shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-950 animate-ping"></span>
              IKLAN PERMANEN HEADER
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-sky-300 font-bold">
              <BadgeCheck className="w-3 h-3 text-yellow-400" />
              Sponsor Utama Resmi Portal
            </span>
            <span className="text-yellow-400/80 hidden md:inline font-mono">
              [{effectiveDimensions}]
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Transparency toggle */}
            <button
              type="button"
              onClick={() => setShowTransparencyNotice(!showTransparencyNotice)}
              className="text-sky-300 hover:text-yellow-300 text-[10px] flex items-center gap-1 transition-colors"
              title="Transparansi Iklan & Regulasi Pers"
            >
              <Info className="w-3 h-3" />
              <span className="hidden sm:inline">Transparansi</span>
            </button>

            {onOpenAdvertisingModal && (
              <button
                type="button"
                onClick={onOpenAdvertisingModal}
                className="bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title="Pesan atau sewa posisi slot iklan permanen ini"
              >
                <Megaphone className="w-2.5 h-2.5 text-sky-950" />
                <span className="hidden sm:inline">Sewa Slot Permanen</span>
                <span className="sm:hidden">Sewa</span>
              </button>
            )}

            {/* Expand / Minimize Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-sky-300 hover:text-white rounded hover:bg-sky-900 transition-colors"
              title={isExpanded ? 'Perkecil Banner Iklan' : 'Buka Banner Penuh'}
              aria-label="Toggle banner size"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Transparency Explanation (Dewan Pers guideline) */}
        {showTransparencyNotice && (
          <div className="mb-2 p-2.5 rounded-xl bg-sky-900/90 text-sky-100 text-[11px] border border-sky-700 flex items-start justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Ketentuan Ruang Iklan Permanen:</strong> Banner ini merupakan slot komersial tetap di kepala portal <em>Arun News</em>. Materi iklan diverifikasi untuk kenyamanan pembaca dan bebas dari konten terlarang, dipisahkan dari independensi editorial ruang berita.
              </p>
            </div>
            <button
              onClick={() => setShowTransparencyNotice(false)}
              className="text-sky-300 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Banner Body */}
        {isExpanded ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 py-1.5 transition-all">
            {/* Banner Left: Image & Copy */}
            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
              <div className="relative flex-shrink-0">
                <img
                  src={effectiveBannerImage}
                  alt={effectiveTitle}
                  referrerPolicy="no-referrer"
                  className="w-24 h-16 sm:w-32 sm:h-20 rounded-xl object-cover border-2 border-yellow-400/80 shadow-md group-hover/card:scale-105 transition-transform"
                />
                <span className="absolute bottom-1 right-1 bg-sky-950/90 text-yellow-400 text-[8px] font-mono px-1 rounded font-bold">
                  SPONSOR
                </span>
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black text-yellow-400 uppercase tracking-wide font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    {effectiveAdvertiser}
                  </span>
                  <span className="text-[10px] text-sky-300 bg-sky-900/80 px-2 py-0.2 rounded-full border border-sky-700">
                    Tarif: {effectivePrice}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm md:text-base font-black text-white leading-snug line-clamp-1 group-hover/card:text-yellow-300 transition-colors">
                  {effectiveTitle}
                </h3>

                <p className="text-[11px] sm:text-xs text-sky-200/90 line-clamp-1 sm:line-clamp-2 max-w-3xl">
                  {effectiveSubtitle}
                </p>
              </div>
            </div>

            {/* Banner Right: Klaim Promo Digital langsung ke WhatsApp Pemimpin Redaksi */}
            <div className="flex items-center gap-2 self-stretch md:self-center flex-shrink-0 w-full md:w-auto justify-end">
              <a
                href={pemredWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClickAd}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs font-mono tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-95 cursor-pointer border border-emerald-400"
                title="Klaim Promo Digital Langsung ke WhatsApp Pemimpin Redaksi"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Klaim Promo Digital</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-100 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        ) : (
          /* Minimized Compact Strip */
          <div className="flex items-center justify-between gap-3 py-1 text-xs">
            <div className="flex items-center gap-2.5 truncate">
              <span className="font-bold text-yellow-400 truncate">{effectiveAdvertiser}:</span>
              <span className="text-white truncate">{effectiveTitle}</span>
            </div>
            <a
              href={pemredWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClickAd}
              className="text-[11px] font-black text-emerald-400 hover:text-emerald-300 whitespace-nowrap flex items-center gap-1 cursor-pointer"
              title="Klaim Promo Digital Langsung ke WhatsApp Pemimpin Redaksi"
            >
              <MessageCircle className="w-3 h-3 fill-emerald-400 text-sky-950" />
              <span>Klaim Promo Digital (WhatsApp Pemred) &rarr;</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
