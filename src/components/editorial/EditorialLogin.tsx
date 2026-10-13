import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  Newspaper, 
  Sparkles, 
  UserCheck, 
  HelpCircle,
  ArrowLeft,
  Layout,
  Palette,
  Eye,
  Building2,
  FileText
} from 'lucide-react';
import { EditorialUser, SiteSettings } from '../../types';
import { DEFAULT_EDITORIAL_USERS } from '../../data/newsData';
import { ModernGraffitiLogo } from '../ModernGraffitiLogo';

interface EditorialLoginProps {
  siteSettings?: SiteSettings;
  onLoginSuccess: (user: EditorialUser) => void;
  onBackToPublicPortal: () => void;
}

export const EditorialLogin: React.FC<EditorialLoginProps> = ({
  siteSettings,
  onLoginSuccess,
  onBackToPublicPortal,
}) => {
  const [email, setEmail] = useState('pemred@arunnews.id');
  const [password, setPassword] = useState('redaksi123');
  const [securityPin, setSecurityPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginTheme = siteSettings?.loginThemeSettings || {
    layoutTemplate: 'classic_bento',
    colorTheme: 'sky_gold',
    fontFamily: 'plus_jakarta',
    customPrimaryColor: '#0c4a6e',
    customAccentColor: '#facc15',
    titleText: 'Masuk ke Meja Redaksi',
    subtitleText: 'Kelola seluruh rubrik, naskah berita, running ticker, jajak pendapat, dan modul portal berita Arun News dalam satu sistem terintegrasi.',
    badgeText: 'Otentikasi Staf Redaksi',
    loginButtonLabel: 'Buka Meja Redaksi',
    showQuickDemoAccounts: true,
    showDedicatedUrlNotice: true,
    backgroundPattern: 'gradient',
  };

  const adminLink = typeof window !== 'undefined' && window.location.hostname.includes('portalarunews.com')
    ? 'https://portalarunews.com/#/admin'
    : `${window.location.origin}${window.location.pathname}#/admin`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(adminLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleQuickLogin = (user: EditorialUser) => {
    setEmail(user.email);
    setPassword('redaksi123');
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        ...user,
        lastLogin: 'Baru saja masuk • Sesi Aktif',
      });
      setIsLoading(false);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      // Check Security PIN if required by admin authorization settings
      if (loginTheme.requireSecurityPin && securityPin.trim() !== (loginTheme.securityPinCode || '123456')) {
        setErrorMsg('❌ Kode PIN Otorisasi Staf salah! Periksa PIN Keamanan di Pengaturan Admin (Default: 123456).');
        setIsLoading(false);
        return;
      }

      const foundUser = DEFAULT_EDITORIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

      if (foundUser || password === 'redaksi123' || password.length >= 4) {
        const loggedUser: EditorialUser = foundUser || {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].toUpperCase(),
          email: email.trim(),
          role: 'editor',
          roleTitle: 'Redaktur Arun News',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          department: 'Meja Redaksi',
          lastLogin: 'Baru saja masuk • Sesi Aktif',
        };
        onLoginSuccess(loggedUser);
      } else {
        setErrorMsg('Email atau kata sandi tidak valid. Gunakan preset akun redaksi atau kata sandi minimal 4 karakter.');
      }
      setIsLoading(false);
    }, 500);
  };

  // Font family resolution
  const fontClass = 
    loginTheme.fontFamily === 'playfair_serif' ? 'font-serif' :
    loginTheme.fontFamily === 'jetbrains_mono' ? 'font-mono' :
    loginTheme.fontFamily === 'syne_display' ? 'font-sans font-black tracking-tight' : 'font-sans';

  // Theme styles resolution
  const getThemeStyles = () => {
    if (loginTheme.colorTheme === 'emerald_amber') {
      return {
        isCustom: false,
        bgGradient: 'from-emerald-950 via-teal-900 to-emerald-950',
        cardBg: 'bg-white text-slate-900',
        accentBtn: 'bg-amber-400 hover:bg-amber-300 text-emerald-950 border-amber-500',
        badgeBg: 'bg-amber-400 text-emerald-950',
        titleText: 'text-emerald-950',
        accentText: 'text-amber-600',
        bannerBg: 'bg-emerald-900/90 border-amber-400',
        demoBg: 'bg-emerald-50 border-emerald-200',
        headerBrandBg: 'bg-amber-400 text-emerald-950 border-amber-500',
      };
    }
    if (loginTheme.colorTheme === 'royal_purple') {
      return {
        isCustom: false,
        bgGradient: 'from-purple-950 via-purple-900 to-slate-950',
        cardBg: 'bg-white text-slate-900',
        accentBtn: 'bg-fuchsia-400 hover:bg-fuchsia-300 text-purple-950 border-fuchsia-500',
        badgeBg: 'bg-fuchsia-400 text-purple-950',
        titleText: 'text-purple-950',
        accentText: 'text-fuchsia-600',
        bannerBg: 'bg-purple-900/90 border-fuchsia-400',
        demoBg: 'bg-purple-50 border-purple-200',
        headerBrandBg: 'bg-fuchsia-400 text-purple-950 border-fuchsia-500',
      };
    }
    if (loginTheme.colorTheme === 'midnight_cyan') {
      return {
        isCustom: false,
        bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
        cardBg: 'bg-white text-slate-900',
        accentBtn: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 border-cyan-500',
        badgeBg: 'bg-cyan-400 text-slate-950',
        titleText: 'text-slate-950',
        accentText: 'text-cyan-600',
        bannerBg: 'bg-slate-900/90 border-cyan-400',
        demoBg: 'bg-cyan-50 border-cyan-200',
        headerBrandBg: 'bg-cyan-400 text-slate-950 border-cyan-500',
      };
    }
    if (loginTheme.colorTheme === 'crimson_rose') {
      return {
        isCustom: false,
        bgGradient: 'from-rose-950 via-rose-900 to-slate-950',
        cardBg: 'bg-white text-slate-900',
        accentBtn: 'bg-rose-400 hover:bg-rose-300 text-rose-950 border-rose-500',
        badgeBg: 'bg-rose-400 text-rose-950',
        titleText: 'text-rose-950',
        accentText: 'text-rose-600',
        bannerBg: 'bg-rose-900/90 border-rose-400',
        demoBg: 'bg-rose-50 border-rose-200',
        headerBrandBg: 'bg-rose-400 text-rose-950 border-rose-500',
      };
    }
    if (loginTheme.colorTheme === 'custom' && loginTheme.customPrimaryColor && loginTheme.customAccentColor) {
      return {
        isCustom: true,
        primaryHex: loginTheme.customPrimaryColor,
        accentHex: loginTheme.customAccentColor,
        bgGradient: '',
        cardBg: 'bg-white text-slate-900',
        accentBtn: '',
        badgeBg: '',
        titleText: 'text-slate-900',
        accentText: 'text-amber-600',
        bannerBg: 'bg-slate-900/90 border-amber-400',
        demoBg: 'bg-slate-50 border-slate-200',
        headerBrandBg: '',
      };
    }
    // Default: sky_gold
    return {
      isCustom: false,
      bgGradient: 'from-sky-950 via-sky-900 to-sky-950',
      cardBg: 'bg-white text-slate-900',
      accentBtn: 'bg-yellow-400 hover:bg-yellow-300 text-sky-950 border-yellow-500',
      badgeBg: 'bg-yellow-400 text-sky-950',
      titleText: 'text-sky-950',
      accentText: 'text-yellow-600',
      bannerBg: 'bg-sky-900/90 border-yellow-400',
      demoBg: 'bg-sky-50 border-sky-200',
      headerBrandBg: 'bg-yellow-400 text-sky-950 border-yellow-500',
    };
  };

  const themeStyle = getThemeStyles();

  // Background pattern inline / class
  const getContainerBgStyle = () => {
    if (loginTheme.customBgImageUrl) {
      return {
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url(${loginTheme.customBgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (themeStyle.isCustom && themeStyle.primaryHex) {
      return {
        backgroundColor: themeStyle.primaryHex,
      };
    }
    return {};
  };

  // Common Reusable LoginForm Component
  const renderLoginForm = (compact = false) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className={`w-5 h-5 ${themeStyle.accentText}`} />
        <span className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
          {loginTheme.badgeText || 'Otentikasi Staf Redaksi'}
        </span>
      </div>
      <h1 className={`text-2xl sm:text-3xl font-black tracking-tight mb-2 ${themeStyle.titleText} ${fontClass}`}>
        {loginTheme.titleText || 'Masuk ke Meja Redaksi'}
      </h1>
      <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
        {loginTheme.subtitleText || 'Kelola seluruh rubrik, naskah berita, running ticker, jajak pendapat, dan modul portal berita Arun News.'}
      </p>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-black uppercase tracking-wider text-slate-900 text-[11px] mb-1.5 font-mono">
            Email Redaksi
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@arunnews.id"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-slate-900 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-black uppercase tracking-wider text-slate-900 text-[11px] font-mono">
              Kata Sandi
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              Default: redaksi123
            </span>
          </div>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-slate-900 text-xs sm:text-sm font-mono"
            />
          </div>
        </div>

        {/* Optional Security PIN Otorisasi Redaksi */}
        {loginTheme.requireSecurityPin && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <label className="block font-black uppercase tracking-wider text-amber-950 text-[11px] font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>PIN Keamanan Otorisasi Redaksi *</span>
              </label>
              <span className="text-[10px] font-mono text-amber-700">Wajib Otorisasi</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-amber-600" />
              <input
                type="password"
                required
                maxLength={6}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                placeholder="Masukkan 6 Digit PIN (Default: 123456)"
                className="w-full pl-10 pr-3.5 py-2 bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-amber-950 text-xs font-mono"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-yellow-500 focus:ring-yellow-400 border-slate-300"
            />
            <span className="text-xs text-slate-700 font-medium">Ingat sesi redaksi di peramban ini</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={themeStyle.isCustom ? { backgroundColor: themeStyle.accentHex, color: '#0f172a' } : {}}
          className={`w-full py-3 px-4 font-black text-xs uppercase tracking-wider rounded-xl shadow-md border transition-all flex items-center justify-center gap-2 mt-4 ${
            themeStyle.isCustom ? '' : themeStyle.accentBtn
          }`}
        >
          <span>{isLoading ? 'Memverifikasi Akses...' : (loginTheme.loginButtonLabel || 'Buka Meja Redaksi')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );

  // Common Reusable Demo Accounts List
  const renderDemoAccountsList = () => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className={`w-4 h-4 ${themeStyle.accentText}`} />
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 font-mono">
          Akses Cepat Demo Redaksi (1-Klik)
        </span>
      </div>
      <p className="text-xs text-slate-600 mb-4 font-medium">
        Pilih profil peran di bawah untuk login instan:
      </p>

      <div className="space-y-2.5">
        {DEFAULT_EDITORIAL_USERS.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => handleQuickLogin(user)}
            className="w-full text-left p-3 rounded-xl bg-white hover:bg-yellow-50 border border-slate-200 hover:border-yellow-400 transition-all group shadow-2xs flex items-center gap-3"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-black text-slate-900 truncate">
                  {user.name}
                </h4>
                <span 
                  style={themeStyle.isCustom ? { backgroundColor: themeStyle.accentHex, color: '#0f172a' } : {}}
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase ${
                    themeStyle.isCustom ? '' : themeStyle.badgeBg
                  }`}
                >
                  {user.role === 'pemred' ? 'Pemred' : user.role === 'redaktur_pelaksana' ? 'Redpel' : 'Visual'}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium truncate">
                {user.roleTitle}
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                {user.email}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div 
      style={getContainerBgStyle()}
      className={`min-h-screen flex flex-col justify-between text-white p-4 sm:p-6 lg:p-8 selection:bg-yellow-400 selection:text-slate-950 ${
        !loginTheme.customBgImageUrl && !themeStyle.isCustom ? `bg-gradient-to-br ${themeStyle.bgGradient}` : ''
      } ${fontClass}`}
    >
      
      {/* Top Header Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4 py-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {loginTheme.customLogoUrl ? (
            <img src={loginTheme.customLogoUrl} alt="Logo" className="h-10 object-contain rounded-lg" />
          ) : (
            <div 
              style={themeStyle.isCustom ? { backgroundColor: themeStyle.accentHex, color: '#0f172a' } : {}}
              className={`font-black px-3 py-1 text-xl sm:text-2xl tracking-tighter rounded-xl shadow-xs border flex items-center justify-center ${
                themeStyle.isCustom ? 'border-amber-500 text-slate-950' : themeStyle.headerBrandBg
              }`}
            >
              ARUN
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white">
                {siteSettings?.portalName || 'NEWS'}
              </span>
              <span 
                style={themeStyle.isCustom ? { backgroundColor: themeStyle.accentHex, color: '#0f172a' } : {}}
                className={`text-[10px] font-black px-1.5 py-0.2 rounded font-mono uppercase tracking-wider ${
                  themeStyle.isCustom ? '' : themeStyle.badgeBg
                }`}
              >
                CMS Redaksi
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">
              Portal Manajemen Konten & Modul Berita
            </span>
          </div>
        </div>

        {/* Back to Public Portal Link */}
        <button
          onClick={onBackToPublicPortal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-yellow-400 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kunjungi Portal Publik</span>
          <span className="sm:hidden">Portal Publik</span>
        </button>
      </div>

      {/* Main Container Area */}
      <div className="max-w-5xl w-full mx-auto my-6">
        
        {/* Dedicated URL Link Notice Banner (optional) */}
        {loginTheme.showDedicatedUrlNotice !== false && (
          <div className={`rounded-2xl p-4 sm:p-5 border-2 shadow-2xl mb-6 backdrop-blur-md ${themeStyle.bannerBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div 
                  style={themeStyle.isCustom ? { backgroundColor: themeStyle.accentHex, color: '#0f172a' } : {}}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black flex-shrink-0 shadow-xs ${
                    themeStyle.isCustom ? '' : themeStyle.badgeBg
                  }`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-yellow-300 uppercase tracking-wider font-mono">
                      Tautan Khusus Pengaturan Admin
                    </span>
                    <span className="bg-slate-800 text-slate-200 text-[10px] px-2 py-0.2 rounded-full font-mono">
                      portalarunews.com/#/admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5 font-medium">
                    Akses langsung halaman pengaturan admin portal ini kapan saja melalui tautan resmi di bawah:
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700 w-full sm:w-auto">
                <code className="text-[11px] text-yellow-300 font-mono truncate flex-1 sm:max-w-xs font-bold">
                  {adminLink}
                </code>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={themeStyle.isCustom ? { backgroundColor: themeStyle.accentHex, color: '#0f172a' } : {}}
                  className={`flex items-center gap-1 px-2.5 py-1 font-bold text-[11px] rounded-lg transition-all flex-shrink-0 ${
                    themeStyle.isCustom ? '' : themeStyle.badgeBg
                  }`}
                  title="Salin tautan"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 1: CLASSIC BENTO GRID ==================== */}
        {loginTheme.layoutTemplate === 'classic_bento' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden">
            <div className={loginTheme.showQuickDemoAccounts !== false ? "lg:col-span-7 flex flex-col justify-between" : "lg:col-span-12"}>
              {renderLoginForm()}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Keamanan Standar Dewan Pers RI</span>
                <span>Enkripsi Sesi Aktif</span>
              </div>
            </div>

            {loginTheme.showQuickDemoAccounts !== false && (
              <div className={`lg:col-span-5 rounded-2xl p-5 border flex flex-col justify-between ${themeStyle.demoBg}`}>
                {renderDemoAccountsList()}
                <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-900 bg-white/80 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kendali Penuh Modul:</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                    Setelah masuk, Anda dapat mengelola naskah, running ticker, polling, video, hingga info kontak portal secara live.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TEMPLATE 2: MODERN SPLIT BANNER ==================== */}
        {loginTheme.layoutTemplate === 'modern_split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden min-h-[520px]">
            {/* Left Brand Banner Column */}
            <div 
              style={themeStyle.isCustom ? { backgroundColor: themeStyle.primaryHex } : {}}
              className={`lg:col-span-5 p-8 flex flex-col justify-between text-white relative overflow-hidden ${
                !themeStyle.isCustom ? `bg-gradient-to-b ${themeStyle.bgGradient}` : ''
              }`}
            >
              <div className="relative z-10">
                <span 
                  style={themeStyle.isCustom ? { backgroundColor: themeStyle.accentHex, color: '#0f172a' } : {}}
                  className={`inline-block px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider mb-4 ${
                    themeStyle.isCustom ? '' : themeStyle.badgeBg
                  }`}
                >
                  Sistem CMS Redaksi
                </span>
                <div className="mb-3">
                  <ModernGraffitiLogo 
                    size="lg"
                    customText={siteSettings?.portalName || 'ARUN NEWS'}
                    tagline={siteSettings?.portalTagline || 'Jembatan Informasi Nusantara'}
                  />
                </div>
              </div>

              {loginTheme.showQuickDemoAccounts !== false && (
                <div className="relative z-10 my-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <span className="text-[11px] font-mono font-bold text-yellow-300 block mb-2">Akses Instan Demo:</span>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_EDITORIAL_USERS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleQuickLogin(u)}
                        className="px-2.5 py-1 bg-white/20 hover:bg-yellow-400 hover:text-slate-950 text-white rounded-lg text-[10px] font-mono font-bold transition-all"
                      >
                        {u.name} ({u.role})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative z-10 text-[10px] font-mono text-slate-300 border-t border-white/20 pt-3">
                Terdaftar Dewan Pers RI • Sistem Manajemen Berita Multi-Role
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
              {renderLoginForm()}
            </div>
          </div>
        )}

        {/* ==================== TEMPLATE 3: CENTERED CARD MINIMALIST ==================== */}
        {loginTheme.layoutTemplate === 'centered_card' && (
          <div className="max-w-xl mx-auto bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-slate-200">
            {renderLoginForm()}

            {loginTheme.showQuickDemoAccounts !== false && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-700 block mb-3">Akses Demo 1-Klik:</span>
                <div className="grid grid-cols-3 gap-2">
                  {DEFAULT_EDITORIAL_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleQuickLogin(u)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-yellow-100 border border-slate-200 hover:border-yellow-400 text-center transition-all"
                    >
                      <p className="font-bold text-xs text-slate-900 truncate">{u.name}</p>
                      <span className="text-[9px] text-slate-500 uppercase font-mono">{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TEMPLATE 4: EXECUTIVE DARK LUXURY ==================== */}
        {loginTheme.layoutTemplate === 'executive_dark' && (
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-yellow-500/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className={loginTheme.showQuickDemoAccounts !== false ? "lg:col-span-7" : "lg:col-span-12"}>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-yellow-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-yellow-400 font-mono">
                    {loginTheme.badgeText || 'Portal Eksklusif Redaksi'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 font-mono">
                  {loginTheme.titleText || 'Masuk ke Meja Redaksi'}
                </h1>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                  {loginTheme.subtitleText || 'Sistem redaksi eksekutif dengan kendali penuh naskah, otentikasi wartawan, dan regulasi Dewan Pers.'}
                </p>

                {errorMsg && (
                  <div className="p-3 mb-4 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-black uppercase tracking-wider text-yellow-400 text-[11px] mb-1.5 font-mono">
                      Email Redaksi
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@arunnews.id"
                      className="w-full px-4 py-3 bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-yellow-400 text-white font-medium text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-black uppercase tracking-wider text-yellow-400 text-[11px] mb-1.5 font-mono">
                      Kata Sandi
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-yellow-400 text-white font-medium text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-yellow-500 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <span>{isLoading ? 'Memverifikasi...' : (loginTheme.loginButtonLabel || 'Buka Meja Redaksi')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {loginTheme.showQuickDemoAccounts !== false && (
                <div className="lg:col-span-5 bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider block mb-3">
                    Profil Demo Redaksi:
                  </span>
                  <div className="space-y-2">
                    {DEFAULT_EDITORIAL_USERS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleQuickLogin(u)}
                        className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-yellow-400/50 flex items-center gap-3 transition-all text-left"
                      >
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div className="truncate">
                          <p className="font-bold text-xs text-white truncate">{u.name}</p>
                          <span className="text-[10px] text-yellow-400/80 font-mono">{u.roleTitle}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Footer copyright */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-300 font-mono py-2">
        © 2026 {siteSettings?.portalName || 'Arun News'} Editorial System • Kustomisasi Tampilan CMS Active
      </div>

    </div>
  );
};
