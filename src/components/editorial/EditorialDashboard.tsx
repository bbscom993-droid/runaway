import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Newspaper, 
  Sparkles, 
  Radio, 
  FolderTree, 
  CloudSun, 
  Flame, 
  Vote, 
  BookOpen, 
  Video, 
  Camera, 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  ExternalLink, 
  LogOut, 
  Save, 
  RefreshCw, 
  Check, 
  Copy, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Clock, 
  Layers, 
  Sliders, 
  Filter, 
  ArrowUpRight,
  Shield,
  Send,
  Download,
  Upload,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  UserX,
  MessageSquare,
  ThumbsDown,
  RefreshCcw,
  FileCheck,
  Award,
  Building2,
  Palette,
  Layout,
  FileText,
  X,
  BarChart3,
  Activity,
  Train,
  Bus,
  Plane,
  Ship,
  Bell,
  BellRing,
  Volume2,
  Wand2,
  Megaphone,
  FolderPlus,
  Tag
} from 'lucide-react';
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
  NewsComment,
  EditorialStaffMember,
  OfficialContacts,
  TransportSchedule,
  TransportMode,
  PushNotificationSettings,
  EmergencyBroadcastLog
} from '../../types';
import { 
  DEFAULT_PUSH_SETTINGS, 
  sendEmergencyPushNotification, 
  requestNotificationPermission, 
  playNotificationSound 
} from '../../utils/pushNotificationEngine';
import { ArticleEditorModal } from './ArticleEditorModal';
import { DailyViewsChart } from './DailyViewsChart';
import { CategoryReadersBarChart } from './CategoryReadersBarChart';
import { PopularArticlesChart } from './PopularArticlesChart';
import { CommentSentimentAnalytics } from './CommentSentimentAnalytics';
import { SeoHeadlineStudio } from './SeoHeadlineStudio';
import { AdManagementView } from './AdManagementView';
import { PortalThemeSettingsView } from './PortalThemeSettingsView';
import { AdClicksBarChart } from './AdClicksBarChart';
import { 
  INITIAL_FLAGGED_BUZZER_COMMENTS, 
  analyzeCommentAntiBuzzer, 
  DEFAULT_BUZZER_CONFIG, 
  AntiBuzzerConfig 
} from '../../utils/antiBuzzerEngine';
import { 
  saveArticleToDB, 
  deleteArticleFromDB, 
  saveCategoryToDB, 
  deleteCategoryFromDB 
} from '../../services/dbClient';
import { SocialAutoShareDispatcherModal } from './SocialAutoShareDispatcherModal';
import { SocialAutoShareSettingsView } from './SocialAutoShareSettingsView';
import { CategoryEditorModal } from './CategoryEditorModal';
import { renderCategoryIcon } from '../../utils/categoryIconHelper';

interface EditorialDashboardProps {
  currentUser: EditorialUser;
  onLogout: () => void;
  onBackToPublicPortal: () => void;

  // Data & Mutators
  articles: NewsArticle[];
  setArticles: React.Dispatch<React.SetStateAction<NewsArticle[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  weatherCities: WeatherInfo[];
  setWeatherCities: React.Dispatch<React.SetStateAction<WeatherInfo[]>>;
  trendingTopics: TrendingTopic[];
  setTrendingTopics: React.Dispatch<React.SetStateAction<TrendingTopic[]>>;
  pollData: PollData;
  setPollData: React.Dispatch<React.SetStateAction<PollData>>;
  editorialPieces: EditorialPiece[];
  setEditorialPieces: React.Dispatch<React.SetStateAction<EditorialPiece[]>>;
  videoNews: VideoNews[];
  setVideoNews: React.Dispatch<React.SetStateAction<VideoNews[]>>;
  photoStories: PhotoStory[];
  setPhotoStories: React.Dispatch<React.SetStateAction<PhotoStory[]>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  tickerSettings: TickerSettings;
  setTickerSettings: React.Dispatch<React.SetStateAction<TickerSettings>>;
  transportSchedules: TransportSchedule[];
  setTransportSchedules: React.Dispatch<React.SetStateAction<TransportSchedule[]>>;

  onResetAllData: () => void;
  showToast: (msg: string) => void;
  initialTab?: TabType;
}

type TabType = 
  | 'overview'
  | 'articles'
  | 'analytics'
  | 'seo_headlines'
  | 'comment_sentiment'
  | 'headline'
  | 'push_notifications'
  | 'ticker'
  | 'categories'
  | 'weather'
  | 'trending'
  | 'poll'
  | 'editorial'
  | 'videos'
  | 'photos'
  | 'citizen'
  | 'antibuzzer'
  | 'editorial_board'
  | 'transport_schedules'
  | 'advertising'
  | 'social_share'
  | 'theme'
  | 'settings';

export const EditorialDashboard: React.FC<EditorialDashboardProps> = ({
  currentUser,
  onLogout,
  onBackToPublicPortal,
  articles,
  setArticles,
  categories,
  setCategories,
  weatherCities,
  setWeatherCities,
  trendingTopics,
  setTrendingTopics,
  pollData,
  setPollData,
  editorialPieces,
  setEditorialPieces,
  videoNews,
  setVideoNews,
  photoStories,
  setPhotoStories,
  siteSettings,
  setSiteSettings,
  tickerSettings,
  setTickerSettings,
  transportSchedules,
  setTransportSchedules,
  onResetAllData,
  showToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Social Media Auto-Share & Syndication state
  const [isAutoShareModalOpen, setIsAutoShareModalOpen] = useState(false);
  const [selectedArticleForAutoShare, setSelectedArticleForAutoShare] = useState<NewsArticle | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Transport Schedule CMS state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TransportSchedule | null>(null);
  const [scheduleFilterMode, setScheduleFilterMode] = useState<'semua' | TransportMode>('semua');
  const [scheduleForm, setScheduleForm] = useState<{
    mode: TransportMode;
    operator: string;
    routeFrom: string;
    routeTo: string;
    departureTime: string;
    arrivalTime: string;
    status: TransportSchedule['status'];
    priceInfo: string;
    notes: string;
  }>({
    mode: 'bus',
    operator: '',
    routeFrom: '',
    routeTo: '',
    departureTime: '08:00 WIB',
    arrivalTime: '12:00 WIB',
    status: 'Tepat Waktu',
    priceInfo: '',
    notes: ''
  });

  const handleOpenNewScheduleModal = () => {
    setEditingSchedule(null);
    setScheduleForm({
      mode: 'bus',
      operator: '',
      routeFrom: '',
      routeTo: '',
      departureTime: '08:00 WIB',
      arrivalTime: '12:00 WIB',
      status: 'Tepat Waktu',
      priceInfo: '',
      notes: ''
    });
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditScheduleModal = (item: TransportSchedule) => {
    setEditingSchedule(item);
    setScheduleForm({
      mode: item.mode,
      operator: item.operator,
      routeFrom: item.routeFrom,
      routeTo: item.routeTo,
      departureTime: item.departureTime,
      arrivalTime: item.arrivalTime,
      status: item.status,
      priceInfo: item.priceInfo || '',
      notes: item.notes || ''
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.operator || !scheduleForm.routeFrom || !scheduleForm.routeTo) {
      showToast('Mohon lengkapi nama operator, kota asal, dan kota tujuan.');
      return;
    }

    const nowStr = `Hari ini ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

    if (editingSchedule) {
      setTransportSchedules((prev) =>
        prev.map((s) =>
          s.id === editingSchedule.id
            ? {
                ...s,
                ...scheduleForm,
                updatedAt: nowStr
              }
            : s
        )
      );
      showToast('Jadwal transportasi berhasil diperbarui!');
    } else {
      const newItem: TransportSchedule = {
        id: `ts-${Date.now()}`,
        ...scheduleForm,
        updatedAt: nowStr
      };
      setTransportSchedules((prev) => [newItem, ...prev]);
      showToast('Jadwal transportasi baru berhasil ditambahkan!');
    }
    setIsScheduleModalOpen(false);
  };

  const handleDeleteSchedule = (id: string) => {
    if (window.confirm('Hapus jadwal keberangkatan ini dari daftar?')) {
      setTransportSchedules((prev) => prev.filter((s) => s.id !== id));
      showToast('Jadwal transportasi berhasil dihapus.');
    }
  };

  const handleQuickUpdateStatus = (id: string, newStatus: TransportSchedule['status']) => {
    const nowStr = `Hari ini ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    setTransportSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus, updatedAt: nowStr } : s))
    );
    showToast(`Status armada berhasil diubah menjadi "${newStatus}"!`);
  };

  // Category & Rubrik Management State & Handlers
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [quickCategoryName, setQuickCategoryName] = useState('');

