import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  BellOff, 
  Zap, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Sparkles, 
  Radio, 
  ShieldCheck, 
  Check, 
  X, 
  Unlock, 
  RefreshCw, 
  ExternalLink, 
  Sliders, 
  Smartphone, 
  Monitor, 
  Globe, 
  HelpCircle,
  Volume2
} from 'lucide-react';
import { playNotificationSound } from '../utils/pushNotificationEngine';

interface WartaNotificationWidgetProps {
  onShowToast?: (msg: string) => void;
  onSimulateBreakingNews?: () => void;
}

type BrowserTab = 'chrome' | 'edge' | 'firefox' | 'safari' | 'mobile';

export const WartaNotificationWidget: React.FC<WartaNotificationWidgetProps> = ({
  onShowToast,
  onSimulateBreakingNews,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState<boolean>(false);
  const [activeBrowserTab, setActiveBrowserTab] = useState<BrowserTab>('chrome');
  const [isCheckingPermission, setIsCheckingPermission] = useState<boolean>(false);
  const [inAppSoundOnly, setInAppSoundOnly] = useState<boolean>(() => {
    return localStorage.getItem('arun_news_inapp_sound_alert') === 'true';
  });

  // Check support and current permission on mount & on window focus
  const checkPermissionState = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      const current = Notification.permission;
      setPermission(current);
      
      const savedPref = localStorage.getItem('arun_news_notifications_enabled');
      if (current === 'granted' && savedPref !== 'false') {
        setIsEnabled(true);
      } else if (current === 'denied') {
        setIsEnabled(false);
      }
    } else {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    checkPermissionState();

    // Listen to window focus (e.g. after user changes settings in browser address bar or settings popup)
    const handleFocus = () => {
      checkPermissionState();
    };
    window.addEventListener('focus', handleFocus);

    // If permissions API query is supported, listen for live change
    let permStatus: PermissionStatus | null = null;
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'notifications' as PermissionName }).then((status) => {
        permStatus = status;
        status.onchange = () => {
          checkPermissionState();
          if (status.state === 'granted') {
            setIsEnabled(true);
            localStorage.setItem('arun_news_notifications_enabled', 'true');
            if (onShowToast) onShowToast('🎉 Izin notifikasi berhasil dibuka dan diaktifkan!');
          }
        };
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (permStatus) {
        permStatus.onchange = null;
      }
    };
  }, [checkPermissionState, onShowToast]);

  const handleManualCheckPermission = () => {
    setIsCheckingPermission(true);
    checkPermissionState();
    setTimeout(() => {
      setIsCheckingPermission(false);
      if (Notification.permission === 'granted') {
        setIsEnabled(true);
        localStorage.setItem('arun_news_notifications_enabled', 'true');
        setIsUnblockModalOpen(false);
        if (onShowToast) onShowToast('🎉 Notifikasi warta berhasil diizinkan dan aktif!');
      } else if (Notification.permission === 'denied') {
        if (onShowToast) onShowToast('Status masih DIBLOKIR oleh peramban. Ikuti langkah di panduan untuk mengubah ke "Izinkan".');
      } else {
        if (onShowToast) onShowToast('Status izin: Default (Belum diizinkan). Silakan klik "Aktifkan".');
      }
    }, 600);
  };

  const handleToggleNotifications = async () => {
    if (!isSupported) {
      if (onShowToast) onShowToast('Peramban Anda tidak mendukung Web Notification API.');
      return;
    }

    const initialPerm = (Notification.permission as NotificationPermission);
    if (permission === 'denied' || initialPerm === 'denied') {
      setIsUnblockModalOpen(true);
      if (onShowToast) {
        onShowToast('Akses notifikasi diblokir di browser. Buka panduan untuk mengizinkan kembali.');
      }
      return;
    }

    if (!isEnabled) {
      let resolvedPerm: NotificationPermission = initialPerm;
      if (resolvedPerm === 'default') {
        try {
          const reqRes = await Notification.requestPermission();
          resolvedPerm = reqRes as NotificationPermission;
        } catch {
          resolvedPerm = Notification.permission as NotificationPermission;
        }
        setPermission(resolvedPerm);
      }

      if (resolvedPerm === 'granted') {
        setIsEnabled(true);
        localStorage.setItem('arun_news_notifications_enabled', 'true');

        // Play sound & send welcome test notification
        playNotificationSound('chime');
        try {
          new Notification('🔔 Notifikasi Warta Arun News Aktif!', {
            body: 'Anda kini akan menerima siaran langsung setiap ada berita Headline & Breaking terbaru.',
            icon: '/favicon.ico',
            dir: 'auto',
            lang: 'id-ID',
          });
        } catch (e) {
          console.warn('Welcome notification error:', e);
        }

        if (onShowToast) onShowToast('🔔 Notifikasi Warta Real-Time berhasil diaktifkan!');
      } else if (resolvedPerm === 'denied') {
        setIsEnabled(false);
        setPermission('denied');
        localStorage.setItem('arun_news_notifications_enabled', 'false');
        setIsUnblockModalOpen(true);
        if (onShowToast) onShowToast('Izin notifikasi diblokir. Klik panduan untuk membuka blokir di browser.');
      }
    } else {
      setIsEnabled(false);
      localStorage.setItem('arun_news_notifications_enabled', 'false');
      if (onShowToast) onShowToast('Notifikasi Warta telah dinonaktifkan.');
    }
  };

  const handleToggleInAppSound = () => {
    const nextVal = !inAppSoundOnly;
    setInAppSoundOnly(nextVal);
    localStorage.setItem('arun_news_inapp_sound_alert', nextVal ? 'true' : 'false');
    if (nextVal) {
      playNotificationSound('urgent_bell');
      if (onShowToast) onShowToast('🔊 Nada dering warta darurat in-app diaktifkan!');
    } else {
      if (onShowToast) onShowToast('Nada dering warta darurat dimatikan.');
    }
  };

  const handleSendTestNotification = () => {
    if (!isSupported) {
      if (onShowToast) onShowToast('Browser tidak mendukung Notification API.');
      return;
    }

    if (Notification.permission !== 'granted') {
      if (onShowToast) onShowToast('Harap aktifkan notifikasi terlebih dahulu.');
      handleToggleNotifications();
      return;
    }

    try {
      playNotificationSound('urgent_bell');
      const testNotif = new Notification('⚡ UJI NOTIFIKASI: BREAKING NEWS', {
        body: 'Pemerintah Resmi Meresmikan Pusat Layanan Publik Terpadu Berbasis Digital!',
        icon: '/favicon.ico',
        tag: 'test-notification',
      });

      testNotif.onclick = () => {
        window.focus();
        if (onShowToast) onShowToast('Anda mengklik notifikasi pengujian!');
        testNotif.close();
      };

      if (onShowToast) onShowToast('⚡ Notifikasi pengujian dikirim ke peramban!');
    } catch (err) {
      console.warn(err);
      if (onShowToast) onShowToast('Gagal mengirim notifikasi pengujian.');
    }
  };

  return (
    <>
      <div 
        id="sidebar-warta-notification-widget" 
        className="bg-gradient-to-br from-sky-950 via-slate-900 to-sky-950 text-white rounded-2xl p-5 border-2 border-yellow-400/80 shadow-xl overflow-hidden relative group"
      >
        {/* Decorative Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl group-hover:bg-yellow-400/20 transition-all pointer-events-none" />

        {/* Header Title */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-800/80 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-md border border-yellow-500">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-yellow-400 flex items-center gap-1.5">
                Notifikasi Warta Real-Time
              </h3>
              <p className="text-[10px] text-sky-200 font-mono">
                Alert Langsung Peramban (Browser)
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {isEnabled && permission === 'granted' ? (
            <span className="flex items-center gap-1 text-[10px] font-mono font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-full shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Aktif
            </span>
          ) : permission === 'denied' ? (
            <button
              onClick={() => setIsUnblockModalOpen(true)}
              className="flex items-center gap-1 text-[10px] font-mono font-black text-rose-300 bg-rose-950/90 border border-rose-500/70 hover:border-rose-400 px-2 py-0.5 rounded-full shadow-2xs cursor-pointer transition-all hover:scale-105"
              title="Klik untuk membuka panduan buka blokir"
            >
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Diblokir (Buka)</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono font-black text-sky-300 bg-sky-900/80 border border-sky-700 px-2 py-0.5 rounded-full shadow-2xs">
              <BellOff className="w-3 h-3 text-sky-400" />
              Nonaktif
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-sky-200 leading-relaxed mb-4 font-medium">
          Terima siaran langsung alert berita <span className="text-yellow-300 font-bold">Headline</span> & <span className="text-amber-400 font-bold">Breaking News</span> tanpa perlu membuka ulang halaman portal.
        </p>

        {/* Notification Categories Included */}
        <div className="bg-sky-900/60 rounded-xl p-2.5 border border-sky-800 mb-4 space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-sky-100">
            <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            <span>Warta Breaking News Terkini</span>
          </div>
          <div className="flex items-center gap-2 text-sky-100">
            <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Laporan Utama & Headline</span>
          </div>
          <div className="flex items-center gap-2 text-sky-100">
            <Radio className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
            <span>Siaran Informasi Darurat</span>
          </div>
        </div>

        {/* Toggle Main Action Button */}
        {permission === 'denied' ? (
          <div className="space-y-2 mb-3">
            <button
              id="unblock-warta-notification-btn"
              onClick={() => setIsUnblockModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 hover:from-rose-500 hover:to-amber-500 text-white border border-rose-400 active:scale-98 animate-pulse"
            >
              <Unlock className="w-4 h-4 text-yellow-300" />
              <span>Buka Blokir Notifikasi Browser</span>
            </button>

            <button
              onClick={handleManualCheckPermission}
              disabled={isCheckingPermission}
              className="w-full py-1.5 px-3 rounded-lg text-[11px] font-bold text-sky-200 hover:text-white bg-sky-900/80 hover:bg-sky-800 border border-sky-700/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-300 ${isCheckingPermission ? 'animate-spin' : ''}`} />
              <span>{isCheckingPermission ? 'Memeriksa Browser...' : 'Periksa Status Izin Sekarang'}</span>
            </button>
          </div>
        ) : (
          <button
            id="toggle-warta-notification-btn"
            onClick={handleToggleNotifications}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider mb-2.5 ${
              isEnabled && permission === 'granted'
                ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-700 active:scale-95'
                : 'bg-yellow-400 hover:bg-yellow-300 text-sky-950 border border-yellow-500 active:scale-95'
            }`}
          >
            {isEnabled && permission === 'granted' ? (
              <>
                <BellOff className="w-4 h-4" />
                <span>Matikan Notifikasi Warta</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 animate-bounce" />
                <span>Aktifkan Notifikasi Warta</span>
              </>
            )}
          </button>
        )}

        {/* Permission Denied Warning Box */}
        {permission === 'denied' && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl p-3 text-[11px] mb-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong className="text-rose-100">Akses Notifikasi Terblokir:</strong> Peramban Anda memblokir izin pengiriman notifikasi untuk situs ini.
              </div>
            </div>
            <div className="bg-black/30 p-2 rounded-lg text-[10px] text-sky-200 border border-white/10 flex items-center justify-between gap-2">
              <span>Klik ikon gembok 🔒 di bilah URL &rarr; Ubah ke Izinkan (Allow).</span>
              <button 
                onClick={() => setIsUnblockModalOpen(true)}
                className="text-yellow-300 font-bold hover:underline underline-offset-2 whitespace-nowrap"
              >
                Lihat Panduan &rarr;
              </button>
            </div>
          </div>
        )}

        {/* In-app sound alert toggle option (works even if push is blocked) */}
        <div className="p-2.5 rounded-xl bg-sky-900/40 border border-sky-800/80 mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-sky-200">
            <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[11px] font-medium">Nada Dering Suara Warta</span>
          </div>
          <button
            type="button"
            onClick={handleToggleInAppSound}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer ${
              inAppSoundOnly
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            {inAppSoundOnly ? '🔊 Aktif' : 'Mati'}
          </button>
        </div>

        {/* Extra Interactive Tools when Enabled */}
        {isEnabled && permission === 'granted' && (
          <div className="pt-2 border-t border-sky-800/80 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="w-full py-2 px-3 rounded-xl bg-sky-900 hover:bg-sky-800 text-yellow-300 text-xs font-bold border border-sky-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5 text-yellow-400" />
              <span>Uji Kirim Notifikasi Browser</span>
            </button>

            {onSimulateBreakingNews && (
              <button
                type="button"
                onClick={onSimulateBreakingNews}
                className="w-full py-2 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-bold border border-amber-400/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulasi Warta Breaking Baru</span>
              </button>
            )}
          </div>
        )}

        {/* Bottom Footer Note */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-sky-400 font-mono pt-2 border-t border-sky-900">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Bebas Spam & Terenkripsi
          </span>
          <button
            onClick={() => setIsUnblockModalOpen(true)}
            className="hover:text-yellow-300 transition-colors flex items-center gap-1 underline underline-offset-2"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Panduan Izin</span>
          </button>
        </div>
      </div>

      {/* MODAL PANDUAN BUKA BLOKIR NOTIFIKASI BROWSER */}
      {isUnblockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="bg-slate-900 border-2 border-yellow-400 text-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-sky-800 bg-sky-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-yellow-400 border border-yellow-400/50 flex items-center justify-center flex-shrink-0">
                  <Unlock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Cara Buka Blokir Notifikasi Browser</span>
                    <span className="text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/50 px-2 py-0.5 rounded-full font-mono font-bold">
                      Akses Diblokir
                    </span>
                  </h3>
                  <p className="text-xs text-sky-300">
                    Panduan resmi mengembalikan izin notifikasi real-time di peramban Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUnblockModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-sky-900 hover:bg-sky-800 text-sky-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Diagnostic Banner */}
            <div className="bg-sky-900/40 px-5 py-3 border-b border-sky-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-sky-300">Status Izin Saat Ini:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 uppercase text-[11px]">
                  {permission === 'denied' ? '🔴 Diblokir (Denied)' : permission === 'granted' ? '🟢 Diizinkan (Granted)' : '🟡 Belum Dipilih (Default)'}
                </span>
              </div>
              <button
                onClick={handleManualCheckPermission}
                disabled={isCheckingPermission}
                className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPermission ? 'animate-spin' : ''}`} />
                <span>{isCheckingPermission ? 'Mengecek...' : 'Cek Status Izin Sekarang'}</span>
              </button>
            </div>

            {/* Browser Selection Tabs */}
            <div className="flex border-b border-sky-800 bg-sky-950/60 overflow-x-auto p-1.5 gap-1 text-xs">
              <button
                onClick={() => setActiveBrowserTab('chrome')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeBrowserTab === 'chrome'
                    ? 'bg-yellow-400 text-sky-950 shadow-xs'
                    : 'text-sky-300 hover:text-white hover:bg-sky-900/50'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Google Chrome</span>
              </button>
              <button
                onClick={() => setActiveBrowserTab('edge')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeBrowserTab === 'edge'
                    ? 'bg-yellow-400 text-sky-950 shadow-xs'
                    : 'text-sky-300 hover:text-white hover:bg-sky-900/50'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Microsoft Edge</span>
              </button>
              <button
                onClick={() => setActiveBrowserTab('firefox')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeBrowserTab === 'firefox'
                    ? 'bg-yellow-400 text-sky-950 shadow-xs'
                    : 'text-sky-300 hover:text-white hover:bg-sky-900/50'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Firefox</span>
              </button>
              <button
                onClick={() => setActiveBrowserTab('safari')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeBrowserTab === 'safari'
                    ? 'bg-yellow-400 text-sky-950 shadow-xs'
                    : 'text-sky-300 hover:text-white hover:bg-sky-900/50'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Safari / Mac</span>
              </button>
              <button
                onClick={() => setActiveBrowserTab('mobile')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeBrowserTab === 'mobile'
                    ? 'bg-yellow-400 text-sky-950 shadow-xs'
                    : 'text-sky-300 hover:text-white hover:bg-sky-900/50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>HP Android / Mobile</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-sky-100 flex-1">
              {activeBrowserTab === 'chrome' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">1</span>
                      <span>Klik Ikon Setelan Situs di Sebelah Kiri Bilah URL</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Di bilah alamat (URL bar) browser bagian atas tempat tertulis nama situs, klik ikon <strong>Gembok (🔒)</strong> atau ikon <strong>Setelan Situs / Tune (🎛️)</strong> tepat di sebelah kiri alamat website.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">2</span>
                      <span>Ubah Izin Notifikasi Menjadi &quot;Izinkan (Allow)&quot;</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Cari baris <strong>Notifikasi (Notifications)</strong> yang saat ini bertuliskan <em>Blokir (Block)</em>. Klik menu dropdown dan ubah menjadi <strong>Izinkan (Allow)</strong>, atau klik tombol <strong>Reset Izin (Reset permissions)</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">3</span>
                      <span>Kembali ke Halaman Ini atau Muat Ulang</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Setelah diubah, klik tombol <strong>&quot;Cek Status Izin Sekarang&quot;</strong> di atas atau muat ulang (refresh) halaman. Notifikasi warta real-time akan langsung aktif!
                    </p>
                  </div>
                </div>
              )}

              {activeBrowserTab === 'edge' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">1</span>
                      <span>Klik Ikon Gembok di Bilah URL Edge</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Klik ikon <strong>Gembok (🔒)</strong> di sebelah kiri alamat web pada bilah atas Microsoft Edge.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">2</span>
                      <span>Pilih &quot;Izin untuk situs ini&quot; (Permissions for this site)</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Cari bagian <strong>Notifikasi</strong>, lalu ubah status dari <em>Blokir</em> menjadi <strong>Izinkan (Allow)</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">3</span>
                      <span>Periksa Ulang Izin</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Klik tombol <strong>Cek Status Izin Sekarang</strong> untuk memverifikasi bahwa notifikasi sudah aktif.
                    </p>
                  </div>
                </div>
              )}

              {activeBrowserTab === 'firefox' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">1</span>
                      <span>Klik Ikon Izin / Perisai di Bilah Alamat</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Klik ikon perisai atau ikon izin di sebelah kiri bilah URL Firefox.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">2</span>
                      <span>Hapus Status Blokir</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Di bawah bagian <strong>Izin (Permissions) &rarr; Kirim Notifikasi</strong>, klik tanda silang <strong>(✕)</strong> di sebelah status <em>Diblokir</em> untuk mereset izin.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">3</span>
                      <span>Muat Ulang Halaman</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Muat ulang halaman portal, lalu klik kembali tombol <strong>Aktifkan Notifikasi Warta</strong> saat jendela konfirmasi muncul.
                    </p>
                  </div>
                </div>
              )}

              {activeBrowserTab === 'safari' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">1</span>
                      <span>Buka Safari Settings / Preferences</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Pada bilah menu Mac atas, klik <strong>Safari &rarr; Settings (atau Preferences) &rarr; Websites</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">2</span>
                      <span>Pilih Menu &quot;Notifications&quot;</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Di panel sebelah kiri pilih <strong>Notifications</strong>. Cari domain portal berita ini di daftar, lalu ubah status dari <em>Deny</em> menjadi <strong>Allow</strong>.
                    </p>
                  </div>
                </div>
              )}

              {activeBrowserTab === 'mobile' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">1</span>
                      <span>Ketuk Ikon Gembok atau Menu (⋮) di Chrome HP</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Ketuk ikon <strong>Gembok (🔒)</strong> di samping URL atau ketuk tombol <strong>titik tiga (⋮)</strong> di pojok kanan atas layar peramban HP Anda.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">2</span>
                      <span>Buka Izin / Setelan Situs</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Ketuk <strong>Izin (Permissions)</strong> atau <strong>Setelan Situs &rarr; Notifikasi</strong>. Cari situs portal ini di daftar *Diblokir*, ketuk dan pilih <strong>Izinkan (Allow)</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-800 space-y-2">
                    <h4 className="font-black text-yellow-300 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-sky-950 flex items-center justify-center text-xs font-black">3</span>
                      <span>Kembali ke Halaman Web</span>
                    </h4>
                    <p className="text-sky-200 pl-8 leading-relaxed">
                      Kembali ke tab portal berita, status notifikasi akan otomatis terdeteksi aktif.
                    </p>
                  </div>
                </div>
              )}

              {/* Informative Security Note */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 text-[11px] text-amber-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Catatan Keamanan Browser:</strong> Standar keamanan peramban modern (W3C Push API) mewajibkan pembukaan blokir dilakukan langsung melalui pengaturan izin peramban pengguna. Situs web dilarang memaksakan jendela konfirmasi secara sepihak saat pengguna telah menolaknya sebelumnya.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-sky-800 bg-sky-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-sky-300 text-center sm:text-left">
                Sudah mengubah setelan di bilah URL browser?
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleManualCheckPermission}
                  disabled={isCheckingPermission}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPermission ? 'animate-spin' : ''}`} />
                  <span>{isCheckingPermission ? 'Memeriksa...' : 'Cek Status Izin Sekarang'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnblockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-sky-900 hover:bg-sky-800 text-sky-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
