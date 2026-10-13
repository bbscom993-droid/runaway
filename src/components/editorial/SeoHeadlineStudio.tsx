import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  X, 
  Copy, 
  Check, 
  Wand2, 
  Flame, 
  TrendingUp, 
  Layers, 
  Target, 
  Lightbulb, 
  FileText, 
  ArrowRight, 
  BarChart2, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Tag as TagIcon,
  Compass,
  Zap,
  Edit3
} from 'lucide-react';
import { Category, NewsArticle, SeoHeadlineGenerationResponse, SeoHeadlineVariation } from '../../types';

interface SeoHeadlineStudioProps {
  categories: Category[];
  showToast: (msg: string) => void;
  onApplyToNewArticle?: (title: string, category: string, tags: string[]) => void;
  onApplyToCurrentArticle?: (title: string, tags: string[]) => void;
  isModalMode?: boolean;
  initialKeywords?: string[];
  initialCategory?: string;
  initialTopic?: string;
  onCloseModal?: () => void;
}

const POPULAR_KEYWORDS_PRESETS: { category: string; keywords: string[] }[] = [
  {
    category: '🔥 Isu Hangat & Nasional',
    keywords: [
      'IKN Nusantara',
      'Pilkada Serentak',
      'Subsidi BBM',
      'Kereta Cepat',
      'Harga Beras',
      'BPJS Kesehatan',
      'KPK',
      'Mahkamah Konstitusi'
    ]
  },
  {
    category: '💼 Ekonomi & Bisnis',
    keywords: [
      'Bursa Saham IHSG',
      'Investasi Asing',
      'Suku Bunga BI',
      'UMKM Digital',
      'Nilai Tukar Rupiah',
      'Ekspor Komoditas',
      'Pajak Usaha'
    ]
  },
  {
    category: '🛡️ Hukum, Kriminal & Daerah',
    keywords: [
      'Polisi Siber',
      'Sindikat Penipuan',
      'Banjir Rob',
      'Infrastruktur Tol',
      'Bantuan Sosial',
      'Pilkada Daerah'
    ]
  },
  {
    category: '⚽ Olahraga & Gaya Hidup',
    keywords: [
      'Timnas Indonesia',
      'Kualifikasi Piala Dunia',
      'Bulu Tangkis All England',
      'Kesehatan Mental',
      'Kecerdasan Buatan'
    ]
  }
];

