import React from 'react';
import { 
  Bookmark, 
  Clock, 
  Eye, 
  Share2, 
  Flame, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  BookmarkCheck,
  Zap,
  Radio,
  ArrowUpRight
} from 'lucide-react';
import { NewsArticle } from '../types';
import { getArticleReadingTime } from '../utils/readingTime';
import { ArticleShareButton } from './ArticleCard';

interface HeadlineHeroProps {
  mainArticle: NewsArticle;
  sideArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  savedArticleIds: string[];
  onToggleSave: (article: NewsArticle, e: React.MouseEvent) => void;
}

export const HeadlineHero: React.FC<HeadlineHeroProps> = ({
  mainArticle,
  sideArticles,
  onSelectArticle,
  savedArticleIds,
  onToggleSave,
}) => {
  const isMainSaved = savedArticleIds.includes(mainArticle.id);
  const mainReadTimeInfo = getArticleReadingTime(mainArticle);

  return (
    <section id="headline-hero-section" className="mb-8">
      {/* Bento Grid Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* 1. Main Large Bento Hero Card (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <div 
            id={`main-headline-${mainArticle.id}`}
            onClick={() => onSelectArticle(mainArticle)}
            className="group relative flex-1 bg-white border border-sky-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-yellow-400 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[420px]"
          >
            {/* Image Container with Visual Badges */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-sky-950">
              <img
                src={mainArticle.imageUrl}
                alt={mainArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950 via-sky-950/40 to-transparent" />
              
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap z-10">
                <span className="bg-yellow-400 text-sky-950 font-black text-xs uppercase tracking-wider px-3 py-1 rounded-lg shadow-xs flex items-center gap-1 border border-yellow-500/50">
                  <Flame className="w-3.5 h-3.5 fill-sky-950" />
                  BERITA UTAMA
                </span>
                <span className="bg-sky-900/90 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-lg border border-sky-700/60">
                  {mainArticle.categoryLabel}
                </span>
              </div>

              {/* Action Button Top Right: Bookmark Only */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  id={`save-btn-${mainArticle.id}`}
                  onClick={(e) => onToggleSave(mainArticle, e)}
                  className={`p-2.5 rounded-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                    isMainSaved 
                      ? 'bg-yellow-400 text-sky-950 shadow-md border border-yellow-500 font-bold' 
                      : 'bg-sky-950/70 text-white hover:bg-white hover:text-sky-900'
                  }`}
                  title={isMainSaved ? 'Hapus dari Simpanan' : 'Simpan Berita'}
                >
                  {isMainSaved ? <BookmarkCheck className="w-4 h-4 text-sky-950" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>

              {/* Bottom overlay text on image */}
              <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <div className="flex items-center gap-3 text-xs text-sky-200 font-mono">
                  <span>{mainArticle.publishedAt.split('•')[0]}</span>
                  <span>•</span>
                  <span 
                    className="flex items-center gap-1 font-bold text-amber-300 bg-sky-900/80 px-2 py-0.5 rounded border border-amber-400/40"
                    title={`Estimasi baca berdasarkan ${mainReadTimeInfo.wordCount} kata`}
                  >
                    <Clock className="w-3 h-3 text-yellow-400" />
                    {mainReadTimeInfo.formatted}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-yellow-400" />
                    {mainArticle.views.toLocaleString('id-ID')} Pembaca
                  </span>
                </div>
              </div>
            </div>

            {/* Content Below Image */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-white">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-sky-950 group-hover:text-yellow-600 transition-colors leading-tight mb-2 tracking-tight">
                  {mainArticle.title}
                </h1>
                
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4 font-medium">
                  {mainArticle.excerpt}
                </p>

                {/* Key takeaway highlight box */}
                {mainArticle.keyTakeaways && mainArticle.keyTakeaways.length > 0 && (
                  <div className="bg-sky-50 rounded-xl p-3 border border-sky-200 mb-4">
                    <div className="flex items-center gap-1.5 text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                      POIN KUNCI WARTA:
                    </div>
                    <ul className="text-xs text-sky-950 space-y-1 font-medium">
                      {mainArticle.keyTakeaways.slice(0, 2).map((point, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-yellow-500 font-black leading-none mt-0.5">▪</span>
                          <span className="line-clamp-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Author & Action footer */}
              <div className="flex items-center justify-between pt-3 border-t border-sky-100 mt-1">
                <div className="flex items-center gap-2.5">
                  <img
                    src={mainArticle.author.avatar}
                    alt={mainArticle.author.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-sky-300"
                  />
                  <div>
                    <div className="text-xs font-bold text-sky-950">{mainArticle.author.name}</div>
                    <div className="text-[10px] text-sky-700 font-medium">{mainArticle.author.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <ArticleShareButton article={mainArticle} placement="top" size="sm" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black text-sky-900 group-hover:text-yellow-600 group-hover:translate-x-0.5 transition-all uppercase tracking-wider">
                    <span className="hidden sm:inline">BACA SELENGKAPNYA</span>
                    <span className="sm:hidden">BACA</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 2. Side Bento Grid Stack (Responsive: 1 col on mobile, 2-3 cols on tablet, 1 stack on desktop) */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4">
          
          {/* Bento Tile A: Highlight Yellow Live Card */}
          {sideArticles[0] && (
            <div
              id={`side-headline-${sideArticles[0].id}`}
              onClick={() => onSelectArticle(sideArticles[0])}
              className="group bg-yellow-200 border border-yellow-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black tracking-widest text-yellow-900 uppercase bg-yellow-300/80 px-2 py-0.5 rounded-md border border-yellow-400">
                  {sideArticles[0].categoryLabel}
                </span>
                <span className="text-[10px] font-mono font-bold text-yellow-800 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-yellow-600 animate-pulse" />
                  Live Update
                </span>
              </div>

              <h3 className="text-base font-bold text-sky-950 group-hover:text-yellow-800 transition-colors leading-snug my-2">
                {sideArticles[0].title}
              </h3>

              <div className="flex items-center justify-between text-xs text-yellow-900 pt-2 border-t border-yellow-300/80">
                <span className="text-[11px] font-semibold">{sideArticles[0].readTime}</span>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <ArticleShareButton article={sideArticles[0]} placement="top" size="sm" />
                  <span className="font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Baca <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bento Tile B: Navy Live Focus Card */}
          {sideArticles[1] && (
            <div
              id={`side-headline-${sideArticles[1].id}`}
              onClick={() => onSelectArticle(sideArticles[1])}
              className="group bg-sky-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer border border-sky-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-200">
                    {sideArticles[1].categoryLabel}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-yellow-400">PILIHAN HARI INI</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-yellow-300 transition-colors leading-snug my-2">
                {sideArticles[1].title}
              </h3>

              <div className="flex items-center justify-between text-[11px] text-sky-300 pt-2 border-t border-sky-800">
                <span>{sideArticles[1].publishedAt.split('•')[0]}</span>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <ArticleShareButton article={sideArticles[1]} placement="top" size="sm" variant="badge" />
                  <span className="text-yellow-400 font-bold flex items-center gap-0.5">
                    Simak <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bento Tile C: Sky Blue Card */}
          {sideArticles[2] && (
            <div
              id={`side-headline-${sideArticles[2].id}`}
              onClick={() => onSelectArticle(sideArticles[2])}
              className="group bg-sky-200 border border-sky-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-sky-900 uppercase bg-sky-300/80 px-2 py-0.5 rounded-md border border-sky-400/60">
                  {sideArticles[2].categoryLabel}
                </span>
                <span className="text-[10px] font-mono font-bold text-sky-700">
                  {sideArticles[2].views.toLocaleString('id-ID')} Views
                </span>
              </div>

              <h3 className="text-sm font-bold text-sky-950 group-hover:text-sky-700 transition-colors leading-snug my-1.5">
                {sideArticles[2].title}
              </h3>

              <div className="flex items-center justify-between text-[11px] text-sky-800 pt-2 border-t border-sky-300">
                <span className="font-semibold">{sideArticles[2].author.name}</span>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <ArticleShareButton article={sideArticles[2]} placement="top" size="sm" />
                  <span className="font-bold text-sky-900 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Buka <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

