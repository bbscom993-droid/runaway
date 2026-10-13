import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Save, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Upload, 
  Camera, 
  Copy, 
  Check, 
  RefreshCw, 
  DollarSign, 
  MousePointerClick, 
  BarChart3, 
  Code, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  X, 
  HelpCircle,
  Link as LinkIcon,
  Tag,
  Building,
  Calendar,
  Layers,
  Info,
  Download,
  FileText
} from 'lucide-react';
import { AdSlot, SEMSettings, SiteSettings } from '../../types';
import { DEFAULT_AD_SLOTS, DEFAULT_SEM_SETTINGS, buildUtmUrl } from '../../utils/semEngine';
import { AdClicksBarChart } from './AdClicksBarChart';
import { generateAdPerformancePdf } from '../../utils/adPerformancePdfGenerator';

interface AdManagementViewProps {
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  showToast: (msg: string) => void;
}

export const AdManagementView: React.FC<AdManagementViewProps> = ({
  siteSettings,
  setSiteSettings,
  showToast,
}) => {
  const semSettings: SEMSettings = siteSettings.semSettings || DEFAULT_SEM_SETTINGS;
  const adSlots: AdSlot[] = semSettings.adSlots || DEFAULT_AD_SLOTS;

  // Active modal state for Add / Edit Slot
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [previewSlot, setPreviewSlot] = useState<AdSlot | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      generateAdPerformancePdf({
        adSlots,
        siteSettings,
        generatedBy: 'Meja Redaksi & Divisi Komersial',
      });
      showToast('✅ Laporan performa iklan PDF berhasil diunduh!');
    } catch (err) {
      console.error('Gagal mengunduh laporan PDF:', err);
      showToast('❌ Terjadi kesalahan saat membuat file PDF.');
    } finally {
      setTimeout(() => setIsExportingPdf(false), 800);
    }
  };

  // Form State
  const [formData, setFormData] = useState<AdSlot>({
    id: '',
    name: '',
    position: 'top_billboard',
    isEnabled: true,
    type: 'custom_banner',
    advertiserName: '',
    title: '',
    subtitle: '',
    bannerImage: '',
    targetUrl: '',
    ctaText: 'Hubungi Redaksi',
    priceRate: 'Rp 2.500.000 / bln',
    dimensions: '1200 x 200 px',
    badgeText: 'Mitra Resmi',
    htmlScript: '',
    impressions: 0,
    clicks: 0,
  });

  // UTM Generator helper state
  const [utmBaseUrl, setUtmBaseUrl] = useState('https://example.com/promo');
  const [utmSource, setUtmSource] = useState('arunnews');
  const [utmMedium, setUtmMedium] = useState('banner');
  const [utmCampaign, setUtmCampaign] = useState('kemitraan_2026');
  const [generatedUtm, setGeneratedUtm] = useState('');

  // Update semSettings helper
  const updateSemSettings = (partial: Partial<SEMSettings>) => {
    const updated: SEMSettings = {
      ...semSettings,
      ...partial,
    };
    setSiteSettings({
      ...siteSettings,
      semSettings: updated,
    });
    showToast('Pengaturan iklan redaksi berhasil diperbarui.');
  };

  // Toggle single slot
  const handleToggleSlot = (slotId: string, enabled: boolean) => {
    const updatedSlots = adSlots.map((s) => 
      s.id === slotId ? { ...s, isEnabled: enabled } : s
    );
    updateSemSettings({ adSlots: updatedSlots });
    showToast(`Slot "${adSlots.find(s => s.id === slotId)?.name}" ${enabled ? 'Diaktifkan' : 'Dinonaktifkan'}.`);
  };

  // Open modal for new slot
  const handleOpenAdd = () => {
    setEditingSlotId(null);
    setFormData({
      id: `slot-${Date.now()}`,
      name: 'Slot Iklan Baru',
      position: 'in_article',
      isEnabled: true,
      type: 'custom_banner',
      advertiserName: 'Mitra Sponsor Baru',
      title: 'Solusi Terbaik untuk Bisnis Anda',
      subtitle: 'Tingkatkan jangkauan produk Anda dengan promosi terpercaya di Arun News.',
      bannerImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
      targetUrl: 'https://example.com/promo?utm_source=arunnews',
      ctaText: 'Pelajari Selengkapnya',
      priceRate: 'Rp 2.000.000 / bln',
      dimensions: '728 x 90 px',
      badgeText: 'Iklan Sponsor',
      htmlScript: '',
      impressions: 1200,
      clicks: 45,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing slot
  const handleOpenEdit = (slot: AdSlot) => {
    setEditingSlotId(slot.id);
    setFormData({ ...slot });
    setIsModalOpen(true);
  };

  // Delete slot
  const handleDeleteSlot = (slotId: string, slotName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus slot iklan "${slotName}"?`)) {
      const updatedSlots = adSlots.filter((s) => s.id !== slotId);
      updateSemSettings({ adSlots: updatedSlots });
      showToast(`Slot iklan "${slotName}" telah dihapus.`);
    }
  };

  // Save slot
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('❌ Nama slot iklan tidak boleh kosong.');
      return;
    }

    let updatedSlots: AdSlot[];
    if (editingSlotId) {
      updatedSlots = adSlots.map((s) => s.id === editingSlotId ? formData : s);
    } else {
      updatedSlots = [...adSlots, formData];
    }

    updateSemSettings({ adSlots: updatedSlots });
    setIsModalOpen(false);
    showToast(`✅ Slot iklan "${formData.name}" berhasil disimpan!`);
  };

  // Reset counters for a slot
  const handleResetCounter = (slotId: string) => {
    if (confirm('Reset jumlah impresi dan klik slot ini ke 0?')) {
      const updatedSlots = adSlots.map((s) => 
        s.id === slotId ? { ...s, impressions: 0, clicks: 0 } : s
      );
      updateSemSettings({ adSlots: updatedSlots });
      showToast('Counter impresi & klik slot berhasil di-reset.');
    }
  };

  // Live simulation of ad click
  const handleSimulateClick = (slotId: string) => {
    const targetSlot = adSlots.find((s) => s.id === slotId);
    const updatedSlots = adSlots.map((s) => 
      s.id === slotId ? { ...s, clicks: (s.clicks || 0) + 1 } : s
    );
    updateSemSettings({ adSlots: updatedSlots });
    showToast(`🎯 +1 Klik pengunjung tercatat pada slot "${targetSlot?.name || slotId}"!`);
  };

  // Preset image banners
  const PRESET_BANNERS = [
    {
      title: 'Fintech & Perbankan',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      brand: 'Bank Digital Nusantara',
    },
    {
      title: 'Kendaraan Listrik & Otomotif',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
      brand: 'Ekosistem Mobil Listrik Nasional',
    },
    {
      title: 'Wisata Bahari & Travel',
      image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=600&q=80',
      brand: 'Pesona Bahari Nusantara',
    },
    {
      title: 'Edukasi & Teknologi',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      brand: 'Platform Belajar Sains Modern',
    },
    {
      title: 'Bisnis & Properti Hijau',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      brand: 'Perumahan Ramah Lingkungan',
    },
  ];

  // Calculate overall metrics
  const totalSlots = adSlots.length;
  const activeSlots = adSlots.filter((s) => s.isEnabled).length;
  const totalImpressions = adSlots.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
  const totalClicks = adSlots.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* 1. HEADER & MASTER AD TOGGLE                             */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 text-white rounded-3xl p-5 sm:p-6 border-2 border-yellow-400/80 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-lg flex-shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black font-mono tracking-tight text-white uppercase">
                  Pengaturan Iklan, Sponsor & Monetisasi Portal
                </h2>
                <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded-full font-mono uppercase">
                  Redaksi Komersial
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-200 mt-0.5 font-medium max-w-3xl">
                Kelola slot banner header, sisipan naskah berita, sidebar sticky, pelacak kampanye digital (SEM/UTM), dan kode Google AdSense dalam satu dasbor terpadu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2.5 bg-sky-900/90 hover:bg-sky-800 text-yellow-300 border border-yellow-400/40 text-xs font-black font-mono rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Unduh laporan lengkap performa klik dan estimasi pendapatan dalam format PDF"
            >
              <Download className={`w-4 h-4 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Mengunduh PDF...' : 'Unduh Laporan PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 text-xs font-black font-mono rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Slot Iklan</span>
            </button>
          </div>
        </div>

        {/* Master Switch Bar */}
        <div className="p-3.5 bg-sky-900/90 rounded-2xl border border-sky-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${semSettings.enableAdPlacements ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
            <div>
              <span className="font-bold text-white block">
                Saklar Utama Penempatan Iklan (Master Switch)
              </span>
              <span className="text-[11px] text-sky-300">
                {semSettings.enableAdPlacements 
                  ? 'Iklan dan banner komersial sedang aktif tayang di portal publik.' 
                  : 'Seluruh penempatan iklan disembunyikan dari portal publik.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-yellow-300 font-bold">
              {activeSlots} dari {totalSlots} Slot Aktif
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={semSettings.enableAdPlacements}
                onChange={(e) => {
                  updateSemSettings({ enableAdPlacements: e.target.checked });
                  // Also sync module toggle
                  setSiteSettings((prev) => ({
                    ...prev,
                    moduleToggles: {
                      ...prev.moduleToggles,
                      enableSeoSem: e.target.checked,
                    }
                  }));
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
            </label>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. METRICS & OVERVIEW STATS                               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-sky-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase">Total Slot Iklan</span>
            <Layers className="w-4 h-4 text-sky-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-950 font-mono">
            {totalSlots} <span className="text-xs text-emerald-600 font-sans font-bold">({activeSlots} Live)</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Posisi Header, Artikel & Sidebar</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-sky-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase">Total Impresi Tayang</span>
            <Eye className="w-4 h-4 text-sky-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-950 font-mono">
            {totalImpressions.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-500 block">Akumulasi tayangan pembaca</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-sky-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase">Klik Terverifikasi</span>
            <MousePointerClick className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-950 font-mono">
            {totalClicks.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-500 block">Interaksi menuju situs mitra</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-sky-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase">Rata-Rata CTR</span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
            {avgCtr}%
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">Tingkat efektivitas tinggi</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2.5 REAL-TIME AD CLICKS BAR CHART VISUALIZATION           */}
      {/* ========================================================= */}
      <AdClicksBarChart
        adSlots={adSlots}
        siteSettings={siteSettings}
        onSimulateClick={handleSimulateClick}
      />

      {/* ========================================================= */}
      {/* 3. DAFTAR SLOT IKLAN (AD SLOTS LIST)                      */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-sky-950 font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-800" />
              <span>Daftar Slot Penempatan Iklan Aktif</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Atur status aktif, materi gambar banner, link tujuan mitra, dan tarif sewa pada masing-masing posisi portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 bg-sky-950 hover:bg-sky-900 text-yellow-300 text-xs font-mono font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Slot</span>
            </button>
          </div>
        </div>

        {/* Slot Grid / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adSlots.map((slot) => {
            const positionBadge = {
              top_billboard: { label: 'Header Permanen Leaderboard (1200x200 / 970x90)', color: 'bg-amber-100 text-amber-950 border-amber-300 font-bold' },
              in_article: { label: 'Sisipan Berita / Inline (728x90)', color: 'bg-amber-100 text-amber-900 border-amber-200' },
              sidebar_sticky: { label: 'Sidebar Sticky (300x250/600)', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' },
              bottom_sticky: { label: 'Bottom Anchor Mobile (728x90)', color: 'bg-purple-100 text-purple-900 border-purple-200' },
            }[slot.position] || { label: slot.position, color: 'bg-slate-100 text-slate-800 border-slate-200' };

            const typeBadge = {
              custom_banner: 'Banner Gambar',
              advertorial: 'Advertorial Sponsor',
              google_ads: 'Google AdSense / Script',
            }[slot.type] || slot.type;

            const ctr = slot.impressions && slot.impressions > 0 
              ? (((slot.clicks || 0) / slot.impressions) * 100).toFixed(2) 
              : '0.00';

            return (
              <div 
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all duration-200 space-y-3 ${
                  slot.isEnabled 
                    ? 'bg-sky-50/50 border-sky-300 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                {/* Top Badge & Switch */}
                <div className="flex items-center justify-between gap-2 border-b border-sky-100/80 pb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${positionBadge.color}`}>
                      {positionBadge.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold">
                      {typeBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-black ${slot.isEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {slot.isEnabled ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot.isEnabled}
                        onChange={(e) => handleToggleSlot(slot.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Banner Thumbnail & Info */}
                <div className="flex items-start gap-3">
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 border border-sky-200 flex-shrink-0 group">
                    <img
                      src={slot.bannerImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80'}
                      alt={slot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewSlot(slot)}
                      className="absolute inset-0 bg-sky-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-mono font-bold transition-opacity"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Intip
                    </button>
                  </div>

                  <div className="min-w-0 flex-1 text-xs">
                    <h4 className="font-bold text-sky-950 truncate text-sm">
                      {slot.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      Mitra: <strong className="text-sky-900">{slot.advertiserName || 'Sponsor Redaksi'}</strong>
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-1">
                      <span className="text-yellow-800 font-bold bg-yellow-100 px-1.5 py-0.2 rounded">
                        {slot.priceRate || 'Rp 2.500.000 / bln'}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[120px] text-sky-700" title={slot.targetUrl}>
                        {slot.targetUrl ? new URL(slot.targetUrl.startsWith('http') ? slot.targetUrl : `https://${slot.targetUrl}`).hostname : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="p-2 bg-white rounded-xl border border-sky-100 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">
                      👁️ <strong className="text-sky-950">{(slot.impressions || 0).toLocaleString('id-ID')}</strong> imp
                    </span>
                    <span className="text-slate-600">
                      🖱️ <strong className="text-sky-950">{(slot.clicks || 0).toLocaleString('id-ID')}</strong> klik
                    </span>
                    <span className="text-emerald-700 font-bold">
                      CTR: {ctr}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResetCounter(slot.id)}
                    className="text-[10px] text-slate-400 hover:text-red-600 transition-colors"
                    title="Reset statistik klik & impresi"
                  >
                    Reset
                  </button>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-sky-100 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setPreviewSlot(slot)}
                    className="text-sky-700 hover:text-sky-950 font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau Banner</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(slot)}
                      className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Slot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id, slot.name)}
                      className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg flex items-center gap-1 transition-colors"
                      title="Hapus slot iklan ini"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. KONTAK KOMERSIAL & RATE CARD PUBLICITY                 */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-sky-900" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-sky-950 font-mono">
                Identitas Kontak Pemasangan Iklan & Layanan Komersial
              </h3>
              <p className="text-xs text-slate-500">
                Kontak yang ditampilkan kepada calon pengiklan saat mengeklik &quot;Pasang Iklan&quot; atau membuka modal tarif.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
            Divisi Iklan Redaksi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
              Email Resmi Pemasangan Iklan:
            </label>
            <input
              type="email"
              value={siteSettings.officialContacts?.advertisingEmail || 'iklan@arunnews.id'}
              onChange={(e) => {
                const updatedContacts = {
                  ...(siteSettings.officialContacts || {
                    hotlineWhatsapp: siteSettings.hotlinePhone || '+62 895-6269-41900',
                    officePhone: '(021) 555-0826',
                    editorialEmail: siteSettings.editorialEmail,
                    advertisingEmail: e.target.value,
                    pressOmbudsmanEmail: 'ombudsman@arunnews.id',
                    officeAddress: siteSettings.officeAddress,
                    operatingHours: 'Senin - Jumat 09:00 - 18:00 WIB',
                    pressCouncilCode: siteSettings.pressCouncilCode,
                  }),
                  advertisingEmail: e.target.value,
                };
                setSiteSettings({ ...siteSettings, officialContacts: updatedContacts });
              }}
              className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono font-bold focus:ring-2 focus:ring-sky-400"
              placeholder="iklan@arunnews.id"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
              WhatsApp Hotline Divisi Iklan:
            </label>
            <input
              type="text"
              value={siteSettings.officialContacts?.hotlineWhatsapp || siteSettings.hotlinePhone || '0895-6269-41900'}
              onChange={(e) => {
                const updatedContacts = {
                  ...(siteSettings.officialContacts || {
                    hotlineWhatsapp: e.target.value,
                    officePhone: '(021) 555-0826',
                    editorialEmail: siteSettings.editorialEmail,
                    advertisingEmail: 'iklan@arunnews.id',
                    pressOmbudsmanEmail: 'ombudsman@arunnews.id',
                    officeAddress: siteSettings.officeAddress,
                    operatingHours: 'Senin - Jumat 09:00 - 18:00 WIB',
                    pressCouncilCode: siteSettings.pressCouncilCode,
                  }),
                  hotlineWhatsapp: e.target.value,
                };
                setSiteSettings({ ...siteSettings, officialContacts: updatedContacts });
              }}
              className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono font-bold focus:ring-2 focus:ring-sky-400"
              placeholder="0895-6269-41900"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
              Jam Layanan Komersial:
            </label>
            <input
              type="text"
              value={siteSettings.officialContacts?.operatingHours || 'Senin - Jumat 09:00 - 18:00 WIB'}
              onChange={(e) => {
                const updatedContacts = {
                  ...(siteSettings.officialContacts || {
                    hotlineWhatsapp: siteSettings.hotlinePhone || '+62 895-6269-41900',
                    officePhone: '(021) 555-0826',
                    editorialEmail: siteSettings.editorialEmail,
                    advertisingEmail: 'iklan@arunnews.id',
                    pressOmbudsmanEmail: 'ombudsman@arunnews.id',
                    officeAddress: siteSettings.officeAddress,
                    operatingHours: e.target.value,
                    pressCouncilCode: siteSettings.pressCouncilCode,
                  }),
                  operatingHours: e.target.value,
                };
                setSiteSettings({ ...siteSettings, officialContacts: updatedContacts });
              }}
              className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-medium focus:ring-2 focus:ring-sky-400"
              placeholder="Senin - Jumat 09:00 - 18:00 WIB"
            />
          </div>
        </div>

        {/* Public Rent Button & Transparency Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-sky-950 block">Tampilkan Tombol Publik &quot;Sewa Slot Ini&quot;</span>
              <span className="text-[11px] text-slate-500">Memberi akses pembaca atau calon pengiklan untuk memesan slot</span>
            </div>
            <input
              type="checkbox"
              checked={semSettings.allowPublicRentButton !== false}
              onChange={(e) => updateSemSettings({ allowPublicRentButton: e.target.checked })}
              className="rounded text-yellow-500 focus:ring-yellow-400 w-4 h-4"
            />
          </div>

          <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-sky-950 block">Label Transparansi Dewan Pers (Sponsored Content)</span>
              <span className="text-[11px] text-slate-500">Mencantumkan disclosure resmi berita advertorial & iklan berbayar</span>
            </div>
            <input
              type="checkbox"
              checked={semSettings.showAdTransparencyNotice !== false}
              onChange={(e) => updateSemSettings({ showAdTransparencyNotice: e.target.checked })}
              className="rounded text-yellow-500 focus:ring-yellow-400 w-4 h-4"
            />
          </div>
        </div>

        {/* Save Button for Contacts */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              showToast('✅ Pengaturan Kontak & Komersial Iklan berhasil disimpan!');
            }}
            className="w-full py-2.5 px-4 bg-sky-950 hover:bg-sky-900 text-yellow-300 font-black text-xs uppercase font-mono tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Informasi Kontak Divisi Iklan</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. INTEGRASI GOOGLE ADSENSE & SCRIPT PELACAK SEM          */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-900" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-sky-950 font-mono">
                Integrasi Script Google AdSense, GTM, GA4 & Pixel Iklan
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan jaringan periklanan otomatis Google AdSense serta kode pelacak konversi digital.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md">
            SEM & Analytics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
              Google AdSense Publisher ID (ca-pub):
            </label>
            <input
              type="text"
              value={semSettings.adSensePublisherId || 'ca-pub-8921740928192039'}
              onChange={(e) => updateSemSettings({ adSensePublisherId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sky-950 font-mono font-bold"
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
              Google Ads Conversion ID:
            </label>
            <input
              type="text"
              value={semSettings.googleAdsConversionId}
              onChange={(e) => updateSemSettings({ googleAdsConversionId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sky-950 font-mono font-bold"
              placeholder="AW-892174092"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
              Google Tag Manager (GTM ID):
            </label>
            <input
              type="text"
              value={semSettings.gtmId}
              onChange={(e) => updateSemSettings({ gtmId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sky-950 font-mono font-bold"
              placeholder="GTM-ARUN92X"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
              GA4 Measurement ID (Google Analytics 4):
            </label>
            <input
              type="text"
              value={semSettings.ga4MeasurementId}
              onChange={(e) => updateSemSettings({ ga4MeasurementId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sky-950 font-mono font-bold"
              placeholder="G-ARUN2026NEWS"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
              Meta Pixel ID (Facebook Ads):
            </label>
            <input
              type="text"
              value={semSettings.metaPixelId}
              onChange={(e) => updateSemSettings({ metaPixelId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sky-950 font-mono font-bold"
              placeholder="PIXEL-4019284019"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
              TikTok Pixel ID:
            </label>
            <input
              type="text"
              value={semSettings.tiktokPixelId}
              onChange={(e) => updateSemSettings({ tiktokPixelId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sky-950 font-mono font-bold"
              placeholder="TT-ARUNMEDIA99"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              showToast('✅ Konfigurasi Google AdSense & Pixel Digital berhasil disimpan!');
            }}
            className="w-full py-2.5 px-4 bg-indigo-950 hover:bg-indigo-900 text-yellow-300 font-black text-xs uppercase font-mono tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Konfigurasi AdSense & Pixel Pelacak</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. ALAT BANTU PEMBUAT TAUTAN UTM (CAMPAIGN URL BUILDER)   */}
      {/* ========================================================= */}
      <div className="bg-sky-50 rounded-3xl p-5 sm:p-6 border border-sky-200 space-y-4">
        <div className="flex items-center gap-2 border-b border-sky-200 pb-2">
          <LinkIcon className="w-4 h-4 text-sky-800" />
          <h3 className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono">
            Alat Bantu Generator Tautan Promosi Berpelacak (UTM Campaign Builder)
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Buat tautan sponsor dengan parameter UTM agar pengiklan dapat mengukur performa klik dan konversi di Google Analytics mereka secara akurat.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Target Landing Page URL:</label>
            <input
              type="url"
              value={utmBaseUrl}
              onChange={(e) => setUtmBaseUrl(e.target.value)}
              className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-mono text-xs"
              placeholder="https://mitra-anda.com/promo"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">UTM Source:</label>
            <input
              type="text"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-mono text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">UTM Medium:</label>
            <input
              type="text"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              const res = buildUtmUrl(utmBaseUrl, utmSource, utmMedium, utmCampaign);
              setGeneratedUtm(res);
              navigator.clipboard.writeText(res);
              setCopiedUrl(true);
              setTimeout(() => setCopiedUrl(false), 2000);
              showToast('Tautan UTM berhasil digenerate dan disalin ke clipboard!');
            }}
            className="w-full sm:w-auto px-4 py-2 bg-sky-950 text-yellow-300 font-black text-xs font-mono rounded-xl hover:bg-sky-900 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Tersalin!' : 'Generate & Salin Link UTM'}</span>
          </button>

          {generatedUtm && (
            <div className="flex-1 w-full p-2 bg-white rounded-xl border border-sky-200 text-[11px] font-mono text-sky-950 truncate">
              {generatedUtm}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: TAMBAH / EDIT SLOT IKLAN                          */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-sky-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-sky-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-950 to-sky-900 text-white flex items-center justify-between border-b border-sky-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-black uppercase tracking-wider font-mono">
                  {editingSlotId ? 'Edit Detail Slot Iklan' : 'Tambah Slot Iklan Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-sky-800 text-sky-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSlot} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs text-slate-800">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Nama Slot Iklan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 font-bold text-sky-950 focus:ring-2 focus:ring-sky-400"
                    placeholder="cth: Header Billboard Utama"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Posisi Tata Letak Slot
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => {
                      const pos = e.target.value as AdSlot['position'];
                      const dims = {
                        top_billboard: '1200 x 200 px',
                        in_article: '728 x 90 px',
                        sidebar_sticky: '300 x 250 px',
                        bottom_sticky: '728 x 90 px',
                      }[pos] || '728 x 90 px';
                      setFormData({ ...formData, position: pos, dimensions: dims });
                    }}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 font-bold text-sky-950 focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="top_billboard">Header Top Billboard (1200x200 / 970x90)</option>
                    <option value="in_article">In-Article / Sisipan Berita (728x90 / 300x250)</option>
                    <option value="sidebar_sticky">Sidebar Sticky Banner (300x250 / 300x600)</option>
                    <option value="bottom_sticky">Bottom Anchor Mobile (728x90)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Tipe Materi Iklan
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AdSlot['type'] })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 font-bold text-sky-950 focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="custom_banner">Banner Gambar Kustom (Direct Sponsor)</option>
                    <option value="advertorial">Advertorial / Konten Berita Berbayar</option>
                    <option value="google_ads">Google AdSense / Kode Script HTML</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Nama Mitra / Brand Pengiklan
                  </label>
                  <input
                    type="text"
                    value={formData.advertiserName}
                    onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 font-bold text-sky-950 focus:ring-2 focus:ring-sky-400"
                    placeholder="cth: Bank Digital Nusantara"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Judul Promosi Banner
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 focus:ring-2 focus:ring-sky-400"
                    placeholder="cth: Solusi Finansial Pintar Generasi Muda"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Teks Tombol CTA
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText || 'Hubungi Redaksi'}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 focus:ring-2 focus:ring-sky-400"
                    placeholder="cth: Hubungi Redaksi, Buka Tabungan, Hubungi Kami"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                  Deskripsi Singkat Promosi
                </label>
                <textarea
                  rows={2}
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 focus:ring-2 focus:ring-sky-400"
                  placeholder="Jelaskan penawaran utama atau nilai tambah produk sponsor..."
                />
              </div>

              {/* Banner Image URL + Local Upload */}
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 space-y-2">
                <label className="text-[11px] font-mono font-bold text-sky-950 block">
                  Gambar Banner Iklan (URL atau Unggah Lokal)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <img
                    src={formData.bannerImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80'}
                    alt="Preview"
                    className="w-20 h-14 rounded-xl object-cover border border-sky-300 flex-shrink-0"
                  />
                  <div className="flex-1 w-full space-y-1.5">
                    <input
                      type="url"
                      value={formData.bannerImage}
                      onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                      placeholder="https://images.unsplash.com/... atau URL banner"
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-[11px] font-mono text-sky-950"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-950 hover:bg-sky-900 text-yellow-300 rounded-xl text-[11px] font-mono font-bold transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Unggah Gambar Banner dari Komputer Lokal</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setFormData({ ...formData, bannerImage: evt.target.result as string });
                                showToast('Gambar banner lokal berhasil diunggah!');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Preset Banner Quick Selection */}
                <div className="pt-1 border-t border-sky-200/80">
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">
                    Pilih Cepat Contoh Banner:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BANNERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            bannerImage: preset.image,
                            advertiserName: preset.brand,
                          });
                        }}
                        className="px-2 py-0.5 rounded-lg bg-white border border-sky-200 text-sky-900 hover:bg-sky-100 text-[10px] font-mono transition-colors"
                      >
                        {preset.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target URL */}
              <div>
                <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                  Target Link Tautan URL Mitra
                </label>
                <input
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono focus:ring-2 focus:ring-sky-400"
                  placeholder="https://mitra-sponsor.com/promo?utm_source=arunnews"
                />
              </div>

              {/* Tarif & Dimensi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Tarif Sewa / Kontrak
                  </label>
                  <input
                    type="text"
                    value={formData.priceRate || 'Rp 2.500.000 / bln'}
                    onChange={(e) => setFormData({ ...formData, priceRate: e.target.value })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono font-bold"
                    placeholder="Rp 2.500.000 / bln"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Dimensi Rekomendasi
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions || '1200 x 200 px'}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono"
                    placeholder="cth: 1200 x 200 px, 728 x 90 px"
                  />
                </div>
              </div>

              {/* If Google AdSense or HTML Script */}
              {formData.type === 'google_ads' && (
                <div>
                  <label className="text-[11px] font-mono font-bold text-indigo-950 block mb-1">
                    Kode Script HTML / Tag Embed AdSense
                  </label>
                  <textarea
                    rows={3}
                    value={formData.htmlScript || ''}
                    onChange={(e) => setFormData({ ...formData, htmlScript: e.target.value })}
                    className="w-full p-2 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl border border-slate-700"
                    placeholder={'<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-..." data-ad-slot="..." data-ad-format="auto"></ins>'}
                  />
                </div>
              )}

              {/* Status Toggle in Modal */}
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sky-950 block">Aktifkan Tayangan Slot Ini</span>
                  <span className="text-[11px] text-slate-500">Iklan langsung tampil pada posisi terpilih di situs portal</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="rounded text-yellow-500 focus:ring-yellow-400 w-4 h-4"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black font-mono uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Slot Iklan</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PRATINJAU TAMPILAN BANNER IKLAN                   */}
      {/* ========================================================= */}
      {previewSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-sky-950/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-sky-200 overflow-hidden my-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-sky-900" />
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-sky-950">
                  Pratinjau Banner Iklan: {previewSlot.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSlot(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Live Preview Box */}
            <div className="rounded-2xl overflow-hidden border border-sky-300 shadow-md bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 text-white">
              <div className="bg-sky-900/90 text-sky-200 text-[10px] font-mono px-3 py-1.5 border-b border-sky-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                  <span className="font-bold uppercase tracking-wider">{previewSlot.badgeText || 'Iklan Sponsor Resmi'}</span>
                  <span className="bg-yellow-400/20 text-yellow-300 px-1.5 py-0.2 rounded border border-yellow-400/30 text-[9px]">
                    {previewSlot.dimensions || '1200 x 200 px'}
                  </span>
                </div>
                <span className="text-yellow-400 font-bold">{previewSlot.priceRate || 'Rp 2.500.000 / bln'}</span>
              </div>

              <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={previewSlot.bannerImage}
                    alt={previewSlot.advertiserName}
                    className="w-20 h-14 sm:w-28 sm:h-20 rounded-xl object-cover border border-sky-700 shadow-sm flex-shrink-0"
                  />
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-400/10 text-yellow-300 text-[10px] font-mono font-bold border border-yellow-400/20 mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{previewSlot.advertiserName}</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white font-mono">
                      {previewSlot.title || previewSlot.name}
                    </h4>
                    <p className="text-xs text-sky-200 max-w-md line-clamp-2 mt-0.5">
                      {previewSlot.subtitle || 'Dapatkan penawaran terbaik dan informasi produk langsung dari mitra terpercaya kami.'}
                    </p>
                  </div>
                </div>

                <a
                  href={previewSlot.targetUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs font-mono uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                >
                  <span>{previewSlot.ctaText || 'Hubungi Redaksi'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewSlot(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
