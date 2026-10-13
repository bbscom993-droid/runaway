import React, { useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copyright,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

interface LegalitasHubProps {
  onOpenCyberMediaGuidelinesModal: (tab?: 'pedoman' | 'kode_etik' | 'privasi' | 'panduan_warga' | 'syarat_ketentuan' | 'disclaimer' | 'hak_cipta') => void;
}

export const LegalitasHub: React.FC<LegalitasHubProps> = ({
  onOpenCyberMediaGuidelinesModal
}) => {
  const [activeAccordion, setActiveAccordion] = useState<string>('syarat_ketentuan');

  const toggleAccordion = (key: string) => {
    setActiveAccordion(prev => prev === key ? '' : key);
  };

  return (
    <div id="legalitas-hub-section" className="bg-white rounded-2xl border-2 border-sky-900 shadow-xl overflow-hidden mb-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-950 to-sky-900 p-6 text-white border-b border-sky-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-lg flex-shrink-0 mt-0.5">
              <FileCheck className="w-6 h-6 text-sky-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase">
                  Menu Legalitas Resmi
                </span>
                <span className="text-xs text-sky-300 font-mono">ARUN NEWS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-mono">
                Legalitas
              </h1>
              <p className="text-xs sm:text-sm text-sky-200 font-medium mt-1">
                Dokumen hukum dan pedoman penyelenggaraan ARUN NEWS.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenCyberMediaGuidelinesModal('syarat_ketentuan')}
            className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95 shadow-md self-start md:self-auto flex-shrink-0"
          >
            <span>Buka Seluruh Dokumen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Legal Sections Body */}
      <div className="p-5 sm:p-6 space-y-6">

        {/* Legal Document Quick Nav Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onOpenCyberMediaGuidelinesModal('syarat_ketentuan')}
            className="p-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition-all hover:shadow-md group flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-sky-950 text-xs sm:text-sm">Syarat & Ketentuan</h4>
              <p className="text-[11px] text-slate-600">Diperbarui: 1 Agustus 2026</p>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-sky-800 group-hover:scale-110 transition-transform" />
              <ExternalLink className="w-3.5 h-3.5 text-sky-600 opacity-60 group-hover:opacity-100" />
            </div>
          </button>

          <button
            onClick={() => onOpenCyberMediaGuidelinesModal('privasi')}
            className="p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-all hover:shadow-md group flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">Kebijakan Privasi</h4>
              <p className="text-[11px] text-slate-600">Diperbarui: 1 Agustus 2026</p>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-800 group-hover:scale-110 transition-transform" />
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100" />
            </div>
          </button>

          <button
            onClick={() => onOpenCyberMediaGuidelinesModal('disclaimer')}
            className="p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all hover:shadow-md group flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-amber-950 text-xs sm:text-sm">Disclaimer</h4>
              <p className="text-[11px] text-slate-600">Diperbarui: 1 Agustus 2026</p>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-amber-800 group-hover:scale-110 transition-transform" />
              <ExternalLink className="w-3.5 h-3.5 text-amber-600 opacity-60 group-hover:opacity-100" />
            </div>
          </button>

          <button
            onClick={() => onOpenCyberMediaGuidelinesModal('pedoman')}
            className="p-3.5 rounded-xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 text-left transition-all hover:shadow-md group flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-sky-950 text-xs sm:text-sm">Pedoman Media Siber Dewan Pers</h4>
              <p className="text-[11px] text-slate-600">Keputusan Dewan Pers No. 3/2012</p>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-5 h-5 text-sky-950 group-hover:scale-110 transition-transform" />
              <ExternalLink className="w-3.5 h-3.5 text-sky-700 opacity-60 group-hover:opacity-100" />
            </div>
          </button>
        </div>

        {/* Detailed Document Accordion / Display */}
        <div className="space-y-4">
          
          {/* SECTION 1: Syarat dan Ketentuan */}
          <div className="border border-sky-200 rounded-2xl overflow-hidden shadow-2xs">
            <button
              onClick={() => toggleAccordion('syarat_ketentuan')}
              className="w-full p-4 bg-sky-50 hover:bg-sky-100/80 flex items-center justify-between gap-3 text-left transition-colors border-b border-sky-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-950 text-yellow-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sky-950 text-base font-mono">
                      Syarat dan Ketentuan
                    </h3>
                    <span className="bg-sky-950 text-yellow-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      Diperbarui: 1 Agustus 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Ketentuan penggunaan portal berita ARUN NEWS</p>
                </div>
              </div>
              {activeAccordion === 'syarat_ketentuan' ? (
                <ChevronUp className="w-5 h-5 text-sky-900" />
              ) : (
                <ChevronDown className="w-5 h-5 text-sky-700" />
              )}
            </button>

            {activeAccordion === 'syarat_ketentuan' && (
              <div className="p-5 bg-white space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed animate-in fade-in duration-150">
                <p className="text-slate-700 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  Dengan mengakses dan menggunakan portal berita ARUN NEWS, Anda menyetujui syarat dan ketentuan berikut ini. Mohon baca dengan seksama sebelum menggunakan layanan kami.
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-extrabold text-sky-950 text-sm font-mono flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-sky-950 text-yellow-400 text-xs flex items-center justify-center font-bold">1</span>
                      Penggunaan Konten
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Seluruh konten yang tersedia di ARUN NEWS, termasuk teks, gambar, grafis, video, dan materi lainnya, dilindungi oleh hak cipta dan hak kekayaan intelektual lainnya. Dilarang menyalin, mendistribusikan, atau memodifikasi konten tanpa izin tertulis dari redaksi.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-extrabold text-sky-950 text-sm font-mono flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-sky-950 text-yellow-400 text-xs flex items-center justify-center font-bold">2</span>
                      Akurasi Informasi
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      ARUN NEWS berupaya menyajikan informasi yang akurat dan terkini. Namun, kami tidak menjamin keakuratan, kelengkapan, atau ketepatan waktu dari informasi yang tersedia.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-extrabold text-sky-950 text-sm font-mono flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-sky-950 text-yellow-400 text-xs flex items-center justify-center font-bold">3</span>
                      Tautan Pihak Ketiga
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Portal kami mungkin mengandung tautan ke situs web pihak ketiga. ARUN NEWS tidak bertanggung jawab atas konten atau praktik privasi situs tersebut.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onOpenCyberMediaGuidelinesModal('syarat_ketentuan')}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 hover:underline"
                  >
                    <span>Cetak atau Baca Versi Lengkap</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Kebijakan Privasi */}
          <div className="border border-emerald-200 rounded-2xl overflow-hidden shadow-2xs">
            <button
              onClick={() => toggleAccordion('privasi')}
              className="w-full p-4 bg-emerald-50 hover:bg-emerald-100/80 flex items-center justify-between gap-3 text-left transition-colors border-b border-emerald-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-emerald-950 text-base font-mono">
                      Kebijakan Privasi
                    </h3>
                    <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      Diperbarui: 1 Agustus 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Perlindungan privasi pengguna & data pribadi ARUN NEWS</p>
                </div>
              </div>
              {activeAccordion === 'privasi' ? (
                <ChevronUp className="w-5 h-5 text-emerald-900" />
              ) : (
                <ChevronDown className="w-5 h-5 text-emerald-700" />
              )}
            </button>

            {activeAccordion === 'privasi' && (
              <div className="p-5 bg-white space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed animate-in fade-in duration-150">
                <p className="text-slate-700 font-medium bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                  ARUN NEWS berkomitmen untuk melindungi privasi pengguna. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-extrabold text-emerald-950 text-sm font-mono flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-300 text-xs flex items-center justify-center font-bold">1</span>
                      Informasi yang Dikumpulkan
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Kami dapat mengumpulkan informasi yang Anda berikan secara langsung, seperti saat mengirim laporan berita, atau informasi yang dikumpulkan secara otomatis melalui log server dan cookie.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-extrabold text-emerald-950 text-sm font-mono flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-300 text-xs flex items-center justify-center font-bold">2</span>
                      Penggunaan Informasi
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Informasi yang dikumpulkan digunakan untuk meningkatkan layanan, merespons pertanyaan, dan mengirimkan informasi relevan yang Anda minta.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-extrabold text-emerald-950 text-sm font-mono flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-300 text-xs flex items-center justify-center font-bold">3</span>
                      Keamanan Data
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi pribadi Anda dari akses, pengungkapan, atau penghancuran yang tidak sah.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onOpenCyberMediaGuidelinesModal('privasi')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Cetak atau Baca Versi Lengkap</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Disclaimer */}
          <div className="border border-amber-200 rounded-2xl overflow-hidden shadow-2xs">
            <button
              onClick={() => toggleAccordion('disclaimer')}
              className="w-full p-4 bg-amber-50 hover:bg-amber-100/80 flex items-center justify-between gap-3 text-left transition-colors border-b border-amber-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-amber-950 text-base font-mono">
                      Disclaimer
                    </h3>
                    <span className="bg-amber-950 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      Diperbarui: 1 Agustus 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Penafian tanggung jawab konten, opini, dan iklan di ARUN NEWS</p>
                </div>
              </div>
              {activeAccordion === 'disclaimer' ? (
                <ChevronUp className="w-5 h-5 text-amber-900" />
              ) : (
                <ChevronDown className="w-5 h-5 text-amber-700" />
              )}
            </button>

            {activeAccordion === 'disclaimer' && (
              <div className="p-5 bg-white space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed animate-in fade-in duration-150">
                <p className="text-slate-700 font-medium bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                  Informasi yang disajikan di ARUN NEWS bersifat informatif dan tidak dimaksudkan sebagai saran hukum, medis, keuangan, atau profesional lainnya.
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-extrabold text-amber-950 text-sm font-mono flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-950 text-amber-300 text-xs flex items-center justify-center font-bold">1</span>
                      Keterbatasan Tanggung Jawab
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      ARUN NEWS tidak bertanggung jawab atas kerugian atau kerusakan yang timbul dari penggunaan atau ketidakmampuan menggunakan informasi yang tersedia di portal ini.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-extrabold text-amber-950 text-sm font-mono flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-950 text-amber-300 text-xs flex items-center justify-center font-bold">2</span>
                      Opini dan Editorial
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Pandangan yang diungkapkan dalam artikel opini atau editorial adalah milik penulis dan tidak mencerminkan pandangan resmi ARUN NEWS.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-extrabold text-amber-950 text-sm font-mono flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-950 text-amber-300 text-xs flex items-center justify-center font-bold">3</span>
                      Iklan dan Sponsor
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Konten berbayar atau bersponsor akan ditandai secara jelas. ARUN NEWS tidak bertanggung jawab atas produk atau layanan yang diiklankan.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onOpenCyberMediaGuidelinesModal('disclaimer')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Cetak atau Baca Versi Lengkap</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Footer callout */}
      <div className="p-4 bg-slate-100 border-t border-slate-200 text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-800" />
          <span>Pengaduan & Pertanyaan Hukum: <strong className="text-sky-950">redaksi@arunnews.id</strong></span>
        </div>
        <button
          onClick={() => onOpenCyberMediaGuidelinesModal('pedoman')}
          className="text-sky-900 font-bold hover:underline"
        >
          Pedoman Media Siber Dewan Pers &rarr;
        </button>
      </div>

    </div>
  );
};
