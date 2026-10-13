import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

interface WartaNotificationWidgetProps {
  onShowToast?: (msg: string) => void;
  onSimulateBreakingNews?: () => void;
}

export const WartaNotificationWidget: React.FC<WartaNotificationWidgetProps> = ({
  onShowToast,
  onSimulateBreakingNews,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Check support and current permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      const savedPref = localStorage.getItem('arun_news_notifications_enabled');
      if (savedPref === 'true' && Notification.permission === 'granted') {
        setIsEnabled(true);
      } else {
        setIsEnabled(false);
      }
    } else {
      setIsSupported(false);
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (!isSupported) {
      if (onShowToast) onShowToast('Peramban Anda tidak mendukung Web Notification API.');
      return;
    }

    if (permission === 'denied') {
      if (onShowToast) {
        onShowToast('Izin notifikasi diblokir di peramban. Ubah izin di setelan peramban untuk mengaktifkan warta kilat.');
      }
      return;
    }

    if (!isEnabled) {
      let currentPerm = Notification.permission;
      if (currentPerm === 'default') {
        currentPerm = await Notification.requestPermission();
        setPermission(currentPerm);
      }

      if (currentPerm === 'granted') {
        setIsEnabled(true);
        localStorage.setItem('arun_news_notifications_enabled', 'true');

        // Send welcome test notification
        try {
          new Notification('🔔 Notifikasi Warta Arun News Aktif!', {
            body: 'Anda kini akan menerima pemberitahuan otomatis setiap ada berita Headline & Breaking terbaru.',
            icon: '/favicon.ico',
            dir: 'auto',
            lang: 'id-ID',
          });
        } catch (e) {
          console.warn('Welcome notification error:', e);
        }

        if (onShowToast) onShowToast('🔔 Notifikasi Warta berhasil diaktifkan!');
      } else {
        setIsEnabled(false);
        localStorage.setItem('arun_news_notifications_enabled', 'false');
        if (onShowToast) onShowToast('Izin notifikasi ditolak oleh peramban/pengguna.');
      }
    } else {
      setIsEnabled(false);
      localStorage.setItem('arun_news_notifications_enabled', 'false');
      if (onShowToast) onShowToast('Notifikasi Warta telah dimatikan.');
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
          <span className="flex items-center gap-1 text-[10px] font-mono font-black text-rose-300 bg-rose-950/80 border border-rose-500/50 px-2 py-0.5 rounded-full shadow-2xs">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            Diblokir
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-mono font-black text-sky-300 bg-sky-900/80 border border-sky-700 px-2 py-0.5 rounded-full shadow-2xs">
            <BellOff className="w-3 h-3 text-sky-400" />
            Nonaktif
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-sky-200 leading-relaxed mb-4 font-medium">
        Terima siaran langsung alert berita <span className="text-yellow-300 font-bold">Headline</span> & <span className="text-amber-400 font-bold">Breaking News</span> tanpa perlu membuka ulang halaman.
      </p>

      {/* Notification Categories Included */}
      <div className="bg-sky-900/60 rounded-xl p-2.5 border border-sky-800 mb-4 space-y-1.5 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-sky-100">
          <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          <span>Warta Breaking News Terkini</span>
        </div>
        <div className="flex items-center gap-2 text-sky-100">
          <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Laporan Utama & Headline Utama</span>
        </div>
        <div className="flex items-center gap-2 text-sky-100">
          <Radio className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          <span>Siaran Informasi Darurat</span>
        </div>
      </div>

      {/* Toggle Main Action Button */}
      <button
        id="toggle-warta-notification-btn"
        onClick={handleToggleNotifications}
        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider mb-2.5 ${
          isEnabled && permission === 'granted'
            ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-700 active:scale-95'
            : permission === 'denied'
            ? 'bg-slate-800 text-rose-300 border border-rose-800 cursor-not-allowed'
            : 'bg-yellow-400 hover:bg-yellow-300 text-sky-950 border border-yellow-500 active:scale-95'
        }`}
      >
        {isEnabled && permission === 'granted' ? (
          <>
            <BellOff className="w-4 h-4" />
            <span>Matikan Notifikasi Warta</span>
          </>
        ) : permission === 'denied' ? (
          <>
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Akses Diblokir Browser</span>
          </>
        ) : (
          <>
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Aktifkan Notifikasi Warta</span>
          </>
        )}
      </button>

      {/* Permission Denied Warning Notice */}
      {permission === 'denied' && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl p-2.5 text-[11px] mb-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Izin Notifikasi Ditolak:</strong> Silakan buka setelan peramban Anda (klik gembok di URL) untuk mengizinkan notifikasi untuk situs ini.
          </div>
        </div>
      )}

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
          Privasi Terjaga (Tanpa Spam)
        </span>
        <span>Arun News Push API</span>
      </div>
    </div>
  );
};
