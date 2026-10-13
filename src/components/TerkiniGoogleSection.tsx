import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Layers, 
  Search,
  ArrowUpRight
} from 'lucide-react';

interface GoogleHeadline {
  id: string;
  title: string;
  snippet: string;
  category?: string;
  source: string;
  time?: string;
  url?: string;
}

interface WebSource {
  title: string;
  uri: string;
}

interface TerkiniGoogleResponse {
  headlines: GoogleHeadline[];
  webSources: WebSource[];
  searchQueries?: string[];
  updatedAt: string;
  isAiGrounded: boolean;
  fromCache?: boolean;
}

export const TerkiniGoogleSection: React.FC = () => {
  const [data, setData] = useState<TerkiniGoogleResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showSources, setShowSources] = useState<boolean>(false);

  const fetchHeadlines = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await fetch(`/api/terkini-google${forceRefresh ? '?refresh=true' : ''}`);
      if (!res.ok) {
        throw new Error(`Gagal memuat berita terkini (${res.status})`);
      }
      const json: TerkiniGoogleResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Error fetching Terkini dari Google:', err);
      setError(err.message || 'Gagal terhubung ke layanan penelusuran Google.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHeadlines();

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (headline: GoogleHeadline, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === headline.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const text = `Berita terkini dari Google. Sumber ${headline.source}. ${headline.title}. ${headline.snippet}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.05;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingId(headline.id);
  };

  const formatLastUpdated = (isoString?: string) => {
    if (!isoString) return 'Baru saja';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-sky-100 dark:border-slate-800 shadow-md overflow-hidden transition-all">
      {/* Google Brand Color Accent Stripe */}
      <div className="h-1.5 w-full flex">
        <span className="w-1/4 bg-[#4285F4]" />
        <span className="w-1/4 bg-[#EA4335]" />
        <span className="w-1/4 bg-[#FBBC05]" />
        <span className="w-1/4 bg-[#34A853]" />
      </div>

      {/* Header Bar */}
      <div className="p-4 sm:p-4.5 bg-gradient-to-br from-sky-50/90 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-sky-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
              {/* Google-styled icon badge */}
              <div className="relative">
                <Globe className="w-5 h-5 text-[#4285F4]" />
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#34A853] rounded-full border-2 border-white dark:border-slate-800" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-sky-950 dark:text-white tracking-tight">
                  Terkini dari Google
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300 font-mono text-[9px] font-black uppercase tracking-wider border border-sky-200 dark:border-sky-800">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-current" />
                  Search Grounding
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Headline nasional langsung dari web
              </p>
            </div>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => fetchHeadlines(true)}
            disabled={isLoading || isRefreshing}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-sky-900 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Segarkan Berita Terkini via Google Search"
            aria-label="Segarkan Berita Terkini"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>

        {/* Live Search Status Bar */}
        <div className="mt-2.5 pt-2 border-t border-sky-100/80 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {data?.isAiGrounded ? 'Penelusuran Web Terverifikasi' : 'Kurasi Warta Terkini'}
            </span>
          </div>
          <span>Pembaruan: {formatLastUpdated(data?.updatedAt)}</span>
        </div>
      </div>

      {/* Main Body: News List */}
      <div className="p-3 sm:p-4 space-y-3">
        {isLoading && !data ? (
          /* Loading Skeletons */
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 animate-pulse border border-slate-100 dark:border-slate-800">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
                <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : error && !data ? (
          /* Error State */
          <div className="p-4 text-center rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-rose-600" />
            <p className="text-xs font-bold mb-1">Gagal Memuat Berita Terkini</p>
            <p className="text-[11px] opacity-80 mb-2">{error}</p>
            <button
              onClick={() => fetchHeadlines(true)}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          /* Headline Cards */
          <div className="space-y-2.5">
            {data?.headlines.map((item, idx) => (
              <article
                key={item.id || idx}
                className="group p-3 rounded-xl bg-slate-50/70 hover:bg-sky-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200/80 hover:border-sky-300 dark:border-slate-800 dark:hover:border-slate-700 transition-all duration-200"
              >
                {/* Meta Row: Category & Source */}
                <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    {item.category && (
                      <span className="font-bold text-sky-800 dark:text-sky-300 uppercase px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950/60">
                        {item.category}
                      </span>
                    )}
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {item.source}
                    </span>
                  </div>

                  {item.time && (
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {item.time}
                    </span>
                  )}
                </div>

                {/* Headline Title */}
                <h4 className="text-xs sm:text-sm font-bold text-sky-950 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-yellow-400 leading-snug line-clamp-2 transition-colors mb-1">
                  {item.title}
                </h4>

                {/* Snippet */}
                {item.snippet && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2 font-medium">
                    {item.snippet}
                  </p>
                )}

                {/* Actions: Speak & Visit Source */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={(e) => handleSpeak(item, e)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold transition-all cursor-pointer ${
                      speakingId === item.id
                        ? 'bg-yellow-400 text-sky-950 shadow-2xs'
                        : 'text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-slate-700'
                    }`}
                    title={speakingId === item.id ? 'Hentikan Audio' : 'Dengarkan Ringkasan'}
                  >
                    {speakingId === item.id ? (
                      <>
                        <VolumeX className="w-3 h-3 text-sky-950" />
                        <span>Hentikan</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-sky-600 dark:text-yellow-400" />
                        <span>Dengarkan</span>
                      </>
                    )}
                  </button>

                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-white transition-colors"
                      title="Buka sumber asli berita di tab baru"
                    >
                      <span>Sumber Asli</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                      via Google Search
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Search Grounding Sources Drawer Toggle */}
        {data?.webSources && data.webSources.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowSources(!showSources)}
              className="w-full py-1.5 px-2 rounded-lg bg-sky-50/70 hover:bg-sky-100/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-sky-900 dark:text-sky-300 text-[11px] font-mono font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-sky-600 dark:text-yellow-400" />
                <span>{data.webSources.length} Rujukan Google Search Grounding</span>
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400">
                {showSources ? 'Tutup ▲' : 'Lihat ▼'}
              </span>
            </button>

            {showSources && (
              <div className="mt-2 space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800 max-h-48 overflow-y-auto">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold block mb-1">
                  Tautan Hasil Penelusuran Langsung:
                </span>
                {data.webSources.map((source, sIdx) => (
                  <a
                    key={sIdx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-yellow-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] text-sky-900 dark:text-slate-200 transition-all truncate group"
                    title={source.title || source.uri}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate group-hover:text-yellow-600 font-medium">
                        {source.title || source.uri}
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-600 group-hover:text-yellow-600 shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TerkiniGoogleSection;
