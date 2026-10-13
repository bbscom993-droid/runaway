import React, { useState } from 'react';
import { 
  Radio, 
  Share2, 
  Save, 
  RefreshCw, 
  Sparkles, 
  MessageCircle, 
  Send, 
  Globe, 
  Check, 
  AlertCircle, 
  Sliders, 
  ExternalLink,
  Code2
} from 'lucide-react';
import { SiteSettings, SocialAutoShareSettings, NewsArticle } from '../../types';
import { 
  DEFAULT_SOCIAL_AUTO_SHARE_SETTINGS, 
  formatSocialShareMessage, 
  dispatchSocialWebhook 
} from '../../utils/socialAutoShareEngine';

interface SocialAutoShareSettingsViewProps {
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  showToast: (msg: string) => void;
  sampleArticle?: NewsArticle;
}

export const SocialAutoShareSettingsView: React.FC<SocialAutoShareSettingsViewProps> = ({
  siteSettings,
  setSiteSettings,
  showToast,
  sampleArticle,
}) => {
  const currentSettings: SocialAutoShareSettings = 
    siteSettings.socialAutoShareSettings || DEFAULT_SOCIAL_AUTO_SHARE_SETTINGS;

  const [formData, setFormData] = useState<SocialAutoShareSettings>(currentSettings);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleToggleChannel = (channel: keyof SocialAutoShareSettings['channels']) => {
    setFormData((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }));
  };

  const handleSave = () => {
    setSiteSettings((prev) => {
      const updated = {
        ...prev,
        socialAutoShareSettings: formData,
      };
      try {
        localStorage.setItem('wartakini_site_settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast('⚙️ Pengaturan Siaran Otomatis Media Sosial berhasil disimpan!');
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_SOCIAL_AUTO_SHARE_SETTINGS);
    showToast('Pengaturan direset ke default redaksi.');
  };

  const handleTestWebhook = async () => {
    if (!formData.channelConfigs?.webhookUrl) {
      showToast('⚠️ Silakan isi URL Webhook terlebih dahulu');
      return;
    }
    setIsTestingWebhook(true);
    setTestResult(null);

    const testArt: NewsArticle = sampleArticle || {
      id: 'test-article-1',
      title: 'Uji Coba Siaran Real-Time Media Sosial Arun News',
      slug: 'uji-coba-siaran-real-time',
      excerpt: 'Laporan pengujian integrasi otomatisasi broadcast berita ke jaringan media sosial dan webhook.',
      content: 'Pengujian integrasi otomatisasi warta berjalan sukses.',
      paragraphs: ['Pengujian integrasi otomatisasi warta berjalan sukses.'],
      category: 'nasional',
      categoryLabel: 'Nasional & Politik',
      publishedAt: 'Hari Ini',
      readTime: '2 menit',
      imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
      views: 120,
      likes: 15,
      shares: 8,
      tags: ['UjiCoba', 'ArunNews', 'Redaksi'],
      comments: [],
    };

    const res = await dispatchSocialWebhook(testArt, {
      webhookUrl: formData.channelConfigs.webhookUrl,
      secret: formData.channelConfigs.webhookSecret,
    });
    setIsTestingWebhook(false);
    setTestResult(res.message);
    if (res.success) {
      showToast('✅ Webhook pengujian berhasil terkirim!');
    } else {
      showToast('❌ Webhook gagal terkirim');
    }
  };

  const previewArticle: NewsArticle = sampleArticle || {
    id: 'demo-preview',
    title: 'Pemerintah Resmikan Kawasan Ekonomi Digital Terpadu Nusantara',
    slug: 'pemerintah-resmikan-kawasan-ekonomi-digital',
    excerpt: 'Inisiatif strategis percepatan transformasi digital nasional guna memperkuat ekosistem riset dan keterbukaan informasi publik.',
    content: '',
    paragraphs: [],
    category: 'teknologi',
    categoryLabel: 'Teknologi & Informasi',
    publishedAt: 'Hari Ini',
    readTime: '3 menit',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    views: 450,
    likes: 32,
    shares: 12,
    tags: ['EkonomiDigital', 'Nusantara', 'Teknologi'],
    comments: [],
  };

  const previewMessage = formatSocialShareMessage(previewArticle, formData);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl border border-sky-800 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-xs flex-shrink-0">
              <Radio className="w-6 h-6 text-sky-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-yellow-400 text-sky-950 font-black text-[10px] px-2.5 py-0.5 rounded font-mono uppercase tracking-wider shadow-2xs">
                  Modul Sindikasi Otomatis
                </span>
                <span className="text-xs text-sky-300 font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  Auto-Share Real-Time
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight font-sans text-white">
                Pengaturan Siaran Otomatis Media Sosial
              </h2>
              <p className="text-xs text-sky-200 mt-0.5">
                Otomatisasi pengiriman warta baru ke WhatsApp, Telegram, X (Twitter), Facebook, dan Webhook API saat artikel diterbitkan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs rounded-xl border border-yellow-500 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Toggles & Channel Selection */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section: Master Switch */}
          <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase font-mono tracking-wider text-sky-950 flex items-center gap-2 border-b border-sky-100 pb-2.5">
              <Sliders className="w-4 h-4 text-yellow-500" />
              Kontrol Utama Siaran
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-sky-50 border border-sky-200 cursor-pointer hover:bg-sky-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-sky-900 rounded"
                />
                <div>
                  <span className="font-bold text-sky-950 text-xs block">
                    Aktifkan Integrasi Siaran Otomatis Media Sosial
                  </span>
                  <span className="text-[11px] text-slate-600 block leading-relaxed mt-0.5">
                    Jika aktif, setiap warta yang diterbitkan akan mengaktifkan proses sindikasi instan ke saluran media sosial yang dipilih.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.autoOpenDispatcherOnPublish}
                  onChange={(e) => setFormData({ ...formData, autoOpenDispatcherOnPublish: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-sky-900 rounded"
                />
                <div>
                  <span className="font-bold text-sky-950 text-xs block">
                    Buka Otomatis Dialog Dispatcher Saat Artikel Terbit
                  </span>
                  <span className="text-[11px] text-slate-600 block leading-relaxed mt-0.5">
                    Menampilkan jendela pop-up 1-Klik Siaran langsung setelah menekan tombol 'Terbitkan Berita'.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section: Active Channels */}
          <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase font-mono tracking-wider text-sky-950 flex items-center gap-2 border-b border-sky-100 pb-2.5">
              <Share2 className="w-4 h-4 text-yellow-500" />
              Saluran Siaran Aktif (Active Channels)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp */}
              <label className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                formData.channels.whatsapp ? 'bg-emerald-50 border-emerald-400 font-bold' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-sky-950 block">WhatsApp Saluran / Komunitas</span>
                    <span className="text-[10px] text-emerald-800 font-mono font-normal">Format pesan cetak tebal &amp; tautan</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.channels.whatsapp}
                  onChange={() => handleToggleChannel('whatsapp')}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              {/* Telegram */}
              <label className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                formData.channels.telegram ? 'bg-sky-50 border-sky-400 font-bold' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-sky-950 block">Telegram Channel / Bot</span>
                    <span className="text-[10px] text-sky-800 font-mono font-normal">Broadcast otomatis saluran</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.channels.telegram}
                  onChange={() => handleToggleChannel('telegram')}
                  className="w-4 h-4 accent-sky-600 rounded"
                />
              </label>

              {/* X / Twitter */}
              <label className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                formData.channels.twitter ? 'bg-slate-100 border-slate-400 font-bold' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
                    <span className="font-mono text-xs">𝕏</span>
                  </div>
                  <div>
                    <span className="text-xs text-sky-950 block">X (Twitter)</span>
                    <span className="text-[10px] text-slate-600 font-mono font-normal">Tweet kilas warta 280 karakter</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.channels.twitter}
                  onChange={() => handleToggleChannel('twitter')}
                  className="w-4 h-4 accent-slate-900 rounded"
                />
              </label>

              {/* Facebook */}
              <label className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                formData.channels.facebook ? 'bg-blue-50 border-blue-400 font-bold' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    f
                  </div>
                  <div>
                    <span className="text-xs text-sky-950 block">Facebook Page &amp; Grup</span>
                    <span className="text-[10px] text-blue-800 font-mono font-normal">Kutipan &amp; OpenGraph link</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.channels.facebook}
                  onChange={() => handleToggleChannel('facebook')}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              {/* LinkedIn */}
              <label className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                formData.channels.linkedin ? 'bg-indigo-50 border-indigo-400 font-bold' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-xs">
                    in
                  </div>
                  <div>
                    <span className="text-xs text-sky-950 block">LinkedIn Post</span>
                    <span className="text-[10px] text-indigo-800 font-mono font-normal">Jaringan jurnalisme profesional</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.channels.linkedin}
                  onChange={() => handleToggleChannel('linkedin')}
                  className="w-4 h-4 accent-indigo-700 rounded"
                />
              </label>

              {/* Webhook API */}
              <label className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                formData.channels.webhook ? 'bg-amber-50 border-amber-400 font-bold' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-sky-950 block">Webhook API / Zapier</span>
                    <span className="text-[10px] text-amber-900 font-mono font-normal">Sistem bot otomatis / Make / n8n</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.channels.webhook}
                  onChange={() => handleToggleChannel('webhook')}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Section: Channel Credentials & Configuration */}
          <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase font-mono tracking-wider text-sky-950 flex items-center gap-2 border-b border-sky-100 pb-2.5">
              <Code2 className="w-4 h-4 text-yellow-500" />
              Konfigurasi Saluran Eksternal (API &amp; Webhook)
            </h3>

            <div className="space-y-4 text-xs">
              {/* Telegram Channel & Bot */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="font-bold text-sky-950 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-600" />
                  <span>Telegram Broadcast Channel &amp; Bot API</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-600 mb-1">
                      ID Channel / Username:
                    </label>
                    <input
                      type="text"
                      value={formData.channelConfigs?.telegramChannelId || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        channelConfigs: { ...formData.channelConfigs, telegramChannelId: e.target.value }
                      })}
                      placeholder="@arunnews_official"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 font-mono text-sky-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-600 mb-1">
                      Bot Token (Opsional, untuk auto-broadcast):
                    </label>
                    <input
                      type="password"
                      value={formData.channelConfigs?.telegramBotToken || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        channelConfigs: { ...formData.channelConfigs, telegramBotToken: e.target.value }
                      })}
                      placeholder="123456789:ABCDefghijk..."
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 font-mono text-sky-950"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Jika Bot Token dikosongkan, sistem akan menggunakan tautan buka langsung ke aplikasi Telegram.
                </p>
              </div>

              {/* Webhook API */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                <div className="font-bold text-sky-950 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-600" />
                    <span>Webhook Endpoint URL (Zapier / Make / n8n / Discord)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={isTestingWebhook}
                    className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-mono text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {isTestingWebhook ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Uji Webhook</span>}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-600 mb-1">
                      URL Endpoint POST:
                    </label>
                    <input
                      type="url"
                      value={formData.channelConfigs?.webhookUrl || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        channelConfigs: { ...formData.channelConfigs, webhookUrl: e.target.value }
                      })}
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 font-mono text-sky-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-600 mb-1">
                      Kunci Rahasia (Header X-Arun-Secret):
                    </label>
                    <input
                      type="password"
                      value={formData.channelConfigs?.webhookSecret || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        channelConfigs: { ...formData.channelConfigs, webhookSecret: e.target.value }
                      })}
                      placeholder="Secret-Token-123"
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 font-mono text-sky-950"
                    />
                  </div>
                </div>
                {testResult && (
                  <div className="p-2 rounded bg-white border border-amber-300 text-[11px] font-mono text-sky-950 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{testResult}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Template Customization & Live Preview */}
        <div className="space-y-5">
          {/* Template Editor */}
          <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase font-mono tracking-wider text-sky-950 flex items-center gap-2 border-b border-sky-100 pb-2">
              <span>Format Template Naskah</span>
            </h3>

            <div className="space-y-2 text-xs">
              <label className="block text-[11px] font-mono text-slate-600">
                Pola Pesan Siaran:
              </label>
              <textarea
                rows={6}
                value={formData.customTemplate || DEFAULT_SOCIAL_AUTO_SHARE_SETTINGS.customTemplate}
                onChange={(e) => setFormData({ ...formData, customTemplate: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono text-sky-950 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-500">
                <span className="font-bold">Tag Tersedia:</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-900 font-bold">{"{title}"}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-900 font-bold">{"{excerpt}"}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-900 font-bold">{"{url}"}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-900 font-bold">{"{category}"}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-900 font-bold">{"{tags}"}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer font-bold text-sky-950">
                <input
                  type="checkbox"
                  checked={formData.includeTags}
                  onChange={(e) => setFormData({ ...formData, includeTags: e.target.checked })}
                  className="w-3.5 h-3.5 accent-sky-900"
                />
                <span>Sertakan Tagar Berita (#Tagar)</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer font-bold text-sky-950">
                <input
                  type="checkbox"
                  checked={formData.includeExcerpt}
                  onChange={(e) => setFormData({ ...formData, includeExcerpt: e.target.checked })}
                  className="w-3.5 h-3.5 accent-sky-900"
                />
                <span>Sertakan Ringkasan Singkat (Lead)</span>
              </label>
            </div>
          </div>

          {/* Live Output Preview */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white shadow-md space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                Pratinjau Hasil Siaran:
              </span>
              <span>{previewMessage.length} karakter</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed border border-slate-800 select-all max-h-56 overflow-y-auto">
              {previewMessage}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Teks di atas adalah contoh pesan yang otomatis tersaji saat warta berhasil diterbitkan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs rounded-xl border border-yellow-500 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
              title="Reset ke pengaturan default"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
