import jsPDF from 'jspdf';
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  Eye, 
  EyeOff,
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Heart, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles, 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  CheckCircle2, 
  Copy, 
  Tag, 
  ArrowRight,
  Type,
  FileText,
  Printer,
  Coffee,
  Download,
  Loader2,
  AlignLeft,
  Quote,
  Check,
  BookOpen,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Flag,
  AlertTriangle,
  Info,
  TrendingUp,
  MinusCircle,
  Headphones,
  SkipBack,
  SkipForward,
  Mic,
  Database,
  WifiOff,
  Music,
  Sliders,
  Volume1,
  CloudRain,
  Disc,
  Waves,
  HelpCircle,
  ChevronsDown
} from 'lucide-react';
import { NewsArticle, NewsComment } from '../types';
import { analyzeArticleSentiment } from '../utils/sentimentEngine';
import { getArticleReadingTime } from '../utils/readingTime';
import { renderRichParagraph } from '../utils/textFormatter';
import { analyzeCommentAntiBuzzer, DEFAULT_BUZZER_CONFIG } from '../utils/antiBuzzerEngine';
import { ambientEngine, AMBIENT_TRACKS } from '../utils/ambientSoundEngine';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { GlossaryModal } from './GlossaryModal';
import { 
  saveCommentToIndexedDB, 
  saveAllCommentsToIndexedDB, 
  getCommentsFromIndexedDB 
} from '../utils/offlineStorage';
import { saveCommentToDB, fetchCommentsFromDB } from '../services/dbClient';
import { UniversalShareModal } from './UniversalShareModal';
import { getArticleShareUrl as getPublicArticleShareUrl, getPublicPortalOrigin } from '../utils/shareUtils';

