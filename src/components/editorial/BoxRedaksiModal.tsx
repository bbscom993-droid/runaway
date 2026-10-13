import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Award, 
  MessageSquare, 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink,
  Users,
  ShieldAlert,
  Send,
  FileText
} from 'lucide-react';
import { SiteSettings, EditorialStaffMember, OfficialContacts } from '../../types';

interface BoxRedaksiModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings: SiteSettings;
  onOpenCyberMediaGuidelinesModal?: (tab?: 'pedoman' | 'kode_etik' | 'privasi' | 'panduan_warga' | 'syarat_ketentuan' | 'disclaimer' | 'hak_cipta') => void;
}

export const BoxRedaksiModal: React.FC<BoxRedaksiModalProps> = ({
  isOpen,
  onClose,
  siteSettings,
  onOpenCyberMediaGuidelinesModal,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const contacts: OfficialContacts = siteSettings.officialContacts || {
    hotlineWhatsapp: siteSettings.hotlinePhone || '0895626941900',
    officePhone: '0895626941900',
    editorialEmail: siteSettings.editorialEmail || 'redaksi@arunnews.id',
    advertisingEmail: 'iklan@arunnews.id',
    pressOmbudsmanEmail: 'ombudsman@arunnews.id',
    officeAddress: siteSettings.officeAddress || 'Gg gaya, pasar minggu, kec, pasar minggu, kota jakarta selatan, provinsi DKI JAKARTA, Indonesia',
    operatingHours: 'Senin - Minggu | 24 Jam Non-Stop (Layanan Redaksi 24/7)',
    pressCouncilCode: siteSettings.pressCouncilCode || 'Terdaftar Dewan Pers RI No. 892/DP/K/VIII/2026',
  };

  const staffList: EditorialStaffMember[] = siteSettings.editorialBoard && siteSettings.editorialBoard.length > 0
    ? siteSettings.editorialBoard.filter(s => s.isListedInBox)
    : [];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-sky-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-sky-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 text-white relative flex-shrink-0 border-b border-sky-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-sky-900/60 hover:bg-sky-800 text-sky-200 hover:text-white transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-yellow-400 text-sky-950 text-[11px] font-black uppercase tracking-wider rounded-lg font-mono flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-950" />
              Dewan Pers Registered
            </span>
            <span className="px-2.5 py-1 bg-sky-800/80 text-sky-200 text-[11px] font-bold rounded-lg font-mono">
              {contacts.pressCouncilCode}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-yellow-400" />
            Susunan Pengelola & Kontak Resmi ARUN NEWS
          </h2>
          <p className="text-xs text-sky-200 mt-1 max-w-2xl font-medium">
            Transparansi tata kelola penerbitan, struktur dewan redaksi, serta saluran resmi pengaduan dan kemitraan pers independen.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-8 flex-1 bg-slate-50">

          {/* Section 1: Kontak Utama & Kantor */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-sky-700" />
              <h3 className="text-sm font-black uppercase tracking-wider text-sky-950 font-mono">
                Kontak Layanan Resmi Redaksi & Kantor Pusat
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Hotline WA Card */}
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                      Hotline WA 24/7
                    </span>
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-sm font-black text-emerald-950 font-mono">
                    {contacts.hotlineWhatsapp}
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Layanan aduan masyarakat, naskah warga, & verifikasi lapangan.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-emerald-200/70 flex items-center justify-between text-xs">
                  <a 
                    href={`https://wa.me/${contacts.hotlineWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 font-mono"
                  >
                    <span>Kirim Pesan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => handleCopy(contacts.hotlineWhatsapp, 'wa')}
                    className="text-emerald-800 hover:text-emerald-950 font-mono text-[11px] flex items-center gap-1"
                  >
                    {copiedField === 'wa' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'wa' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Email Redaksi Card */}
              <div className="bg-sky-50/90 border border-sky-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-800 bg-sky-200/60 px-2 py-0.5 rounded-md">
                      Email Redaksi
                    </span>
                    <Mail className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-sm font-black text-sky-950 font-mono truncate">
                    {contacts.editorialEmail}
                  </div>
                  <p className="text-[11px] text-sky-800 mt-1">
                    Pengiriman rilis pers, surat pembaca, & naskah opini/kolom.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-sky-200/70 flex items-center justify-between text-xs">
                  <a 
                    href={`mailto:${contacts.editorialEmail}`}
                    className="font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 font-mono"
                  >
                    <span>Surat Redaksi</span>
                    <Send className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => handleCopy(contacts.editorialEmail, 'email')}
                    className="text-sky-800 hover:text-sky-950 font-mono text-[11px] flex items-center gap-1"
                  >
                    {copiedField === 'email' ? <Check className="w-3 h-3 text-sky-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'email' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Ombudsman & Iklan Card */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md">
                      Ombudsman & Hak Jawab
                    </span>
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xs font-bold text-amber-950 font-mono truncate">
                    {contacts.pressOmbudsmanEmail}
                  </div>
                  <div className="text-[11px] text-amber-900 mt-1">
                    Iklan: <span className="font-mono font-bold">{contacts.advertisingEmail}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-amber-200/70 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-amber-800 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {contacts.operatingHours}
                  </span>
                </div>
              </div>

            </div>

            {/* Address Banner */}
            <div className="mt-3 bg-white p-3.5 rounded-2xl border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-mono font-bold text-sky-950 uppercase tracking-wider block">
                    Alamat Lengkap Gedung Redaksi:
                  </span>
                  <p className="text-xs text-slate-700 font-medium">
                    {contacts.officeAddress}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(contacts.officeAddress, 'address')}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 font-mono font-bold text-xs rounded-xl border border-sky-200 flex items-center gap-1.5 transition-colors self-end sm:self-center flex-shrink-0"
              >
                {copiedField === 'address' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-sky-600" />}
                <span>{copiedField === 'address' ? 'Alamat Tersalin' : 'Salin Alamat'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Susunan Pengelola Redaksi (Editorial Staff Board) */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-700" />
                <h3 className="text-sm font-black uppercase tracking-wider text-sky-950 font-mono">
                  Susunan Pengelola Redaksi & Jajaran Jurnalis
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-bold">
                {staffList.length} Personel Terdaftar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((staff) => (
                <div 
                  key={staff.id} 
                  className="bg-white rounded-2xl p-4 border border-sky-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header profile */}
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={staff.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                        alt={staff.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-200 group-hover:border-yellow-400 transition-colors flex-shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-md inline-block mb-1 truncate max-w-full">
                          {staff.position}
                        </span>
                        <h4 className="text-xs font-black text-sky-950 line-clamp-1 leading-snug">
                          {staff.name}
                        </h4>
                        {staff.pressCardNo && (
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                            <Award className="w-3 h-3 text-sky-600" />
                            {staff.pressCardNo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {staff.bio && (
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-3 line-clamp-2">
                        {staff.bio}
                      </p>
                    )}
                  </div>

                  {/* Footer Action Links */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-bold text-sky-800">
                    <a 
                      href={`https://wa.me/${staff.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-emerald-600 flex items-center gap-1 text-emerald-700"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>{staff.phone}</span>
                    </a>
                    <a 
                      href={`mailto:${staff.email}`}
                      className="hover:text-sky-950 text-slate-500 truncate max-w-[120px]"
                      title={staff.email}
                    >
                      {staff.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Maklumat & Etika Jurnalistik */}
          <div className="p-4 rounded-2xl bg-sky-900 text-sky-100 text-xs space-y-3 border border-sky-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-yellow-400 font-bold font-mono uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Maklumat Kode Etik Jurnalistik ARUN NEWS</span>
              </div>
              {onOpenCyberMediaGuidelinesModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCyberMediaGuidelinesModal('kode_etik');
                  }}
                  className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-mono font-black text-[10px] rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span>Baca Kode Etik Jurnalistik</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-sky-200 leading-relaxed">
              Seluruh pers dan koresponden resmi ARUN NEWS dibekali Kartu Tanda Anggota (KTA) resmi dan Surat Tugas yang masih berlaku. Wartawan ARUN NEWS <strong>DILARANG KERAS</strong> menerima imbalan, amplop, atau fasilitas dari pihak terliput yang dapat mempengaruhi independensi berita. Apabila ada pihak yang mengatasnamakan redaksi ARUN NEWS dan meminta imbalan, mohon segera laporkan ke Hotline Ombudsman Pers di <strong className="text-white font-mono">{contacts.pressOmbudsmanEmail}</strong>.
            </p>
          </div>

        </div>

        {/* Footer Button */}
        <div className="p-4 bg-white border-t border-sky-200 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] font-mono text-slate-500">
            © 2026 ARUN NEWS • Sistem Manajemen Redaksi Resmi
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-white font-mono font-bold text-xs rounded-xl transition-colors"
          >
            Tutup Halaman Box Redaksi
          </button>
        </div>

      </div>

    </div>
  );
};
