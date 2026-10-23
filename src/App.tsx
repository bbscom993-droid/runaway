import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  checkDBHealth, 
  fetchArticlesFromDB, 
  saveArticleToDB, 
  seedCategoriesToDB,
  fetchCategoriesFromDB,
  saveCategoryToDB,
  fetchArticleByIdFromDB,
  subscribeArticlesFromDB,
  saveSiteSettingsToDB,
  fetchSiteSettingsFromDB
} from './services/dbClient';
import { 
  CATEGORIES,
  WEATHER_CITIES, 
  TRENDING_TOPICS, 
  INITIAL_POLL, 
  EDITORIAL_PIECES, 
  VIDEO_NEWS, 
  PHOTO_STORIES, 
  INITIAL_ARTICLES,
  INITIAL_SITE_SETTINGS,
  INITIAL_TICKER_SETTINGS,
  INITIAL_EDITORIAL_BOARD,
  INITIAL_OFFICIAL_CONTACTS,
  DEFAULT_EDITORIAL_USERS,
  INITIAL_TRANSPORT_SCHEDULES,
  DEFAULT_AD_BANK_ACCOUNT,
  DEFAULT_AD_BANK_ACCOUNTS,
  DEFAULT_LEGALITAS_SETTINGS
} from './data/newsData';
import { 
  NewsArticle, 
  Category, 
  WeatherInfo, 
  TrendingTopic, 
  PollData, 
  EditorialPiece, 
  VideoNews, 
  PhotoStory, 
  SiteSettings, 
  TickerSettings, 
  EditorialUser,
  TransportSchedule
} from './types';
import { PermanentHeaderAd } from './components/PermanentHeaderAd';
import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { BreakingTicker } from './components/BreakingTicker';
import { HeadlineHero } from './components/HeadlineHero';
import { ArticleCard } from './components/ArticleCard';
import { TrendingSection } from './components/TrendingSection';
import { TransportScheduleSection } from './components/TransportScheduleSection';
import { EditorPickSection } from './components/EditorPickSection';
import { InteractivePoll } from './components/InteractivePoll';
import { DailyNewsQuiz } from './components/DailyNewsQuiz';
import { VideoNewsSection } from './components/VideoNewsSection';
import { PhotoGallerySection } from './components/PhotoGallerySection';
import { SawerKopiModal } from './components/SawerKopiModal';
import { ArticleModal } from './components/ArticleModal';
import { CitizenJournalismModal } from './components/CitizenJournalismModal';
import { CyberMediaGuidelinesModal } from './components/CyberMediaGuidelinesModal';
import { LegalitasHub } from './components/LegalitasHub';
import { AdvertisingModal } from './components/AdvertisingModal';
import { AdBanner } from './components/AdBanner';
import { SavedArticlesDrawer } from './components/SavedArticlesDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NewsletterBanner } from './components/NewsletterBanner';
import { WartaNotificationWidget } from './components/WartaNotificationWidget';
import { TerkiniGoogleSection } from './components/TerkiniGoogleSection';
import { WeatherForecastWidget } from './components/WeatherForecastWidget';
import { applyPortalTheme, DEFAULT_PORTAL_THEME } from './utils/themeEngine';
import { Footer } from './components/Footer';
import { BoxRedaksiModal } from './components/editorial/BoxRedaksiModal';
import { 
  saveArticleToIndexedDB, 
  removeArticleFromIndexedDB, 
  syncSavedArticlesToIndexedDB, 
  getAllOfflineArticlesFromIndexedDB 
} from './utils/offlineStorage';
import { EditorialLogin } from './components/editorial/EditorialLogin';
import { EditorialDashboard } from './components/editorial/EditorialDashboard';
import { 
  LayoutGrid, 
  List, 
  SlidersHorizontal, 
  X, 
  Flame, 
  Clock, 
  Eye, 
  Sparkles, 
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  Radio,
  ExternalLink,
  ChevronUp,
  Minimize2,
  FileQuestion
} from 'lucide-react';

const isWithinTimeRange = (publishedAt: string, range: 'all' | '24h' | '7d' | '30d') => {
  if (range === 'all') return true;
  
  const text = publishedAt.toLowerCase();
  
  // Minutes ago (e.g., '15 Menit Lalu')
  if (text.includes('menit')) {
    return true;
  }
  
  // Hours ago (e.g., '2 jam lalu' or '5 Jam Lalu')
  if (text.includes('jam')) {
    const match = text.match(/(\d+)\s*jam/);
    if (match) {
      const hours = parseInt(match[1], 10);
      if (range === '24h') return hours <= 24;
      return true;
    }
    return true;
  }
  
  // Days ago (e.g., '1 hari lalu' or '2 Hari Lalu')
  if (text.includes('hari')) {
    const match = text.match(/(\d+)\s*hari/);
    if (match) {
      const days = parseInt(match[1], 10);
      if (range === '24h') return false;
      if (range === '7d') return days <= 7;
      if (range === '30d') return days <= 30;
    }
    if (range === '24h') return false;
    return true;
  }
  
  // Explicit Date Fallback (e.g., '14 Agustus 2026' with today assumed as August 15, 2026)
  if (text.includes('agustus 2026') || text.includes('agustus')) {
    const matchDay = text.match(/(\d+)\s+agustus/);
    if (matchDay) {
      const day = parseInt(matchDay[1], 10);
      const diff = 15 - day; // today is August 15th
      if (range === '24h') return diff <= 0;
      if (range === '7d') return diff >= 0 && diff <= 7;
      if (range === '30d') return diff >= 0 && diff <= 30;
    }
  }
  
  if (range === '24h') return false;
  return true;
};

