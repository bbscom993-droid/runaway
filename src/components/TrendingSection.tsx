import React from 'react';
import { Flame, Eye, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { NewsArticle } from '../types';
import { ArticleShareButton } from './ArticleCard';

interface TrendingSectionProps {
  trendingArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  trendingArticles,
  onSelectArticle,
}) => {
  return (
    <section id="trending-section" className="bg-sky-900 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-sky-800 mb-8 overflow-hidden relative">
      <div className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sky-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 text-sky-950 fill-sky-950" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                Terpopuler & Paling Banyak Dibahas
              </h2>
              <p className="text-xs text-sky-200">
                Peringkat artikel dengan interaksi dan pembaca tertinggi 24 jam terakhir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-black text-sky-950 bg-yellow-400 px-3 py-1 rounded-lg border border-yellow-500 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5" />
            LIVE TREN
          </div>
        </div>

        {/* 5 Ranked Bento Cards Grid (Responsive across mobile, tablet, and web) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {trendingArticles.slice(0, 5).map((article, idx) => (
            <div
              key={article.id}
              id={`trending-card-${article.id}`}
              onClick={() => onSelectArticle(article)}
              className="group bg-sky-950/80 hover:bg-sky-950 rounded-xl p-4 border border-sky-800 hover:border-yellow-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Bento rank number */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-black italic text-yellow-400 leading-none">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-200 bg-sky-900 px-2 py-0.5 rounded border border-sky-700">
                    {article.categoryLabel}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-yellow-300 transition-colors line-clamp-3 leading-snug mb-2">
                  {article.title}
                </h3>
              </div>

              <div className="pt-2.5 border-t border-sky-800/80 flex items-center justify-between text-[11px] text-sky-300">
                <span className="flex items-center gap-1 font-mono text-[10px]">
                  <Eye className="w-3 h-3 text-yellow-400" />
                  {article.views.toLocaleString('id-ID')}
                </span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <ArticleShareButton article={article} variant="badge" size="sm" placement="top" />
                  <span className="text-yellow-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-xs">
                    Baca <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
