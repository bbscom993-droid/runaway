import React, { useState } from 'react';
import { 
  X, 
  Megaphone, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MessageSquare, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Layout, 
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { SiteSettings } from '../types';

interface AdvertisingModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings?: SiteSettings;
}

export const AdvertisingModal: React.FC<AdvertisingModalProps> = ({
  isOpen,
  onClose,
  siteSettings
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('Banner Header');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const advertisingEmail = siteSettings?.officialContacts?.advertisingEmail || 'iklan@arunnews.id';
  const advertisingPhone = siteSettings?.officialContacts?.hotlineWhatsapp || siteSettings?.hotlinePhone || '0895-6269-41900';
  const cleanPhone = advertisingPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(advertisingEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(advertisingPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSendWA = () => {
    const text = `Halo Redaksi Iklan ARUN NEWS, saya ingin bertanya tentang pemesanan paket iklan:\n\n- Paket: ${selectedPackage}\n- Perusahaan/Brand: ${companyName || '-'}\n- Nama Kontak: ${contactName || '-'}\n- No. HP/WA: ${contactNumber || '-'}\n- Catatan/Kebutuhan: ${notes || '-'}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone || '62895626941900'}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-sky-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white border border-sky-200 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 text-white flex items-center justify-between border-b border-sky-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-yellow-400 text-sky-950 font-black shadow-md">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black font-mono tracking-tight text-white">
                  Pasang Iklan & Kemitraan
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-yellow-400 text-sky-950 text-[10px] font-black font-mono tracking-wider uppercase">
                  ARUN NEWS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-200 mt-0.5 font-medium">
                Promosikan usaha Anda kepada pembaca setia ARUN NEWS.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-sky-200 hover:text-white hover:bg-sky-800/60 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Section: Packages */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono font-black text-base text-sky-950 uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Pilihan Paket Iklan
              </h3>
              <span className="text-xs text-slate-500 font-mono">3 Opsi Utama</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Package 1: Banner Header */}
              <div 
                onClick={() => setSelectedPackage('Banner Header')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedPackage === 'Banner Header' 
                    ? 'border-yellow-400 bg-amber-50/40 ring-2 ring-yellow-400/30 shadow-md' 
                    : 'border-sky-100 bg-white hover:border-sky-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-900">
                      <Layout className="w-5 h-5" />
                    </div>
                    {selectedPackage === 'Banner Header' && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-sky-950 text-[10px] font-black font-mono">
                        Dipilih
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-sky-950 text-base font-mono">Banner Header</h4>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-xl font-black text-sky-950 font-mono">Rp 2.500.000</span>
                      <span className="text-xs text-slate-500 font-medium">/ bulan</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tampil paling atas di seluruh halaman, ukuran 1200x200 piksel.
                  </p>

                  <div className="pt-2 border-t border-sky-100/80 space-y-1.5 text-[11px] text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Visibilitas Maksimal di Seluruh Portal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Ukuran Standar 1200 x 200 px</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Responsif Desktop & Mobile</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package 2: Banner Sidebar */}
              <div 
                onClick={() => setSelectedPackage('Banner Sidebar')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedPackage === 'Banner Sidebar' 
                    ? 'border-yellow-400 bg-amber-50/40 ring-2 ring-yellow-400/30 shadow-md' 
                    : 'border-sky-100 bg-white hover:border-sky-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-900">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    {selectedPackage === 'Banner Sidebar' && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-sky-950 text-[10px] font-black font-mono">
                        Dipilih
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-sky-950 text-base font-mono">Banner Sidebar</h4>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-xl font-black text-sky-950 font-mono">Rp 1.500.000</span>
                      <span className="text-xs text-slate-500 font-medium">/ bulan</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Menempel pada kolom kanan halaman utama, kategori, dan artikel.
                  </p>

                  <div className="pt-2 border-t border-sky-100/80 space-y-1.5 text-[11px] text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Kolom Kanan Halaman Utama & Artikel</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Tinggi Kontak Pembaca Aktif</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Format GIF / PNG / JPEG</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package 3: Advertorial */}
              <div 
                onClick={() => setSelectedPackage('Advertorial')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedPackage === 'Advertorial' 
                    ? 'border-yellow-400 bg-amber-50/40 ring-2 ring-yellow-400/30 shadow-md' 
                    : 'border-sky-100 bg-white hover:border-sky-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-900">
                      <FileText className="w-5 h-5" />
                    </div>
                    {selectedPackage === 'Advertorial' && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-sky-950 text-[10px] font-black font-mono">
                        Dipilih
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-sky-950 text-base font-mono">Advertorial</h4>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-xl font-black text-sky-950 font-mono">Rp 3.000.000</span>
                      <span className="text-xs text-slate-500 font-medium">/ naskah</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Artikel bersponsor lengkap dengan foto dan video produk Anda.
                  </p>

                  <div className="pt-2 border-t border-sky-100/80 space-y-1.5 text-[11px] text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Artikel Bersponsor Eksklusif</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Termasuk Galeri Foto & Video Produk</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Indeks Permanen & SEO Friendly</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Contact & Order */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-sky-950 to-sky-900 text-white space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-sky-800/80 pb-4">
              <div>
                <h3 className="font-mono font-black text-base uppercase tracking-tight text-yellow-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Pemesanan Iklan
                </h3>
                <p className="text-xs text-sky-200 mt-0.5">
                  Hubungi bagian iklan di <span className="font-mono text-white font-bold">{advertisingEmail}</span> atau WhatsApp <span className="font-mono text-white font-bold">{advertisingPhone}</span>.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded-xl bg-sky-800 hover:bg-sky-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5 text-yellow-400" />}
                  <span>{copiedEmail ? 'Email Tersalin' : 'Salin Email'}</span>
                </button>

                <button
                  onClick={handleCopyPhone}
                  className="px-3 py-1.5 rounded-xl bg-sky-800 hover:bg-sky-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-yellow-400" />}
                  <span>{copiedPhone ? 'WA Tersalin' : 'Salin WA'}</span>
                </button>
              </div>
            </div>

            {/* Quick Consultation Form */}
            <div className="bg-sky-900/60 p-4 rounded-xl border border-sky-800 space-y-3">
              <div className="text-xs font-mono text-yellow-300 font-bold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Formulir Konsultasi Iklan Cepat</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-sky-300 mb-1">Nama Perusahaan / Brand</label>
                  <input 
                    type="text"
                    placeholder="Contoh: PT Surya Jaya"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-sky-950 border border-sky-700 text-white text-xs placeholder:text-sky-500 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-sky-300 mb-1">Nama Kontak Anda</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-sky-950 border border-sky-700 text-white text-xs placeholder:text-sky-500 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-sky-300 mb-1">Nomor WA / Kontak</label>
                  <input 
                    type="text"
                    placeholder="0812..."
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-sky-950 border border-sky-700 text-white text-xs placeholder:text-sky-500 focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-sky-300 mb-1">Catatan Tambahan (Opsional)</label>
                <input 
                  type="text"
                  placeholder="Deskripsi singkat materi / periode tayang yang diinginkan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-sky-950 border border-sky-700 text-white text-xs placeholder:text-sky-500 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-sky-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Materi iklan aktif dikelola langsung oleh redaksi melalui panel admin.</span>
                </div>

                <button
                  type="button"
                  onClick={handleSendWA}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-mono font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-sky-950" />
                  <span>Kirim via WhatsApp</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-sky-950 text-white border-t border-sky-800 flex items-center justify-between text-xs font-mono flex-shrink-0">
          <div className="text-sky-300 text-[11px]">
            Portal Berita Resmi ARUN NEWS • PT Arun Media Nusantara
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
