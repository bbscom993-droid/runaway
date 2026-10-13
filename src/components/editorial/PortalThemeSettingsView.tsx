import React, { useState } from 'react';
import { 
  Palette, 
  Check, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Eye, 
  Layout, 
  Sliders, 
  Flame, 
  Bookmark, 
  Search, 
  Clock, 
  SunMedium, 
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SiteSettings, PortalThemeSettings, PortalColorThemeId } from '../../types';
import { 
  PORTAL_THEME_PRESETS, 
  DEFAULT_PORTAL_THEME, 
  applyPortalTheme, 
  getContrastTextColor,
  ThemePresetOption 
} from '../../utils/themeEngine';

interface PortalThemeSettingsViewProps {
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  showToast: (msg: string) => void;
  onBackToPublicPortal: () => void;
}

export const PortalThemeSettingsView: React.FC<PortalThemeSettingsViewProps> = ({
  siteSettings,
  setSiteSettings,
  showToast,
  onBackToPublicPortal,
}) => {
  // Current active portal theme state
  const initialTheme: PortalThemeSettings = siteSettings.portalThemeSettings || DEFAULT_PORTAL_THEME;

  const [currentTheme, setCurrentTheme] = useState<PortalThemeSettings>({
    colorTheme: initialTheme.colorTheme || 'sky_gold',
    primaryColor: initialTheme.primaryColor || '#0c4a6e',
    primaryDarkColor: initialTheme.primaryDarkColor || '#082f49',
    accentColor: initialTheme.accentColor || '#facc15',
    accentHoverColor: initialTheme.accentHoverColor || '#eab308',
    headerStyle: initialTheme.headerStyle || 'gradient_elegance',
    navbarStyle: initialTheme.navbarStyle || 'classic_bar',
    fontFamily: initialTheme.fontFamily || 'plus_jakarta',
  });

  const [syncToLogin, setSyncToLogin] = useState<boolean>(true);

  // Apply preset
  const handleSelectPreset = (preset: ThemePresetOption) => {
    const updated: PortalThemeSettings = {
      ...currentTheme,
      colorTheme: preset.id,
      primaryColor: preset.primaryColor,
      primaryDarkColor: preset.primaryDarkColor,
      accentColor: preset.accentColor,
      accentHoverColor: preset.accentHoverColor,
    };
    setCurrentTheme(updated);
    // Realtime preview injection
    applyPortalTheme(updated);
    showToast(`Pratinjau tema "${preset.name}" diaktifkan!`);
  };

  // Update specific color
  const handleColorChange = (key: keyof PortalThemeSettings, value: string) => {
    const updated: PortalThemeSettings = {
      ...currentTheme,
      colorTheme: 'custom',
      [key]: value,
    };
    setCurrentTheme(updated);
    applyPortalTheme(updated);
  };

  // Reset to default Arun News theme
  const handleResetDefault = () => {
    setCurrentTheme(DEFAULT_PORTAL_THEME);
    applyPortalTheme(DEFAULT_PORTAL_THEME);
    showToast('Tema dikembalikan ke Biru Samudra & Emas (Bawaan Arun News).');
  };

  // Save changes
  const handleSaveTheme = () => {
    const updatedSiteSettings: SiteSettings = {
      ...siteSettings,
      portalThemeSettings: currentTheme,
    };

    // Also sync to login theme if option is enabled
    if (syncToLogin) {
      updatedSiteSettings.loginThemeSettings = {
        ...(siteSettings.loginThemeSettings || {} as any),
        colorTheme: (currentTheme.colorTheme === 'crimson_gold' ? 'crimson_rose' : currentTheme.colorTheme === 'emerald_amber' ? 'emerald_amber' : currentTheme.colorTheme === 'midnight_cyan' ? 'midnight_cyan' : currentTheme.colorTheme === 'royal_purple' ? 'royal_purple' : 'custom') as any,
        customPrimaryColor: currentTheme.primaryDarkColor,
        customAccentColor: currentTheme.accentColor,
      };
    }

    setSiteSettings(updatedSiteSettings);
    localStorage.setItem('wartakini_site_settings', JSON.stringify(updatedSiteSettings));
    applyPortalTheme(currentTheme);
    showToast('✅ Pengaturan Tema & Warna Template Portal Berhasil Disimpan!');
  };

  const contrastAccentText = getContrastTextColor(currentTheme.accentColor);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-yellow-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-mono">
                Pengaturan Warna & Template Desain Portal
              </h2>
              <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                CMS Tema
              </span>
            </div>
            <p className="text-xs text-sky-200 mt-0.5 font-medium">
              Sesuaikan warna tema portal Arun News (Header, Navbar, Footer, Aksen Tombol, Badge Kategori & Ticker) secara langsung.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3 py-2 bg-sky-800/80 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-sky-600/60"
            title="Kembalikan ke warna bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5 text-yellow-300" />
            <span>Reset Bawaan</span>
          </button>

          <button
            type="button"
            onClick={onBackToPublicPortal}
            className="px-3.5 py-2 bg-sky-800 hover:bg-sky-700 active:scale-95 text-yellow-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-sky-600/80 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat di Portal Publik</span>
          </button>

          <button
            type="button"
            onClick={handleSaveTheme}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md border border-yellow-500"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Template</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. INTERACTIVE REAL-TIME LIVE PREVIEW SANDBOX                  */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-sky-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
              Pratinjau Langsung Tampilan Template (Live Mockup)
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500">
            Aktif: <strong className="text-sky-900">{currentTheme.colorTheme.toUpperCase()}</strong>
          </span>
        </div>

        {/* Live Mock Header Box */}
        <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-md">
          {/* Mock TopBar */}
          <div 
            className="px-3 py-1.5 text-[10px] flex items-center justify-between text-white font-medium transition-colors"
            style={{ backgroundColor: currentTheme.primaryDarkColor }}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentTheme.accentColor }} />
              <span className="font-mono opacity-90">Senin, 12 Oktober 2026 • 14:20 WIB</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="px-2 py-0.5 rounded text-[9px] font-bold font-mono"
                style={{ backgroundColor: currentTheme.primaryColor, color: currentTheme.accentColor }}
              >
                Jakarta 31°C Cerah
              </div>
            </div>
          </div>

          {/* Mock Main Header */}
          <div 
            className="px-4 py-2.5 flex items-center justify-between text-white transition-colors"
            style={{ 
              background: `linear-gradient(to right, ${currentTheme.primaryDarkColor}, #020617 50%, ${currentTheme.primaryColor})`,
              borderBottom: `2px solid ${currentTheme.accentColor}`
            }}
          >
            <div className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-xs"
                style={{ backgroundColor: currentTheme.accentColor, color: contrastAccentText }}
              >
                A
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-wider font-mono">
                  {siteSettings.portalName || 'ARUN NEWS'}
                </span>
                <span className="text-[9px] opacity-75 font-serif italic">
                  {siteSettings.portalTagline || 'Jembatan Informasi Nusantara'}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 max-w-xs flex-1 mx-4">
              <div className="w-full bg-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white/60 flex items-center gap-1.5 border border-white/10">
                <Search className="w-3 h-3" />
                <span>Cari berita terkini...</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div 
                className="px-2.5 py-1 rounded-lg text-[10px] font-black font-mono shadow-xs flex items-center gap-1"
                style={{ backgroundColor: currentTheme.accentColor, color: contrastAccentText }}
              >
                <Bookmark className="w-3 h-3" />
                <span>Disimpan</span>
              </div>
            </div>
          </div>

          {/* Mock Navbar */}
          <div 
            className="px-3 py-1.5 flex items-center gap-1.5 text-xs overflow-x-auto transition-colors"
            style={{ 
              background: `linear-gradient(to right, #020617, ${currentTheme.primaryDarkColor}, #020617)` 
            }}
          >
            <span 
              className="px-2.5 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 shadow-xs"
              style={{ backgroundColor: currentTheme.accentColor, color: contrastAccentText }}
            >
              <Flame className="w-2.5 h-2.5" />
              <span>Semua</span>
            </span>
            {['Politik', 'Nusantara', 'Ekonomi', 'Olahraga', 'Teknologi', 'Opini'].map((cat, idx) => (
              <span 
                key={cat} 
                className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-200 hover:text-white bg-white/5 border border-white/10"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Mock Content Snippet */}
          <div className="p-3 bg-slate-50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span 
                className="px-2 py-0.5 rounded text-[9px] font-black font-mono uppercase"
                style={{ backgroundColor: currentTheme.accentColor, color: contrastAccentText }}
              >
                Sorotan Utama
              </span>
              <span className="font-bold text-slate-800 text-[11px] truncate max-w-xs sm:max-w-md">
                Modernisasi Tata Kelola Informasi Pers Digital Nusantara di Meja Redaksi Arun News
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Pratinjau Elemen</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. PILIHAN PRESET TEMA TERKURASI (CURATED THEME PRESETS)       */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-sky-950 font-mono flex items-center gap-2">
              <Palette className="w-4 h-4 text-yellow-500" />
              <span>1. Pilih Skema Warna Siap Pakai (Curated Presets)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Klik salah satu paket warna terpadu di bawah untuk langsung mencoba tampilan baru.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PORTAL_THEME_PRESETS.map((preset) => {
            const isSelected = currentTheme.colorTheme === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/90 border-yellow-400 ring-2 ring-yellow-400 shadow-md'
                    : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-yellow-100 group-hover:text-amber-900 transition-colors">
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-black font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Aktif</span>
                      </span>
                    )}
                  </div>

                  <p className="font-black text-xs text-slate-900 leading-snug">
                    {preset.name}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {preset.desc}
                  </p>
                </div>

                {/* Color Swatches */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-5 h-5 rounded-full border border-black/20 shadow-xs" 
                      style={{ backgroundColor: preset.primaryDarkColor }}
                      title="Warna Gelap Bar / TopBar" 
                    />
                    <div 
                      className="w-5 h-5 rounded-full border border-black/20 shadow-xs" 
                      style={{ backgroundColor: preset.primaryColor }}
                      title="Warna Utama Header" 
                    />
                    <div 
                      className="w-5 h-5 rounded-full border border-black/20 shadow-xs" 
                      style={{ backgroundColor: preset.accentColor }}
                      title="Warna Aksen Tombol & Border" 
                    />
                  </div>

                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {isSelected ? 'Terpasang' : 'Terapkan'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. PEMILIH WARNA KUSTOM HEX (FINE-GRAINED CUSTOM PICKERS)      */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-sky-950 font-mono flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            <span>2. Kustomisasi Presisi Nilai Warna Hex (Custom Hex)</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Atur kode warna RGB/Hex spesifik jika Anda ingin memadukan identitas visual khusus redaksi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Primary Color */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Warna Utama Header</label>
              <div 
                className="w-5 h-5 rounded-lg border border-black/20"
                style={{ backgroundColor: currentTheme.primaryColor }}
              />
            </div>
            <p className="text-[10px] text-slate-500">Header gradasi & footer banner</p>
            <div className="flex items-center gap-2">
              <input 
                type="color"
                value={currentTheme.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <input 
                type="text"
                value={currentTheme.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase bg-white border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* 2. Primary Dark Color */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Warna Gelap Dasar</label>
              <div 
                className="w-5 h-5 rounded-lg border border-black/20"
                style={{ backgroundColor: currentTheme.primaryDarkColor }}
              />
            </div>
            <p className="text-[10px] text-slate-500">TopBar, Navbar & Footer dasar</p>
            <div className="flex items-center gap-2">
              <input 
                type="color"
                value={currentTheme.primaryDarkColor}
                onChange={(e) => handleColorChange('primaryDarkColor', e.target.value)}
                className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <input 
                type="text"
                value={currentTheme.primaryDarkColor}
                onChange={(e) => handleColorChange('primaryDarkColor', e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase bg-white border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* 3. Accent Color */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Warna Aksen Sorotan</label>
              <div 
                className="w-5 h-5 rounded-lg border border-black/20"
                style={{ backgroundColor: currentTheme.accentColor }}
              />
            </div>
            <p className="text-[10px] text-slate-500">Tombol, border garis & badge aktif</p>
            <div className="flex items-center gap-2">
              <input 
                type="color"
                value={currentTheme.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <input 
                type="text"
                value={currentTheme.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase bg-white border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* 4. Accent Hover Color */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Warna Aksen Hover</label>
              <div 
                className="w-5 h-5 rounded-lg border border-black/20"
                style={{ backgroundColor: currentTheme.accentHoverColor || '#eab308' }}
              />
            </div>
            <p className="text-[10px] text-slate-500">Sorotan kursor saat tombol disentuh</p>
            <div className="flex items-center gap-2">
              <input 
                type="color"
                value={currentTheme.accentHoverColor || '#eab308'}
                onChange={(e) => handleColorChange('accentHoverColor', e.target.value)}
                className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <input 
                type="text"
                value={currentTheme.accentHoverColor || '#eab308'}
                onChange={(e) => handleColorChange('accentHoverColor', e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase bg-white border border-slate-300 rounded-xl"
              />
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. SINKRONISASI KE HALAMAN LOGIN & SIMPAN                      */}
      {/* ============================================================== */}
      <div className="bg-sky-50 rounded-3xl p-5 sm:p-6 border border-sky-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <input 
            type="checkbox"
            id="sync-login-checkbox"
            checked={syncToLogin}
            onChange={(e) => setSyncToLogin(e.target.checked)}
            className="w-5 h-5 rounded text-sky-900 border-sky-300 focus:ring-yellow-400 mt-0.5 cursor-pointer"
          />
          <label htmlFor="sync-login-checkbox" className="cursor-pointer">
            <p className="text-xs font-black uppercase text-sky-950 font-mono">
              Sinkronkan Palet Warna ke Halaman Login Pengaturan Admin
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
              Secara otomatis perbarui skema warna halaman otentikasi login Pengaturan Admin (<code className="text-sky-900 font-mono font-bold">portalarunews.com/#/admin</code>) agar selaras dengan portal publik.
            </p>
          </label>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            type="button"
            onClick={handleSaveTheme}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 text-sm font-black rounded-2xl transition-all flex items-center gap-2 shadow-lg border-2 border-yellow-500 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan & Terapkan Perubahan Tema</span>
          </button>
        </div>
      </div>

    </div>
  );
};
