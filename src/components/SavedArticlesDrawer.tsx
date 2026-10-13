import React, { useState, useMemo } from 'react';
import { X, Bookmark, Trash2, ArrowRight, BookOpen, Clock, Database, History, Eye, CheckCircle2 } from 'lucide-react';
import { NewsArticle } from '../types';

interface SavedArticlesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onRemoveSaved: (articleId: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
  readArticleIds?: string[];
  allArticles?: NewsArticle[];
  onClearReadHistory?: () => void;
}

export const SavedArticlesDrawer: React.FC<SavedArticlesDrawerProps> = ({
  isOpen,
  onClose,
  savedArticles,
  onSelectArticle,
  onRemoveSaved,
  onClearAll,
  readArticleIds = [],
  allArticles = [],
  onClearReadHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');

  // Compute read articles ordered by most recent (matching readArticleIds array reversed)
  const readArticles = useMemo(() => {
    if (!readArticleIds || readArticleIds.length === 0) return [];
    const idMap = new Map(allArticles.map((a) => [a.id, a]));
    const list: NewsArticle[] = [];
    // Process in reverse so newest clicked articles appear first
    for (let i = readArticleIds.length - 1; i >= 0; i--) {
      const art = idMap.get(readArticleIds[i]);
      if (art && !list.some((existing) => existing.id === art.id)) {
        list.push(art);
      }
    }
    return list;
  }, [readArticleIds, allArticles]);

  if (!isOpen) return null;

  return (
    <div
      id="saved-articles-drawer-backdrop"
      className="fixed inset-0 z-50 bg-sky-950/70 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l-2 border-yellow-400 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-sky-950 text-white flex items-center justify-between border-b border-sky-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-xs">
              {activeTab === 'saved' ? <Bookmark className="w-4 h-4" /> : <History className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight">
                {activeTab === 'saved' ? `Warta Tersimpan (${savedArticles.length})` : `Riwayat Baca (${readArticles.length})`}
              </h2>
              <p className="text-[11px] text-sky-200 font-mono">
                {activeTab === 'saved' ? 'Daftar bacaan warta pilihan Anda' : 'Warta yang baru saja Anda buka dan baca'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-sky-300 hover:text-white hover:bg-sky-800 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Tutup Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-sky-200 bg-sky-50/80 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-sky-950 text-yellow-300 shadow-xs border border-sky-900 font-black'
                : 'text-sky-800 hover:text-sky-950 hover:bg-sky-100/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Tersimpan</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'saved' ? 'bg-yellow-400 text-sky-950 font-black' : 'bg-sky-200 text-sky-900'
            }`}>
              {savedArticles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-sky-950 text-yellow-300 shadow-xs border border-sky-900 font-black'
                : 'text-sky-800 hover:text-sky-950 hover:bg-sky-100/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Baca</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'history' ? 'bg-yellow-400 text-sky-950 font-black' : 'bg-sky-200 text-sky-900'
            }`}>
              {readArticles.length}
            </span>
          </button>
        </div>

        {/* Action bar for Saved Tab */}
        {activeTab === 'saved' && savedArticles.length > 0 && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs font-medium">
            <span className="text-emerald-900 text-[11px] font-mono font-bold flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Cached IndexedDB (Offline Ready)
            </span>
            <button
              onClick={onClearAll}
              className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan Semua
            </button>
          </div>
        )}

        {/* Action bar for History Tab */}
        {activeTab === 'history' && readArticles.length > 0 && (
          <div className="px-4 py-2 bg-sky-50 border-b border-sky-100 flex items-center justify-between text-xs font-medium">
            <span className="text-sky-900 text-[11px] font-mono font-bold flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              {readArticles.length} Warta Terakhir Dikunjungi
            </span>
            {onClearReadHistory && (
              <button
                onClick={onClearReadHistory}
                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Riwayat
              </button>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'saved' ? (
            savedArticles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-sky-700">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 text-yellow-500 flex items-center justify-center mb-3 shadow-xs">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-sky-950 mb-1 uppercase tracking-tight">
                  Belum Ada Warta Disimpan
                </h3>
                <p className="text-xs text-sky-700 max-w-xs leading-relaxed font-medium">
                  Klik tombol bookmark pada artikel mana pun untuk menyimpannya ke dalam daftar bacaan cepat Anda.
                </p>
              </div>
            ) : (
              savedArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                  }}
                  className="group bg-white rounded-xl p-3 border border-sky-200 hover:border-yellow-400 hover:shadow-sm transition-all cursor-pointer flex gap-3 items-start relative"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-sky-950 flex-shrink-0">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                    <div>
                      <span className="text-[10px] font-black text-sky-900 bg-sky-100 px-1.5 py-0.5 rounded uppercase font-mono">
                        {article.categoryLabel}
                      </span>
                      <h4 className="text-xs font-bold text-sky-950 group-hover:text-yellow-600 line-clamp-2 leading-snug mt-1">
                        {article.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-sky-600 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-yellow-500" />
                        {article.readTime}
                      </span>
                      <button
                        onClick={(e) => onRemoveSaved(article.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-2 min-w-[32px] min-h-[32px] flex items-center justify-center transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                        title="Hapus dari simpanan"
                        aria-label="Hapus dari simpanan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            /* History Tab Content */
            readArticles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-sky-700">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mb-3 shadow-xs">
                  <History className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-sky-950 mb-1 uppercase tracking-tight">
                  Belum Ada Riwayat Baca
                </h3>
                <p className="text-xs text-sky-700 max-w-xs leading-relaxed font-medium">
                  Setiap warta yang Anda buka dan baca akan tercatat di tab ini secara otomatis, memudahkan Anda kembali membaca berita favorit.
                </p>
              </div>
            ) : (
              readArticles.map((article, idx) => (
                <div
                  key={`hist-${article.id}-${idx}`}
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                  }}
                  className="group bg-white rounded-xl p-3 border border-sky-200 hover:border-yellow-400 hover:shadow-sm transition-all cursor-pointer flex gap-3 items-start relative"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-sky-950 flex-shrink-0 relative">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1 left-1 px-1 bg-black/70 text-yellow-300 text-[8px] font-mono font-bold rounded">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-sky-900 bg-sky-100 px-1.5 py-0.5 rounded uppercase font-mono">
                          {article.categoryLabel}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Pernah Dibaca
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-sky-950 group-hover:text-yellow-600 line-clamp-2 leading-snug mt-1">
                        {article.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-sky-600 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-yellow-500" />
                        {article.readTime}
                      </span>
                      <span className="text-yellow-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Lanjut Baca <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-sky-100 bg-sky-50 text-center text-[11px] text-sky-700 font-mono font-medium">
          Arun News Reading &amp; Memory Engine
        </div>
      </div>
    </div>
  );
};