export const SeoHeadlineStudio: React.FC<SeoHeadlineStudioProps> = ({
  categories,
  showToast,
  onApplyToNewArticle,
  onApplyToCurrentArticle,
  isModalMode = false,
  initialKeywords = [],
  initialCategory = 'nasional',
  initialTopic = '',
  onCloseModal
}) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    initialKeywords.length > 0 ? initialKeywords : ['Kereta Cepat', 'Investasi Daerah']
  );
  const [customKeywordInput, setCustomKeywordInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'nasional');
  const [selectedTone, setSelectedTone] = useState<string>('Menarik & SEO Standard (Pencarian Organik Tinggi)');
  const [additionalTopicContext, setAdditionalTopicContext] = useState<string>(initialTopic || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SeoHeadlineGenerationResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAllTags, setCopiedAllTags] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<SeoHeadlineGenerationResponse[]>([]);

  // Add custom keyword
  const handleAddCustomKeyword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customKeywordInput.trim();
    if (!trimmed) return;

    // Support comma separated
    const splitWords = trimmed.split(/[,;]+/).map(w => w.trim()).filter(Boolean);
    const updated = [...selectedKeywords];
    
    splitWords.forEach(word => {
      if (!updated.some(k => k.toLowerCase() === word.toLowerCase())) {
        updated.push(word);
      }
    });

    setSelectedKeywords(updated);
    setCustomKeywordInput('');
  };

  // Toggle keyword from presets
  const handleToggleKeyword = (kw: string) => {
    if (selectedKeywords.some(k => k.toLowerCase() === kw.toLowerCase())) {
      setSelectedKeywords(prev => prev.filter(k => k.toLowerCase() !== kw.toLowerCase()));
    } else {
      if (selectedKeywords.length >= 8) {
        showToast('Maksimal 8 kata kunci pilihan untuk ketajaman fokus SEO.');
        return;
      }
      setSelectedKeywords(prev => [...prev, kw]);
    }
  };

  // Remove single keyword
  const handleRemoveKeyword = (kw: string) => {
    setSelectedKeywords(prev => prev.filter(k => k !== kw));
  };

  // Clear all keywords
  const handleClearAllKeywords = () => {
    setSelectedKeywords([]);
  };

  // Generate Headlines via Gemini API
  const handleGenerateHeadlines = async () => {
    if (selectedKeywords.length === 0 && !additionalTopicContext.trim()) {
      showToast('Pilih atau masukkan setidaknya 1 kata kunci atau topik berita.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-seo-headlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: selectedKeywords,
          category: selectedCategory,
          tone: selectedTone,
          topic: additionalTopicContext
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi layanan generator headline AI.');
      }

      const data: SeoHeadlineGenerationResponse = await response.json();
      setResults(data);
      setGenerationHistory(prev => [data, ...prev.slice(0, 4)]);
      showToast('✨ 5 Variasi headline SEO berhasil dihasilkan oleh Gemini AI!');
    } catch (err: any) {
      console.error('Error generating headlines:', err);
      showToast(err.message || 'Terjadi gangguan saat memproses headline SEO.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy single headline
  const handleCopyHeadline = (headline: string, id: string) => {
    navigator.clipboard.writeText(headline);
    setCopiedId(id);
    showToast(`Judul "${headline.slice(0, 30)}..." berhasil disalin.`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy all suggested tags
  const handleCopyAllTags = () => {
    if (!results || !results.suggestedTags) return;
    const tagString = results.suggestedTags.join(', ');
    navigator.clipboard.writeText(tagString);
    setCopiedAllTags(true);
    showToast('Semua tagar SEO berhasil disalin ke papan klip.');
    setTimeout(() => setCopiedAllTags(false), 2500);
  };

  // Helper for style badges
  const getStyleBadgeColor = (style: string) => {
    if (style.includes('Investigatif')) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (style.includes('Penasaran') || style.includes('CTR')) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (style.includes('Angka') || style.includes('Data')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (style.includes('Breaking') || style.includes('Urgensi')) return 'bg-red-500 text-white border-red-600';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 90) return 'text-sky-700 bg-sky-50 border-sky-300';
    return 'text-amber-700 bg-amber-50 border-amber-300';
  };

  return (
    <div className={`space-y-6 ${isModalMode ? 'p-1' : 'bg-white rounded-3xl p-5 sm:p-7 border border-sky-200 shadow-sm'}`}>
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-sky-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Background ambient light */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-yellow-400 text-sky-950 font-black text-[10px] px-2.5 py-0.5 rounded font-mono uppercase tracking-wider shadow-2xs">
              Studio Headline SEO AI
            </span>
            <span className="text-xs text-sky-300 font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Powered by Gemini 3.7 Flash
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Generator 5 Variasi Judul Berita Ramah SEO & High CTR</span>
          </h2>
          <p className="text-xs text-sky-200 mt-1 max-w-2xl leading-relaxed">
            Pilih kata kunci target, atur sudut pandang redaksi, dan biarkan kecerdasan buatan Gemini merumuskan 5 opsi judul berita berkualitas tinggi yang mematuhi pedoman Google News, Discover, serta kaidah jurnalistik nasional.
          </p>
        </div>

        {isModalMode && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="self-start md:self-auto p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Main Studio 2-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Keywords & Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Box A: Active Selected Keywords */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-sky-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono flex items-center gap-1.5">
                <Target className="w-4 h-4 text-yellow-600" />
                <span>Kata Kunci Target ({selectedKeywords.length})</span>
              </label>
              {selectedKeywords.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllKeywords}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {/* Selected Keywords Badges List */}
            {selectedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2.5 bg-white rounded-xl border border-sky-200">
                {selectedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-400 text-sky-950 font-bold text-xs shadow-2xs group"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="p-0.5 hover:bg-yellow-500 rounded-md text-sky-950 transition-colors"
                      title={`Hapus "${kw}"`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-dashed border-sky-300 text-center text-xs text-slate-500">
                Belum ada kata kunci yang dipilih. Klik kata kunci preset di bawah atau ketik kata kunci Anda sendiri.
              </div>
            )}

            {/* Custom Keyword Input Form */}
            <form onSubmit={handleAddCustomKeyword} className="flex gap-1.5">
              <input
                type="text"
                value={customKeywordInput}
                onChange={(e) => setCustomKeywordInput(e.target.value)}
                placeholder="Ketik kata kunci kustom lalu Enter..."
                className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-sky-900 hover:bg-sky-950 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>
          </div>

          {/* Box B: Preset Keyword Categories Pickers */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-700" />
                <span>Pilih Kata Kunci Populer / Trending</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Klik untuk memilih</span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {POPULAR_KEYWORDS_PRESETS.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-sky-900 font-mono">{group.category}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.keywords.map((kw, kwIdx) => {
                      const isSelected = selectedKeywords.some(k => k.toLowerCase() === kw.toLowerCase());
                      return (
                        <button
                          key={kwIdx}
                          type="button"
                          onClick={() => handleToggleKeyword(kw)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-yellow-400 text-sky-950 border-yellow-500 shadow-2xs font-black'
                              : 'bg-sky-50/70 hover:bg-sky-100 text-slate-700 border-sky-200'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {kw}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box C: Editorial Parameters (Rubrik, Angle/Tone, Topic Context) */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-sky-200 shadow-2xs space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Pengaturan & Sudut Pandang Redaksi</span>
            </span>

            {/* Rubrik */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Kanal / Rubrik Berita:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {categories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone / Angle */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Gaya / Karakter Headline:
              </label>
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="Menarik & SEO Standard (Pencarian Organik Tinggi)">⭐ Seimbang & SEO Standard (Search Volume Tinggi)</option>
                <option value="Investigatif & Tajam (Wibawa Jurnalistik)">🔍 Jurnalistik Investigatif & Tajam</option>
                <option value="High CTR & Penasaran (Viral & Engagement)">🚀 High CTR & Menggugah Penasaran (Social Friendly)</option>
                <option value="Angka, Data & Listicle (Faktual & Terukur)">📊 Berbasis Angka & Fakta Terverifikasi</option>
                <option value="Breaking News & Urgensi Cepat">🔴 Breaking News & Urgensi Cepat</option>
              </select>
            </div>

            {/* Topic Context (Optional) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Catatan Pokok Berita (Opsional):
              </label>
              <textarea
                rows={2}
                value={additionalTopicContext}
                onChange={(e) => setAdditionalTopicContext(e.target.value)}
                placeholder="Contoh: Rapat koordinasi kementerian membahas percepatan perizinan dan investasi..."
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Main Generate Button */}
            <button
              type="button"
              disabled={isLoading || (selectedKeywords.length === 0 && !additionalTopicContext.trim())}
              onClick={handleGenerateHeadlines}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading || (selectedKeywords.length === 0 && !additionalTopicContext.trim())
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-300 active:scale-98 text-sky-950 border border-yellow-500'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-950" />
                  <span>Gemini AI Sedang Merumuskan 5 Headline...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-sky-950" />
                  <span>Hasilkan 5 Variasi Headline SEO</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: 5 Generated SEO Headline Variations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {results ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Top Results Meta Header */}
              <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-sky-950 uppercase font-mono">
                      5 Pilihan Headline Teroptimasi
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Berdasarkan kata kunci: <strong className="text-sky-900 font-mono">{results.analyzedKeywords.join(', ')}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleGenerateHeadlines}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-950 font-bold text-[11px] border border-sky-200 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Hasilkan Variasi Lain</span>
                  </button>
                </div>
              </div>

              {/* 5 Headline Cards */}
              <div className="space-y-3.5">
                {results.variations.map((item: SeoHeadlineVariation, index: number) => {
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id || index}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-200 shadow-xs hover:border-yellow-400 hover:shadow-md transition-all space-y-3 group"
                    >
                      {/* Card Top Badges & SEO Metrics */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-sky-950 text-yellow-400 font-mono font-black text-[11px] flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase border ${getStyleBadgeColor(item.style)}`}>
                            {item.style}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.charLength} Karakter {item.charLength >= 50 && item.charLength <= 75 ? '(Ideal Google SERP)' : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* CTR Potential */}
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                            <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
                            <span>CTR: {item.clickPotential}</span>
                          </span>

                          {/* SEO Score */}
                          <span className={`flex items-center gap-1 text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg border ${getScoreColor(item.seoScore)}`}>
                            <span>Skor SEO:</span>
                            <strong>{item.seoScore}/100</strong>
                          </span>
                        </div>
                      </div>

                      {/* Headline Text */}
                      <div className="text-sm sm:text-base font-black text-sky-950 leading-snug group-hover:text-sky-900">
                        {item.headline}
                      </div>

                      {/* SEO Rationale & Key Terms */}
                      <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-xs space-y-1.5">
                        <div className="text-[11px] text-slate-700 leading-relaxed">
                          <strong className="text-sky-950 font-mono">💡 Analisis Algoritma: </strong>
                          {item.seoRationale}
                        </div>

                        {item.focusKeywords && item.focusKeywords.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1 text-[10px]">
                            <span className="text-slate-500 font-mono font-bold">Kata Kunci:</span>
                            {item.focusKeywords.map((fk, fIdx) => (
                              <span key={fIdx} className="bg-sky-200/70 text-sky-950 px-1.5 py-0.2 rounded font-bold">
                                #{fk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleCopyHeadline(item.headline, item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Tersalin!' : 'Salin Judul'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {/* If in modal mode editing existing article */}
                          {onApplyToCurrentArticle && (
                            <button
                              type="button"
                              onClick={() => {
                                onApplyToCurrentArticle(item.headline, results.suggestedTags || []);
                                showToast(`Judul artikel berhasil diperbarui ke: "${item.headline.slice(0, 30)}..."`);
                                if (onCloseModal) onCloseModal();
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Terapkan ke Naskah Ini</span>
                            </button>
                          )}

                          {/* Create new article with this headline */}
                          {onApplyToNewArticle && (
                            <button
                              type="button"
                              onClick={() => {
                                onApplyToNewArticle(item.headline, selectedCategory, results.suggestedTags || []);
                                showToast(`Membuka editor untuk: "${item.headline.slice(0, 30)}..."`);
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-xs border border-yellow-500 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Tulis Warta Baru dengan Judul Ini</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Suggested Tags & Editorial Advice Card */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                
                {/* Suggested Tags (7 cols) */}
                <div className="sm:col-span-7 bg-white rounded-2xl p-4 border border-sky-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono flex items-center gap-1.5">
                      <TagIcon className="w-3.5 h-3.5 text-yellow-600" />
                      <span>Rekomendasi Tagar Pendukung</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAllTags}
                      className="text-[10px] font-bold text-sky-800 hover:text-sky-950 hover:underline flex items-center gap-1"
                    >
                      {copiedAllTags ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAllTags ? 'Tersalin' : 'Salin Semua Tag'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(results.suggestedTags || []).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-950 font-bold text-xs font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Editorial Advice (5 cols) */}
                <div className="sm:col-span-5 bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-4 border border-indigo-200 shadow-2xs space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-indigo-950 font-mono flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                      <span>Tips SEO Redaksi</span>
                    </div>
                    <p className="text-xs text-indigo-950/90 mt-1 leading-relaxed">
                      {results.editorialTips}
                    </p>
                  </div>
                  <div className="text-[10px] text-indigo-700 font-mono font-bold pt-2 border-t border-indigo-100">
                    Sistem: {results.poweredBy}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Empty State Guide */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-sky-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 text-yellow-500 flex items-center justify-center mx-auto shadow-xs">
                <Wand2 className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-black text-sky-950">
                  Siap Menghasilkan Headline Berita Juara?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilih beberapa kata kunci target di panel kiri, pilih kanal rubrik berita, lalu tekan tombol <strong className="text-sky-950">"Hasilkan 5 Variasi Headline SEO"</strong> untuk melihat analisis algoritma dan opsi judul terbaik.
                </p>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-lg mx-auto text-left">
                <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-xs">
                  <div className="font-bold text-sky-950 mb-0.5">🎯 Front-Loaded</div>
                  <div className="text-[11px] text-slate-600">Kata kunci utama di depan untuk SERP Google.</div>
                </div>
                <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-xs">
                  <div className="font-bold text-sky-950 mb-0.5">⚡ 5 Formula Unik</div>
                  <div className="text-[11px] text-slate-600">Investigatif, data, viral, breaking, dan evergreen.</div>
                </div>
                <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-xs">
                  <div className="font-bold text-sky-950 mb-0.5">📈 Bebas Clickbait</div>
                  <div className="text-[11px] text-slate-600">Menaikkan CTR secara etis dan berbobot pers.</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