interface ReactionItem {
  emoji: string;
  label: string;
  count: number;
  userReacted: boolean;
}

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (article: NewsArticle, e: React.MouseEvent) => void;
  fontSize?: 'small' | 'medium' | 'large' | 'normal' | 'xlarge';
  onSelectTag: (tag: string) => void;
  onSelectRelatedArticle: (article: NewsArticle) => void;
  allArticles: NewsArticle[];
  readArticleIds?: string[];
  onUpdateReadProgress?: (articleId: string, progress: number) => void;
  initialProgress?: number;
  onOpenSawerKopi?: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  isSaved,
  onToggleSave,
  fontSize: initialFontSize,
  onSelectTag,
  onSelectRelatedArticle,
  allArticles,
  readArticleIds = [],
  onUpdateReadProgress,
  initialProgress = 0,
  onOpenSawerKopi,
}) => {
  const readingTimeInfo = getArticleReadingTime(article || {});
  const isEditorial = Boolean(
    article?.isEditorial || 
    article?.category === 'Opini' || 
    article?.category === 'Analisis' || 
    (article?.paragraphs && article.paragraphs.length >= 4)
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(-1);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Background Ambient Sound Engine State
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [selectedAmbientTrack, setSelectedAmbientTrack] = useState<string>('zen_pad');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.3);

  const handleToggleAmbient = () => {
    if (isAmbientPlaying) {
      ambientEngine.stop();
      setIsAmbientPlaying(false);
    } else {
      ambientEngine.play(selectedAmbientTrack, ambientVolume);
      setIsAmbientPlaying(true);
    }
  };

  const handleSelectAmbientTrack = (trackId: string) => {
    setSelectedAmbientTrack(trackId);
    if (isAmbientPlaying) {
      ambientEngine.play(trackId, ambientVolume);
    }
  };

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    ambientEngine.setVolume(vol);
  };
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Reaction states with local persistence per article & article metadata tracking
  const [reactions, setReactions] = useState<Record<string, ReactionItem>>({
    'like': { emoji: '👍', label: 'Like', count: 24, userReacted: false },
    'insightful': { emoji: '💡', label: 'Insightful', count: 31, userReacted: false },
    'shocking': { emoji: '😲', label: 'Shocking', count: 12, userReacted: false },
    'fire': { emoji: '🔥', label: 'Mantap', count: 56, userReacted: false },
    'heart': { emoji: '❤️', label: 'Suka Banget', count: 42, userReacted: false },
    'sad': { emoji: '😢', label: 'Sedih', count: 8, userReacted: false }
  });
  const [lastReactedKey, setLastReactedKey] = useState<string | null>(null);

  const handleReactionClick = (key: string) => {
    if (!article) return;

    // Trigger haptic vibration on supporting mobile devices
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        const isReacting = !reactions[key]?.userReacted;
        if (isReacting) {
          // Satisfying double-tap pulse for adding a reaction
          navigator.vibrate([30, 20, 25]);
        } else {
          // Subtle single tick for removing a reaction
          navigator.vibrate(15);
        }
      } catch (e) {
        // Safe fallback if vibration fails or permissions restricted
      }
    }

    setLastReactedKey(key);
    setTimeout(() => setLastReactedKey(null), 1000);

    setReactions((prev) => {
      const current = prev[key];
      if (!current) return prev;

      const userReacted = !current.userReacted;
      const count = userReacted ? current.count + 1 : Math.max(0, current.count - 1);
      
      const updated: Record<string, ReactionItem> = {
        ...prev,
        [key]: { ...current, count, userReacted }
      };

      // Persist to localStorage for this article ID
      try {
        const userReactedMap: Record<string, boolean> = {};
        const countsMap: Record<string, number> = {};
        (Object.entries(updated) as Array<[string, ReactionItem]>).forEach(([k, item]) => {
          if (item.userReacted) userReactedMap[k] = true;
          countsMap[k] = item.count;
        });
        localStorage.setItem(`wartakini_reactions_${article.id}`, JSON.stringify({
          userReacted: userReactedMap,
          counts: countsMap
        }));
      } catch (e) {
        console.error('Failed to save reactions:', e);
      }

      return updated;
    });
  };
  
  // Clean reading & draft mode settings
  const [viewMode, setViewMode] = useState<'portal' | 'draft'>('portal');
  const normalizeFontSize = (fs?: string): 'small' | 'medium' | 'large' => {
    if (fs === 'small') return 'small';
    if (fs === 'large' || fs === 'xlarge') return 'large';
    return 'medium';
  };

  const [localFontSize, setLocalFontSize] = useState<'small' | 'medium' | 'large'>(() => normalizeFontSize(initialFontSize));
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('sans');
  const [copiedDraft, setCopiedDraft] = useState(false);

  const isNightMode = false;
  const isWarmMode = false;

  // Auto-scroll state & speed control
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<1 | 2 | 3>(1); // 1: Lambat, 2: Sedang, 3: Cepat

  // PDF Export state
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Focus Mode state (Mode Fokus - Bebas Distraksi)
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  // Keyboard shortcut: Escape exits focus mode first
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Glossary lookup modal state
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<string | null>(null);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);

  // Auto-Scroll effect
  useEffect(() => {
    let intervalId: any = null;
    if (isAutoScrolling && scrollContainerRef.current) {
      const step = autoScrollSpeed === 1 ? 1 : autoScrollSpeed === 2 ? 2 : 3;
      const intervalMs = autoScrollSpeed === 1 ? 30 : autoScrollSpeed === 2 ? 22 : 16;

      intervalId = setInterval(() => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 8) {
          setIsAutoScrolling(false);
          clearInterval(intervalId);
        } else {
          scrollContainerRef.current.scrollTop += step;
        }
      }, intervalMs);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoScrolling, autoScrollSpeed]);

  // Comment state & Anti-Buzzer Protection
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [commentFilter, setCommentFilter] = useState<'all' | 'verified' | 'suspect'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [targetWaNumber, setTargetWaNumber] = useState('');
  const [waSendError, setWaSendError] = useState<string | null>(null);

  // Mock Share Counts State & Visual Feedback
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({
    whatsapp: 142,
    twitter: 89,
    facebook: 215,
    telegram: 67,
    copy: 310,
    email: 45
  });
  const [lastSharedPlatform, setLastSharedPlatform] = useState<string | null>(null);

  const handleAttemptClose = () => {
    onClose();
  };

  // Anti-Buzzer Modals & Feedback States
  const [isAntiBuzzerModalOpen, setIsAntiBuzzerModalOpen] = useState<boolean>(false);
  const [commentFeedback, setCommentFeedback] = useState<{ type: string; title: string; message: string } | null>(null);
  const [reportingComment, setReportingComment] = useState<NewsComment | null>(null);
  const [reportReason, setReportReason] = useState<string>('Akun Buzzer Bayaran / Framing Terkoordinasi');
  const [reportNote, setReportNote] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (article) {
      setLikesCount(article.likes || 0);
      const defaultComments = article.comments || [];
      setComments(defaultComments);

      // Load offline comments persisted in IndexedDB and Cloud SQL DB for this article
      const loadArticleComments = async () => {
        const mergedMap = new Map<string, NewsComment>();
        defaultComments.forEach((c) => mergedMap.set(c.id, c));

        try {
          const offlineComms = await getCommentsFromIndexedDB(article.id);
          if (offlineComms && offlineComms.length > 0) {
            offlineComms.forEach((c) => mergedMap.set(c.id, c));
          }
        } catch (err) {
          console.error('Error fetching comments from IndexedDB:', err);
        }

        try {
          const dbComments = await fetchCommentsFromDB(article.id);
          if (Array.isArray(dbComments) && dbComments.length > 0) {
            dbComments.forEach((c) => mergedMap.set(c.id, c));
          }
        } catch (err) {
          // Ignore network errors in offline/dev mode
        }

        const mergedList = Array.from(mergedMap.values());
        setComments(mergedList);
      };

      loadArticleComments();

      setHasLiked(false);
      setActiveReaction(null);
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setCurrentChunkIndex(-1);
      setCopiedDraft(false);
      setCopiedLink(false);

      // Load reaction counts from article metadata and localStorage
      const numId = parseInt(article.id.replace(/\D/g, '') || '1', 10);
      const seedLike = article.reactions?.like ?? article.likes ?? ((numId * 7) % 45 + 12);
      const seedInsightful = article.reactions?.insightful ?? ((numId * 13) % 35 + 8);
      const seedShocking = article.reactions?.shocking ?? ((numId * 19) % 25 + 5);
      const seedFire = article.reactions?.fire ?? ((numId * 23) % 50 + 15);
      const seedHeart = article.reactions?.heart ?? ((numId * 29) % 30 + 10);
      const seedSad = article.reactions?.sad ?? ((numId * 31) % 20 + 4);

      let savedUserReacted: Record<string, boolean> = {};
      let savedCounts: Record<string, number> = {};

      try {
        const stored = localStorage.getItem(`wartakini_reactions_${article.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          savedUserReacted = parsed.userReacted || {};
          savedCounts = parsed.counts || {};
        }
      } catch (e) {
        console.error('Error loading stored reactions:', e);
      }

      setReactions({
        like: { emoji: '👍', label: 'Like (Suka)', count: savedCounts['like'] ?? seedLike, userReacted: !!savedUserReacted['like'] },
        insightful: { emoji: '💡', label: 'Insightful (Inspiratif)', count: savedCounts['insightful'] ?? seedInsightful, userReacted: !!savedUserReacted['insightful'] },
        shocking: { emoji: '😲', label: 'Shocking (Mengejutkan)', count: savedCounts['shocking'] ?? seedShocking, userReacted: !!savedUserReacted['shocking'] },
        fire: { emoji: '🔥', label: 'Mantap (Hot)', count: savedCounts['fire'] ?? seedFire, userReacted: !!savedUserReacted['fire'] },
        heart: { emoji: '❤️', label: 'Suka Banget', count: savedCounts['heart'] ?? seedHeart, userReacted: !!savedUserReacted['heart'] },
        sad: { emoji: '😢', label: 'Sedih', count: savedCounts['sad'] ?? seedSad, userReacted: !!savedUserReacted['sad'] }
      });

      // Seed mock share counts based on article id
      setShareCounts({
        whatsapp: ((numId * 11 + 42) % 300) + 45,
        twitter: ((numId * 17 + 23) % 200) + 28,
        facebook: ((numId * 23 + 15) % 400) + 72,
        telegram: ((numId * 29 + 11) % 150) + 18,
        copy: ((numId * 37 + 19) % 350) + 64,
        email: ((numId * 41 + 7) % 100) + 12,
      });
      setLastSharedPlatform(null);

      const startProg = initialProgress || 0;
      setScrollProgress(startProg);
      if (scrollContainerRef.current) {
        if (startProg > 0) {
          setTimeout(() => {
            if (scrollContainerRef.current) {
              const target = scrollContainerRef.current;
              const scrollHeight = target.scrollHeight - target.clientHeight;
              if (scrollHeight > 0) {
                target.scrollTop = Math.round((startProg / 100) * scrollHeight);
              }
            }
          }, 50);
        } else {
          scrollContainerRef.current.scrollTop = 0;
        }
      }
      window.speechSynthesis?.cancel();
      ambientEngine.stop();
      setIsAmbientPlaying(false);
    }
    return () => {
      window.speechSynthesis?.cancel();
      ambientEngine.stop();
      setIsAmbientPlaying(false);
    };
  }, [article, initialProgress]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setScrollProgress(0);
    }
  }, [viewMode]);

  // Dynamic Meta Tags (Open Graph / Twitter Card / Description) for social share previews
  useEffect(() => {
    if (!article) return;

    // Save previous document state
    const prevTitle = document.title;
    const prevDescriptionMeta = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // Set new document title
    document.title = `${article.title} - Arun News`;

    // Helper to set/create meta tags
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Define correct description, url, and image
    const articleDescription = article.excerpt || article.content.substring(0, 160) + '...';
    const articleUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/article/${encodeURIComponent(article.slug || article.id)}`
      : `/article/${encodeURIComponent(article.slug || article.id)}`;
    const articleImage = article.imageUrl || '';

    // Set standard and Open Graph tags
    setMetaTag('name', 'description', articleDescription);
    setMetaTag('property', 'og:title', article.title);
    setMetaTag('property', 'og:description', articleDescription);
    setMetaTag('property', 'og:image', articleImage);
    setMetaTag('property', 'og:url', articleUrl);
    setMetaTag('property', 'og:type', 'article');
    setMetaTag('property', 'og:site_name', 'Arun News');

    // Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', article.title);
    setMetaTag('name', 'twitter:description', articleDescription);
    setMetaTag('name', 'twitter:image', articleImage);

    return () => {
      // Restore previous document title and description meta
      document.title = prevTitle;
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) {
        descMeta.setAttribute('content', prevDescriptionMeta);
      }

      // Remove the dynamically added Open Graph / Twitter tags to clean up the head
      const dynamicProperties = [
        { attr: 'property', val: 'og:title' },
        { attr: 'property', val: 'og:description' },
        { attr: 'property', val: 'og:image' },
        { attr: 'property', val: 'og:url' },
        { attr: 'property', val: 'og:type' },
        { attr: 'property', val: 'og:site_name' },
        { attr: 'name', val: 'twitter:card' },
        { attr: 'name', val: 'twitter:title' },
        { attr: 'name', val: 'twitter:description' },
        { attr: 'name', val: 'twitter:image' }
      ];

      dynamicProperties.forEach(({ attr, val }) => {
        const el = document.querySelector(`meta[${attr}="${val}"]`);
        if (el) {
          el.remove();
        }
      });
    };
  }, [article]);

  useEffect(() => {
    setLocalFontSize(normalizeFontSize(initialFontSize));
  }, [initialFontSize]);

  // Related Articles section: identifies and displays up to three articles from the same category as currently viewed article
  const relatedArticles = React.useMemo(() => {
    if (!article) return [];
    
    // 1. Identify articles in the EXACT SAME CATEGORY
    const sameCategory = allArticles.filter(
      (a) => a.id !== article.id && a.category === article.category
    );

    // Score same category articles based on shared tags, trending status, editor pick, and views
    const scoredSameCategory = sameCategory.map((a) => {
      let score = 100; // Base score for same category match
      if (a.tags && article.tags) {
        const common = a.tags.filter((t) => article.tags.includes(t));
        score += common.length * 15;
      }
      if (a.isHeadline) score += 12;
      if (a.isEditorPick) score += 10;
      if (a.isTrending) score += 8;
      score += Math.min(30, Math.floor((a.views || 0) / 100));
      return { article: a, score };
    });

    scoredSameCategory.sort((a, b) => b.score - a.score);

    // Displays up to three articles from the same category
    return scoredSameCategory.slice(0, 3).map((item) => item.article);
  }, [article, allArticles]);

  const totalCategoryArticlesCount = React.useMemo(() => {
    if (!article) return 0;
    return allArticles.filter((a) => a.category === article.category).length;
  }, [article, allArticles]);

  // Local bookmark tracking for interactive card bookmarking
  const [savedArticleIdSet, setSavedArticleIdSet] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('wartakini_bookmarks');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('wartakini_bookmarks');
      if (raw) setSavedArticleIdSet(new Set(JSON.parse(raw)));
    } catch {}
  }, [isSaved, article?.id]);

  const handleCardToggleSave = (targetArticle: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(targetArticle, e);
    setSavedArticleIdSet((prev) => {
      const next = new Set(prev);
      if (next.has(targetArticle.id)) {
        next.delete(targetArticle.id);
      } else {
        next.add(targetArticle.id);
      }
      return next;
    });
  };

  // Automated 'Recommended for You' section: 3 articles from the SAME category that the user hasn't read yet
  const recommendedForYou = React.useMemo(() => {
    if (!article) return [];

    const readSet = new Set<string>(readArticleIds || []);
    if (!readArticleIds || readArticleIds.length === 0) {
      try {
        const saved = localStorage.getItem('wartakini_read_articles');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach((id: string) => readSet.add(id));
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    // 1. Same category, unread, not current article
    const unreadSameCategory = allArticles.filter(
      (a) => a.id !== article.id && a.category === article.category && !readSet.has(a.id)
    );

    // Sort by views
    unreadSameCategory.sort((a, b) => (b.views || 0) - (a.views || 0));

    if (unreadSameCategory.length >= 3) {
      return unreadSameCategory.slice(0, 3);
    }

    // Backfill 1: If < 3 unread in same category, get unread from other categories
    const unreadOtherCategories = allArticles.filter(
      (a) => a.id !== article.id && a.category !== article.category && !readSet.has(a.id)
    );
    unreadOtherCategories.sort((a, b) => (b.views || 0) - (a.views || 0));

    const combinedUnread = [...unreadSameCategory, ...unreadOtherCategories];
    if (combinedUnread.length >= 3) {
      return combinedUnread.slice(0, 3);
    }

    // Backfill 2: Same category articles even if read
    const readSameCategory = allArticles.filter(
      (a) => a.id !== article.id && a.category === article.category && readSet.has(a.id)
    );
    readSameCategory.sort((a, b) => (b.views || 0) - (a.views || 0));

    const pool = [...combinedUnread, ...readSameCategory];
    const uniqueList: NewsArticle[] = [];
    const seen = new Set<string>();

    for (const item of pool) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        uniqueList.push(item);
      }
    }

    return uniqueList.slice(0, 3);
  }, [article, allArticles, readArticleIds]);

  const paragraphs = article?.paragraphs && article.paragraphs.length > 0
    ? article.paragraphs
    : (article?.content ? article.content.split('\n\n').filter(Boolean) : [article?.excerpt || 'Isi berita belum tersedia.']);

  // Load Web Speech API Voices asynchronously
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
          // Auto select Indonesian voice if available, otherwise first voice
          const indoVoice = voices.find(
            v => v.lang === 'id-ID' || v.lang === 'id_ID' || v.lang.toLowerCase().startsWith('id')
          );
          if (indoVoice) {
            setSelectedVoiceURI(indoVoice.voiceURI);
          } else if (voices[0]) {
            setSelectedVoiceURI(voices[0].voiceURI);
          }
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  // Text to Speech Audio Player handling using Web Speech API
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold
      .replace(/\*(.*?)\*/g, '$1')     // remove italic
      .replace(/#{1,6}\s+/g, '')       // remove headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // remove markdown links
      .replace(/https?:\/\/\S+/g, '')  // remove raw URLs
      .replace(/[`_~>]/g, '')          // remove formatting chars
      .replace(/\s+/g, ' ')            // collapse whitespace
      .trim();
  };

  const getArticleChunks = (): string[] => {
    if (!article) return [];
    return [
      `${article.title}. ${article.excerpt || ''}`,
      ...paragraphs
    ].filter(p => p && p.trim().length > 0);
  };

  const speakChunk = (index: number, rate = speechRate, voiceUri = selectedVoiceURI) => {
    if (!('speechSynthesis' in window) || !article) return;

    const chunks = getArticleChunks();
    if (index < 0 || index >= chunks.length) {
      handleStopTTS();
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(chunks[index]);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = rate;

    const chosenVoice =
      availableVoices.find(v => v.voiceURI === voiceUri) ||
      availableVoices.find(v => v.lang.toLowerCase().startsWith('id')) ||
      null;

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onend = () => {
      if (index + 1 < chunks.length) {
        speakChunk(index + 1, rate, voiceUri);
      } else {
        handleStopTTS();
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (index + 1 < chunks.length) {
        speakChunk(index + 1, rate, voiceUri);
      } else {
        handleStopTTS();
      }
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    setIsPausedAudio(false);
    setCurrentChunkIndex(index);
  };

  const handleToggleTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Browser tidak mendukung Web Speech API untuk pembacaan suara artikel.');
      return;
    }

    if (isPlayingAudio) {
      if (isPausedAudio) {
        window.speechSynthesis.resume();
        setIsPausedAudio(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedAudio(true);
      }
    } else {
      const startIdx = currentChunkIndex >= 0 ? currentChunkIndex : 0;
      speakChunk(startIdx);
    }
  };

  const handleStopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setCurrentChunkIndex(-1);
  };

  const handlePrevChunk = () => {
    const prevIdx = Math.max(0, currentChunkIndex - 1);
    speakChunk(prevIdx);
  };

  const handleNextChunk = () => {
    const chunks = getArticleChunks();
    const nextIdx = Math.min(chunks.length - 1, currentChunkIndex + 1);
    speakChunk(nextIdx);
  };

  const handleSpeechRateChange = (rate: number) => {
    setSpeechRate(rate);
    if (isPlayingAudio && currentChunkIndex >= 0) {
      speakChunk(currentChunkIndex, rate, selectedVoiceURI);
    }
  };

  const handleVoiceChange = (voiceUri: string) => {
    setSelectedVoiceURI(voiceUri);
    if (isPlayingAudio && currentChunkIndex >= 0) {
      speakChunk(currentChunkIndex, speechRate, voiceUri);
    }
  };

  // Scroll linked reading progress bar
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    let progress = 0;
    if (scrollHeight > 0) {
      progress = Math.min(100, Math.max(0, Math.round((target.scrollTop / scrollHeight) * 100)));
    } else {
      progress = 100;
    }
    setScrollProgress(progress);
    if (article) {
      onUpdateReadProgress?.(article.id, progress);
    }
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const authorName = newCommentName.trim() || 'Pembaca Terdaftar';
    const text = newCommentText.trim();

    // Run smart Anti-Buzzer analysis engine
    const analysis = analyzeCommentAntiBuzzer(text, authorName, comments, DEFAULT_BUZZER_CONFIG);

    const newComment: NewsComment = {
      id: `c-${Date.now()}`,
      userName: authorName,
      userAvatar: `https://images.unsplash.com/photo-${1534528741775 + (comments.length % 5)}?auto=format&fit=crop&w=100&q=80`,
      content: text,
      timestamp: 'Baru saja',
      likes: 1,
      isVerified: analysis.riskScore === 0,
      isBuzzerSuspect: analysis.isSuspect,
      buzzerReasons: analysis.reasons,
      isHeldForReview: analysis.isHeld,
      reportsCount: 0
    };

    if (analysis.isHeld) {
      setCommentFeedback({
        type: 'held',
        title: '🛡️ Perisai Anti-Buzzer: Komentar Ditahan untuk Peninjauan',
        message: 'Komentar Anda terdeteksi memiliki kemiripan tinggi dengan pola kampanye buzzer terkoordinasi atau kata terlarang. Redaksi akan meninjau sebelum diterbitkan ke publik.'
      });
    } else if (analysis.isSuspect) {
      setCommentFeedback({
        type: 'suspect',
        title: '⚠️ Komentar Terbit dengan Catatan Pengawasan',
        message: 'Komentar Anda telah terbit namun mendapat perhatian sistem verifikasi karena nada atau susunan kata tertentu.'
      });
    } else {
      setCommentFeedback({
        type: 'clean',
        title: '✅ Komentar Lolos Verifikasi Anti-Buzzer',
        message: 'Terima kasih atas partisipasi opini yang santun, orisinal, dan konstruktif!'
      });
    }

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    setNewCommentText('');

    // Persist comment locally in IndexedDB for offline access & Cloud SQL
    if (article) {
      saveCommentToIndexedDB(article.id, newComment);
      saveAllCommentsToIndexedDB(article.id, updatedComments);
      saveCommentToDB({ ...newComment, articleId: article.id });
    }

    setTimeout(() => {
      setCommentFeedback(null);
    }, 6000);
  };

  const handleOpenReportModal = (comm: NewsComment) => {
    setReportingComment(comm);
    setReportReason('Akun Buzzer Bayaran / Framing Terkoordinasi');
    setReportNote('');
    setReportSuccess(false);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingComment) return;

    setComments((prev) => {
      const updated = prev.map((c) => {
        if (c.id === reportingComment.id) {
          const updatedCount = (c.reportsCount || 0) + 1;
          const reasons = c.reportedReasons || [];
          if (!reasons.includes(reportReason)) {
            reasons.push(reportReason);
          }
          return {
            ...c,
            reportsCount: updatedCount,
            reportedReasons: reasons,
            isBuzzerSuspect: updatedCount >= 2 ? true : c.isBuzzerSuspect,
            isHeldForReview: updatedCount >= 4 ? true : c.isHeldForReview
          };
        }
        return c;
      });
      if (article) {
        saveAllCommentsToIndexedDB(article.id, updated);
      }
      return updated;
    });

    setReportSuccess(true);
    setTimeout(() => {
      setReportingComment(null);
      setReportSuccess(false);
    }, 2000);
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) => {
      const updated = prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
      if (article) {
        saveAllCommentsToIndexedDB(article.id, updated);
      }
      return updated;
    });
  };

  const getArticleShareUrl = () => {
    if (!article) return getPublicPortalOrigin();
    return getPublicArticleShareUrl(article);
  };

  const handleSendToSpecificWa = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!article) return;
    const cleanNum = targetWaNumber.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 8) {
      setWaSendError('Harap masukkan nomor WhatsApp yang valid (contoh: 08123456789 atau 628123456789)');
      return;
    }
    setWaSendError(null);
    let formattedNum = cleanNum;
    if (formattedNum.startsWith('0')) {
      formattedNum = '62' + formattedNum.slice(1);
    } else if (formattedNum.startsWith('8')) {
      formattedNum = '62' + formattedNum;
    }
    handleTrackShare('whatsapp');
    const waUrl = `https://api.whatsapp.com/send?phone=${formattedNum}&text=${encodeURIComponent(`${getArticleShareText()}\n\n${getArticleShareUrl()}`)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const getArticleShareText = () => {
    if (!article) return 'Arun News - Jembatan Informasi Nusantara';
    const excerpt = article.excerpt || (article.paragraphs && article.paragraphs[0]) || '';
    return `📰 *${article.title}*\n\n${excerpt}\n\n👉 *Buka Langsung Warta di Portal Arun News:*\n`;
  };

  const handleTrackShare = (platform: string) => {
    setShareCounts((prev) => ({
      ...prev,
      [platform]: (prev[platform] || 0) + 1,
    }));
    setLastSharedPlatform(platform);
    setTimeout(() => {
      setLastSharedPlatform((curr) => (curr === platform ? null : curr));
    }, 1800);
  };

  const handleCopyLink = () => {
    const shareUrl = getArticleShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setCopiedLink(true);
    handleTrackShare('copy');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const generateApaCitation = () => {
    let authorFormatted = 'Redaksi Arun News';
    if (article?.author?.name) {
      const parts = article.author.name.trim().split(/\s+/);
      if (parts.length > 1) {
        const lastName = parts[parts.length - 1];
        const initials = parts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ');
        authorFormatted = `${lastName}, ${initials}`;
      } else {
        authorFormatted = parts[0];
      }
    }
    const pubYear = article?.publishedAt?.match(/\d{4}/)?.[0] || '2026';
    const shareUrl = typeof window !== 'undefined' ? window.location.href : getArticleShareUrl();
    return `${authorFormatted}. (${pubYear}). ${article?.title}. Arun News. ${shareUrl}`;
  };

  const handleCopyCitation = () => {
    const citation = generateApaCitation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(citation);
    }
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  const handleShareToTikTok = () => {
    if (!article) return;
    const shareUrl = getArticleShareUrl();
    const caption = `📸 [Warta Arun News] "${article.title}"\nKanal: ${article.categoryLabel} • Baca selengkapnya: ${shareUrl}\n#ArunNews #BeritaTerkini #WartaNusantara #TikTokNews #FYPIndonesia #BeritaViral`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(caption);
    }
    window.open('https://www.tiktok.com', '_blank', 'noopener,noreferrer');
    handleTrackShare('tiktok');
  };

  const handleShareToYouTube = () => {
    if (!article) return;
    const shareUrl = getArticleShareUrl();
    const desc = `[Arun News Portal Resmi] ${article.title}\nKategori: ${article.categoryLabel} | Waktu Terbit: ${article.publishedAt}\n\nTautan Berita Lengkap: ${shareUrl}\n\n#ArunNews #JurnalismePresisi #BeritaNasional`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(desc);
    }
    window.open('https://www.youtube.com', '_blank', 'noopener,noreferrer');
    handleTrackShare('youtube');
  };

  const handleNativeShare = async () => {
    if (!article) return;
    const shareUrl = getArticleShareUrl();
    const shareText = article.excerpt || (article.paragraphs && article.paragraphs[0]) || '';
    const shareData = {
      title: article.title,
      text: shareText,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        handleTrackShare('native');
        return;
      } catch (err: any) {
        if (err && err.name === 'AbortError') {
          return;
        }
      }
    }

    // Fallback manual: salin tautan artikel ke clipboard
    handleCopyLink();
  };

  const handleCopyFullDraft = () => {
    const fullDraftText = `=========================================
ARUN NEWS - DRAFT NASKAH REDAKSI
=========================================
JUDUL:
${article.title}

KANAL: ${article.categoryLabel}
PENULIS: ${article.author.name} (${article.author.role})
WAKTU TERBIT: ${article.publishedAt}
ESTIMASI BACA: ${article.readTime}
TAUTAN SUMBER: ${window.location.href}

RINGKASAN (LEAD):
${article.excerpt}

POIN PENTING WARTA:
${article.keyTakeaways.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}

ISI BERITA LENGKAP:
${paragraphs.join('\n\n')}

TOPIK TERKAIT:
${article.tags.map(t => `#${t}`).join(', ')}

=========================================
© 2026 Portal Arun News Indonesia. Hak Cipta Dilindungi.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullDraftText);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!article) return;
    setIsExportingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Header Branding
      doc.setFillColor(12, 74, 110); // sky-950
      doc.rect(0, 0, pageWidth, 20, 'F');

      doc.setTextColor(250, 204, 21); // yellow-400
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('ARUN NEWS', margin, 13);

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Jembatan Informasi Nusantara | Versi Luring', pageWidth - margin, 13, { align: 'right' });

      y = 28;

      // Article Category Badge
      doc.setFillColor(250, 204, 21);
      doc.rect(margin, y - 4, 32, 6, 'F');
      doc.setTextColor(12, 74, 110);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text((article.categoryLabel || article.category).toUpperCase(), margin + 2, y);

      y += 8;

      // Title
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);

      const titleLines = doc.splitTextToSize(article.title, contentWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 6.5 + 2;

      // Metadata
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const metaStr = `Penulis: ${article.author.name} (${article.author.role})  |  Terbit: ${article.publishedAt}  |  Estimasi: ${readingTimeInfo.formatted}`;
      doc.text(metaStr, margin, y);
      y += 5;

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // Lead / Excerpt box
      if (article.excerpt) {
        doc.setFillColor(248, 250, 252);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);

        const excerptLines = doc.splitTextToSize(article.excerpt, contentWidth - 8);
        const boxHeight = excerptLines.length * 4.8 + 6;

        doc.rect(margin, y, contentWidth, boxHeight, 'F');
        doc.text(excerptLines, margin + 4, y + 4.5);
        y += boxHeight + 5;
      }

      // Key Takeaways
      if (article.keyTakeaways && article.keyTakeaways.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(12, 74, 110);
        doc.text('POIN UTAMA WARTA:', margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);

        article.keyTakeaways.forEach((kt) => {
          const ktLines = doc.splitTextToSize(`• ${kt}`, contentWidth - 4);
          if (y + ktLines.length * 4.5 > pageHeight - margin - 15) {
            doc.addPage();
            y = margin + 5;
          }
          doc.text(ktLines, margin + 2, y);
          y += ktLines.length * 4.5 + 1;
        });

        y += 4;
      }

      // Paragraphs
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);

      paragraphs.forEach((para) => {
        const cleanPara = para
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/#{1,6}\s+/g, '')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1');

        const lines = doc.splitTextToSize(cleanPara, contentWidth);
        const paraHeight = lines.length * 4.8;

        if (y + paraHeight > pageHeight - margin - 15) {
          doc.addPage();
          y = margin + 5;
        }

        doc.text(lines, margin, y);
        y += paraHeight + 4;
      });

      // Tags
      if (article.tags && article.tags.length > 0) {
        if (y + 10 > pageHeight - margin - 15) {
          doc.addPage();
          y = margin + 5;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`TAGAR: ${article.tags.map(t => `#${t}`).join('  ')}`, margin, y);
        y += 6;
      }

      // Page numbers footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('© 2026 Arun News — Terdaftar Dewan Pers RI No. 892/DP/K/VIII/2026', margin, pageHeight - 6);
        doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
      }

      const safeFilename = (article.slug || article.title || 'warta-arun-news')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      doc.save(`${safeFilename}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const getFontSizeClass = () => {
    switch (localFontSize) {
      case 'small': return 'text-sm sm:text-base md:text-[16px]';
      case 'large': return 'text-lg sm:text-xl md:text-2xl';
      default: return 'text-base sm:text-lg md:text-[18.5px]'; // medium
    }
  };

  const getTitleFontSizeClass = () => {
    switch (localFontSize) {
      case 'small': return 'text-lg sm:text-xl md:text-2xl lg:text-3xl';
      case 'large': return 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl';
      default: return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl'; // medium
    }
  };

  const getExcerptFontSizeClass = () => {
    switch (localFontSize) {
      case 'small': return 'text-xs sm:text-sm md:text-base';
      case 'large': return 'text-base sm:text-lg md:text-xl';
      default: return 'text-sm sm:text-base md:text-lg lg:text-xl'; // medium
    }
  };

  const getSubFontSizeClass = () => {
    switch (localFontSize) {
      case 'small': return 'text-[11px] sm:text-xs';
      case 'large': return 'text-sm sm:text-base';
      default: return 'text-xs sm:text-sm'; // medium
    }
  };

  const getLineSpacingClass = () => {
    switch (lineSpacing) {
      case 'normal': return 'leading-normal';
      case 'loose': return 'leading-loose';
      default: return 'leading-relaxed';
    }
  };

  const totalWords = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;

  // Helper to render formatted paragraph with neat pull-quotes, subheads, and Microsoft Word paragraph settings
  const renderFormattedParagraph = (para: string, index: number) => {
    return renderRichParagraph(para, index, {
      fontSizeClass: isFocusMode
        ? localFontSize === 'small'
          ? 'text-base sm:text-lg'
          : localFontSize === 'large'
          ? 'text-xl sm:text-2xl'
          : 'text-lg sm:text-xl'
        : getFontSizeClass(),
      lineSpacingClass: isFocusMode ? 'leading-[2.0] sm:leading-[2.2]' : getLineSpacingClass(),
      fontFamily: fontFamily,
      isFirstParagraph: index === 0,
      isNightMode: isNightMode,
      isWarmMode: isWarmMode,
    });
  };

  if (!article) return null;

  return (
    <>
      <div
        id="article-reader-modal"
        className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-3 md:p-6 overflow-y-auto scroll-smooth"
        onClick={handleAttemptClose}
      >
      <div
        className={`rounded-none sm:rounded-2xl max-w-full sm:max-w-4xl md:max-w-5xl xl:max-w-6xl w-full h-full sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto relative transition-colors duration-300 ${
          isNightMode 
            ? 'bg-slate-950 text-slate-100 border-0 sm:border-2 border-yellow-500/80 shadow-slate-950/80' 
            : isWarmMode
            ? 'bg-[#fbf4e6] text-[#382b1d] border-0 sm:border-2 border-amber-400 shadow-amber-950/20'
            : 'bg-white text-slate-900 border-0 sm:border-2 border-yellow-400'
        }`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Modal Header: Distraction-Free Focus Mode or Full Standard Reader */}
        {isFocusMode ? (
          /* MINIMAL DISTRACTION-FREE FOCUS MODE HEADER */
          <div className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b z-20 flex-shrink-0 transition-colors ${
            isNightMode 
              ? 'bg-slate-900 text-slate-100 border-slate-800' 
              : isWarmMode
              ? 'bg-[#f4ebd6] text-[#3e2e1c] border-[#dfcfad]'
              : 'bg-slate-50 text-slate-900 border-slate-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs font-mono shadow-xs border border-yellow-500">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Mode Fokus</span>
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden md:inline truncate max-w-sm">
                Bebas Distraksi • {article.categoryLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Serif / Sans Font Switcher */}
              <div className={`flex items-center p-0.5 rounded-xl border text-xs ${
                isNightMode ? 'bg-slate-800 border-slate-700' : isWarmMode ? 'bg-[#f8f1e2] border-[#dfcfad]' : 'bg-white border-slate-300'
              }`}>
                <button
                  type="button"
                  onClick={() => setFontFamily('serif')}
                  className={`px-2.5 py-1 rounded-lg font-serif text-xs font-bold transition-all cursor-pointer ${
                    fontFamily === 'serif'
                      ? 'bg-yellow-400 text-slate-950 shadow-2xs font-black'
                      : isNightMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Huruf Serif (Gaya Buku)"
                >
                  Serif
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily('sans')}
                  className={`px-2.5 py-1 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer ${
                    fontFamily === 'sans'
                      ? 'bg-yellow-400 text-slate-950 shadow-2xs font-black'
                      : isNightMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Huruf Sans Modern"
                >
                  Sans
                </button>
              </div>

              {/* Exit Focus Mode Button */}
              <button
                id="exit-focus-mode-btn"
                type="button"
                onClick={() => setIsFocusMode(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border border-yellow-500 shadow-xs cursor-pointer transition-all active:scale-95"
                title="Keluar dari Mode Fokus (Kembalikan navigasi, komentar, dan alat lainnya)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Keluar Mode Fokus</span>
              </button>

              {/* Close Modal Button */}
              <button
                type="button"
                onClick={handleAttemptClose}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isNightMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Tutup Berita"
                aria-label="Tutup Berita"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Sticky Modal Header Bar */}
            <div className={`flex items-center justify-between px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 border-b z-20 flex-shrink-0 transition-colors ${
              isNightMode 
                ? 'bg-slate-900 text-slate-100 border-slate-800' 
                : isWarmMode
                ? 'bg-[#43311f] text-[#fbf4e6] border-[#5a422a]'
                : 'bg-sky-950 text-white border-sky-800'
            }`}>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="bg-yellow-400 text-sky-950 font-black text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-yellow-500 font-mono">
                  {article.categoryLabel}
                </span>
                <div 
                  className="flex items-center gap-1 bg-amber-400 text-sky-950 border border-yellow-500 text-[10px] sm:text-xs font-mono font-black px-2 sm:px-2.5 py-0.5 rounded-md shadow-2xs"
                  title={`Estimasi waktu membaca berdasarkan ${readingTimeInfo.wordCount} kata`}
                >
                  <Clock className="w-3 h-3 text-sky-950 flex-shrink-0" />
                  <span>{readingTimeInfo.formatted}</span>
                </div>
                <span className="text-xs font-mono hidden md:inline text-sky-200">
                  {article.publishedAt}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                {/* Quick Header Focus Mode Toggle Button (Tablet & Web) */}
                <button
                  id="toggle-focus-mode-header-btn"
                  type="button"
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer shadow-2xs bg-sky-900 hover:bg-sky-800 text-yellow-300 hover:text-yellow-200 border-sky-700"
                  title={isFocusMode ? 'Matikan Mode Fokus' : 'Aktifkan Mode Fokus (Sembunyikan Komentar, Share, & Rekomendasi)'}
                  aria-label="Mode Fokus"
                >
                  {isFocusMode ? <EyeOff className="w-3.5 h-3.5 text-slate-950" /> : <Eye className="w-3.5 h-3.5 text-yellow-400" />}
                  <span className="hidden lg:inline">{isFocusMode ? 'Fokus ON' : 'Mode Fokus'}</span>
                </button>

                {/* View Mode Toggle: Portal vs Draft Naskah (Tablet & Web) */}
                <div className="hidden md:flex items-center p-0.5 rounded-xl border bg-sky-900 border-sky-800">
                  <button
                    onClick={() => setViewMode('portal')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                      viewMode === 'portal'
                        ? 'bg-yellow-400 text-sky-950 font-black'
                        : 'text-sky-200 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Portal View</span>
                  </button>
                  <button
                    onClick={() => setViewMode('draft')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                      viewMode === 'draft'
                        ? 'bg-yellow-400 text-sky-950 font-black'
                        : 'text-sky-200 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Draft Rapi</span>
                  </button>
                </div>

                {/* Listen to Article (Web Speech API Audio Button) */}
                <div className="flex items-center gap-1">
                  <button
                    id="listen-to-article-btn"
                    onClick={handleToggleTTS}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs active:scale-95 cursor-pointer ${
                      isPlayingAudio && !isPausedAudio
                        ? 'bg-amber-400 text-sky-950 border-amber-500 shadow-amber-400/20'
                        : isPlayingAudio && isPausedAudio
                        ? 'bg-amber-200 text-sky-950 border-amber-400'
                        : 'bg-yellow-400 text-sky-950 border-yellow-500 hover:bg-yellow-300'
                    }`}
                    title={
                      isPlayingAudio
                        ? isPausedAudio
                          ? 'Lanjutkan Mendengarkan Artikel'
                          : 'Jeda Suara Pembaca (Pause)'
                        : 'Dengarkan Artikel (Text-to-Speech)'
                    }
                    aria-label="Dengarkan Artikel"
                  >
                    {isPlayingAudio && !isPausedAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-sky-950 text-sky-950" />
                        <span className="hidden sm:inline">Jeda</span>
                      </>
                    ) : isPlayingAudio && isPausedAudio ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-sky-950 text-sky-950" />
                        <span className="hidden sm:inline">Lanjutkan</span>
                      </>
                    ) : (
                      <>
                        <Headphones className="w-3.5 h-3.5 text-sky-950" />
                        <span className="hidden sm:inline">Dengarkan</span>
                      </>
                    )}
                  </button>

                  {isPlayingAudio && (
                    <button
                      id="stop-tts-btn"
                      onClick={handleStopTTS}
                      className="p-1.5 rounded-xl bg-sky-900 hover:bg-rose-900 text-rose-300 hover:text-white border border-sky-700 hover:border-rose-700 transition-colors cursor-pointer"
                      title="Hentikan Suara (Stop)"
                      aria-label="Hentikan Suara"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Social Media Sharing Buttons (Tablet & Desktop: Twitter/X, Facebook, Copy) */}
                <div className="hidden lg:flex items-center gap-1.5 border-l border-sky-800 pl-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getArticleShareText())}&url=${encodeURIComponent(getArticleShareUrl())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95 border border-slate-700"
                    title="Bagikan artikel ini ke Twitter / X"
                    aria-label="Bagikan ke Twitter / X"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>X</span>
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getArticleShareUrl())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                    title="Bagikan artikel ini ke Facebook"
                    aria-label="Bagikan ke Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>FB</span>
                  </a>

                  {/* Salin Link Button in Header */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`relative flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95 border ${
                      copiedLink
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-yellow-400 hover:bg-yellow-300 text-sky-950 border-yellow-500'
                    }`}
                    title={copiedLink ? 'Tautan Berhasil Disalin!' : 'Salin Tautan Artikel'}
                    aria-label="Salin Tautan"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-sky-950" />}
                    <span className="hidden xl:inline">{copiedLink ? 'Tersalin' : 'Salin'}</span>
                    {copiedLink && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-sky-950 text-yellow-300 text-[10px] font-black whitespace-nowrap shadow-lg border border-yellow-400/40 pointer-events-none z-30 animate-in fade-in duration-150">
                        Tersalin!
                      </span>
                    )}
                  </button>
                </div>

                {/* Share Button (Web Share API with custom WhatsApp share URL fallback) */}
                <button
                  id="share-article-header-btn"
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition-all border bg-yellow-400 text-sky-950 border-yellow-500 hover:bg-yellow-300 cursor-pointer shadow-xs active:scale-95"
                  title="Share warta ini via Web Share API atau WhatsApp"
                  aria-label="Share"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-950" />
                  <span className="font-bold">Share</span>
                </button>

                {/* Bookmark / Simpan Button */}
                <button
                  id="article-modal-save-btn"
                  type="button"
                  onClick={(e) => onToggleSave(article, e)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer active:scale-95 flex-shrink-0 ${
                    isSaved
                      ? 'bg-yellow-400 text-sky-950 border-yellow-500 font-black shadow-yellow-500/20'
                      : 'bg-sky-900 text-white border-sky-700 hover:bg-sky-800'
                  }`}
                  title={isSaved ? 'Hapus warta dari daftar simpanan' : 'Simpan warta untuk dibaca nanti'}
                  aria-label={isSaved ? 'Warta Tersimpan' : 'Simpan Warta'}
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-sky-950 flex-shrink-0" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  )}
                  <span className="hidden sm:inline text-[11px] sm:text-xs font-bold whitespace-nowrap">
                    {isSaved ? 'Tersimpan' : 'Simpan'}
                  </span>
                </button>

                {/* Close Button */}
                <button
                  id="close-article-modal-btn"
                  onClick={handleAttemptClose}
                  className="p-1 sm:p-1.5 rounded-xl text-sky-300 hover:text-white hover:bg-sky-800 transition-colors cursor-pointer min-w-[34px] min-h-[34px] sm:min-w-[38px] sm:min-h-[38px] flex items-center justify-center"
                  aria-label="Tutup Berita"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Clean Editorial Toolset Controls Bar: Touch & Scroll friendly across Mobile, Tablet, Web */}
            <div className={`px-3 sm:px-6 py-2 border-b flex items-center justify-between gap-2.5 sm:gap-4 text-xs flex-shrink-0 transition-colors overflow-x-auto scrollbar-none flex-nowrap sm:flex-wrap ${
              isNightMode 
                ? 'bg-slate-900/90 text-slate-200 border-slate-800' 
                : 'bg-sky-50 text-slate-800 border-sky-100'
            }`}>
              
              {/* Left: Mobile View Switcher, Reading Theme, Font Family */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`flex sm:hidden items-center p-0.5 rounded-lg border flex-shrink-0 ${
                  isNightMode ? 'bg-slate-800 border-slate-700' : 'bg-sky-200/70 border-sky-300'
                }`}>
                  <button
                    onClick={() => setViewMode('portal')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      viewMode === 'portal' ? 'bg-sky-950 text-yellow-300 font-black' : 'text-sky-900'
                    }`}
                  >
                    Portal
                  </button>
                  <button
                    onClick={() => setViewMode('draft')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      viewMode === 'draft' ? 'bg-sky-950 text-yellow-300 font-black' : 'text-sky-900'
                    }`}
                  >
                    Draft Rapi
                  </button>
                </div>



            <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors ${
              isNightMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-sky-200 text-sky-900'
            }`}>
              <span className="text-[11px] font-bold px-1 font-mono">Font:</span>
              <button
                type="button"
                onClick={() => setFontFamily('sans')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontFamily === 'sans' ? 'bg-yellow-400 text-sky-950 shadow-2xs font-bold' : 'text-slate-500 hover:text-sky-950'
                }`}
              >
                Sans
              </button>
              <button
                type="button"
                onClick={() => setFontFamily('serif')}
                className={`px-2 py-0.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                  fontFamily === 'serif' ? 'bg-yellow-400 text-sky-950 shadow-2xs font-bold' : 'text-slate-500 hover:text-sky-950'
                }`}
              >
                Serif
              </button>
            </div>

            {/* Font Size Toggle (small, medium, large) */}
            <div 
              id="font-size-toggle"
              className={`flex items-center gap-1 p-1 rounded-xl border transition-colors ${
                isNightMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-sky-200 text-sky-900'
              }`}
              role="group"
              aria-label="Font Size Toggle"
            >
              <span className="text-[11px] font-bold px-1 font-mono">Ukuran:</span>
              <button
                type="button"
                onClick={() => setLocalFontSize('small')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  localFontSize === 'small' ? 'bg-yellow-400 text-sky-950 font-black shadow-2xs' : 'text-slate-600 hover:text-sky-900'
                }`}
                title="Ukuran Font Kecil (Small)"
                aria-label="Font size small"
              >
                Small
              </button>
              <button
                type="button"
                onClick={() => setLocalFontSize('medium')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  localFontSize === 'medium' ? 'bg-yellow-400 text-sky-950 font-black shadow-2xs' : 'text-slate-600 hover:text-sky-900'
                }`}
                title="Ukuran Font Sedang (Medium)"
                aria-label="Font size medium"
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setLocalFontSize('large')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  localFontSize === 'large' ? 'bg-yellow-400 text-sky-950 font-black shadow-2xs' : 'text-slate-600 hover:text-sky-900'
                }`}
                title="Ukuran Font Besar (Large)"
                aria-label="Font size large"
              >
                Large
              </button>
            </div>
          </div>

          {/* Right: Auto-Scroll, Glossary, Download PDF, Copy Draft & Print Button */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Auto-Scroll Control */}
            <div className={`flex items-center p-1 rounded-xl border shadow-2xs transition-colors ${
              isNightMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-sky-200'
            }`}>
              <button
                type="button"
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isAutoScrolling
                    ? 'bg-amber-500 text-sky-950 shadow-xs animate-pulse font-black'
                    : isNightMode ? 'text-slate-200 hover:bg-slate-700' : 'text-sky-900 hover:bg-sky-100'
                }`}
                title={isAutoScrolling ? 'Hentikan Gulir Otomatis (Auto-Scroll)' : 'Mulai Gulir Otomatis (Auto-Scroll)'}
              >
                {isAutoScrolling ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Auto-Scroll</span>
              </button>

              {/* Speed Buttons */}
              <div className={`flex items-center ml-1 pl-1 border-l gap-0.5 ${
                isNightMode ? 'border-slate-700' : 'border-sky-200'
              }`}>
                {[1, 2, 3].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => {
                      setAutoScrollSpeed(speed as 1 | 2 | 3);
                      if (!isAutoScrolling) setIsAutoScrolling(true);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      autoScrollSpeed === speed
                        ? 'bg-yellow-400 text-slate-950 font-black'
                        : isNightMode ? 'text-slate-400 hover:text-slate-100' : 'text-slate-500 hover:text-sky-900'
                    }`}
                    title={`Kecepatan Gulir: ${speed === 1 ? 'Lambat (1x)' : speed === 2 ? 'Sedang (2x)' : 'Cepat (3x)'}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Glossary Lookup Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedGlossaryTerm(null);
                setIsGlossaryModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs border shadow-2xs transition-colors cursor-pointer ${
                isNightMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-sky-100 text-sky-900 border-sky-200'
              }`}
              title="Buka Glosarium Istilah Teknis & Jurnalistik"
            >
              <BookOpen className="w-3.5 h-3.5 text-yellow-500" />
              <span className="hidden sm:inline">Glosarium</span>
            </button>

            {/* Unduh sebagai PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border shadow-2xs cursor-pointer ${
                isExportingPdf
                  ? 'bg-sky-100 text-sky-700 border-sky-300 opacity-80 cursor-wait'
                  : isNightMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-yellow-50 text-sky-950 border-sky-300 hover:border-yellow-400'
              }`}
              title="Unduh artikel ini dalam format PDF resmi untuk dibaca offline"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-500" />
              ) : (
                <Download className="w-3.5 h-3.5 text-yellow-500" />
              )}
              <span>{isExportingPdf ? 'Mengekspor...' : 'Unduh PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyFullDraft}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all border shadow-2xs ${
                copiedDraft
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : isNightMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-yellow-50 text-sky-950 border-sky-300 hover:border-yellow-400'
              }`}
              title="Salin isi artikel lengkap dengan format rapi"
            >
              {copiedDraft ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-yellow-500" />}
              <span className="hidden lg:inline">{copiedDraft ? 'Naskah Tersalin!' : 'Salin Naskah'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className={`p-1.5 rounded-xl border transition-colors shadow-2xs ${
                isNightMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-sky-100 text-sky-900 border-sky-200'
              }`}
              title="Cetak Naskah Berita"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Font Scaling & Theme Banner */}
        <div id="live-font-scaling-preview" className={`border-b px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-medium relative z-20 transition-colors ${
          isNightMode 
            ? 'bg-slate-900/95 border-slate-800 text-slate-300' 
            : isWarmMode
            ? 'bg-[#f5ecda] border-[#dfcfad] text-[#4a3a27]'
            : 'bg-sky-100/60 border-sky-200/50 text-sky-800'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
              isNightMode ? 'bg-yellow-400 animate-pulse' : isWarmMode ? 'bg-amber-600 animate-pulse' : 'bg-emerald-500 animate-pulse'
            }`} />
            <span className={`font-bold font-mono tracking-tight uppercase text-[10px] ${
              isNightMode ? 'text-slate-300' : isWarmMode ? 'text-amber-950' : 'text-sky-900'
            }`}>
              Pratinjau Pembaca:
            </span>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-[150px] justify-center">
            <span className={`truncate text-center transition-all duration-200 font-semibold ${
              isNightMode ? 'text-yellow-300' : isWarmMode ? 'text-amber-950 font-bold' : 'text-sky-950'
            } ${getFontSizeClass()} ${fontFamily === 'serif' ? 'font-serif italic' : 'font-sans'}`}>
              "Arun News - Portal Berita Berintegritas"
            </span>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </div>
      </>
    )}

        {/* Scrollable Article Content */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll} 
          className={`overflow-y-auto ${
            isFocusMode ? 'p-6 sm:p-10 md:p-14' : 'p-4 sm:p-7 md:p-8'
          } flex-1 scroll-smooth transition-colors duration-300 ${
            isNightMode 
              ? 'bg-slate-950 text-slate-100' 
              : isWarmMode
              ? 'bg-[#fbf4e6] text-[#382b1d]'
              : isFocusMode 
              ? 'bg-[#fcfbf9] text-slate-900' 
              : 'bg-white text-slate-900'
          }`}
        >
          {/* Mode Fokus Active Sticky Notice Banner */}
          {isFocusMode && (
            <div className="max-w-2xl sm:max-w-3xl mx-auto mb-8 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Mode Fokus Aktif</span>
                <span className="opacity-90 hidden sm:inline">— Menampilkan teks berita murni dengan kenyamanan membaca optimal.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFocusMode(false)}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all cursor-pointer flex-shrink-0"
              >
                Keluar Fokus
              </button>
            </div>
          )}
          
          {/* DRAFT VIEW MODE: Clean Structured Document Layout */}
          {viewMode === 'draft' && !isFocusMode ? (
            <div className={`rounded-2xl p-4 sm:p-7 border-2 font-mono text-xs space-y-6 transition-colors ${
              isNightMode
                ? 'bg-slate-900 border-slate-800 text-slate-200'
                : isWarmMode
                ? 'bg-[#fbf4e6] border-[#dfcfad] text-[#382b1d]'
                : 'bg-slate-50 border-sky-200 text-slate-800'
            }`}>
              
              {/* Draft Header Badge */}
              <div className={`flex items-center justify-between pb-4 border-b ${
                isNightMode ? 'border-slate-800' : isWarmMode ? 'border-[#dfcfad]' : 'border-slate-300'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-black text-[11px] uppercase ${
                    isNightMode ? 'bg-amber-400 text-slate-950' : 'bg-sky-950 text-yellow-400'
                  }`}>
                    DRAFT NASKAH BERITA RESMI
                  </span>
                  <span className={isNightMode ? 'text-slate-400 font-semibold' : 'text-slate-500 font-semibold'}>• ID: {article.id}</span>
                </div>
                <div className={`font-mono font-bold text-[11px] flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                  isNightMode ? 'bg-slate-800 text-slate-300 border-slate-700' : isWarmMode ? 'bg-[#f4ebd6] text-[#4a3a27] border-[#dfcfad]' : 'bg-white text-slate-600 border-slate-300'
                }`}>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{readingTimeInfo.wordCount.toLocaleString('id-ID')} Kata • {readingTimeInfo.formatted}</span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className={`font-bold uppercase text-[11px] ${isNightMode ? 'text-yellow-400' : isWarmMode ? 'text-amber-900' : 'text-slate-500'}`}>JUDUL BERITA:</div>
                <h1 className={`text-xl sm:text-2xl font-black font-sans leading-snug ${isNightMode ? 'text-white' : isWarmMode ? 'text-[#302111]' : 'text-slate-950'}`}>
                  {article.title}
                </h1>
                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] p-3 rounded-xl border ${
                  isNightMode ? 'bg-slate-800 text-slate-300 border-slate-700' : isWarmMode ? 'bg-[#f4ebd6] text-[#4a3a27] border-[#dfcfad]' : 'bg-white text-slate-600 border-slate-200'
                }`}>
                  <div><strong>Kanal:</strong> {article.categoryLabel}</div>
                  <div><strong>Penulis:</strong> {article.author.name}</div>
                  <div><strong>Waktu Rilis:</strong> {article.publishedAt}</div>
                </div>
              </div>

              {/* Lead Paragraph */}
              <div className="space-y-1.5">
                <div className={`font-bold uppercase text-[11px] ${isNightMode ? 'text-yellow-400' : isWarmMode ? 'text-amber-900' : 'text-slate-500'}`}>LEAD (TERAS BERITA):</div>
                <div className={`p-3 rounded-xl border font-sans font-medium text-sm leading-relaxed ${
                  isNightMode ? 'bg-amber-950/40 border-amber-600/60 text-amber-100' : isWarmMode ? 'bg-[#f4ebd6] border-[#dfcfad] text-[#382b1d]' : 'bg-yellow-50 border-yellow-300 text-slate-900'
                }`}>
                  {article.excerpt}
                </div>
              </div>

              {/* Key Takeaways */}
              {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                <div className="space-y-1.5">
                  <div className={`font-bold uppercase text-[11px] ${isNightMode ? 'text-yellow-400' : 'text-slate-500'}`}>POIN KUNCI / FAKTA POKOK:</div>
                  <ul className={`list-disc list-inside space-y-1 p-3.5 rounded-xl border font-sans text-xs ${
                    isNightMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {article.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Body Paragraphs */}
              <div className="space-y-3">
                <div className={`font-bold uppercase text-[11px] ${isNightMode ? 'text-yellow-400' : 'text-slate-500'}`}>BATANG TUBUH (BODY TEXT):</div>
                <div className={`p-4 sm:p-5 rounded-xl border font-sans text-sm sm:text-base space-y-4 leading-relaxed ${
                  isNightMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  {paragraphs.map((p, idx) => (
                    <p key={idx} className="text-justify">
                      <span className={`font-mono text-xs font-bold mr-2 ${isNightMode ? 'text-amber-400' : 'text-slate-400'}`}>[{idx + 1}]</span>
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              {/* Tags & Metadata */}
              <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-[11px] ${
                isNightMode ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-500'
              }`}>
                <div>
                  <strong>Tag Topik:</strong> {article.tags.map(t => `#${t}`).join(', ')}
                </div>
                <div>
                  © Portal Arun News Editorial System
                </div>
              </div>
            </div>
          ) : (
            /* PORTAL VIEW MODE: Refined High-End Typography Layout */
            <article className={`max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto ${fontFamily === 'serif' ? 'font-editorial font-serif' : 'font-sans'} ${isFocusMode ? 'py-2 sm:py-4 md:py-6' : ''}`}>
              
              {/* Article Title */}
              <h1 className={`${
                isFocusMode
                  ? localFontSize === 'normal'
                    ? 'text-2xl sm:text-3xl md:text-4xl'
                    : localFontSize === 'large'
                    ? 'text-3xl sm:text-4xl md:text-5xl'
                    : 'text-4xl sm:text-5xl md:text-6xl'
                  : getTitleFontSizeClass()
              } font-black leading-tight mb-4 tracking-tight ${
                isNightMode ? 'text-yellow-300' : isWarmMode ? 'text-[#302111]' : 'text-sky-950'
              }`}>
                {article.title}
              </h1>

              {/* Subtitle / Excerpt Lead */}
              <div className={`${
                isFocusMode
                  ? localFontSize === 'normal'
                    ? 'text-base sm:text-lg md:text-xl font-serif'
                    : 'text-lg sm:text-xl md:text-2xl font-serif'
                  : getExcerptFontSizeClass()
              } font-medium leading-relaxed mb-6 italic ${
                isFocusMode 
                  ? 'border-l-4 border-amber-400 pl-4 py-2 opacity-95 text-slate-700 dark:text-slate-300' 
                  : 'border-l-4 border-yellow-400 pl-4 py-3 rounded-r-xl border-y border-r'
              } transition-colors ${
                isNightMode
                  ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                  : isWarmMode
                  ? 'bg-[#f4ebd6] border-[#dfcfad] text-[#3e2e1c]'
                  : isFocusMode
                  ? 'bg-amber-50/40 border-amber-200 text-slate-700'
                  : 'bg-yellow-50/50 border-yellow-200 text-slate-700'
              }`}>
                {article.excerpt}
              </div>

              {/* Author & Metas Row */}
              {isFocusMode ? (
                <div className={`flex flex-wrap items-center justify-between gap-3 py-3 border-y mb-8 text-xs transition-colors ${
                  isNightMode ? 'border-slate-800 text-slate-400' : isWarmMode ? 'border-[#dfcfad] text-[#55432f]' : 'border-slate-200 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-200">{article.author.name}</span>
                    <span>•</span>
                    <span>{article.author.role}</span>
                    <span>•</span>
                    <span>{article.publishedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{readingTimeInfo.formatted} ({readingTimeInfo.wordCount} kata)</span>
                  </div>
                </div>
              ) : (
                <div className={`flex flex-wrap items-center justify-between gap-3 py-3 border-y mb-6 text-xs px-3.5 rounded-xl transition-colors ${
                  isNightMode 
                    ? 'bg-slate-900 border-slate-800 text-slate-300' 
                    : isWarmMode
                    ? 'bg-[#f4ebd6] border-[#dfcfad] text-[#4a3a27]'
                    : 'bg-sky-50 border-sky-100 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-yellow-400 shadow-2xs"
                    />
                    <div>
                      <div className={`font-bold text-xs sm:text-sm flex items-center gap-1 ${
                        isNightMode ? 'text-yellow-300' : isWarmMode ? 'text-[#302111]' : 'text-sky-950'
                      }`}>
                        {article.author.name}
                        <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500" />
                      </div>
                      <div className={`text-[11px] sm:text-xs font-medium ${
                        isNightMode ? 'text-sky-300' : isWarmMode ? 'text-[#6a563f]' : 'text-sky-700'
                      }`}>{article.author.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Anti Buzzer Protection Badge */}
                    <button
                      onClick={() => setIsAntiBuzzerModalOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors text-[11px] font-bold"
                      title="Klik untuk melihat manifesto integritas jurnalistik Arun News"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="hidden sm:inline">Perisai Anti-Buzzer Aktif</span>
                      <span className="sm:hidden">Anti-Buzzer</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span 
                        className={`flex items-center gap-1.5 font-black text-xs px-2.5 py-1 rounded-lg border shadow-2xs ${
                          isNightMode
                            ? 'bg-amber-950/80 text-amber-200 border-amber-700'
                            : 'bg-amber-100 text-amber-950 border-amber-300'
                        }`}
                        title={`Estimasi baca berdasarkan ${readingTimeInfo.wordCount} kata`}
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>{readingTimeInfo.formatted} ({readingTimeInfo.wordCount} kata)</span>
                      </span>
                      <span className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg border ${
                        isNightMode
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-sky-100 text-sky-800 border-sky-200'
                      }`}>
                        <Eye className="w-3.5 h-3.5 text-sky-500" />
                        {article.views.toLocaleString('id-ID')}
                      </span>
                      {isSaved && (
                        <span
                          className="flex items-center gap-1.5 text-emerald-950 bg-emerald-100 font-black text-xs px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs"
                          title="Tersimpan di IndexedDB browser untuk dibaca tanpa koneksi internet (offline mode)"
                        >
                          <Database className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>IndexedDB Offline</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isFocusMode && (
                <>
                  {/* Read Aloud Web Speech API Audio Player Bar */}
              <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-xl border border-sky-800 flex flex-col gap-4 animate-in fade-in duration-200 relative overflow-hidden">
                {/* Background glow accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Action Controls & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Previous Paragraph Button */}
                    <button
                      onClick={handlePrevChunk}
                      disabled={!isPlayingAudio || currentChunkIndex <= 0}
                      className="w-9 h-9 rounded-xl bg-sky-900/80 hover:bg-sky-800 text-sky-200 hover:text-white flex items-center justify-center font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-sky-700/60"
                      title="Paragraf Sebelumnya"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    {/* Main Play/Pause Button */}
                    <button
                      id="tts-audio-btn"
                      onClick={handleToggleTTS}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg transition-all active:scale-95 border cursor-pointer ${
                        isPlayingAudio && !isPausedAudio
                          ? 'bg-amber-400 hover:bg-amber-300 text-sky-950 border-amber-500 ring-2 ring-amber-400/40'
                          : 'bg-yellow-400 hover:bg-yellow-300 text-sky-950 border-yellow-500'
                      }`}
                      title={isPlayingAudio && !isPausedAudio ? 'Jeda Suara (Pause)' : 'Putar / Lanjutkan Suara Pembaca'}
                    >
                      {isPlayingAudio && !isPausedAudio ? (
                        <Pause className="w-5.5 h-5.5 fill-sky-950 text-sky-950" />
                      ) : (
                        <Play className="w-5.5 h-5.5 fill-sky-950 text-sky-950 ml-0.5" />
                      )}
                    </button>

                    {/* Next Paragraph Button */}
                    <button
                      onClick={handleNextChunk}
                      disabled={!isPlayingAudio || currentChunkIndex >= getArticleChunks().length - 1}
                      className="w-9 h-9 rounded-xl bg-sky-900/80 hover:bg-sky-800 text-sky-200 hover:text-white flex items-center justify-center font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-sky-700/60"
                      title="Paragraf Selanjutnya"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    {/* Stop Button */}
                    {isPlayingAudio && (
                      <button
                        onClick={handleStopTTS}
                        className="w-9 h-9 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white flex items-center justify-center font-bold transition-all border border-rose-800/80"
                        title="Hentikan Pembacaan (Stop)"
                      >
                        <VolumeX className="w-4 h-4" />
                      </button>
                    )}

                    {/* Status Info */}
                    <div className="min-w-0 flex-1 ml-1">
                      <div className="text-xs sm:text-sm font-black flex items-center gap-2 uppercase tracking-wider text-yellow-400 font-mono">
                        <Volume2 className="w-4 h-4 text-yellow-400" />
                        <span>Dengarkan Berita (Text-to-Speech Web Speech API)</span>

                        {isPlayingAudio && !isPausedAudio && (
                          <div className="flex items-center gap-0.5 h-3 px-1" title="Suara sedang aktif">
                            <span className="w-0.75 bg-amber-400 animate-pulse h-full rounded-xs block" style={{ animationDelay: '0ms', animationDuration: '0.6s' }}></span>
                            <span className="w-0.75 bg-amber-400 animate-pulse h-2/3 rounded-xs block" style={{ animationDelay: '150ms', animationDuration: '0.5s' }}></span>
                            <span className="w-0.75 bg-amber-400 animate-pulse h-4/5 rounded-xs block" style={{ animationDelay: '300ms', animationDuration: '0.7s' }}></span>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-sky-100 font-medium mt-0.5 leading-snug">
                        {isPlayingAudio
                          ? isPausedAudio
                            ? 'Suara pembaca dijeda. Klik Putar untuk melanjutkan.'
                            : currentChunkIndex === 0
                            ? `Membacakan Judul & Ringkasan (${speechRate}x)...`
                            : `Membacakan Paragraf ${currentChunkIndex} dari ${paragraphs.length} (${Math.round((currentChunkIndex / paragraphs.length) * 100)}%)...`
                          : 'Klik tombol putar untuk mendengarkan seluruh warta dibacakan dengan suara alami.'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Settings: Voice Selection & Speech Speed */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-sky-800/80">
                    {/* Voice Selection Dropdown */}
                    {availableVoices.length > 0 && (
                      <div className="flex flex-col gap-1 min-w-[140px] max-w-[200px]">
                        <span className="text-[10px] text-sky-300 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                          <Mic className="w-3 h-3 text-yellow-400" /> Suara / Pengisi:
                        </span>
                        <select
                          value={selectedVoiceURI}
                          onChange={(e) => handleVoiceChange(e.target.value)}
                          className="bg-sky-950 text-white text-[11px] font-medium font-sans px-2.5 py-1 rounded-xl border border-sky-700 focus:outline-none focus:border-yellow-400 truncate"
                        >
                          {availableVoices.map((v) => (
                            <option key={v.voiceURI} value={v.voiceURI}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Speech Speed Buttons */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-sky-300 font-mono font-bold uppercase tracking-wider">
                        Kecepatan Baca:
                      </span>
                      <div className="flex items-center gap-1 bg-sky-950 p-1 rounded-xl border border-sky-800">
                        {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handleSpeechRateChange(rate)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-black tracking-tighter transition-all ${
                              speechRate === rate
                                ? 'bg-yellow-400 text-sky-950 font-black shadow-xs'
                                : 'text-sky-200 hover:text-white hover:bg-sky-900/50'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Music / Ambient Sound Player Bar (Ideal for Long-form Editorial) */}
              <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-xl border border-purple-800/60 flex flex-col gap-4 animate-in fade-in duration-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Title & Toggle Button */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={handleToggleAmbient}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg transition-all active:scale-95 border cursor-pointer ${
                        isAmbientPlaying
                          ? 'bg-purple-500 hover:bg-purple-400 text-white border-purple-400 ring-2 ring-purple-400/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-slate-700'
                      }`}
                      title={isAmbientPlaying ? 'Matikan Musik Latar' : 'Putar Musik Latar Fokus'}
                    >
                      <Music className={`w-5.5 h-5.5 ${isAmbientPlaying ? 'animate-bounce text-white' : 'text-purple-300'}`} />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-black flex items-center gap-2 uppercase tracking-wider text-purple-300 font-mono">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Musik Latar & Suasana Fokus</span>
                        {isEditorial && (
                          <span className="bg-purple-900/80 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-700">
                            Spesial Editorial & Opini
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-purple-100/90 font-medium mt-0.5 leading-snug">
                        {isAmbientPlaying
                          ? `Sedang memutar: ${AMBIENT_TRACKS.find(t => t.id === selectedAmbientTrack)?.name} (Volume ${Math.round(ambientVolume * 100)}%)`
                          : 'Aktifkan alunan musik latar atau efek suara alami untuk pengalaman membaca artikel mendalam yang lebih tenang.'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Controls: Track Select & Volume Slider */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-purple-800/60">
                    {/* Track Selection */}
                    <div className="flex flex-col gap-1 min-w-[170px]">
                      <span className="text-[10px] text-purple-300 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-purple-400" /> Suasana Latar:
                      </span>
                      <select
                        value={selectedAmbientTrack}
                        onChange={(e) => handleSelectAmbientTrack(e.target.value)}
                        className="bg-slate-900 text-purple-100 text-[11px] font-medium px-2.5 py-1 rounded-xl border border-purple-700 focus:outline-none focus:border-purple-400 truncate cursor-pointer"
                      >
                        {AMBIENT_TRACKS.map((track) => (
                          <option key={track.id} value={track.id}>
                            {track.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Volume Slider */}
                    <div className="flex flex-col gap-1 min-w-[130px]">
                      <div className="flex items-center justify-between text-[10px] text-purple-300 font-mono font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Volume1 className="w-3 h-3 text-purple-400" /> Volume:
                        </span>
                        <span>{Math.round(ambientVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={ambientVolume}
                        onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Featured Image */}
          <div className={`mb-6 rounded-2xl overflow-hidden shadow-md ${isFocusMode ? 'border border-slate-300 dark:border-slate-800' : 'bg-sky-950 border border-sky-200'}`}>
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[420px] object-cover"
            />
            {article.imageCaption && (
              <div className={`p-3 text-xs italic border-t flex items-center gap-2 ${
                isNightMode
                  ? 'bg-slate-900 text-slate-300 border-slate-800'
                  : 'bg-sky-50 text-sky-800 border-sky-100'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                {article.imageCaption}
              </div>
            )}
          </div>

          {!isFocusMode && (
            <>


              {/* Key Takeaways Box (Poin Penting Berita) */}
              {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                <div className={`rounded-2xl p-5 border-2 mb-6 shadow-xs transition-colors ${
                  isNightMode
                    ? 'bg-slate-900/90 border-slate-700 text-slate-100'
                    : isWarmMode
                    ? 'bg-[#f5ecda] border-[#dfcfad] text-[#3e2e1c]'
                    : 'bg-sky-50 border-sky-200 text-slate-800'
                }`}>
                  <div className={`flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wide mb-3 font-mono ${
                    isNightMode ? 'text-yellow-300' : isWarmMode ? 'text-amber-950' : 'text-sky-950'
                  }`}>
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Poin Penting Warta Ini (Key Takeaways)
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm">
                    {article.keyTakeaways.map((point, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-lg bg-yellow-400 text-sky-950 font-black text-xs flex items-center justify-center shadow-2xs mt-0.5 border border-yellow-500">
                          ✓
                        </span>
                        <span className={`leading-relaxed font-medium ${isNightMode ? 'text-slate-200' : isWarmMode ? 'text-[#3e2e1c]' : 'text-slate-800'}`}>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sentiment Analysis Insight Box */}
              {(() => {
                const sentiment = analyzeArticleSentiment(article);
                const sentimentCardStyle = {
                  Positif: isNightMode ? 'bg-emerald-950/50 border-emerald-800 text-emerald-100' : 'bg-emerald-50/90 border-emerald-300 text-emerald-950',
                  Netral: isNightMode ? 'bg-amber-950/50 border-amber-800 text-amber-100' : 'bg-amber-50/90 border-amber-300 text-amber-950',
                  Negatif: isNightMode ? 'bg-rose-950/50 border-rose-800 text-rose-100' : 'bg-rose-50/90 border-rose-300 text-rose-950',
                };
                const sentimentBadgeStyle = {
                  Positif: 'bg-emerald-600 text-white',
                  Netral: 'bg-amber-600 text-white',
                  Negatif: 'bg-rose-600 text-white',
                };
                const sentimentIconEl = {
                  Positif: <TrendingUp className="w-4 h-4 text-emerald-500" />,
                  Netral: <MinusCircle className="w-4 h-4 text-amber-500" />,
                  Negatif: <ShieldAlert className="w-4 h-4 text-rose-500" />,
                };

                return (
                  <div className={`rounded-2xl p-5 border-2 mb-8 shadow-xs ${sentimentCardStyle[sentiment.label]}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wide font-mono">
                        {sentimentIconEl[sentiment.label]}
                        Analisis Sentimen & Wawasan Berita (AI NLP)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-3 py-1 rounded-xl shadow-xs uppercase tracking-wider ${sentimentBadgeStyle[sentiment.label]}`}>
                          {sentiment.label} ({sentiment.score}%)
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${
                          isNightMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white/80 border-black/10'
                        }`}>
                          Confidence: {sentiment.confidence}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed mb-3">
                      {sentiment.summary}
                    </p>
                    {sentiment.positiveKeywords.length > 0 || sentiment.negativeKeywords.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/10 text-xs">
                        <span className="font-bold opacity-75">Kata Kunci Utama:</span>
                        {sentiment.positiveKeywords.map((kw, i) => (
                          <span key={`p-${i}`} className="bg-emerald-200/60 text-emerald-950 px-2 py-0.5 rounded font-mono text-[11px] font-bold">
                            +{kw}
                          </span>
                        ))}
                        {sentiment.negativeKeywords.map((kw, i) => (
                          <span key={`n-${i}`} className="bg-rose-200/60 text-rose-950 px-2 py-0.5 rounded font-mono text-[11px] font-bold">
                            -{kw}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })()}
            </>
          )}

          {/* Structured Body Paragraphs */}
          <div className={`${isNightMode ? 'text-slate-100' : isWarmMode ? 'text-[#382b1d]' : 'text-slate-900'} ${
            isFocusMode 
              ? localFontSize === 'normal'
                ? 'text-lg sm:text-xl'
                : localFontSize === 'large'
                ? 'text-xl sm:text-2xl'
                : 'text-2xl sm:text-3xl'
              : getFontSizeClass()
          } ${isFocusMode ? 'space-y-6 sm:space-y-7 leading-[2.0] sm:leading-[2.2] mb-10' : 'mb-8 space-y-3'}`}>
                {paragraphs.map((para, i) => {
                  const isCurrentReading = isPlayingAudio && currentChunkIndex === i + 1;
                  return (
                    <div
                      key={i}
                      className={`transition-all duration-300 rounded-xl ${
                        isCurrentReading
                          ? isNightMode
                            ? 'bg-amber-950/80 border-l-4 border-amber-400 p-3.5 sm:p-4 shadow-md ring-2 ring-amber-400/50 relative text-slate-100'
                            : 'bg-amber-100/90 border-l-4 border-amber-500 p-3.5 sm:p-4 shadow-md ring-2 ring-amber-400/50 relative'
                          : ''
                      }`}
                    >
                      {isCurrentReading && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-black text-amber-950 bg-amber-300 px-2.5 py-0.5 rounded-md mb-2.5 w-max shadow-2xs border border-amber-400">
                          <Volume2 className="w-3.5 h-3.5 text-sky-950 animate-bounce" />
                          <span>SEDANG DIBACAKAN — Paragraf {i + 1} dari {paragraphs.length}</span>
                        </div>
                      )}
                      {renderFormattedParagraph(para, i)}
                    </div>
                  );
                })}
              </div>

              {/* Focus Mode Clean Reading Conclusion */}
              {isFocusMode && (
                <div className={`my-12 text-center py-8 border-t border-dashed animate-in fade-in duration-300 ${
                  isNightMode ? 'border-slate-800' : isWarmMode ? 'border-[#dfcfad]' : 'border-slate-300'
                }`}>
                  <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${
                    isNightMode ? 'text-slate-500' : isWarmMode ? 'text-amber-800/70' : 'text-slate-400'
                  }`}>
                    ◆ ◆ ◆
                  </div>
                  <p className={`text-sm font-medium ${
                    isNightMode ? 'text-slate-300' : isWarmMode ? 'text-[#3e2e1c]' : 'text-slate-600'
                  }`}>
                    Anda telah menyelesaikan naskah warta ini dalam <strong>Mode Fokus</strong>.
                  </p>
                  <p className={`text-xs mt-1 ${
                    isNightMode ? 'text-slate-400' : isWarmMode ? 'text-[#6a563f]' : 'text-slate-500'
                  }`}>
                    Ingin membaca tanggapan pembaca, memberikan reaksi, atau membagikan warta ini?
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFocusMode(false)}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider border border-amber-500 transition-all cursor-pointer shadow-xs active:scale-95 inline-flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4 text-slate-950" />
                      <span>Kembali ke Tampilan Penuh (Komentar & Reaksi)</span>
                    </button>
                  </div>
                </div>
              )}

              {!isFocusMode && (
                <>
                  {/* Tags Chips */}
                  <div className={`flex flex-wrap items-center gap-2 pt-4 border-t mb-6 ${
                    isNightMode ? 'border-slate-800' : isWarmMode ? 'border-[#dfcfad]' : 'border-sky-100'
                  }`}>
                    <span className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wide mr-1 font-mono ${
                      isNightMode ? 'text-yellow-300' : isWarmMode ? 'text-amber-950' : 'text-sky-900'
                    }`}>
                      <Tag className="w-3.5 h-3.5 text-yellow-500" /> Topik Terkait:
                    </span>
                    {article.tags.map((tag, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onSelectTag(tag);
                          onClose();
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                          isNightMode
                            ? 'bg-slate-900 hover:bg-slate-800 text-yellow-300 border-slate-700'
                            : 'bg-sky-50 hover:bg-yellow-100 text-sky-900 border-sky-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  {/* Visual Element: Estimasi Durasi Membaca & Statistik Kata */}
                  <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 text-white border-2 border-yellow-400/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                    {/* Subtle decorative background icon */}
                    <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                      <Clock className="w-32 h-32 text-yellow-400" />
                    </div>

                    <div className="flex items-center gap-3.5 z-10">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-lg border border-yellow-300 flex-shrink-0">
                        <Clock className="w-6 h-6 text-sky-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 font-mono text-[10px] font-black uppercase tracking-wider border border-yellow-400/30">
                            ESTIMASI DURASI MEMBACA
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-white mt-0.5 flex items-center gap-2">
                          <span>{readingTimeInfo.minutes} Menit Membaca</span>
                          <span className="text-xs text-yellow-400 font-mono font-normal">
                            (~{readingTimeInfo.wordCount.toLocaleString('id-ID')} Kata)
                          </span>
                        </h4>
                        <p className="text-xs text-sky-200 mt-0.5 font-medium">
                          Dihitung berdasarkan kecepatan baca standar Indonesia (200 kata/menit).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Article Reactions & Sharing Bar */}
              <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs mb-10 flex flex-col gap-4 transition-colors ${
                isNightMode
                  ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                  : 'bg-gradient-to-r from-sky-50 via-slate-50 to-amber-50/60 border-sky-200/80'
              }`}>
                
                {/* Header title with total reactions counter */}
                <div className={`flex items-center justify-between gap-2 border-b pb-3 ${
                  isNightMode ? 'border-slate-800' : 'border-sky-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-950 text-yellow-400 font-black text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                      Ekspresi
                    </span>
                    <span className={`text-xs font-bold font-mono ${isNightMode ? 'text-yellow-300' : 'text-sky-950'}`}>
                      Bagaimana pendapat Anda tentang warta ini?
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${
                    isNightMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-sky-900 border-sky-200'
                  }`}>
                    Total {(Object.values(reactions) as ReactionItem[]).reduce((sum, r) => sum + r.count, 0).toLocaleString('id-ID')} Reaksi
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Reaction buttons with emojis & live counts */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {(Object.entries(reactions) as Array<[string, { emoji: string; label: string; count: number; userReacted: boolean }]>).map(([key, item]) => (
                      <button
                        key={key}
                        onClick={() => handleReactionClick(key)}
                        className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer select-none ${
                          item.userReacted
                            ? 'bg-yellow-400 text-sky-950 border-yellow-500 font-black shadow-md scale-105 ring-2 ring-yellow-400/50'
                            : isNightMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 shadow-2xs'
                            : 'bg-white hover:bg-amber-50/80 text-slate-700 border-sky-200 hover:border-amber-300 shadow-2xs'
                        }`}
                        title={`Beri reaksi ${item.label}`}
                      >
                        <span className="text-lg leading-none transition-transform group-hover:scale-110">{item.emoji}</span>
                        <span className="font-sans text-[11px] font-medium hidden sm:inline">{item.label}</span>
                        <span className={`font-mono font-black text-xs px-1.5 py-0.5 rounded-md ${
                          isNightMode ? 'bg-slate-900 text-slate-200' : 'bg-black/5 text-slate-800'
                        }`}>
                          {item.count.toLocaleString('id-ID')}
                        </span>

                        {/* Floating +1 feedback animation */}
                        {lastReactedKey === key && (
                          <span className="absolute -top-3 right-1 bg-yellow-400 text-sky-950 font-mono font-black text-[10px] px-1.5 py-0.2 rounded-full border border-yellow-600 animate-bounce shadow-xs">
                            {item.userReacted ? '+1' : '-1'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Share options */}
                  <div className={`flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 ${
                    isNightMode ? 'border-slate-800' : 'border-sky-100'
                  }`}>
                    <span className={`text-xs font-bold font-mono flex items-center gap-1 mr-1 ${
                      isNightMode ? 'text-yellow-300' : 'text-sky-900'
                    }`}>
                      <Share2 className="w-3.5 h-3.5 text-yellow-500" /> BAGIKAN:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Share Button (Web Share API with WhatsApp fallback) */}
                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95 border border-yellow-500"
                        title="Share warta ini (Web Share API atau WhatsApp)"
                        aria-label="Share"
                      >
                        <Share2 className="w-3.5 h-3.5 text-sky-950" />
                        <span>Share</span>
                      </button>

                      {/* Salin Teks & Link Manual */}
                      <button
                        type="button"
                        onClick={() => {
                          const fullTxt = `${getArticleShareText()}\n${getArticleShareUrl()}`;
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(fullTxt);
                          }
                          setCopiedText(true);
                          handleTrackShare('copy_text');
                          setTimeout(() => setCopiedText(false), 2500);
                        }}
                        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs border cursor-pointer hover:scale-105 active:scale-95 ${
                          copiedText
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-sky-100 hover:bg-sky-200 text-sky-950 border-sky-300'
                        }`}
                        title="Salin judul, ringkasan dan link berita (Manual Share)"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedText ? 'Teks Tersalin!' : 'Salin Teks'}</span>
                      </button>

                      {/* Twitter/X share */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getArticleShareText())}&url=${encodeURIComponent(getArticleShareUrl())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleTrackShare('twitter')}
                        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95 border border-slate-700"
                        title="Bagikan ke Twitter / X"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span>X</span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-slate-800 text-slate-200 border border-slate-700">
                          {(shareCounts.twitter || 0).toLocaleString('id-ID')}
                        </span>
                        {lastSharedPlatform === 'twitter' && (
                          <span className="absolute -top-3 -right-1 bg-yellow-400 text-sky-950 font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full border border-yellow-600 animate-bounce shadow-xs z-20">
                            +1
                          </span>
                        )}
                      </a>

                      {/* Facebook share */}
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getArticleShareUrl())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleTrackShare('facebook')}
                        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                        title="Bagikan ke Facebook"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>Facebook</span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-white/20 text-white shadow-2xs">
                          {(shareCounts.facebook || 0).toLocaleString('id-ID')}
                        </span>
                        {lastSharedPlatform === 'facebook' && (
                          <span className="absolute -top-3 -right-1 bg-yellow-400 text-sky-950 font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full border border-yellow-600 animate-bounce shadow-xs z-20">
                            +1
                          </span>
                        )}
                      </a>

                      {/* TikTok share */}
                      <button
                        type="button"
                        onClick={handleShareToTikTok}
                        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95 border border-slate-700"
                        title="Bagikan ke TikTok"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .592.046.87.136V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.93-4.5V9.01a8.28 8.28 0 0 0 4.84 1.55v-3.5a4.83 4.83 0 0 1-1-.37z"/>
                        </svg>
                        <span>TikTok</span>
                      </button>

                      {/* YouTube share */}
                      <button
                        type="button"
                        onClick={handleShareToYouTube}
                        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                        title="Bagikan ke YouTube"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span>YouTube</span>
                      </button>

                      {/* Telegram share */}
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(getArticleShareUrl())}&text=${encodeURIComponent(getArticleShareText())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleTrackShare('telegram')}
                        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                        title="Bagikan ke Telegram"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Telegram</span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-white/20 text-white shadow-2xs">
                          {(shareCounts.telegram || 0).toLocaleString('id-ID')}
                        </span>
                        {lastSharedPlatform === 'telegram' && (
                          <span className="absolute -top-3 -right-1 bg-yellow-400 text-sky-950 font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full border border-yellow-600 animate-bounce shadow-xs z-20">
                            +1
                          </span>
                        )}
                      </a>

                      {/* Salin Link option */}
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs border cursor-pointer ${
                          copiedLink
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-yellow-400 hover:bg-yellow-300 text-sky-950 border-yellow-500'
                        }`}
                        title="Salin Tautan Artikel ke Clipboard"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black ${
                          copiedLink ? 'bg-white/20 text-white' : 'bg-sky-950/20 text-sky-950'
                        }`}>
                          {(shareCounts.copy || 0).toLocaleString('id-ID')}
                        </span>
                        {lastSharedPlatform === 'copy' && (
                          <span className="absolute -top-3 -right-1 bg-yellow-400 text-sky-950 font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full border border-yellow-600 animate-bounce shadow-xs z-20">
                            +1
                          </span>
                        )}
                      </button>

                      {/* More Share Modal Button */}
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-yellow-300 font-bold text-xs transition-colors border border-sky-700 cursor-pointer"
                        title="Buka Opsi Bagikan Berita Lengkap"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Opsi Lain</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Comments Section with Anti-Buzzer Protection */}
              <section id="comments-section" className={`mb-10 pt-6 border-t-2 ${
                isNightMode ? 'border-slate-800' : 'border-sky-100'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className={`text-base sm:text-lg font-black flex items-center gap-2 uppercase tracking-tight ${
                        isNightMode ? 'text-yellow-300' : 'text-sky-950'
                      }`}>
                        <MessageSquare className="w-5 h-5 text-yellow-500" />
                        Kolom Komentar Pembaca ({comments.length})
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        isNightMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-sky-100 text-sky-900 border-sky-300'
                      }`}>
                        <Database className="w-3 h-3 text-sky-500" />
                        Tersimpan di IndexedDB
                      </span>
                    </div>
                    <p className={`text-[11px] font-medium ${isNightMode ? 'text-slate-400' : 'text-sky-700'}`}>
                      Diskusi Anda tersimpan secara lokal di browser (IndexedDB) sehingga tetap dapat dibaca secara offline tanpa koneksi internet.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAntiBuzzerModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition-all self-start sm:self-auto shadow-2xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Perisai Anti-Buzzer ON</span>
                  </button>
                </div>

                {/* Comment Filter Tabs */}
                <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setCommentFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                      commentFilter === 'all'
                        ? 'bg-sky-950 text-yellow-400 font-black shadow-xs'
                        : isNightMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
                    }`}
                  >
                    Semua Komentar ({comments.filter(c => !c.isHeldForReview).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentFilter('verified')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                      commentFilter === 'verified'
                        ? 'bg-sky-950 text-yellow-400 font-black shadow-xs'
                        : isNightMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500" />
                    <span>Terverifikasi Organik ({comments.filter(c => c.isVerified && !c.isHeldForReview).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentFilter('suspect')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                      commentFilter === 'suspect'
                        ? 'bg-amber-500 text-white font-black shadow-xs'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Terindikasi Buzzer/Ditahan ({comments.filter(c => c.isBuzzerSuspect || c.isHeldForReview).length})</span>
                  </button>
                </div>

                {/* Real-time Anti-Buzzer Feedback Alert */}
                {commentFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl mb-4 border flex items-start gap-2.5 animate-in fade-in duration-200 text-xs ${
                      commentFeedback.type === 'clean'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : commentFeedback.type === 'suspect'
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    {commentFeedback.type === 'clean' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-black text-xs sm:text-sm">{commentFeedback.title}</div>
                      <p className="mt-0.5 text-slate-700 leading-relaxed">{commentFeedback.message}</p>
                    </div>
                  </div>
                )}

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className={`rounded-2xl p-4 sm:p-5 border mb-6 shadow-2xs transition-colors ${
                  isNightMode
                    ? 'bg-slate-900 border-slate-800 text-slate-100'
                    : 'bg-sky-50 border-sky-200 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`text-[11px] font-bold font-mono ${
                      isNightMode ? 'text-yellow-300' : 'text-sky-900'
                    }`}>
                      Formulir Komentar Terlindungi
                    </span>
                    <span className={`text-[10px] font-mono ${isNightMode ? 'text-sky-300' : 'text-sky-600'}`}>
                      🛡️ AI Filter Aktif
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      value={newCommentName}
                      onChange={(e) => setNewCommentName(e.target.value)}
                      placeholder="Nama Lengkap Anda..."
                      className={`sm:col-span-1 px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium ${
                        isNightMode
                          ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
                          : 'bg-white border-sky-200 text-sky-950'
                      }`}
                    />
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Tuliskan ulasan atau tanggapan berbobot Anda..."
                      required
                      className={`sm:col-span-2 px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium ${
                        isNightMode
                          ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
                          : 'bg-white border-sky-200 text-sky-950'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className={`text-[11px] ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      *Hindari kata kasar, spam link, ujaran kebencian, dan narasi buzzer terkoordinasi.
                    </p>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs shadow-xs border border-yellow-500 uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Kirim Komentar
                    </button>
                  </div>
                </form>

                {/* Comments List with Anti-Buzzer Badges and Report Action */}
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <div className={`text-center py-6 text-xs rounded-xl border font-medium ${
                      isNightMode
                        ? 'bg-slate-900 border-slate-800 text-slate-300'
                        : 'bg-sky-50 border-sky-100 text-sky-700'
                    }`}>
                      Belum ada komentar. Jadilah yang pertama memberikan ulasan yang bernas!
                    </div>
                  ) : (
                    comments
                      .filter((comm) => {
                        if (commentFilter === 'verified') return comm.isVerified && !comm.isHeldForReview;
                        if (commentFilter === 'suspect') return comm.isBuzzerSuspect || comm.isHeldForReview;
                        // 'all' shows non-held comments
                        return !comm.isHeldForReview;
                      })
                      .map((comm) => (
                        <div
                          key={comm.id}
                          className={`rounded-2xl p-4 border transition-all ${
                            comm.isHeldForReview
                              ? 'bg-rose-950/40 border-rose-800 shadow-2xs'
                              : comm.isBuzzerSuspect
                              ? 'bg-amber-950/40 border-amber-800 shadow-2xs'
                              : isNightMode
                              ? 'bg-slate-900 border-slate-800 text-slate-200 shadow-2xs'
                              : 'bg-white border-sky-100 shadow-2xs'
                          }`}
                        >
                          <div className="flex gap-3 items-start">
                            <img
                              src={comm.userAvatar}
                              alt={comm.userName}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover border border-yellow-400 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-xs font-bold ${isNightMode ? 'text-yellow-300' : 'text-sky-950'}`}>{comm.userName}</span>
                                  
                                  {comm.isVerified && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Bebas Buzzer
                                    </span>
                                  )}

                                  {comm.isBuzzerSuspect && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                                      Pola Buzzer Terdeteksi
                                    </span>
                                  )}

                                  {comm.isHeldForReview && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[10px] font-bold">
                                      <ShieldAlert className="w-3 h-3 text-rose-600" />
                                      Ditahan Redaksi
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[10px] font-mono ${isNightMode ? 'text-slate-400' : 'text-sky-600'}`}>{comm.timestamp}</span>
                              </div>

                              <p className={`text-xs leading-relaxed mb-2 font-normal ${
                                isNightMode ? 'text-slate-200' : 'text-slate-800'
                              }`}>
                                {comm.content}
                              </p>

                              {/* Flagged reasons if any */}
                              {comm.buzzerReasons && comm.buzzerReasons.length > 0 && (
                                <div className="p-2 mb-2 bg-amber-100/70 rounded-xl text-[10px] text-amber-950 font-mono border border-amber-200">
                                  <strong>Indikasi Sistem:</strong> {comm.buzzerReasons.join(', ')}
                                </div>
                              )}

                              <div className={`flex items-center justify-between pt-1 border-t ${
                                isNightMode ? 'border-slate-800' : 'border-slate-100'
                              }`}>
                                <button
                                  onClick={() => handleLikeComment(comm.id)}
                                  className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${
                                    isNightMode ? 'text-sky-300 hover:text-yellow-400' : 'text-sky-700 hover:text-yellow-600'
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>Suka ({comm.likes})</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenReportModal(comm)}
                                  className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${
                                    isNightMode ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'
                                  }`}
                                  title="Laporkan komentar terindikasi buzzer bayaran atau bot"
                                >
                                  <Flag className="w-3 h-3" />
                                  <span>{comm.reportsCount ? `Dilaporkan (${comm.reportsCount})` : 'Lapor Buzzer / Bot'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </section>

              {/* Automated 'Recommended for You' Section (3 Unread Articles from Same Category) */}
              {recommendedForYou.length > 0 && (
                <div className="pt-6 border-t-2 border-sky-100 mb-8">
                  <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-sky-800 relative overflow-hidden">
                    {/* Background Glow Effect */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-sky-800/80 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-yellow-400 text-sky-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase font-mono tracking-wider shadow-2xs">
                            Sistem AI Personalisasi
                          </span>
                          <span className="text-xs text-sky-300 font-mono font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                            Otomatis Diselaraskan
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-sans tracking-tight">
                          <span>Rekomendasi Untuk Anda (Recommended for You)</span>
                        </h3>
                        <p className="text-xs text-sky-200 font-medium mt-0.5">
                          3 warta di rubrik <span className="font-bold text-yellow-400 font-mono">#{article.categoryLabel}</span> yang belum pernah Anda baca
                        </p>
                      </div>

                      <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40 self-start sm:self-auto flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                        Warta Belum Dibaca
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendedForYou.map((rec) => {
                        const recReadingTime = getArticleReadingTime(rec);
                        const isReadBySet = readArticleIds ? readArticleIds.includes(rec.id) : false;

                        return (
                          <div
                            key={rec.id}
                            onClick={() => {
                              onSelectRelatedArticle(rec);
                              if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollTop = 0;
                              }
                            }}
                            className="group bg-sky-900/60 hover:bg-sky-800/80 rounded-2xl p-3.5 border border-sky-700/70 hover:border-yellow-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-0.5"
                          >
                            <div>
                              {/* Image Thumbnail */}
                              <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-sky-950 relative">
                                <img
                                  src={rec.imageUrl}
                                  alt={rec.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                
                                {/* Overlay Category Label */}
                                <span className="absolute top-2 left-2 bg-sky-950/90 text-yellow-300 text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-sky-700 backdrop-blur-xs">
                                  {rec.categoryLabel}
                                </span>

                                {/* Unread Status Badge */}
                                {!isReadBySet ? (
                                  <span className="absolute top-2 right-2 bg-emerald-500 text-sky-950 text-[10px] font-mono font-black px-2 py-0.5 rounded-md shadow-xs border border-emerald-400 flex items-center gap-1">
                                    ✦ Belum Dibaca
                                  </span>
                                ) : (
                                  <span className="absolute top-2 right-2 bg-sky-950/90 text-sky-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                                    Pilihan Rubrik
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-yellow-300 line-clamp-2 leading-snug mb-2 font-sans transition-colors">
                                {rec.title}
                              </h4>

                              {/* Excerpt Snippet */}
                              <p className="text-[11px] text-sky-200/80 line-clamp-2 leading-relaxed mb-3">
                                {rec.excerpt || rec.content.substring(0, 90) + '...'}
                              </p>
                            </div>

                            {/* Card Footer Info */}
                            <div className="pt-2.5 border-t border-sky-800/80 flex items-center justify-between text-[10px] font-mono text-sky-300">
                              <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                                <Clock className="w-3 h-3 text-amber-400" />
                                {recReadingTime.formatted}
                              </span>

                              <span className="group-hover:text-yellow-400 font-bold text-xs flex items-center gap-1 transition-colors">
                                Baca Sekarang <ArrowRight className="w-3.5 h-3.5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* High-Engagement Category-Based Related Articles Section */}
              {relatedArticles.length > 0 && (
                <div className={`mt-8 pt-6 border-t-2 ${isWarmMode ? 'border-[#dfcfad]' : 'border-sky-200'}`}>
                  {/* Category Header */}
                  <div className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                    isWarmMode 
                      ? 'bg-[#fbf4e6] border-[#dfcfad] text-[#3b2b1b]' 
                      : 'bg-gradient-to-br from-sky-50 via-white to-sky-100/60 border-sky-200 text-sky-950 shadow-xs'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-yellow-400 text-sky-950 flex items-center gap-1 shadow-2xs">
                            <Sparkles className="w-3 h-3 text-sky-950" /> Rubrik #{article.categoryLabel}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-300">
                            {totalCategoryArticlesCount} Warta Serupa
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black uppercase tracking-tight font-sans text-sky-950 flex items-center gap-2">
                          Artikel Terkait dalam Kategori {article.categoryLabel}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          Rekomendasi berita pilihan seputar topik yang sama untuk memperkaya wawasan Anda.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectTag(article.categoryLabel);
                          handleAttemptClose();
                        }}
                        className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-sky-950 hover:bg-sky-900 text-yellow-300 font-bold text-xs border border-sky-800 transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
                        title={`Jelajahi seluruh warta di rubrik ${article.categoryLabel}`}
                      >
                        <span>Arsip #{article.categoryLabel}</span>
                        <ArrowRight className="w-3 h-3 text-yellow-400" />
                      </button>
                    </div>

                    {/* Quick Topic Tags Bar */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-sky-200/80">
                        <span className="text-[11px] font-mono font-bold text-sky-900 flex items-center gap-1 mr-1">
                          <Tag className="w-3 h-3 text-yellow-500" />
                          Topik Terkait:
                        </span>
                        {article.tags.slice(0, 5).map((t, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              onSelectTag(t);
                              handleAttemptClose();
                            }}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white hover:bg-yellow-400 text-sky-950 border border-sky-200 hover:border-yellow-500 transition-all cursor-pointer font-bold shadow-2xs hover:scale-105"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Related Articles Cards: Displays up to three articles from the same category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {relatedArticles.map((rel) => {
                      const relReadingTime = getArticleReadingTime(rel);
                      const isCardSaved = savedArticleIdSet.has(rel.id);

                      return (
                        <div
                          key={rel.id}
                          onClick={() => {
                            onSelectRelatedArticle(rel);
                            if (scrollContainerRef.current) {
                              scrollContainerRef.current.scrollTop = 0;
                            }
                          }}
                          className={`group rounded-2xl p-3 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 ${
                            isWarmMode
                              ? 'bg-[#fffaf0] hover:bg-[#f5ecdc] border-[#dfcfad] hover:border-amber-500'
                              : 'bg-white hover:bg-sky-50/70 border-sky-200 hover:border-yellow-400'
                          }`}
                        >
                          <div>
                            {/* Thumbnail with Aspect Ratio & Badges */}
                            <div className="aspect-[16/10] rounded-xl overflow-hidden mb-2.5 bg-sky-950 relative shadow-2xs">
                              <img
                                src={rel.imageUrl}
                                alt={rel.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />

                              {/* Category Badge Overlay */}
                              <span className="absolute top-2 left-2 bg-sky-950/90 text-yellow-300 text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-sky-700/80 backdrop-blur-xs shadow-2xs">
                                #{rel.categoryLabel}
                              </span>

                              {/* Reading Time Badge Overlay */}
                              <span className="absolute bottom-2 right-2 bg-black/75 text-amber-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 border border-white/10">
                                <Clock className="w-2.5 h-2.5 text-amber-300" />
                                {relReadingTime.formatted}
                              </span>

                              {/* Status Badge */}
                              {rel.isBreaking && (
                                <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-mono font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                                  Kilas
                                </span>
                              )}
                              {!rel.isBreaking && rel.isTrending && (
                                <span className="absolute top-2 right-2 bg-amber-500 text-sky-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                                  Populer
                                </span>
                              )}
                            </div>

                            {/* Headline */}
                            <h4 className="text-xs sm:text-sm font-black text-sky-950 group-hover:text-yellow-600 line-clamp-2 leading-snug mb-1.5 font-sans transition-colors">
                              {rel.title}
                            </h4>

                            {/* Excerpt Snippet */}
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-3">
                              {rel.excerpt || (rel.paragraphs?.[0] ? rel.paragraphs[0].slice(0, 90) + '...' : rel.content?.slice(0, 90) + '...')}
                            </p>

                            {/* Author Row */}
                            <div className="flex items-center gap-2 mb-2.5 text-[10px] text-slate-500 font-mono">
                              <img
                                src={rel.author?.avatar || 'https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=100&q=80'}
                                alt={rel.author?.name}
                                className="w-4 h-4 rounded-full object-cover border border-sky-200"
                              />
                              <span className="truncate font-semibold text-slate-700">{rel.author?.name || 'Redaksi Arun'}</span>
                              <span>•</span>
                              <span className="text-slate-400">{rel.publishedAt || 'Hari Ini'}</span>
                            </div>
                          </div>

                          {/* Card Footer: Metrics & Interactive Actions */}
                          <div className="pt-2 border-t border-sky-100 flex items-center justify-between text-[11px] font-mono text-sky-900">
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Eye className="w-3 h-3 text-sky-600" />
                              {rel.views || 100}
                            </span>

                            <div className="flex items-center gap-2">
                              {/* Quick Bookmark Toggle Button */}
                              <button
                                type="button"
                                onClick={(e) => handleCardToggleSave(rel, e)}
                                className={`p-1 rounded-md border transition-all cursor-pointer ${
                                  isCardSaved
                                    ? 'bg-yellow-400 text-sky-950 border-yellow-500 shadow-2xs'
                                    : 'bg-white hover:bg-sky-100 text-slate-500 border-sky-200 hover:text-sky-950'
                                }`}
                                title={isCardSaved ? 'Hapus warta dari simpanan' : 'Simpan warta untuk dibaca nanti'}
                              >
                                {isCardSaved ? (
                                  <BookmarkCheck className="w-3.5 h-3.5 text-sky-950" />
                                ) : (
                                  <Bookmark className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Read Button */}
                              <span className="font-bold text-xs text-sky-900 group-hover:text-yellow-600 flex items-center gap-0.5 transition-colors">
                                Baca <ArrowRight className="w-3 h-3 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Discovery Call-to-Action Footer */}
                  <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border border-sky-800 shadow-md">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                      <div className="w-9 h-9 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-xs flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-sky-950" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black uppercase font-mono tracking-tight text-white">
                          Tertarik dengan topik #{article.categoryLabel}?
                        </h4>
                        <p className="text-[11px] text-sky-200">
                          Buka seluruh arsip berita dan laporan investigasi di rubrik ini.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTag(article.categoryLabel);
                        handleAttemptClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-95"
                    >
                      <span>Lihat Semua #{article.categoryLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Article Bottom Action Bar */}
              <div className="mt-8 pt-6 border-t-2 border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-sky-50/90 p-4 rounded-2xl border border-sky-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-950">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span>Warta Selesai Dibaca</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Bottom Mobile-Responsive Save Button */}
                  <button
                    type="button"
                    onClick={(e) => onToggleSave(article, e)}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs border shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                      isSaved
                        ? 'bg-yellow-400 text-sky-950 border-yellow-500 font-black shadow-yellow-400/20'
                        : 'bg-white hover:bg-sky-100 text-sky-950 border-sky-300'
                    }`}
                    title={isSaved ? 'Warta sudah tersimpan di browser' : 'Simpan warta ini untuk dibaca nanti'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-sky-950" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-sky-700" />
                    )}
                    <span>{isSaved ? 'Tersimpan' : 'Simpan Warta'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAttemptClose}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-sky-950 hover:bg-sky-900 active:scale-95 text-yellow-400 font-black text-xs border border-yellow-400/80 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                    <span>Tutup Berita</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Floating Distraction-Free Exit Focus Mode Pill Button */}
          {isFocusMode && (
            <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <button
                type="button"
                onClick={() => setIsFocusMode(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-yellow-300 hover:text-yellow-200 border border-yellow-400/40 shadow-2xl backdrop-blur-md text-xs font-mono font-bold cursor-pointer transition-all hover:scale-105 active:scale-95"
                title="Keluar dari Mode Fokus (Kembalikan tampilan penuh)"
              >
                <Eye className="w-3.5 h-3.5 text-yellow-400" />
                <span>Keluar Mode Fokus</span>
              </button>
            </div>
          )}

        </article>
          )}

        </div>

        {/* Mobile Sticky Reading Actions Bar (Docked at bottom of modal on mobile devices) */}
        <div className={`md:hidden sticky bottom-0 inset-x-0 z-30 border-t px-2 py-1.5 flex items-center justify-around transition-colors shadow-[0_-4px_20px_rgba(0,0,0,0.3)] ${
          isNightMode 
            ? 'bg-slate-950/95 text-slate-100 border-slate-800' 
            : isWarmMode 
            ? 'bg-[#3b2b1b]/95 text-[#fbf4e6] border-[#553e28]' 
            : 'bg-sky-950/95 text-white border-yellow-400/70'
        }`}>


          {/* Text-to-Speech Audio */}
          <button
            type="button"
            onClick={handleToggleTTS}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all active:scale-90 cursor-pointer ${
              isPlayingAudio ? 'text-yellow-400 font-black' : 'text-sky-300 hover:text-white'
            }`}
            title="Dengarkan Berita (Text-to-Speech)"
          >
            {isPlayingAudio && !isPausedAudio ? (
              <Pause className="w-4 h-4 mb-0.5 fill-yellow-400 text-yellow-400" />
            ) : (
              <Headphones className="w-4 h-4 mb-0.5 text-yellow-400" />
            )}
            <span>{isPlayingAudio ? (isPausedAudio ? 'Lanjut' : 'Jeda') : 'Dengar'}</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-sky-300 hover:text-white transition-all active:scale-90 cursor-pointer"
            title="Share"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4 mb-0.5 text-yellow-400" />
            <span>Share</span>
          </button>

          {/* Bookmark / Simpan */}
          <button
            type="button"
            onClick={(e) => onToggleSave(article, e)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all active:scale-90 cursor-pointer ${
              isSaved ? 'text-yellow-400 font-black' : 'text-sky-300 hover:text-white'
            }`}
            title={isSaved ? 'Hapus Simpanan' : 'Simpan Berita'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 mb-0.5 text-yellow-400" />
            ) : (
              <Bookmark className="w-4 h-4 mb-0.5" />
            )}
            <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
          </button>

          {/* Tutup */}
          <button
            type="button"
            onClick={handleAttemptClose}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-yellow-400 hover:text-white transition-all active:scale-90 cursor-pointer"
            title="Tutup Halaman Berita"
          >
            <X className="w-4 h-4 mb-0.5" />
            <span>Tutup</span>
          </button>
        </div>
      </div>

      {/* Anti-Buzzer Manifesto & Protection Info Modal */}
      {isAntiBuzzerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-2 border-emerald-500 overflow-hidden relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsAntiBuzzerModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-sky-950 uppercase tracking-tight">
                    Perisai Anti-Buzzer Arun News v3.0
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase border border-emerald-300">
                    Maksimal 100% Active
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-bold">
                  Sistem Pertahanan Siber Terkomputerisasi & Terstruktur
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed overflow-y-auto pr-1 flex-1 mb-4">
              
              <div className="p-3.5 bg-gradient-to-r from-emerald-900 to-sky-950 text-white rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-yellow-400 font-bold font-mono text-[11px] mb-1">
                  <span>METRIK BENTENG PERTAHANAN REAL-TIME:</span>
                  <span>AKURASI 99.4%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center py-1 font-mono">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <div className="text-base font-black text-yellow-400">429</div>
                    <div className="text-[9px] text-emerald-200">Bot & Buzzer Dicegah</div>
                  </div>
                  <div className="p-2 bg-white/10 rounded-xl">
                    <div className="text-base font-black text-rose-400">184</div>
                    <div className="text-[9px] text-rose-200">Laporan Diproses</div>
                  </div>
                  <div className="p-2 bg-white/10 rounded-xl">
                    <div className="text-base font-black text-emerald-300">0.02s</div>
                    <div className="text-[9px] text-emerald-200">Kecepatan Deteksi</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  1. Anti-Evasion Leetspeak & Symbol Bypass Normalization
                </h4>
                <p>
                  Sistem melakukan pencucian karakter otomatis untuk membongkar taktik evasi simbol (misal: <code>b.u.z.z.e.r</code>, <code>$l0t</code>, <code>f-u-f-u-f-a-f-a</code>, <code>c3b0ng</code>) secara terperinci sebelum menganalisis makna kalimat.
                </p>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                <h4 className="font-bold text-sky-950 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  2. AI Pattern Recognition & Coordinated Hashtag Campaign
                </h4>
                <p>
                  Deteksi instan kemiripan teks (Jaccard Similarity index &gt; 60%), penggunaan huruf kapital provokatif (&gt;60% ALL CAPS), tagar kampanye terkoordinasi (misal: <code>#SerbuMedia</code>), serta pola nama akun massal/kloningan.
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-950 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  3. AI Bot Canned Response & Link Spam Neutralizer
                </h4>
                <p>
                  Memblokir secara rasional promosi komersial terselubung (pinjol, slot gacor, WhatsApp link, Telegram) serta template komentar AI generik yang dipasang oleh bot otomatis.
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  4. Penahanan Otomatis & Verifikasi Redaksi (Human-in-the-Loop)
                </h4>
                <p>
                  Komentar dengan tingkat risiko tinggi langsung dikarantina di meja Redaksi Arun News, menjaga opini publik tetap berimbang, sehat, dan mengacu pada Kode Etik Jurnalistik Dewan Pers.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAntiBuzzerModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
              >
                Saya Mengerti & Mendukung Perisai AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Buzzer / Bot Comment Modal */}
      {reportingComment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-400 overflow-hidden relative">
            <button
              onClick={() => setReportingComment(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-sky-950 uppercase tracking-tight">
                  Laporkan Komentar Buzzer / Bot
                </h3>
                <p className="text-[11px] text-rose-700 font-bold">
                  Bantu Redaksi menjaga ruang dialog yang sehat
                </p>
              </div>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
                <h4 className="text-base font-bold text-sky-950 mb-1">Laporan Berhasil Terkirim</h4>
                <p className="text-xs text-slate-600">
                  Terima kasih atas partisipasi Anda. Dewan redaksi akan segera meninjau komentar ini.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-xs">
                  <div className="font-bold text-slate-900 mb-1">Target Komentar:</div>
                  <div className="text-slate-700 italic line-clamp-2">"{reportingComment.content}"</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">Oleh: {reportingComment.userName}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-sky-950 mb-2">
                    Kategori Pelanggaran:
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium text-slate-900"
                  >
                    <option value="Akun Buzzer Bayaran / Framing Terkoordinasi">Akun Buzzer Bayaran / Framing Terkoordinasi</option>
                    <option value="Spam Bot / Copy-Paste Massal">Spam Bot / Copy-Paste Massal</option>
                    <option value="Disinformasi & Hoaks Politik">Disinformasi & Hoaks Politik</option>
                    <option value="Ujaran Kebencian & SARA">Ujaran Kebencian & SARA</option>
                    <option value="Promosi Tautan Ilegal / Judi / Pinjol">Promosi Tautan Ilegal / Judi / Pinjol</option>
                    <option value="Serangan Personal / Doxxing">Serangan Personal / Doxxing</option>
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-bold text-sky-950 mb-1.5">
                    Catatan Tambahan (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    placeholder="Contoh: Kalimat ini sama persis dengan yang disebarkan di artikel lain..."
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportingComment(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
                  >
                    Kirim Laporan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Bagikan Berita Universal (Foto, Teks & Link Kemana Aja) */}
      <UniversalShareModal
        article={article}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onTrackShare={handleTrackShare}
      />

      {/* Tombol Sawer Kopi Mengambang (Floating Action Widget saat Membaca Berita) */}
      {onOpenSawerKopi && (
        <aside
          aria-label="Dukungan Sawer Kopi Redaksi"
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSawerKopi();
            }}
            className="group relative flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-sky-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-950/30 border-2 border-yellow-200 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-amber-400/20"
            title="Traktir secangkir kopi untuk jurnalis & redaksi Arun News"
            aria-label="Sawer Kopi Redaksi"
          >
            {/* Animated Coffee Cup & Steam Effect */}
            <span className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-950 text-yellow-300 shadow-inner group-hover:rotate-12 transition-transform">
              <span className="text-base sm:text-lg select-none">☕</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
              </span>
            </span>

            <div className="flex flex-col text-left">
              <span className="font-extrabold tracking-tight leading-none text-sky-950 text-xs sm:text-sm">
                Sawer Kopi
              </span>
              <span className="text-[10px] font-semibold text-amber-950/80 leading-none mt-0.5 hidden xs:inline">
                Traktir Redaksi
              </span>
            </div>

            {/* Subtle Shine Ribbon */}
            <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
            </span>
          </button>
        </aside>
      )}

      {/* Interactive Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryModalOpen}
        onClose={() => setIsGlossaryModalOpen(false)}
        initialTerm={selectedGlossaryTerm}
      />
    </div>
    </>
  );
};

