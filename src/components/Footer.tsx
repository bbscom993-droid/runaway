import React from 'react';
import { 
  ArrowUp, 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Flame, 
  Globe, 
  Radio,
  FileText,
  ExternalLink,
  PenSquare,
  Megaphone,
  Sparkles,
  Scale,
  ShieldCheck,
  BookOpen,
  FileCheck,
  Train,
  AlertTriangle,
  Coffee,
  Bookmark,
  Sliders
} from 'lucide-react';
import { Category, SiteSettings } from '../types';
import { ModernGraffitiLogo } from './ModernGraffitiLogo';

interface FooterProps {
  categories: Category[];
  onSelectCategory: (catId: string) => void;
  siteSettings?: SiteSettings;
  onOpenCitizenModal?: () => void;
  onNavigateToEditorial?: () => void;
  onOpenBoxRedaksiModal?: () => void;
  onOpenCyberMediaGuidelinesModal?: (tab?: 'pedoman' | 'kode_etik' | 'privasi' | 'panduan_warga' | 'syarat_ketentuan' | 'disclaimer' | 'hak_cipta') => void;
  onOpenAdvertisingModal?: () => void;
  onOpenSawerKopi?: () => void;
  savedCount?: number;
  onOpenSavedDrawer?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  categories, 
  onSelectCategory, 
  siteSettings,
  onOpenCitizenModal,
  onNavigateToEditorial,
  onOpenBoxRedaksiModal,
  onOpenCyberMediaGuidelinesModal,
  onOpenAdvertisingModal,
  onOpenSawerKopi,
  savedCount = 0,
  onOpenSavedDrawer
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter out internal/editorial categories for user-facing menus
  const publicCategories = categories.filter((cat) => cat.id !== 'akpersi' && cat.id !== 'box redaksi' && cat.id !== 'transportasi');

  const portalTheme = siteSettings?.portalThemeSettings;
  const primaryDarkColor = portalTheme?.primaryDarkColor || '#082f49';
  const primaryColor = portalTheme?.primaryColor || '#0c4a6e';
  const accentColor = portalTheme?.accentColor || '#facc15';
  const accentHoverColor = portalTheme?.accentHoverColor || '#eab308';

