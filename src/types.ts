export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface NewsComment {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isVerified?: boolean;
  isBuzzerSuspect?: boolean;
  buzzerReasons?: string[];
  isHeldForReview?: boolean;
  reportsCount?: number;
  reportedReasons?: string[];
}

export interface SEOMetadata {
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogImage?: string;
  ogType?: 'article' | 'website' | 'news';
  twitterCard?: 'summary_large_image' | 'summary';
  schemaType?: 'NewsArticle' | 'BlogPosting' | 'TechArticle' | 'Report';
  targetKeywords?: string[];
  seoScore?: number; // 0 - 100
  // SEM & Advertorial
  isSponsored?: boolean;
  sponsorBrand?: string;
  sponsorUrl?: string;
  utmCampaign?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  paragraphs: string[];
  category: string;
  categoryLabel: string;
  author: Author;
  publishedAt: string;
  readTime: string;
  imageUrl: string;
  imageCaption: string;
  views: number;
  likes: number;
  shares: number;
  tags: string[];
  isHeadline?: boolean;
  isBreaking?: boolean;
  isEditorPick?: boolean;
  isTrending?: boolean;
  trendingRank?: number;
  keyTakeaways: string[];
  comments: NewsComment[];
  reactions?: {
    like?: number;
    insightful?: number;
    shocking?: number;
    fire?: number;
    heart?: number;
    sad?: number;
    [key: string]: number | undefined;
  };
  seo?: SEOMetadata;
  sentiment?: {
    label: 'Positif' | 'Netral' | 'Negatif';
    score: number; // e.g. 0 to 100 or -100 to 100
    confidence: number;
    summary: string;
  };
  status?: 'published' | 'pending' | 'draft';
  scheduledPublishAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  color?: string;
}

export type TransportMode = 'bus' | 'kereta' | 'pesawat' | 'kapal';

export interface TransportSchedule {
  id: string;
  mode: TransportMode;
  operator: string;
  routeFrom: string;
  routeTo: string;
  departureTime: string;
  arrivalTime: string;
  status: 'Tepat Waktu' | 'Terlambat' | 'Dibatalkan' | 'Boarding' | 'Dalam Perjalanan';
  priceInfo?: string;
  notes?: string;
  updatedAt: string;
}

export interface WeatherInfo {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  icon: string;
}

