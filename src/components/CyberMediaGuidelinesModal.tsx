import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Scale, 
  Download, 
  Printer, 
  ExternalLink, 
  Award, 
  AlertTriangle, 
  Info,
  Search,
  Copyright
} from 'lucide-react';

interface CyberMediaGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'pedoman' | 'kode_etik' | 'privasi' | 'panduan_warga' | 'syarat_ketentuan' | 'disclaimer' | 'hak_cipta';
}

export const CyberMediaGuidelinesModal: React.FC<CyberMediaGuidelinesModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'pedoman'
}) => {
  const [activeTab, setActiveTab] = useState<'pedoman' | 'kode_etik' | 'privasi' | 'panduan_warga' | 'syarat_ketentuan' | 'disclaimer' | 'hak_cipta'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync activeTab whenever modal opens or defaultTab prop updates
  React.useEffect(() => {
    if (isOpen && defaultTab) {
      if (defaultTab === 'hak_cipta') {
        setActiveTab('syarat_ketentuan');
      } else {
        setActiveTab(defaultTab);
      }
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="cyber-media-guidelines-modal"
      className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-sky-950 text-white border-b border-sky-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-xs flex-shrink-0">
              <BookOpen className="w-5 h-5 text-sky-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-mono">
                  Legalitas & Dokumen Hukum
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-yellow-400/20 text-yellow-300 text-[10px] font-mono font-bold border border-yellow-400/30">
                  ARUN NEWS
                </span>
              </div>
              <p className="text-[11px] text-sky-200 font-mono">Dokumen hukum dan pedoman penyelenggaraan ARUN NEWS.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 align-self-end sm:align-self-center">
            <button
              onClick={handlePrint}
              className="p-1.5 px-2.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-sky-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-sky-700"
              title="Cetak Pedoman"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-800 transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector Nav */}
        <div className="bg-sky-900 p-2 px-4 flex items-center gap-2 overflow-x-auto border-b border-sky-800 flex-shrink-0 text-xs font-mono">
          <button
            onClick={() => setActiveTab('pedoman')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'pedoman'
                ? 'bg-yellow-400 text-sky-950 shadow-xs'
                : 'text-sky-200 hover:bg-sky-800 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>1. Pedoman Media Siber</span>
          </button>

          <button
            onClick={() => setActiveTab('kode_etik')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'kode_etik'
                ? 'bg-yellow-400 text-sky-950 shadow-xs'
                : 'text-sky-200 hover:bg-sky-800 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>2. Kode Etik Jurnalistik</span>
          </button>

          <button
            onClick={() => setActiveTab('privasi')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'privasi'
                ? 'bg-yellow-400 text-sky-950 shadow-xs'
                : 'text-sky-200 hover:bg-sky-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Kebijakan Privasi</span>
          </button>

          <button
            onClick={() => setActiveTab('panduan_warga')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'panduan_warga'
                ? 'bg-yellow-400 text-sky-950 shadow-xs'
                : 'text-sky-200 hover:bg-sky-800 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. Panduan Lapor Warga</span>
          </button>

          <button
            onClick={() => setActiveTab('syarat_ketentuan')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'syarat_ketentuan'
                ? 'bg-yellow-400 text-sky-950 shadow-xs'
                : 'text-sky-200 hover:bg-sky-800 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>5. Syarat & Ketentuan</span>
          </button>

          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'disclaimer'
                ? 'bg-yellow-400 text-sky-950 shadow-xs'
                : 'text-sky-200 hover:bg-sky-800 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>6. Disclaimer</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 text-slate-800 leading-relaxed text-xs sm:text-sm">
          
          {/* TAB: KEBIJAKAN PRIVASI */}
          {activeTab === 'privasi' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-black text-base sm:text-lg uppercase tracking-tight font-mono text-emerald-950">
                      Kebijakan Privasi
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-800">
                      Diperbarui: 1 Agustus 2026
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    ARUN NEWS berkomitmen untuk melindungi privasi pengguna. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                
                {/* Point 1: Informasi yang Dikumpulkan */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center">1</span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Informasi yang Dikumpulkan
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Kami dapat mengumpulkan informasi yang Anda berikan secara langsung, seperti saat mengirim laporan berita, atau informasi yang dikumpulkan secara otomatis melalui log server dan cookie.
                  </p>
                </div>

                {/* Point 2: Penggunaan Informasi */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center">2</span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Penggunaan Informasi
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Informasi yang dikumpulkan digunakan untuk meningkatkan layanan, merespons pertanyaan, dan mengirimkan informasi relevan yang Anda minta.
                  </p>
                </div>

                {/* Point 3: Keamanan Data */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center">3</span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Keamanan Data
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi pribadi Anda dari akses, pengungkapan, atau penghancuran yang tidak sah.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB: DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-black text-base sm:text-lg uppercase tracking-tight font-mono text-amber-950">
                      Disclaimer
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-950 text-amber-300 font-mono text-[10px] font-bold border border-amber-800">
                      Diperbarui: 1 Agustus 2026
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    Informasi yang disajikan di ARUN NEWS bersifat informatif dan tidak dimaksudkan sebagai saran hukum, medis, keuangan, atau profesional lainnya.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                
                {/* Point 1: Keterbatasan Tanggung Jawab */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-950 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">1</span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Keterbatasan Tanggung Jawab
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    ARUN NEWS tidak bertanggung jawab atas kerugian atau kerusakan yang timbul dari penggunaan atau ketidakmampuan menggunakan informasi yang tersedia di portal ini.
                  </p>
                </div>

                {/* Point 2: Opini dan Editorial */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-950 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">2</span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Opini dan Editorial
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Pandangan yang diungkapkan dalam artikel opini atau editorial adalah milik penulis dan tidak mencerminkan pandangan resmi ARUN NEWS.
                  </p>
                </div>

                {/* Point 3: Iklan dan Sponsor */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-950 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">3</span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Iklan dan Sponsor
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Konten berbayar atau bersponsor akan ditandai secara jelas. ARUN NEWS tidak bertanggung jawab atas produk atau layanan yang diiklankan.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 1: PEDOMAN PEMBERITAAN MEDIA SIBER */}
          {activeTab === 'pedoman' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Offical Header Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-sky-950 text-yellow-300 font-mono text-[10px] font-bold uppercase tracking-wider mb-1.5 inline-block">
                    Keputusan Dewan Pers RI No. 3/2012
                  </span>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950 font-mono">
                    Pedoman Pemberitaan Media Siber
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Disahkan oleh Dewan Pers dan komunitas pers di Jakarta pada tanggal 3 Februari 2012 sebagai standar operasional seluruh media siber di Indonesia.
                  </p>
                </div>

                <a
                  href="https://dewanpers.or.id/pedoman/detail/media_siber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-sky-950 hover:bg-sky-900 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Situs Dewan Pers</span>
                </a>
              </div>

              {/* 8 Articles Grid */}
              <div className="space-y-4">
                
                {/* Pasal 1 */}
                <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Ruang Lingkup
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    <strong>a.</strong> Media Siber adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pers dan Standar Perusahaan Pers yang ditetapkan Dewan Pers.<br />
                    <strong>b.</strong> Isi Buatan Pengguna <em>(User Generated Content)</em> adalah segala isi yang dibuat dan atau diunggah oleh pengguna media siber, antara lain artikel, komentar, suara, gambar, serta berbagai bentuk unggahan yang melekat pada media siber, seperti blog, forum, komentar pembaca atau pemirsa, dan bentuk lain.
                  </p>
                </div>

                {/* Pasal 2 */}
                <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Verifikasi dan Keseimbangan Berita
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    <strong>a.</strong> Pada prinsipnya setiap berita harus melalui verifikasi.<br />
                    <strong>b.</strong> Berita yang dapat merugikan pihak lain memerlukan verifikasi pada berita yang sama untuk memenuhi prinsip keberimbangan <em>(cover both sides)</em>.<br />
                    <strong>c.</strong> Ketentuan verifikasi dapat dikecualikan dengan syarat: berita benar-benar mengandung kepentingan publik yang mendesak, sumber berita jelas, dan redaksi memberikan penjelasan kepada pembaca bahwa berita tersebut masih memerlukan verifikasi lebih lanjut.
                  </p>
                </div>

                {/* Pasal 3 */}
                <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Isi Buatan Pengguna (User Generated Content)
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    <strong>a.</strong> Media siber wajib mencantumkan syarat dan ketentuan mengenai Isi Buatan Pengguna yang tidak bertentangan dengan UU No. 40 Tahun 1999 tentang Pers dan Kode Etik Jurnalistik.<br />
                    <strong>b.</strong> Media siber wajib menyediakan mekanisme pengaduan Isi Buatan Pengguna yang dinilai melanggar ketentuan.<br />
                    <strong>c.</strong> Media siber wajib menyunting, menghapus, dan melakukan tindakan koreksi atas setiap Isi Buatan Pengguna yang dilaporkan dan melanggar ketentuan, sesegera mungkin secara proporsional selambat-lambatnya 24 jam setelah dilaporkan.
                  </p>
                </div>

                {/* Pasal 4 */}
                <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      4
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Ralat, Koreksi, dan Hak Jawab
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    <strong>a.</strong> Ralat, koreksi, dan hak jawab mengacu pada Undang-Undang Pers, Kode Etik Jurnalistik, dan Pedoman Hak Jawab yang ditetapkan Dewan Pers.<br />
                    <strong>b.</strong> Ralat, koreksi dan atau hak jawab wajib dikaitkan <em>(link)</em> pada berita yang diralat, dikoreksi atau yang diberi hak jawab.<br />
                    <strong>c.</strong> Di setiap berita ralat, koreksi, dan hak jawab wajib dicantumkan waktu pemuatan ralat, koreksi, dan atau hak jawab tersebut.
                  </p>
                </div>

                {/* Pasal 5 */}
                <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      5
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Pencabutan Berita
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    <strong>a.</strong> Berita yang sudah dipublikasikan tidak dapat dicabut karena alasan penyensoran dari pihak luar redaksi, kecuali terkait masalah SARA, kesusilaan, masa depan anak, pengalaman traumatik korban atau berdasarkan pertimbangan khusus lain yang ditetapkan Dewan Pers.<br />
                    <strong>b.</strong> Pencabutan berita wajib disertai alasan pencabutan dan diumumkan kepada publik.
                  </p>
                </div>

                {/* Pasal 6 */}
                <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      6
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Hak Cipta
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Media siber wajib menghormati hak cipta sebagaimana diatur dalam peraturan perundang-undangan yang berlaku, termasuk mencantumkan sumber materi secara jelas.
                  </p>
                </div>

                {/* Pasal 7 */}
                <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      7
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Pencantuman Pedoman
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Media siber wajib mencantumkan Pedoman Pemberitaan Media Siber ini di medianya secara terang dan jelas sehingga mudah diakses oleh publik.
                  </p>
                </div>

                {/* Pasal 8 */}
                <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      8
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Sengketa
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Penilaian akhir atas sengketa mengenai pelaksanaan Pedoman Pemberitaan Media Siber ini diselesaikan oleh Dewan Pers.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: KODE ETIK JURNALISTIK */}
          {activeTab === 'kode_etik' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <h3 className="font-black text-sm uppercase tracking-wider font-mono mb-1">
                  Kode Etik Jurnalistik (KEJ)
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Wartawan Indonesia bersikap independen, menghasilkan berita yang akurat, berimbang, dan tidak beritikad buruk.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-white border border-sky-200 space-y-1">
                  <h4 className="font-bold text-sky-950">Pasal 1: Independen & Akurat</h4>
                  <p className="text-slate-600">Wartawan Indonesia bersikap independen, menghasilkan berita yang akurat, berimbang, dan tidak beritikad buruk.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-sky-200 space-y-1">
                  <h4 className="font-bold text-sky-950">Pasal 2: Cara-Cara Profesional</h4>
                  <p className="text-slate-600">Wartawan Indonesia menempuh cara-cara yang profesional dalam melaksanakan tugas jurnalistik.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-sky-200 space-y-1">
                  <h4 className="font-bold text-sky-950">Pasal 3: Uji Informasi & Asas Praduga Tak Bersalah</h4>
                  <p className="text-slate-600">Wartawan Indonesia selalu menguji informasi, memberitakan secara berimbang, tidak mencampurkan fakta dan opini yang menghakimi, serta menerapkan asas praduga tak bersalah.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-sky-200 space-y-1">
                  <h4 className="font-bold text-sky-950">Pasal 4: Tidak Korupsi & Tidak Menerima Suap</h4>
                  <p className="text-slate-600">Wartawan Indonesia tidak membuat berita bohong, fitnah, sadis, dan cabul serta tidak menerima suap atau imbalan yang mempengaruhi independensi.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KEBIJAKAN PRIVASI */}
          {activeTab === 'privasi' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950">
                <h3 className="font-black text-sm uppercase tracking-wider font-mono mb-1">
                  Kebijakan Privasi & Perlindungan Data
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Komitmen kami dalam melindungi kerahasiaan data pribadi pembaca, pelapor, dan pengguna portal berita.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-3.5 rounded-xl bg-white border border-sky-200 space-y-1">
                  <h4 className="font-bold text-sky-950">1. Pengumpulan Data</h4>
                  <p>Kami hanya mengumpulkan informasi yang Anda berikan secara sukarela saat menggunakan fitur Lapor Warga, berlangganan buletin, atau mengisi jajak pendapat.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-sky-200 space-y-1">
                  <h4 className="font-bold text-sky-950">2. Kerahasiaan Identitas Pelapor</h4>
                  <p>Sesuai Hak Tolak dalam Undang-Undang Pers, identitas narasumber atau pelapor warga yang meminta dirahasiakan akan dilindungi sepenuhnya oleh Redaksi.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-sky-200 space-y-1">
                  <h4 className="font-bold text-sky-950">3. Keamanan Informasi</h4>
                  <p>Data Anda disimpan secara aman dan tidak akan diperjualbelikan atau disebarluaskan kepada pihak ketiga tanpa persetujuan Anda.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PANDUAN LAPOR WARGA */}
          {activeTab === 'panduan_warga' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-300 text-sky-950">
                <h3 className="font-black text-sm uppercase tracking-wider font-mono mb-1">
                  Panduan Partisipasi Lapor Warga
                </h3>
                <p className="text-xs text-sky-900 leading-relaxed">
                  Pedoman bagi masyarakat yang ingin mengirimkan laporan kejadian, foto dokumentasi, atau informasi peristiwa di sekitar.
                </p>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                <div className="p-3 rounded-xl bg-white border border-sky-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Sertakan keterangan lokasi (jalan, kelurahan, kecamatan) dan waktu kejadian secara presisi.</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-sky-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Unggah foto atau video dokumentasi asli yang relevan dengan peristiwa (maksimal 5 berkas).</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-sky-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Hindari laporan yang mengandung ujaran kebencian, pencemaran nama baik, atau narasi provokatif tanpa bukti.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYARAT DAN KETENTUAN */}
          {activeTab === 'syarat_ketentuan' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-black text-base sm:text-lg uppercase tracking-tight font-mono text-sky-950">
                      Syarat dan Ketentuan
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-950 text-yellow-300 font-mono text-[10px] font-bold border border-sky-800">
                      Diperbarui: 1 Agustus 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Dengan mengakses dan menggunakan portal berita ARUN NEWS, Anda menyetujui syarat dan ketentuan berikut ini. Mohon baca dengan seksama sebelum menggunakan layanan kami.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                
                {/* Pasal 1 */}
                <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Penggunaan Konten
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Seluruh konten yang tersedia di ARUN NEWS, termasuk teks, gambar, grafis, video, dan materi lainnya, dilindungi oleh hak cipta dan hak kekayaan intelektual lainnya. Dilarang menyalin, mendistribusikan, atau memodifikasi konten tanpa izin tertulis dari redaksi.
                  </p>
                </div>

                {/* Pasal 2 */}
                <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Akurasi Informasi
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    ARUN NEWS berupaya menyajikan informasi yang akurat dan terkini. Namun, kami tidak menjamin keakuratan, kelengkapan, atau ketepatan waktu dari informasi yang tersedia.
                  </p>
                </div>

                {/* Pasal 3 */}
                <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-yellow-400 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Tautan Pihak Ketiga
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Portal kami mungkin mengandung tautan ke situs web pihak ketiga. ARUN NEWS tidak bertanggung jawab atas konten atau praktik privasi situs tersebut.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-black text-base sm:text-lg uppercase tracking-tight font-mono text-amber-950">
                      Disclaimer & Penafian Tanggung Jawab
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-950 text-yellow-300 font-mono text-[10px] font-bold border border-amber-800">
                      Diperbarui: 1 Agustus 2026
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    Pernyataan penafian resmi pengelolaan seluruh konten, opini, materi iklan, dan layanan informasi di portal berita ARUN NEWS.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                
                {/* Point 1: Disclaimer Umum */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Disclaimer Umum
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Informasi yang disajikan di ARUN NEWS bersifat informatif dan tidak dimaksudkan sebagai saran hukum, medis, keuangan, atau profesional lainnya.
                  </p>
                </div>

                {/* Point 2: Keterbatasan Tanggung Jawab */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                    <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Keterbatasan Tanggung Jawab
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    ARUN NEWS tidak bertanggung jawab atas kerugian atau kerusakan yang timbul dari penggunaan atau ketidakmampuan menggunakan informasi yang tersedia di portal ini.
                  </p>
                </div>

                {/* Point 3: Opini dan Editorial */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                    <BookOpen className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Opini dan Editorial
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Pandangan yang diungkapkan dalam artikel opini atau editorial adalah milik penulis dan tidak mencerminkan pandangan resmi ARUN NEWS.
                  </p>
                </div>

                {/* Point 4: Iklan dan Sponsor */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Iklan dan Sponsor
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Konten berbayar atau bersponsor akan ditandai secara jelas. ARUN NEWS tidak bertanggung jawab atas produk atau layanan yang diiklankan.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: HAK CIPTA */}
          {activeTab === 'hak_cipta' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-black text-base sm:text-lg uppercase tracking-tight font-mono text-sky-950">
                      Hak Cipta
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-950 text-yellow-300 font-mono text-[10px] font-bold border border-sky-800">
                      Diperbarui: 1 Agustus 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Ketentuan perlindungan hak cipta dan kepemilikan intelektual atas seluruh materi di portal berita ARUN NEWS.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                
                {/* Point 1: Hak Cipta */}
                <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <Copyright className="w-5 h-5 text-sky-700 flex-shrink-0" />
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Hak Cipta
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Seluruh konten di ARUN NEWS, termasuk teks, foto, grafis, logo, ikon, dan perangkat lunak, adalah milik PT Arun Media Nusantara dan dilindungi oleh undang-undang hak cipta Indonesia.
                  </p>
                </div>

                {/* Point 2: Penggunaan yang Diizinkan */}
                <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Penggunaan yang Diizinkan
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Anda diizinkan untuk mencetak atau mengunduh konten untuk penggunaan pribadi dan non-komersial, dengan syarat tidak mengubah konten tersebut dan mencantumkan sumber ARUN NEWS secara jelas.
                  </p>
                </div>

                {/* Point 3: Larangan */}
                <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Larangan
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Dilarang keras mereproduksi, mendistribusikan, menampilkan, atau membuat karya turunan dari konten kami untuk tujuan komersial tanpa izin tertulis dari ARUN NEWS.
                  </p>
                </div>

                {/* Point 4: Pelanggaran Hak Cipta */}
                <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
                    <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />
                    <h4 className="font-bold text-sky-950 text-sm font-mono">
                      Pelanggaran Hak Cipta
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    Jika Anda menemukan pelanggaran hak cipta, silakan hubungi kami di <a href="mailto:redaksi@arunnews.id" className="text-sky-700 font-bold underline hover:text-sky-900">redaksi@arunnews.id</a> untuk tindak lanjut.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-3 px-5 bg-sky-950 text-white border-t border-sky-800 flex items-center justify-between text-xs font-mono flex-shrink-0">
          <div className="flex items-center gap-2 text-sky-300">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">Terdaftar dan diawasi sesuai Undang-Undang No. 40 Tahun 1999 Tentang Pers</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black rounded-lg transition-colors"
          >
            Selesai Baca
          </button>
        </div>

      </div>
    </div>
  );
};