  return (
    <footer 
      id="main-footer" 
      className="portal-theme-footer text-sky-200 text-xs transition-colors"
      style={{
        backgroundColor: primaryDarkColor,
        borderTop: '1px solid rgba(255, 255, 255, 0.12)'
      }}
    >
      
      {/* Top Banner Row with Kirim Berita and Scroll to Top */}
      <div 
        className="portal-theme-footer-banner border-b py-3 transition-colors"
        style={{
          backgroundColor: primaryColor,
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sky-200 font-medium">
            <Shield className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
            <span>Menaati <strong>Pedoman Pemberitaan Media Siber</strong> & {siteSettings?.pressCouncilCode || 'Kode Etik Jurnalistik Dewan Pers RI'}</span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenCitizenModal && (
              <button
                id="footer-send-news-btn"
                onClick={onOpenCitizenModal}
                style={{
                  backgroundColor: accentColor,
                  borderColor: accentHoverColor,
                  color: '#082f49'
                }}
                className="portal-theme-accent-btn flex items-center gap-1.5 px-4 py-1.5 rounded-xl active:scale-95 transition-all font-black uppercase tracking-wider text-xs border shadow-xs"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Kirim Berita</span>
              </button>
            )}

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-sky-950 text-sky-100 transition-all font-bold uppercase tracking-wider text-[11px] border border-white/20"
              style={{
                backgroundColor: primaryDarkColor
              }}
            >
              <span>Kembali ke Atas</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 flex items-center justify-center shadow-md border-2 border-yellow-200 flex-shrink-0">
                <span className="text-sky-950 font-black text-xl font-elegant-3d">A</span>
              </div>
              <ModernGraffitiLogo 
                size="md" 
                customText={siteSettings?.portalName || 'ARUN NEWS'}
                tagline={siteSettings?.portalTagline || 'Jembatan Informasi Nusantara'}
              />
            </div>

            <p className="text-sky-300 leading-relaxed text-xs font-medium">
              {siteSettings?.subTagline || `${siteSettings?.portalName || 'Arun News'} menyajikan jurnalisme independen, berimbang, dan berwawasan masa depan. Kami menghubungkan seluruh penjuru Nusantara dengan informasi tercepat, analisis terpercaya, dan cerita bermakna.`}
            </p>

            {/* Kirim Berita Callout Box in Footer */}
            {onOpenCitizenModal && (
              <div className="p-3.5 rounded-xl bg-sky-900/70 border border-sky-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Ruang Kontribusi Publik</span>
                  </div>
                  <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded font-mono font-bold">
                    Partisipasi Warga
                  </span>
                </div>
                <p className="text-[11px] text-sky-200">
                  Menyaksikan peristiwa penting di sekitar Anda? Salurkan naskah atau foto liputan Anda ke redaksi kami.
                </p>
                <button
                  id="footer-card-kirim-berita-btn"
                  onClick={onOpenCitizenModal}
                  className="w-full py-2 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-yellow-500 shadow-xs transition-all active:scale-98"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Kirim Berita Sekarang</span>
                </button>
              </div>
            )}

            <div className="space-y-1.5 text-sky-300 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                <span>{siteSettings?.officeAddress || 'Gg gaya, pasar minggu, kec, pasar minggu, kota jakarta selatan, provinsi DKI JAKARTA, Indonesia'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                <span>{siteSettings?.editorialEmail || 'redaksi@arunnews.id'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                <span>Hotline Redaksi: {siteSettings?.hotlinePhone || '0895626941900'}</span>
              </div>
            </div>

            {/* Interactive Google Maps Office Location Widget */}
            <div className="mt-4 pt-3 border-t border-sky-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                  <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Lokasi Kantor Redaksi (Peta Interaktif)</span>
                </div>
                <a
                  href="https://maps.google.com/?q=Pasar+Minggu+Jakarta+Selatan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] bg-yellow-400 text-sky-950 px-2 py-0.5 rounded font-bold hover:bg-yellow-300 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Buka Maps</span>
                </a>
              </div>
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-sky-700 bg-sky-900 shadow-inner">
                <iframe
                  title="Kantor Redaksi Arun News Lokasi"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.027042012165!2d106.845!3d-6.284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f220f1234567%3A0x123456789abcdef!2sPasar%20Minggu%2C%20South%20Jakarta%20City%2C%20Jakarta!5e0!3m2!1sen!2sid!4v1710000000000!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full filter contrast-125 opacity-90 hover:opacity-100 transition-opacity"
                />
                <div className="absolute bottom-2 left-2 bg-sky-950/90 text-white px-2 py-1 rounded text-[10px] font-mono border border-sky-700 shadow">
                  📍 Pasar Minggu, Jakarta Selatan
                </div>
              </div>
            </div>
          </div>

          {/* Kanal Berita */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 pb-1 border-b-2 border-yellow-400">
              <h3 className="text-white font-black text-xs uppercase tracking-wider font-mono">
                Kanal Berita
              </h3>
              {onOpenSavedDrawer && (
                <button
                  type="button"
                  id="footer-saved-badge-btn"
                  onClick={onOpenSavedDrawer}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-400/20 hover:bg-yellow-400 text-yellow-300 hover:text-sky-950 border border-yellow-400/40 text-[10px] font-black font-mono shadow-xs cursor-pointer active:scale-95 transition-all"
                  title={`Buka Berita Disimpan (${savedCount})`}
                >
                  <Bookmark className="w-3 h-3 fill-current" />
                  <span>Disimpan ({savedCount})</span>
                </button>
              )}
            </div>
            <ul className="space-y-1.5 text-sky-300 text-xs font-medium">
              {publicCategories.filter((cat) => cat.id !== 'all' && cat.id !== 'legalitas').map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      scrollToTop();
                    }}
                    className="hover:text-yellow-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}

              {/* Item Berita Disimpan di dalam list Kanal Berita */}
              {onOpenSavedDrawer && (
                <li className="pt-2 mt-1 border-t border-sky-800/60">
                  <button
                    id="footer-saved-articles-btn"
                    onClick={onOpenSavedDrawer}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-sky-900/90 to-sky-950 hover:from-sky-800 hover:to-sky-900 border border-yellow-400/50 hover:border-yellow-400 text-yellow-300 hover:text-white transition-all shadow-xs cursor-pointer group active:scale-95 text-left"
                    title={`Buka Berita Disimpan (${savedCount} warta)`}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold">
                      <Bookmark className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/30 group-hover:scale-110 transition-transform" />
                      <span>Berita Disimpan</span>
                    </span>
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full bg-yellow-400 text-sky-950 shadow-xs border border-yellow-500">
                      {savedCount}
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Kanal Khusus & Fitur */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 pb-1 border-b-2 border-yellow-400">
              <h3 className="text-white font-black text-xs uppercase tracking-wider font-mono">
                Kanal Khusus
              </h3>
              {onOpenSawerKopi && (
                <button
                  type="button"
                  onClick={onOpenSawerKopi}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-400 hover:bg-yellow-300 text-sky-950 text-[10px] font-black uppercase font-mono shadow-xs cursor-pointer active:scale-95 transition-all"
                  title="Sawer Kopi Redaksi"
                >
                  <Coffee className="w-3 h-3 text-sky-950" />
                  <span>Sawer Kopi</span>
                </button>
              )}
            </div>
            <ul className="space-y-2 text-sky-300 text-xs font-medium">
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('transportasi');
                    scrollToTop();
                  }}
                  className="hover:text-yellow-400 transition-colors text-left flex items-center gap-1.5 text-yellow-300 font-bold"
                >
                  <Train className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Transportasi</span>
                  <span className="text-[9px] bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 px-1 py-0.2 rounded font-mono uppercase">Khusus</span>
                </button>
              </li>
              {publicCategories.slice(6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      scrollToTop();
                    }}
                    className="hover:text-yellow-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <a href="#video-news-section" className="hover:text-yellow-400 transition-colors">
                  Warta Video & Siaran
                </a>
              </li>
              <li>
                <a href="#photo-gallery-section" className="hover:text-yellow-400 transition-colors">
                  Galeri Foto Nusantara
                </a>
              </li>
              <li>
                <a href="#interactive-poll-card" className="hover:text-yellow-400 transition-colors">
                  Jajak Pendapat Publik
                </a>
              </li>
            </ul>

            {/* Sawer Kopi Banner Card di Bawah Kanal Khusus */}
            {onOpenSawerKopi && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-amber-500/20 via-sky-900/60 to-sky-950 border border-yellow-400/50 text-left shadow-sm">
                <div className="flex items-center gap-1.5 mb-1 text-yellow-300 font-black text-xs">
                  <Coffee className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span>Sawer Kopi Jurnalis</span>
                </div>
                <p className="text-[11px] text-sky-200 mb-2 leading-relaxed">
                  Dukung kebebasan pers & independensi liputan kami dengan secangkir kopi.
                </p>
                <button
                  type="button"
                  onClick={onOpenSawerKopi}
                  className="w-full py-1.5 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-sky-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Traktir Kopi Sekarang ☕</span>
                </button>
              </div>
            )}
          </div>

          {/* Redaksi & Info Korporat */}
          <div>
            <h3 className="text-white font-black text-xs uppercase tracking-wider mb-3 pb-1 border-b-2 border-yellow-400 inline-block font-mono">
              Tentang Kami & Partisipasi
            </h3>
            <ul className="space-y-2 text-sky-300 text-xs font-medium">
              {onOpenCitizenModal && (
                <li>
                  <button
                    onClick={onOpenCitizenModal}
                    className="text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Megaphone className="w-3 h-3 text-yellow-400" />
                    <span>Lapor Warga</span>
                  </button>
                </li>
              )}
              {siteSettings?.moduleToggles?.showEditorialBoard !== false && (
                <li>
                  <button 
                    onClick={onOpenBoxRedaksiModal}
                    className="hover:text-yellow-400 text-sky-200 font-bold transition-colors text-left flex items-center gap-1"
                  >
                    <Award className="w-3 h-3 text-yellow-400" />
                    <span>Susunan Pengelola & Box Redaksi</span>
                  </button>
                </li>
              )}
              {/* Pengaturan Admin */}
              <li>
                <a 
                  href="https://portalarunews.com/#/admin"
                  onClick={(e) => {
                    if (onNavigateToEditorial) {
                      e.preventDefault();
                      onNavigateToEditorial();
                    }
                  }}
                  className="hover:text-yellow-400 text-yellow-300 font-bold transition-colors text-left flex items-center gap-1.5 cursor-pointer font-mono"
                  title="Akses Pengaturan Admin Portal (portalarunews.com/#/admin)"
                >
                  <Sliders className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  <span>Pengaturan Admin</span>
                </a>
              </li>
              {siteSettings?.moduleToggles?.showPedomanMediaSiber !== false && (
                <li>
                  <button 
                    type="button"
                    onClick={() => onOpenCyberMediaGuidelinesModal?.('pedoman')}
                    className="hover:text-yellow-400 text-yellow-300 font-extrabold transition-colors text-left flex items-center gap-1.5 font-mono cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    <span>Pedoman Media Siber</span>
                  </button>
                </li>
              )}
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenCyberMediaGuidelinesModal?.('kode_etik')}
                  className="hover:text-yellow-400 text-sky-200 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Kode Etik Jurnalistik</span>
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenCyberMediaGuidelinesModal?.('privasi')}
                  className="hover:text-yellow-400 text-sky-200 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Kebijakan Privasi</span>
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenCyberMediaGuidelinesModal?.('panduan_warga')}
                  className="hover:text-yellow-400 text-sky-200 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Panduan Jurnalisme Warga</span>
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenCyberMediaGuidelinesModal?.('syarat_ketentuan')}
                  className="hover:text-yellow-400 text-sky-200 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Syarat & Ketentuan</span>
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenCyberMediaGuidelinesModal?.('disclaimer')}
                  className="hover:text-yellow-400 text-sky-200 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Disclaimer</span>
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenAdvertisingModal?.()}
                  className="hover:text-yellow-400 text-sky-200 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  <span>Pemasangan Iklan & Kemitraan</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 mt-8 border-t border-sky-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sky-400 text-[11px]">
          <div>
            © 2026 {siteSettings?.portalName || 'Arun News'}. Hak Cipta Dilindungi Undang-Undang Republik Indonesia.
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono font-medium flex-wrap justify-center sm:justify-end">
            <span className="font-graffiti tracking-wider text-yellow-400 graffiti-tagline uppercase">Jembatan Informasi Nusantara</span>
            <span>•</span>
            <span className="text-sky-300">Edisi Digital</span>
            <span>•</span>
            <a 
              href="https://portalarunews.com/#/admin"
              onClick={(e) => {
                if (onNavigateToEditorial) {
                  e.preventDefault();
                  onNavigateToEditorial();
                }
              }}
              className="text-sky-300 hover:text-yellow-400 transition-colors flex items-center gap-1 font-bold"
              title="portalarunews.com/#/admin"
            >
              <Sliders className="w-3 h-3 text-yellow-400" />
              <span>Pengaturan Admin</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};


