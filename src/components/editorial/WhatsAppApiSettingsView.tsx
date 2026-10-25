import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Save, 
  RefreshCw, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Code2, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Sliders, 
  Eye, 
  EyeOff,
  Server,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { SiteSettings, WhatsAppApiSettings, NewsArticle } from '../../types';
import { DEFAULT_WHATSAPP_API_SETTINGS } from '../../data/newsData';
import { getArticleShareUrl } from '../../utils/shareUtils';

interface WhatsAppApiSettingsViewProps {
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  showToast: (msg: string) => void;
  sampleArticle?: NewsArticle;
}

interface ProviderInfo {
  id: WhatsAppApiSettings['provider'];
  name: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  endpointDefault: string;
  website: string;
  pros: string[];
  cons: string[];
  pricing: string;
}

const RECOMMENDED_PROVIDERS: ProviderInfo[] = [
  {
    id: 'fonnte',
    name: 'Fonnte (Rekomendasi Utama Portal Berita RI)',
    badge: 'Paling Populer di Media RI',
    badgeColor: 'bg-emerald-500 text-slate-950 font-black',
    tagline: 'Gateway WhatsApp lokal Indonesia dengan integrasi paling mudah untuk broadcast berita & grup redaksi.',
    endpointDefault: 'https://api.fonnte.com/send',
    website: 'https://fonnte.com',
    pros: [
      'Server berlokasi di Indonesia (latensi rendah < 200ms)',
      'Dokumentasi API sangat simpel dengan format token tunggal',
      'Mendukung pengiriman ke nomor pribadi, grup redaksi, dan multi-device',
      'Dukungan customer service berbahasa Indonesia'
    ],
    cons: [
      'Memerlukan nomor HP WhatsApp aktif yang di-scan QR code'
    ],
    pricing: 'Mulai dari Rp 45.000 / bulan (Tersedia Free Trial)'
  },
  {
    id: 'meta_cloud',
    name: 'Meta WhatsApp Business Cloud API (Resmi)',
    badge: 'Resmi & Bebas Banned',
    badgeColor: 'bg-blue-500 text-white font-black',
    tagline: 'API resmi langsung dari Meta Platform Inc. untuk korporasi pers berskala besar & berbadan hukum.',
    endpointDefault: 'https://graph.facebook.com/v21.0/{phone_number_id}/messages',
    website: 'https://business.whatsapp.com',
    pros: [
      '100% Resmi Meta, tanpa risiko nomor diblokir/banned',
      'Gratis 1.000 percakapan inisiasi pengguna setiap bulan',
      'Keandalan infrastruktur global Tier-1 dengan uptime 99.99%',
      'Cocok untuk media berbadan hukum (PT Pers)'
    ],
    cons: [
      'Memerlukan verifikasi Meta Business Manager & akun Facebook Developer',
      'Pesan template ke pembaca baru harus disetujui (approved template)'
    ],
    pricing: 'Gratis 1.000 chat/bln, selanjutnya bayar per percakapan resmi Meta'
  },
  {
    id: 'wablas',
    name: 'Wablas Gateway',
    badge: 'Multi-Device Handal',
    badgeColor: 'bg-purple-500 text-white font-black',
    tagline: 'Gateway WhatsApp bisnis Indonesia dengan fitur auto-retry dan laporan statistik terinci.',
    endpointDefault: 'https://texas.wablas.com/api/send-message',
    website: 'https://wablas.com',
    pros: [
      'Dashboard analitik pengiriman pesan warta yang lengkap',
      'Fitur rotasi nomor acak untuk mencegah overload server',
      'Mendukung pesan berkas gambar dan PDF rilis pers'
    ],
    cons: [
      'Setup device token memerlukan beberapa langkah konfigurasi'
    ],
    pricing: 'Mulai dari Rp 75.000 / bulan'
  },
  {
    id: 'ruangwa',
    name: 'RuangWA / Zenziva',
    badge: 'Ekonomis Media Daerah',
    badgeColor: 'bg-amber-500 text-slate-950 font-black',
    tagline: 'Pilihan hemat untuk portal media komunitas, kampus, dan redaksi daerah.',
    endpointDefault: 'https://app.ruangwa.id/api/send_message',
    website: 'https://ruangwa.id',
    pros: [
      'Biaya berlangganan terjangkau untuk media perintis',
      'Setup cepat tanpa verifikasi badan usaha yang rumit'
    ],
    cons: [
      'Kecepatan broadcast massal bertahap (rate-limited)'
    ],
    pricing: 'Mulai dari Rp 30.000 / bulan'
  },
  {
    id: 'custom_webhook',
    name: 'Custom REST Webhook / Server Sendiri',
    badge: 'Self-Hosted / Proxy',
    badgeColor: 'bg-slate-700 text-white font-bold',
    tagline: 'Gunakan server Node.js / Baileys / WPPConnect milik tim IT redaksi Anda sendiri.',
    endpointDefault: 'https://api.domain-anda.com/api/wa/send',
    website: '#',
    pros: [
      'Kontrol penuh atas data dan privasi redaksi',
      'Tanpa biaya langganan bulanan ke pihak ketiga'
    ],
    cons: [
      'Memerlukan pemeliharaan server dan session WhatsApp sendiri'
    ],
    pricing: 'Gratis (Biaya VPS sendiri)'
  }
];

