import React, { useState } from 'react';
import { Zap, Radio } from 'lucide-react';
import { NewsArticle, TickerSettings } from '../types';

interface BreakingTickerProps {
  breakingArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  tickerSettings?: TickerSettings;
  badgeLabel?: string;
  className?: string;
  isCategoryTicker?: boolean;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  breakingArticles,
  onSelectArticle,
  tickerSettings,
  badgeLabel,
  className = '',
  isCategoryTicker = false,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  // If regular global ticker and disabled, do not render; category ticker always renders when articles available
  if (!isCategoryTicker && tickerSettings && !tickerSettings.isEnabled) return null;
  if (!breakingArticles || breakingArticles.length === 0) return null;

  // Marquee Speed class based on tickerSettings
  const speedClass =
    tickerSettings?.speed === 'slow'
      ? 'animate-marquee-slow'
      : tickerSettings?.speed === 'fast'
      ? 'animate-marquee-fast'
      : 'animate-marquee';

  // Theme styling
  const theme = isCategoryTicker ? 'dark' : (tickerSettings?.theme || 'yellow');
  const themeClasses = isCategoryTicker
    ? 'bg-sky-950 text-white border-2 border-yellow-400/80 rounded-2xl shadow-md'
    : theme === 'dark'
    ? 'bg-sky-950 text-white border-y-2 border-sky-800'
    : theme === 'red'
    ? 'bg-red-600 text-white border-y-2 border-red-700'
    : 'bg-yellow-100/95 text-slate-900 border-y-2 border-yellow-400';

  const badgeClasses = isCategoryTicker
    ? 'bg-yellow-400 text-sky-950 border-yellow-500 font-black'
    : theme === 'dark'
    ? 'bg-yellow-400 text-sky-950 border-yellow-500'
    : theme === 'red'
    ? 'bg-white text-red-700 border-red-200'
    : 'bg-sky-950 text-yellow-300 border-sky-900';

  // Duplicate items for seamless continuous marquee loop
  const marqueeArticles = [...breakingArticles, ...breakingArticles];

  return (
    <div
      id={isCategoryTicker ? 'category-running-ticker' : 'breaking-news-ticker'}
      className={`${themeClasses} ${className} overflow-hidden select-none transition-colors relative z-20`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label={badgeLabel || "Berita Terkini"}
    >
      <div className={`${isCategoryTicker ? 'px-3 sm:px-4 py-2' : 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2'} flex items-center gap-3`}>
        {/* Ticker Headline Official Badge */}
        <div className="flex items-center gap-2 flex-shrink-0 z-10 pr-2 border-r border-sky-950/20 dark:border-white/20">
          <span className={`flex items-center gap-1.5 ${badgeClasses} text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs border`}>
            <Zap className="w-3.5 h-3.5 fill-current animate-bounce text-yellow-400" />
            <span className="font-mono">
              {badgeLabel || (tickerSettings?.mode === 'custom' ? 'PENGUMUMAN' : 'TERKINI')}
            </span>
          </span>
          <span className="flex h-2.5 w-2.5 relative" title="Siaran Langsung Berita Utama">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
          </span>
        </div>

        {/* Marquee Content */}
        <div className="flex-1 overflow-hidden min-w-0 relative mask-linear-fade">
          {tickerSettings?.mode === 'custom' && !isCategoryTicker ? (
            <div
              className={`flex items-center gap-8 ${speedClass}`}
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            >
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="flex items-center gap-4 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <p className={`text-xs sm:text-sm font-black tracking-tight ${theme === 'yellow' ? 'text-sky-950' : 'text-white'}`}>
                    📢 {tickerSettings.customMessage}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`flex items-center gap-8 ${speedClass}`}
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            >
              {marqueeArticles.map((art, idx) => (
                <div
                  key={`${art.id}-${idx}`}
                  onClick={() => onSelectArticle(art)}
                  className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer group"
                  title={`Klik untuk membaca warta: ${art.title}`}
                >
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-950 text-yellow-300 font-mono border border-sky-800 shadow-2xs group-hover:scale-105 transition-transform">
                    {art.categoryLabel || 'TERKINI'}
                  </span>
                  <p className={`text-xs sm:text-sm font-bold group-hover:underline transition-colors flex items-center gap-1.5 ${
                    theme === 'yellow' ? 'text-sky-950' : 'text-white'
                  }`}>
                    <span>{art.title}</span>
                  </p>
                  <span className="text-[10px] opacity-75 font-mono">
                    ({art.publishedAt.split('•')[0].trim()})
                  </span>
                  <span className="text-yellow-600 font-bold ml-3 text-xs select-none">
                    ✦
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Indicator Icon */}
        <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0 text-[10px] font-mono font-bold opacity-80 pl-2 border-l border-sky-950/20">
          <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <span>LIVE UPDATE</span>
        </div>
      </div>
    </div>
  );
};
