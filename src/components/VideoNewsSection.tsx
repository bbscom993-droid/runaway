import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Video, 
  Eye, 
  Clock, 
  X, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  ExternalLink,
  MessageCircle,
  Film,
  Tv,
  Radio,
  Activity
} from 'lucide-react';
import { VideoNews } from '../types';

interface VideoNewsSectionProps {
  videos: VideoNews[];
}

const parseDurationToSeconds = (durStr?: string): number => {
  if (!durStr) return 240;
  const parts = durStr.split(':').map(p => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 240;
};

export const VideoNewsSection: React.FC<VideoNewsSectionProps> = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState<VideoNews | null>(null);
  
  // Video Player States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(240);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [bufferedPercent, setBufferedPercent] = useState<number>(85);
  const [quality, setQuality] = useState<string>('1080p 60fps HD');
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);
  
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize playback when active video changes
  useEffect(() => {
    if (activeVideo) {
      const estimatedDuration = parseDurationToSeconds(activeVideo.duration);
      setDuration(estimatedDuration);
      setCurrentTime(0);
      setHasVideoError(false);
      setBufferedPercent(90);
      setIsPlaying(true);

      const timeoutId = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.volume = volume;
          videoRef.current.muted = isMuted;
          videoRef.current.playbackRate = playbackSpeed;
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay policy or fallback mode
              setIsPlaying(true);
            });
          }
        }
      }, 150);

      return () => clearTimeout(timeoutId);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      setHasVideoError(false);
    }
  }, [activeVideo]);

  // Simulated playback timer fallback when video stream errors or in simulation mode
  useEffect(() => {
    if (isPlaying && hasVideoError && activeVideo) {
      simulationTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000);
    } else {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    }
    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    };
  }, [isPlaying, hasVideoError, duration, playbackSpeed, activeVideo]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => {
      setShareToast(null);
    }, 3500);
  };

  const handlePlayPause = () => {
    if (!hasVideoError && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              setHasVideoError(true);
              setIsPlaying(true);
            });
        } else {
          setIsPlaying(true);
        }
      }
    } else {
      // Simulation mode play/pause
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || hasVideoError) return;
    setCurrentTime(videoRef.current.currentTime);

    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      const dur = videoRef.current.duration || duration || 1;
      setBufferedPercent(Math.min(100, Math.round((bufferedEnd / dur) * 100)));
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (!hasVideoError && videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (!hasVideoError && videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      const targetVol = volume === 0 ? 0.8 : volume;
      setVolume(targetVol);
      if (!hasVideoError && videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = targetVol;
      }
    } else {
      setIsMuted(true);
      if (!hasVideoError && videoRef.current) {
        videoRef.current.muted = true;
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (!hasVideoError && videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    if (!hasVideoError && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getShareUrl = (vid: VideoNews) => {
    return typeof window !== 'undefined'
      ? `${window.location.origin}/video/${vid.id}`
      : `https://arunnews.id/video/${vid.id}`;
  };

  // Social Sharing Actions
  const shareToTwitter = (vid: VideoNews) => {
    const url = getShareUrl(vid);
    const text = `🔴 [Warta Video Arun News] ${vid.title}\n\nSaksikan liputan visual eksklusif terenkripsi kualitas Full HD di portal Arun News:`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=ArunNews,BeritaTerkini,WartaNusantara`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    triggerToast('Membuka X (Twitter) untuk membagikan tayangan video...');
  };

  const shareToFacebook = (vid: VideoNews) => {
    const url = getShareUrl(vid);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(vid.title + ' - Warta Video Arun News')}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    triggerToast('Membuka Facebook untuk membagikan video...');
  };

  const shareToWhatsApp = (vid: VideoNews) => {
    const url = getShareUrl(vid);
    const text = `*🔴 Warta Video Arun News*\n\n*${vid.title}*\nDurasi: ${vid.duration} | Kategori: ${vid.category}\n\nSaksikan streaming video resolusi tinggi di tautan resmi:\n${url}`;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    triggerToast('Membuka WhatsApp untuk membagikan video...');
  };

  const shareToYouTube = (vid: VideoNews) => {
    const url = getShareUrl(vid);
    const clipboardText = `[Arun News HD Video] ${vid.title}\nKategori: ${vid.category} • Durasi: ${vid.duration}\nStreaming Link: ${url}\n#ArunNews #VideoNews #IndonesiaNews #JurnalismeInvestigasi`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(clipboardText);
    }
    window.open('https://www.youtube.com', '_blank', 'noopener,noreferrer');
    triggerToast('Deskripsi YouTube disalin ke clipboard! Membuka YouTube...');
  };

  const shareToTikTok = (vid: VideoNews) => {
    const url = getShareUrl(vid);
    const caption = `${vid.title} 📹 Liputan Khusus Arun News HD. Tonton video penuh di: ${url} #ArunNews #WartaVideo #BeritaViral #FYPIndonesia #BeritaTerkini`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(caption);
    }
    window.open('https://www.tiktok.com', '_blank', 'noopener,noreferrer');
    triggerToast('Caption & Hashtag TikTok berhasil disalin! Membuka TikTok...');
  };

  const shareToInstagram = (vid: VideoNews) => {
    const url = getShareUrl(vid);
    const caption = `🔴 [ARUN NEWS VIDEO] ${vid.title}\n\nSaksikan tayangan liputan visual dan investigasi aktual dengan pemutar video streaming terenkripsi arun news security.\n\n🔗 Tautan Resmi: ${url}\n\n#ArunNews #BeritaTerpercaya #WartaNusantara #JurnalismePresisi #Investigasi`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(caption);
    }
    window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
    triggerToast('Teks & Caption Instagram disalin ke clipboard! Membuka Instagram...');
  };

  const copyVideoLink = (vid: VideoNews) => {
    const url = getShareUrl(vid);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      triggerToast('✅ Tautan streaming video berhasil disalin ke clipboard!');
    }
  };

  const handleMouseMovePlayer = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  return (
    <section id="video-news-section" className="mb-8 bg-sky-900 text-white rounded-2xl p-6 sm:p-7 border border-sky-800 shadow-md overflow-hidden relative">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-6 right-6 z-50 bg-amber-400 text-sky-950 px-4 py-3 rounded-xl shadow-2xl border border-yellow-500 font-bold text-xs sm:text-sm flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-sky-950" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b-2 border-yellow-400 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-sky-950 shadow-xs">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-brand font-black uppercase tracking-tight text-white flex items-center gap-2">
              Warta Video & Liputan Khusus
            </h2>
            <p className="text-xs text-sky-200">
              Dokumentasi visual fakta lapangan dan investigasi aktual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-950 bg-yellow-400 px-3 py-1 rounded-md border border-yellow-500 shadow-2xs font-mono flex items-center gap-1.5">
            <Tv className="w-3 h-3 text-sky-950" />
            STREAMING HD AKTIF
          </span>
        </div>
      </div>

      {/* Video Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {videos.map((vid) => (
          <div
            key={vid.id}
            id={`video-card-${vid.id}`}
            onClick={() => setActiveVideo(vid)}
            className="group bg-sky-950/85 hover:bg-sky-950 rounded-xl overflow-hidden border border-sky-800 hover:border-yellow-400 transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-0.5 duration-200"
          >
            {/* Thumbnail with play badge */}
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <img
                src={vid.thumbnail}
                alt={vid.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-sky-950/30 group-hover:bg-sky-950/10 transition-colors" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-yellow-300 transition-transform border border-yellow-500">
                  <Play className="w-6 h-6 fill-sky-950 text-sky-950 ml-0.5" />
                </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-sky-950/95 text-yellow-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-sky-800/80">
                {vid.duration}
              </div>

              {/* Category */}
              <div className="absolute top-2 left-2 bg-yellow-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded uppercase font-mono shadow-xs">
                {vid.category}
              </div>

              {/* Security Watermark on Card */}
              <div className="absolute top-2 right-2 bg-sky-950/90 text-sky-200 text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 border border-sky-800">
                <Lock className="w-2.5 h-2.5 text-yellow-400" />
                <span>SECURE</span>
              </div>
            </div>

            {/* Video Meta */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-yellow-300 transition-colors line-clamp-2 leading-snug mb-2 font-sans">
                {vid.title}
              </h3>
              
              <div className="pt-2 border-t border-sky-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-sky-300 font-mono">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-sky-400" />
                    {vid.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    {vid.publishedAt}
                  </span>
                </div>

                {/* Quick Share Trigger on Card with TikTok & YouTube */}
                <div className="flex items-center justify-between pt-1 gap-1" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] text-amber-300 font-medium">Klik untuk memutar</span>
                  <div className="flex items-center gap-1">
                    {/* TikTok */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareToTikTok(vid);
                      }}
                      className="p-1 rounded bg-black/70 hover:bg-black text-white hover:text-cyan-300 transition-colors"
                      title="Bagikan ke TikTok"
                      aria-label="Bagikan Video ke TikTok"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .592.046.87.136V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.93-4.5V9.01a8.28 8.28 0 0 0 4.84 1.55v-3.5a4.83 4.83 0 0 1-1-.37z"/>
                      </svg>
                    </button>

                    {/* YouTube */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareToYouTube(vid);
                      }}
                      className="p-1 rounded bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                      title="Bagikan ke YouTube"
                      aria-label="Bagikan Video ke YouTube"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </button>

                    {/* Copy Link */}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyVideoLink(vid);
                      }}
                      className="flex items-center gap-1 text-[10px] text-sky-300 hover:text-yellow-400 transition-colors px-1.5 py-0.5 rounded bg-sky-900/60 hover:bg-sky-900 border border-sky-800"
                      title="Salin tautan video"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Salin</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE VIDEO PLAYER STREAM MODAL */}
      {activeVideo && (
        <div 
          id="video-player-modal"
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="bg-slate-950 rounded-2xl max-w-4xl w-full border-2 border-yellow-400 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-sky-950 text-white flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0 pr-2">
                <span className="bg-yellow-400 text-sky-950 font-black text-xs px-2.5 py-0.5 rounded-md uppercase font-mono flex-shrink-0">
                  {activeVideo.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm sm:max-w-md font-sans">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                id="close-video-modal-btn"
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-sky-800 transition-colors flex-shrink-0"
                title="Tutup Pemutar Video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* INTERACTIVE STREAMING PLAYER CONTAINER */}
            <div 
              ref={playerContainerRef}
              onMouseMove={handleMouseMovePlayer}
              className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group select-none"
            >
              {/* Either standard video element or fallback live broadcast engine */}
              {!hasVideoError ? (
                <video
                  ref={videoRef}
                  playsInline
                  poster={activeVideo.thumbnail}
                  onClick={handlePlayPause}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    // Gracefully switch to simulated broadcast without breaking UI
                    setHasVideoError(true);
                  }}
                  className="w-full h-full object-contain cursor-pointer"
                >
                  {activeVideo.videoUrl && (
                    <source src={activeVideo.videoUrl} type="video/mp4" />
                  )}
                </video>
              ) : (
                /* Fallback Simulated Broadcast Stream Canvas */
                <div 
                  onClick={handlePlayPause}
                  className="relative w-full h-full flex items-center justify-center bg-sky-950 overflow-hidden cursor-pointer"
                >
                  <img
                    src={activeVideo.thumbnail}
                    alt={activeVideo.title}
                    className={`w-full h-full object-cover transition-all duration-1000 ${
                      isPlaying ? 'scale-105 opacity-70 filter brightness-95' : 'scale-100 opacity-50'
                    }`}
                  />
                  
                  {/* Broadcast Simulation Overlay Grid */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

                  {/* Live Studio Indicators */}
                  <div className="absolute top-12 left-4 flex items-center gap-2 pointer-events-none">
                    <span className="flex h-3 w-3 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-rose-400 opacity-75' : 'bg-amber-400 opacity-40'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                    </span>
                    <span className="text-[11px] font-mono font-bold tracking-widest text-white uppercase bg-black/60 px-2 py-0.5 rounded border border-white/20">
                      {isPlaying ? '🔴 LIVE STREAM BROADCAST' : '⏸️ PAUSED'}
                    </span>
                  </div>

                  {/* Audio Frequency Simulation Bar */}
                  {isPlaying && (
                    <div className="absolute bottom-20 right-4 flex items-end gap-1 h-8 pointer-events-none bg-black/60 p-1.5 rounded-lg border border-sky-800">
                      <div className="w-1 bg-yellow-400 animate-pulse h-full rounded-xs" style={{ animationDuration: '0.4s' }} />
                      <div className="w-1 bg-yellow-400 animate-pulse h-3/4 rounded-xs" style={{ animationDuration: '0.7s' }} />
                      <div className="w-1 bg-yellow-400 animate-pulse h-5/6 rounded-xs" style={{ animationDuration: '0.5s' }} />
                      <div className="w-1 bg-yellow-400 animate-pulse h-2/3 rounded-xs" style={{ animationDuration: '0.3s' }} />
                      <div className="w-1 bg-yellow-400 animate-pulse h-4/5 rounded-xs" style={{ animationDuration: '0.6s' }} />
                    </div>
                  )}
                </div>
              )}

              {/* Watermark Security Overlay Banner */}
              <div className="absolute top-3 left-3 pointer-events-none z-20 flex items-center gap-2 bg-sky-950/80 backdrop-blur-sm border border-yellow-400/40 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs text-white font-mono shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                <span className="font-bold text-yellow-400 tracking-wider">ARUN NEWS ENCRYPTED STREAM</span>
                <span className="hidden sm:inline text-sky-300 text-[10px]">• ID: {activeVideo.id}</span>
              </div>

              <div className="absolute top-3 right-3 pointer-events-none z-20 bg-sky-950/85 text-yellow-300 border border-sky-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                {quality}
              </div>

              {/* Center Play/Pause Floating Overlay Icon */}
              {!isPlaying && (
                <div 
                  onClick={handlePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/45 cursor-pointer z-20 transition-all"
                >
                  <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-3xl bg-yellow-400 text-sky-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform border-2 border-yellow-300">
                    <Play className="w-9 sm:w-11 h-9 sm:h-11 fill-sky-950 text-sky-950 ml-1" />
                  </div>
                </div>
              )}

              {/* CUSTOM SLEEK PLAYER CONTROLS BAR */}
              <div 
                className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 z-30 transition-opacity duration-300 flex flex-col gap-2 ${
                  showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Progress / Seek Timeline Bar */}
                <div className="relative w-full flex items-center group/timeline">
                  {/* Buffered Bar */}
                  <div 
                    className="absolute h-1.5 bg-slate-700 rounded-full pointer-events-none"
                    style={{ width: `${bufferedPercent}%` }}
                  />
                  {/* Played Progress Bar */}
                  <div 
                    className="absolute h-1.5 bg-yellow-400 rounded-full pointer-events-none z-10"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 appearance-none bg-slate-800 rounded-full cursor-pointer relative z-20 accent-yellow-400 focus:outline-hidden"
                  />
                </div>

                {/* Control Action Buttons Bar */}
                <div className="flex items-center justify-between text-white text-xs gap-2">
                  {/* Left Controls: Play, Restart, Volume, Time */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={handlePlayPause}
                      className="p-1.5 rounded-lg bg-yellow-400 text-sky-950 hover:bg-yellow-300 transition-colors font-bold shadow-xs"
                      title={isPlaying ? 'Jeda (Pause)' : 'Putar (Play)'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-sky-950" />
                      ) : (
                        <Play className="w-4 h-4 fill-sky-950 ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={handleRestart}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      title="Ulangi dari Awal"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-1.5 group/vol">
                      <button
                        onClick={handleToggleMute}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        title={isMuted ? 'Nyalakan Suara (Unmute)' : 'Bisukan Suara (Mute)'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-yellow-400" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-14 sm:w-20 h-1 appearance-none bg-slate-700 rounded-full cursor-pointer accent-yellow-400"
                      />
                    </div>

                    {/* Time Display */}
                    <span className="font-mono text-[11px] sm:text-xs text-sky-200">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right Controls: Speed, Quality, Fullscreen */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Playback Speed Selector */}
                    <div className="flex items-center gap-0.5 bg-sky-950/80 border border-sky-800 rounded-lg p-0.5">
                      {[1, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                            playbackSpeed === spd
                              ? 'bg-yellow-400 text-sky-950 font-black'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    {/* Fullscreen Button */}
                    <button
                      onClick={handleToggleFullscreen}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Fullscreen)'}
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STREAMING ENCRYPTION & SECURITY BADGE FOOTER */}
            <div className="px-4 sm:px-6 py-2.5 bg-sky-950 border-t border-sky-900 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-sky-200 font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">
                  Pemutar video streaming terenkripsi arun news security • Durasi {activeVideo.duration}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-amber-300 bg-sky-900/90 px-2 py-0.5 rounded border border-sky-800 font-mono font-bold">
                <span>AES-256 Bit DRM Active</span>
              </div>
            </div>

            {/* SOCIAL MEDIA SHARING SECTION (YouTube, TikTok, Facebook, Instagram, X Twitter, WhatsApp) */}
            <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white font-brand">
                    Bagikan Tayangan Video Ini
                  </h4>
                </div>
                <span className="text-[11px] text-sky-300 font-mono">
                  {activeVideo.views} • Diunggah {activeVideo.publishedAt}
                </span>
              </div>

              {/* Social Media Share Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                {/* 1. X (Twitter) */}
                <button
                  id="share-x-twitter-btn"
                  onClick={() => shareToTwitter(activeVideo)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Bagikan ke X (Twitter)"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>X (Twitter)</span>
                </button>

                {/* 2. Facebook */}
                <button
                  id="share-facebook-btn"
                  onClick={() => shareToFacebook(activeVideo)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Bagikan ke Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>

                {/* 3. YouTube */}
                <button
                  id="share-youtube-btn"
                  onClick={() => shareToYouTube(activeVideo)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF0000] hover:bg-[#e60000] text-white font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Bagikan / Buka di YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>YouTube</span>
                </button>

                {/* 4. TikTok */}
                <button
                  id="share-tiktok-btn"
                  onClick={() => shareToTikTok(activeVideo)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#010101] hover:bg-neutral-900 text-white font-bold text-xs border border-neutral-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Bagikan ke TikTok"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                  <span>TikTok</span>
                </button>

                {/* 5. Instagram */}
                <button
                  id="share-instagram-btn"
                  onClick={() => shareToInstagram(activeVideo)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Bagikan ke Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </button>

                {/* 6. WhatsApp */}
                <button
                  id="share-whatsapp-btn"
                  onClick={() => shareToWhatsApp(activeVideo)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-sky-950 font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Bagikan ke WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-sky-950 text-sky-950" />
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Copy Link Direct Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300 w-full sm:w-auto">
                  <span className="text-slate-400 font-mono text-[11px]">Tautan Langsung:</span>
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl(activeVideo)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-yellow-300 font-mono text-[11px] flex-1 sm:w-80 select-all"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => copyVideoLink(activeVideo)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-bold transition-all shadow-xs text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Tautan</span>
                  </button>

                  <button
                    onClick={() => setActiveVideo(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors text-xs"
                  >
                    Tutup Tayangan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
