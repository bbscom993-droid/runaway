import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Headphones, 
  Volume2, 
  Radio, 
  Gauge, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { NewsArticle } from '../types';

interface ArticleMiniPodcastProps {
  article: NewsArticle;
  variant?: 'card' | 'compact' | 'inline';
  className?: string;
}

export const ArticleMiniPodcast: React.FC<ArticleMiniPodcastProps> = ({
  article,
  variant = 'card',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentChunkRef = useRef(0);
  const playbackRateRef = useRef(1.0);

  // Keep refs in sync for event listeners and callbacks
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    isPausedRef.current = isPaused;
    currentChunkRef.current = currentChunkIndex;
    playbackRateRef.current = playbackRate;
  }, [isPlaying, isPaused, currentChunkIndex, playbackRate]);

  // Check Web Speech API support & load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
      } catch (err) {
        console.warn('Speech synthesis getVoices error:', err);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Global listener: stop playback if another card or player starts speaking
    const handleGlobalPodcastPlay = (event: Event) => {
      const customEvent = event as CustomEvent<{ articleId?: string }>;
      if (customEvent.detail?.articleId !== article.id) {
        if (isPlayingRef.current) {
          stopPlayback();
        }
      }
    };

    window.addEventListener('arun_podcast_card_play', handleGlobalPodcastPlay);

    return () => {
      window.removeEventListener('arun_podcast_card_play', handleGlobalPodcastPlay);
      if (isPlayingRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article.id]);

  // Prepare text chunks for podcast broadcasting
  const podcastChunks = useMemo(() => {
    // Clean markdown and special symbols
    const clean = (text: string) => {
      return text
        .replace(/#+\s+/g, '') // remove headings
        .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
        .replace(/\*([^*]+)\*/g, '$1') // remove italic
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links
        .replace(/`([^`]+)`/g, '$1') // remove code
        .replace(/>\s+/g, '') // remove quotes
        .replace(/•/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Professional News Broadcast Intro
    const intro = `Podcast Warta Arun News. Menyiarkan berita kategori ${article.categoryLabel}. Judul: ${article.title}. Ringkasan: ${article.excerpt}.`;

    const rawContent = article.content || '';
    const paragraphs = rawContent
      .split(/\n+/)
      .map(p => clean(p))
      .filter(p => p.length > 10);

    const chunks = [clean(intro), ...paragraphs];
    return chunks.length > 0 ? chunks : [clean(intro)];
  }, [article.categoryLabel, article.title, article.excerpt, article.content]);

  const totalChunks = podcastChunks.length;
  const progressPercent = totalChunks > 0 
    ? Math.min(100, Math.round(((currentChunkIndex + 1) / totalChunks) * 100))
    : 0;

  // Speak specific chunk
  const speakChunk = (index: number, rate = playbackRateRef.current) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (index < 0 || index >= podcastChunks.length) {
      stopPlayback();
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }

    const text = podcastChunks[index];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = rate;

    // Pick best Indonesian voice if available
    const idVoice = availableVoices.find(v => v.lang.toLowerCase().startsWith('id')) ||
      availableVoices.find(v => v.lang.toLowerCase().includes('id')) ||
      null;

    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onend = () => {
      if (isPlayingRef.current) {
        if (index + 1 < podcastChunks.length) {
          setCurrentChunkIndex(index + 1);
          speakChunk(index + 1, rate);
        } else {
          stopPlayback();
        }
      }
    };

    utterance.onerror = (e) => {
      // If error occurred not because of intentional cancel
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Mini Podcast utterance error:', e);
      }
      if (isPlayingRef.current && index + 1 < podcastChunks.length) {
        setCurrentChunkIndex(index + 1);
        speakChunk(index + 1, rate);
      } else {
        stopPlayback();
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentChunkIndex(index);
    } catch (err) {
      console.warn('Speech synthesis speak failed:', err);
      stopPlayback();
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isSupported) {
      console.warn('Browser tidak mendukung Web Speech API untuk pemutar audio podcast.');
      return;
    }

    // Broadcast event to notify other cards to stop
    window.dispatchEvent(
      new CustomEvent('arun_podcast_card_play', {
        detail: { articleId: article.id },
      })
    );

    if (isPlaying && isPaused) {
      // Resume playback
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } catch {
        speakChunk(currentChunkIndex);
      }
    } else if (isPlaying && !isPaused) {
      // Pause playback
      try {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } catch {
        stopPlayback();
      }
    } else {
      // Start playback from start or saved chunk
      const startIdx = currentChunkIndex >= totalChunks ? 0 : currentChunkIndex;
      speakChunk(startIdx, playbackRate);
    }
  };

  const stopPlayback = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const speeds = [1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackRate(newSpeed);

    if (isPlaying && !isPaused) {
      // Restart current chunk with new rate
      speakChunk(currentChunkIndex, newSpeed);
    }
  };

  if (!isSupported) {
    return null;
  }

  // Variant: Compact (used in sidebar / small lists)
  if (variant === 'compact') {
    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1.5 p-1 rounded-lg transition-all ${
          isPlaying 
            ? 'bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 shadow-2xs' 
            : 'bg-sky-50/80 hover:bg-yellow-50 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 border border-sky-100 dark:border-slate-700'
        } ${className}`}
        title="Dengarkan Podcast Berita"
      >
        <button
          type="button"
          onClick={handlePlay}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
            isPlaying && !isPaused
              ? 'bg-yellow-400 text-sky-950 shadow-xs'
              : 'bg-sky-900 text-white dark:bg-yellow-400 dark:text-sky-950'
          }`}
          aria-label={isPlaying && !isPaused ? 'Jeda Podcast' : 'Putar Podcast'}
        >
          {isPlaying && !isPaused ? (
            <Pause className="w-3 h-3 fill-current" />
          ) : (
            <Play className="w-3 h-3 fill-current ml-0.5" />
          )}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-1 pr-1">
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-2.5 bg-amber-600 dark:bg-yellow-400 animate-pulse rounded-full" />
              <span className="w-0.5 h-3.5 bg-amber-500 dark:bg-yellow-300 animate-pulse delay-75 rounded-full" />
              <span className="w-0.5 h-2 bg-amber-600 dark:bg-yellow-400 animate-pulse delay-150 rounded-full" />
            </div>
            <button
              type="button"
              onClick={stopPlayback}
              className="p-0.5 text-slate-500 hover:text-rose-600 transition-colors"
              title="Berhenti"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Variant: Inline Pill (e.g. for tight header bars or category strips)
  if (variant === 'inline') {
    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all ${
          isPlaying
            ? 'bg-gradient-to-r from-amber-500/20 to-yellow-400/20 border border-yellow-400 text-yellow-900 dark:text-yellow-200'
            : 'bg-sky-100/80 hover:bg-yellow-100 text-sky-900 border border-sky-200 dark:bg-slate-800 dark:text-sky-200 dark:border-slate-700'
        } ${className}`}
      >
        <button
          type="button"
          onClick={handlePlay}
          className="flex items-center gap-1.5 cursor-pointer"
        >
          <Headphones className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
          <span>{isPlaying && !isPaused ? 'Memutar Podcast' : isPaused ? 'Jeda' : 'Dengarkan Berita'}</span>
        </button>

        {isPlaying && (
          <button
            type="button"
            onClick={stopPlayback}
            className="p-0.5 text-rose-500 hover:text-rose-700 transition-colors ml-1"
          >
            <Square className="w-3 h-3 fill-current" />
          </button>
        )}
      </div>
    );
  }

  // Default: Sleek Full Mini Podcast Player Box for Bento Grid & Horizontal Cards
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`my-2 rounded-xl transition-all overflow-hidden border ${
        isPlaying
          ? 'bg-gradient-to-r from-amber-50 via-yellow-50/70 to-amber-100/60 border-amber-300 dark:from-sky-950/80 dark:via-slate-900 dark:to-yellow-950/30 dark:border-amber-500/50 shadow-xs'
          : 'bg-slate-50/90 hover:bg-amber-50/50 border-sky-100 hover:border-amber-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 dark:border-slate-800'
      } ${className}`}
    >
      <div className="p-2 sm:p-2.5 flex items-center justify-between gap-2.5">
        {/* Left: Play/Pause Button & Podcast Title / Soundwave */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            id={`mini-podcast-play-${article.id}`}
            onClick={handlePlay}
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer shadow-xs ${
              isPlaying && !isPaused
                ? 'bg-yellow-400 text-sky-950 hover:bg-yellow-300 ring-2 ring-yellow-400/40'
                : 'bg-sky-950 text-white hover:bg-sky-900 dark:bg-yellow-400 dark:text-sky-950 dark:hover:bg-yellow-300'
            }`}
            title={isPlaying && !isPaused ? 'Jeda Podcast' : isPlaying && isPaused ? 'Lanjutkan Podcast' : 'Dengarkan Podcast Berita (Web Speech API)'}
            aria-label={isPlaying && !isPaused ? 'Jeda Podcast' : 'Putar Podcast'}
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-yellow-400 font-mono">
                <Headphones className="w-3 h-3 text-amber-600 dark:text-yellow-400 shrink-0" />
                Podcast Berita
              </span>

              {isPlaying && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 font-mono">
                  {isPaused ? 'Jeda' : 'Mengudara'}
                </span>
              )}
            </div>

            <p className="text-[11px] font-bold text-sky-950 dark:text-slate-200 truncate mt-0.5">
              {isPlaying 
                ? (isPaused ? 'Podcast Dijeda' : `Membaca: Bagian ${currentChunkIndex + 1} dari ${totalChunks}`)
                : 'Dengarkan versi audio podcast'}
            </p>
          </div>
        </div>

        {/* Right: Sound Wave Visualizer & Speed / Stop Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Audio Equalizer Animated Wave */}
          {isPlaying && !isPaused && (
            <div 
              className="flex items-end gap-0.5 h-4 px-1.5 py-0.5 bg-yellow-400/20 dark:bg-yellow-400/10 rounded-md"
              title="Audio sedang diputar via Web Speech API"
            >
              <span className="w-0.5 h-2 bg-amber-600 dark:bg-yellow-400 rounded-full animate-bounce" style={{ animationDuration: '600ms' }} />
              <span className="w-0.5 h-3.5 bg-amber-500 dark:bg-yellow-300 rounded-full animate-bounce" style={{ animationDuration: '450ms', animationDelay: '150ms' }} />
              <span className="w-0.5 h-2.5 bg-yellow-500 dark:bg-yellow-400 rounded-full animate-bounce" style={{ animationDuration: '550ms', animationDelay: '300ms' }} />
              <span className="w-0.5 h-3 bg-amber-600 dark:bg-yellow-400 rounded-full animate-bounce" style={{ animationDuration: '500ms', animationDelay: '75ms' }} />
            </div>
          )}

          {/* Speed Toggle (1x, 1.25x, 1.5x) */}
          <button
            type="button"
            onClick={cycleSpeed}
            className={`px-1.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all active:scale-95 cursor-pointer ${
              playbackRate > 1.0
                ? 'bg-amber-200 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300'
                : 'bg-white/80 hover:bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
            title={`Kecepatan suara: ${playbackRate}x (Klik untuk ganti)`}
          >
            {playbackRate}x
          </button>

          {/* Stop Button */}
          {isPlaying && (
            <button
              type="button"
              onClick={stopPlayback}
              className="p-1.5 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
              title="Hentikan Audio Podcast"
              aria-label="Hentikan Podcast"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          )}
        </div>
      </div>

      {/* Mini Progress Bar when Active */}
      {isPlaying && (
        <div className="h-1 bg-amber-200/60 dark:bg-slate-800 w-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
