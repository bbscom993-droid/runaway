import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Zap, ExternalLink, Radio, Volume2 } from 'lucide-react';
import { NewsArticle, TickerSettings } from '../types';

interface BreakingTickerProps {
  breakingArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  tickerSettings?: TickerSettings;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  breakingArticles,
  onSelectArticle,
  tickerSettings,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Interval speed
  const intervalSpeed = 
    tickerSettings?.speed === 'slow' ? 7000 : tickerSettings?.speed === 'fast' ? 3000 : 5000;

  useEffect(() => {
    if (breakingArticles.length <= 1 || isPaused || tickerSettings?.mode === 'custom') return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingArticles.length);
    }, intervalSpeed);
    return () => clearInterval(timer);
  }, [breakingArticles.length, isPaused, intervalSpeed, tickerSettings?.mode]);

  if (tickerSettings && !tickerSettings.isEnabled) return null;
  if (!breakingArticles || breakingArticles.length === 0) return null;

  const currentArticle = breakingArticles[currentIndex] || breakingArticles[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + breakingArticles.length) % breakingArticles.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % breakingArticles.length);
  };

  // Theme styling
  const theme = tickerSettings?.theme || 'yellow';
  const themeClasses = 
    theme === 'dark' 
      ? 'bg-sky-950 text-white border-y-2 border-sky-800' 
      : theme === 'red'
      ? 'bg-red-600 text-white border-y-2 border-red-700'
      : 'bg-yellow-100/90 text-slate-900 border-y-2 border-yellow-300/80';

  const badgeClasses =
    theme === 'dark'
      ? 'bg-yellow-400 text-sky-950'
      : theme === 'red'
      ? 'bg-white text-red-700'
      : 'bg-yellow-400 text-sky-950';

  return (
    <div 
      id="breaking-news-ticker"
      className={`${themeClasses} shadow-2xs transition-colors`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-3">
          
          {/* Breaking News Label */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`flex items-center gap-1.5 ${badgeClasses} text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs border border-black/10`}>
              <Zap className="w-3.5 h-3.5 fill-current animate-bounce" />
              <span>{tickerSettings?.mode === 'custom' ? 'PENGUMUMAN' : 'BERITA UTAMA'}</span>
            </span>
            <span className="hidden sm:inline-flex w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          </div>

          {/* Content: Either custom message or rotating breaking articles */}
          {tickerSettings?.mode === 'custom' ? (
            <div className="flex-1 overflow-hidden min-w-0">
              <p className={`text-xs sm:text-sm font-bold truncate ${theme === 'yellow' ? 'text-sky-950' : 'text-white'}`}>
                {tickerSettings.customMessage}
              </p>
            </div>
          ) : (
            <div 
              onClick={() => onSelectArticle(currentArticle)}
              className="flex-1 cursor-pointer overflow-hidden min-w-0 group"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs font-black text-sky-900 uppercase bg-white px-2 py-0.5 rounded-md border border-sky-200 flex-shrink-0 hidden md:inline-block">
                  {currentArticle.categoryLabel}
                </span>
                <p className={`text-xs sm:text-sm font-bold group-hover:underline transition-colors truncate ${
                  theme === 'yellow' ? 'text-sky-950' : 'text-white'
                }`}>
                  {currentArticle.title}
                </p>
                <span className={`text-[11px] font-mono whitespace-nowrap hidden lg:inline-block ${
                  theme === 'yellow' ? 'text-sky-700' : 'text-sky-200'
                }`}>
                  • {currentArticle.publishedAt.split('•')[0]}
                </span>
              </div>
            </div>
          )}

          {/* Next / Prev Controls (if auto mode) */}
          {tickerSettings?.mode !== 'custom' && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`text-[11px] font-mono font-bold hidden sm:inline mr-1 ${
                theme === 'yellow' ? 'text-sky-800' : 'text-sky-200'
              }`}>
                {currentIndex + 1}/{breakingArticles.length}
              </span>
              <button
                onClick={handlePrev}
                className={`p-1 rounded-lg transition-colors ${
                  theme === 'yellow' ? 'text-sky-900 hover:bg-yellow-300/80' : 'text-white hover:bg-white/20'
                }`}
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className={`p-1 rounded-lg transition-colors ${
                  theme === 'yellow' ? 'text-sky-900 hover:bg-yellow-300/80' : 'text-white hover:bg-white/20'
                }`}
                aria-label="Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

