import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  HelpCircle, 
  ExternalLink, 
  Volume2, 
  Filter, 
  Sparkles,
  Tag,
  Check
} from 'lucide-react';
import { GlossaryTerm, GLOSSARY_TERMS } from '../data/glossaryData';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string | null;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  initialTerm = null,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialTerm || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);

  // Sync initialTerm when opened
  React.useEffect(() => {
    if (initialTerm) {
      setSearchQuery(initialTerm);
      const match = GLOSSARY_TERMS.find(
        (t) =>
          t.term.toLowerCase() === initialTerm.toLowerCase() ||
          t.aliases?.some((a) => a.toLowerCase() === initialTerm.toLowerCase())
      );
      if (match) {
        setActiveTerm(match);
      }
    }
  }, [initialTerm, isOpen]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    GLOSSARY_TERMS.forEach((t) => set.add(t.category));
    return ['all', ...Array.from(set)];
  }, []);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.aliases?.some((a) => a.toLowerCase().includes(q));

      return matchCat && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handlePronounce = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'id-ID';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div
      id="glossary-modal-overlay"
      className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 px-5 sm:px-6 py-4 border-b border-sky-800 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-md border border-yellow-300">
              <BookOpen className="w-5 h-5 text-sky-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-yellow-400 font-mono">
                  Glosarium Istilah Warta
                </h3>
                <span className="bg-sky-800 text-sky-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-sky-700">
                  {GLOSSARY_TERMS.length} Entri
                </span>
              </div>
              <p className="text-xs text-sky-200 font-medium">
                Kamus & referensi definisi istilah teknis, regulasi, dan terminologi berita terkini.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-sky-300 hover:text-white hover:bg-sky-800 transition-colors"
            title="Tutup Glosarium"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 bg-sky-50/80 border-b border-sky-100 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari istilah teknis (misal: GoA 3, Anti-Buzzer, 5W+1H, KPR Flat)..."
              className="w-full pl-10 pr-10 py-2.5 bg-white rounded-2xl border border-sky-200 text-xs sm:text-sm font-medium text-sky-950 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-mono font-bold text-sky-800 flex-shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-yellow-600" /> Kategori:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-yellow-400 text-sky-950 shadow-2xs border border-yellow-500 font-black'
                    : 'bg-white text-sky-800 border border-sky-200 hover:bg-sky-100'
                }`}
              >
                {cat === 'all' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms List & Detail View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-10">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-black text-slate-700">Istilah Tidak Ditemukan</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
                Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTerms.map((item) => {
                const isSelected = activeTerm?.term === item.term;
                return (
                  <div
                    key={item.term}
                    onClick={() => setActiveTerm(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? 'bg-sky-950 text-white border-yellow-400 shadow-md ring-2 ring-yellow-400/40'
                        : 'bg-white hover:bg-sky-50 text-slate-800 border-sky-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black tracking-tight ${isSelected ? 'text-yellow-400' : 'text-sky-950'}`}>
                          {item.term}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePronounce(item.term);
                          }}
                          className={`p-1 rounded-lg ${isSelected ? 'text-yellow-300 hover:bg-sky-900' : 'text-sky-700 hover:bg-sky-100'} transition-colors`}
                          title="Dengarkan Pengucapan"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-sky-900 text-sky-200 border border-sky-800'
                          : 'bg-sky-100 text-sky-900 border border-sky-200'
                      }`}>
                        {item.category}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed font-medium ${isSelected ? 'text-sky-100' : 'text-slate-600'}`}>
                      {item.definition}
                    </p>

                    {item.exampleUsage && (
                      <div className={`p-2.5 rounded-xl text-[11px] font-mono ${
                        isSelected ? 'bg-sky-900/90 text-yellow-200/90 border border-sky-800' : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        <strong className="font-bold">Contoh:</strong> "{item.exampleUsage}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Tips: Klik kata istilah di dalam teks berita untuk melihat definisi kilat.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black uppercase tracking-wider text-xs border border-yellow-500 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
