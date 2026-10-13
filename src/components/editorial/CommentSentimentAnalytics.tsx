import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Smile, 
  Meh, 
  Frown, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  ChevronRight, 
  ThumbsUp, 
  Copy, 
  Check, 
  BarChart2, 
  Layers, 
  ExternalLink,
  BrainCircuit,
  Filter,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { NewsArticle, ArticlePublicReactionAnalysis, NewsComment } from '../../types';

interface CommentSentimentAnalyticsProps {
  articles: NewsArticle[];
  showToast: (msg: string) => void;
  onOpenEditArticle?: (article: NewsArticle) => void;
}

export const CommentSentimentAnalytics: React.FC<CommentSentimentAnalyticsProps> = ({
  articles,
  showToast,
  onOpenEditArticle
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [analysisMap, setAnalysisMap] = useState<Record<string, ArticlePublicReactionAnalysis>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positif' | 'netral' | 'kritis'>('all');

  const currentArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];
  const currentAnalysis = currentArticle ? analysisMap[currentArticle.id] : null;

  // Filtered articles list
  const filteredArticles = articles.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.categoryLabel.toLowerCase().includes(q);
  });

  const handleAnalyzeSentiment = async (article: NewsArticle) => {
    if (!article) return;
    
    // Check if article has comments or seed sample comments if empty
    let articleComments = article.comments || [];
    if (articleComments.length === 0) {
      articleComments = [
        {
          id: `c-sample-1`,
          userName: 'Rian Pratama',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
          content: 'Laporan ini sangat mendalam dan membuka wawasan. Kami di daerah sangat menunggu realisasi kelanjutannya.',
          timestamp: '2 jam lalu',
          likes: 14
        },
        {
          id: `c-sample-2`,
          userName: 'Dr. Hendra Wijaya',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
          content: 'Pemberitaan cukup berimbang, namun perlu diperhatikan juga kesiapan infrastruktur pendukung agar implementasi tidak terhambat.',
          timestamp: '3 jam lalu',
          likes: 8
        },
        {
          id: `c-sample-3`,
          userName: 'Siti Rahmawati',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
          content: 'Terima kasih Arun News selalu terdepan menyajikan warta akurat tanpa sensasionalisme berlebih.',
          timestamp: '4 jam lalu',
          likes: 21
        },
        {
          id: `c-sample-4`,
          userName: 'Bambang Kusuma',
          userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
          content: 'Bagaimana dengan pengawasannya di tingkat lapangan? Jangan sampai aturan bagus tapi eksekusinya longgar.',
          timestamp: '5 jam lalu',
          likes: 5
        }
      ];
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze-comments-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          articleTitle: article.title,
          comments: articleComments
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.analysis) {
        setAnalysisMap((prev) => ({
          ...prev,
          [article.id]: data.analysis
        }));
        showToast(`Analisis sentimen Gemini AI untuk "${article.title.slice(0, 30)}..." selesai!`);
      }
    } catch (err: any) {
      console.error('Failed to analyze sentiment:', err);
      showToast('Gagal menganalisis sentimen komentar dengan Gemini API.');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically analyze the first article on initial load if not analyzed yet
  useEffect(() => {
    if (currentArticle && !analysisMap[currentArticle.id]) {
      handleAnalyzeSentiment(currentArticle);
    }
  }, [selectedArticleId]);

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    showToast('Rangkuman reaksi publik disalin ke papan klip.');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-sky-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-xs">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-white font-brand">
              Analisis Sentimen Komentar & Reaksi Publik (Gemini AI)
            </h2>
          </div>
          <p className="text-xs text-sky-200 font-medium leading-relaxed">
            Didukung oleh model bahasa <strong>Gemini 3.7 Flash</strong> untuk membedah opini pembaca secara otomatis, mendeteksi polarisasi sentimen, serta merangkum respons dan aspirasi publik secara instan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {currentArticle && (
            <button
              onClick={() => handleAnalyzeSentiment(currentArticle)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Menganalisis...' : 'Analisis Ulang AI'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Article Selection List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-900" />
                <span>Pilih Naskah Artikel ({articles.length})</span>
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul berita..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-sky-200 rounded-xl text-xs text-sky-950 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Articles List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredArticles.map((article) => {
                const isSelected = article.id === selectedArticleId;
                const cached = analysisMap[article.id];
                const commentCount = article.comments?.length || 4;

                return (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticleId(article.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-950 text-white border-yellow-400 ring-2 ring-yellow-400/40 shadow-xs'
                        : 'bg-slate-50 hover:bg-sky-50/70 border-sky-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        isSelected ? 'bg-yellow-400 text-sky-950' : 'bg-sky-100 text-sky-900'
                      }`}>
                        {article.categoryLabel}
                      </span>

                      <div className="flex items-center gap-1 text-[10px] opacity-80 font-mono">
                        <MessageSquare className="w-3 h-3" />
                        <span>{commentCount} Komentar</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold line-clamp-2 leading-snug">
                      {article.title}
                    </h4>

                    {/* Quick Badge if analyzed */}
                    {cached && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                        <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                          cached.overallSentiment === 'Positif'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : cached.overallSentiment === 'Kritis / Keberatan'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {cached.overallSentiment} ({cached.sentimentScore}%)
                        </span>
                        <span className="opacity-60 text-[9px]">AI Siap</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Area: Deep-Dive AI Sentiment Dashboard (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {isLoading && !currentAnalysis ? (
            <div className="bg-white rounded-2xl p-12 border border-sky-200 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 text-yellow-600 flex items-center justify-center animate-bounce">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-sky-950 font-mono">
                  Sedang Menganalisis Sentimen Komentar...
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Gemini API sedang mengekstraksi emosi pembaca, mendeteksi opini dominan, dan menyusun intisari reaksi publik.
                </p>
              </div>
            </div>
          ) : currentAnalysis ? (
            <div className="space-y-5">
              
              {/* Selected Article Meta Card */}
              <div className="bg-white rounded-2xl p-5 border border-sky-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 text-[10px] font-mono font-bold uppercase">
                      {currentArticle?.categoryLabel}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {currentAnalysis.totalCommentsAnalyzed} Komentar Dianalisis
                    </span>
                  </div>
                  
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {currentAnalysis.poweredBy}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-sky-950 leading-snug">
                  {currentArticle?.title}
                </h3>
              </div>

              {/* 3 Metric Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Overall Sentiment Mood */}
                <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-xs flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    currentAnalysis.overallSentiment === 'Positif'
                      ? 'bg-emerald-100 text-emerald-700'
                      : currentAnalysis.overallSentiment === 'Kritis / Keberatan'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {currentAnalysis.overallSentiment === 'Positif' ? (
                      <Smile className="w-6 h-6" />
                    ) : currentAnalysis.overallSentiment === 'Kritis / Keberatan' ? (
                      <Frown className="w-6 h-6" />
                    ) : (
                      <Meh className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Sentimen Keseluruhan
                    </div>
                    <div className="text-sm sm:text-base font-black text-sky-950 mt-0.5">
                      {currentAnalysis.overallSentiment}
                    </div>
                  </div>
                </div>

                {/* 2. Sentiment Score Index */}
                <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-xs flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center flex-shrink-0 font-mono font-black text-lg">
                    {currentAnalysis.sentimentScore}%
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Indeks Kepuasan Publik
                    </div>
                    <div className="text-xs font-bold text-slate-700 mt-0.5">
                      {currentAnalysis.sentimentScore >= 70 ? 'Dukungan Kuat' : currentAnalysis.sentimentScore >= 45 ? 'Netral Berimbang' : 'Perlu Klarifikasi'}
                    </div>
                  </div>
                </div>

                {/* 3. Sentiment Breakdown Bar */}
                <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-600">
                    <span>Proporsi Reaksi</span>
                    <span className="text-emerald-700">{currentAnalysis.breakdown.positive}% Positif</span>
                  </div>

                  {/* Multi-color segment bar */}
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
                    <div 
                      style={{ width: `${currentAnalysis.breakdown.positive}%` }} 
                      className="bg-emerald-500 h-full" 
                      title={`Positif: ${currentAnalysis.breakdown.positive}%`}
                    />
                    <div 
                      style={{ width: `${currentAnalysis.breakdown.neutral}%` }} 
                      className="bg-amber-400 h-full" 
                      title={`Netral: ${currentAnalysis.breakdown.neutral}%`}
                    />
                    <div 
                      style={{ width: `${currentAnalysis.breakdown.negative}%` }} 
                      className="bg-rose-500 h-full" 
                      title={`Kritis: ${currentAnalysis.breakdown.negative}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {currentAnalysis.breakdown.positive}% Pos
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> {currentAnalysis.breakdown.neutral}% Neu
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {currentAnalysis.breakdown.negative}% Neg
                    </span>
                  </div>
                </div>
              </div>

              {/* Narrative Public Reaction Summary Box */}
              <div className="bg-gradient-to-br from-amber-50/80 via-yellow-50/50 to-sky-50 rounded-2xl p-5 border border-yellow-300/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-sky-950 font-mono">
                    <Sparkles className="w-4 h-4 text-yellow-600" />
                    <span>Rangkuman Reaksi Publik (Editorial Insight)</span>
                  </div>
                  
                  <button
                    onClick={() => handleCopySummary(currentAnalysis.publicReactionSummary)}
                    className="flex items-center gap-1 text-[11px] font-bold text-sky-900 hover:text-sky-950 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-yellow-200 transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedSummary ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                    <span>{copiedSummary ? 'Tersalin' : 'Salin Catatan'}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  "{currentAnalysis.publicReactionSummary}"
                </p>

                {/* Key Themes Chips */}
                <div className="pt-2 border-t border-yellow-200/60 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-600 mr-1">
                    Tema Utama Diskusi:
                  </span>
                  {currentAnalysis.keyThemes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-white text-sky-950 text-[11px] font-bold border border-yellow-300 shadow-2xs"
                    >
                      #{theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* 2-Column: Top Compliments vs Top Concerns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Positives */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-emerald-100 text-xs font-black uppercase text-emerald-950 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sorotan Positif & Apresiasi Pembaca</span>
                  </div>
                  <ul className="space-y-2">
                    {currentAnalysis.topCompliments.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concerns / Critiques */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-rose-100 text-xs font-black uppercase text-rose-950 font-mono">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Kekhawatiran & Masukan Kritis Warga</span>
                  </div>
                  <ul className="space-y-2">
                    {currentAnalysis.topConcerns.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Analyzed Comments Stream */}
              <div className="bg-white rounded-2xl p-5 border border-sky-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sky-100 gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-900" />
                    <h4 className="text-xs sm:text-sm font-black uppercase text-sky-950 font-mono">
                      Perincian Sentimen Tiap Komentar ({currentAnalysis.analyzedComments.length})
                    </h4>
                  </div>

                  {/* Filter Pill */}
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    <button
                      onClick={() => setFilterSentiment('all')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        filterSentiment === 'all' ? 'bg-sky-950 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      onClick={() => setFilterSentiment('positif')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        filterSentiment === 'positif' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      Positif
                    </button>
                    <button
                      onClick={() => setFilterSentiment('netral')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        filterSentiment === 'netral' ? 'bg-amber-500 text-sky-950' : 'bg-amber-50 text-amber-900'
                      }`}
                    >
                      Netral
                    </button>
                    <button
                      onClick={() => setFilterSentiment('kritis')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        filterSentiment === 'kritis' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      Kritis
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentAnalysis.analyzedComments
                    .filter((c) => filterSentiment === 'all' || c.sentiment === filterSentiment)
                    .map((item, idx) => {
                      return (
                        <div
                          key={item.id || idx}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-sky-950">{item.userName}</span>
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                                item.sentiment === 'positif'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : item.sentiment === 'kritis'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}>
                                {item.sentiment}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-500 font-mono italic">
                              Emosi: {item.emotion}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 font-medium">
                            {item.highlight}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-sky-200 shadow-xs text-center space-y-3">
              <p className="text-xs text-slate-600">
                Pilih artikel di sebelah kiri dan klik tombol "Analisis Ulang AI" untuk memulai analisis sentimen.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
