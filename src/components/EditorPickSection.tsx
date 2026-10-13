import React from 'react';
import { Award, Quote, Clock, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { NewsArticle, EditorialPiece } from '../types';

interface EditorPickSectionProps {
  editorArticles: NewsArticle[];
  editorialPieces: EditorialPiece[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const EditorPickSection: React.FC<EditorPickSectionProps> = ({
  editorArticles,
  editorialPieces,
  onSelectArticle,
}) => {
  return (
    <section id="editor-pick-section" className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Pilihan Redaksi (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-400 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-900 flex items-center justify-center text-white shadow-xs">
                  <Award className="w-4 h-4 text-yellow-400" />
                </div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Pilihan Redaksi
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-900 bg-sky-100 px-2.5 py-1 rounded-md border border-sky-200">
                LIPUTAN KHUSUS
              </span>
            </div>

            <div className="space-y-3">
              {editorArticles.slice(0, 3).map((article) => (
                <div
                  key={article.id}
                  onClick={() => onSelectArticle(article)}
                  className="group p-3 rounded-xl border border-sky-100 hover:border-yellow-400 hover:bg-sky-50/60 transition-all cursor-pointer flex flex-col sm:flex-row gap-3.5 items-start"
                >
                  <div className="w-full sm:w-36 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-sky-950">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-sky-700 font-mono mb-1">
                      <span className="font-bold uppercase text-sky-900">{article.categoryLabel}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-sky-950 group-hover:text-yellow-600 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Kolom Opini & Editorial (5 cols Bento Yellow Card) */}
        <div className="lg:col-span-5 bg-yellow-200 border border-yellow-300 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-400 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-950 flex items-center justify-center text-yellow-400 shadow-xs">
                  <Quote className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Kolom Opini & Esai
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-yellow-900 bg-yellow-300 px-2.5 py-0.5 rounded-md border border-yellow-400">
                GAGASAN
              </span>
            </div>

            <div className="space-y-3">
              {editorialPieces.map((ed) => (
                <div
                  key={ed.id}
                  className="bg-white rounded-xl p-3.5 border border-yellow-300/80 shadow-2xs hover:border-sky-900 transition-all cursor-pointer group"
                >
                  <p className="text-xs italic text-slate-700 font-editorial leading-relaxed mb-2.5">
                    "{ed.quote}"
                  </p>

                  <h4 className="text-xs font-bold text-sky-950 group-hover:text-yellow-600 transition-colors mb-2.5 leading-snug">
                    {ed.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <img
                        src={ed.authorAvatar}
                        alt={ed.authorName}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover border border-yellow-400"
                      />
                      <div>
                        <div className="text-[11px] font-bold text-sky-950">{ed.authorName}</div>
                        <div className="text-[10px] text-sky-700 font-medium">{ed.authorRole}</div>
                      </div>
                    </div>

                    <span className="text-[11px] text-sky-900 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 uppercase tracking-wider">
                      Ulas <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
