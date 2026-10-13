import React, { useState } from 'react';
import { Camera, MapPin, Layers, X, ChevronRight, ChevronLeft, Share2, Copy, Check } from 'lucide-react';
import { PhotoStory } from '../types';

interface PhotoGallerySectionProps {
  photoStories: PhotoStory[];
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({ photoStories }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoStory | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getPhotoShareUrl = (story: PhotoStory) => {
    return typeof window !== 'undefined'
      ? `${window.location.origin}/foto/${story.id}`
      : `https://arunnews.id/foto/${story.id}`;
  };

  const shareToTikTok = (story: PhotoStory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = getPhotoShareUrl(story);
    const caption = `📸 [Lensa Visual Arun News] "${story.title}" di ${story.location}. Foto karya: ${story.photographer}. Lihat galeri lengkap: ${url} #ArunNews #JurnalismeFoto #PotretNusantara #VisualNews #TikTokIndonesia #FYP`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(caption);
    }
    window.open('https://www.tiktok.com', '_blank', 'noopener,noreferrer');
    showToast('🎵 Teks Caption & Tagar TikTok tersalin ke papan klip! Membuka TikTok...');
  };

  const shareToYouTube = (story: PhotoStory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = getPhotoShareUrl(story);
    const desc = `[Galeri Foto Arun News] ${story.title} - Lokasi: ${story.location}\nFotografer: ${story.photographer}\nTautan Lengkap: ${url}\n#ArunNews #FotoJurnalistik #IndonesiaIndah #Dokumenter`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(desc);
    }
    window.open('https://www.youtube.com', '_blank', 'noopener,noreferrer');
    showToast('▶ Deskripsi & Tautan YouTube tersalin ke papan klip! Membuka YouTube...');
  };

  const shareToWhatsApp = (story: PhotoStory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = getPhotoShareUrl(story);
    const text = `*📸 [Lensa Visual Arun News] ${story.title}*\nLokasi: ${story.location} | Fotografer: ${story.photographer}\n\nLihat galeri foto resolusi tinggi di:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    showToast('Membuka WhatsApp untuk membagikan foto...');
  };

  const shareToX = (story: PhotoStory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = getPhotoShareUrl(story);
    const text = `📸 Lensa Visual Arun News: "${story.title}" (${story.location}). Foto karya ${story.photographer}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=ArunNews,JurnalismeFoto`, '_blank', 'noopener,noreferrer');
    showToast('Membuka X (Twitter) untuk membagikan foto...');
  };

  const shareToFacebook = (story: PhotoStory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = getPhotoShareUrl(story);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    showToast('Membuka Facebook untuk membagikan foto...');
  };

  const copyPhotoLink = (story: PhotoStory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = getPhotoShareUrl(story);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(story.id);
      setTimeout(() => setCopiedId(null), 2500);
      showToast('✅ Tautan galeri foto berhasil disalin ke papan klip!');
    }
  };

  return (
    <section id="photo-gallery-section" className="mb-8 bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-sky-950 text-yellow-300 text-xs font-bold shadow-2xl border border-yellow-400 animate-in fade-in zoom-in-95 duration-150">
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b-2 border-yellow-400 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-sky-950 shadow-xs font-bold">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
              Galeri Lensa & Cerita Foto
            </h2>
            <p className="text-xs text-sky-700">
              Potret keindahan, budaya, dan denyut kehidupan pelosok Nusantara
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-sky-900 bg-sky-100 px-2.5 py-1 rounded-md border border-sky-200">
          JURNALISME VISUAL
        </span>
      </div>

      {/* 3 Large Bento Photo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {photoStories.map((story) => (
          <div
            key={story.id}
            id={`photo-story-${story.id}`}
            onClick={() => setSelectedPhoto(story)}
            className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer bg-sky-950 aspect-[4/3] border border-sky-200 hover:border-yellow-400 flex flex-col justify-between"
          >
            <img
              src={story.imageUrl}
              alt={story.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/95 via-sky-950/30 to-sky-950/30" />

            {/* Top Badges & Quick TikTok/YouTube Share triggers */}
            <div className="relative z-10 p-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-sky-950/80 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-md border border-sky-700 font-mono">
                <Layers className="w-3 h-3 text-yellow-400" />
                <span>{story.photoCount} FOTO</span>
              </div>

              {/* Quick Share Buttons on Card */}
              <div className="flex items-center gap-1 bg-sky-950/80 backdrop-blur-xs rounded-lg p-1 border border-white/10" onClick={(e) => e.stopPropagation()}>
                {/* TikTok */}
                <button
                  type="button"
                  onClick={(e) => shareToTikTok(story, e)}
                  className="p-1 rounded-md bg-black/60 hover:bg-black text-white hover:text-cyan-300 transition-colors"
                  title="Bagikan ke TikTok"
                  aria-label="Bagikan Foto ke TikTok"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .592.046.87.136V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.93-4.5V9.01a8.28 8.28 0 0 0 4.84 1.55v-3.5a4.83 4.83 0 0 1-1-.37z"/>
                  </svg>
                </button>

                {/* YouTube */}
                <button
                  type="button"
                  onClick={(e) => shareToYouTube(story, e)}
                  className="p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                  title="Bagikan ke YouTube"
                  aria-label="Bagikan Foto ke YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </button>

                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={(e) => shareToWhatsApp(story, e)}
                  className="p-1 rounded-md bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors"
                  title="Bagikan ke WhatsApp"
                  aria-label="Bagikan Foto ke WhatsApp"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="relative z-10 p-3 text-white">
              <div className="flex items-center gap-1 text-[11px] text-yellow-400 font-black mb-1">
                <MapPin className="w-3 h-3" />
                <span>{story.location}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-yellow-300 transition-colors leading-snug line-clamp-2">
                {story.title}
              </h3>
              <div className="text-[10px] text-sky-200 mt-1 opacity-90 font-mono flex items-center justify-between">
                <span>Foto: {story.photographer}</span>
                <span className="text-yellow-400 font-bold flex items-center gap-0.5">
                  Buka Album <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal for Photo Story */}
      {selectedPhoto && (
        <div
          id="photo-lightbox-modal"
          className="fixed inset-0 z-50 bg-sky-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full border-2 border-yellow-400 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-sky-100 bg-sky-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-sky-950 font-black text-xs px-2.5 py-0.5 rounded-md border border-yellow-500 uppercase tracking-wider font-mono">
                  {selectedPhoto.location}
                </span>
                <span className="text-xs font-mono text-sky-800">{selectedPhoto.date}</span>
                <span className="text-xs font-bold text-sky-900 hidden sm:inline">• Karya {selectedPhoto.photographer}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-lg text-sky-900 hover:bg-sky-200 transition-colors cursor-pointer"
                title="Tutup Galeri"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Preview Container */}
            <div className="relative max-h-[60vh] bg-sky-950 flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            {/* Modal Footer with Full Social Media Sharing (TikTok, YouTube, WhatsApp, X, FB, Copy) */}
            <div className="p-4 bg-white flex flex-col gap-3 border-t border-sky-100 flex-shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-black text-sky-950 mb-0.5">
                  {selectedPhoto.title}
                </h3>
                <p className="text-xs text-sky-700 font-medium">
                  Fotografer: <strong>{selectedPhoto.photographer}</strong> • Dokumentasi resmi Arun News ({selectedPhoto.photoCount} foto pilihan).
                </p>
              </div>

              {/* Dedicated Share Toolbar with TikTok & YouTube */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950 font-mono">
                  <Share2 className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Bagikan Karya Visual:</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* TikTok Share */}
                  <button
                    type="button"
                    onClick={(e) => shareToTikTok(selectedPhoto, e)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Bagikan ke TikTok (Salin Teks & Tagar)"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .592.046.87.136V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.93-4.5V9.01a8.28 8.28 0 0 0 4.84 1.55v-3.5a4.83 4.83 0 0 1-1-.37z"/>
                    </svg>
                    <span>TikTok</span>
                  </button>

                  {/* YouTube Share */}
                  <button
                    type="button"
                    onClick={(e) => shareToYouTube(selectedPhoto, e)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Bagikan ke YouTube (Salin Deskripsi & Tautan)"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span>YouTube</span>
                  </button>

                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={(e) => shareToWhatsApp(selectedPhoto, e)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Bagikan ke WhatsApp"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
                    </svg>
                    <span>WA</span>
                  </button>

                  {/* X (Twitter) */}
                  <button
                    type="button"
                    onClick={(e) => shareToX(selectedPhoto, e)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Bagikan ke X"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>X</span>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={(e) => shareToFacebook(selectedPhoto, e)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Bagikan ke Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>FB</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={(e) => copyPhotoLink(selectedPhoto, e)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 border ${
                      copiedId === selectedPhoto.id 
                        ? 'bg-emerald-600 text-white border-emerald-500' 
                        : 'bg-yellow-400 hover:bg-yellow-300 text-sky-950 border-yellow-500'
                    }`}
                    title="Salin Tautan Foto"
                  >
                    {copiedId === selectedPhoto.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === selectedPhoto.id ? 'Tersalin!' : 'Salin'}</span>
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
