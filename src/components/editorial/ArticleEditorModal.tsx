import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Image as ImageIcon, 
  Sparkles, 
  Wand2, 
  Layers, 
  FileText, 
  Tag, 
  User, 
  MapPin, 
  Flame, 
  Star, 
  CheckCircle,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Eye,
  Edit3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize2,
  BookOpen,
  Check,
  Bot,
  Loader2,
  RefreshCw,
  Zap,
  Radio,
  Share2
} from 'lucide-react';
import { Category, NewsArticle } from '../../types';
import { WordToolbar } from './WordToolbar';
import { renderRichParagraph } from '../../utils/textFormatter';
import { SeoHeadlineStudio } from './SeoHeadlineStudio';
import { compressImageFile } from '../../utils/imageCompressor';

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: NewsArticle, autoShare?: boolean) => void;
  editingArticle: NewsArticle | null;
  categories: Category[];
}

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingArticle,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('nasional');
  const [authorName, setAuthorName] = useState('Redaksi Arun News');
  const [authorRole, setAuthorRole] = useState('Reporter Berita');
  const [authorAvatar, setAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [readTime, setReadTime] = useState('4 mnt baca');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(['', '']);
  const [isHeadline, setIsHeadline] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isEditorPick, setIsEditorPick] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [views, setViews] = useState(1200);
  const [likes, setLikes] = useState(140);
  const [shares, setShares] = useState(35);
  const [formatAppliedMsg, setFormatAppliedMsg] = useState(false);
  const [status, setStatus] = useState<'published' | 'pending' | 'draft'>('published');
  const [scheduledPublishAt, setScheduledPublishAt] = useState<string>('');
  const [autoShareOnPublish, setAutoShareOnPublish] = useState<boolean>(true);

  // AI Draft Generator States
  const [isAiDraftModalOpen, setIsAiDraftModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState(category || 'nasional');
  const [aiTone, setAiTone] = useState('Laporan Jurnalistik Formal');
  const [aiKeyPoints, setAiKeyPoints] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [aiDraftError, setAiDraftError] = useState<string | null>(null);
  const [generatedDraftPreview, setGeneratedDraftPreview] = useState<{
    title: string;
    excerpt: string;
    category: string;
    paragraphs: string[];
    keyTakeaways: string[];
    tags: string[];
    imageCaption: string;
  } | null>(null);

  // AI SEO Headline Generator Modal State
  const [isSeoHeadlineModalOpen, setIsSeoHeadlineModalOpen] = useState(false);

  // Word Editor States
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [activeAlignment, setActiveAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [dropCap, setDropCap] = useState(true);
  const [fontStyle, setFontStyle] = useState<'sans' | 'serif' | 'mono'>('sans');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const samplePhotoPresets = [
    { label: 'Gedung & Pemerintahan', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Infrastruktur & Transportasi', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Teknologi & Server', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Pertanian & Lingkungan', url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Olahraga & Arena', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Ekonomi & Pasar', url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80' },
  ];

  useEffect(() => {
    if (editingArticle) {
      setTitle(editingArticle.title);
      setCategory(editingArticle.category);
      setAuthorName(editingArticle.author?.name || 'Redaksi Arun News');
      setAuthorRole(editingArticle.author?.role || 'Reporter');
      setAuthorAvatar(editingArticle.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
      setReadTime(editingArticle.readTime || '4 mnt baca');
      setImageUrl(editingArticle.imageUrl || '');
      setImageCaption(editingArticle.imageCaption || '');
      setExcerpt(editingArticle.excerpt || '');
      setContent(editingArticle.paragraphs ? editingArticle.paragraphs.join('\n\n') : editingArticle.content || '');
      setTagsInput(editingArticle.tags ? editingArticle.tags.join(', ') : '');
      setKeyTakeaways(editingArticle.keyTakeaways && editingArticle.keyTakeaways.length > 0 ? editingArticle.keyTakeaways : ['', '']);
      setIsHeadline(Boolean(editingArticle.isHeadline));
      setIsBreaking(Boolean(editingArticle.isBreaking));
      setIsEditorPick(Boolean(editingArticle.isEditorPick));
      setIsTrending(Boolean(editingArticle.isTrending));
      setViews(editingArticle.views || 100);
      setLikes(editingArticle.likes || 10);
      setShares(editingArticle.shares || 5);
      setStatus(editingArticle.status || 'published');
      setScheduledPublishAt(editingArticle.scheduledPublishAt || '');
    } else {
      // Reset for new article
      setTitle('');
      setCategory('nasional');
      setAuthorName('Bagus Setyawan');
      setAuthorRole('Jurnalis Investigasi Arun News');
      setAuthorAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
      setReadTime('4 mnt baca');
      setImageUrl(samplePhotoPresets[0].url);
      setImageCaption('Dokumentasi liputan lapangan Redaksi Arun News.');
      setExcerpt('');
      setContent('');
      setStatus('published');
      setScheduledPublishAt('');
      setTagsInput('Arun News, Berita Terkini, Nasional');
      setKeyTakeaways([
        'Pemberitaan terverifikasi dari sumber terpercaya di lapangan.',
        'Analisis dampak kebijakan bagi kepentingan masyarakat luas.'
      ]);
      setIsHeadline(false);
      setIsBreaking(false);
      setIsEditorPick(false);
      setIsTrending(false);
      setViews(500);
      setLikes(65);
      setShares(18);
    }
  }, [editingArticle, isOpen]);

  if (!isOpen) return null;

  const handleGenerateAiDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setIsGeneratingDraft(true);
    setAiDraftError(null);

    try {
      const res = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          category: aiCategory,
          tone: aiTone,
          keyPoints: aiKeyPoints.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghasilkan draf dari AI.');
      }

      if (data.draft) {
        setGeneratedDraftPreview(data.draft);
      } else {
        throw new Error('Draf artikel tidak berhasil dibuat oleh server.');
      }
    } catch (err: any) {
      console.error('Error generating AI draft:', err);
      setAiDraftError(err.message || 'Terjadi kesalahan saat memproses draf artikel.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleApplyGeneratedDraft = () => {
    if (!generatedDraftPreview) return;

    setTitle(generatedDraftPreview.title);
    setExcerpt(generatedDraftPreview.excerpt);
    setContent(generatedDraftPreview.paragraphs.join('\n\n'));
    if (generatedDraftPreview.category) {
      setCategory(generatedDraftPreview.category);
    }
    if (generatedDraftPreview.tags && generatedDraftPreview.tags.length > 0) {
      setTagsInput(generatedDraftPreview.tags.join(', '));
    }
    if (generatedDraftPreview.keyTakeaways && generatedDraftPreview.keyTakeaways.length > 0) {
      setKeyTakeaways(generatedDraftPreview.keyTakeaways);
    }
    if (generatedDraftPreview.imageCaption) {
      setImageCaption(generatedDraftPreview.imageCaption);
    }

    setIsAiDraftModalOpen(false);
    setGeneratedDraftPreview(null);
    setFormatAppliedMsg(true);
    setTimeout(() => setFormatAppliedMsg(false), 3000);
  };

  // Auto clean and format draft like Microsoft Word AutoCorrect & Format
  const handleAutoFormatDraft = () => {
    let cleanTitle = title.trim().replace(/\s+/g, ' ');
    let cleanExcerpt = excerpt.trim().replace(/\s+/g, ' ');

    let cleanContent = content
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p) => {
        // preserve markdown tags
        let formatted = p.replace(/\s+([,.:;?!])/g, '$1');
        formatted = formatted.replace(/([,.:;?!])(?=[a-zA-Z0-9])/g, '$1 ');
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
      })
      .join('\n\n');

    if (cleanTitle) setTitle(cleanTitle);
    if (cleanExcerpt) setExcerpt(cleanExcerpt);
    if (cleanContent) setContent(cleanContent);

    setFormatAppliedMsg(true);
    setTimeout(() => setFormatAppliedMsg(false), 2500);
  };

  const handleAddTakeaway = () => {
    setKeyTakeaways([...keyTakeaways, '']);
  };

  const handleUpdateTakeaway = (index: number, val: string) => {
    const updated = [...keyTakeaways];
    updated[index] = val;
    setKeyTakeaways(updated);
  };

  const handleRemoveTakeaway = (index: number) => {
    if (keyTakeaways.length <= 1) {
      setKeyTakeaways(['']);
      return;
    }
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index));
  };

  // Calculate live statistics
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const charNoSpacesCount = content.replace(/\s+/g, '').length;
  const paragraphList = content.split('\n\n').map(p => p.trim()).filter(Boolean);
  const paragraphCount = paragraphList.length || (content.trim() ? 1 : 0);
  const estimatedReadMins = Math.max(1, Math.ceil(wordCount / 180));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const selectedCategoryObj = categories.find((c) => c.id === category) || { name: 'Nasional' };
    const paragraphs = content
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const cleanTakeaways = keyTakeaways.map((t) => t.trim()).filter((t) => t.length > 0);

    const finalArticle: NewsArticle = {
      id: editingArticle?.id || `art-${Date.now()}`,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: excerpt.trim() || (paragraphs[0] ? paragraphs[0].slice(0, 150) + '...' : content.slice(0, 150) + '...'),
      content: content.trim(),
      paragraphs: paragraphs.length > 0 ? paragraphs : [content.trim()],
      category: category,
      categoryLabel: selectedCategoryObj.name,
      author: {
        name: authorName.trim() || 'Redaksi Arun News',
        role: authorRole.trim() || 'Jurnalis Arun News',
        avatar: authorAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      publishedAt: editingArticle?.publishedAt || 'Baru Saja • Redaksi',
      readTime: `${estimatedReadMins} mnt baca`,
      imageUrl: imageUrl.trim() || samplePhotoPresets[0].url,
      imageCaption: imageCaption.trim() || `Dokumentasi warta ${selectedCategoryObj.name}.`,
      views: Number(views) || 100,
      likes: Number(likes) || 10,
      shares: Number(shares) || 5,
      tags: tags.length > 0 ? tags : ['Arun News', selectedCategoryObj.name],
      isHeadline: isHeadline,
      isBreaking: isBreaking,
      isEditorPick: isEditorPick,
      isTrending: isTrending,
      keyTakeaways: cleanTakeaways.length > 0 ? cleanTakeaways : ['Liputan diverifikasi oleh Meja Redaksi.'],
      comments: editingArticle?.comments || [],
      status: status === 'pending' && scheduledPublishAt && new Date(scheduledPublishAt) > new Date() ? 'pending' : (status || 'published'),
      scheduledPublishAt: status === 'pending' && scheduledPublishAt ? scheduledPublishAt : undefined,
    };

    onSave(finalArticle, autoShareOnPublish);
    onClose();
  };

  const getLineSpacingClass = () => {
    switch (lineSpacing) {
      case 'normal': return 'leading-normal';
      case 'loose': return 'leading-loose';
      default: return 'leading-relaxed';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontStyle) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  return (
    <div 
      id="article-editor-modal-overlay"
      className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="article-editor-modal-card"
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl border-2 border-yellow-400 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-sky-950 text-white border-b border-sky-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight">
                  {editingArticle ? 'Edit Naskah Warta' : 'Tulis Berita Baru (Meja Redaksi)'}
                </h2>
                <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-1.5 py-0.2 rounded font-mono uppercase">
                  Word Editor Pro
                </span>
              </div>
              <p className="text-[11px] text-sky-200 font-mono">
                Pengaturan paragraf lengkap, perataan teks, spasi, heading, indentasi, dan takarir redaksi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Generator Button */}
            <button
              type="button"
              onClick={() => {
                setIsAiDraftModalOpen(true);
                if (title && !aiTopic) setAiTopic(title);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-black text-xs transition-all shadow-sm border border-purple-300/40 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span className="hidden sm:inline">Generator Draf AI</span>
              <span className="sm:hidden">AI Draf</span>
            </button>

            {/* View Mode Toggle: Edit vs Word Page Layout Preview */}
            <div className="flex items-center bg-sky-900 p-0.5 rounded-xl border border-sky-800 text-xs">
              <button
                type="button"
                onClick={() => setEditorMode('write')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  editorMode === 'write'
                    ? 'bg-yellow-400 text-sky-950 font-black shadow-xs'
                    : 'text-sky-200 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor Tulis</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  editorMode === 'preview'
                    ? 'bg-yellow-400 text-sky-950 font-black shadow-xs'
                    : 'text-sky-200 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tata Letak Halaman</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs flex-1 bg-slate-50/50">
          
          {/* Section: Status Flags (Headline, Breaking, Editor Pick, Trending) */}
          <div className="bg-sky-50/90 p-3.5 rounded-xl border border-sky-200 shadow-2xs">
            <div className="text-[11px] font-black uppercase tracking-wider text-sky-950 mb-2 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>Pengaturan Penempatan & Sorotan Berita</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isHeadline ? 'bg-yellow-400/25 border-yellow-500 text-sky-950 font-bold ring-1 ring-yellow-400' : 'bg-white border-sky-200 text-slate-700'
              }`}>
                <input 
                  type="checkbox" 
                  checked={isHeadline} 
                  onChange={(e) => setIsHeadline(e.target.checked)}
                  className="rounded text-yellow-500 focus:ring-yellow-400"
                />
                <span className="text-[11px]">⭐ Headline Utama</span>
              </label>

              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isBreaking ? 'bg-red-100 border-red-400 text-red-950 font-bold ring-1 ring-red-300' : 'bg-white border-sky-200 text-slate-700'
              }`}>
                <input 
                  type="checkbox" 
                  checked={isBreaking} 
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded text-red-500 focus:ring-red-400"
                />
                <span className="text-[11px]">🔴 Breaking News</span>
              </label>

              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isEditorPick ? 'bg-sky-200/60 border-sky-400 text-sky-950 font-bold ring-1 ring-sky-300' : 'bg-white border-sky-200 text-slate-700'
              }`}>
                <input 
                  type="checkbox" 
                  checked={isEditorPick} 
                  onChange={(e) => setIsEditorPick(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-400"
                />
                <span className="text-[11px]">📌 Pilihan Editor</span>
              </label>

              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isTrending ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold ring-1 ring-amber-300' : 'bg-white border-sky-200 text-slate-700'
              }`}>
                <input 
                  type="checkbox" 
                  checked={isTrending} 
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="text-[11px]">🔥 Masuk Trending</span>
              </label>
            </div>
          </div>

          {/* AI Writer Assistant Quick Banner */}
          <div className="p-3.5 bg-gradient-to-r from-purple-900 via-indigo-900 to-sky-950 text-white rounded-2xl border border-purple-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-300/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs uppercase tracking-wider text-yellow-300 font-mono">
                    🤖 Fitur Cerdas Redaksi (Gemini 3.7 AI)
                  </span>
                  <span className="bg-purple-500/40 text-purple-200 text-[10px] px-1.5 py-0.2 rounded font-mono">
                    Flash Engine
                  </span>
                </div>
                <p className="text-[11px] text-purple-100/90 leading-tight mt-0.5">
                  Bantu penulis menghasilkan 5 variasi headline SEO yang menarik atau susun draf naskah liputan utuh secara otomatis.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setIsSeoHeadlineModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-xs uppercase tracking-wider transition-all shadow-xs border border-amber-500 flex-shrink-0 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-950" />
                <span>Variasi Headline SEO</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAiDraftModalOpen(true);
                  if (title && !aiTopic) setAiTopic(title);
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xs border border-purple-400 flex-shrink-0 cursor-pointer active:scale-95"
              >
                <Wand2 className="w-3.5 h-3.5 text-yellow-300" />
                <span>Buat Draf via AI</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] font-mono">
                Judul Berita *
              </label>
              <button
                type="button"
                onClick={() => setIsSeoHeadlineModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-yellow-400/30 hover:bg-yellow-400/50 text-sky-950 border border-yellow-400 font-bold text-[11px] transition-colors cursor-pointer"
                title="Buka Generator Headline SEO Berbasis Kata Kunci"
              >
                <Sparkles className="w-3 h-3 text-yellow-600" />
                <span>✨ Rekomendasikan 5 Headline SEO (Gemini)</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pemerintah Resmikan Koridor Kereta Cepat Lintas Provinsi..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sky-950 shadow-2xs"
            />
          </div>

          {/* Category & Read Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                Kanal / Rubrik Berita *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sky-950 shadow-2xs"
              >
                {categories.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                Perkiraan Durasi Baca
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="Contoh: 4 mnt baca"
                  className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950 font-medium shadow-2xs"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400">
                  {wordCount} kata (~{estimatedReadMins} mnt)
                </span>
              </div>
            </div>
          </div>

          {/* Author Name, Role & Local Profile Photo Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                Nama Reporter / Penulis
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Nama Jurnalis"
                className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950 font-medium shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                Jabatan / Peran Redaksi
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Contoh: Jurnalis Investigasi Arun News"
                className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950 font-medium shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                Foto Profil Penulis (Upload Lokal)
              </label>
              <div className="flex items-center gap-2">
                <img
                  src={authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={authorName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-yellow-400 flex-shrink-0"
                />
                <label className="flex-1 cursor-pointer bg-sky-100 hover:bg-yellow-100 text-sky-950 px-3 py-2 rounded-xl border border-sky-300 text-center text-[11px] font-bold transition-colors truncate">
                  📷 Upload Foto Lokal
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImageFile(file, 300, 300, 0.85);
                          if (compressed) setAuthorAvatar(compressed);
                        } catch {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) setAuthorAvatar(evt.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Lead / Excerpt */}
          <div>
            <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
              Ringkasan Singkat / Lead Paragraf
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="1-2 kalimat ringkasan penting untuk kartu dan kutipan berita..."
              className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950 font-medium shadow-2xs"
            />
          </div>

          {/* ======================================================== */}
          {/* MICROSOFT WORD FULL PARAGRAPH & CONTENT EDITOR SUITE */}
          {/* ======================================================== */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-sky-300 shadow-sm space-y-2">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <span className="font-black uppercase tracking-wider text-sky-950 text-xs font-mono flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-yellow-500" />
                  Naskah Berita & Pengaturan Paragraf (Word Format)
                </span>
              </div>

              {/* Font Selector & Quick Format */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-sky-50 p-1 rounded-lg border border-sky-200 text-[11px]">
                  <span className="text-slate-500 font-mono mr-1">Font:</span>
                  <button
                    type="button"
                    onClick={() => setFontStyle('sans')}
                    className={`px-2 py-0.5 rounded font-sans ${fontStyle === 'sans' ? 'bg-yellow-400 font-black text-sky-950' : 'text-slate-700'}`}
                  >
                    Sans
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontStyle('serif')}
                    className={`px-2 py-0.5 rounded font-serif ${fontStyle === 'serif' ? 'bg-yellow-400 font-black text-sky-950' : 'text-slate-700'}`}
                  >
                    Serif
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFormatDraft}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-yellow-100 text-sky-950 font-bold border border-sky-300 text-[11px] transition-colors"
                  title="Rapikan spasi, tanda baca, dan kapitalisasi otomatis"
                >
                  <Wand2 className="w-3.5 h-3.5 text-yellow-600" />
                  <span>{formatAppliedMsg ? '✓ Format Rapi' : 'Rapikan Format'}</span>
                </button>
              </div>
            </div>

            {/* Microsoft Word Ribbon Toolbar */}
            <WordToolbar
              textareaRef={textareaRef}
              content={content}
              onChangeContent={(newText) => setContent(newText)}
              lineSpacing={lineSpacing}
              onChangeLineSpacing={(spacing) => setLineSpacing(spacing as any)}
              activeAlignment={activeAlignment}
              onChangeAlignment={(align) => setActiveAlignment(align as any)}
              dropCap={dropCap}
              onToggleDropCap={() => setDropCap(!dropCap)}
            />

            {/* Editor Area: Mode Tulis (Textarea dengan Word Ruler) vs Mode Pratinjau Dokumen */}
            {editorMode === 'write' ? (
              <div className="relative">
                {/* Word Ruler Top Indicator */}
                <div className="h-4 bg-sky-100/60 rounded-t-lg border-x border-t border-sky-200 flex items-center px-4 justify-between text-[8px] font-mono text-slate-400 select-none">
                  <span>| 0</span>
                  <span>| 2</span>
                  <span>| 4</span>
                  <span>| 6</span>
                  <span>| 8</span>
                  <span>| 10</span>
                  <span>| 12</span>
                  <span>| 14</span>
                  <span>| 16 cm</span>
                </div>

                <textarea
                  ref={textareaRef}
                  rows={10}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Tuliskan naskah berita lengkap di sini.\n\nContoh penggunaan tools paragraf:\n• Gunakan toolbar di atas untuk Bold, Italic, Stabilo, Underline\n• Gunakan tombol H1 / H2 untuk subjudul artikel\n• Gunakan tombol Rata Kiri, Tengah, Kanan, Justify untuk perataan paragraf\n• Gunakan Cap Lokasi Lapangan untuk menambahkan dateline berita`}
                  className={`w-full px-4 py-3 text-xs sm:text-sm bg-white rounded-b-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${getLineSpacingClass()} ${getFontFamilyClass()} text-sky-950 font-medium shadow-inner resize-y`}
                />
              </div>
            ) : (
              /* Microsoft Word Page Preview (Tampilan Layout Cetak / Pembaca) */
              <div className="bg-slate-200/70 p-4 sm:p-6 rounded-xl border border-slate-300 max-h-[380px] overflow-y-auto">
                <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-300 min-h-[300px]">
                  
                  {/* Document Header Metadata */}
                  <div className="border-b-2 border-sky-950 pb-3 mb-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {categories.find(c => c.id === category)?.name || 'Kanal Warta'}
                      </span>
                      <h1 className="text-base sm:text-lg font-black text-sky-950 mt-1">
                        {title || 'Judul Naskah Berita Belum Diisi'}
                      </h1>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Oleh: {authorName} ({authorRole}) • {estimatedReadMins} mnt baca
                      </div>
                    </div>
                  </div>

                  {/* Rendered Paragraphs with all Microsoft Word Formatting */}
                  <div className={`space-y-4 ${getFontFamilyClass()}`}>
                    {paragraphList.length > 0 ? (
                      paragraphList.map((para, idx) =>
                        renderRichParagraph(para, idx, {
                          fontSizeClass: 'text-xs sm:text-sm',
                          lineSpacingClass: getLineSpacingClass(),
                          fontFamily: fontStyle,
                          isFirstParagraph: idx === 0,
                          dropCap: dropCap,
                        })
                      )
                    ) : (
                      <p className="text-slate-400 italic text-center py-6">
                        Belum ada naskah berita. Ketik naskah di tab "Editor Tulis".
                      </p>
                    )}
                  </div>

                  {/* Document Footer */}
                  <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>ARUN NEWS • DOKUMEN REDAKSI</span>
                    <span>Halaman 1 / 1</span>
                  </div>
                </div>
              </div>
            )}

            {/* Microsoft Word Bottom Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-1 text-[11px] font-mono text-slate-500 border-t border-sky-100">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 font-bold text-sky-950">
                  <FileText className="w-3 h-3 text-sky-700" />
                  <span>{wordCount} Kata</span>
                </span>
                <span>•</span>
                <span>{charCount} Karakter ({charNoSpacesCount} tanpa spasi)</span>
                <span>•</span>
                <span>{paragraphCount} Paragraf</span>
                <span>•</span>
                <span>~{estimatedReadMins} mnt baca</span>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="bg-sky-100 text-sky-950 px-2 py-0.5 rounded font-bold uppercase">
                  Perataan: {activeAlignment}
                </span>
                <span className="bg-sky-100 text-sky-950 px-2 py-0.5 rounded font-bold uppercase">
                  Spasi: {lineSpacing === 'normal' ? '1.0' : lineSpacing === 'loose' ? '2.0' : '1.5'}
                </span>
                <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded font-bold">
                  ✓ Standar Redaksi
                </span>
              </div>
            </div>

          </div>

          {/* Key Takeaways */}
          <div className="bg-sky-50/80 p-3.5 rounded-xl border border-sky-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] font-mono">
                Poin Fakta Kunci (Key Takeaways)
              </label>
              <button
                type="button"
                onClick={handleAddTakeaway}
                className="flex items-center gap-1 text-[11px] font-bold text-sky-800 hover:text-sky-950"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Poin</span>
              </button>
            </div>
            {keyTakeaways.map((takeaway, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-yellow-600 w-4">{idx + 1}.</span>
                <input
                  type="text"
                  value={takeaway}
                  onChange={(e) => handleUpdateTakeaway(idx, e.target.value)}
                  placeholder={`Poin fakta kunci #${idx + 1}...`}
                  className="flex-1 px-3 py-1.5 text-xs bg-white rounded-lg border border-sky-200 text-sky-950 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTakeaway(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Photo & Caption */}
          <div>
            <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
              Foto Sampul & Takarir (Caption)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {samplePhotoPresets.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImageUrl(img.url)}
                  className={`relative rounded-xl overflow-hidden border-2 aspect-video transition-all ${
                    imageUrl === img.url ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-sky-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL Gambar Berita (https://...)"
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 font-mono shadow-2xs"
              />
              <label className="cursor-pointer bg-sky-950 hover:bg-sky-900 text-yellow-300 px-3 py-2 rounded-xl border border-sky-800 text-center text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
                <ImageIcon className="w-4 h-4 text-yellow-400" />
                <span>Upload Foto dari Lokal</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const compressed = await compressImageFile(file, 1200, 1200, 0.82);
                        if (compressed) setImageUrl(compressed);
                      } catch {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            setImageUrl(evt.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                />
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Takarir Foto / Keterangan Dokumentasi"
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 shadow-2xs"
              />
            </div>
          </div>

          {/* Tags & Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                Tagar Berita (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Nasional, Investasi, Kereta Cepat"
                className="w-full px-3.5 py-2 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 font-medium shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                Statistik Awal (Views, Likes, Shares)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={views}
                  onChange={(e) => setViews(Number(e.target.value))}
                  placeholder="Views"
                  className="px-2 py-1.5 text-xs bg-white rounded-lg border border-sky-200 text-sky-950 font-mono shadow-2xs"
                  title="Views"
                />
                <input
                  type="number"
                  value={likes}
                  onChange={(e) => setLikes(Number(e.target.value))}
                  placeholder="Likes"
                  className="px-2 py-1.5 text-xs bg-white rounded-lg border border-sky-200 text-sky-950 font-mono shadow-2xs"
                  title="Likes"
                />
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(Number(e.target.value))}
                  placeholder="Shares"
                  className="px-2 py-1.5 text-xs bg-white rounded-lg border border-sky-200 text-sky-950 font-mono shadow-2xs"
                  title="Shares"
                />
              </div>
            </div>
          </div>

          {/* Status & Penjadwalan Publikasi Otomatis */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Status &amp; Penjadwalan Publikasi Otomatis
              </label>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                status === 'published' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                status === 'pending' ? 'bg-amber-200 text-amber-900 border border-amber-400' :
                'bg-slate-200 text-slate-700'
              }`}>
                {status === 'published' ? 'Terbit Langsung' : status === 'pending' ? 'Pending (Terjadwal)' : 'Draf'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                  status === 'published'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span>🟢 Published</span>
                <span className="text-[10px] font-normal opacity-85 mt-0.5">Terbitkan langsung ke portal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('pending');
                  if (!scheduledPublishAt) {
                    const future = new Date(Date.now() + 60 * 60 * 1000);
                    setScheduledPublishAt(future.toISOString().slice(0, 16));
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                  status === 'pending'
                    ? 'bg-amber-500 text-sky-950 border-amber-600 shadow-xs ring-2 ring-amber-300 font-black'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                }`}
              >
                <span>⏳ Pending (Terjadwal)</span>
                <span className="text-[10px] font-normal opacity-85 mt-0.5">Terbit otomatis pada waktu tertentu</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                  status === 'draft'
                    ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                <span>📝 Draft</span>
                <span className="text-[10px] font-normal opacity-85 mt-0.5">Simpan draf naskah internal</span>
              </button>
            </div>

            {status === 'pending' && (
              <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-2 animate-in fade-in duration-200">
                <label className="block text-[11px] font-bold text-sky-950">
                  Pilih Tanggal &amp; Jam Publikasi Otomatis (WIB):
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <input
                    type="datetime-local"
                    required={status === 'pending'}
                    value={scheduledPublishAt}
                    onChange={(e) => setScheduledPublishAt(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-amber-900 font-mono font-bold">
                    {scheduledPublishAt && new Date(scheduledPublishAt) > new Date()
                      ? `⏳ Terjadwal dalam ${Math.max(1, Math.round((new Date(scheduledPublishAt).getTime() - Date.now()) / (1000 * 60)))} menit ke depan`
                      : '⚠️ Tentukan waktu publikasi di masa mendatang'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight">
                  Status artikel akan berlabel <strong>'Pending'</strong> dan otomatis berubah menjadi <strong>'Published'</strong> serta muncul di portal utama saat waktu tiba.
                </p>
              </div>
            )}
          </div>

          {/* Section: Auto-Share ke Media Sosial saat Terbit */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white border border-sky-800 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs select-none">
                <Radio className="w-4 h-4 text-yellow-400 animate-pulse flex-shrink-0" />
                <span className="font-sans font-black uppercase tracking-wide text-white">
                  Siarkan Otomatis ke Media Sosial saat Terbit
                </span>
              </label>
              <input
                type="checkbox"
                checked={autoShareOnPublish}
                onChange={(e) => setAutoShareOnPublish(e.target.checked)}
                className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-sky-200 leading-relaxed">
              Otomatis meluncurkan sindikasi multi-saluran ke <strong>WhatsApp</strong>, <strong>Telegram</strong>, <strong>X (Twitter)</strong>, <strong>Facebook</strong>, dan <strong>Webhook API</strong> untuk mendongkrak jangkauan pembaca secara real-time.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-sky-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Format tersimpan sesuai standar penulisan naskah redaksi Microsoft Word.
            </div>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sky-800 hover:bg-sky-100 font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-xs border border-yellow-500 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{editingArticle ? 'Simpan Perubahan Berita' : 'Terbitkan Berita Baru'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* AI Draft Generator Modal Overlay */}
      {isAiDraftModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-sky-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setIsAiDraftModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full border-2 border-purple-500 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-sky-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-purple-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/50 flex items-center justify-center text-yellow-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                      Generator Draf Berita AI
                    </h3>
                    <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded font-mono">
                      Gemini 3.7
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200 font-mono mt-0.5">
                    Menyusun draf naskah liputan lengkap berstandar jurnalistik 5W+1H
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiDraftModalOpen(false)}
                className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-purple-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {aiDraftError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-medium">
                  ⚠️ {aiDraftError}
                </div>
              )}

              {!generatedDraftPreview ? (
                <form onSubmit={handleGenerateAiDraft} className="space-y-4">
                  {/* Topik / Judul Input */}
                  <div>
                    <label className="block font-black uppercase text-sky-950 text-[11px] mb-1 font-mono">
                      Topik Utama atau Judul Berita yang Diinginkan *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Contoh: Pembangunan Tol Trans Sumatra Sektor 4 Resmi Beroperasi, Pangkas Waktu Tempuh 2 Jam..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-sky-950 shadow-2xs"
                    />
                  </div>

                  {/* Category & Tone Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black uppercase text-sky-950 text-[11px] mb-1 font-mono">
                        Target Kanal / Rubrik Berita
                      </label>
                      <select
                        value={aiCategory}
                        onChange={(e) => setAiCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-sky-950 shadow-2xs"
                      >
                        {categories.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-black uppercase text-sky-950 text-[11px] mb-1 font-mono">
                        Gaya Penulisan & Nada Warta
                      </label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-sky-950 shadow-2xs"
                      >
                        <option value="Laporan Jurnalistik Formal">Laporan Jurnalistik Formal (Resmi & Lugas)</option>
                        <option value="Investigatif Mendalam">Investigatif & Analisis Mendalam</option>
                        <option value="Kilas Berita / Breaking News">Kilas Berita Cepat (Breaking News)</option>
                        <option value="Fitur & Soft News">Fitur & Human Interest (Soft News)</option>
                      </select>
                    </div>
                  </div>

                  {/* Optional Key Points / Raw Quotes */}
                  <div>
                    <label className="block font-black uppercase text-sky-950 text-[11px] mb-1 font-mono">
                      Poin-Poin Narasumber / Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={aiKeyPoints}
                      onChange={(e) => setAiKeyPoints(e.target.value)}
                      placeholder="Contoh: Kutipan Menteri PUPR, data investasi Rp 12 Triliun, target penyelesaian akhir tahun..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-sky-950 shadow-2xs"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAiDraftModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isGeneratingDraft || !aiTopic.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isGeneratingDraft ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                          <span>Menyusun Draf AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          <span>Hasilkan Draf Otomatis</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Generated Draft Preview */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Draf artikel berhasil disintesis oleh AI Gemini!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGeneratedDraftPreview(null)}
                      className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Buat Ulang</span>
                    </button>
                  </div>

                  {/* Preview Cards */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
                        Judul Hasil AI:
                      </span>
                      <h4 className="text-sm font-black text-sky-950 mt-0.5">{generatedDraftPreview.title}</h4>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
                        Teras Berita (Lead):
                      </span>
                      <p className="text-xs text-slate-700 font-medium italic mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
                        "{generatedDraftPreview.excerpt}"
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
                        Pratinjau Isi ({generatedDraftPreview.paragraphs.length} Paragraf):
                      </span>
                      <div className="mt-1 space-y-2 max-h-48 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed text-[11px]">
                        {generatedDraftPreview.paragraphs.map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))}
                      </div>
                    </div>

                    {generatedDraftPreview.keyTakeaways && generatedDraftPreview.keyTakeaways.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
                          Poin Kunci (Key Takeaways):
                        </span>
                        <ul className="mt-1 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                          {generatedDraftPreview.keyTakeaways.map((kt, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-800 font-medium">
                              <span className="text-purple-600 font-bold">•</span>
                              <span>{kt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGeneratedDraftPreview(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                    >
                      Ubah Parameter
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyGeneratedDraft}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-md border border-yellow-500 cursor-pointer active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Gunakan Draf Ini di Editor</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI SEO Headline Studio Modal Overlay */}
      {isSeoHeadlineModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setIsSeoHeadlineModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-5xl w-full border-2 border-yellow-400 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto p-4 sm:p-6 flex-1">
              <SeoHeadlineStudio
                categories={categories}
                showToast={(msg) => {
                  setFormatAppliedMsg(true);
                  setTimeout(() => setFormatAppliedMsg(false), 2000);
                }}
                isModalMode={true}
                initialCategory={category}
                initialKeywords={tagsInput ? tagsInput.split(/[,;]+/).map(t => t.trim()).filter(Boolean) : (title ? [title.slice(0, 30)] : [])}
                initialTopic={title || ''}
                onCloseModal={() => setIsSeoHeadlineModalOpen(false)}
                onApplyToCurrentArticle={(selectedHeadline, suggestedTags) => {
                  setTitle(selectedHeadline);
                  if (suggestedTags && suggestedTags.length > 0) {
                    const existingTags = tagsInput.split(/[,;]+/).map(t => t.trim()).filter(Boolean);
                    const combined = Array.from(new Set([...existingTags, ...suggestedTags]));
                    setTagsInput(combined.join(', '));
                  }
                  setIsSeoHeadlineModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
