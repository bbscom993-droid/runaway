import { PortalThemeSettings, PortalColorThemeId } from '../types';

export interface ThemePresetOption {
  id: PortalColorThemeId;
  name: string;
  badge: string;
  desc: string;
  primaryColor: string;
  primaryDarkColor: string;
  accentColor: string;
  accentHoverColor: string;
  previewGradient: string;
}

export const PORTAL_THEME_PRESETS: ThemePresetOption[] = [
  {
    id: 'sky_gold',
    name: 'Biru Samudra & Emas (Bawaan Arun News)',
    badge: 'Original Presisi',
    desc: 'Khas portal berita terpercaya Nusantara dengan biru laut sejuk dan aksen emas terpercaya.',
    primaryColor: '#0c4a6e',
    primaryDarkColor: '#082f49',
    accentColor: '#facc15',
    accentHoverColor: '#eab308',
    previewGradient: 'from-sky-950 via-sky-900 to-sky-800',
  },
  {
    id: 'crimson_gold',
    name: 'Merah Berani & Emas (Jurnalisme Merah Putih)',
    badge: 'Investigasi & Patriot',
    desc: 'Nuansa merah maroon berwibawa khas harian berita nasional investigatif dengan aksen emas.',
    primaryColor: '#881337',
    primaryDarkColor: '#4c0519',
    accentColor: '#fbbf24',
    accentHoverColor: '#f59e0b',
    previewGradient: 'from-rose-950 via-rose-900 to-rose-800',
  },
  {
    id: 'emerald_amber',
    name: 'Zamrud Khatulistiwa (Hijau & Emas)',
    badge: 'Harmoni Nusantara',
    desc: 'Karakter sejuk ramah lingkungan, agrikultur maritim, dan keasrian kepulauan nusantara.',
    primaryColor: '#064e3b',
    primaryDarkColor: '#022c22',
    accentColor: '#fbbf24',
    accentHoverColor: '#f59e0b',
    previewGradient: 'from-emerald-950 via-emerald-900 to-emerald-800',
  },
  {
    id: 'midnight_cyan',
    name: 'Cyber Midnight & Cyan (Teknologi Modern)',
    badge: 'Siber & Masa Depan',
    desc: 'Kesan canggih, mutakhir, dan futuristik dengan latar hitam pekat serta aksen sian menyala.',
    primaryColor: '#0f172a',
    primaryDarkColor: '#020617',
    accentColor: '#06b6d4',
    accentHoverColor: '#0891b2',
    previewGradient: 'from-slate-950 via-slate-900 to-cyan-950',
  },
  {
    id: 'royal_purple',
    name: 'Royal Ungu & Magenta (Warta Budaya & Seni)',
    badge: 'Eksklusif & Budaya',
    desc: 'Gaya majalah eksklusif, sastra, seni pertunjukan, dan rubrik warta metropolitan kelas atas.',
    primaryColor: '#581c87',
    primaryDarkColor: '#3b0764',
    accentColor: '#f43f5e',
    accentHoverColor: '#e11d48',
    previewGradient: 'from-purple-950 via-purple-900 to-fuchsia-950',
  },
  {
    id: 'executive_slate',
    name: 'Executive Slate & Jingga (Metro Modern)',
    badge: 'Dinamis & Bisnis',
    desc: 'Kombinasi grafit arang tegas dan jingga dinamis khas redaksi berita cepat dan bursa finansial.',
    primaryColor: '#1e293b',
    primaryDarkColor: '#0f172a',
    accentColor: '#f97316',
    accentHoverColor: '#ea580c',
    previewGradient: 'from-slate-950 via-gray-900 to-orange-950',
  },
  {
    id: 'custom',
    name: 'Kustom Hex (Pilihan Mandiri Redaksi)',
    badge: 'Palet Bebas',
    desc: 'Tentukan sendiri warna primer, warna gelap latar, dan aksen tombol sesuai identitas visual Anda.',
    primaryColor: '#0c4a6e',
    primaryDarkColor: '#082f49',
    accentColor: '#facc15',
    accentHoverColor: '#eab308',
    previewGradient: 'from-neutral-900 via-neutral-800 to-neutral-700',
  },
];

