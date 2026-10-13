import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Megaphone, 
  Upload, 
  CheckCircle, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  FileImage, 
  FileVideo, 
  Trash2, 
  Info, 
  HelpCircle, 
  CheckCircle2, 
  Save, 
  AlertCircle 
} from 'lucide-react';
import { Category, NewsArticle } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface CitizenJournalismModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmitArticle: (newArticle: NewsArticle) => void;
  onOpenCyberMediaGuidelinesModal?: (tab?: 'pedoman' | 'kode_etik' | 'privasi' | 'panduan_warga' | 'syarat_ketentuan' | 'disclaimer' | 'hak_cipta') => void;
}

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'video';
  url: string;
}

const DRAFT_STORAGE_KEY = 'arun_news_lapor_warga_draft';

export const CitizenJournalismModal: React.FC<CitizenJournalismModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSubmitArticle,
  onOpenCyberMediaGuidelinesModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved draft on initial render / when modal is opened
  const savedDraft = useMemo(() => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load lapor warga draft from localStorage', e);
    }
    return null;
  }, [isOpen]);

  const [reporterName, setReporterName] = useState(savedDraft?.reporterName || '');
  const [email, setEmail] = useState(savedDraft?.email || '');
  const [phone, setPhone] = useState(savedDraft?.phone || '');
  const [location, setLocation] = useState(savedDraft?.location || '');
  const [title, setTitle] = useState(savedDraft?.title || '');
  const [description, setDescription] = useState(savedDraft?.description || '');
  const [attachedFiles, setAttachedFiles] = useState<UploadedFileItem[]>(savedDraft?.attachedFiles || []);

  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(
    savedDraft?.savedAt ? new Date(savedDraft.savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null
  );

  // Sync state if modal reopens with a saved draft
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setReporterName(parsed.reporterName || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || '');
          setLocation(parsed.location || '');
          setTitle(parsed.title || '');
          setDescription(parsed.description || '');
          setAttachedFiles(parsed.attachedFiles || []);
          if (parsed.savedAt) {
            setLastAutoSavedTime(new Date(parsed.savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (e) {
        console.error('Error syncing draft on modal open', e);
      }
    }
  }, [isOpen]);

  // Real-time Auto-Save to localStorage
  useEffect(() => {
    if (!isOpen || submitted) return;

    const hasAnyContent = Boolean(
      reporterName.trim() || 
      email.trim() || 
      phone.trim() || 
      location.trim() || 
      title.trim() || 
      description.trim() || 
      attachedFiles.length > 0
    );

    if (hasAnyContent) {
      const draftPayload = {
        reporterName,
        email,
        phone,
        location,
        title,
        description,
        attachedFiles: attachedFiles.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          url: f.url.startsWith('blob:') ? '' : f.url // Only save non-blob URLs
        })),
        savedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
        const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setLastAutoSavedTime(currentTime);
      } catch (e) {
        console.error('Failed to auto-save draft', e);
      }
    }
  }, [reporterName, email, phone, location, title, description, attachedFiles, isOpen, submitted]);

  if (!isOpen) return null;

  // Handle File Uploads (Drag & Drop or Manual Selection)
  const handleProcessFiles = async (filesList: FileList | File[]) => {
    const newItems: UploadedFileItem[] = [];
    const filesArray = Array.from(filesList);

    for (const file of filesArray) {
      if (attachedFiles.length + newItems.length >= 5) {
        setFormError('Maksimal 5 file foto/video yang dapat dilampirkan sekaligus.');
        break;
      }

      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|avi|webm)$/i.test(file.name);
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

      if (!isImage && !isVideo) {
        setFormError(`Format file "${file.name}" tidak didukung. Harap unggah Foto (JPG, PNG, WebP, GIF) atau Video (MP4, MOV, AVI, WebM).`);
        continue;
      }

      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      let fileUrl = '';
      if (isImage) {
        try {
          fileUrl = await compressImageFile(file, 1200, 1200, 0.82);
        } catch {
          fileUrl = URL.createObjectURL(file);
        }
      } else {
        fileUrl = URL.createObjectURL(file);
      }

      newItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: `${sizeInMB} MB`,
        type: isVideo ? 'video' : 'image',
        url: fileUrl || URL.createObjectURL(file)
      });
    }

    if (newItems.length > 0) {
      setAttachedFiles(prev => [...prev, ...newItems].slice(0, 5));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!reporterName.trim() || !title.trim() || !description.trim()) {
      setFormError('Harap lengkapi semua bidang wajib (*).');
      return;
    }

    const paragraphs = description
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // Pick photo or default image
    const mainPhoto = attachedFiles.find(f => f.type === 'image')?.url || 
                      'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80';

    const newArticle: NewsArticle = {
      id: `laporan-${Date.now()}`,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: description.slice(0, 150) + (description.length > 150 ? '...' : ''),
      content: description.trim(),
      paragraphs: paragraphs.length > 0 ? paragraphs : [description.trim()],
      category: 'nasional',
      categoryLabel: 'Lapor Warga',
      author: {
        name: reporterName.trim(),
        role: `Warga Pelapor • ${location.trim() || 'Nusantara'}`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      },
      publishedAt: 'Baru Saja • Laporan Warga',
      readTime: '1 mnt baca',
      imageUrl: mainPhoto,
      imageCaption: `Foto dokumentasi laporan dari ${reporterName.trim()} di ${location.trim() || 'Lokasi Kejadian'}.`,
      views: 50,
      likes: 12,
      shares: 3,
      tags: ['LaporWarga', 'AduanPublik', location.trim() || 'Nusantara'],
      isBreaking: true,
      keyTakeaways: [
        `Laporan publik dikirim langsung oleh ${reporterName.trim()}.`,
        `Lokasi kejadian: ${location.trim() || 'Dalam konfirmasi'}.`,
        'Telah tercatat di meja redaksi Arun News untuk verifikasi wartawan.'
      ],
      comments: [],
    };

    onSubmitArticle(newArticle);

    // Clear draft storage
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div
      id="lapor-warga-modal"
      className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-sky-950 text-white border-b border-sky-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-xs flex-shrink-0">
              <Megaphone className="w-5 h-5 text-sky-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-mono">
                  Lapor Warga
                </h2>
                {lastAutoSavedTime && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-900 text-yellow-300 text-[10px] font-mono border border-sky-700">
                    <Save className="w-2.5 h-2.5" />
                    Draft Tersimpan ({lastAutoSavedTime})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-sky-200 font-mono">Sampaikan laporan, aduan, dan informasi peristiwa dari sekitar Anda</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-800 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {submitted ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 border border-yellow-300 text-yellow-600 flex items-center justify-center mb-4 shadow-xs">
              <CheckCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-sky-950 mb-2 uppercase tracking-tight">
              Laporan Berhasil Terkirim!
            </h3>
            <p className="text-xs sm:text-sm text-sky-700 max-w-md leading-relaxed font-medium">
              Terima kasih atas partisipasi Anda. Laporan Anda telah tersimpan dan tim Redaksi Arun News akan segera melakukan verifikasi fakta di lapangan.
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto p-4 sm:p-6 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: FORMULIR LAPORAN (8 cols) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-5">
                
                <div className="flex items-center justify-between pb-2 border-b border-sky-200">
                  <h3 className="text-sm font-black uppercase tracking-wider text-sky-950 font-mono flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-500" />
                    <span>Formulir Laporan</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">* Wajib diisi</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
                      <span>{formError}</span>
                      <button
                        type="button"
                        onClick={() => setFormError(null)}
                        className="text-rose-600 hover:text-rose-900 font-black ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  {/* Nama pelapor */}
                  <div>
                    <label className="block font-bold text-sky-950 text-xs mb-1">
                      Nama pelapor <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className="w-full px-3.5 py-2.5 bg-sky-50/60 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-sky-950 placeholder:text-slate-400 text-xs"
                    />
                  </div>

                  {/* Email & Nomor Telepon (2 cols) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-sky-950 text-xs mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@contoh.com"
                        className="w-full px-3.5 py-2.5 bg-sky-50/60 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-sky-950 placeholder:text-slate-400 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-sky-950 text-xs mb-1">
                        Nomor telepon
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08xx-xxxx-xxxx"
                        className="w-full px-3.5 py-2.5 bg-sky-50/60 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-sky-950 placeholder:text-slate-400 text-xs"
                      />
                    </div>
                  </div>

                  {/* Lokasi kejadian */}
                  <div>
                    <label className="block font-bold text-sky-950 text-xs mb-1">
                      Lokasi kejadian
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Nama jalan, kelurahan, kecamatan..."
                      className="w-full px-3.5 py-2.5 bg-sky-50/60 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-sky-950 placeholder:text-slate-400 text-xs"
                    />
                  </div>

                  {/* Judul laporan */}
                  <div>
                    <label className="block font-bold text-sky-950 text-xs mb-1">
                      Judul laporan <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ringkasan singkat kejadian..."
                      className="w-full px-3.5 py-2.5 bg-sky-50/60 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sky-950 placeholder:text-slate-400 text-xs"
                    />
                  </div>

                  {/* Deskripsi laporan */}
                  <div>
                    <label className="block font-bold text-sky-950 text-xs mb-1">
                      Deskripsi laporan <span className="text-red-500 font-bold">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ceritakan kejadian secara detail: waktu, lokasi, kronologi, pihak yang terlibat..."
                      className="w-full px-3.5 py-2.5 bg-sky-50/60 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-normal leading-relaxed text-sky-950 placeholder:text-slate-400 text-xs"
                    />
                  </div>

                  {/* Foto / Video (maks. 5 file, opsional) */}
                  <div>
                    <label className="block font-bold text-sky-950 text-xs mb-1.5">
                      Foto / Video (maks. 5 file, opsional)
                    </label>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/x-msvideo,video/webm"
                      className="hidden"
                    />

                    {/* Drag & Drop Zone */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                        dragActive 
                          ? 'border-yellow-500 bg-yellow-50/80 scale-[1.01]' 
                          : 'border-sky-300 bg-sky-50/50 hover:bg-sky-100/60 hover:border-sky-400'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 text-sky-700 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                        <Upload className="w-5 h-5 text-sky-700" />
                      </div>
                      <p className="font-bold text-sky-950 text-xs">
                        Drag & drop atau klik untuk pilih
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        JPG, PNG, MP4, MOV — maks. 5 file
                      </p>
                    </div>

                    {/* Attached files list */}
                    {attachedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <span className="text-[11px] font-mono text-slate-600 block">
                          File terlampir ({attachedFiles.length}/5):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {attachedFiles.map((file) => (
                            <div 
                              key={file.id}
                              className="p-2 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs gap-2"
                            >
                              <div className="flex items-center gap-2 truncate">
                                {file.type === 'image' ? (
                                  <FileImage className="w-4 h-4 text-sky-600 flex-shrink-0" />
                                ) : (
                                  <FileVideo className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                )}
                                <div className="truncate">
                                  <p className="font-bold text-sky-950 text-[11px] truncate">{file.name}</p>
                                  <span className="text-[10px] text-slate-500 font-mono">{file.size}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(file.id);
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                title="Hapus file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md border border-yellow-500 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      Kirim Laporan
                    </button>
                  </div>

                </form>

              </div>

              {/* RIGHT COLUMN: KETENTUAN LAPORAN & FORMAT INFO (4 or 5 cols) */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                
                {/* Ketentuan Laporan Card */}
                <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-200 space-y-3">
                  <div className="flex items-center gap-2 border-b border-sky-200 pb-2">
                    <Info className="w-4 h-4 text-sky-800" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-sky-950 font-mono">
                      Ketentuan Laporan
                    </h4>
                  </div>

                  <ul className="space-y-2 text-[11px] text-slate-700 leading-relaxed font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Sertakan waktu, tempat, dan kronologi sejelas mungkin.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Foto atau video asli sangat membantu proses verifikasi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Anda bisa melampirkan hingga 5 foto atau video sekaligus.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Identitas pelapor dijaga kerahasiaannya bila diminta.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Redaksi tidak memuat laporan yang mengandung fitnah atau ujaran kebencian.</span>
                    </li>
                  </ul>
                </div>

                {/* Butuh Konfirmasi Cepat? Card */}
                <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-yellow-700" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-sky-950 font-mono">
                      Butuh Konfirmasi Cepat?
                    </h4>
                  </div>
                  <p className="text-[11px] text-sky-900 leading-relaxed font-medium">
                    Cantumkan email atau nomor telepon Anda agar redaksi bisa menghubungi Anda untuk konfirmasi laporan.
                  </p>
                </div>

                {/* Format File Yang Didukung Card */}
                <div className="bg-white rounded-2xl p-4 border border-sky-200 space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-sky-950 font-mono border-b border-sky-100 pb-1.5">
                    Format File Yang Didukung
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-sky-950 text-[11px] block">Foto</span>
                      <span className="text-[11px] text-slate-600 font-mono">JPG, PNG, WebP, GIF</span>
                    </div>

                    <div>
                      <span className="font-bold text-sky-950 text-[11px] block">Video</span>
                      <span className="text-[11px] text-slate-600 font-mono">MP4, MOV, AVI, WebM</span>
                    </div>
                  </div>
                </div>

                {/* Privacy & Trust Badge */}
                <div className="p-3 bg-sky-950 text-white rounded-xl border border-sky-800 flex flex-col gap-2 text-[10px] font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span>Dikelola secara aman sesuai Pedoman Media Siber & Dewan Pers RI.</span>
                  </div>
                  {onOpenCyberMediaGuidelinesModal && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-sky-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCyberMediaGuidelinesModal('panduan_warga');
                        }}
                        className="text-yellow-400 hover:text-yellow-300 underline font-bold cursor-pointer transition-colors"
                      >
                        • Baca Panduan Jurnalisme Warga
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCyberMediaGuidelinesModal('kode_etik');
                        }}
                        className="text-sky-300 hover:text-white underline cursor-pointer transition-colors"
                      >
                        • Kode Etik Jurnalistik
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
