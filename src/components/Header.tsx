import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bookmark, 
  PenSquare, 
  Menu, 
  X, 
  Bell, 
  Radio, 
  Flame, 
  Sparkles,
  Type,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Trophy,
  ShieldAlert,
  TrendingUp,
  MapPin,
  GraduationCap,
  MessageSquare,
  Mail,
  FileCheck,
  Train,
  Tag,
  Megaphone,
  Coffee,
  ChevronDown,
  Sliders
} from 'lucide-react';
import { Category, SiteSettings } from '../types';
import { ModernGraffitiLogo } from './ModernGraffitiLogo';

interface HeaderProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  savedCount: number;
  onOpenSavedDrawer: () => void;
  onOpenCitizenModal?: () => void;
  onOpenSawerKopi?: () => void;
  siteSettings?: SiteSettings;
  isCompactMode?: boolean;
  onToggleCompactMode?: () => void;
  onNavigateToEditorial?: () => void;
}

const getCategoryIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'Landmark': return <Landmark className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'MapPin': return <MapPin className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    case 'Mail': return <Mail className={className} />;
    case 'FileCheck': return <FileCheck className={className} />;
    case 'Train': return <Train className={className} />;
    case 'Tag': return <Tag className={className} />;
    case 'Megaphone': return <Megaphone className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    default: return null;
  }
};

