import React from 'react';
import { 
  Home, 
  Flame, 
  Search, 
  Bookmark, 
  Megaphone,
  Compass
} from 'lucide-react';

interface MobileBottomNavProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onOpenSearch: () => void;
  savedCount: number;
  onOpenSavedDrawer: () => void;
  onOpenCitizenModal: () => void;
  isArticleOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onOpenSearch,
  savedCount,
  onOpenSavedDrawer,
  onOpenCitizenModal,
  isArticleOpen = false,
}) => {
  // If reading an article in modal on mobile, let the article modal's own dedicated reader bar take over
  if (isArticleOpen) return null;

  const isHomeActive = selectedCategory === 'all' && !searchQuery;
  const isSearchActive = !!searchQuery;

  const handleGoHome = () => {
    if (selectedCategory !== 'all' || searchQuery) {
      onSelectCategory('all');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoTrending = () => {
    const trendingEl = document.getElementById('trending-section');
    if (trendingEl) {
      trendingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Navigasi Bawah Mobile"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-sky-950/95 backdrop-blur-lg border-t-2 border-yellow-400 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] px-2 py-1.5 transition-all duration-200"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1">
        
        {/* 1. Beranda */}
        <button
          id="mobile-nav-home-btn"
          type="button"
          onClick={handleGoHome}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-90 ${
            isHomeActive
              ? 'text-yellow-400 font-black'
              : 'text-sky-300 hover:text-white'
          }`}
          aria-label="Beranda"
          aria-current={isHomeActive ? 'page' : undefined}
        >
          <div className={`p-1 rounded-lg transition-colors ${isHomeActive ? 'bg-yellow-400/20' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-tight mt-0.5">
            Beranda
          </span>
        </button>

        {/* 2. Tren / Populer */}
        <button
          id="mobile-nav-trending-btn"
          type="button"
          onClick={handleGoTrending}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-sky-300 hover:text-yellow-400 transition-all cursor-pointer select-none active:scale-90"
          aria-label="Berita Tren"
        >
          <div className="p-1 rounded-lg">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-tight mt-0.5">
            Tren
          </span>
        </button>

        {/* 3. Cari */}
        <button
          id="mobile-nav-search-btn"
          type="button"
          onClick={onOpenSearch}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-90 ${
            isSearchActive
              ? 'text-yellow-400 font-black'
              : 'text-sky-300 hover:text-white'
          }`}
          aria-label="Pencarian Berita"
        >
          <div className={`p-1 rounded-lg transition-colors ${isSearchActive ? 'bg-yellow-400/20' : ''}`}>
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-tight mt-0.5">
            Cari
          </span>
        </button>

        {/* 4. Disimpan (Saved Articles with Badge) */}
        <button
          id="mobile-nav-saved-btn"
          type="button"
          onClick={onOpenSavedDrawer}
          className="relative flex flex-col items-center justify-center py-1 px-1 rounded-xl text-sky-300 hover:text-yellow-400 transition-all cursor-pointer select-none active:scale-90"
          aria-label={`Berita Disimpan (${savedCount})`}
        >
          <div className="p-1 rounded-lg relative">
            <Bookmark className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[17px] h-[17px] px-1 bg-yellow-400 text-sky-950 font-mono font-black text-[9px] rounded-full flex items-center justify-center border border-yellow-500 shadow-xs">
                {savedCount > 99 ? '99+' : savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono font-bold tracking-tight mt-0.5">
            Disimpan
          </span>
        </button>

        {/* 5. Lapor Warga */}
        <button
          id="mobile-nav-citizen-btn"
          type="button"
          onClick={onOpenCitizenModal}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-yellow-300 hover:text-yellow-200 transition-all cursor-pointer select-none active:scale-90"
          aria-label="Lapor Warga"
        >
          <div className="p-1 rounded-lg bg-yellow-400 text-sky-950 shadow-xs">
            <Megaphone className="w-4 h-4 fill-sky-950" />
          </div>
          <span className="text-[10px] font-mono font-black tracking-tight mt-0.5 text-yellow-400">
            Lapor
          </span>
        </button>

      </div>
    </nav>
  );
};