export interface TrendingTopic {
  id: string;
  tag: string;
  postsCount: string;
  category: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollData {
  id: string;
  question: string;
  description: string;
  totalVotes: number;
  options: PollOption[];
  userVotedOptionId?: string;
  closedAt: string;
}

export interface EditorialPiece {
  id: string;
  title: string;
  quote: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  articleId: string;
}

export interface VideoNews {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  views: string;
  publishedAt: string;
  category: string;
  videoUrl?: string;
}

export interface PhotoStory {
  id: string;
  title: string;
  location: string;
  photoCount: number;
  imageUrl: string;
  photographer: string;
  date: string;
}

export type EditorialRole = 'pemred' | 'redaktur_pelaksana' | 'editor' | 'reporter' | 'multimedia';

export interface EditorialUser {
  id: string;
  name: string;
  email: string;
  role: EditorialRole;
  roleTitle: string;
  avatar: string;
  department: string;
  lastLogin?: string;
}

export interface AdSlot {
  id: string;
  name: string;
  position: 'top_billboard' | 'in_article' | 'sidebar_sticky' | 'bottom_sticky';
  isEnabled: boolean;
  type: 'google_ads' | 'custom_banner' | 'video_banner' | 'advertorial';
  mediaType?: 'image' | 'video';
  advertiserName: string;
  bannerImage: string;
  videoUrl?: string;
  targetUrl: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  priceRate?: string;
  dimensions?: string;
  htmlScript?: string;
  badgeText?: string;
  startDate?: string;
  endDate?: string;
  impressions?: number;
  clicks?: number;
}

export interface SEOSettings {
  siteTitleTemplate: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  googleNewsPublisherId: string;
  sitemapEnabled: boolean;
  rssFeedEnabled: boolean;
  jsonLdEnabled: boolean;
  breadcrumbsEnabled: boolean;
  canonicalDomain: string;
  robotsTxtContent: string;
  globalSeoScore: number;
}

export interface SEMSettings {
  gtmId: string;
  ga4MeasurementId: string;
  googleAdsConversionId: string;
  metaPixelId: string;
  tiktokPixelId: string;
  enableAdPlacements: boolean;
  adSlots: AdSlot[];
  showAdTransparencyNotice?: boolean;
  allowPublicRentButton?: boolean;
  adSensePublisherId?: string;
  autoAdsEnabled?: boolean;
}

export interface EditorialStaffMember {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  photoUrl: string;
  bio?: string;
  pressCardNo?: string;
  isListedInBox: boolean;
}

export interface OfficialContacts {
  hotlineWhatsapp: string;
  officePhone: string;
  editorialEmail: string;
  advertisingEmail: string;
  pressOmbudsmanEmail: string;
  officeAddress: string;
  operatingHours: string;
  pressCouncilCode: string;
  googleMapEmbedUrl?: string;
}

export interface AntiSpamSettings {
  enabled: boolean;
  strictness: 'rendah' | 'standar' | 'tinggi' | 'maksimal';
  autoFilterSpam: boolean;
  flagRepeatedText: boolean;
  blockHateSpeech: boolean;
  filterExternalLinks: boolean;
  requireCaptcha: boolean;
  rateLimitSeconds: number;
  blacklistedKeywords: string[];
  trustedKeywords: string[];
  totalSpamBlocked: number;
}

export interface LoginThemeSettings {
  layoutTemplate: 'classic_bento' | 'modern_split' | 'centered_card' | 'executive_dark';
  colorTheme: 'sky_gold' | 'emerald_amber' | 'royal_purple' | 'midnight_cyan' | 'crimson_rose' | 'custom';
  fontFamily: 'plus_jakarta' | 'playfair_serif' | 'jetbrains_mono' | 'syne_display';
  customPrimaryColor?: string;
  customAccentColor?: string;
  titleText: string;
  subtitleText: string;
  badgeText: string;
  loginButtonLabel: string;
  showQuickDemoAccounts: boolean;
  showDedicatedUrlNotice: boolean;
  backgroundPattern: 'gradient' | 'mesh_dots' | 'editorial_news' | 'solid';
  customBgImageUrl?: string;
  customLogoUrl?: string;
  // Otorisasi & Keamanan Login Redaksi
  requireSecurityPin?: boolean;
  securityPinCode?: string;
  enable2FAAuthorization?: boolean;
  sessionTimeoutMinutes?: number;
  maxFailedAttemptsAllowed?: number;
  requireEditorialAuthCheck?: boolean;
}

export type PortalColorThemeId = 
  | 'sky_gold' 
  | 'crimson_gold' 
  | 'emerald_amber' 
  | 'midnight_cyan' 
  | 'royal_purple' 
  | 'executive_slate' 
  | 'custom';

export interface PortalThemeSettings {
  colorTheme: PortalColorThemeId;
  primaryColor: string;
  primaryDarkColor: string;
  accentColor: string;
  accentHoverColor?: string;
  headerStyle?: 'gradient_elegance' | 'solid_modern' | 'minimal_border';
  navbarStyle?: 'classic_bar' | 'floating_capsule';
  fontFamily?: 'plus_jakarta' | 'playfair_serif' | 'cinzel_editorial' | 'syne_display';
}

export interface SocialAutoShareSettings {
  isEnabled: boolean;
  autoOpenDispatcherOnPublish: boolean;
  channels: {
    whatsapp: boolean;
    telegram: boolean;
    twitter: boolean;
    facebook: boolean;
    linkedin: boolean;
    webhook: boolean;
  };
  channelConfigs: {
    whatsappTarget?: string;
    telegramChannelId?: string;
    telegramBotToken?: string;
    webhookUrl?: string;
    webhookSecret?: string;
  };
  customTemplate?: string;
  includeTags: boolean;
  includeExcerpt: boolean;
}

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  instructions?: string;
  qrCodeUrl?: string;
  isActive?: boolean;
}

export interface LegalitasSettings {
  companyName: string;
  companyType: string;
  skKemenkumham: string;
  deedOfEstablishment: string;
  notaryName: string;
  nib: string;
  npwp: string;
  kbliPrimary: string;
  kbliSecondary: string;
  generalDirector: string;
  chiefEditor: string;
  chiefEditorUkw: string;
  legalCounsel: string;
  pressCouncilStatus: string;
  verificationStatus: string;
  officeAddress: string;
  officePhone: string;
  legalNotes?: string;
}