export const Header: React.FC<HeaderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  savedCount,
  onOpenSavedDrawer,
  onOpenCitizenModal,
  onOpenSawerKopi,
  siteSettings,
  isCompactMode = false,
  onToggleCompactMode,
  onNavigateToEditorial,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Global Theme Mode (Light / Dark) with localStorage persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arun_news_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('arun_news_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const quickSearchTags = ['Timnas', 'Ekonomi', 'Satelit', 'Smart Farming', 'IKN', 'Batik Paris'];

  const themeSettings = siteSettings?.portalThemeSettings;
  const primaryColor = themeSettings?.primaryColor || '#0c4a6e';
  const primaryDarkColor = themeSettings?.primaryDarkColor || '#082f49';
  const accentColor = themeSettings?.accentColor || '#facc15';
  const accentHoverColor = themeSettings?.accentHoverColor || '#eab308';

  return (
    <header 
      id="main-header" 
      className="sticky top-0 z-40 portal-theme-header shadow-xl transition-all"
      style={{
        background: `linear-gradient(to right, ${primaryDarkColor}, #020617 50%, ${primaryColor})`,
        borderBottom: `2px solid ${accentColor}`
      }}
    >
      {/* Upper Main Brand & Action Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo Brand in Bento Style */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 hover:text-white rounded-xl transition-colors"
              style={{ color: accentColor }}
              aria-label="Menu Navigasi"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory('all');
                onSearchChange('');
              }}
              className="group flex items-center gap-3 focus:outline-none p-1 sm:px-2 sm:py-1 rounded-2xl transition-all"
            >
              {/* Logo Image */}
              <img 
                src={siteSettings?.customLogoUrl || siteSettings?.loginThemeSettings?.customLogoUrl || "/whats_app_image_2026_08_01_at_14_48_objq0v5gsu.58.png"} 
                alt={`${siteSettings?.portalName || 'Arun News'} Logo`}
                referrerPolicy="no-referrer"
                style={{ borderColor: accentColor }}
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-contain shadow-md border-2 bg-white group-hover:scale-105 transition-transform shrink-0"
              />

              {/* Modern Graffiti Logo Wordmark */}
              <ModernGraffitiLogo 
                size="md" 
                customText={siteSettings?.portalName || 'ARUN NEWS'}
                tagline={siteSettings?.portalTagline || 'Jembatan Informasi Nusantara'}
              />
            </a>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                <Search className="w-4 h-4 text-sky-700" />
              </div>
              <input
                id="desktop-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari berita terkini, topik, atau nama tokoh..."
                className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-white hover:bg-white/90 focus:bg-white text-sky-950 placeholder:text-sky-600/60 rounded-xl border border-sky-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/60 transition-all shadow-xs font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sky-600 hover:text-sky-900"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Search button for mobile */}
            <button
              id="mobile-search-btn"
              onClick={() => setShowSearchModal(!showSearchModal)}
              className="md:hidden p-2 text-yellow-400 hover:text-white hover:bg-sky-900/80 rounded-xl transition-colors cursor-pointer"
              aria-label="Pencarian"
            >
              <Search className="w-5 h-5" />
            </button>

          </div>
        </div>

        {/* Mobile Search Overlay Bar */}
        {showSearchModal && (
          <div className="md:hidden mt-3 pt-3 border-t border-sky-200 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="relative w-full">
              <input
                id="mobile-search-input-field"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari topik atau berita..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white text-sky-950 rounded-xl border border-sky-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                autoFocus
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-sky-700" />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')} 
                  className="absolute right-3 top-2.5 text-sky-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Quick search chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 text-xs no-scrollbar">
              <span className="text-sky-700 text-[11px] font-bold whitespace-nowrap">Populer:</span>
              {quickSearchTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSearchChange(tag)}
                  className="px-2.5 py-0.5 rounded-lg bg-white text-sky-800 text-[11px] font-bold border border-sky-200 hover:border-yellow-400 whitespace-nowrap"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Category Bar */}
      <nav 
        id="category-navigation" 
        className="portal-theme-navbar backdrop-blur-xs transition-colors"
        style={{
          background: `linear-gradient(to right, #020617, ${primaryDarkColor}, #020617)`,
          borderTop: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
              {/* Category list items */}
              <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-2.5 sm:py-3 no-scrollbar scroll-smooth w-full">
                {categories.filter((cat) => cat.id !== 'akpersi' && cat.id !== 'box redaksi' && cat.id !== 'transportasi' && cat.id !== 'legalitas').map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`nav-cat-${cat.id}`}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        if (searchQuery) onSearchChange('');
                      }}
                      className={`px-3.5 sm:px-4 py-2 sm:py-2.2 min-h-[36px] sm:min-h-[40px] rounded-lg text-xs sm:text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 sm:gap-2 border shrink-0 select-none cursor-pointer ${
                        isActive
                          ? 'portal-theme-active-category shadow-sm scale-[1.02] border-yellow-400 font-extrabold'
                          : 'portal-theme-inactive-category shadow-2xs hover:scale-[1.01] hover:border-yellow-400/40'
                      }`}
                      style={isActive ? {
                        backgroundColor: accentColor,
                        borderColor: accentHoverColor,
                        color: '#082f49'
                      } : {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderColor: 'rgba(255, 255, 255, 0.18)',
                        color: '#e0f2fe'
                      }}
                    >
                      {cat.id === 'all' ? (
                        <Flame className="w-4 h-4 shrink-0" style={{ color: isActive ? '#082f49' : accentColor }} />
                      ) : (
                        getCategoryIcon(cat.iconName, `w-4 h-4 shrink-0`)
                      )}
                      <span className="tracking-tight">{cat.name}</span>
                    </button>
                  );
                })}

              </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-drawer-menu"
          className="lg:hidden text-white shadow-2xl px-4 py-4 animate-in slide-in-from-top-2 duration-200 max-h-[82vh] overflow-y-auto no-scrollbar"
          style={{
            backgroundColor: primaryDarkColor,
            borderBottom: `2px solid ${accentColor}`
          }}
        >
          {/* Quick Access Badges */}
          <div className="mb-4 pb-3 border-b border-sky-800">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-yellow-400 mb-2.5 font-mono">
              Akses Cepat Fitur Portal
            </h4>
            <div className="grid grid-cols-2 gap-2">


              {onOpenCitizenModal && siteSettings?.moduleToggles?.allowCitizenJournalism !== false && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCitizenModal();
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-yellow-400 border border-sky-700 text-xs font-black shadow-xs"
                >
                  <Megaphone className="w-4 h-4 text-yellow-400" />
                  <span>Lapor Warga (Kirim Laporan)</span>
                </button>
              )}
              <a
                href="#trending-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 border border-sky-700 text-xs font-bold text-sky-100"
              >
                <Flame className="w-4 h-4 text-yellow-400" />
                <span>Terpopuler</span>
              </a>
              <a
                href="#video-news-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 border border-sky-700 text-xs font-bold text-sky-100"
              >
                <Radio className="w-4 h-4 text-yellow-400" />
                <span>Warta Video</span>
              </a>
              <a
                href="#photo-gallery-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 border border-sky-700 text-xs font-bold text-sky-100"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Galeri Foto</span>
              </a>
              <a
                href="#interactive-poll-card"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 border border-sky-700 text-xs font-bold text-sky-100"
              >
                <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                <span>Jajak Pendapat</span>
              </a>
              <a
                href="https://portalarunews.com/#/admin"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  if (onNavigateToEditorial) {
                    e.preventDefault();
                    onNavigateToEditorial();
                  }
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 border border-yellow-500 text-xs font-black text-sky-950 shadow-xs cursor-pointer"
                title="portalarunews.com/#/admin"
              >
                <Sliders className="w-4 h-4 text-sky-950" />
                <span>Pengaturan Admin</span>
              </a>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-yellow-400 mb-2 font-mono">
              Kanal Berita
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.filter((cat) => cat.id !== 'akpersi' && cat.id !== 'box redaksi' && cat.id !== 'transportasi' && cat.id !== 'legalitas').map((cat) => {
                const isActive = selectedCategory === cat.id;
                const iconColorClass = isActive ? 'text-sky-950' : 'text-yellow-400';
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all min-h-[38px] ${
                      isActive
                        ? 'bg-yellow-400 text-sky-950 font-black shadow-xs border border-yellow-500'
                        : 'bg-sky-900/90 text-sky-200 hover:text-white hover:bg-sky-800 border border-sky-800'
                    }`}
                  >
                    {cat.id === 'all' ? (
                      <Flame className={`w-3.5 h-3.5 flex-shrink-0 ${iconColorClass}`} />
                    ) : (
                      getCategoryIcon(cat.iconName, `w-3.5 h-3.5 flex-shrink-0 ${iconColorClass}`)
                    )}
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
