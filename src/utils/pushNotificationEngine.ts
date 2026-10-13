import { EmergencyBroadcastLog, PushNotificationSettings } from '../types';

export const DEFAULT_PUSH_SETTINGS: PushNotificationSettings = {
  autoPushOnBreaking: true,
  autoPushOnEmergency: true,
  enableSoundAlert: true,
  soundType: 'urgent_bell',
  badgeLabel: '🔴 WARTA DARURAT',
  defaultIconUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=192&q=80',
  broadcastLogs: [
    {
      id: 'log-1',
      title: 'Peringatan Gelombang Tinggi Pesisir Selatan Jawa & Bali',
      message: 'BMKG merilis peringatan dini gelombang setinggi 4-6 meter. Nelayan dan wisatawan diimbau waspada.',
      type: 'emergency',
      sentAt: '2026-08-18T09:30:00Z',
      sentBy: 'Budi Santoso (Pemred)',
      recipientCount: 1420
    },
    {
      id: 'log-2',
      title: 'BREAKING: Jalur LRT Jabodebek Beroperasi Penuh',
      message: 'Pemerintah resmi mengoperasikan 18 stasiun terpadu dengan tarif khusus Rp 1 per perjalanan.',
      type: 'breaking',
      sentAt: '2026-08-17T14:10:00Z',
      sentBy: 'Dewi Lestari (Redaktur)',
      recipientCount: 2850
    }
  ]
};

// Web Audio synthesizer for emergency notification chimes
export function playNotificationSound(soundType: 'chime' | 'urgent_bell' | 'radar_pulse' = 'urgent_bell') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (soundType === 'urgent_bell') {
      // Urgent triple high beep
      [0, 0.15, 0.3].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880 + idx * 110, now + delay);
        gain.gain.setValueAtTime(0.15, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.13);
      });
    } else if (soundType === 'radar_pulse') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } else {
      // Gentle harmonious chime
      [0, 0.08, 0.16].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        osc.frequency.setValueAtTime(freqs[i] || 523.25, now + delay);
        gain.gain.setValueAtTime(0.15, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.45);
      });
    }
  } catch (e) {
    console.error('Audio synthesizer error:', e);
  }
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    return Notification.permission;
  }
}

/**
 * Dispatch real-time emergency push notification
 */
export function sendEmergencyPushNotification(
  payload: {
    title: string;
    message: string;
    type?: 'breaking' | 'emergency' | 'important';
    articleId?: string;
    url?: string;
  },
  settings: PushNotificationSettings = DEFAULT_PUSH_SETTINGS
) {
  // 1. Play sound chime if enabled
  if (settings.enableSoundAlert) {
    playNotificationSound(settings.soundType);
  }

  // 2. Trigger native browser push notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const typeLabel = payload.type === 'emergency' ? '🔴 DARURAT' : payload.type === 'breaking' ? '⚡ BREAKING NEWS' : '📢 INFORMASI PENTING';
      const notification = new Notification(`${typeLabel}: ${payload.title}`, {
        body: payload.message,
        icon: settings.defaultIconUrl || '/favicon.ico',
        badge: settings.defaultIconUrl || '/favicon.ico',
        tag: `arun-news-${Date.now()}`,
        requireInteraction: payload.type === 'emergency'
      });

      notification.onclick = () => {
        window.focus();
        if (payload.articleId) {
          window.location.hash = `#/article/${payload.articleId}`;
        }
        notification.close();
      };
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }

  // 3. Dispatch custom in-app broadcast event for public reader view
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('arun-news-broadcast', {
      detail: {
        id: `bc-${Date.now()}`,
        title: payload.title,
        message: payload.message,
        type: payload.type || 'breaking',
        sentAt: new Date().toISOString(),
        articleId: payload.articleId
      }
    });
    window.dispatchEvent(event);
  }
}