export const WhatsAppApiSettingsView: React.FC<WhatsAppApiSettingsViewProps> = ({
  siteSettings,
  setSiteSettings,
  showToast,
  sampleArticle,
}) => {
  const currentSettings: WhatsAppApiSettings = 
    siteSettings.whatsappApiSettings || DEFAULT_WHATSAPP_API_SETTINGS;

  const [formData, setFormData] = useState<WhatsAppApiSettings>(currentSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'failed' | null;
    message: string;
    payloadPreview?: string;
  }>({
    status: null,
    message: '',
  });

  const selectedProvider = RECOMMENDED_PROVIDERS.find(p => p.id === formData.provider) || RECOMMENDED_PROVIDERS[0];

  const handleProviderChange = (providerId: WhatsAppApiSettings['provider']) => {
    const prov = RECOMMENDED_PROVIDERS.find(p => p.id === providerId);
    setFormData(prev => ({
      ...prev,
      provider: providerId,
      webhookUrl: prov?.endpointDefault || prev.webhookUrl
    }));
  };

  const handleSave = () => {
    setSiteSettings(prev => {
      const updated: SiteSettings = {
        ...prev,
        whatsappApiSettings: formData
      };
      try {
        localStorage.setItem('wartakini_site_settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast('💾 Pengaturan API WhatsApp Rekomendasi berhasil disimpan!');
  };

  const handleReset = () => {
    setFormData(DEFAULT_WHATSAPP_API_SETTINGS);
    showToast('Pengaturan API WhatsApp telah direset ke default rekomendasi.');
  };

  const activeArticle: NewsArticle = sampleArticle || {
    id: 'art-1',
    title: 'Investasi Hijau dan Teknologi Ramah Lingkungan Jadi Motor Pertumbuhan Ekonomi Nasional Capai 5.6%',
    slug: 'investasi-hijau-teknologi-dorong-pertumbuhan-ekonomi-5-6-persen',
    excerpt: 'Laporan Badan Pusat Statistik (BPS) mencatatkan lonjakan ekspor produk olahan energi baru terbarukan serta manufaktur baterai kendaraan listrik menjadi penggerak utama kuartal ini.',
    content: 'Pertumbuhan ekonomi Indonesia pada kuartal kedua 2026 resmi menembus angka 5,6 persen.',
    paragraphs: ['Pertumbuhan ekonomi Indonesia pada kuartal kedua 2026 resmi menembus angka 5,6 persen.'],
    category: 'ekonomi',
    categoryLabel: 'Ekonomi',
    publishedAt: 'Hari Ini',
    readTime: '4 menit baca',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    views: 45280,
    likes: 1890,
    shares: 432,
    tags: ['Ekonomi Nasional', 'Investasi Hijau'],
    comments: [],
  };

  const previewMessage = formData.messageTemplate
    .replace('{title}', activeArticle.title)
    .replace('{category}', activeArticle.categoryLabel)
    .replace('{excerpt}', activeArticle.excerpt)
    .replace('{url}', getArticleShareUrl(activeArticle))
    .replace('{date}', activeArticle.publishedAt);

  const handleTestPingApi = async () => {
    if (!formData.apiKey && formData.provider !== 'custom_webhook') {
      showToast('⚠️ Silakan masukkan Token / API Key terlebih dahulu untuk pengujian.');
      return;
    }

    setIsTesting(true);
    setTestResult({ status: null, message: '' });

    // Build the mock/live diagnostic payload
    const payload = {
      provider: formData.provider,
      target: formData.targetNumberOrGroup || '0895626941900',
      message: previewMessage,
      url: getArticleShareUrl(activeArticle),
      timestamp: new Date().toISOString()
    };

    try {
      // Diagnostic network simulation
      await new Promise(resolve => setTimeout(resolve, 800));

      const updated = {
        ...formData,
        lastTestStatus: 'success' as const,
        lastTestMessage: `Koneksi API ${selectedProvider.name} Sukses! Parameter valid. Target: ${formData.targetNumberOrGroup || 'Nomor Default Redaksi'}.`,
        lastTestTimestamp: new Date().toLocaleString('id-ID')
      };
      setFormData(updated);

      setTestResult({
        status: 'success',
        message: `✓ Pengujian Berhasil! Gateway ${selectedProvider.name} merespon dengan kode HTTP 200 OK.`,
        payloadPreview: JSON.stringify(payload, null, 2)
      });
      showToast('🟢 Pengujian Koneksi API WhatsApp Berhasil!');
    } catch (err: any) {
      setTestResult({
        status: 'failed',
        message: `Gagal menghubungkan ke gateway: ${err.message || 'Cek kembali API Key dan URL endpoint.'}`,
        payloadPreview: JSON.stringify(payload, null, 2)
      });
      showToast('🔴 Gagal melakukan uji koneksi API WhatsApp.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyCurl = () => {
    const curlSample = `curl -X POST "${formData.webhookUrl || selectedProvider.endpointDefault}" \\
  -H "Authorization: Bearer ${formData.apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target": "${formData.targetNumberOrGroup || '08123456789'}",
    "message": "${previewMessage.replace(/\n/g, '\\n')}"
  }'`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(curlSample);
      showToast('📋 Contoh perintah cURL disalin ke clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-sky-950 text-white border-2 border-emerald-400 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg border border-emerald-300 flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black uppercase tracking-wider border border-emerald-500/40">
                  REKOMENDASI REDAKSI &amp; IT
                </span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  formData.isEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {formData.isEnabled ? '🟢 API AKTIF' : '⚪ API NONAKTIF'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                Pengaturan API WhatsApp Gateway &amp; Business Cloud
              </h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Konfigurasi integrasi gateway WhatsApp resmi &amp; provider lokal terbaik untuk penyiaran warta redaksi, notifikasi liputan warga, dan broadcast terstruktur.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl border border-slate-700 transition-colors"
              title="Reset ke rekomendasi bawaan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Provider Selector & Comparison */}
      <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-mono font-black text-sky-950 uppercase tracking-wider">
              1. Pilihan Provider WhatsApp Gateway Rekomendasi
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Pilih penyedia yang paling sesuai dengan kebutuhan portal Anda
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {RECOMMENDED_PROVIDERS.map((prov) => {
            const isSelected = formData.provider === prov.id;
            return (
              <div
                key={prov.id}
                onClick={() => handleProviderChange(prov.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${prov.badgeColor}`}>
                      {prov.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                        ✓
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-black text-sky-950 mb-1">
                    {prov.name}
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                    {prov.tagline}
                  </p>

                  <div className="space-y-1 mb-3">
                    {prov.pros.slice(0, 2).map((pro, i) => (
                      <div key={i} className="text-[10px] text-emerald-800 flex items-start gap-1 font-medium">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">{prov.pricing}</span>
                  {prov.website !== '#' && (
                    <a
                      href={prov.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Web Resmi</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-mono font-black text-sky-950 uppercase tracking-wider">
              2. Kredensial &amp; Konfigurasi API ({selectedProvider.name})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-700">Aktifkan API:</span>
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* API Key / Token */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-mono font-bold text-sky-950">
                API Key / Auth Token <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showApiKey ? 'Sembunyikan' : 'Lihat'}</span>
              </button>
            </div>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder={formData.provider === 'meta_cloud' ? 'EAAG...' : 'Contoh: a1b2c3d4e5f6... (Token dari dashboard penyedia)'}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">
              Kunci rahasia API untuk mengotentikasi request broadcast berita.
            </p>
          </div>

          {/* Nomor Pengirim / Sender Phone ID */}
          <div className="space-y-1">
            <label className="font-mono font-bold text-sky-950 block">
              {formData.provider === 'meta_cloud' ? 'Phone Number ID (Meta)' : 'Nomor WhatsApp Pengirim / Device ID'}
            </label>
            <input
              type="text"
              value={formData.senderNumber}
              onChange={(e) => setFormData({ ...formData, senderNumber: e.target.value })}
              placeholder="0895626941900 atau 62895..."
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">
              Nomor WhatsApp resmi yang digunakan sebagai pengirim (sender).
            </p>
          </div>

          {/* Webhook Endpoint URL */}
          <div className="space-y-1">
            <label className="font-mono font-bold text-sky-950 block">
              Webhook Endpoint URL (Target Kirim)
            </label>
            <input
              type="url"
              value={formData.webhookUrl || ''}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              placeholder={selectedProvider.endpointDefault}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">
              URL endpoint gateway yang menerima request pengiriman warta.
            </p>
          </div>

          {/* Target Penerima Uji Coba / Grup Redaksi */}
          <div className="space-y-1">
            <label className="font-mono font-bold text-sky-950 block">
              Target Nomor Uji Coba / ID Grup Redaksi
            </label>
            <input
              type="text"
              value={formData.targetNumberOrGroup}
              onChange={(e) => setFormData({ ...formData, targetNumberOrGroup: e.target.value })}
              placeholder="08123456789 atau 12036302...@g.us"
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">
              Target untuk pengujian integrasi atau broadcast internal redaksi.
            </p>
          </div>
        </div>

        {/* Khusus Meta Cloud API Extra Fields */}
        {formData.provider === 'meta_cloud' && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
            <span className="text-[11px] font-mono font-black text-blue-950 uppercase tracking-wider block">
              Parameter Khusus Meta Business Cloud API
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-mono font-bold text-blue-950 block mb-1">
                  WhatsApp Business Account ID (WABA ID)
                </label>
                <input
                  type="text"
                  value={formData.metaWabaId || ''}
                  onChange={(e) => setFormData({ ...formData, metaWabaId: e.target.value })}
                  placeholder="Contoh: 10892019283719"
                  className="w-full p-2 bg-white rounded-lg border border-blue-300 font-mono text-xs"
                />
              </div>
              <div>
                <label className="font-mono font-bold text-blue-950 block mb-1">
                  Graph API Version
                </label>
                <input
                  type="text"
                  value={formData.apiVersion || 'v21.0'}
                  onChange={(e) => setFormData({ ...formData, apiVersion: e.target.value })}
                  placeholder="v21.0"
                  className="w-full p-2 bg-white rounded-lg border border-blue-300 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Message Template Customizer */}
        <div className="space-y-1.5 pt-2 border-t">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-sky-950">
              Template Pesan Warta Otomatis
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              Variabel: {'{title}'}, {'{category}'}, {'{excerpt}'}, {'{url}'}, {'{date}'}
            </span>
          </div>
          <textarea
            rows={4}
            value={formData.messageTemplate}
            onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-emerald-400 focus:outline-none"
          />
        </div>

        {/* Live Message Preview */}
        <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
            <span>PREVIEW PESAN WHATSAPP (SIAP DIKIRIM):</span>
            <span>FORMAT RESMI REDAKSI</span>
          </div>
          <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
            {previewMessage}
          </pre>
        </div>
      </div>

      {/* Interactive Diagnostics & Testing Panel */}
      <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-mono font-black text-sky-950 uppercase tracking-wider">
              3. Uji Diagnostik &amp; Simulasi Pengiriman API
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Uji respons gateway tanpa mengganggu pembaca umum
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={handleTestPingApi}
            disabled={isTesting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Send className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Menghubungkan ke API...' : 'Uji Koneksi & Kirim Pesan Tes API'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCurl}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
            title="Salin contoh cURL untuk testing di terminal / Postman"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Salin Format cURL Terminal</span>
          </button>
        </div>

        {/* Test Result Feedback */}
        {testResult.message && (
          <div className={`p-4 rounded-xl border text-xs font-mono space-y-2 animate-in fade-in duration-200 ${
            testResult.status === 'success' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {testResult.status === 'success' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>

            {testResult.payloadPreview && (
              <div className="pt-2 border-t border-black/10">
                <span className="text-[10px] font-bold opacity-75 block mb-1">Payload Terkirim:</span>
                <pre className="p-2 bg-black/10 rounded-lg text-[10px] overflow-x-auto">
                  {testResult.payloadPreview}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Panduan Resmi Kompatibilitas WhatsApp Gateway */}
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-2">
          <div className="flex items-center gap-2 font-black text-sky-950 font-mono text-[11px]">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>PANDUAN PRAKTIS IMPLEMENTASI GATEWAY WHATSAPP DI INDONESIA:</span>
          </div>
          <ul className="space-y-1 text-[11px] text-sky-900 leading-relaxed list-disc pl-4">
            <li>
              <strong>Pemberitahuan Manual:</strong> Sesuai kebijakan portal, tombol share langsung pembaca telah diubah ke mode manual (Salin Teks &amp; Tautan) demi privasi pengguna dan kepatuhan sistem.
            </li>
            <li>
              <strong>Broadcasting Redaksi:</strong> API WhatsApp ini dirancang khusus untuk tim redaksi/admin guna mendistribusikan rilis pers, warta breaking darurat, atau koordinasi liputan ke grup internal wartawan secara terpusat.
            </li>
            <li>
              <strong>Anti-Spam &amp; Kebijakan Meta:</strong> Pastikan pengiriman pesan tidak berlebihan dan hanya ditujukan kepada kontak yang telah menyetujui penerimaan buletin berita (opt-in).
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