export interface WhatsAppApiSettings {
  isEnabled: boolean;
  provider: 'fonnte' | 'wablas' | 'meta_cloud' | 'ruangwa' | 'custom_webhook';
  apiKey: string;
  senderNumber: string;
  targetNumberOrGroup: string;
  webhookUrl?: string;
  metaWabaId?: string;
  metaPhoneId?: string;
  apiVersion?: string;
  messageTemplate: string;
  autoBroadcastOnPublish: boolean;
  lastTestStatus?: 'idle' | 'success' | 'failed';
  lastTestMessage?: string;
  lastTestTimestamp?: string;
}

export interface SiteSettings {
  portalName: string;
  portalTagline: string;
  subTagline: string;
  hotlinePhone: string;
  editorialEmail: string;
  officeAddress: string;
  pressCouncilCode: string;
  customLogoUrl?: string;
  showEmergencyBanner: boolean;
  emergencyBannerText: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
    tiktok?: string;
  };
  editorialBoard?: EditorialStaffMember[];
  officialContacts?: OfficialContacts;
  bankAccountForAds?: BankAccountInfo;
  adBankAccounts?: BankAccountInfo[];
  legalitasSettings?: LegalitasSettings;
  whatsappApiSettings?: WhatsAppApiSettings;
  seoSettings?: SEOSettings;
  semSettings?: SEMSettings;
  loginThemeSettings?: LoginThemeSettings;
  portalThemeSettings?: PortalThemeSettings;
  antiSpamSettings?: AntiSpamSettings;
  pushSettings?: PushNotificationSettings;
  socialAutoShareSettings?: SocialAutoShareSettings;
  moduleToggles: {
    showWeather: boolean;
    showTrending: boolean;
    showTicker: boolean;
    showSpotlightHero: boolean;
    showTrendingGrid: boolean;
    showEditorPick: boolean;
    showPoll: boolean;
    showQuiz?: boolean;
    showVideoNews: boolean;
    showPhotoStories: boolean;
    showNewsletter: boolean;
    allowCitizenJournalism: boolean;
    enableAntiBuzzer: boolean;
    enableSeoSem: boolean;
    showEditorialBoard: boolean;
    showPedomanMediaSiber: boolean;
  };
}

export interface TickerSettings {
  isEnabled: boolean;
  mode: 'auto' | 'custom';
  customMessage: string;
  speed: 'slow' | 'normal' | 'fast';
  theme: 'dark' | 'yellow' | 'red';
}

export interface QuizQuestion {
  id: string;
  articleId?: string;
  articleTitle?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points: number;
}

export interface QuizLeaderboardEntry {
  id: string;
  userName: string;
  userAvatar?: string;
  totalScore: number;
  quizzesCompleted: number;
  lastPlayedAt: string;
  badgeTitle: string;
}

export interface EmergencyBroadcastLog {
  id: string;
  title: string;
  message: string;
  type: 'breaking' | 'emergency' | 'important';
  sentAt: string;
  sentBy: string;
  articleId?: string;
  recipientCount?: number;
}

export interface PushNotificationSettings {
  autoPushOnBreaking: boolean;
  autoPushOnEmergency: boolean;
  enableSoundAlert: boolean;
  soundType: 'chime' | 'urgent_bell' | 'radar_pulse';
  badgeLabel: string;
  defaultIconUrl: string;
  broadcastLogs: EmergencyBroadcastLog[];
}

export interface CommentSentimentItem {
  id: string;
  userName: string;
  sentiment: 'positif' | 'netral' | 'kritis';
  emotion: string;
  highlight: string;
  confidenceScore?: number;
}

export interface ArticlePublicReactionAnalysis {
  articleId: string;
  articleTitle: string;
  totalCommentsAnalyzed: number;
  overallSentiment: 'Positif' | 'Netral' | 'Kritis / Keberatan' | 'Bercampur (Polarized)';
  sentimentScore: number; // 0 - 100
  breakdown: {
    positive: number; // percentage (0-100)
    neutral: number;  // percentage (0-100)
    negative: number; // percentage (0-100)
  };
  publicReactionSummary: string;
  keyThemes: string[];
  topCompliments: string[];
  topConcerns: string[];
  analyzedComments: CommentSentimentItem[];
  analyzedAt: string;
  poweredBy: string;
}

export interface SeoHeadlineVariation {
  id: string;
  headline: string;
  style: string;
  seoScore: number; // 80 - 99
  charLength: number;
  clickPotential: 'Tinggi' | 'Sangat Tinggi' | 'Eksplosif';
  seoRationale: string;
  focusKeywords: string[];
}

export interface SeoHeadlineGenerationResponse {
  variations: SeoHeadlineVariation[];
  analyzedKeywords: string[];
  suggestedTags: string[];
  editorialTips: string;
  poweredBy: string;
}