  const handleOpenNewCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (savedCategory: Category) => {
    const exists = categories.some((c) => c.id === savedCategory.id);
    let nextCategories: Category[];
    if (exists) {
      nextCategories = categories.map((c) => (c.id === savedCategory.id ? savedCategory : c));
    } else {
      nextCategories = [...categories, savedCategory];
    }

    setCategories(nextCategories);
    try {
      localStorage.setItem('wartakini_categories', JSON.stringify(nextCategories));
    } catch (e) {
      console.warn('Failed saving categories to localStorage', e);
    }

    showToast(`Rubrik "${savedCategory.name}" berhasil ${exists ? 'diperbarui' : 'ditambahkan'}!`);
    setIsCategoryModalOpen(false);

    try {
      await saveCategoryToDB(savedCategory);
    } catch (err) {
      console.warn('Error syncing category to DB:', err);
    }
  };

  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = quickCategoryName.trim();
    if (!cleanName) {
      showToast('Masukkan nama kategori berita terlebih dahulu.');
      return;
    }
    const cleanSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      showToast('Nama kategori tidak valid.');
      return;
    }

    if (categories.some((c) => c.id.toLowerCase() === cleanSlug)) {
      showToast(`Kategori dengan slug "${cleanSlug}" sudah ada.`);
      return;
    }

    const newCat: Category = {
      id: cleanSlug,
      name: cleanName,
      slug: cleanSlug,
      iconName: 'Tag',
      description: `Kanal berita dan informasi aktual seputar topik ${cleanName}.`,
      color: '#0284c7',
    };

    const nextCategories = [...categories, newCat];
    setCategories(nextCategories);
    try {
      localStorage.setItem('wartakini_categories', JSON.stringify(nextCategories));
    } catch (e) {
      console.warn('Failed saving categories to localStorage', e);
    }
    setQuickCategoryName('');
    showToast(`✅ Rubrik "${newCat.name}" berhasil ditambahkan ke pengaturan admin & portal!`);

    try {
      await saveCategoryToDB(newCat);
    } catch (err) {
      console.warn('Error syncing category to DB:', err);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const targetCat = categories.find((c) => c.id === categoryId);
    if (!targetCat) return;

    if (targetCat.id === 'all') {
      showToast('Kategori utama "Semua Berita" adalah bawaan sistem dan tidak dapat dihapus.');
      return;
    }

    const articleCount = articles.filter((a) => a.category === categoryId).length;
    let confirmMsg = `Hapus rubrik/kategori "${targetCat.name}"?`;
    if (articleCount > 0) {
      confirmMsg += ` PERINGATAN: Terdapat ${articleCount} berita yang bernaung di bawah kategori ini!`;
    }

    if (!window.confirm(confirmMsg)) return;

    const nextCategories = categories.filter((c) => c.id !== categoryId);
    setCategories(nextCategories);
    try {
      localStorage.setItem('wartakini_categories', JSON.stringify(nextCategories));
    } catch (e) {
      console.warn('Failed removing category from localStorage', e);
    }

    showToast(`Kategori "${targetCat.name}" berhasil dihapus.`);

    try {
      await deleteCategoryFromDB(categoryId);
    } catch (err) {
      console.warn('Error deleting category from DB:', err);
    }
  };

  // Anti-Buzzer Moderation & Defense Engine State
  const [flaggedComments, setFlaggedComments] = useState<NewsComment[]>(INITIAL_FLAGGED_BUZZER_COMMENTS);
  const [buzzerConfig, setBuzzerConfig] = useState<AntiBuzzerConfig>(DEFAULT_BUZZER_CONFIG);
  const [newBlacklistWord, setNewBlacklistWord] = useState('');
  const [newWhitelistWord, setNewWhitelistWord] = useState('');
  const [buzzerSearch, setBuzzerSearch] = useState('');
  const [buzzerStatusFilter, setBuzzerStatusFilter] = useState<'all' | 'held' | 'suspect'>('all');

  // Interactive Live AI Testing Simulator
  const [testCommentText, setTestCommentText] = useState('AYO VIRALKAN BERSAMA!! JANGAN SAMPAI OPOSISI MENANG, INI BUKTI NYATA KINERJA TERBAIK!! #SatukanSuara');
  const [testAuthorName, setTestAuthorName] = useState('Akun Relawan 09');
  const [testAnalysisResult, setTestAnalysisResult] = useState<ReturnType<typeof analyzeCommentAntiBuzzer> | null>(null);

  // Article Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [articleSearch, setArticleSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Article Analytics & Real-Time Click Tracking State
  const [isLiveTrafficActive, setIsLiveTrafficActive] = useState(false);
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [analyticsCategoryFilter, setAnalyticsCategoryFilter] = useState('all');

  useEffect(() => {
    let interval: any;
    if (isLiveTrafficActive) {
      interval = setInterval(() => {
        setArticles(prev => {
          if (prev.length === 0) return prev;
          const randomIndex = Math.floor(Math.random() * prev.length);
          const updated = [...prev];
          const art = updated[randomIndex];
          updated[randomIndex] = {
            ...art,
            views: art.views + Math.floor(Math.random() * 3) + 1
          };
          return updated;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLiveTrafficActive, setArticles]);

  const handleAddViews = (articleId: string, amount: number = 10) => {
    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, views: art.views + amount } : art));
    showToast(`Berhasil menambahkan ${amount} klik/views pada artikel.`);
  };

  const handleResetViews = (articleId: string) => {
    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, views: 0 } : art));
    showToast(`Statistik klik artikel di-reset menjadi 0.`);
  };

  // Real-Time Push Notification & Emergency Broadcast CMS State
  const [pushSettings, setPushSettings] = useState<PushNotificationSettings>(
    siteSettings.pushSettings || DEFAULT_PUSH_SETTINGS
  );
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [broadcastForm, setBroadcastForm] = useState<{
    title: string;
    message: string;
    type: 'emergency' | 'breaking' | 'important';
    selectedArticleId: string;
  }>({
    title: '',
    message: '',
    type: 'breaking',
    selectedArticleId: ''
  });
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  const handleRequestBrowserPermission = async () => {
    const res = await requestNotificationPermission();
    setBrowserPermission(res);
    if (res === 'granted') {
      showToast('Izin browser push notification berhasil diaktifkan!');
      sendEmergencyPushNotification({
        title: 'Notifikasi Arun News Aktif',
        message: 'Anda akan menerima peringatan kilat saat ada warta Darurat & Breaking News.',
        type: 'important'
      }, pushSettings);
    } else {
      showToast('Izin notifikasi browser belum diberikan / ditolak.');
    }
  };

  const handleSavePushSettings = (newSettings: PushNotificationSettings) => {
    setPushSettings(newSettings);
    setSiteSettings(prev => ({
      ...prev,
      pushSettings: newSettings
    }));
    showToast('Pengaturan notifikasi push berhasil disimpan!');
  };

  const handleSendManualBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      showToast('Mohon masukkan judul dan isi pesan siaran notifikasi.');
      return;
    }

    setIsSendingBroadcast(true);

    const newLog: EmergencyBroadcastLog = {
      id: `bc-${Date.now()}`,
      title: broadcastForm.title.trim(),
      message: broadcastForm.message.trim(),
      type: broadcastForm.type,
      sentAt: new Date().toISOString(),
      sentBy: `${currentUser.name} (${currentUser.roleTitle.split('/')[0]})`,
      articleId: broadcastForm.selectedArticleId || undefined,
      recipientCount: Math.floor(Math.random() * 800) + 1250
    };

    const updatedSettings: PushNotificationSettings = {
      ...pushSettings,
      broadcastLogs: [newLog, ...(pushSettings.broadcastLogs || [])]
    };

    handleSavePushSettings(updatedSettings);

    sendEmergencyPushNotification({
      title: broadcastForm.title.trim(),
      message: broadcastForm.message.trim(),
      type: broadcastForm.type,
      articleId: broadcastForm.selectedArticleId || undefined
    }, updatedSettings);

    setTimeout(() => {
      setIsSendingBroadcast(false);
      showToast(`Siaran notifikasi "${broadcastForm.title}" berhasil disebarkan ke pengunjung portal!`);
      setBroadcastForm({
        title: '',
        message: '',
        type: 'breaking',
        selectedArticleId: ''
      });
    }, 500);
  };

  // Editorial Board Staff Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<EditorialStaffMember | null>(null);
  const [staffForm, setStaffForm] = useState<EditorialStaffMember>({
    id: '',
    name: '',
    position: 'Redaktur',
    phone: '',
    email: '',
    photoUrl: '',
    bio: '',
    pressCardNo: '',
    isListedInBox: true
  });

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      id: `staff-${Date.now()}`,
      name: '',
      position: 'Redaktur Pelaksana',
      phone: '+62 812-',
      email: 'redaksi@arunnews.id',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      bio: '',
      pressCardNo: `DP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      isListedInBox: true
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (staff: EditorialStaffMember) => {
    setEditingStaff(staff);
    setStaffForm({ ...staff });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = () => {
    if (!staffForm.name.trim()) {
      showToast('Nama anggota pengelola redaksi wajib diisi.');
      return;
    }
    const currentList = siteSettings.editorialBoard || [];
    let updatedList: EditorialStaffMember[];
    if (editingStaff) {
      updatedList = currentList.map(s => s.id === editingStaff.id ? staffForm : s);
      showToast(`Data pengelola "${staffForm.name}" berhasil diperbarui.`);
    } else {
      updatedList = [staffForm, ...currentList];
      showToast(`Anggota pengelola "${staffForm.name}" berhasil ditambahkan.`);
    }
    setSiteSettings({
      ...siteSettings,
      editorialBoard: updatedList
    });
    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (staffId: string, name: string) => {
    if (window.confirm(`Hapus "${name}" dari susunan pengelola redaksi?`)) {
      const currentList = siteSettings.editorialBoard || [];
      const updatedList = currentList.filter(s => s.id !== staffId);
      setSiteSettings({
        ...siteSettings,
        editorialBoard: updatedList
      });
      showToast(`Anggota pengelola "${name}" berhasil dihapus.`);
    }
  };

  // Staff Search & Position Filter State
  const [staffSearch, setStaffSearch] = useState('');
  const [staffPosFilter, setStaffPosFilter] = useState('all');

  const handleToggleStaffBox = (staffId: string) => {
    const currentList = siteSettings.editorialBoard || [];
    const updatedList = currentList.map(s => s.id === staffId ? { ...s, isListedInBox: !s.isListedInBox } : s);
    setSiteSettings({
      ...siteSettings,
      editorialBoard: updatedList
    });
    showToast('Status penayangan di Box Redaksi berhasil diperbarui.');
  };

  // Direct admin URL link
  const adminLink = typeof window !== 'undefined' && window.location.hostname.includes('portalarunews.com')
    ? 'https://portalarunews.com/#/admin'
    : `${window.location.origin}${window.location.pathname}#/admin`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(adminLink);
    setCopiedLink(true);
    showToast('Tautan Pengaturan Admin berhasil disalin (portalarunews.com/#/admin)!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Article Actions
  const handleOpenNewArticle = () => {
    setEditingArticle(null);
    setIsArticleModalOpen(true);
  };

  const handleCreateArticleWithHeadline = (headline: string, categoryId: string, tags: string[]) => {
    const slug = headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const contentText = `Berikut adalah rincian lengkap mengenai ${headline}.\n\nPemerintah dan pemangku kepentingan terus mengawal dinamika ini untuk memastikan transparansi informasi bagi masyarakat.`;

    const newArt: NewsArticle = {
      id: `art-${Date.now()}`,
      title: headline,
      slug: slug || `warta-${Date.now()}`,
      excerpt: `Laporan mendalam mengenai perkembangan ${headline} serta tanggapan otoritas terkait.`,
      content: contentText,
      paragraphs: contentText.split('\n\n'),
      category: categoryId || 'nasional',
      categoryLabel: categories.find(c => c.id === categoryId)?.name || 'Nasional',
      imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      imageCaption: `Dokumentasi terkait liputan warta ${headline}`,
      author: {
        name: currentUser.name || 'Redaksi Arun News',
        role: 'Reporter Berita',
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      },
      publishedAt: 'Baru saja',
      readTime: '4 mnt baca',
      views: 150,
      likes: 24,
      shares: 6,
      tags: tags.length > 0 ? tags : ['Berita Terkini', 'Nasional'],
      keyTakeaways: [
        `Fakta kunci seputar ${headline}`,
        'Poin penting kebijakan dan tanggapan publik'
      ],
      comments: [],
      isHeadline: false,
      isBreaking: false,
      isEditorPick: false,
      isTrending: true
    };
    setEditingArticle(newArt);
    setIsArticleModalOpen(true);
  };

  const handleOpenEditArticle = (art: NewsArticle) => {
    setEditingArticle(art);
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = (savedArticle: NewsArticle) => {
    const exists = articles.some((a) => a.id === savedArticle.id);
    let nextList: NewsArticle[];
    if (exists) {
      nextList = articles.map((a) => (a.id === savedArticle.id ? savedArticle : a));
      showToast(`Warta "${savedArticle.title.slice(0, 25)}..." berhasil diperbarui.`);
    } else {
      nextList = [savedArticle, ...articles];
      showToast(`Warta baru "${savedArticle.title.slice(0, 25)}..." berhasil diterbitkan!`);
    }

    // 1. Immediately update in-memory state
    setArticles(nextList);

    // 2. Immediately write to localStorage so refresh never loses the news
    try {
      localStorage.setItem('wartakini_articles', JSON.stringify(nextList));
    } catch (e) {
      console.warn('LocalStorage save error (quota exceeded?):', e);
    }

    // 3. Immediately persist to Firebase Firestore DB in background
    saveArticleToDB(savedArticle).catch((err) => {
      console.warn('Firestore article save error:', err);
    });
  };

  const handleDeleteArticle = (id: string, title: string) => {
    if (window.confirm(`Hapus artikel warta "${title}" dari portal berita?`)) {
      const nextList = articles.filter((a) => a.id !== id);
      setArticles(nextList);
      try {
        localStorage.setItem('wartakini_articles', JSON.stringify(nextList));
      } catch (e) {
        console.warn('LocalStorage delete error:', e);
      }
      deleteArticleFromDB(id).catch((err) => {
        console.warn('Firestore article delete error:', err);
      });
      showToast('Warta berhasil dihapus.');
    }
  };

  const handleSetHeadline = (articleId: string) => {
    const nextList = articles.map((a) => {
      const isHead = a.id === articleId;
      const updated = { ...a, isHeadline: isHead };
      if (isHead || a.isHeadline) {
        saveArticleToDB(updated).catch(console.warn);
      }
      return updated;
    });
    setArticles(nextList);
    try {
      localStorage.setItem('wartakini_articles', JSON.stringify(nextList));
    } catch (e) {}
    showToast('Headline Utama Berita berhasil diperbarui.');
  };

  const handleToggleBreaking = (articleId: string) => {
    const nextList = articles.map((a) => {
      if (a.id === articleId) {
        const updated = { ...a, isBreaking: !a.isBreaking };
        saveArticleToDB(updated).catch(console.warn);
        return updated;
      }
      return a;
    });
    setArticles(nextList);
    try {
      localStorage.setItem('wartakini_articles', JSON.stringify(nextList));
    } catch (e) {}
    showToast('Status Breaking News berhasil diperbarui.');
  };

  const handleToggleEditorPick = (articleId: string) => {
    const nextList = articles.map((a) => {
      if (a.id === articleId) {
        const updated = { ...a, isEditorPick: !a.isEditorPick };
        saveArticleToDB(updated).catch(console.warn);
        return updated;
      }
      return a;
    });
    setArticles(nextList);
    try {
      localStorage.setItem('wartakini_articles', JSON.stringify(nextList));
    } catch (e) {}
    showToast("Status Pilihan Editor berhasil diperbarui.");
  };

  // Anti-Buzzer Moderation Handlers
  const handleApproveBuzzerComment = (commentId: string) => {
    setFlaggedComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, isHeldForReview: false, isBuzzerSuspect: false, isVerified: true, buzzerReasons: [] }
          : c
      )
    );
    showToast('Komentar diverifikasi & diloloskan ke kolom komentar portal.');
  };

  const handleDeleteBuzzerComment = (commentId: string) => {
    setFlaggedComments((prev) => prev.filter((c) => c.id !== commentId));
    showToast('Komentar buzzer berhasil dihapus permanen.');
  };

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlacklistWord.trim()) return;
    const word = newBlacklistWord.trim().toLowerCase();
    if (!buzzerConfig.blacklistedKeywords.includes(word)) {
      setBuzzerConfig((prev) => ({
        ...prev,
        blacklistedKeywords: [...prev.blacklistedKeywords, word]
      }));
      showToast(`Kata "${word}" ditambahkan ke Blacklist Anti-Buzzer.`);
    }
    setNewBlacklistWord('');
  };

  const handleRemoveBlacklist = (word: string) => {
    setBuzzerConfig((prev) => ({
      ...prev,
      blacklistedKeywords: prev.blacklistedKeywords.filter((w) => w !== word)
    }));
    showToast(`Kata "${word}" dihapus dari Blacklist.`);
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistWord.trim()) return;
    const word = newWhitelistWord.trim().toLowerCase();
    if (!buzzerConfig.trustedKeywords.includes(word)) {
      setBuzzerConfig((prev) => ({
        ...prev,
        trustedKeywords: [...prev.trustedKeywords, word]
      }));
      showToast(`Kata "${word}" ditambahkan ke Whitelist Terpercaya.`);
    }
    setNewWhitelistWord('');
  };

  const handleRemoveWhitelist = (word: string) => {
    setBuzzerConfig((prev) => ({
      ...prev,
      trustedKeywords: prev.trustedKeywords.filter((w) => w !== word)
    }));
    showToast(`Kata "${word}" dihapus dari Whitelist.`);
  };

  const handleRunSimulation = () => {
    if (!testCommentText.trim()) return;
    const result = analyzeCommentAntiBuzzer(
      testCommentText,
      testAuthorName || 'Uji Coba Pengguna',
      flaggedComments,
      buzzerConfig
    );
    setTestAnalysisResult(result);
    showToast('Simulasi deteksi AI Anti-Buzzer selesai dianalisis.');
  };

  // Filtered articles
  const filteredArticles = articles.filter((a) => {
    const matchCategory = selectedCategoryFilter === 'all' || a.category === selectedCategoryFilter;
    const matchSearch =
      !articleSearch.trim() ||
      a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.author.name.toLowerCase().includes(articleSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Headline articles
  const currentHeadline = articles.find((a) => a.isHeadline) || articles[0];
  const sideHeadlines = articles.filter((a) => a.id !== currentHeadline?.id).slice(0, 3);

  // Quick stats
  const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);
  const totalLikes = articles.reduce((acc, a) => acc + (a.likes || 0), 0);
  const breakingCount = articles.filter((a) => a.isBreaking).length;
  const editorPickCount = articles.filter((a) => a.isEditorPick).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-yellow-400 selection:text-sky-950 font-sans">
      
      {/* 1. TOP GLOBAL CONTROL BAR */}
      <header className="bg-sky-950 text-white border-b-2 border-yellow-400 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <img 
              src="/whats_app_image_2026_08_01_at_14_48_objq0v5gsu.58.png" 
              alt="Arun News Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-contain shadow-sm border border-yellow-400 bg-white"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base sm:text-lg font-brand font-extrabold uppercase tracking-wider text-white">Arun News</span>
                <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-1.5 py-0.2 rounded font-mono uppercase">
                  Meja Redaksi (CMS)
                </span>
              </div>
              <span className="text-[10px] text-sky-300 font-brand hidden sm:inline">
                Sistem Pusat Manajemen Konten & Modul
              </span>
            </div>
          </div>

          {/* Center: Admin Direct URL Link Notice */}
          <div className="hidden lg:flex items-center gap-2 bg-sky-900/80 px-3 py-1 rounded-xl border border-sky-700">
            <span className="text-[10px] font-mono text-yellow-300">Tautan Admin:</span>
            <code className="text-[11px] text-sky-100 font-mono">
              portalarunews.com/#/admin
            </code>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-bold text-[10px] rounded transition-colors"
              title="Salin Tautan Pengaturan Admin (portalarunews.com/#/admin)"
            >
              {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
            </button>
          </div>

          {/* Right: Active User Profile & Actions */}
          <div className="flex items-center gap-2.5">
            {/* View Public Portal Button */}
            <button
              onClick={onBackToPublicPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 text-xs font-black transition-all shadow-xs border border-yellow-500 uppercase tracking-wider"
              title="Kunjungi Tampilan Publik"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lihat Portal Publik</span>
              <span className="sm:hidden">Portal</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>

            {/* Current User Pill with Local Photo Upload */}
            <div className="flex items-center gap-2 bg-sky-900 px-2.5 py-1 rounded-xl border border-sky-800 relative group">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-yellow-400"
                />
                <label className="absolute -bottom-1 -right-1 bg-yellow-400 hover:bg-yellow-300 text-sky-950 p-0.5 rounded-full cursor-pointer shadow-xs" title="Upload Foto Profil dari Lokal">
                  <Camera className="w-2.5 h-2.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            currentUser.avatar = evt.target.result as string;
                            showToast('Foto profil lokal berhasil diperbarui!');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-yellow-400 font-mono uppercase">
                  {currentUser.roleTitle.split('/')[0]}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1 border border-red-500/40"
              title="Keluar dari Sesi Redaksi"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN LAYOUT: SIDEBAR + WORKSPACE */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 w-full flex-1 flex flex-col md:flex-row gap-5">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-3 border border-sky-200 shadow-xs sticky top-20 space-y-1">
            
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-sky-950 font-mono border-b border-slate-100 mb-1 flex items-center justify-between">
              <span>MODUL PORTAL BERITA</span>
              <span className="bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded">13 Modul</span>
            </div>

            {/* Nav item 1: Overview */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'overview'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-sky-900" />
              <span>Ringkasan & Statistik</span>
            </button>

            {/* Nav item 2: Articles */}
            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'articles'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4 text-sky-900" />
                <span>Manajemen Warta</span>
              </div>
              <span className="text-[10px] bg-sky-100 text-sky-950 px-1.5 py-0.2 rounded font-mono font-black">
                {articles.length}
              </span>
            </button>

            {/* Nav item 2.5: Analytics / Click Tracking */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'analytics'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-sky-900" />
                <span>Statistik Klik & Real-Time</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
              </span>
            </button>

            {/* Nav item 2.6: Gemini AI SEO Headline Generator Studio */}
            <button
              onClick={() => setActiveTab('seo_headlines')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'seo_headlines'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-sky-950 shadow-2xs font-black ring-1 ring-yellow-500'
                  : 'text-slate-700 hover:bg-yellow-50 hover:text-sky-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${activeTab === 'seo_headlines' ? 'text-sky-950 animate-bounce' : 'text-amber-500'}`} />
                <span>Studio Headline SEO</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                activeTab === 'seo_headlines' ? 'bg-sky-950 text-yellow-300' : 'bg-amber-100 text-amber-900'
              }`}>
                Gemini
              </span>
            </button>

            {/* Nav item 2.8: Gemini AI Comment Sentiment & Public Reaction */}
            <button
              onClick={() => setActiveTab('comment_sentiment')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'comment_sentiment'
                  ? 'bg-gradient-to-r from-sky-950 to-indigo-950 text-white shadow-2xs font-black border border-yellow-400'
                  : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${activeTab === 'comment_sentiment' ? 'text-yellow-400 animate-spin-slow' : 'text-indigo-600'}`} />
                <span>Sentimen Komentar AI</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                activeTab === 'comment_sentiment' ? 'bg-yellow-400 text-sky-950' : 'bg-indigo-100 text-indigo-800'
              }`}>
                Gemini
              </span>
            </button>

            {/* Nav item 3: Headline & Spotlight */}
            <button
              onClick={() => setActiveTab('headline')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'headline'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <Star className="w-4 h-4 text-sky-900" />
              <span>Headline & Spotlight Hero</span>
            </button>

            {/* Nav item 3.5: Push Notifications & Emergency Broadcast */}
            <button
              onClick={() => setActiveTab('push_notifications')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'push_notifications'
                  ? 'bg-rose-600 text-white shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-rose-50 hover:text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BellRing className={`w-4 h-4 ${activeTab === 'push_notifications' ? 'text-white animate-bounce' : 'text-rose-600'}`} />
                <span>Notifikasi & Darurat</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                activeTab === 'push_notifications' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'
              }`}>
                🔴 Broadcast
              </span>
            </button>

            {/* Nav item 4: Running Ticker */}
            <button
              onClick={() => setActiveTab('ticker')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'ticker'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <Radio className="w-4 h-4 text-sky-900" />
              <span>Running Ticker & Alert</span>
            </button>

            {/* Nav item 5: Rubrik & Categories */}
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'categories'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4 text-sky-900" />
                <span>Rubrik & Kategori</span>
              </div>
              <span className="text-[10px] bg-sky-100 text-sky-950 px-1.5 py-0.2 rounded font-mono font-bold">
                {categories.length - 1}
              </span>
            </button>

            {/* Nav item: Jadwal Transportasi */}
            <button
              onClick={() => setActiveTab('transport_schedules')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'transport_schedules'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Train className="w-4 h-4 text-sky-900" />
                <span>Jadwal Transportasi</span>
              </div>
              <span className="text-[10px] bg-sky-100 text-sky-950 px-1.5 py-0.2 rounded font-mono font-bold">
                {transportSchedules.length}
              </span>
            </button>

            {/* Nav item 6: Cuaca Kota */}
            <button
              onClick={() => setActiveTab('weather')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'weather'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <CloudSun className="w-4 h-4 text-sky-900" />
              <span>Cuaca Kota Pantauan</span>
            </button>

            {/* Nav item 7: Trending Topics */}
            <button
              onClick={() => setActiveTab('trending')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'trending'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <Flame className="w-4 h-4 text-sky-900" />
              <span>Topik Hangat (Trending)</span>
            </button>

            {/* Nav item 8: Jajak Pendapat / Polling */}
            <button
              onClick={() => setActiveTab('poll')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'poll'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <Vote className="w-4 h-4 text-sky-900" />
              <span>Jajak Pendapat / Polling</span>
            </button>

            {/* Nav item 9: Catatan Redaksi & Kolumnis */}
            <button
              onClick={() => setActiveTab('editorial')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'editorial'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-900" />
              <span>Pojok Kolumnis & Opini</span>
            </button>

            {/* Nav item 10: Video News */}
            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'videos'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <Video className="w-4 h-4 text-sky-900" />
              <span>Warta Video & Multimedia</span>
            </button>

            {/* Nav item 11: Photo Gallery */}
            <button
              onClick={() => setActiveTab('photos')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'photos'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <Camera className="w-4 h-4 text-sky-900" />
              <span>Galeri Foto Jurnalistik</span>
            </button>

            {/* Nav item 12: Warta Warga Submissions */}
            <button
              onClick={() => setActiveTab('citizen')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'citizen'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <Users className="w-4 h-4 text-sky-900" />
              <span>Moderasi Warta Warga</span>
            </button>

            {/* Nav item 13: Anti-Buzzer Defense & Moderation */}
            <button
              onClick={() => setActiveTab('antibuzzer')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'antibuzzer'
                  ? 'bg-emerald-500 text-white shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-emerald-700" />
                <span>Perisai Anti-Buzzer</span>
              </div>
              <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-mono font-bold">
                {flaggedComments.filter(c => c.isHeldForReview).length} Ditahan
              </span>
            </button>

            {/* Nav item 14: Susunan Redaksi & Jurnalis */}
            <button
              onClick={() => setActiveTab('editorial_board')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'editorial_board'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-sky-900" />
                <span>Susunan Redaksi & Jurnalis</span>
              </div>
              <span className="text-[10px] bg-sky-100 text-sky-950 px-1.5 py-0.2 rounded font-mono font-bold">
                {(siteSettings.editorialBoard || []).length}
              </span>
            </button>

            {/* Nav item: Pengaturan Iklan & Monetisasi */}
            <button
              onClick={() => setActiveTab('advertising')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'advertising'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4 text-sky-900" />
                <span>Pengaturan Iklan & Monetisasi</span>
              </div>
              <span className="text-[10px] bg-yellow-100 text-sky-950 px-1.5 py-0.2 rounded font-mono font-bold">
                {(siteSettings.semSettings?.adSlots || []).filter(s => s.isEnabled).length} Aktif
              </span>
            </button>

            {/* Nav item: Warna & Template Portal */}
            <button
              onClick={() => setActiveTab('theme')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'theme'
                  ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-sky-900" />
                <span>Warna & Template Portal</span>
              </div>
              <span className="text-[10px] bg-sky-950 text-yellow-300 px-2 py-0.5 rounded-full font-mono font-bold">
                {(siteSettings.portalThemeSettings?.colorTheme || 'sky_gold').toUpperCase()}
              </span>
            </button>

            {/* Nav item 15: Site Settings & Module Toggles */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'settings'
                    ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black'
                    : 'text-slate-700 hover:bg-sky-50 hover:text-sky-950'
                }`}
              >
                <Settings className="w-4 h-4 text-sky-900" />
                <span>Pengaturan Portal & Modul</span>
              </button>
            </div>

          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="flex-1 min-w-0">
          
          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW & STATS */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-sky-950 to-sky-900 text-white rounded-3xl p-6 shadow-sm border border-sky-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-400 text-sky-950 font-black text-[10px] px-2 py-0.5 rounded font-mono uppercase">
                      Panel Kontrol Meja Redaksi
                    </span>
                    <span className="text-xs text-sky-300 font-mono">
                      Sesi Aktif: {currentUser.name}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Selamat Bertugas, {currentUser.name.split(',')[0]}
                  </h1>
                  <p className="text-xs text-sky-200 mt-1 max-w-xl font-medium">
                    Semua perubahan yang Anda buat di sini akan langsung disinkronkan secara live ke tampilan pembaca pada portal berita Arun News.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleOpenNewArticle}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tulis Warta Baru</span>
                  </button>
                </div>
              </div>

              {/* 4 Bento Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-sky-800">
                    <span className="text-[11px] font-bold uppercase font-mono">Total Warta</span>
                    <Newspaper className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-black text-sky-950">{articles.length}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Aktif di katalog publik</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-sky-800">
                    <span className="text-[11px] font-bold uppercase font-mono">Total Pembaca</span>
                    <Eye className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-black text-sky-950">{totalViews.toLocaleString('id-ID')}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Akumulasi views warta</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-sky-800">
                    <span className="text-[11px] font-bold uppercase font-mono">Breaking News</span>
                    <Radio className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-black text-red-600">{breakingCount}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Aktif di running ticker</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-sky-800">
                    <span className="text-[11px] font-bold uppercase font-mono">Total Suara Polling</span>
                    <Vote className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-black text-sky-950">{pollData.totalVotes.toLocaleString('id-ID')}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Partisipasi jajak pendapat</span>
                  </div>
                </div>
              </div>

              {/* Data Visualization Charts: Daily Views & Category Readers (Recharts) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <DailyViewsChart articles={articles} categories={categories} />
                <CategoryReadersBarChart articles={articles} categories={categories} />
              </div>

              {/* Data Visualization Chart: Popular Articles (Views, Likes, Shares) (Recharts) */}
              <PopularArticlesChart articles={articles} />

              {/* Gemini AI Suite: Dual Banner for SEO Headline Studio & Sentiment Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Banner 1: Gemini AI SEO Headline Generator Studio */}
                <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 text-white rounded-2xl p-5 border border-yellow-500/40 shadow-xs flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                      <Wand2 className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider font-brand text-white">
                          Studio Headline SEO AI (Gemini)
                        </span>
                        <span className="bg-yellow-400 text-sky-950 text-[9px] font-mono font-black px-1.5 py-0.2 rounded uppercase">
                          5 Variasi
                        </span>
                      </div>
                      <p className="text-xs text-yellow-100/90 mt-1 leading-relaxed">
                        Pilih beberapa kata kunci target dan biarkan Gemini AI merumuskan 5 judul berita yang memikat pembaca, berbobot pers, dan ramah algoritma Google Search & Discover.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('seo_headlines')}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-between cursor-pointer"
                  >
                    <span>Buka Studio Headline SEO</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Banner 2: Gemini AI Sentiment & Public Intelligence */}
                <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-500/40 shadow-xs flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                      <Sparkles className="w-6 h-6 animate-spin-slow" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider font-brand text-white">
                          Intelijen Sentimen Komentar AI
                        </span>
                        <span className="bg-yellow-400 text-sky-950 text-[9px] font-mono font-black px-1.5 py-0.2 rounded uppercase">
                          Sentimen
                        </span>
                      </div>
                      <p className="text-xs text-sky-200 mt-1 leading-relaxed">
                        Analisis otomatis reaksi publik, polarisasi opini pembaca, dan rangkuman aspirasi masyarakat pada setiap artikel berita menggunakan model Gemini 3.7 Flash.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('comment_sentiment')}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-between cursor-pointer"
                  >
                    <span>Buka Analisis Sentimen</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* 2-Column Bento: Headline Overview + Quick Module Status */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Current Spotlight Hero */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-sky-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-sky-100 mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono">
                          Headline Utama Saat Ini
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('headline')}
                        className="text-[11px] font-bold text-sky-700 hover:text-sky-950 underline"
                      >
                        Ganti Headline
                      </button>
                    </div>

                    {currentHeadline && (
                      <div className="flex flex-col sm:flex-row gap-3.5">
                        <img
                          src={currentHeadline.imageUrl}
                          alt={currentHeadline.title}
                          className="w-full sm:w-40 h-28 object-cover rounded-xl border border-sky-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="bg-sky-100 text-sky-900 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                            {currentHeadline.categoryLabel}
                          </span>
                          <h3 className="text-sm font-black text-sky-950 line-clamp-2 mt-1">
                            {currentHeadline.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                            {currentHeadline.excerpt}
                          </p>
                          <div className="text-[10px] text-slate-500 font-mono mt-2">
                            Oleh: {currentHeadline.author.name} • {currentHeadline.views.toLocaleString('id-ID')} views
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenEditArticle(currentHeadline)}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 rounded-xl font-bold text-sky-950 text-xs border border-sky-200"
                    >
                      Edit Naskah Ini
                    </button>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Diperbarui di Spotlight Hero
                    </span>
                  </div>
                </div>

                {/* Quick Module Status Toggles Summary */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-sky-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-sky-100 mb-3">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-sky-900" />
                        <span className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono">
                          Status Tampilan Modul
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="text-[11px] font-bold text-sky-700 hover:text-sky-950 underline"
                      >
                        Semua Pengaturan
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/70">
                        <span className="font-bold text-sky-950">Running Ticker Berita</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
                          tickerSettings.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tickerSettings.isEnabled ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/70">
                        <span className="font-bold text-sky-950">Cuaca Kota Pantauan</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
                          siteSettings.moduleToggles.showWeather ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {siteSettings.moduleToggles.showWeather ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/70">
                        <span className="font-bold text-sky-950">Jajak Pendapat Publik</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
                          siteSettings.moduleToggles.showPoll ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {siteSettings.moduleToggles.showPoll ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/70">
                        <span className="font-bold text-sky-950">Warta Video & Multimedia</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
                          siteSettings.moduleToggles.showVideoNews ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {siteSettings.moduleToggles.showVideoNews ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Arun News CMS v3.4.0
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ARTICLES MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'articles' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4 animate-in fade-in duration-200">
              
              {/* Header & New Article Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                    Manajemen Katalog Warta
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Terbitkan, edit naskah, tandai headline, dan kelola seluruh liputan redaksi
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    onClick={() => setActiveTab('seo_headlines')}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-sky-950 font-black text-xs transition-all shadow-xs border border-amber-600 cursor-pointer active:scale-95"
                    title="Generator 5 Variasi Headline SEO AI Gemini"
                  >
                    <Sparkles className="w-4 h-4 text-sky-950 animate-bounce" />
                    <span>Studio Judul SEO AI</span>
                  </button>
                  <button
                    onClick={handleOpenNewArticle}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-black text-xs transition-all shadow-xs border border-purple-300/40 cursor-pointer active:scale-95"
                    title="Buat Draf Berita Otomatis dengan AI Gemini"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    <span>Buat Draf AI</span>
                  </button>
                  <button
                    onClick={handleOpenNewArticle}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-xs border border-yellow-500 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tulis Berita Manual</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-sky-700" />
                  <input
                    type="text"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Cari judul warta, penulis, atau kata kunci..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-sky-50 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-sky-700 hidden sm:inline" />
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 text-xs bg-sky-50 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sky-950"
                  >
                    <option value="all">Semua Rubrik ({articles.length})</option>
                    {categories.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table of Articles */}
              <div className="overflow-x-auto border border-sky-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sky-950 text-white text-[11px] font-mono uppercase">
                    <tr>
                      <th className="p-3">Warta & Sampul</th>
                      <th className="p-3">Rubrik</th>
                      <th className="p-3">Reporter</th>
                      <th className="p-3 text-center">Status & Sorotan</th>
                      <th className="p-3 text-center">Views</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-sky-50/60 transition-colors">
                        
                        {/* Title & Thumbnail */}
                        <td className="p-3 max-w-xs">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-12 h-10 rounded-lg object-cover border border-sky-200 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-sky-950 line-clamp-1">
                                {article.title}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {article.publishedAt}
                                </span>
                                {article.status === 'pending' && (
                                  <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-400 font-mono font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1 shadow-2xs">
                                    <Clock className="w-2.5 h-2.5 text-amber-600 animate-spin" />
                                    <span>Pending</span>
                                    {article.scheduledPublishAt && (
                                      <span className="text-amber-700">({new Date(article.scheduledPublishAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} {new Date(article.scheduledPublishAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})</span>
                                    )}
                                  </span>
                                )}
                                {article.status === 'draft' && (
                                  <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-300 font-mono font-bold px-1.5 py-0.2 rounded-md">
                                    Draft
                                  </span>
                                )}
                                {(!article.status || article.status === 'published') && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold px-1.5 py-0.2 rounded-md">
                                    Published
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-3">
                          <span className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono">
                            {article.categoryLabel}
                          </span>
                        </td>

                        {/* Author */}
                        <td className="p-3 font-medium text-slate-700">
                          {article.author.name}
                        </td>

                        {/* Badges / Status */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {article.isHeadline && (
                              <span className="bg-yellow-400 text-sky-950 text-[9px] font-black px-1.5 py-0.2 rounded font-mono uppercase">
                                Headline
                              </span>
                            )}
                            {article.isBreaking && (
                              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded font-mono uppercase">
                                Breaking
                              </span>
                            )}
                            {article.isEditorPick && (
                              <span className="bg-sky-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                                Pick
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Views */}
                        <td className="p-3 text-center font-mono font-bold text-sky-950">
                          {article.views.toLocaleString('id-ID')}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setActiveTab('comment_sentiment');
                              }}
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1 text-[10px] font-bold"
                              title="Analisis Sentimen Komentar AI (Gemini)"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Sentimen AI</span>
                            </button>

                            <button
                              onClick={() => handleSetHeadline(article.id)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                article.isHeadline
                                  ? 'bg-yellow-400 text-sky-950 border-yellow-500'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-yellow-100'
                              }`}
                              title="Jadikan Headline Utama"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenEditArticle(article)}
                              className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300 transition-colors"
                              title="Edit Naskah Warta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteArticle(article.id, article.title)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-200 transition-colors"
                              title="Hapus Warta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: ARTICLE ANALYTICS & CLICK TRACKING */}
          {/* ========================================================= */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-6 animate-in fade-in duration-200">
              
              {/* Header & Live Traffic Control */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-sky-600" />
                    <span>Statistik Klik & Analitik Pembaca Real-Time</span>
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Pantau jumlah klik, total pembaca (views), dan performa keterbacaan setiap artikel secara real-time
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsLiveTrafficActive(!isLiveTrafficActive)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-xs border ${
                      isLiveTrafficActive
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
                        : 'bg-sky-50 hover:bg-sky-100 text-sky-950 border-sky-200'
                    }`}
                  >
                    <Activity className={`w-4 h-4 ${isLiveTrafficActive ? 'animate-spin' : ''}`} />
                    <span>{isLiveTrafficActive ? 'Simulasi Traffic Aktif (Live)' : 'Mulai Simulasi Live Traffic'}</span>
                  </button>
                </div>
              </div>

              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl p-4 border border-sky-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total Pembaca (Views)</div>
                  <div className="text-2xl font-black text-sky-950 mt-1 font-mono">
                    {articles.reduce((acc, a) => acc + (a.views || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Real-time active tracking
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-4 border border-yellow-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Artikel Paling Populer</div>
                  <div className="text-sm font-black text-sky-950 mt-1 truncate">
                    {articles.length > 0 ? [...articles].sort((a,b) => b.views - a.views)[0]?.title : '-'}
                  </div>
                  <div className="text-[10px] text-yellow-800 font-bold mt-1">
                    {articles.length > 0 ? [...articles].sort((a,b) => b.views - a.views)[0]?.views.toLocaleString() : 0} pembaca
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border border-blue-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total Artikel Terbit</div>
                  <div className="text-2xl font-black text-sky-950 mt-1 font-mono">
                    {articles.length} Naskah
                  </div>
                  <div className="text-[10px] text-blue-700 font-bold mt-1">Aktif di seluruh rubrik</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-4 border border-emerald-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Rata-rata Views / Artikel</div>
                  <div className="text-2xl font-black text-sky-950 mt-1 font-mono">
                    {articles.length > 0 ? Math.round(articles.reduce((acc, a) => acc + (a.views || 0), 0) / articles.length).toLocaleString() : 0}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">Tingkat engagement tinggi</div>
                </div>
              </div>

              {/* Data Visualization Charts: Daily Distribution of Article Views & Category Analytics (Recharts) */}
              <DailyViewsChart articles={articles} categories={categories} />
              <CategoryReadersBarChart articles={articles} categories={categories} />
              <PopularArticlesChart articles={articles} />

              {/* Panel Visualisasi Data: Statistik Klik & Performa Iklan Real-Time (Recharts) */}
              <AdClicksBarChart 
                adSlots={siteSettings.semSettings?.adSlots || []}
                siteSettings={siteSettings}
                onSimulateClick={(slotId) => {
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
                  showToast(`🎯 +1 Klik simulasi tercatat pada slot iklan!`);
                }}
              />

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={analyticsSearch}
                    onChange={(e) => setAnalyticsSearch(e.target.value)}
                    placeholder="Cari judul artikel..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs font-medium text-sky-950 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={analyticsCategoryFilter}
                    onChange={(e) => setAnalyticsCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-950 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="all">Semua Rubrik</option>
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Analytics Ranking Table */}
              <div className="overflow-x-auto border border-sky-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-sky-950 text-white text-[11px] font-black uppercase tracking-wider">
                      <th className="py-3 px-4">Peringkat & Judul Warta</th>
                      <th className="py-3 px-3">Rubrik</th>
                      <th className="py-3 px-3">Penulis</th>
                      <th className="py-3 px-3 text-center">Total Klik (Views)</th>
                      <th className="py-3 px-3 text-center">Interaksi (Like/Share)</th>
                      <th className="py-3 px-4 text-right">Aksi Redaktur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100 text-xs font-medium">
                    {[...articles]
                      .filter(art => {
                        const matchSearch = art.title.toLowerCase().includes(analyticsSearch.toLowerCase());
                        const matchCat = analyticsCategoryFilter === 'all' || art.category === analyticsCategoryFilter;
                        return matchSearch && matchCat;
                      })
                      .sort((a, b) => b.views - a.views)
                      .map((art, idx) => (
                        <tr key={art.id} className="hover:bg-sky-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5 ${
                                idx === 0 ? 'bg-yellow-400 text-sky-950 shadow-xs' :
                                idx === 1 ? 'bg-slate-200 text-slate-800' :
                                idx === 2 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                              }`}>
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-sky-950 line-clamp-1 max-w-md">{art.title}</div>
                                <div className="text-[11px] text-slate-500">{art.publishedAt} • {art.readTime}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 text-[10px] font-black uppercase">
                              {art.categoryLabel || art.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-bold">
                            {art.author.name}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-black text-sm text-sky-900 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
                              {art.views.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="text-[11px] text-slate-600 font-bold">
                              👍 {art.likes} &bull; 🔄 {art.shares}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleAddViews(art.id, 10)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors"
                                title="Simulasi tambah 10 klik pembaca"
                              >
                                +10 Klik
                              </button>
                              <button
                                onClick={() => handleResetViews(art.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-600 font-bold text-[11px] border border-slate-200 transition-colors"
                                title="Reset views jadi 0"
                              >
                                Reset
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: GEMINI AI SEO HEADLINE GENERATOR STUDIO */}
          {/* ========================================================= */}
          {activeTab === 'seo_headlines' && (
            <SeoHeadlineStudio
              categories={categories}
              showToast={showToast}
              onApplyToCurrentArticle={(headline, tags) => {
                handleCreateArticleWithHeadline(headline, 'nasional', tags || []);
              }}
            />
          )}

          {/* ========================================================= */}
          {/* TAB: GEMINI AI COMMENT SENTIMENT & PUBLIC REACTION */}
          {/* ========================================================= */}
          {activeTab === 'comment_sentiment' && (
            <CommentSentimentAnalytics
              articles={articles}
              showToast={showToast}
              onOpenEditArticle={handleOpenEditArticle}
            />
          )}

          {/* ========================================================= */}
          {/* TAB 3: HEADLINE & SPOTLIGHT HERO SETTINGS */}
          {/* ========================================================= */}
          {activeTab === 'headline' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-5 animate-in fade-in duration-200">
              <div className="pb-3 border-b border-sky-100">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Pengaturan Headline & Spotlight Hero
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Tentukan berita mana yang menjadi sorotan utama panggung depan portal Arun News
                </p>
              </div>

              {/* Select Main Headline Dropdown */}
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 space-y-2">
                <label className="block font-black uppercase tracking-wider text-sky-950 text-xs font-mono">
                  Pilih Headline Utama (Main Spotlight):
                </label>
                <select
                  value={currentHeadline?.id || ''}
                  onChange={(e) => handleSetHeadline(e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-sky-300 font-bold text-sky-950 text-xs focus:ring-2 focus:ring-yellow-400"
                >
                  {articles.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.categoryLabel.toUpperCase()}] {a.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview Current Headline Card */}
              {currentHeadline && (
                <div className="border-2 border-yellow-400 rounded-2xl p-4 bg-white shadow-xs">
                  <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-yellow-600">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <span>PRATINJAU HEADLINE TERPILIH</span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={currentHeadline.imageUrl}
                      alt={currentHeadline.title}
                      className="w-full md:w-64 h-36 object-cover rounded-xl border border-sky-200"
                    />
                    <div className="flex-1">
                      <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded font-mono uppercase">
                        {currentHeadline.categoryLabel}
                      </span>
                      <h3 className="text-base font-black text-sky-950 mt-1.5">
                        {currentHeadline.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3">
                        {currentHeadline.excerpt}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <button
                          onClick={() => handleOpenEditArticle(currentHeadline)}
                          className="px-3 py-1.5 bg-sky-900 text-white rounded-xl font-bold text-xs"
                        >
                          Edit Naskah Headline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3.5: PUSH NOTIFICATIONS & EMERGENCY REAL-TIME BROADCAST */}
          {/* ========================================================= */}
          {activeTab === 'push_notifications' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-6 animate-in fade-in duration-200">
              
              {/* Header & Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                      Pusat Notifikasi Push & Siaran Darurat (Real-Time)
                    </h2>
                    <span className="bg-rose-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      Live Dispatcher
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Kirim peringatan kilat darurat, breaking news, dan atur notifikasi push browser otomatis ke seluruh pengunjung portal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playNotificationSound(pushSettings.soundType)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-300 shadow-2xs cursor-pointer"
                    title="Uji coba efek suara peringatan"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-yellow-600" />
                    <span>Uji Suara</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestBrowserPermission}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
                      browserPermission === 'granted'
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-yellow-400 text-sky-950 border-yellow-500 hover:bg-yellow-300 font-black'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{browserPermission === 'granted' ? 'Izin Browser Aktif' : 'Aktifkan Izin Notifikasi'}</span>
                  </button>
                </div>
              </div>

              {/* Permission & Status Alert Box */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                browserPermission === 'granted'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}>
                <BellRing className={`w-5 h-5 flex-shrink-0 mt-0.5 ${browserPermission === 'granted' ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <span>Status Push Notification Browser:</span>
                    <span className="font-mono uppercase px-2 py-0.5 rounded text-[10px] bg-white font-black shadow-2xs">
                      {browserPermission === 'granted' ? 'Tersambung (Granted)' : browserPermission === 'denied' ? 'Ditolak (Denied)' : 'Menunggu Izin (Default)'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700 font-medium">
                    {browserPermission === 'granted'
                      ? 'Browser Anda telah terhubung ke saluran siaran darurat Arun News. Notifikasi darurat dan breaking news akan langsung muncul di sudut layar peramban pengunjung secara instan.'
                      : 'Aktifkan izin notifikasi peramban agar Anda dan redaksi dapat memverifikasi pop-up push notification saat berita genting disiarkan.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 cols): Manual Broadcast Dispatcher */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="border border-sky-200 rounded-2xl p-4 sm:p-5 bg-sky-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-rose-600" />
                        <h3 className="text-xs sm:text-sm font-black uppercase text-sky-950 font-mono">
                          Kirim Siaran Darurat / Breaking Kilat
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Real-Time Dispatch</span>
                    </div>

                    <form onSubmit={handleSendManualBroadcast} className="space-y-3.5">
                      {/* Broadcast Type */}
                      <div>
                        <label className="block text-[11px] font-bold text-sky-950 uppercase font-mono mb-1.5">
                          Tingkat Kegentingan / Jenis Siaran:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setBroadcastForm({ ...broadcastForm, type: 'emergency' })}
                            className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                              broadcastForm.type === 'emergency'
                                ? 'bg-rose-600 text-white border-rose-700 shadow-xs font-black'
                                : 'bg-white text-slate-700 border-sky-200 hover:bg-rose-50'
                            }`}
                          >
                            🔴 Darurat / Bahaya
                          </button>
                          <button
                            type="button"
                            onClick={() => setBroadcastForm({ ...broadcastForm, type: 'breaking' })}
                            className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                              broadcastForm.type === 'breaking'
                                ? 'bg-amber-500 text-sky-950 border-amber-600 shadow-xs font-black'
                                : 'bg-white text-slate-700 border-sky-200 hover:bg-amber-50'
                            }`}
                          >
                            ⚡ Breaking News
                          </button>
                          <button
                            type="button"
                            onClick={() => setBroadcastForm({ ...broadcastForm, type: 'important' })}
                            className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                              broadcastForm.type === 'important'
                                ? 'bg-sky-900 text-white border-sky-950 shadow-xs font-black'
                                : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
                            }`}
                          >
                            📢 Informasi Penting
                          </button>
                        </div>
                      </div>

                      {/* Broadcast Title */}
                      <div>
                        <label className="block text-[11px] font-bold text-sky-950 uppercase font-mono mb-1">
                          Judul Notifikasi Singkat:
                        </label>
                        <input
                          type="text"
                          required
                          value={broadcastForm.title}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                          placeholder="Misal: Peringatan Dini BMKG Cuaca Ekstrem Pesisir..."
                          className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-sky-200 text-xs font-bold text-sky-950 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                        />
                      </div>

                      {/* Broadcast Message */}
                      <div>
                        <label className="block text-[11px] font-bold text-sky-950 uppercase font-mono mb-1">
                          Isi Ringkasan Peringatan:
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={broadcastForm.message}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                          placeholder="Jelaskan intisari peristiwa atau arahan keselamatan publik secara ringkas dan lugas..."
                          className="w-full px-3.5 py-2 bg-white rounded-xl border border-sky-200 text-xs text-sky-950 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                        />
                      </div>

                      {/* Select Associated Article */}
                      <div>
                        <label className="block text-[11px] font-bold text-sky-950 uppercase font-mono mb-1">
                          Tautkan ke Artikel Berita Terkait (Opsional):
                        </label>
                        <select
                          value={broadcastForm.selectedArticleId}
                          onChange={(e) => {
                            const artId = e.target.value;
                            const art = articles.find(a => a.id === artId);
                            setBroadcastForm({
                              ...broadcastForm,
                              selectedArticleId: artId,
                              title: art && !broadcastForm.title ? art.title : broadcastForm.title,
                              message: art && !broadcastForm.message ? art.excerpt : broadcastForm.message
                            });
                          }}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-sky-200 text-xs font-semibold text-sky-950 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                        >
                          <option value="">-- Tanpa Tautan (Siaran Mandiri) --</option>
                          {articles.map((art) => (
                            <option key={art.id} value={art.id}>
                              [{art.categoryLabel}] {art.title} {art.isBreaking ? '⚡' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Submit Broadcast Button */}
                      <button
                        type="submit"
                        disabled={isSendingBroadcast}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md border border-rose-500 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                      >
                        <Radio className="w-4 h-4 animate-ping" />
                        <span>{isSendingBroadcast ? 'Menyiarkan Notifikasi...' : 'Siarkan Notifikasi Push Sekarang'}</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right (1 col): Automation Settings */}
                <div className="space-y-4">
                  <div className="border border-sky-200 rounded-2xl p-4 sm:p-5 bg-white space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-sky-100">
                      <Settings className="w-4 h-4 text-sky-900" />
                      <h3 className="text-xs font-black uppercase text-sky-950 font-mono">
                        Aturan Otomatisasi Push
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Auto Push on Breaking */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <div className="font-bold text-sky-950">Auto-Push Breaking News</div>
                          <div className="text-[10px] text-slate-500">Kirim otomatis saat ada artikel 'Breaking'</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={pushSettings.autoPushOnBreaking}
                          onChange={(e) =>
                            handleSavePushSettings({
                              ...pushSettings,
                              autoPushOnBreaking: e.target.checked
                            })
                          }
                          className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-400"
                        />
                      </div>

                      {/* Auto Push on Emergency */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <div className="font-bold text-sky-950">Auto-Push Status Darurat</div>
                          <div className="text-[10px] text-slate-500">Kirim otomatis saat kategori darurat</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={pushSettings.autoPushOnEmergency}
                          onChange={(e) =>
                            handleSavePushSettings({
                              ...pushSettings,
                              autoPushOnEmergency: e.target.checked
                            })
                          }
                          className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-400"
                        />
                      </div>

                      {/* Enable Sound Alert */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <div className="font-bold text-sky-950">Efek Suara Audio (Audio Chime)</div>
                          <div className="text-[10px] text-slate-500">Bunyikan sirene/chime saat ada siaran</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={pushSettings.enableSoundAlert}
                          onChange={(e) =>
                            handleSavePushSettings({
                              ...pushSettings,
                              enableSoundAlert: e.target.checked
                            })
                          }
                          className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-400"
                        />
                      </div>

                      {/* Sound Type Selection */}
                      <div className="space-y-1 pt-1">
                        <label className="block text-[11px] font-bold text-slate-700">Jenis Nada Dering:</label>
                        <select
                          value={pushSettings.soundType}
                          onChange={(e) => {
                            const newType = e.target.value as 'chime' | 'urgent_bell' | 'radar_pulse';
                            const updated = { ...pushSettings, soundType: newType };
                            handleSavePushSettings(updated);
                            playNotificationSound(newType);
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-sky-950"
                        >
                          <option value="urgent_bell">🔴 Bel Darurat Triple High (Urgent)</option>
                          <option value="radar_pulse">📡 Radar Pulse Sirene</option>
                          <option value="chime">🔔 Harmonious Triple Chime</option>
                        </select>
                      </div>

                      {/* Badge Label */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">Label Badge Pengumuman:</label>
                        <input
                          type="text"
                          value={pushSettings.badgeLabel}
                          onChange={(e) =>
                            handleSavePushSettings({
                              ...pushSettings,
                              badgeLabel: e.target.value
                            })
                          }
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-sky-950"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Broadcast Logs History Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-900" />
                    <h3 className="text-xs sm:text-sm font-black uppercase text-sky-950 font-mono">
                      Riwayat Siaran Peringatan Real-Time ({pushSettings.broadcastLogs?.length || 0})
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Tersimpan di Cloud Database Redaksi</span>
                </div>

                <div className="overflow-x-auto border border-sky-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-sky-950 text-white text-[11px] font-black uppercase tracking-wider">
                        <th className="py-3 px-4">Waktu Siaran</th>
                        <th className="py-3 px-3">Tipe</th>
                        <th className="py-3 px-4">Judul & Pesan Peringatan</th>
                        <th className="py-3 px-3">Pengirim (Redaktur)</th>
                        <th className="py-3 px-3 text-center">Penerima Aktif</th>
                        <th className="py-3 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 text-xs font-medium">
                      {(pushSettings.broadcastLogs || []).map((log) => (
                        <tr key={log.id} className="hover:bg-sky-50/50">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(log.sentAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })} WIB
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                              log.type === 'emergency'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : log.type === 'breaking'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-sky-100 text-sky-900 border border-sky-200'
                            }`}>
                              {log.type === 'emergency' ? '🔴 Darurat' : log.type === 'breaking' ? '⚡ Breaking' : '📢 Penting'}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-sky-950 truncate">{log.title}</div>
                            <div className="text-slate-500 text-[11px] truncate">{log.message}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                            {log.sentBy}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700 whitespace-nowrap">
                            {log.recipientCount ? log.recipientCount.toLocaleString('id-ID') : '1.420'} Pengunjung
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                sendEmergencyPushNotification({
                                  title: log.title,
                                  message: log.message,
                                  type: log.type,
                                  articleId: log.articleId
                                }, pushSettings);
                                showToast(`Siaran ulang "${log.title}" berhasil dikirimkan!`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-yellow-400 hover:text-sky-950 text-sky-900 text-[11px] font-bold transition-all border border-sky-200"
                              title="Kirim ulang siaran ini"
                            >
                              Kirim Ulang
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: RUNNING TICKER & BREAKING ALERT */}
          {/* ========================================================= */}
          {activeTab === 'ticker' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-5 animate-in fade-in duration-200">
              <div className="pb-3 border-b border-sky-100">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Pengaturan Running Ticker & Alert
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Atur teks berjalan, kecepatan, dan mode pengumuman kilat di bagian atas portal
                </p>
              </div>

              {/* Toggle Enable */}
              <div className="flex items-center justify-between p-4 bg-sky-50 rounded-xl border border-sky-200">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono">
                    Aktifkan Running Ticker Berita
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Tampilkan bilah warta berjalan di bawah bilah navigasi utama
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tickerSettings.isEnabled}
                    onChange={(e) => {
                      setTickerSettings({ ...tickerSettings, isEnabled: e.target.checked });
                      showToast('Status Ticker diperbarui.');
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                </label>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTickerSettings({ ...tickerSettings, mode: 'auto' });
                    showToast('Ticker beralih ke mode otomatis warta breaking.');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    tickerSettings.mode === 'auto'
                      ? 'bg-yellow-50 border-yellow-500 ring-2 ring-yellow-400'
                      : 'bg-white border-sky-200'
                  }`}
                >
                  <h4 className="text-xs font-black text-sky-950 font-mono">Mode 1: Otomatis (Warta Breaking)</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Ticker mengambil judul artikel berita yang ditandai Breaking / Headline secara bergantian.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTickerSettings({ ...tickerSettings, mode: 'custom' });
                    showToast('Ticker beralih ke mode pengumuman kustom.');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    tickerSettings.mode === 'custom'
                      ? 'bg-yellow-50 border-yellow-500 ring-2 ring-yellow-400'
                      : 'bg-white border-sky-200'
                  }`}
                >
                  <h4 className="text-xs font-black text-sky-950 font-mono">Mode 2: Pesan Kustom Khusus</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Gunakan teks pengumuman redaksi yang Anda ketik secara manual di bawah.
                  </p>
                </button>
              </div>

              {/* Custom Message Field */}
              {tickerSettings.mode === 'custom' && (
                <div className="space-y-1.5">
                  <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] font-mono">
                    Teks Pesan Ticker Kustom:
                  </label>
                  <textarea
                    rows={3}
                    value={tickerSettings.customMessage}
                    onChange={(e) => setTickerSettings({ ...tickerSettings, customMessage: e.target.value })}
                    placeholder="Ketik teks pengumuman khusus redaksi..."
                    className="w-full p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs font-medium text-sky-950 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              )}

              {/* Speed & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                    Kecepatan Gerak Ticker
                  </label>
                  <select
                    value={tickerSettings.speed}
                    onChange={(e) => setTickerSettings({ ...tickerSettings, speed: e.target.value as any })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-xs font-bold text-sky-950"
                  >
                    <option value="slow">Lambat (Mudah Dibaca)</option>
                    <option value="normal">Standar (Normal)</option>
                    <option value="fast">Cepat (Dinamis)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                    Tema Warna Bilah Ticker
                  </label>
                  <select
                    value={tickerSettings.theme}
                    onChange={(e) => setTickerSettings({ ...tickerSettings, theme: e.target.value as any })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-xs font-bold text-sky-950"
                  >
                    <option value="dark">Biru Gelap Navy Klasik</option>
                    <option value="yellow">Kuning Terang High-Contrast</option>
                    <option value="red">Merah Peringatan Penting</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: RUBRIK & KATEGORI */}
          {/* ========================================================= */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-6 animate-in fade-in duration-200">
              {/* Header with Title and Tambah Kategori Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sky-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-400 text-sky-950 font-black text-[10px] font-mono px-2 py-0.5 rounded uppercase shadow-2xs">
                      Struktur Konten Portal
                    </span>
                    <span className="text-xs text-sky-700 font-mono font-bold">
                      {categories.length} Rubrik Terdaftar
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-sky-950 font-mono">
                    Rubrik & Kanal Berita Portal
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Atur nama rubrik liputan, ikon visual, warna kanal, deskripsi, serta kelola alokasi naskah warta.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleOpenNewCategoryModal}
                    className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95 shadow-md cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4 text-sky-950" />
                    <span>Tambah Kategori Baru</span>
                  </button>
                </div>
              </div>

              {/* Quick Add Bar & Search Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
                {/* Quick Add Form */}
                <form onSubmit={handleQuickAddCategory} className="lg:col-span-7 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={quickCategoryName}
                      onChange={(e) => setQuickCategoryName(e.target.value)}
                      placeholder="Tambah rubrik instan (contoh: Wisata, Olahraga, Kuliner)..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 font-bold focus:ring-2 focus:ring-yellow-400 focus:outline-none shadow-2xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-yellow-300 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Cepat</span>
                  </button>
                </form>

                {/* Search Filter */}
                <div className="lg:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    placeholder="Cari nama atau slug rubrik..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none shadow-2xs"
                  />
                  {categorySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCategorySearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-sky-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Total Kanal Rubrik</span>
                    <span className="text-xl font-black text-sky-950 font-mono">{categories.length} Rubrik</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold">
                    <FolderTree className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-sky-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Total Artikel Berita</span>
                    <span className="text-xl font-black text-emerald-700 font-mono">{articles.length} Naskah</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Newspaper className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-sky-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Sinkronisasi Basis Data</span>
                    <span className="text-xs font-black text-sky-950 font-mono">Aktif (Firestore &amp; Cache)</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-900 flex items-center justify-center font-bold">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories
                  .filter((cat) => {
                    if (!categorySearchQuery) return true;
                    const q = categorySearchQuery.toLowerCase();
                    return (
                      cat.name.toLowerCase().includes(q) ||
                      (cat.slug && cat.slug.toLowerCase().includes(q)) ||
                      (cat.description && cat.description.toLowerCase().includes(q))
                    );
                  })
                  .map((cat, idx) => {
                    const catArticlesCount = articles.filter(
                      (a) => a.category === cat.id || a.category === cat.slug
                    ).length;

                    return (
                      <div
                        key={cat.id}
                        className="p-4 rounded-2xl border border-sky-200 bg-white hover:border-yellow-400 hover:shadow-md transition-all flex flex-col justify-between gap-3 group relative overflow-hidden"
                      >
                        {/* Top Color Line */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ backgroundColor: cat.color || '#0284c7' }}
                        />

                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-2xs flex-shrink-0"
                                style={{
                                  backgroundColor: (cat.color || '#0284c7') + '20',
                                  color: cat.color || '#0284c7',
                                }}
                              >
                                {renderCategoryIcon(cat.iconName || 'Tag', 'w-4 h-4')}
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs font-black text-sky-950 uppercase tracking-tight">
                                    {cat.name}
                                  </h4>
                                  <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-mono font-bold">
                                    /{cat.slug || cat.id}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 font-semibold">
                                  Index #{idx + 1}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex-shrink-0">
                              {catArticlesCount} Berita
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {cat.description || `Liputan berita mendalam kanal ${cat.name}.`}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategoryModal(cat)}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-sky-700" />
                            <span>Edit Rubrik</span>
                          </button>

                          {cat.id !== 'all' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Hapus Kategori Berita"
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: JADWAL TRANSPORTASI REDAKSI */}
          {/* ========================================================= */}
          {activeTab === 'transport_schedules' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sky-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-400 text-sky-950 font-black text-[10px] font-mono px-2 py-0.5 rounded uppercase">
                      Kanal Transportasi
                    </span>
                    <span className="text-xs text-sky-700 font-mono font-bold">
                      {transportSchedules.length} Keberangkatan Terdaftar
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-sky-950 font-mono">
                    Pengaturan Jadwal Transportasi
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Keberangkatan bus, kereta, pesawat, dan kapal yang diperbarui redaksi.
                  </p>
                </div>

                <button
                  onClick={handleOpenNewScheduleModal}
                  className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95 shadow-md self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Jadwal Baru</span>
                </button>
              </div>

              {/* Filter Tabs by Mode */}
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                {(['semua', 'bus', 'kereta', 'pesawat', 'kapal'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setScheduleFilterMode(m)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      scheduleFilterMode === m
                        ? 'bg-sky-950 text-yellow-400 shadow-xs font-black'
                        : 'bg-sky-50 text-slate-700 hover:bg-sky-100 border border-sky-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Schedules Table / Cards */}
              <div className="space-y-3">
                {transportSchedules
                  .filter((s) => scheduleFilterMode === 'semua' || s.mode === scheduleFilterMode)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-sky-200 bg-slate-50/70 hover:bg-white transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-lg bg-sky-950 text-yellow-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                            {item.mode === 'bus' && <Bus className="w-5 h-5 text-emerald-400" />}
                            {item.mode === 'kereta' && <Train className="w-5 h-5 text-sky-400" />}
                            {item.mode === 'pesawat' && <Plane className="w-5 h-5 text-indigo-400" />}
                            {item.mode === 'kapal' && <Ship className="w-5 h-5 text-cyan-400" />}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-sky-900 text-sky-100 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                                {item.mode}
                              </span>
                              {item.priceInfo && (
                                <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                                  {item.priceInfo}
                                </span>
                              )}
                            </div>
                            <h4 className="font-extrabold text-sky-950 text-sm">{item.operator}</h4>
                          </div>
                        </div>

                        {/* Quick status selector */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] text-slate-500 font-mono font-bold">Status:</span>
                          {(['Tepat Waktu', 'Boarding', 'Dalam Perjalanan', 'Terlambat', 'Dibatalkan'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleQuickUpdateStatus(item.id, st)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                item.status === st
                                  ? 'bg-sky-950 text-yellow-300 border-sky-900 shadow-2xs font-black'
                                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700 font-medium">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Rute Asal & Tujuan</span>
                          <p className="font-bold text-sky-950">{item.routeFrom} &rarr; {item.routeTo}</p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Waktu Berangkat & Tiba</span>
                          <p className="font-bold text-slate-800">{item.departureTime} - {item.arrivalTime}</p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">Catatan / Keterangan</span>
                            <p className="text-slate-600 text-[11px] truncate max-w-[180px]">{item.notes || '-'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleOpenEditScheduleModal(item)}
                              className="p-1.5 text-sky-800 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Jadwal"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(item.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Jadwal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: CUACA KOTA PANTAUAN */}
          {/* ========================================================= */}
          {activeTab === 'weather' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="pb-3 border-b border-sky-100">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Cuaca Kota Pantauan (TopBar)
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Perbarui temperatur suhu, kondisi iklim, dan kelembapan kota-kota di Indonesia
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {weatherCities.map((item, idx) => (
                  <div key={item.city} className="p-3.5 rounded-xl border border-sky-200 bg-sky-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-sky-950">{item.city}</span>
                      <span className="text-xs font-bold text-yellow-600 font-mono">{item.temp}°C</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500 font-mono block">Kondisi</label>
                        <input
                          type="text"
                          value={item.condition}
                          onChange={(e) => {
                            const updated = [...weatherCities];
                            updated[idx].condition = e.target.value;
                            setWeatherCities(updated);
                          }}
                          className="w-full px-2 py-1 bg-white rounded border border-sky-200 text-xs text-sky-950 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-mono block">Suhu (°C)</label>
                        <input
                          type="number"
                          value={item.temp}
                          onChange={(e) => {
                            const updated = [...weatherCities];
                            updated[idx].temp = Number(e.target.value);
                            setWeatherCities(updated);
                          }}
                          className="w-full px-2 py-1 bg-white rounded border border-sky-200 text-xs text-sky-950 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: TRENDING TOPICS */}
          {/* ========================================================= */}
          {activeTab === 'trending' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="pb-3 border-b border-sky-100">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Tagar Hangat & Trending Nusantara
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Kelola daftar tagar populer yang muncul pada bilah pencarian dan widget top 5
                </p>
              </div>

              <div className="space-y-2">
                {trendingTopics.map((topic, idx) => (
                  <div
                    key={topic.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-yellow-600 font-mono w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        value={topic.tag}
                        onChange={(e) => {
                          const updated = [...trendingTopics];
                          updated[idx].tag = e.target.value;
                          setTrendingTopics(updated);
                        }}
                        className="px-2.5 py-1 bg-white rounded-lg border border-sky-200 font-bold text-sky-950"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={topic.postsCount}
                        onChange={(e) => {
                          const updated = [...trendingTopics];
                          updated[idx].postsCount = e.target.value;
                          setTrendingTopics(updated);
                        }}
                        placeholder="Contoh: 140K Warta"
                        className="px-2.5 py-1 bg-white rounded-lg border border-sky-200 text-slate-700 font-mono"
                      />
                      <input
                        type="text"
                        value={topic.category}
                        onChange={(e) => {
                          const updated = [...trendingTopics];
                          updated[idx].category = e.target.value;
                          setTrendingTopics(updated);
                        }}
                        placeholder="Kategori"
                        className="px-2.5 py-1 bg-white rounded-lg border border-sky-200 text-slate-700 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: JAJAK PENDAPAT / POLLING */}
          {/* ========================================================= */}
          {activeTab === 'poll' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="pb-3 border-b border-sky-100">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Pengaturan Jajak Pendapat (Polling)
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Sesuaikan pertanyaan jajak pendapat, pilihan jawaban, dan tinjau total suara
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1 font-mono">
                    Pertanyaan Jajak Pendapat *
                  </label>
                  <textarea
                    rows={2}
                    value={pollData.question}
                    onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-bold focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1 font-mono">
                    Deskripsi / Konteks Tambahan
                  </label>
                  <input
                    type="text"
                    value={pollData.description}
                    onChange={(e) => setPollData({ ...pollData, description: e.target.value })}
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] font-mono">
                    Pilihan Jawaban & Perolehan Suara
                  </label>
                  {pollData.options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2 p-2 bg-sky-50 rounded-xl border border-sky-200">
                      <span className="font-mono font-bold text-yellow-600 w-5 text-center">{i + 1}.</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...pollData.options];
                          updated[i].text = e.target.value;
                          setPollData({ ...pollData, options: updated });
                        }}
                        className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-sky-200 text-sky-950 font-medium"
                      />
                      <input
                        type="number"
                        value={opt.votes}
                        onChange={(e) => {
                          const updated = [...pollData.options];
                          updated[i].votes = Number(e.target.value);
                          const newTotal = updated.reduce((acc, o) => acc + o.votes, 0);
                          setPollData({ ...pollData, options: updated, totalVotes: newTotal });
                        }}
                        className="w-24 px-2 py-1.5 bg-white rounded-lg border border-sky-200 text-sky-950 font-mono text-center"
                        title="Jumlah Suara"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 9: EDITORIAL & OPINION PIECES */}
          {/* ========================================================= */}
          {activeTab === 'editorial' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="pb-3 border-b border-sky-100">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Pojok Kolumnis & Catatan Redaksi
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Kelola kutipan pakar, budayawan, dan kurasi analisis mendalam
                </p>
              </div>

              <div className="space-y-3">
                {editorialPieces.map((piece, idx) => (
                  <div key={piece.id} className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sky-950">{piece.authorName} ({piece.authorRole})</h4>
                      <span className="text-[10px] font-mono text-slate-500">{piece.date}</span>
                    </div>
                    <input
                      type="text"
                      value={piece.title}
                      onChange={(e) => {
                        const updated = [...editorialPieces];
                        updated[idx].title = e.target.value;
                        setEditorialPieces(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-sky-200 font-black text-sky-950"
                    />
                    <textarea
                      rows={2}
                      value={piece.quote}
                      onChange={(e) => {
                        const updated = [...editorialPieces];
                        updated[idx].quote = e.target.value;
                        setEditorialPieces(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-sky-200 text-slate-700 italic"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 10: VIDEO NEWS */}
          {/* ========================================================= */}
          {activeTab === 'videos' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="pb-3 border-b border-sky-100">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Warta Video & Multimedia
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Kelola video berita, durasi, dan takarir visual
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videoNews.map((vid, idx) => (
                  <div key={vid.id} className="p-3 bg-sky-50 rounded-2xl border border-sky-200 space-y-2 text-xs">
                    <img src={vid.thumbnail} alt={vid.title} className="w-full h-32 object-cover rounded-xl border border-sky-200" />
                    <input
                      type="text"
                      value={vid.title}
                      onChange={(e) => {
                        const updated = [...videoNews];
                        updated[idx].title = e.target.value;
                        setVideoNews(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-sky-200 font-bold text-sky-950"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={vid.duration}
                        onChange={(e) => {
                          const updated = [...videoNews];
                          updated[idx].duration = e.target.value;
                          setVideoNews(updated);
                        }}
                        className="px-2 py-1 bg-white rounded border border-sky-200 font-mono text-center"
                        placeholder="Durasi (04:30)"
                      />
                      <input
                        type="text"
                        value={vid.views}
                        onChange={(e) => {
                          const updated = [...videoNews];
                          updated[idx].views = e.target.value;
                          setVideoNews(updated);
                        }}
                        className="px-2 py-1 bg-white rounded border border-sky-200 font-mono text-center"
                        placeholder="180K ditonton"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 11: PHOTO STORIES */}
          {/* ========================================================= */}
          {activeTab === 'photos' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="pb-3 border-b border-sky-100">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Galeri Foto Jurnalistik
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Kelola foto cerita nusantara dan nama fotografer dokumenter
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photoStories.map((photo, idx) => (
                  <div key={photo.id} className="p-3 bg-sky-50 rounded-2xl border border-sky-200 space-y-2 text-xs">
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-36 object-cover rounded-xl border border-sky-200" />
                    <input
                      type="text"
                      value={photo.title}
                      onChange={(e) => {
                        const updated = [...photoStories];
                        updated[idx].title = e.target.value;
                        setPhotoStories(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-sky-200 font-bold text-sky-950"
                    />
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <input
                        type="text"
                        value={photo.photographer}
                        onChange={(e) => {
                          const updated = [...photoStories];
                          updated[idx].photographer = e.target.value;
                          setPhotoStories(updated);
                        }}
                        className="px-2 py-1 bg-white rounded border border-sky-200"
                        placeholder="Fotografer"
                      />
                      <input
                        type="text"
                        value={photo.location}
                        onChange={(e) => {
                          const updated = [...photoStories];
                          updated[idx].location = e.target.value;
                          setPhotoStories(updated);
                        }}
                        className="px-2 py-1 bg-white rounded border border-sky-200"
                        placeholder="Lokasi"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 12: MODERASI WARTA WARGA */}
          {/* ========================================================= */}
          {activeTab === 'citizen' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="pb-3 border-b border-sky-100">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Moderasi Kiriman Warta Warga
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Tinjau dan verifikasi kiriman berita publik sebelum dipromosikan ke halaman utama
                </p>
              </div>

              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-950">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Sistem Jurnalisme Warga Terpadu Aktif</span>
                </div>
                <p className="text-xs text-slate-600">
                  Setiap berita yang dikirim masyarakat lewat tombol "Warta Warga" di portal publik akan langsung masuk ke katalog artikel dengan label jurnalisme warga. Anda dapat mengedit judul, takarir, atau menjadikannya Headline Utama kapan saja di tab <strong>Manajemen Warta</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 13: PUSAT PERISAI ANTI-BUZZER & MODERASI AI */}
          {/* ========================================================= */}
          {activeTab === 'antibuzzer' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-sky-950 to-emerald-900 text-white rounded-3xl p-6 shadow-md border-2 border-emerald-500/50 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg flex-shrink-0">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                        Pusat Pertahanan Anti-Buzzer & Moderasi AI
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase font-mono tracking-wider">
                        Sistem Aktif
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200 mt-1 max-w-2xl leading-relaxed">
                      Sistem proteksi cerdas mendeteksi copy-paste massal cyber-army, framing provokatif, spam tautan tersembunyi, dan bot terkoordinasi demi menjaga integritas kolom opini publik.
                    </p>
                  </div>
                </div>

                {/* Quick Stats Widget */}
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs">
                  <div className="text-center px-3 border-r border-white/20">
                    <div className="text-lg font-black text-yellow-400 font-mono">
                      {flaggedComments.length + 18}
                    </div>
                    <div className="text-[10px] text-emerald-200 font-medium">Diperiksa Hari Ini</div>
                  </div>
                  <div className="text-center px-3 border-r border-white/20">
                    <div className="text-lg font-black text-rose-400 font-mono">
                      {flaggedComments.filter(c => c.isHeldForReview).length}
                    </div>
                    <div className="text-[10px] text-rose-200 font-medium">Komentar Ditahan</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="text-lg font-black text-emerald-400 font-mono">99.4%</div>
                    <div className="text-[10px] text-emerald-200 font-medium">Akurasi Filter</div>
                  </div>
                </div>
              </div>

              {/* Grid: Live Testing Simulator + Strictness Config */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left (7 Cols): Live AI Testing Simulator */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-sky-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-sm font-black uppercase tracking-tight text-sky-950">
                        Simulator Uji Deteksi Narasi Buzzer
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Live AI Engine Sandbox</span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Ketik atau uji coba contoh kalimat untuk melihat bagaimana sistem mendeteksi kata terlarang, huruf kapital (shouting), pengulangan karakter, dan kesamaan pola bot:
                  </p>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="text-slate-500 font-bold self-center mr-1">Preset:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTestAuthorName('Akun Bot Relawan');
                        setTestCommentText('AYO VIRALKAN BERSAMA!! JANGAN SAMPAI OPOSISI MENANG, SUDAH TERBUKTI KERJA NYATA!! #TetapSolid');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 font-medium"
                    >
                      Buzzer Politik (Shouting)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTestAuthorName('Admin Promo Cepat');
                        setTestCommentText('Solusi cuan anti rungkad slot gacor hari ini dan dana kaget langsung cair hubungi link');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-medium"
                    >
                      Spam Link & Promo Ilegal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTestAuthorName('Budi Santoso');
                        setTestCommentText('Analisis yang sangat komprehensif dari redaksi. Semoga kebijakan ini berdampak positif bagi ekonomi daerah.');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-medium"
                    >
                      Komentar Warga Orisinal
                    </button>
                  </div>

                  {/* Simulator Inputs */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={testAuthorName}
                      onChange={(e) => setTestAuthorName(e.target.value)}
                      placeholder="Nama Akun Pengirim..."
                      className="w-full px-3 py-2 text-xs bg-sky-50 rounded-xl border border-sky-200 font-bold text-sky-950"
                    />
                    <textarea
                      rows={3}
                      value={testCommentText}
                      onChange={(e) => setTestCommentText(e.target.value)}
                      placeholder="Tulis kalimat yang ingin diuji..."
                      className="w-full p-3 text-xs bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-medium"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleRunSimulation}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-950 hover:bg-sky-900 text-yellow-400 font-black text-xs uppercase tracking-wider shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Analisis Risiko Sekarang
                    </button>
                  </div>

                  {/* Simulation Result Box */}
                  {testAnalysisResult && (
                    <div
                      className={`p-4 rounded-2xl border transition-all animate-in fade-in duration-200 text-xs ${
                        testAnalysisResult.isHeld
                          ? 'bg-rose-50 border-rose-300 text-rose-950'
                          : testAnalysisResult.isSuspect
                          ? 'bg-amber-50 border-amber-300 text-amber-950'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {testAnalysisResult.isHeld ? (
                            <ShieldAlert className="w-5 h-5 text-rose-600" />
                          ) : testAnalysisResult.isSuspect ? (
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          ) : (
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          )}
                          <span className="font-black text-xs sm:text-sm">
                            {testAnalysisResult.isHeld
                              ? 'Tindakan: Komentar Otomatis DITAHAN'
                              : testAnalysisResult.isSuspect
                              ? 'Tindakan: Komentar DITANDAI PENGAWASAN'
                              : 'Tindakan: Komentar LOLOS VERIFIKASI (Bersih)'}
                          </span>
                        </div>
                        <span className="font-mono font-bold px-2 py-0.5 rounded-lg bg-white/80 border text-[11px]">
                          Skor Risiko: {testAnalysisResult.riskScore}/100
                        </span>
                      </div>

                      {testAnalysisResult.reasons.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          <div className="font-bold text-[11px]">Pemicu Deteksi Teridentifikasi:</div>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                            {testAnalysisResult.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-[11px] text-emerald-800">
                          Tidak ditemukan pola berbahaya atau kata terlarang. Opini dinilai alami dan santun.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right (5 Cols): Strictness & Blacklist Configuration */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-sky-200 shadow-xs space-y-4">
                  <div className="pb-3 border-b border-sky-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-sky-900" />
                      <h3 className="text-sm font-black uppercase tracking-tight text-sky-950">
                        Sensitivitas & Kamus Kata
                      </h3>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                      {buzzerConfig.strictness.toUpperCase()}
                    </span>
                  </div>

                  {/* Strictness Level Selector */}
                  <div>
                    <label className="text-xs font-bold text-sky-950 block mb-2">
                      Tingkat Ketat Penyaringan:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                      {(['rendah', 'standar', 'tinggi', 'maksimal'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            setBuzzerConfig({ ...buzzerConfig, strictness: lvl });
                            showToast(`Tingkat ketat diset ke: ${lvl.toUpperCase()}`);
                          }}
                          className={`py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all ${
                            buzzerConfig.strictness === lvl
                              ? 'bg-sky-950 text-yellow-400 font-black shadow-xs'
                              : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'
                          }`}
                        >
                          {lvl === 'rendah' ? 'Rendah' : lvl === 'standar' ? 'Standar' : lvl === 'tinggi' ? 'Tinggi' : 'Maksimal'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blacklist Management */}
                  <div>
                    <label className="text-xs font-bold text-sky-950 block mb-1">
                      Kamus Kata Terlarang (Blacklist) ({buzzerConfig.blacklistedKeywords.length})
                    </label>
                    <form onSubmit={handleAddBlacklist} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newBlacklistWord}
                        onChange={(e) => setNewBlacklistWord(e.target.value)}
                        placeholder="Tambah kata/frasa terlarang..."
                        className="flex-1 px-3 py-1.5 text-xs bg-sky-50 rounded-xl border border-sky-200 font-medium"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                      >
                        + Tambah
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {buzzerConfig.blacklistedKeywords.map((word) => (
                        <span
                          key={word}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-100 text-rose-900 text-[11px] font-mono font-semibold"
                        >
                          {word}
                          <button
                            type="button"
                            onClick={() => handleRemoveBlacklist(word)}
                            className="hover:text-rose-600 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Whitelist Management */}
                  <div>
                    <label className="text-xs font-bold text-sky-950 block mb-1">
                      Kata Kunci Aman (Whitelist) ({buzzerConfig.trustedKeywords.length})
                    </label>
                    <form onSubmit={handleAddWhitelist} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newWhitelistWord}
                        onChange={(e) => setNewWhitelistWord(e.target.value)}
                        placeholder="Tambah kata aman..."
                        className="flex-1 px-3 py-1.5 text-xs bg-sky-50 rounded-xl border border-sky-200 font-medium"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                      >
                        + Tambah
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {buzzerConfig.trustedKeywords.map((word) => (
                        <span
                          key={word}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 text-[11px] font-mono font-semibold"
                        >
                          {word}
                          <button
                            type="button"
                            onClick={() => handleRemoveWhitelist(word)}
                            className="hover:text-emerald-600 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Antrean Moderasi Komentar Buzzer / Bot Terdeteksi */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-sky-950 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                      Antrean Moderasi Komentar Buzzer & Bot Terdeteksi ({flaggedComments.length})
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      Tinjau komentar yang ditahan atau dilaporkan pembaca sebelum diterbitkan ke publik
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <button
                      type="button"
                      onClick={() => setBuzzerStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        buzzerStatusFilter === 'all'
                          ? 'bg-sky-950 text-yellow-400 font-black'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Semua ({flaggedComments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuzzerStatusFilter('held')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        buzzerStatusFilter === 'held'
                          ? 'bg-rose-600 text-white font-black'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      Ditahan ({flaggedComments.filter(c => c.isHeldForReview).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuzzerStatusFilter('suspect')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        buzzerStatusFilter === 'suspect'
                          ? 'bg-amber-500 text-white font-black'
                          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      Pengawasan ({flaggedComments.filter(c => c.isBuzzerSuspect && !c.isHeldForReview).length})
                    </button>
                  </div>
                </div>

                {/* Flagged Comments Moderation List */}
                <div className="space-y-3">
                  {flaggedComments.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300 font-medium">
                      <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      Antrean bersih! Tidak ada komentar buzzer yang ditahan saat ini.
                    </div>
                  ) : (
                    flaggedComments
                      .filter((c) => {
                        if (buzzerStatusFilter === 'held') return c.isHeldForReview;
                        if (buzzerStatusFilter === 'suspect') return c.isBuzzerSuspect && !c.isHeldForReview;
                        return true;
                      })
                      .map((comm) => (
                        <div
                          key={comm.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            comm.isHeldForReview
                              ? 'bg-rose-50/70 border-rose-300'
                              : 'bg-amber-50/70 border-amber-300'
                          }`}
                        >
                          <div className="flex gap-3 items-start flex-1 min-w-0">
                            <img
                              src={comm.userAvatar}
                              alt={comm.userName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-slate-300 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-bold text-xs text-sky-950">{comm.userName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{comm.timestamp}</span>

                                {comm.isHeldForReview ? (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold font-mono">
                                    DITAHAN REDAKSI
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold font-mono">
                                    PENGAWASAN
                                  </span>
                                )}

                                {comm.reportsCount ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                                    🚩 {comm.reportsCount} Laporan Pembaca
                                  </span>
                                ) : null}
                              </div>

                              <p className="text-xs text-slate-800 font-normal leading-relaxed mb-2 bg-white/70 p-2.5 rounded-xl border border-slate-200">
                                "{comm.content}"
                              </p>

                              {/* Flag reasons */}
                              {comm.buzzerReasons && comm.buzzerReasons.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-700 font-mono">
                                  <span className="font-bold text-rose-900">Alasan Indikasi:</span>
                                  {comm.buzzerReasons.map((reason, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded bg-white border border-slate-300 font-medium"
                                    >
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleApproveBuzzerComment(comm.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all active:scale-95"
                              title="Loloskan komentar ke portal publik"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Loloskan</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteBuzzerComment(comm.id)}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all active:scale-95"
                              title="Hapus permanen komentar buzzer ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 14: SUSUNAN PENGELOLA REDAKSI & JAJARAN JURNALIS */}
          {/* ========================================================= */}
          {activeTab === 'editorial_board' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-slate-950 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden border border-sky-800/50">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-yellow-400/20 text-yellow-300 font-mono text-[11px] font-bold mb-2 border border-yellow-400/30">
                      <Award className="w-3.5 h-3.5 text-yellow-400" />
                      <span>MODUL KELOLA DEWAN REDAKSI & JURNALIS</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Susunan Pengelola Redaksi & Struktur Jurnalis
                    </h2>
                    <p className="text-xs text-sky-200 mt-1 max-w-2xl leading-relaxed">
                      Atur jajaran Pemimpin Redaksi, Redaktur Pelaksana, Ombudsman Pers, Kepala Desk, Wartawan Lapangan, serta nomor KTA Dewan Pers yang ditayangkan pada Box Redaksi Publik.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddStaff}
                    className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-sky-950 text-xs font-mono font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:scale-102 active:scale-95 flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 text-sky-950" />
                    <span>Tambah Anggota Redaksi</span>
                  </button>
                </div>

                {/* Quick Metrics Bar */}
                <div className="mt-5 pt-4 border-t border-sky-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-sky-900/50 p-2.5 rounded-xl border border-sky-800/40">
                    <span className="text-[10px] text-sky-300 block">Total Personel</span>
                    <span className="text-base font-black text-white">
                      {(siteSettings.editorialBoard || []).length} Orang
                    </span>
                  </div>

                  <div className="bg-sky-900/50 p-2.5 rounded-xl border border-sky-800/40">
                    <span className="text-[10px] text-sky-300 block">Tampil di Box Publik</span>
                    <span className="text-base font-black text-emerald-400">
                      {(siteSettings.editorialBoard || []).filter(s => s.isListedInBox).length} Tampil
                    </span>
                  </div>

                  <div className="bg-sky-900/50 p-2.5 rounded-xl border border-sky-800/40">
                    <span className="text-[10px] text-sky-300 block">Status Terdaftar</span>
                    <span className="text-xs font-bold text-yellow-300 truncate block mt-1">
                      {siteSettings.pressCouncilCode || 'Dewan Pers RI'}
                    </span>
                  </div>

                  <div className="bg-sky-900/50 p-2.5 rounded-xl border border-sky-800/40">
                    <span className="text-[10px] text-sky-300 block">Hotline Redaksi</span>
                    <span className="text-xs font-bold text-sky-100 truncate block mt-1">
                      {siteSettings.officialContacts?.hotlineWhatsapp || siteSettings.hotlinePhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toolbar Search & Filter */}
              <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    placeholder="Cari nama, jabatan, atau KTA..."
                    className="w-full pl-9 pr-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-xs text-sky-950 placeholder-slate-400 font-medium focus:ring-2 focus:ring-sky-400"
                  />
                  {staffSearch && (
                    <button
                      onClick={() => setStaffSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <select
                    value={staffPosFilter}
                    onChange={(e) => setStaffPosFilter(e.target.value)}
                    className="px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-xs font-bold text-sky-950 font-mono"
                  >
                    <option value="all">Semua Jabatan Redaksi</option>
                    <option value="pemred">Pemimpin Redaksi / Penanggung Jawab</option>
                    <option value="redaktur">Redaktur Pelaksana & Editor</option>
                    <option value="ombudsman">Ombudsman Pers & Penasihat</option>
                    <option value="desk">Kepala Desk & Multimedia</option>
                    <option value="wartawan">Wartawan & Koresponden</option>
                  </select>

                  <span className="text-xs font-mono text-slate-500 font-medium hidden md:inline">
                    Menampilkan {
                      (siteSettings.editorialBoard || []).filter(s => {
                        const matchSearch = s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
                                            s.position.toLowerCase().includes(staffSearch.toLowerCase()) ||
                                            (s.pressCardNo && s.pressCardNo.toLowerCase().includes(staffSearch.toLowerCase()));
                        const pos = s.position.toLowerCase();
                        if (staffPosFilter === 'pemred') return matchSearch && (pos.includes('pemred') || pos.includes('pemimpin redaksi') || pos.includes('penanggung jawab'));
                        if (staffPosFilter === 'redaktur') return matchSearch && (pos.includes('redaktur') || pos.includes('editor') || pos.includes('managing'));
                        if (staffPosFilter === 'ombudsman') return matchSearch && (pos.includes('ombudsman') || pos.includes('hukum') || pos.includes('penasihat'));
                        if (staffPosFilter === 'desk') return matchSearch && (pos.includes('desk') || pos.includes('multimedia') || pos.includes('teknik') || pos.includes('ai'));
                        if (staffPosFilter === 'wartawan') return matchSearch && (pos.includes('wartawan') || pos.includes('reporter') || pos.includes('koresponden'));
                        return matchSearch;
                      }).length
                    } personel
                  </span>
                </div>
              </div>

              {/* Staff Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(siteSettings.editorialBoard || [])
                  .filter(s => {
                    const matchSearch = s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
                                        s.position.toLowerCase().includes(staffSearch.toLowerCase()) ||
                                        (s.pressCardNo && s.pressCardNo.toLowerCase().includes(staffSearch.toLowerCase()));
                    const pos = s.position.toLowerCase();
                    if (staffPosFilter === 'pemred') return matchSearch && (pos.includes('pemred') || pos.includes('pemimpin redaksi') || pos.includes('penanggung jawab'));
                    if (staffPosFilter === 'redaktur') return matchSearch && (pos.includes('redaktur') || pos.includes('editor') || pos.includes('managing'));
                    if (staffPosFilter === 'ombudsman') return matchSearch && (pos.includes('ombudsman') || pos.includes('hukum') || pos.includes('penasihat'));
                    if (staffPosFilter === 'desk') return matchSearch && (pos.includes('desk') || pos.includes('multimedia') || pos.includes('teknik') || pos.includes('ai'));
                    if (staffPosFilter === 'wartawan') return matchSearch && (pos.includes('wartawan') || pos.includes('reporter') || pos.includes('koresponden'));
                    return matchSearch;
                  })
                  .map((staff) => (
                    <div 
                      key={staff.id}
                      className="bg-white rounded-2xl p-4 border border-sky-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Badge & Toggle */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-yellow-100 text-yellow-900 font-mono font-bold text-[10px] truncate border border-yellow-200">
                            {staff.position}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleStaffBox(staff.id)}
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold flex items-center gap-1 transition-colors ${
                              staff.isListedInBox 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : 'bg-slate-100 text-slate-500 border border-slate-300'
                            }`}
                            title="Klik untuk mengubah penayangan di Box Redaksi Publik"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${staff.isListedInBox ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
                            <span>{staff.isListedInBox ? 'Tampil Publik' : 'Disembunyikan'}</span>
                          </button>
                        </div>

                        {/* Profile Info */}
                        <div className="flex items-start gap-3 mb-3">
                          <img 
                            src={staff.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                            alt={staff.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-200 flex-shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-sm text-sky-950 leading-snug truncate">
                              {staff.name}
                            </h3>
                            <div className="text-[11px] font-mono text-slate-600 mt-1 space-y-0.5">
                              <div className="flex items-center gap-1 truncate text-sky-900">
                                <Phone className="w-3 h-3 text-sky-600 flex-shrink-0" />
                                <span>{staff.phone}</span>
                              </div>
                              <div className="flex items-center gap-1 truncate text-slate-600">
                                <Mail className="w-3 h-3 text-sky-600 flex-shrink-0" />
                                <span className="truncate">{staff.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {staff.pressCardNo && (
                          <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 font-mono text-[10px] text-sky-900 font-bold mb-3 flex items-center justify-between">
                            <span>ID Dewan Pers / KTA:</span>
                            <span className="text-sky-950">{staff.pressCardNo}</span>
                          </div>
                        )}

                        {staff.bio && (
                          <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200 line-clamp-2">
                            "{staff.bio}"
                          </p>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => handleToggleStaffBox(staff.id)}
                          className="text-[10px] font-bold text-sky-800 hover:text-sky-950 underline"
                        >
                          {staff.isListedInBox ? 'Sembunyikan dari Box' : 'Tampilkan di Box'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStaff(staff)}
                            className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3 h-3 text-sky-800" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staff.id, staff.name)}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Quick Settings Link to Official Office Contacts */}
              <div className="p-5 bg-sky-50 rounded-2xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-900 text-yellow-400 flex items-center justify-center font-bold flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-sky-950 font-mono">
                      Butuh Menyesuaikan Alamat Kantor & Email Resmi?
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Ubah hotline WhatsApp, telepon landline, email redaksi, atau alamat gedung di Pengaturan Portal.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="px-3.5 py-2 bg-sky-950 hover:bg-sky-900 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-center flex-shrink-0"
                >
                  <Settings className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Ke Pengaturan Modul & Portal</span>
                </button>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: PENGATURAN IKLAN, SPONSOR & MONETISASI               */}
          {/* ========================================================= */}
          {activeTab === 'advertising' && (
            <AdManagementView
              siteSettings={siteSettings}
              setSiteSettings={setSiteSettings}
              showToast={showToast}
            />
          )}

          {/* ========================================================= */}
          {/* TAB: PENGATURAN WARNA & TEMPLATE PORTAL                   */}
          {/* ========================================================= */}
          {activeTab === 'theme' && (
            <PortalThemeSettingsView
              siteSettings={siteSettings}
              setSiteSettings={setSiteSettings}
              showToast={showToast}
              onBackToPublicPortal={onBackToPublicPortal}
            />
          )}

          {/* ========================================================= */}
          {/* TAB 15: SETTINGS & MODULE TOGGLES */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-6 animate-in fade-in duration-200">
              
              <div className="pb-3 border-b border-sky-100">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-sky-950">
                  Pengaturan Identitas Portal & Saklar Modul Global
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Atur nama portal, kontak redaksi, penempatan iklan komersial, skema warna template, darurat banner BMKG, serta hidup/matikan modul
                </p>
              </div>

              {/* ========================================================= */}
              {/* PANEL PENGATURAN & PENAMBAHAN KATEGORI BERITA REDAKSI     */}
              {/* ========================================================= */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-sky-950 via-slate-900 to-sky-950 text-white border-2 border-yellow-400 shadow-xl space-y-5">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-800/80 pb-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
                      <FolderPlus className="w-6 h-6 text-sky-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black uppercase font-mono tracking-tight text-white">
                          Manajemen &amp; Penambahan Kategori Berita
                        </h3>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-sky-950">
                          {categories.length} Rubrik Aktif
                        </span>
                      </div>
                      <p className="text-xs text-sky-200 mt-0.5 font-medium">
                        Tambah rubrik liputan baru (misal: Politik, Teknologi, Otomotif, Gaya Hidup, dsb.), tentukan ikon visual, warna kanal, dan kelola alokasi berita.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleOpenNewCategoryModal}
                      className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 text-sky-950" />
                      <span>+ Tambah Kategori Baru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('categories')}
                      className="px-3 py-2.5 bg-sky-900 hover:bg-sky-800 text-yellow-300 text-xs font-bold rounded-xl border border-sky-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Lihat Halaman Penuh Rubrik"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Kanal Penuh</span>
                    </button>
                  </div>
                </div>

                {/* Quick Add Inline Bar */}
                <div className="bg-sky-900/60 p-3.5 sm:p-4 rounded-2xl border border-sky-700/80">
                  <span className="text-[11px] font-mono font-bold text-yellow-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Penambahan Cepat (Quick Add):</span>
                  </span>
                  <form onSubmit={handleQuickAddCategory} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-sky-300 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={quickCategoryName}
                        onChange={(e) => setQuickCategoryName(e.target.value)}
                        placeholder="Ketik nama kategori berita baru (contoh: Wisata, Kuliner, Properti, Kesehatan)..."
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-sky-950 rounded-xl border border-sky-700 text-white placeholder-sky-400 font-bold focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md whitespace-nowrap cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-sky-950" />
                      <span>Tambah Sekarang</span>
                    </button>
                  </form>
                  {quickCategoryName.trim() && (
                    <div className="mt-2 text-[10px] font-mono text-sky-300 flex items-center gap-1">
                      <span>Slug otomatis:</span>
                      <strong className="text-yellow-300">
                        /{quickCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Categories Live Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold text-sky-300 uppercase tracking-wider">
                      Daftar Rubrik Terpasang Saat Ini ({categories.length}):
                    </span>
                    <span className="text-[11px] text-sky-400 font-medium">
                      Otomatis sinkron ke Portal Publik &amp; Meja Editor
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((cat, idx) => {
                      const count = articles.filter(
                        (a) => a.category === cat.id || a.category === cat.slug
                      ).length;

                      return (
                        <div
                          key={cat.id}
                          className="p-3.5 rounded-2xl bg-sky-900/40 border border-sky-800 hover:border-yellow-400/80 transition-all flex flex-col justify-between gap-2.5 relative overflow-hidden group"
                        >
                          <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ backgroundColor: cat.color || '#0284c7' }}
                          />

                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-xs flex-shrink-0"
                                  style={{
                                    backgroundColor: (cat.color || '#0284c7') + '30',
                                    color: cat.color || '#38bdf8',
                                  }}
                                >
                                  {renderCategoryIcon(cat.iconName || 'Tag', 'w-4 h-4')}
                                </span>
                                <div>
                                  <h4 className="text-xs font-black text-white uppercase tracking-tight">
                                    {cat.name}
                                  </h4>
                                  <span className="text-[9px] font-mono text-sky-300">
                                    /{cat.slug || cat.id}
                                  </span>
                                </div>
                              </div>

                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-950 text-yellow-300 border border-sky-800">
                                {count} Berita
                              </span>
                            </div>

                            <p className="text-[11px] text-sky-200 mt-2 line-clamp-2 leading-relaxed">
                              {cat.description || `Liputan berita ${cat.name}.`}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-sky-800/80 flex items-center justify-between text-[11px] font-mono">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCategoryModal(cat)}
                              className="px-2 py-1 bg-sky-800 hover:bg-sky-700 text-yellow-300 font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            {cat.id !== 'all' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-rose-800/60"
                                title="Hapus Kategori Berita"
                              >
                                <Trash2 className="w-3 h-3 text-rose-400" />
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Helpful Integration Note */}
                <div className="p-3 bg-sky-900/30 rounded-xl border border-sky-800 text-[11px] text-sky-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Kategori berita yang ditambahkan di sini langsung muncul di <strong>Header / Navigasi Portal</strong>, <strong>Form Editor Berita Redaksi</strong>, <strong>Kirim Warta Warga</strong>, dan <strong>Rekomendasi Berita Terkait</strong>.
                  </span>
                </div>
              </div>

              {/* Panel Pengaturan Warna Template Shortcut */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 text-white border-2 border-yellow-400 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black uppercase font-mono tracking-tight text-white">
                        Pengaturan Warna & Template Desain Portal
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-sky-950">
                        {(siteSettings.portalThemeSettings?.colorTheme || 'sky_gold').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-sky-200 mt-0.5 font-medium">
                      Pilih skema warna terpadu (Biru Samudra, Merah Putih Nasional, Zamrud Khatulistiwa, Cyber Midnight, dsb.) atau atur kode Hex kustom sendiri.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('theme')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-sky-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md flex-shrink-0 active:scale-95 cursor-pointer"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Ganti Warna Template</span>
                  </button>
                </div>
              </div>

              {/* Panel Pengaturan Iklan & Monetisasi Shortcut */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 text-white border-2 border-yellow-400 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black uppercase font-mono tracking-tight text-white">
                        Pengaturan Penempatan Iklan & Monetisasi Portal
                      </h3>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        siteSettings.semSettings?.enableAdPlacements !== false 
                          ? 'bg-emerald-400 text-emerald-950' 
                          : 'bg-red-400 text-red-950'
                      }`}>
                        {siteSettings.semSettings?.enableAdPlacements !== false ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>
                    <p className="text-xs text-sky-200 mt-0.5 font-medium">
                      Atur banner iklan header billboard, sisipan naskah berita, sidebar sticky, pelacak kampanye (SEM/UTM), dan Google AdSense.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('advertising')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 fill-sky-950" />
                    <span>Buka Pengaturan Iklan</span>
                  </button>
                </div>
              </div>

              {/* Emergency Banner Settings */}
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-red-950 font-mono">
                      Spanduk Peringatan Darurat (Emergency Alert)
                    </h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.showEmergencyBanner}
                      onChange={(e) => {
                        setSiteSettings({ ...siteSettings, showEmergencyBanner: e.target.checked });
                        showToast('Status Spanduk Darurat diperbarui.');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                {siteSettings.showEmergencyBanner && (
                  <textarea
                    rows={2}
                    value={siteSettings.emergencyBannerText}
                    onChange={(e) => setSiteSettings({ ...siteSettings, emergencyBannerText: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-red-200 text-xs text-red-950 font-medium"
                    placeholder="Teks peringatan darurat resmi..."
                  />
                )}
              </div>

              {/* Anti-Buzzer Global Toggle & Anti-Spam Settings Panel */}
              <div className="p-5 rounded-2xl bg-emerald-900 text-white border-2 border-emerald-500 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                        <span>Pengaturan Perisai Anti-Spam & Moderasi Komentar Redaksi</span>
                        <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                          AKTIF
                        </span>
                      </h4>
                      <p className="text-xs text-emerald-200 mt-0.5">
                        Kelola aturan perlindungan komentar dari serangan spam, bot promosi ilegal, tautan berbahaya, dan kata-kata provokasi.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={siteSettings.enableAntiBuzzer}
                      onChange={(e) => {
                        setSiteSettings({ ...siteSettings, enableAntiBuzzer: e.target.checked });
                        showToast(`Perisai Anti-Spam & Buzzer ${e.target.checked ? 'Diaktifkan' : 'Dinonaktifkan'}.`);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-emerald-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-400"></div>
                  </label>
                </div>

                {/* Detailed Anti-Spam Controls */}
                {(() => {
                  const antiSpam = siteSettings.antiSpamSettings || {
                    enabled: true,
                    strictness: 'maksimal',
                    autoFilterSpam: true,
                    flagRepeatedText: true,
                    blockHateSpeech: true,
                    filterExternalLinks: true,
                    requireCaptcha: false,
                    rateLimitSeconds: 15,
                    blacklistedKeywords: buzzerConfig.blacklistedKeywords,
                    trustedKeywords: buzzerConfig.trustedKeywords,
                    totalSpamBlocked: 429
                  };

                  const updateAntiSpam = (updated: Partial<typeof antiSpam>) => {
                    const newSettings = { ...antiSpam, ...updated };
                    setSiteSettings({ ...siteSettings, antiSpamSettings: newSettings });
                  };

                  return (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block">Filter Otomatis Link & URL Spam</span>
                            <span className="text-[10px] text-emerald-300">Tahan komentar dengan tautan luar</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={antiSpam.filterExternalLinks}
                            onChange={(e) => updateAntiSpam({ filterExternalLinks: e.target.checked })}
                            className="rounded text-emerald-400 focus:ring-emerald-400 w-4 h-4"
                          />
                        </div>

                        <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block">Deteksi Teks Berulang / Copy-Paste</span>
                            <span className="text-[10px] text-emerald-300">Blokir duplikasi pesan berlebihan</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={antiSpam.flagRepeatedText}
                            onChange={(e) => updateAntiSpam({ flagRepeatedText: e.target.checked })}
                            className="rounded text-emerald-400 focus:ring-emerald-400 w-4 h-4"
                          />
                        </div>

                        <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block">Blokir Ujaran Kebencian & SARA</span>
                            <span className="text-[10px] text-emerald-300">Deteksi kata penghinaan & provokasi</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={antiSpam.blockHateSpeech}
                            onChange={(e) => updateAntiSpam({ blockHateSpeech: e.target.checked })}
                            className="rounded text-emerald-400 focus:ring-emerald-400 w-4 h-4"
                          />
                        </div>
                      </div>

                      {/* Sensitivity & Rate Limit */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-emerald-950/80 p-3.5 rounded-xl border border-emerald-700 space-y-1.5">
                          <label className="font-mono font-bold text-emerald-300 block text-[11px]">
                            Tingkat Sensitivitas Filter Anti-Spam:
                          </label>
                          <div className="grid grid-cols-4 gap-1">
                            {(['rendah', 'standar', 'tinggi', 'maksimal'] as const).map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => {
                                  updateAntiSpam({ strictness: lvl });
                                  setBuzzerConfig({ ...buzzerConfig, strictness: lvl });
                                }}
                                className={`py-1.5 rounded-lg text-[10px] font-black uppercase font-mono transition-all ${
                                  antiSpam.strictness === lvl
                                    ? 'bg-yellow-400 text-emerald-950 shadow-sm'
                                    : 'bg-emerald-900 text-emerald-200 hover:bg-emerald-800'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-emerald-950/80 p-3.5 rounded-xl border border-emerald-700 space-y-1.5">
                          <label className="font-mono font-bold text-emerald-300 block text-[11px]">
                            Jeda Antar Komentar Pengirim (Rate Limit Seconds):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={antiSpam.rateLimitSeconds || 15}
                              onChange={(e) => updateAntiSpam({ rateLimitSeconds: parseInt(e.target.value) || 10 })}
                              className="w-full p-2 bg-emerald-900 rounded-lg border border-emerald-700 text-white font-mono font-bold"
                            />
                            <span className="text-emerald-300 text-xs font-mono">detik</span>
                          </div>
                        </div>
                      </div>

                      {/* Explicit Save Button for Anti-Spam */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSiteSettings({
                              ...siteSettings,
                              antiSpamSettings: antiSpam,
                            });
                            showToast('✅ Pengaturan Anti-Spam & Moderasi Komentar Redaksi Berhasil Disimpan!');
                          }}
                          className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan Pengaturan Anti-Spam Komentar</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Module Visibility Toggles */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-950 mb-3 font-mono">
                  Saklar Tampilan Modul Portal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {Object.entries(siteSettings.moduleToggles).map(([key, isEnabled]) => {
                    const labels: Record<string, string> = {
                      showWeather: 'Tampilkan Cuaca Kota Pantauan',
                      showTrending: 'Tampilkan Topik Hangat (Trending)',
                      showTicker: 'Tampilkan Running News Ticker',
                      showSpotlightHero: 'Tampilkan Spotlight Hero Headline',
                      showTrendingGrid: 'Tampilkan Grid Berita Populer',
                      showEditorPick: 'Tampilkan Berita Pilihan Editor',
                      showPoll: 'Tampilkan Jajak Pendapat / Polling',
                      showVideoNews: 'Tampilkan Modul Video News',
                      showPhotoStories: 'Tampilkan Galeri Foto Jurnalistik',
                      showNewsletter: 'Tampilkan Langganan Buletin',
                      allowCitizenJournalism: 'Izinkan Kirim Warta Warga',
                      enableAntiBuzzer: 'Aktifkan Perisai Anti-Buzzer',
                      enableSeoSem: 'Aktifkan SEO & SEM Iklan',
                      showEditorialBoard: 'Tampilkan Susunan Pengelola & Box Redaksi',
                      showPedomanMediaSiber: 'Tampilkan Pedoman Media Siber (Dewan Pers)'
                    };
                    const labelText = labels[key] || key.replace('show', 'Tampilkan ').replace('allow', 'Izinkan ');
                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-sky-50 rounded-xl border border-sky-200">
                        <span className="font-bold text-sky-950">
                          {labelText}
                        </span>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            setSiteSettings({
                              ...siteSettings,
                              moduleToggles: {
                                ...siteSettings.moduleToggles,
                                [key]: e.target.checked,
                              },
                            });
                            showToast(`Status modul "${labelText}" diperbarui.`);
                          }}
                          className="rounded text-yellow-500 focus:ring-yellow-400"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================= */}
              {/* EDITORIAL LOGIN THEME & TEMPLATE CUSTOMIZATION SECTION   */}
              {/* ========================================================= */}
              <div className="p-5 bg-gradient-to-br from-sky-900 to-sky-950 text-white rounded-3xl border-2 border-yellow-400 shadow-xl space-y-6">
                
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-800/80 pb-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black uppercase tracking-wider font-mono text-white">
                          Pengaturan Template, Warna, Font & Tampilan Login Redaksi
                        </h3>
                        <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          Kustom CMS
                        </span>
                      </div>
                      <p className="text-xs text-sky-200 mt-0.5 font-medium">
                        Ubah tata letak, skema warna, font tipografi, judul, serta elemen visual pada halaman login Pengaturan Admin (<code className="text-yellow-300 font-mono">#/admin</code>)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const loginUrl = `${window.location.origin}${window.location.pathname}#/admin`;
                      window.open(loginUrl, '_blank');
                    }}
                    className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Uji Halaman Login</span>
                  </button>
                </div>

                {/* Helper / Current Config State */}
                {(() => {
                  const currentTheme = siteSettings.loginThemeSettings || {
                    layoutTemplate: 'classic_bento',
                    colorTheme: 'sky_gold',
                    fontFamily: 'plus_jakarta',
                    customPrimaryColor: '#0c4a6e',
                    customAccentColor: '#facc15',
                    titleText: 'Masuk ke Meja Redaksi',
                    subtitleText: 'Kelola seluruh rubrik, naskah berita, running ticker, jajak pendapat, dan modul portal berita Arun News dalam satu sistem terintegrasi.',
                    badgeText: 'Otentikasi Staf Redaksi',
                    loginButtonLabel: 'Buka Meja Redaksi',
                    showQuickDemoAccounts: true,
                    showDedicatedUrlNotice: true,
                    backgroundPattern: 'gradient',
                  };

                  const updateLoginTheme = (updatedFields: Partial<typeof currentTheme>) => {
                    const newTheme = { ...currentTheme, ...updatedFields };
                    setSiteSettings({
                      ...siteSettings,
                      loginThemeSettings: newTheme,
                    });
                    showToast('Pengaturan tampilan login redaksi diperbarui secara otomatis!');
                  };

                  return (
                    <div className="space-y-6">

                      {/* 1. LAYOUT TEMPLATE SELECTION */}
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider text-yellow-300 block mb-2.5 font-mono flex items-center gap-2">
                          <Layout className="w-4 h-4 text-yellow-400" />
                          <span>1. Pilih Template Tata Letak (Layout Template)</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          {[
                            {
                              id: 'classic_bento',
                              title: 'Classic Bento Grid',
                              desc: 'Layout 2-kolom seimbang dengan form & daftar demo akun.',
                              icon: '📊',
                            },
                            {
                              id: 'modern_split',
                              title: 'Modern Split Banner',
                              desc: 'Banner branding pers luas di kiri, form login bersih di kanan.',
                              icon: '🖼️',
                            },
                            {
                              id: 'centered_card',
                              title: 'Centered Minimalist',
                              desc: 'Kartu login terpusat, simpel, bebas dari gangguan visual.',
                              icon: '🎯',
                            },
                            {
                              id: 'executive_dark',
                              title: 'Executive Dark Luxury',
                              desc: 'Mode gelap eksklusif dengan aksen emas & batas kontras tinggi.',
                              icon: '👑',
                            },
                          ].map((tmpl) => {
                            const isSelected = currentTheme.layoutTemplate === tmpl.id;
                            return (
                              <button
                                key={tmpl.id}
                                type="button"
                                onClick={() => updateLoginTheme({ layoutTemplate: tmpl.id as any })}
                                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-yellow-400 text-sky-950 border-yellow-500 font-bold shadow-lg ring-2 ring-yellow-300'
                                    : 'bg-sky-950/80 text-sky-100 border-sky-700/80 hover:bg-sky-800/80'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-lg">{tmpl.icon}</span>
                                    {isSelected && (
                                      <span className="bg-sky-950 text-yellow-300 text-[9px] px-2 py-0.5 rounded-full font-mono font-black uppercase">
                                        Aktif
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-black text-xs uppercase tracking-tight">{tmpl.title}</p>
                                  <p className={`text-[11px] mt-1 leading-snug font-medium ${isSelected ? 'text-sky-900' : 'text-sky-300'}`}>
                                    {tmpl.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. COLOR PALETTE SELECTION */}
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider text-yellow-300 block mb-2.5 font-mono flex items-center gap-2">
                          <Palette className="w-4 h-4 text-yellow-400" />
                          <span>2. Pilih Skema Warna & Palette (Color Theme)</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                          {[
                            { id: 'sky_gold', name: 'Sky & Gold', primary: '#0c4a6e', accent: '#facc15' },
                            { id: 'emerald_amber', name: 'Emerald & Amber', primary: '#064e3b', accent: '#fbbf24' },
                            { id: 'royal_purple', name: 'Royal Purple', primary: '#581c87', accent: '#e879f9' },
                            { id: 'midnight_cyan', name: 'Midnight & Cyan', primary: '#0f172a', accent: '#22d3ee' },
                            { id: 'crimson_rose', name: 'Crimson & Rose', primary: '#881337', accent: '#fb7185' },
                            { id: 'custom', name: 'Kustom Hex', primary: currentTheme.customPrimaryColor || '#0c4a6e', accent: currentTheme.customAccentColor || '#facc15' },
                          ].map((theme) => {
                            const isSelected = currentTheme.colorTheme === theme.id;
                            return (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => updateLoginTheme({ colorTheme: theme.id as any })}
                                className={`p-2.5 rounded-2xl border text-left transition-all ${
                                  isSelected
                                    ? 'bg-sky-800 border-yellow-400 ring-2 ring-yellow-400'
                                    : 'bg-sky-950/60 border-sky-800 hover:bg-sky-900/60'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <div className="w-4 h-4 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: theme.primary }} />
                                  <div className="w-4 h-4 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: theme.accent }} />
                                </div>
                                <p className="font-bold text-[11px] text-white truncate">{theme.name}</p>
                                <span className="text-[9px] text-sky-300 font-mono">
                                  {isSelected ? '✓ Terpilih' : 'Pilih'}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Hex Color Pickers if colorTheme === 'custom' */}
                        {currentTheme.colorTheme === 'custom' && (
                          <div className="mt-3 p-3.5 bg-sky-950/90 rounded-2xl border border-sky-700 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="text-[11px] font-mono font-bold text-sky-200 block mb-1">
                                Warna Utama Latar (Primary Hex Color):
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={currentTheme.customPrimaryColor || '#0c4a6e'}
                                  onChange={(e) => updateLoginTheme({ customPrimaryColor: e.target.value })}
                                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                />
                                <input
                                  type="text"
                                  value={currentTheme.customPrimaryColor || '#0c4a6e'}
                                  onChange={(e) => updateLoginTheme({ customPrimaryColor: e.target.value })}
                                  className="flex-1 p-1.5 bg-sky-900 rounded-lg border border-sky-700 text-white font-mono text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] font-mono font-bold text-sky-200 block mb-1">
                                Warna Aksen Tombol (Accent Hex Color):
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={currentTheme.customAccentColor || '#facc15'}
                                  onChange={(e) => updateLoginTheme({ customAccentColor: e.target.value })}
                                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                />
                                <input
                                  type="text"
                                  value={currentTheme.customAccentColor || '#facc15'}
                                  onChange={(e) => updateLoginTheme({ customAccentColor: e.target.value })}
                                  className="flex-1 p-1.5 bg-sky-900 rounded-lg border border-sky-700 text-white font-mono text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. FONT FAMILY SELECTION */}
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider text-yellow-300 block mb-2.5 font-mono flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-yellow-400" />
                          <span>3. Pilih Font Tipografi (Font Family)</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                          {[
                            { id: 'plus_jakarta', name: 'Plus Jakarta Sans', fontClass: 'font-sans', desc: 'Sangat rapi, modern & bersih' },
                            { id: 'playfair_serif', name: 'Playfair & Merriweather', fontClass: 'font-serif', desc: 'Gaya majalah & editorial klasik' },
                            { id: 'jetbrains_mono', name: 'JetBrains Mono', fontClass: 'font-mono', desc: 'Gaya teknologi & kode pers' },
                            { id: 'syne_display', name: 'Syne & Montserrat', fontClass: 'font-sans font-black', desc: 'Display bold berkesan tegas' },
                          ].map((font) => {
                            const isSelected = currentTheme.fontFamily === font.id;
                            return (
                              <button
                                key={font.id}
                                type="button"
                                onClick={() => updateLoginTheme({ fontFamily: font.id as any })}
                                className={`p-3 rounded-2xl border text-left transition-all ${
                                  isSelected
                                    ? 'bg-yellow-400 text-sky-950 border-yellow-500 font-bold ring-2 ring-yellow-300'
                                    : 'bg-sky-950/70 text-sky-100 border-sky-800 hover:bg-sky-900/70'
                                }`}
                              >
                                <p className={`text-sm font-bold truncate ${font.fontClass}`}>
                                  {font.name}
                                </p>
                                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-sky-950' : 'text-sky-300'}`}>
                                  {font.desc}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 4. CUSTOM HEADLINES & BUTTON TEXTS */}
                      <div className="bg-sky-950/80 p-4 rounded-2xl border border-sky-800 space-y-3 text-xs">
                        <label className="text-xs font-black uppercase tracking-wider text-yellow-300 block font-mono flex items-center gap-2">
                          <FileText className="w-4 h-4 text-yellow-400" />
                          <span>4. Teks Judul & Label Tombol Login</span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-mono font-bold text-sky-200 block mb-1">
                              Judul Utama Halaman Login:
                            </label>
                            <input
                              type="text"
                              value={currentTheme.titleText}
                              onChange={(e) => updateLoginTheme({ titleText: e.target.value })}
                              placeholder="Masuk ke Meja Redaksi"
                              className="w-full p-2 bg-sky-900 rounded-xl border border-sky-700 text-white font-bold focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono font-bold text-sky-200 block mb-1">
                              Teks Badge Status (Header Kartu):
                            </label>
                            <input
                              type="text"
                              value={currentTheme.badgeText}
                              onChange={(e) => updateLoginTheme({ badgeText: e.target.value })}
                              placeholder="Otentikasi Staf Redaksi"
                              className="w-full p-2 bg-sky-900 rounded-xl border border-sky-700 text-white font-medium focus:ring-2 focus:ring-yellow-400 font-mono"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[11px] font-mono font-bold text-sky-200 block mb-1">
                              Subjudul / Deskripsi Login:
                            </label>
                            <input
                              type="text"
                              value={currentTheme.subtitleText}
                              onChange={(e) => updateLoginTheme({ subtitleText: e.target.value })}
                              placeholder="Kelola seluruh naskah, berita, running ticker..."
                              className="w-full p-2 bg-sky-900 rounded-xl border border-sky-700 text-white font-medium focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono font-bold text-sky-200 block mb-1">
                              Label Tombol Login Utama:
                            </label>
                            <input
                              type="text"
                              value={currentTheme.loginButtonLabel}
                              onChange={(e) => updateLoginTheme({ loginButtonLabel: e.target.value })}
                              placeholder="Buka Meja Redaksi"
                              className="w-full p-2 bg-sky-900 rounded-xl border border-sky-700 text-yellow-300 font-bold focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono font-bold text-sky-200 block mb-1">
                              Upload Logo Login dari Lokal / URL:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={currentTheme.customLogoUrl || ''}
                                onChange={(e) => updateLoginTheme({ customLogoUrl: e.target.value })}
                                placeholder="URL Logo (https://...)"
                                className="flex-1 p-2 bg-sky-900 rounded-xl border border-sky-700 text-white font-mono text-xs focus:ring-2 focus:ring-yellow-400"
                              />
                              <label className="cursor-pointer bg-yellow-400 hover:bg-yellow-300 text-sky-950 px-3 py-2 rounded-xl text-[11px] font-black transition-colors flex items-center gap-1 shadow-md whitespace-nowrap">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Logo Lokal</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (evt) => {
                                        if (evt.target?.result) {
                                          const logoUri = evt.target.result as string;
                                          updateLoginTheme({ customLogoUrl: logoUri });
                                          setSiteSettings({
                                            ...siteSettings,
                                            customLogoUrl: logoUri,
                                            loginThemeSettings: { ...currentTheme, customLogoUrl: logoUri }
                                          });
                                          showToast('Logo portal berhasil diunggah dari lokal!');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-mono font-bold text-sky-200 block mb-1">
                              Upload Gambar Latar Custom dari Lokal / URL:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={currentTheme.customBgImageUrl || ''}
                                onChange={(e) => updateLoginTheme({ customBgImageUrl: e.target.value })}
                                placeholder="URL Background (https://...)"
                                className="flex-1 p-2 bg-sky-900 rounded-xl border border-sky-700 text-white font-mono text-xs focus:ring-2 focus:ring-yellow-400"
                              />
                              <label className="cursor-pointer bg-yellow-400 hover:bg-yellow-300 text-sky-950 px-3 py-2 rounded-xl text-[11px] font-black transition-colors flex items-center gap-1 shadow-md whitespace-nowrap">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Latar Lokal</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (evt) => {
                                        if (evt.target?.result) {
                                          updateLoginTheme({ customBgImageUrl: evt.target.result as string });
                                          showToast('Gambar latar login berhasil diunggah!');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5. OTORISASI & KEAMANAN LOGIN REDAKSI */}
                      <div className="bg-sky-950/80 p-4 rounded-2xl border border-yellow-400/50 space-y-3 text-xs">
                        <label className="text-xs font-black uppercase tracking-wider text-yellow-300 block font-mono flex items-center gap-2">
                          <Shield className="w-4 h-4 text-yellow-400" />
                          <span>5. Otorisasi & Keamanan Login Redaksi</span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center justify-between p-3 bg-sky-900/80 rounded-xl border border-sky-700">
                            <div>
                              <span className="font-bold text-white block">Wajibkan PIN Keamanan Otorisasi</span>
                              <span className="text-[10px] text-sky-300">Meminta PIN 6-digit saat staf masuk</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={!!currentTheme.requireSecurityPin}
                              onChange={(e) => updateLoginTheme({ requireSecurityPin: e.target.checked })}
                              className="rounded text-yellow-400 focus:ring-yellow-400 w-4 h-4"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono font-bold text-sky-200 block mb-1">
                              Kode PIN Otorisasi Redaksi (6 Digit):
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={currentTheme.securityPinCode || '123456'}
                              onChange={(e) => updateLoginTheme({ securityPinCode: e.target.value })}
                              placeholder="123456"
                              className="w-full p-2 bg-sky-900 rounded-xl border border-sky-700 text-yellow-300 font-bold font-mono text-center tracking-widest focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-sky-900/80 rounded-xl border border-sky-700">
                            <div>
                              <span className="font-bold text-white block">Otentikasi 2FA / OTP Simulasi</span>
                              <span className="text-[10px] text-sky-300">Akses keamanan dua langkah untuk akun Pemred</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={!!currentTheme.enable2FAAuthorization}
                              onChange={(e) => updateLoginTheme({ enable2FAAuthorization: e.target.checked })}
                              className="rounded text-yellow-400 focus:ring-yellow-400 w-4 h-4"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono font-bold text-sky-200 block mb-1">
                              Timeout Sesi Selesai (Menit):
                            </label>
                            <input
                              type="number"
                              value={currentTheme.sessionTimeoutMinutes || 60}
                              onChange={(e) => updateLoginTheme({ sessionTimeoutMinutes: parseInt(e.target.value) || 60 })}
                              className="w-full p-2 bg-sky-900 rounded-xl border border-sky-700 text-white font-bold font-mono focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 6. VISUAL TOGGLES & DEMO BOX */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center justify-between p-3.5 bg-sky-950/80 rounded-2xl border border-sky-800">
                          <div>
                            <span className="font-bold text-white block">Tampilkan Akses Cepat Akun Demo (1-Klik)</span>
                            <span className="text-[10px] text-sky-300">Menampilkan tombol login instan Pemred, Redpel, & Visual</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={currentTheme.showQuickDemoAccounts !== false}
                            onChange={(e) => updateLoginTheme({ showQuickDemoAccounts: e.target.checked })}
                            className="rounded text-yellow-400 focus:ring-yellow-400 w-4 h-4"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-sky-950/80 rounded-2xl border border-sky-800">
                          <div>
                            <span className="font-bold text-white block">Tampilkan Banner Informasi Tautan URL</span>
                            <span className="text-[10px] text-sky-300">Menampilkan kotak penyalin link langsung di atas login</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={currentTheme.showDedicatedUrlNotice !== false}
                            onChange={(e) => updateLoginTheme({ showDedicatedUrlNotice: e.target.checked })}
                            className="rounded text-yellow-400 focus:ring-yellow-400 w-4 h-4"
                          />
                        </div>
                      </div>

                      {/* EXPLICIT SAVE BUTTON FOR TEMPLATE, FONT, COLOR & LOGIN SETTINGS */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSiteSettings({
                              ...siteSettings,
                              loginThemeSettings: currentTheme,
                            });
                            showToast('✅ Pengaturan Template, Font, Skema Warna & Label Login Redaksi Berhasil Disimpan!');
                          }}
                          className="w-full py-3.5 px-6 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xl border-2 border-yellow-300 transition-all flex items-center justify-center gap-2"
                        >
                          <Save className="w-5 h-5 text-sky-950" />
                          <span>Simpan Pengaturan Template, Font, Palette & Otorisasi Login</span>
                        </button>
                      </div>

                      {/* MINI PRATINJAU / LIVE PREVIEW INDICATOR */}
                      <div className="p-4 bg-sky-950 rounded-2xl border border-yellow-400/60 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-yellow-400 animate-pulse" />
                          <div>
                            <span className="font-bold text-white block">Pratinjau Status Pengaturan:</span>
                            <span className="text-[11px] text-sky-300 font-mono">
                              Template: <strong className="text-yellow-300">{currentTheme.layoutTemplate}</strong> • Palette: <strong className="text-yellow-300">{currentTheme.colorTheme}</strong> • Font: <strong className="text-yellow-300">{currentTheme.fontFamily}</strong>
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const loginUrl = `${window.location.origin}${window.location.pathname}#/admin`;
                            window.open(loginUrl, '_blank');
                          }}
                          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-bold rounded-lg transition-colors text-[11px] font-mono flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Uji Halaman</span>
                        </button>
                      </div>

                    </div>
                  );
                })()}

              </div>

              {/* Identity & Office Contacts Editor */}
              <div className="p-4 sm:p-5 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-4">
                <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-800" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono">
                      Identitas & Kontak Resmi Portal ARUN NEWS
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-200 px-2 py-0.5 rounded-md">
                    Terverifikasi Dewan Pers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Nama Portal</label>
                    <input
                      type="text"
                      value={siteSettings.portalName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, portalName: e.target.value })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-bold focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Upload Logo Portal (Lokal)</label>
                    <div className="flex items-center gap-2">
                      <img
                        src={siteSettings.customLogoUrl || "/whats_app_image_2026_08_01_at_14_48_objq0v5gsu.58.png"}
                        alt="Logo"
                        className="w-8 h-8 rounded-full object-contain bg-white border border-yellow-400 flex-shrink-0"
                      />
                      <label className="flex-1 cursor-pointer bg-sky-950 hover:bg-sky-900 text-yellow-300 px-3 py-1.5 rounded-xl text-[11px] font-bold text-center transition-colors truncate">
                        <span>📷 Unggah Logo Lokal</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                if (evt.target?.result) {
                                  const logoUri = evt.target.result as string;
                                  setSiteSettings({
                                    ...siteSettings,
                                    customLogoUrl: logoUri,
                                    loginThemeSettings: {
                                      ...(siteSettings.loginThemeSettings || {} as any),
                                      customLogoUrl: logoUri
                                    }
                                  });
                                  showToast('Logo portal Arun News berhasil diperbarui dari lokal!');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Tagline Utama</label>
                    <input
                      type="text"
                      value={siteSettings.portalTagline}
                      onChange={(e) => setSiteSettings({ ...siteSettings, portalTagline: e.target.value })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-medium focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Sub-Tagline</label>
                    <input
                      type="text"
                      value={siteSettings.subTagline || 'Menghubungkan Nusantara dengan Berita Terpercaya'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, subTagline: e.target.value })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-medium focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Hotline WhatsApp 24/7</label>
                    <input
                      type="text"
                      value={siteSettings.officialContacts?.hotlineWhatsapp || siteSettings.hotlinePhone || '+62 812-5550-0826'}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        hotlinePhone: e.target.value,
                        officialContacts: {
                          ...(siteSettings.officialContacts || {
                            officePhone: '(021) 555-0826',
                            editorialEmail: 'redaksi@arunnews.id',
                            advertisingEmail: 'iklan@arunnews.id',
                            pressOmbudsmanEmail: 'ombudsman@arunnews.id',
                            officeAddress: siteSettings.officeAddress,
                            operatingHours: '24 Jam Non-Stop',
                            pressCouncilCode: siteSettings.pressCouncilCode
                          }),
                          hotlineWhatsapp: e.target.value
                        }
                      })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-mono focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">No. Telepon Kantor (Landline)</label>
                    <input
                      type="text"
                      value={siteSettings.officialContacts?.officePhone || '(021) 555-0826 / (021) 555-0827'}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        officialContacts: {
                          ...(siteSettings.officialContacts || {
                            hotlineWhatsapp: siteSettings.hotlinePhone,
                            editorialEmail: 'redaksi@arunnews.id',
                            advertisingEmail: 'iklan@arunnews.id',
                            pressOmbudsmanEmail: 'ombudsman@arunnews.id',
                            officeAddress: siteSettings.officeAddress,
                            operatingHours: '24 Jam Non-Stop',
                            pressCouncilCode: siteSettings.pressCouncilCode
                          }),
                          officePhone: e.target.value
                        }
                      })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-mono focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Email Utama Redaksi</label>
                    <input
                      type="email"
                      value={siteSettings.editorialEmail}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        editorialEmail: e.target.value,
                        officialContacts: {
                          ...(siteSettings.officialContacts || {
                            hotlineWhatsapp: siteSettings.hotlinePhone,
                            officePhone: '(021) 555-0826',
                            advertisingEmail: 'iklan@arunnews.id',
                            pressOmbudsmanEmail: 'ombudsman@arunnews.id',
                            officeAddress: siteSettings.officeAddress,
                            operatingHours: '24 Jam Non-Stop',
                            pressCouncilCode: siteSettings.pressCouncilCode
                          }),
                          editorialEmail: e.target.value
                        }
                      })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-mono focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Email Pemasangan Iklan</label>
                    <input
                      type="email"
                      value={siteSettings.officialContacts?.advertisingEmail || 'iklan@arunnews.id'}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        officialContacts: {
                          ...(siteSettings.officialContacts || {
                            hotlineWhatsapp: siteSettings.hotlinePhone,
                            officePhone: '(021) 555-0826',
                            editorialEmail: siteSettings.editorialEmail,
                            pressOmbudsmanEmail: 'ombudsman@arunnews.id',
                            officeAddress: siteSettings.officeAddress,
                            operatingHours: '24 Jam Non-Stop',
                            pressCouncilCode: siteSettings.pressCouncilCode
                          }),
                          advertisingEmail: e.target.value
                        }
                      })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-mono focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Email Ombudsman Pers</label>
                    <input
                      type="email"
                      value={siteSettings.officialContacts?.pressOmbudsmanEmail || 'ombudsman@arunnews.id'}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        officialContacts: {
                          ...(siteSettings.officialContacts || {
                            hotlineWhatsapp: siteSettings.hotlinePhone,
                            officePhone: '(021) 555-0826',
                            editorialEmail: siteSettings.editorialEmail,
                            advertisingEmail: 'iklan@arunnews.id',
                            officeAddress: siteSettings.officeAddress,
                            operatingHours: '24 Jam Non-Stop',
                            pressCouncilCode: siteSettings.pressCouncilCode
                          }),
                          pressOmbudsmanEmail: e.target.value
                        }
                      })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-mono focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Kode Terdaftar Dewan Pers</label>
                    <input
                      type="text"
                      value={siteSettings.pressCouncilCode}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        pressCouncilCode: e.target.value,
                        officialContacts: {
                          ...(siteSettings.officialContacts || {
                            hotlineWhatsapp: siteSettings.hotlinePhone,
                            officePhone: '(021) 555-0826',
                            editorialEmail: siteSettings.editorialEmail,
                            advertisingEmail: 'iklan@arunnews.id',
                            pressOmbudsmanEmail: 'ombudsman@arunnews.id',
                            officeAddress: siteSettings.officeAddress,
                            operatingHours: '24 Jam Non-Stop'
                          }),
                          pressCouncilCode: e.target.value
                        }
                      })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-mono focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Alamat Lengkap Gedung Redaksi</label>
                    <input
                      type="text"
                      value={siteSettings.officeAddress}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        officeAddress: e.target.value,
                        officialContacts: {
                          ...(siteSettings.officialContacts || {
                            hotlineWhatsapp: siteSettings.hotlinePhone,
                            officePhone: '(021) 555-0826',
                            editorialEmail: siteSettings.editorialEmail,
                            advertisingEmail: 'iklan@arunnews.id',
                            pressOmbudsmanEmail: 'ombudsman@arunnews.id',
                            operatingHours: '24 Jam Non-Stop',
                            pressCouncilCode: siteSettings.pressCouncilCode
                          }),
                          officeAddress: e.target.value
                        }
                      })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-medium focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">Jam Operasional Redaksi</label>
                    <input
                      type="text"
                      value={siteSettings.officialContacts?.operatingHours || 'Senin - Minggu | 24 Jam Non-Stop'}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        officialContacts: {
                          ...(siteSettings.officialContacts || {
                            hotlineWhatsapp: siteSettings.hotlinePhone,
                            officePhone: '(021) 555-0826',
                            editorialEmail: siteSettings.editorialEmail,
                            advertisingEmail: 'iklan@arunnews.id',
                            pressOmbudsmanEmail: 'ombudsman@arunnews.id',
                            officeAddress: siteSettings.officeAddress,
                            pressCouncilCode: siteSettings.pressCouncilCode
                          }),
                          operatingHours: e.target.value
                        }
                      })}
                      className="w-full p-2 bg-white rounded-xl border border-sky-200 text-sky-950 font-medium focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Susunan Pengelola Redaksi Editor Section */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-sky-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 pb-3">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-950 font-mono flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-700" />
                      Susunan Pengelola Redaksi & Struktur Jurnalis
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kelola jajaran Pemimpin Redaksi, Redaktur Pelaksana, Ombudsman, serta Wartawan yang tampil di Box Redaksi Publik.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddStaff}
                    className="px-3.5 py-1.5 bg-sky-950 hover:bg-sky-900 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-yellow-400" />
                    <span>Tambah Anggota Redaksi</span>
                  </button>
                </div>

                {/* Staff Cards List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(siteSettings.editorialBoard || []).map((staff) => (
                    <div 
                      key={staff.id}
                      className="p-3 bg-sky-50/50 rounded-2xl border border-sky-200 flex items-start gap-3 hover:shadow-xs transition-shadow"
                    >
                      <img 
                        src={staff.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                        alt={staff.name}
                        className="w-12 h-12 rounded-xl object-cover border border-sky-200 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-yellow-800 bg-yellow-100 px-1.5 py-0.5 rounded-md truncate">
                            {staff.position}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${staff.isListedInBox ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                            {staff.isListedInBox ? 'Tampil di Box' : 'Sembunyi'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sky-950 truncate">{staff.name}</h4>
                        <div className="text-[11px] text-slate-600 font-mono flex items-center gap-2 mt-0.5">
                          <span>{staff.phone}</span>
                          <span>•</span>
                          <span className="truncate">{staff.email}</span>
                        </div>
                        {staff.pressCardNo && (
                          <span className="text-[10px] font-mono text-sky-700 block mt-0.5">
                            ID: {staff.pressCardNo}
                          </span>
                        )}

                        <div className="mt-2 pt-1.5 border-t border-sky-200/60 flex items-center justify-end gap-2 text-[11px] font-mono">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStaff(staff)}
                            className="px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staff.id, staff.name)}
                            className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Reset */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-600 block">Reset Data ke Bawaan Awal</span>
                  <span className="text-[11px] text-slate-500">Kembalikan artikel dan pengaturan modul ke konfigurasi default</span>
                </div>
                <button
                  type="button"
                  onClick={onResetAllData}
                  className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl border border-red-300 transition-colors"
                >
                  Reset Semua Data
                </button>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* Article Create & Edit Modal */}
      <ArticleEditorModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onSave={handleSaveArticle}
        editingArticle={editingArticle}
        categories={categories}
      />

      {/* Editorial Staff Add/Edit Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-sky-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-sky-200 overflow-hidden my-auto">
            
            {/* Header Modal */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-950 to-sky-900 text-white flex items-center justify-between border-b border-sky-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-black uppercase tracking-wider font-mono">
                  {editingStaff ? 'Edit Anggota Pengelola Redaksi' : 'Tambah Anggota Redaksi Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-sky-800 text-sky-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Photo Preview & URL input */}
              <div>
                <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                  Foto Profil (URL Gambar)
                </label>
                <div className="flex items-center gap-3">
                  <img 
                    src={staffForm.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                    alt="Preview"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-300 flex-shrink-0 shadow-2xs"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={staffForm.photoUrl}
                        onChange={(e) => setStaffForm({ ...staffForm, photoUrl: e.target.value })}
                        placeholder="URL Foto (https://...)"
                        className="flex-1 p-2 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono text-[11px]"
                      />
                      <label className="cursor-pointer bg-sky-950 hover:bg-sky-900 text-yellow-300 px-3 py-2 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs whitespace-nowrap">
                        <Camera className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Upload Lokal</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                if (evt.target?.result) {
                                  setStaffForm({ ...staffForm, photoUrl: evt.target.result as string });
                                  showToast('Foto profil lokal berhasil diunggah!');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-slate-500 font-mono self-center">Pilih Avatar Cepat:</span>
                      {[
                        { label: 'Pria 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
                        { label: 'Wanita 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
                        { label: 'Pria 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
                        { label: 'Wanita 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
                        { label: 'Pria 3', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setStaffForm({ ...staffForm, photoUrl: preset.url })}
                          className="px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-900 text-[10px] font-mono font-bold rounded-lg border border-sky-300"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nama Lengkap & Jabatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Nama Lengkap & Gelar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    placeholder="Contoh: Drs. H. Surya Pratama, M.Si."
                    className="w-full p-2 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Jabatan Redaksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={staffForm.position}
                    onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                    placeholder="Pemimpin Redaksi / Redaktur / Ombudsman"
                    className="w-full p-2 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-bold"
                  />
                </div>
              </div>

              {/* Phone HP/WA & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    No. HP / WhatsApp Resmi
                  </label>
                  <input
                    type="text"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="+62 812-8899-0123"
                    className="w-full p-2 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Email Redaksi
                  </label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="surya.pratama@arunnews.id"
                    className="w-full p-2 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono"
                  />
                </div>
              </div>

              {/* No Kartu Pers & Status Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    No. Kartu Pers / Dewan Pers ID
                  </label>
                  <input
                    type="text"
                    value={staffForm.pressCardNo || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, pressCardNo: e.target.value })}
                    placeholder="DP-2026-08129"
                    className="w-full p-2 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-sky-50 rounded-xl border border-sky-200 self-end">
                  <span className="text-[11px] font-mono font-bold text-sky-950">
                    Tampilkan di Box Redaksi Publik
                  </span>
                  <input
                    type="checkbox"
                    checked={staffForm.isListedInBox}
                    onChange={(e) => setStaffForm({ ...staffForm, isListedInBox: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-950 focus:ring-sky-800"
                  />
                </div>
              </div>

              {/* Bio / Deskripsi */}
              <div>
                <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                  Bio / Keterangan Singkat Pengalaman Jurnalistik
                </label>
                <textarea
                  rows={3}
                  value={staffForm.bio || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, bio: e.target.value })}
                  placeholder="Wartawan Utama Sertifikasi Dewan Pers RI, Pengalaman 15 Tahun..."
                  className="w-full p-2 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-medium"
                />
              </div>

            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-sky-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-mono font-bold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStaff}
                className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Save className="w-4 h-4 text-yellow-400" />
                <span>Simpan Pengelola</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Jadwal Transportasi */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full border-2 border-sky-900 shadow-2xl overflow-hidden my-auto">
            
            {/* Header Modal */}
            <div className="bg-sky-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-sky-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-yellow-400 text-sky-950 flex items-center justify-center font-black">
                  <Train className="w-5 h-5 text-sky-950" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-white font-mono">
                    {editingSchedule ? 'Edit Jadwal Transportasi' : 'Tambah Jadwal Keberangkatan'}
                  </h3>
                  <p className="text-[11px] text-sky-200">
                    Sistem pembaruan jadwal rute armada terpadu ARUN NEWS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSchedule} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Moda Transportasi */}
              <div>
                <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                  Moda Transportasi <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['bus', 'kereta', 'pesawat', 'kapal'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setScheduleForm({ ...scheduleForm, mode: m })}
                      className={`p-2.5 rounded-xl border font-mono font-bold uppercase text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        scheduleForm.mode === m
                          ? 'bg-sky-950 text-yellow-300 border-sky-900 shadow-xs'
                          : 'bg-sky-50 text-slate-700 border-sky-200 hover:bg-sky-100'
                      }`}
                    >
                      {m === 'bus' && <Bus className="w-4 h-4" />}
                      {m === 'kereta' && <Train className="w-4 h-4" />}
                      {m === 'pesawat' && <Plane className="w-4 h-4" />}
                      {m === 'kapal' && <Ship className="w-4 h-4" />}
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Operator / Nama Armada */}
              <div>
                <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                  Nama Operator / Armada / Maskapai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={scheduleForm.operator}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, operator: e.target.value })}
                  placeholder="Contoh: PO Sinar Jaya / KA Argo Bromo Anggrek / Garuda Indonesia"
                  className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-bold focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              {/* Rute Keberangkatan & Kedatangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Kota Asal / Terminal / Stasiun <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.routeFrom}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, routeFrom: e.target.value })}
                    placeholder="Contoh: Jakarta (Terminal Pulo Gebang)"
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Kota Tujuan / Terminal / Stasiun <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.routeTo}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, routeTo: e.target.value })}
                    placeholder="Contoh: Yogyakarta (Terminal Giwangan)"
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Waktu Keberangkatan & Tiba */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Jam Keberangkatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.departureTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, departureTime: e.target.value })}
                    placeholder="Contoh: 07:30 WIB"
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Jam Kedatangan (Estimasi) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.arrivalTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, arrivalTime: e.target.value })}
                    placeholder="Contoh: 16:00 WIB"
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Status Keberangkatan & Harga Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Status Armada Saat Ini
                  </label>
                  <select
                    value={scheduleForm.status}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        status: e.target.value as TransportSchedule['status']
                      })
                    }
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono font-bold"
                  >
                    <option value="Tepat Waktu">Tepat Waktu</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                    Info Tarif / Harga Tiket
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.priceInfo}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, priceInfo: e.target.value })}
                    placeholder="Contoh: Rp 210.000 / Executive Class"
                    className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-mono"
                  />
                </div>
              </div>

              {/* Catatan Keterangan Tambahan */}
              <div>
                <label className="text-[11px] font-mono font-bold text-sky-950 block mb-1">
                  Catatan Redaksi / Peron / Gate / Jalur Tol
                </label>
                <textarea
                  rows={2}
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="Contoh: Berangkat dari Gate 3, Jalur Tol Trans-Jawa..."
                  className="w-full p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 font-medium"
                />
              </div>

              {/* Footer Modal */}
              <div className="pt-3 border-t border-sky-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-mono font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-950 hover:bg-sky-900 text-yellow-400 font-mono font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-yellow-400" />
                  <span>{editingSchedule ? 'Simpan Perubahan' : 'Tambah Jadwal'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Category Editor Modal for Adding / Editing News Categories */}
      <CategoryEditorModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSaveCategory={handleSaveCategory}
        editingCategory={editingCategory}
        existingCategories={categories}
      />

    </div>
  );
};