export default function App() {
  // -------------------------------------------------------------
  // 1. ROUTING & EDITORIAL AUTH STATE
  // -------------------------------------------------------------
  const [currentPath, setCurrentPath] = useState<string>(() => typeof window !== 'undefined' ? window.location.pathname : '');
  const [currentHash, setCurrentHash] = useState<string>(() => typeof window !== 'undefined' ? window.location.hash : '');
  const [editorialUser, setEditorialUser] = useState<EditorialUser | null>(() => {
    const saved = localStorage.getItem('wartakini_editorial_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentPath(window.location.pathname || '');
      setCurrentHash(window.location.hash || '');
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const isEditorialRoute = useMemo(() => {
    const cleanHash = currentHash.toLowerCase().replace(/^#\/?/, '');
    const cleanPath = currentPath.toLowerCase().replace(/^\/+|\/+$/g, '');
    return (
      cleanHash === 'redaksi' ||
      cleanHash === 'admin' ||
      cleanHash === 'editor' ||
      cleanHash === 'cms' ||
      cleanHash === 'login' ||
      cleanHash.startsWith('redaksi') ||
      cleanHash.startsWith('admin') ||
      cleanHash.startsWith('cms') ||
      cleanHash.startsWith('editor') ||
      cleanPath === 'admin' ||
      cleanPath === 'redaksi' ||
      cleanPath === 'editor' ||
      cleanPath === 'cms' ||
      cleanPath === 'login'
    );
  }, [currentHash, currentPath]);

  const navigateToEditorial = () => {
    window.location.hash = '#/admin';
    setCurrentHash('#/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPublicPortal = () => {
    window.location.hash = '';
    setCurrentHash('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditorialLoginSuccess = (user: EditorialUser) => {
    setEditorialUser(user);
    localStorage.setItem('wartakini_editorial_user', JSON.stringify(user));
    showToast(`Selamat datang di Meja Redaksi, ${user.name}!`);
  };

  const handleEditorialLogout = () => {
    setEditorialUser(null);
    localStorage.removeItem('wartakini_editorial_user');
    showToast('Sesi Meja Redaksi telah ditutup.');
  };

  // -------------------------------------------------------------
  // 2. CENTRAL PERSISTED DATA STATE
  // -------------------------------------------------------------
  // Articles
  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    let serverArt: NewsArticle | null = null;
    if (typeof window !== 'undefined' && (window as any).__SERVER_ARTICLE__) {
      serverArt = (window as any).__SERVER_ARTICLE__;
    }

    const saved = localStorage.getItem('wartakini_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (serverArt && !parsed.some((a: any) => a.id === serverArt!.id)) {
            parsed.unshift(serverArt);
          }
          const hasAkpersi = parsed.some((a: any) => a.category === 'akpersi');
          if (!hasAkpersi) {
            const akpersiArticles = INITIAL_ARTICLES.filter((a) => a.category === 'akpersi');
            return [...parsed, ...akpersiArticles];
          }
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse cached articles, using defaults:', e);
      }
    }

    if (serverArt) {
      return [serverArt, ...INITIAL_ARTICLES.filter((a) => a.id !== serverArt!.id)];
    }
    return INITIAL_ARTICLES;
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('wartakini_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep all existing and custom categories; add missing defaults non-destructively
          const missingDefaults = CATEGORIES.filter(c => !parsed.some(p => p.id === c.id));
          if (missingDefaults.length > 0) {
            return [...parsed, ...missingDefaults];
          }
          return parsed;
        }
      } catch (e) {
        return CATEGORIES;
      }
    }
    return CATEGORIES;
  });

  // Weather Cities
  const [weatherCities, setWeatherCities] = useState<WeatherInfo[]>(() => {
    const saved = localStorage.getItem('wartakini_weather');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return WEATHER_CITIES; }
    }
    return WEATHER_CITIES;
  });

  // Trending Topics
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>(() => {
    const saved = localStorage.getItem('wartakini_trending');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return TRENDING_TOPICS; }
    }
    return TRENDING_TOPICS;
  });

  // Poll
  const [pollData, setPollData] = useState<PollData>(() => {
    const saved = localStorage.getItem('wartakini_poll');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_POLL; }
    }
    return INITIAL_POLL;
  });

  // Editorial Pieces / Columnists
  const [editorialPieces, setEditorialPieces] = useState<EditorialPiece[]>(() => {
    const saved = localStorage.getItem('wartakini_editorial_pieces');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return EDITORIAL_PIECES; }
    }
    return EDITORIAL_PIECES;
  });

  // Video News
  const [videoNews, setVideoNews] = useState<VideoNews[]>(() => {
    const saved = localStorage.getItem('wartakini_video_news');
    if (saved) {
      try {
        const parsed: VideoNews[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => {
            const fallback = VIDEO_NEWS[idx % VIDEO_NEWS.length];
            return {
              ...fallback,
              ...item,
              videoUrl: item.videoUrl || fallback?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
            };
          });
        }
        return VIDEO_NEWS;
      } catch (e) {
        return VIDEO_NEWS;
      }
    }
    return VIDEO_NEWS;
  });

  // Photo Stories
  const [photoStories, setPhotoStories] = useState<PhotoStory[]>(() => {
    const saved = localStorage.getItem('wartakini_photo_stories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return PHOTO_STORIES; }
    }
    return PHOTO_STORIES;
  });

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('wartakini_site_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.portalName === 'WartaKini' || parsed.portalName === 'Warta Nusantara' || parsed.portalName === 'Portal Warta Nusantara' || parsed.portalName === 'Kabar Nusantara') {
          parsed.portalName = 'Arun News';
        }
        if (
          !parsed.portalTagline ||
          parsed.portalTagline.toLowerCase().includes('portal berita terpercaya') ||
          parsed.portalTagline.toLowerCase().includes('warta nusantara') ||
          parsed.portalTagline === 'Portal Berita Terpercaya' ||
          parsed.portalTagline === 'Portal Berita Terpercaya & Berimbang'
        ) {
          parsed.portalTagline = 'Jembatan Informasi Nusantara';
        }
        if (parsed.editorialEmail === 'redaksi@wartakini.id') {
          parsed.editorialEmail = 'redaksi@arunnews.id';
        }
        if (parsed.officeAddress && (parsed.officeAddress.includes('Graha Pers') || parsed.officeAddress.includes('Gedung Graha Pers'))) {
          parsed.officeAddress = 'Gg gaya, pasar minggu, kec, pasar minggu, kota jakarta selatan, provinsi DKI JAKARTA, Indonesia';
        }
        if (parsed.hotlinePhone === '+62 812-5550-0826' || parsed.hotlinePhone === '(021) 555-0826' || parsed.hotlinePhone === '+62 812-5550-0826') {
          parsed.hotlinePhone = '0895626941900';
        }
        if (!parsed.editorialBoard || parsed.editorialBoard.length === 0) {
          parsed.editorialBoard = INITIAL_EDITORIAL_BOARD;
        }
        if (!parsed.officialContacts) {
          parsed.officialContacts = INITIAL_OFFICIAL_CONTACTS;
        } else {
          if (parsed.officialContacts.officeAddress && (parsed.officialContacts.officeAddress.includes('Graha Pers') || parsed.officialContacts.officeAddress.includes('Gedung Graha Pers'))) {
            parsed.officialContacts.officeAddress = 'Gg gaya, pasar minggu, kec, pasar minggu, kota jakarta selatan, provinsi DKI JAKARTA, Indonesia';
          }
          if (parsed.officialContacts.hotlineWhatsapp === '+62 812-5550-0826' || parsed.officialContacts.hotlineWhatsapp === '0812-5550-0826' || parsed.officialContacts.hotlineWhatsapp === '0812-0000-0000') {
            parsed.officialContacts.hotlineWhatsapp = '0895626941900';
          }
          if (parsed.officialContacts.officePhone === '(021) 555-0826 / (021) 555-0827' || parsed.officialContacts.officePhone === '(021) 555-0826' || parsed.officialContacts.officePhone === '+62 812-5550-0826') {
            parsed.officialContacts.officePhone = '0895626941900';
          }
        }
        if (!parsed.portalThemeSettings) {
          parsed.portalThemeSettings = DEFAULT_PORTAL_THEME;
        }
        if (!parsed.bankAccountForAds) {
          parsed.bankAccountForAds = DEFAULT_AD_BANK_ACCOUNT;
        }
        if (!parsed.adBankAccounts || parsed.adBankAccounts.length === 0) {
          parsed.adBankAccounts = DEFAULT_AD_BANK_ACCOUNTS;
        }
        if (!parsed.legalitasSettings) {
          parsed.legalitasSettings = DEFAULT_LEGALITAS_SETTINGS;
        }
        if (parsed.moduleToggles) {
          parsed.moduleToggles.showTicker = true;
        }
        return parsed;
      } catch (e) {
        return INITIAL_SITE_SETTINGS;
      }
    }
    return INITIAL_SITE_SETTINGS;
  });

  // Transport Schedules
  const [transportSchedules, setTransportSchedules] = useState<TransportSchedule[]>(() => {
    const saved = localStorage.getItem('wartakini_transport_schedules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_TRANSPORT_SCHEDULES; }
    }
    return INITIAL_TRANSPORT_SCHEDULES;
  });

  // Ticker Settings (Running text berita headline aktif streaming berita, tanpa teks tulisan 'running text')
  const [tickerSettings, setTickerSettings] = useState<TickerSettings>(() => {
    const saved = localStorage.getItem('wartakini_ticker_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.customMessage && parsed.customMessage.includes('WARTAKINI')) {
          parsed.customMessage = parsed.customMessage.replace(/WARTAKINI/g, 'ARUN NEWS');
        }
        return { ...parsed, isEnabled: true };
      } catch (e) {
        return { ...INITIAL_TICKER_SETTINGS, isEnabled: true };
      }
    }
    return { ...INITIAL_TICKER_SETTINGS, isEnabled: true };
  });

  // Saved Bookmarks
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('wartakini_bookmarks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Read Articles History
  const [readArticleIds, setReadArticleIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('wartakini_read_articles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Saved Reading Scroll Progress Map (article.id -> progress 0-100)
  const [readingProgressMap, setReadingProgressMap] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('wartakini_reading_progress');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  // Online/Offline Network Status
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to Firebase Firestore Database with Real-time listener and Reconnect handler
  const [dbState, setDbState] = useState<{
    status: 'connected' | 'connecting' | 'offline';
    info?: string;
  }>({
    status: 'connecting',
    info: 'Menghubungkan ke Firebase Firestore...'
  });

  const connectFirestoreDB = async () => {
    setDbState({ status: 'connecting', info: 'Menghubungkan ke Firebase Firestore...' });
    try {
      const health = await checkDBHealth();
      if (health && health.status === 'ok') {
        // Load & synchronize categories with Firestore
        const dbCategories = await fetchCategoriesFromDB();
        let localCats: Category[] = [];
        try {
          const rawCats = localStorage.getItem('wartakini_categories');
          if (rawCats) localCats = JSON.parse(rawCats);
        } catch {}

        if (dbCategories && dbCategories.length > 0) {
          const dbCatIds = new Set(dbCategories.map(c => c.id));
          const missingInDb = localCats.filter(c => !dbCatIds.has(c.id));
          for (const c of missingInDb) {
            await saveCategoryToDB(c);
          }
          const mergedCats = [...dbCategories, ...missingInDb];
          setCategories(mergedCats);
          try {
            localStorage.setItem('wartakini_categories', JSON.stringify(mergedCats));
          } catch {}
        } else {
          const toSeedCats = localCats.length > 0 ? localCats : CATEGORIES;
          await seedCategoriesToDB(toSeedCats);
        }

        // Load & synchronize site settings with Firestore
        try {
          const dbSettings = await fetchSiteSettingsFromDB();
          if (dbSettings) {
            setSiteSettings(prev => ({
              ...prev,
              ...dbSettings,
              bankAccountForAds: dbSettings.bankAccountForAds || prev.bankAccountForAds || DEFAULT_AD_BANK_ACCOUNT,
              adBankAccounts: (dbSettings.adBankAccounts && dbSettings.adBankAccounts.length > 0) ? dbSettings.adBankAccounts : (prev.adBankAccounts || DEFAULT_AD_BANK_ACCOUNTS),
              legalitasSettings: dbSettings.legalitasSettings || prev.legalitasSettings || DEFAULT_LEGALITAS_SETTINGS,
            }));
          }
        } catch (e) {
          console.warn('Error fetching remote site settings:', e);
        }

        const dbArticles = await fetchArticlesFromDB();

        // Read local storage to ensure newly uploaded or modified articles are never lost
        let localArticles: NewsArticle[] = [];
        try {
          const raw = localStorage.getItem('wartakini_articles');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localArticles = parsed;
          }
        } catch (e) {
          console.warn('Error reading local articles:', e);
        }

        if (dbArticles && dbArticles.length > 0) {
          const dbIdSet = new Set(dbArticles.map((a) => a.id));
          // Identify articles present locally that have not yet reached Firestore
          const pendingUploads = localArticles.filter((a) => !dbIdSet.has(a.id));

          // Asynchronously push any pending local articles to Firestore
          if (pendingUploads.length > 0) {
            for (const art of pendingUploads) {
              saveArticleToDB(art).catch(console.warn);
            }
          }

          // Combine with local pending articles on top, followed by database articles
          const combined = [...pendingUploads, ...dbArticles];
          setArticles(combined);
          try {
            localStorage.setItem('wartakini_articles', JSON.stringify(combined));
          } catch (e) {
            console.warn('LocalStorage save error:', e);
          }
        } else {
          // If Firestore is empty, seed with current local articles (including uploads) or INITIAL_ARTICLES
          const toSeed = localArticles.length > 0 ? localArticles : INITIAL_ARTICLES;
          for (const art of toSeed) {
            await saveArticleToDB(art).catch(console.warn);
          }
          setArticles(toSeed);
          try {
            localStorage.setItem('wartakini_articles', JSON.stringify(toSeed));
          } catch (e) {
            console.warn('LocalStorage save error:', e);
          }
        }
        showToast('🟢 Terhubung ke Basis Data Firebase Firestore!');
      } else {
        setDbState({ status: 'offline', info: 'Firestore Offline' });
      }
    } catch (err) {
      console.warn('Firebase Firestore connection error:', err);
      setDbState({ status: 'offline', info: 'Gagal terhubung ke Firestore' });
    }
  };

  useEffect(() => {
    connectFirestoreDB();
    const unsub = subscribeArticlesFromDB((updated) => {
      if (updated && updated.length > 0) {
        setArticles((prev) => {
          const dbIdSet = new Set(updated.map((a) => a.id));
          // Keep any newly added local articles that aren't yet in the remote snapshot
          const localOnly = prev.filter((a) => !dbIdSet.has(a.id));
          return [...localOnly, ...updated];
        });
        setDbState({ status: 'connected', info: 'Firebase Firestore (Realtime Sync)' });
      }
    });
    return () => {
      unsub();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wartakini_articles', JSON.stringify(articles));
    } catch (e) {
      console.warn('Error saving articles to localStorage (quota exceeded?):', e);
    }
  }, [articles]);
  useEffect(() => { localStorage.setItem('wartakini_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('wartakini_weather', JSON.stringify(weatherCities)); }, [weatherCities]);
  useEffect(() => { localStorage.setItem('wartakini_trending', JSON.stringify(trendingTopics)); }, [trendingTopics]);
  useEffect(() => { localStorage.setItem('wartakini_poll', JSON.stringify(pollData)); }, [pollData]);
  useEffect(() => { localStorage.setItem('wartakini_editorial_pieces', JSON.stringify(editorialPieces)); }, [editorialPieces]);
  useEffect(() => { localStorage.setItem('wartakini_video_news', JSON.stringify(videoNews)); }, [videoNews]);
  useEffect(() => { localStorage.setItem('wartakini_photo_stories', JSON.stringify(photoStories)); }, [photoStories]);
  useEffect(() => { 
    localStorage.setItem('wartakini_site_settings', JSON.stringify(siteSettings)); 
    saveSiteSettingsToDB(siteSettings).catch(() => {});
  }, [siteSettings]);
  useEffect(() => { localStorage.setItem('wartakini_ticker_settings', JSON.stringify(tickerSettings)); }, [tickerSettings]);
  useEffect(() => { localStorage.setItem('wartakini_transport_schedules', JSON.stringify(transportSchedules)); }, [transportSchedules]);
  useEffect(() => { localStorage.setItem('wartakini_bookmarks', JSON.stringify(savedArticleIds)); }, [savedArticleIds]);
  useEffect(() => { localStorage.setItem('wartakini_read_articles', JSON.stringify(readArticleIds)); }, [readArticleIds]);
  useEffect(() => { localStorage.setItem('wartakini_reading_progress', JSON.stringify(readingProgressMap)); }, [readingProgressMap]);

  // Real-time apply portal theme colors and dynamic CSS variables
  useEffect(() => {
    applyPortalTheme(siteSettings.portalThemeSettings || DEFAULT_PORTAL_THEME);
  }, [siteSettings.portalThemeSettings]);

  // -------------------------------------------------------------
  // ARTICLE MODAL & DEEP LINK RESOLUTION STATE
  // -------------------------------------------------------------
  const [selectedArticleForModal, setSelectedArticleForModal] = useState<NewsArticle | null>(() => {
    if (typeof window !== 'undefined' && (window as any).__SERVER_ARTICLE__) {
      return (window as any).__SERVER_ARTICLE__;
    }
    return null;
  });
  const [articleNotFoundSlug, setArticleNotFoundSlug] = useState<string | null>(null);
  const [isResolvingArticleUrl, setIsResolvingArticleUrl] = useState<boolean>(false);

  const handleUpdateReadProgress = (articleId: string, progress: number) => {
    setReadingProgressMap((prev) => {
      const current = prev[articleId] || 0;
      if (progress > current || Math.abs(progress - current) >= 2) {
        return { ...prev, [articleId]: progress };
      }
      return prev;
    });
    if (!readArticleIds.includes(articleId)) {
      setReadArticleIds((prev) => [...prev, articleId]);
    }
  };

  const handleSelectArticle = (article: NewsArticle) => {
    setSelectedArticleForModal(article);
    setArticleNotFoundSlug(null);
    const target = encodeURIComponent(article.slug || article.id);
    try {
      window.history.pushState('', article.title, `/article/${target}`);
      setCurrentPath(`/article/${target}`);
    } catch {}
    if (!readArticleIds.includes(article.id)) {
      setReadArticleIds((prev) => [...prev, article.id]);
    }
  };

  const handleCloseArticleModal = () => {
    setSelectedArticleForModal(null);
    setArticleNotFoundSlug(null);
    setIsResolvingArticleUrl(false);

    try {
      const hasArticleHash = (window.location.hash || '').toLowerCase().includes('article') || (window.location.hash || '').toLowerCase().includes('berita');
      const hasArticlePath = (window.location.pathname || '').match(/^\/(?:article|artikel|berita|warta|baca|news)/i);
      const hasArticleQuery = (window.location.search || '').match(/[?&](?:article|berita|warta|slug)=/i);

      if (hasArticleHash || hasArticlePath || hasArticleQuery) {
        const cleanSearch = (window.location.search || '')
          .replace(/[?&](?:article|berita|warta|slug)=[^&]*/gi, '')
          .replace(/^\?&/, '?')
          .replace(/^&/, '');
        const newUrl = '/' + (cleanSearch && cleanSearch !== '?' ? cleanSearch : '');
        window.history.pushState('', document.title, newUrl);
        setCurrentHash('');
        setCurrentPath('/');
      }
    } catch {}
  };

  // Helper to extract article target identifier from URL pathname, hash, or search query params
  const getArticleTargetFromLocation = (): string | null => {
    if (typeof window === 'undefined') return null;

    // 1. Search Query Parameters (?article=... or ?berita=... or ?id=... or ?slug=...)
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const queryTarget =
        searchParams.get('article') ||
        searchParams.get('berita') ||
        searchParams.get('warta') ||
        searchParams.get('id') ||
        searchParams.get('slug');
      if (queryTarget && queryTarget.trim()) {
        return decodeURIComponent(queryTarget.trim());
      }
    } catch {}

    // 2. Hash (#/article/... or #article/...)
    const hash = window.location.hash || '';
    const hashMatch = hash.match(/#\/?(?:article|artikel|berita|warta|baca|news)[-/]([^?&]+)/i);
    if (hashMatch && hashMatch[1]) {
      try {
        return decodeURIComponent(hashMatch[1]).trim();
      } catch {
        return hashMatch[1].trim();
      }
    }

    // 3. Pathname (/article/... or /artikel/... or /berita/... or /warta/... or /baca/... or /news/...)
    const path = window.location.pathname || '';
    const pathMatch = path.match(/^\/(?:article|artikel|berita|warta|baca|news)\/([^/?&#]+)/i);
    if (pathMatch && pathMatch[1]) {
      try {
        return decodeURIComponent(pathMatch[1]).trim();
      } catch {
        return pathMatch[1].trim();
      }
    }

    return null;
  };

  // Auto-open article if URL (path, hash, or query) points to an article
  useEffect(() => {
    const target = getArticleTargetFromLocation();
    if (!target) return;

    const cleanTarget = target.trim().replace(/^\/+|\/+$/g, '');
    const cleanLower = cleanTarget.toLowerCase();

    // 0. Avoid re-resolving if currently open modal already displays this exact article
    if (selectedArticleForModal) {
      const curId = (selectedArticleForModal.id || '').toLowerCase();
      const curSlug = (selectedArticleForModal.slug || '').toLowerCase();
      if (
        curId === cleanLower ||
        curSlug === cleanLower ||
        curId.replace('art-', '') === cleanLower.replace('art-', '')
      ) {
        return;
      }
    }

    // 1. Check window.__SERVER_ARTICLE__ (preloaded during SSR / server route: 0ms)
    if (typeof window !== 'undefined' && (window as any).__SERVER_ARTICLE__) {
      const sArt = (window as any).__SERVER_ARTICLE__;
      const sId = (sArt.id || '').toLowerCase();
      const sSlug = (sArt.slug || '').toLowerCase();
      if (
        sId === cleanLower ||
        sSlug === cleanLower ||
        sId.replace('art-', '') === cleanLower.replace('art-', '') ||
        (cleanLower.length > 5 && sSlug.includes(cleanLower))
      ) {
        setSelectedArticleForModal(sArt);
        setArticleNotFoundSlug(null);
        setIsResolvingArticleUrl(false);
        return;
      }
    }

    // 2. Check local articles state first (exact match, slug match, or partial slug)
    const found = articles.find((a) => {
      const aId = (a.id || '').toLowerCase();
      const aSlug = (a.slug || '').toLowerCase();
      return (
        aId === cleanLower ||
        aSlug === cleanLower ||
        aId.replace('art-', '') === cleanLower.replace('art-', '') ||
        aSlug.replace(/\.html?$/i, '') === cleanLower.replace(/\.html?$/i, '') ||
        (cleanLower.length > 5 && aSlug.includes(cleanLower)) ||
        (cleanLower.length > 5 && cleanLower.includes(aSlug))
      );
    });

    if (found) {
      setSelectedArticleForModal(found);
      setArticleNotFoundSlug(null);
      setIsResolvingArticleUrl(false);
      showToast(`📰 Membuka warta dari tautan sumber: "${found.title}"`);
      return;
    }

    // 3. Fast Parallel Fetch from Database & Cache without blocking or delay
    setIsResolvingArticleUrl(true);

    fetchArticleByIdFromDB(cleanTarget)
      .then((dbArt) => {
        if (dbArt) {
          setArticles((prev) => {
            if (prev.some((a) => a.id === dbArt.id)) return prev;
            return [dbArt, ...prev];
          });
          setSelectedArticleForModal(dbArt);
          setArticleNotFoundSlug(null);
          setIsResolvingArticleUrl(false);
          showToast(`📰 Membuka warta dari tautan sumber: "${dbArt.title}"`);
          return;
        }

        // 4. Check static INITIAL_ARTICLES as definitive safety net
        const staticFound = INITIAL_ARTICLES.find((a) => {
          const aId = (a.id || '').toLowerCase();
          const aSlug = (a.slug || '').toLowerCase();
          return (
            aId === cleanLower ||
            aSlug === cleanLower ||
            aId.replace('art-', '') === cleanLower.replace('art-', '') ||
            (cleanLower.length > 5 && aSlug.includes(cleanLower)) ||
            (cleanLower.length > 5 && cleanLower.includes(aSlug))
          );
        });

        if (staticFound) {
          setSelectedArticleForModal(staticFound);
          setArticleNotFoundSlug(null);
          setIsResolvingArticleUrl(false);
          showToast(`📰 Membuka warta: "${staticFound.title}"`);
          return;
        }

        // Penting: Jangan timpa URL atau alihkan ke warta headline lain jika warta spesifik ini tidak ditemukan!
        // Tampilkan 404 Not Found dengan URL asli tetap utuh di browser agar pengguna tahu status tautan aslinya.
        setIsResolvingArticleUrl(false);
        setArticleNotFoundSlug(cleanTarget);
      })
      .catch((err) => {
        console.warn('Article link resolution error:', err);
        const staticFound = INITIAL_ARTICLES.find((a) => {
          const aId = (a.id || '').toLowerCase();
          const aSlug = (a.slug || '').toLowerCase();
          return aId === cleanLower || aSlug === cleanLower || (cleanLower.length > 5 && aSlug.includes(cleanLower));
        });
        if (staticFound) {
          setSelectedArticleForModal(staticFound);
          setArticleNotFoundSlug(null);
          setIsResolvingArticleUrl(false);
          showToast(`📰 Membuka warta: "${staticFound.title}"`);
          return;
        }
        setIsResolvingArticleUrl(false);
        setArticleNotFoundSlug(cleanTarget);
      });
  }, [currentHash, currentPath]);

  // Automated background scheduler for scheduled publication
  // Changes status 'pending' to 'published' automatically when scheduledPublishAt <= now
  useEffect(() => {
    const checkScheduledArticles = () => {
      const now = new Date();
      setArticles((prev) => {
        let changed = false;
        const updated = prev.map((art) => {
          if (art.status === 'pending' && art.scheduledPublishAt) {
            const schedTime = new Date(art.scheduledPublishAt).getTime();
            if (schedTime <= now.getTime()) {
              changed = true;
              return {
                ...art,
                status: 'published' as const,
                publishedAt: 'Baru Saja Terbit • Redaksi',
              };
            }
          }
          return art;
        });
        if (changed) {
          showToast('📰 Berita terjadwal telah otomatis terbit (Status: Published)!');
          return updated;
        }
        return prev;
      });
    };

    checkScheduledArticles();
    const interval = setInterval(checkScheduledArticles, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleResetAllData = () => {
    if (window.confirm('Reset semua artikel dan pengaturan ke bawaan awal? Tindakan ini tidak dapat dibatalkan.')) {
      setArticles(INITIAL_ARTICLES);
      setCategories(CATEGORIES);
      setWeatherCities(WEATHER_CITIES);
      setTrendingTopics(TRENDING_TOPICS);
      setPollData(INITIAL_POLL);
      setEditorialPieces(EDITORIAL_PIECES);
      setVideoNews(VIDEO_NEWS);
      setPhotoStories(PHOTO_STORIES);
      setSiteSettings(INITIAL_SITE_SETTINGS);
      setTickerSettings(INITIAL_TICKER_SETTINGS);
      setTransportSchedules(INITIAL_TRANSPORT_SCHEDULES);
      setSavedArticleIds([]);
      localStorage.clear();
      showToast('Seluruh modul dan artikel berhasil direset ke pengaturan awal.');
    }
  };

  // -------------------------------------------------------------
  // 3. PUBLIC PORTAL FILTER & NAVIGATION STATE
  // -------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'terbaru' | 'terpopuler' | 'pembaca'>('terbaru');

  // State Modal Sawer Kopi
  const [isSawerKopiOpen, setIsSawerKopiOpen] = useState<boolean>(false);

  // Real-time Emergency / Breaking Alert Broadcast State
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'emergency' | 'breaking' | 'important';
    articleId?: string;
  } | null>(null);

  useEffect(() => {
    const handleBroadcastEvent = (e: any) => {
      if (e.detail) {
        setActiveEmergencyAlert({
          id: `alert-${Date.now()}`,
          title: e.detail.title || 'Peringatan Darurat',
          message: e.detail.message || '',
          type: e.detail.type || 'emergency',
          articleId: e.detail.articleId
        });
      }
    };

    window.addEventListener('arun-news-broadcast', handleBroadcastEvent);
    return () => {
      window.removeEventListener('arun-news-broadcast', handleBroadcastEvent);
    };
  }, []);
  const [timeRange, setTimeRange] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (window.scrollY > 250) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Modals & Drawers state
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [isCitizenModalOpen, setIsCitizenModalOpen] = useState<boolean>(false);
  const [isBoxRedaksiModalOpen, setIsBoxRedaksiModalOpen] = useState<boolean>(false);
  const [isCyberMediaGuidelinesModalOpen, setIsCyberMediaGuidelinesModalOpen] = useState<boolean>(false);
  const [isAdvertisingModalOpen, setIsAdvertisingModalOpen] = useState<boolean>(false);
  const [guidelinesDefaultTab, setGuidelinesDefaultTab] = useState<'pedoman' | 'kode_etik' | 'privasi' | 'panduan_warga' | 'syarat_ketentuan' | 'disclaimer' | 'hak_cipta'>('pedoman');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenCyberMediaGuidelines = (tab: 'pedoman' | 'kode_etik' | 'privasi' | 'panduan_warga' | 'syarat_ketentuan' | 'disclaimer' | 'hak_cipta' = 'pedoman') => {
    setGuidelinesDefaultTab(tab);
    setIsCyberMediaGuidelinesModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSave = (article: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedArticleIds.includes(article.id)) {
      setSavedArticleIds((prev) => prev.filter((id) => id !== article.id));
      removeArticleFromIndexedDB(article.id);
      showToast(`Warta "${article.title.slice(0, 30)}..." dihapus dari simpanan.`);
    } else {
      setSavedArticleIds((prev) => [...prev, article.id]);
      saveArticleToIndexedDB(article);
      showToast(`Warta "${article.title.slice(0, 30)}..." berhasil disimpan ke IndexedDB (Offline Ready)!`);
    }
  };

  const handleRemoveSaved = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedArticleIds((prev) => prev.filter((id) => id !== articleId));
    removeArticleFromIndexedDB(articleId);
  };

  const handleClearAllSaved = () => {
    if (window.confirm('Kosongkan semua daftar simpanan berita dari IndexedDB?')) {
      savedArticleIds.forEach((id) => removeArticleFromIndexedDB(id));
      setSavedArticleIds([]);
      showToast('Seluruh daftar simpanan berhasil dikosongkan.');
    }
  };

  const handleCitizenSubmit = (newArticle: NewsArticle) => {
    const nextList = [newArticle, ...articles];
    setArticles(nextList);
    try {
      localStorage.setItem('wartakini_articles', JSON.stringify(nextList));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    saveArticleToDB(newArticle).catch(console.warn);
    showToast('Warta warga berhasil diterbitkan ke feed berita!');
  };

  // -------------------------------------------------------------
  // BROWSER NOTIFICATION API LISTENER & DISPATCHER
  // Send browser alert for new 'Headline' or 'Breaking' articles
  // -------------------------------------------------------------
  const notifiedHeadlineBreakingIdsRef = useRef<Set<string>>(new Set());
  const isInitialArticleLoadRef = useRef<boolean>(true);

  useEffect(() => {
    if (isInitialArticleLoadRef.current) {
      articles.forEach((art) => {
        if (art.isHeadline || art.isBreaking) {
          notifiedHeadlineBreakingIdsRef.current.add(art.id);
        }
      });
      isInitialArticleLoadRef.current = false;
      return;
    }

    const isEnabled = localStorage.getItem('arun_news_notifications_enabled') === 'true';
    const hasPermission = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';

    if (isEnabled && hasPermission) {
      articles.forEach((art) => {
        const isTargetType = art.isHeadline || art.isBreaking;
        if (isTargetType && !notifiedHeadlineBreakingIdsRef.current.has(art.id)) {
          notifiedHeadlineBreakingIdsRef.current.add(art.id);

          const typeLabel = art.isBreaking ? '⚡ [BREAKING NEWS]' : '🔥 [BERITA UTAMA]';
          try {
            const notification = new Notification(`${typeLabel} ${art.title}`, {
              body: art.excerpt || `Warta kategori ${art.categoryLabel} baru saja diterbitkan di Arun News.`,
              icon: '/favicon.ico',
              tag: `art-notif-${art.id}`,
            });

            notification.onclick = () => {
              window.focus();
              setSelectedArticleForModal(art);
              notification.close();
            };
          } catch (err) {
            console.warn('Gagal mengirim Notifikasi Browser:', err);
          }
        }
      });
    }
  }, [articles]);

  // Commercial Advertisement Slots & Click Tracker
  const topBillboardSlot = siteSettings.semSettings?.adSlots?.find((s) => s.position === 'top_billboard');
  const sidebarSlot = siteSettings.semSettings?.adSlots?.find((s) => s.position === 'sidebar_sticky');
  const inlineSlot = siteSettings.semSettings?.adSlots?.find((s) => s.position === 'in_article');
  const enableAdPlacements = siteSettings.semSettings?.enableAdPlacements !== false;
  const showAdTransparencyNotice = siteSettings.semSettings?.showAdTransparencyNotice !== false;
  const allowPublicRentButton = siteSettings.semSettings?.allowPublicRentButton !== false;

  const handleTrackAdClick = (slotId: string) => {
    setSiteSettings((prev) => {
      if (!prev.semSettings?.adSlots) return prev;
      const updatedSlots = prev.semSettings.adSlots.map((s) =>
        s.id === slotId ? { ...s, clicks: (s.clicks || 0) + 1 } : s
      );
      return {
        ...prev,
        semSettings: {
          ...prev.semSettings,
          adSlots: updatedSlots,
        },
      };
    });
  };

  const handleSimulateBreakingNews = () => {
    const simId = `sim-breaking-${Date.now()}`;
    const simArticle: NewsArticle = {
      id: simId,
      title: `[BREAKING NEWS] Pusat Layanan Publik Digital Resmi Diluncurkan`,
      slug: `breaking-news-pusat-layanan-publik-digital-${Date.now()}`,
      excerpt: 'Inisiatif terbaru integrasi layanan publik terpadu ramah warga secara daring 24/7 resmi beroperasi hari ini.',
      content: `[WARTA BREAKING]\n\nPemerintah kota hari ini secara resmi meresmikan pusat layanan publik terpadu berbasis digital.\n\nDalam peluncurannya, disampaikan bahwa seluruh kepengurusan dokumen warga kini dapat diakses secara instan dengan transparansi penuh.\n\nFasilitas ini diharapkan meningkatkan efisiensi dan kemudahan akses layanan bagi seluruh masyarakat.`,
      paragraphs: [
        'Pemerintah kota hari ini secara resmi meresmikan pusat layanan publik terpadu berbasis digital.',
        'Dalam peluncurannya, disampaikan bahwa seluruh kepengurusan dokumen warga kini dapat diakses secara instan dengan transparansi penuh.',
        'Fasilitas ini diharapkan meningkatkan efisiensi dan kemudahan akses layanan bagi seluruh masyarakat.'
      ],
      category: 'nasional',
      categoryLabel: 'NASIONAL',
      imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=1200',
      imageCaption: 'Peluncuran Pusat Layanan Digital Terpadu',
      publishedAt: 'Baru Saja',
      readTime: '2 Menit Baca',
      author: DEFAULT_EDITORIAL_USERS[0],
      views: 120,
      likes: 45,
      shares: 12,
      comments: [],
      isBreaking: true,
      isHeadline: true,
      isEditorPick: true,
      tags: ['Breaking', 'LayananPublik', 'Digital', 'Nasional'],
      keyTakeaways: [
        'Integrasi layanan dokumen publik terpadu 24/7',
        'Transparansi penuh tanpa antrean fisik',
        'Kemudahan akses langsung via platform digital'
      ]
    };

    setArticles((prev) => [simArticle, ...prev]);
    showToast('⚡ Warta Breaking simulasi diterbitkan! Cek notifikasi peramban Anda.');
  };

  // Running Text Berita Headline & Breaking News items
  const breakingArticles = useMemo(() => {
    const filtered = articles.filter((a) => a.isBreaking || a.isHeadline);
    if (filtered.length >= 3) return filtered;
    return articles.slice(0, 6);
  }, [articles]);

  // Main featured article & top stories
  const mainArticle = useMemo(() => {
    return articles.find((a) => a.isHeadline) || articles[0];
  }, [articles]);

  const sideArticles = useMemo(() => {
    return articles.filter((a) => a.id !== mainArticle?.id).slice(0, 3);
  }, [articles, mainArticle]);

  // Trending articles
  const trendingArticles = useMemo(() => {
    return [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [articles]);

  // Filtered & Sorted Articles (Public feed only displays published articles)
  const filteredArticles = useMemo(() => {
    let list = articles.filter((a) => !a.status || a.status === 'published');

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter((a) => a.category === selectedCategory);
    }

    // Filter by Time Range (Aktualitas Waktu)
    if (timeRange !== 'all') {
      list = list.filter((a) => isWithinTimeRange(a.publishedAt, timeRange));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.categoryLabel.toLowerCase().includes(q) ||
          a.author.name.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'terpopuler') {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'pembaca') {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return list;
  }, [articles, selectedCategory, searchQuery, sortBy, timeRange]);

  // Saved articles objects
  const savedArticlesList = useMemo(() => {
    return articles.filter((a) => savedArticleIds.includes(a.id));
  }, [articles, savedArticleIds]);

  // Sync Saved Articles to IndexedDB for offline access
  useEffect(() => {
    if (savedArticlesList.length > 0) {
      syncSavedArticlesToIndexedDB(savedArticlesList);
    }
  }, [savedArticlesList]);

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

  // -------------------------------------------------------------
  // 4. CONDITIONAL RENDERING: EDITORIAL ROUTE VS PUBLIC PORTAL
  // -------------------------------------------------------------
  if (isEditorialRoute) {
    if (!editorialUser) {
      return (
        <EditorialLogin
          siteSettings={siteSettings}
          onLoginSuccess={handleEditorialLoginSuccess}
          onBackToPublicPortal={navigateToPublicPortal}
        />
      );
    }

    return (
      <EditorialDashboard
        currentUser={editorialUser}
        onLogout={handleEditorialLogout}
        onBackToPublicPortal={navigateToPublicPortal}
        articles={articles}
        setArticles={setArticles}
        categories={categories}
        setCategories={setCategories}
        weatherCities={weatherCities}
        setWeatherCities={setWeatherCities}
        trendingTopics={trendingTopics}
        setTrendingTopics={setTrendingTopics}
        pollData={pollData}
        setPollData={setPollData}
        editorialPieces={editorialPieces}
        setEditorialPieces={setEditorialPieces}
        videoNews={videoNews}
        setVideoNews={setVideoNews}
        photoStories={photoStories}
        setPhotoStories={setPhotoStories}
        siteSettings={siteSettings}
        setSiteSettings={setSiteSettings}
        tickerSettings={tickerSettings}
        setTickerSettings={setTickerSettings}
        transportSchedules={transportSchedules}
        setTransportSchedules={setTransportSchedules}
        onResetAllData={handleResetAllData}
        showToast={showToast}
      />
    );
  }

  // -------------------------------------------------------------
  // 5. PUBLIC NEWS PORTAL VIEW
  // -------------------------------------------------------------
  return (
    <div id="wartakini-app-root" className="min-h-screen flex flex-col bg-gradient-to-b from-sky-950 via-slate-900 to-sky-950 text-slate-900 selection:bg-yellow-400 selection:text-sky-950">
      
      {/* 0. Live Real-Time Push Notification & Emergency Broadcast Alert */}
      {activeEmergencyAlert && (
        <div id="live-emergency-broadcast-alert" className={`px-4 py-3 text-white text-xs shadow-lg border-b-2 transition-all animate-in slide-in-from-top-4 duration-300 ${
          activeEmergencyAlert.type === 'emergency'
            ? 'bg-gradient-to-r from-red-700 via-rose-600 to-red-800 border-red-900'
            : activeEmergencyAlert.type === 'breaking'
            ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-sky-950 border-amber-800'
            : 'bg-gradient-to-r from-sky-900 via-indigo-900 to-sky-950 border-sky-700'
        }`}>
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded font-mono font-black text-[10px] uppercase shadow-2xs flex items-center gap-1.5 ${
                activeEmergencyAlert.type === 'emergency'
                  ? 'bg-white text-red-700 animate-pulse'
                  : activeEmergencyAlert.type === 'breaking'
                  ? 'bg-sky-950 text-yellow-400 animate-pulse'
                  : 'bg-white text-sky-900'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {activeEmergencyAlert.type === 'emergency' ? '🔴 SIARAN DARURAT' : activeEmergencyAlert.type === 'breaking' ? '⚡ BREAKING NEWS' : '📢 WARTA PENTING'}
              </span>
              <div>
                <span className="font-bold mr-1.5">{activeEmergencyAlert.title}:</span>
                <span className="opacity-90">{activeEmergencyAlert.message}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              {activeEmergencyAlert.articleId && (
                <button
                  onClick={() => {
                    const targetArt = articles.find(a => a.id === activeEmergencyAlert.articleId);
                    if (targetArt) {
                      handleSelectArticle(targetArt);
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                    activeEmergencyAlert.type === 'breaking'
                      ? 'bg-sky-950 text-white hover:bg-sky-900'
                      : 'bg-white text-red-700 hover:bg-red-50'
                  }`}
                >
                  Baca Warta Lengkap &rarr;
                </button>
              )}
              <button
                onClick={() => setActiveEmergencyAlert(null)}
                className="p-1 rounded-lg hover:bg-black/20 text-white/80 hover:text-white transition-colors"
                title="Tutup Peringatan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 0.1 Emergency Alert Banner (Configurable in Editorial CMS) */}
      {siteSettings.showEmergencyBanner && !activeEmergencyAlert && (
        <div id="emergency-alert-banner" className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between border-b-2 border-red-700 shadow-md">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-300 animate-bounce flex-shrink-0" />
              <span>{siteSettings.emergencyBannerText}</span>
            </div>
            <button
              onClick={() => setSiteSettings({ ...siteSettings, showEmergencyBanner: false })}
              className="text-white/80 hover:text-white p-1"
              title="Tutup Peringatan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Top Bar */}
      {siteSettings.moduleToggles.showWeather && (
        <TopBar
          weatherCities={weatherCities}
          trendingTopics={trendingTopics}
          onSelectTopic={(tag) => {
            const cleanTag = tag.replace('#', '');
            setSearchQuery(cleanTag);
            window.scrollTo({ top: 250, behavior: 'smooth' });
          }}
          dbStatus={dbState.status}
          dbArticlesCount={articles.length}
          onReconnectDB={connectFirestoreDB}
          siteSettings={siteSettings}
        />
      )}

      {/* 2. Header & Navigation */}
      <Header
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        savedCount={savedArticleIds.length}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        onOpenCitizenModal={() => setIsCitizenModalOpen(true)}
        onOpenSawerKopi={() => setIsSawerKopiOpen(true)}
        siteSettings={siteSettings}
        onNavigateToEditorial={navigateToEditorial}
      />

      {/* 2.1 Berita Berjalan Utama (Langsung di Bawah Navigasi Kategori Portal) */}
      {siteSettings.moduleToggles.showTicker && tickerSettings.isEnabled && (
        <BreakingTicker
          breakingArticles={breakingArticles}
          onSelectArticle={handleSelectArticle}
          tickerSettings={tickerSettings}
        />
      )}

      {/* 2.2 IKLAN PERMANEN HEADER PORTAL (Permanent Billboard Banner Ad) */}
      <PermanentHeaderAd
        slot={topBillboardSlot}
        siteSettings={siteSettings}
        onOpenAdvertisingModal={() => setIsAdvertisingModalOpen(true)}
        onTrackClick={handleTrackAdClick}
      />

      {/* 4. Portal Body Content: Main News Feed */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 pb-24 lg:pb-8 w-full">
        
        {/* Slot Iklan Sisipan Atas Katalog (1200x200) */}
        <AdBanner 
          type="header" 
          slot={topBillboardSlot}
          siteSettings={siteSettings}
          enablePlacements={enableAdPlacements}
          showTransparencyNotice={showAdTransparencyNotice}
          allowPublicRentButton={allowPublicRentButton}
          onTrackClick={handleTrackAdClick}
          onOpenAdvertisingModal={() => setIsAdvertisingModalOpen(true)}
          dimensions="1200 x 200 px"
          price="Rp 2.500.000 / bln"
        />

        {/* If no search query and 'all' category: Display Spotlight Hero & Trending Sections */}
        {!searchQuery && selectedCategory === 'all' && (
          <>
            {/* Headline Hero Section */}
            {siteSettings.moduleToggles.showSpotlightHero && mainArticle && (
              <HeadlineHero
                mainArticle={mainArticle}
                sideArticles={sideArticles}
                onSelectArticle={handleSelectArticle}
                savedArticleIds={savedArticleIds}
                onToggleSave={handleToggleSave}
              />
            )}

            {/* Trending Top 5 Section */}
            {siteSettings.moduleToggles.showTrending && (
              <TrendingSection
                trendingArticles={trendingArticles}
                onSelectArticle={handleSelectArticle}
              />
            )}
          </>
        )}

        {/* Render Dedicated Legalitas Hub when Legalitas category is selected */}
        {selectedCategory === 'legalitas' && (
          <div className="space-y-4 mb-6">
            <div className="rounded-xl overflow-hidden shadow-sm">
              <BreakingTicker
                breakingArticles={
                  articles.filter((a) => a.category === 'legalitas').length > 0
                    ? articles.filter((a) => a.category === 'legalitas')
                    : articles.slice(0, 5)
                }
                onSelectArticle={handleSelectArticle}
                tickerSettings={tickerSettings}
                badgeLabel="KILAS LEGALITAS PERS"
                isCategoryTicker={true}
              />
            </div>
            <LegalitasHub 
              onOpenCyberMediaGuidelinesModal={handleOpenCyberMediaGuidelines} 
              legalitasSettings={siteSettings.legalitasSettings}
              onOpenEditorialSettings={() => {
                navigateToEditorial();
              }}
            />
          </div>
        )}

        {/* Render Dedicated Transport Schedule Section when Transportasi category is selected */}
        {selectedCategory === 'transportasi' && (
          <div className="space-y-4 mb-6">
            <div className="rounded-xl overflow-hidden shadow-sm">
              <BreakingTicker
                breakingArticles={
                  articles.filter((a) => a.category === 'transportasi').length > 0
                    ? articles.filter((a) => a.category === 'transportasi')
                    : articles.slice(0, 5)
                }
                onSelectArticle={handleSelectArticle}
                tickerSettings={tickerSettings}
                badgeLabel="KILAS TRANSPORTASI"
                isCategoryTicker={true}
              />
            </div>
            <TransportScheduleSection schedules={transportSchedules} />
          </div>
        )}

        {/* Search or Category Filter Active Header Banner */}
        {(searchQuery || (selectedCategory !== 'all' && selectedCategory !== 'legalitas' && selectedCategory !== 'transportasi')) && (
          <div className="space-y-3 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-sky-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-yellow-400 text-sky-950 font-black text-xs px-2.5 py-0.5 rounded-md border border-yellow-500 uppercase tracking-wider">
                    {selectedCategory !== 'all' ? currentCategoryObj.name : 'Hasil Pencarian'}
                  </span>
                  <span className="text-xs text-sky-700 font-mono">
                    Ditemukan {filteredArticles.length} warta terkait
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-sky-950">
                  {searchQuery ? `Pencarian: "${searchQuery}"` : currentCategoryObj.description}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 text-xs font-black transition-colors self-start sm:self-auto uppercase tracking-wider border border-sky-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Reset Filter
              </button>
            </div>

            {/* Berita yang Berjalan Khusus di Bawah Halaman Kategori */}
            {selectedCategory !== 'all' && (
              <div className="rounded-xl overflow-hidden shadow-sm">
                <BreakingTicker
                  breakingArticles={
                    filteredArticles.length > 0
                      ? filteredArticles
                      : articles.slice(0, 5)
                  }
                  onSelectArticle={handleSelectArticle}
                  tickerSettings={tickerSettings}
                  badgeLabel={`KILAS ${currentCategoryObj.name.toUpperCase()}`}
                  isCategoryTicker={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Section Header with View Mode and Sort Controls */}
        <section id="articles-feed-section" className="mb-10">
          <div className="bg-gradient-to-r from-sky-950 via-slate-950 to-sky-900 border-2 border-yellow-400/80 p-4 sm:p-5 rounded-2xl shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
            
            {/* Category / Section Title */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center text-sky-950 font-black shadow-md border border-yellow-500">
                <Flame className="w-5 h-5 text-sky-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-yellow-400">
                    {selectedCategory === 'all' && !searchQuery ? 'Katalog Semua Berita Terbaru' : currentCategoryObj.name}
                  </h2>
                </div>
                <p className="text-xs text-sky-200 font-medium">
                  Informasi faktual dan terverifikasi dari reporter Arun News
                </p>
              </div>
            </div>

            {/* Controls: Sort By, Rentang Waktu & View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Rentang Waktu (Time Range) Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-sky-900/90 px-3 py-1.5 rounded-xl border border-sky-700 text-xs shadow-2xs font-mono text-white">
                <Clock className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                <span className="text-sky-200 font-bold hidden sm:inline">Rentang Waktu:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="bg-transparent text-yellow-300 font-black focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all" className="bg-sky-950 text-white">Semua Waktu</option>
                  <option value="24h" className="bg-sky-950 text-white">24 Jam Terakhir</option>
                  <option value="7d" className="bg-sky-950 text-white">7 Hari Terakhir</option>
                  <option value="30d" className="bg-sky-950 text-white">30 Hari Terakhir</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-sky-900/90 px-3 py-1.5 rounded-xl border border-sky-700 text-xs shadow-2xs font-mono text-white">
                <Filter className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-sky-200 font-bold hidden sm:inline">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-yellow-300 font-black focus:outline-none cursor-pointer text-xs"
                >
                  <option value="terbaru" className="bg-sky-950 text-white">Terbaru</option>
                  <option value="pembaca" className="bg-sky-950 text-white">Terpopuler (Views)</option>
                  <option value="terpopuler" className="bg-sky-950 text-white">Terbanyak Disukai</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-sky-200 shadow-2xs">
                <button
                  id="view-grid-btn"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-yellow-400 text-sky-950 shadow-2xs border border-yellow-500'
                      : 'text-sky-700 hover:text-sky-950'
                  }`}
                  title="Tampilan Kisi (Grid)"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  id="view-list-btn"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-yellow-400 text-sky-950 shadow-2xs border border-yellow-500'
                      : 'text-sky-700 hover:text-sky-950'
                  }`}
                  title="Tampilan Daftar (List)"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Main Feed + Sidebar Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Articles Grid / List (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Weather Forecast Widget in Main Feed (uses weatherCities state) */}
              {siteSettings.moduleToggles.showWeather && (
                <WeatherForecastWidget
                  weatherCities={weatherCities}
                  className="mb-1"
                />
              )}

              {filteredArticles.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-sky-200 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center mx-auto mb-4 border border-yellow-500 shadow-xs">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-sky-950 mb-1">
                    Tidak Ada Warta yang Sesuai
                  </h3>
                  <p className="text-xs text-sky-700 max-w-sm mx-auto mb-4 font-medium">
                    Coba gunakan kata kunci pencarian lain atau pilih kategori berita yang berbeda.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-yellow-400 text-sky-950 font-black text-xs hover:bg-yellow-300 transition-colors uppercase tracking-wider border border-yellow-500 shadow-xs"
                  >
                    Lihat Seluruh Berita
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onSelectArticle={handleSelectArticle}
                      isSaved={savedArticleIds.includes(article.id)}
                      onToggleSave={handleToggleSave}
                      layout="grid"
                      isRead={readArticleIds.includes(article.id)}
                      readProgress={readingProgressMap[article.id] || (readArticleIds.includes(article.id) ? 100 : 0)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onSelectArticle={handleSelectArticle}
                      isSaved={savedArticleIds.includes(article.id)}
                      onToggleSave={handleToggleSave}
                      layout="horizontal"
                      isRead={readArticleIds.includes(article.id)}
                      readProgress={readingProgressMap[article.id] || (readArticleIds.includes(article.id) ? 100 : 0)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Portal Sidebar (4 cols) */}
            <aside className="lg:col-span-4 space-y-6 sticky top-24">
              {/* Feature 1: 'Aktifkan Notifikasi Warta' Widget */}
              <WartaNotificationWidget
                onShowToast={showToast}
                onSimulateBreakingNews={handleSimulateBreakingNews}
              />

              {/* Feature: Terkini dari Google via Search Grounding */}
              <TerkiniGoogleSection />

              {/* Feature 2: Sidebar Banner Ad */}
              <AdBanner
                type="sidebar"
                slot={sidebarSlot}
                siteSettings={siteSettings}
                enablePlacements={enableAdPlacements}
                showTransparencyNotice={showAdTransparencyNotice}
                allowPublicRentButton={allowPublicRentButton}
                onTrackClick={handleTrackAdClick}
                onOpenAdvertisingModal={() => setIsAdvertisingModalOpen(true)}
              />
            </aside>

          </div>
        </section>

        {/* Additional Magazine & Multimedia Sections (When in Main Feed) */}
        {!searchQuery && selectedCategory === 'all' && (
          <>
            {/* Slot Iklan Advertorial / Sisipan Tengah (728x90 px) */}
            <AdBanner 
              type="inline"
              slot={inlineSlot}
              siteSettings={siteSettings}
              enablePlacements={enableAdPlacements}
              showTransparencyNotice={showAdTransparencyNotice}
              allowPublicRentButton={allowPublicRentButton}
              onTrackClick={handleTrackAdClick}
              onOpenAdvertisingModal={() => setIsAdvertisingModalOpen(true)}
              dimensions="728 x 90 px"
              price="Rp 3.000.000 / naskah"
              title="Ruang Iklan Advertorial & Sisipan Berita"
              subtitle="Tempat strategis di antara Katalog Warta & Pilihan Redaksi untuk jangkauan pembaca optimal."
            />

            {/* Editor's Pick & Columnist Section */}
            {siteSettings.moduleToggles.showEditorPick && (
              <EditorPickSection
                editorArticles={articles.filter((a) => a.isEditorPick || a.category === 'teknologi')}
                editorialPieces={editorialPieces}
                onSelectArticle={handleSelectArticle}
              />
            )}

            {/* Kuis Berita Harian & Papan Peringkat */}
            <DailyNewsQuiz
              articles={articles}
              onSelectArticle={handleSelectArticle}
            />

            {/* Interactive Poll Component */}
            {siteSettings.moduleToggles.showPoll && (
              <div className="mb-8">
                <InteractivePoll
                  initialPoll={pollData}
                  onVote={(updated) => setPollData(updated)}
                />
              </div>
            )}

            {/* Video News Highlights Section */}
            {siteSettings.moduleToggles.showVideoNews && (
              <VideoNewsSection videos={videoNews} />
            )}

            {/* Photo Journalism Gallery Section */}
            {siteSettings.moduleToggles.showPhotoStories && (
              <PhotoGallerySection photoStories={photoStories} />
            )}

            {/* Newsletter Subscription Banner */}
            {siteSettings.moduleToggles.showNewsletter && (
              <NewsletterBanner />
            )}
          </>
        )}

      </main>

      {/* 4. Footer */}
      <Footer
        categories={categories}
        onSelectCategory={handleSelectCategory}
        siteSettings={siteSettings}
        onOpenCitizenModal={() => setIsCitizenModalOpen(true)}
        onNavigateToEditorial={navigateToEditorial}
        onOpenBoxRedaksiModal={() => setIsBoxRedaksiModalOpen(true)}
        onOpenCyberMediaGuidelinesModal={handleOpenCyberMediaGuidelines}
        onOpenAdvertisingModal={() => setIsAdvertisingModalOpen(true)}
        onOpenSawerKopi={() => setIsSawerKopiOpen(true)}
        savedCount={savedArticleIds.length}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
      />

      {/* Advertising & Partnership Modal */}
      <AdvertisingModal
        isOpen={isAdvertisingModalOpen}
        onClose={() => setIsAdvertisingModalOpen(false)}
        siteSettings={siteSettings}
      />

      {/* Pedoman Media Siber & Etika Jurnalistik Modal */}
      <CyberMediaGuidelinesModal
        isOpen={isCyberMediaGuidelinesModalOpen}
        onClose={() => setIsCyberMediaGuidelinesModalOpen(false)}
        defaultTab={guidelinesDefaultTab}
      />

      {/* Box Redaksi & Susunan Pengelola Modal */}
      <BoxRedaksiModal
        isOpen={isBoxRedaksiModalOpen}
        onClose={() => setIsBoxRedaksiModalOpen(false)}
        siteSettings={siteSettings}
        onOpenCyberMediaGuidelinesModal={handleOpenCyberMediaGuidelines}
      />

      {/* Article Detail Reader Modal */}
      <ArticleModal
        article={selectedArticleForModal}
        onClose={handleCloseArticleModal}
        isSaved={selectedArticleForModal ? savedArticleIds.includes(selectedArticleForModal.id) : false}
        onToggleSave={handleToggleSave}
        fontSize={fontSize}
        onSelectTag={(tag) => setSearchQuery(tag)}
        onSelectRelatedArticle={handleSelectArticle}
        allArticles={articles}
        readArticleIds={readArticleIds}
        onOpenSawerKopi={() => setIsSawerKopiOpen(true)}
      />

      {/* Top loader indicator when resolving article from shared URL */}
      {isResolvingArticleUrl && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-400 text-sky-950 font-bold text-xs py-2 px-4 shadow-md flex items-center justify-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 animate-spin text-sky-900" />
          <span>Membuka warta berita yang dibagikan...</span>
        </div>
      )}

      {/* 404 Not Found Modal for Broken / Deleted Shared Article Links */}
      {articleNotFoundSlug && !selectedArticleForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden text-center p-6 sm:p-8">
            <button
              onClick={handleCloseArticleModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shadow-inner">
              <FileQuestion className="w-9 h-9" />
            </div>

            <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full font-mono text-xs font-black tracking-wider uppercase mb-2">
              Error 404 • Warta Tidak Ditemukan
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-sky-950 tracking-tight mb-2">
              Berita Tidak Dapat Ditemukan
            </h3>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
              Tautan berita yang Anda tuju mungkin telah diperbarui judulnya, dipindahkan ke rubrik lain, atau dihapus oleh Dewan Redaksi.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left mb-6">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Target Tautan:</div>
              <div className="text-xs font-mono text-sky-900 break-all select-all font-semibold">
                {articleNotFoundSlug}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleCloseArticleModal}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-950 hover:bg-sky-900 text-yellow-400 font-bold text-sm transition-all shadow-md cursor-pointer"
              >
                Kembali ke Beranda Arun News
              </button>
            </div>

            {articles.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100 text-left">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Rekomendasi Berita Utama Lainnya:
                </div>
                <div className="space-y-2">
                  {articles.slice(0, 3).map((art) => (
                    <div
                      key={art.id}
                      onClick={() => handleSelectArticle(art)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all cursor-pointer flex items-center gap-3"
                    >
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-sky-950 line-clamp-1 hover:text-yellow-600">
                          {art.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {art.categoryLabel || art.category} • {art.publishedAt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Citizen Journalism Modal */}
      {siteSettings.moduleToggles.allowCitizenJournalism && (
        <CitizenJournalismModal
          isOpen={isCitizenModalOpen}
          onClose={() => setIsCitizenModalOpen(false)}
          categories={categories}
          onSubmitArticle={handleCitizenSubmit}
          onOpenCyberMediaGuidelinesModal={handleOpenCyberMediaGuidelines}
        />
      )}

      {/* Bookmarks & Reading History Drawer */}
      <SavedArticlesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedArticles={savedArticlesList}
        readArticleIds={readArticleIds}
        allArticles={articles}
        onSelectArticle={(art) => setSelectedArticleForModal(art)}
        onRemoveSaved={handleRemoveSaved}
        onClearAll={handleClearAllSaved}
        onClearReadHistory={() => {
          setReadArticleIds([]);
          localStorage.removeItem('wartakini_read_articles');
          showToast('Riwayat baca telah dikosongkan.');
        }}
      />

      {/* Floating Smooth Scroll to Top Button */}
      {showScrollTop && (
        <button
          id="portal-scroll-top-btn"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-22 lg:bottom-6 right-4 sm:right-6 z-30 p-2.5 sm:p-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black shadow-xl border-2 border-yellow-500 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300 group"
          title="Kembali ke Bagian Atas Portal (Scroll Halus)"
          aria-label="Kembali ke Atas"
        >
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-sky-950 transition-transform group-hover:-translate-y-1" />
          <span className="hidden sm:inline text-xs font-black uppercase tracking-wider font-mono">Ke Atas</span>
        </button>
      )}

      {/* Sawer Kopi Support Modal */}
      <SawerKopiModal
        isOpen={isSawerKopiOpen}
        onClose={() => setIsSawerKopiOpen(false)}
        onShowToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className="fixed bottom-22 lg:bottom-6 right-4 sm:right-6 z-50 bg-sky-950 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border-2 border-yellow-400 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 font-mono"
        >
          <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Adaptive Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onOpenSearch={() => {
          const mobileSearchBtn = document.getElementById('mobile-search-btn');
          if (mobileSearchBtn) {
            mobileSearchBtn.click();
          }
          setTimeout(() => {
            const input = document.getElementById('mobile-search-input-field') || document.getElementById('desktop-search-input');
            input?.focus();
          }, 100);
        }}
        savedCount={savedArticleIds.length}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        onOpenCitizenModal={() => setIsCitizenModalOpen(true)}
        isArticleOpen={!!selectedArticleForModal}
      />

    </div>
  );
}