export const DEFAULT_PORTAL_THEME: PortalThemeSettings = {
  colorTheme: 'sky_gold',
  primaryColor: '#0c4a6e',
  primaryDarkColor: '#082f49',
  accentColor: '#facc15',
  accentHoverColor: '#eab308',
  headerStyle: 'gradient_elegance',
  navbarStyle: 'classic_bar',
  fontFamily: 'plus_jakarta',
};

/**
 * Calculates WCAG contrast friendly text color for an accent hex
 */
export function getContrastTextColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#082f49';
  const cleanHex = hexColor.replace('#', '');
  if (cleanHex.length !== 6) return '#082f49';
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // YIQ luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#082f49' : '#ffffff';
}

/**
 * Injects and updates dynamic CSS properties across the portal DOM
 */
export function applyPortalTheme(themeSettings?: PortalThemeSettings) {
  if (typeof document === 'undefined') return;

  const currentTheme = themeSettings || DEFAULT_PORTAL_THEME;
  const primary = currentTheme.primaryColor || '#0c4a6e';
  const primaryDark = currentTheme.primaryDarkColor || '#082f49';
  const accent = currentTheme.accentColor || '#facc15';
  const accentHover = currentTheme.accentHoverColor || '#eab308';
  const accentText = getContrastTextColor(accent);

  const root = document.documentElement;
  root.style.setProperty('--portal-primary', primary);
  root.style.setProperty('--portal-primary-dark', primaryDark);
  root.style.setProperty('--portal-accent', accent);
  root.style.setProperty('--portal-accent-hover', accentHover);
  root.style.setProperty('--portal-accent-text', accentText);

  // Dynamic CSS tag for global theme classes
  let styleEl = document.getElementById('arun-portal-dynamic-theme') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'arun-portal-dynamic-theme';
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    :root {
      --portal-primary: ${primary};
      --portal-primary-dark: ${primaryDark};
      --portal-accent: ${accent};
      --portal-accent-hover: ${accentHover};
      --portal-accent-text: ${accentText};
    }

    /* Portal Theme Utility Elements */
    .portal-theme-header {
      background: linear-gradient(to right, ${primaryDark}, #020617 50%, ${primary}) !important;
      border-bottom: 2px solid ${accent} !important;
    }
    
    .portal-theme-navbar {
      background: linear-gradient(to right, #020617, ${primaryDark}, #020617) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .portal-theme-topbar {
      background-color: ${primaryDark} !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    }

    .portal-theme-footer {
      background-color: ${primaryDark} !important;
      border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
    }

    .portal-theme-footer-banner {
      background-color: ${primary} !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .portal-theme-accent-btn {
      background-color: ${accent} !important;
      color: ${accentText} !important;
      border-color: ${accentHover} !important;
    }

    .portal-theme-accent-btn:hover {
      background-color: ${accentHover} !important;
    }

    .portal-theme-active-category {
      background-color: ${accent} !important;
      color: ${accentText} !important;
      border-color: ${accentHover} !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
    }

    .portal-theme-inactive-category {
      background-color: rgba(255, 255, 255, 0.08) !important;
      color: #e0f2fe !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }

    .portal-theme-inactive-category:hover {
      background-color: rgba(255, 255, 255, 0.16) !important;
      color: ${accent} !important;
      border-color: ${accent} !important;
    }

    .portal-theme-accent-badge {
      background-color: ${accent} !important;
      color: ${accentText} !important;
    }

    .portal-theme-accent-border {
      border-color: ${accent} !important;
    }

    .portal-theme-accent-text {
      color: ${accent} !important;
    }
  `;
}
