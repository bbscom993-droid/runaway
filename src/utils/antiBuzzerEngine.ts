import { NewsComment } from '../types';

export interface ThreatCategory {
  type: 'BOT_COMMERCIAL' | 'POLITICAL_BUZZER' | 'AI_BOT_GENERATED' | 'HATE_PROVOCATION' | 'COPY_PASTE_CLONE' | 'LEETSPEAK_EVASION';
  label: string;
  badgeColor: string;
}

export interface BuzzerAnalysisResult {
  isSuspect: boolean;
  isHeld: boolean;
  riskScore: number; // 0 to 100
  reasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  threatCategories: ThreatCategory[];
  normalizedText: string;
}

export interface AntiBuzzerConfig {
  enabled: boolean;
  strictness: 'rendah' | 'standar' | 'tinggi' | 'maksimal';
  autoFilterSpam: boolean;
  flagRepeatedText: boolean;
  blockHateSpeech: boolean;
  blacklistedKeywords: string[];
  trustedKeywords: string[];
  totalBuzzerBlocked: number;
  totalReportsResolved: number;
}

export const DEFAULT_BUZZER_CONFIG: AntiBuzzerConfig = {
  enabled: true,
  strictness: 'maksimal',
  autoFilterSpam: true,
  flagRepeatedText: true,
  blockHateSpeech: true,
  blacklistedKeywords: [
    // Political Buzzer & Coordinated Agitation
    'buzzer bayaran',
    'paslon sebelah panik',
    'dana haram',
    'rezim antek',
    'cebong',
    'kampret',
    'kadrun',
    'fufufafa',
    'anak abah',
    'partai sebelah',
    'cagub sebelah',
    'influencer bayaran',
    'cyber army',
    'giring opini',
    'framing jahat media',
    'media amplop',
    'buzzer rupiah',
    'serang akun ini',
    'laporkan akun sebelah',
    'serbu komentar',
    'tumbangkan media',
    'narasi pesanan',
    'operasi intelijen',
    'bot politik',
    // Spam & Commercial Bot Scams
    'bocoran togel',
    'slot gacor',
    'maxwin',
    'depo murah',
    'wa.me/',
    'bit.ly/',
    't.me/',
    'pinjol cepat cair',
    'jual follower murah',
    'olshop grosir',
    'investasi bodong',
    'bonus new member'
  ],
  trustedKeywords: [
    'menurut data',
    'berdasarkan laporan',
    'sudut pandang',
    'kebijakan publik',
    'regulasi',
    'pembelajaran',
    'kajian ilmiah',
    'solusi alternatif',
    'fakta di lapangan',
    'transparansi redaksi'
  ],
  totalBuzzerBlocked: 429,
  totalReportsResolved: 184
};

/**
 * Normalizes text to counter bypass evasion techniques (e.g. b.u.z.z.e.r, c3b0ng, $l0t, f-u-f-u-f-a-f-a)
 */
export function normalizeTextForBypass(text: string): string {
  let clean = text.toLowerCase();
  // Remove zero-width & non-printable chars
  clean = clean.replace(/[\u200B-\u200D\uFEFF]/g, '');
  // Map common leetspeak substitutions
  const leetMap: Record<string, string> = {
    '@': 'a',
    '4': 'a',
    '3': 'e',
    '1': 'i',
    '!': 'i',
    '0': 'o',
    '$': 's',
    '5': 's',
    '7': 't'
  };
  clean = clean.replace(/[@431!0$57]/g, m => leetMap[m] || m);
  // Remove dots/hyphens inserted between letters to evade string search (e.g., b.u.z.z.e.r -> buzzer)
  clean = clean.replace(/([a-z])[\._\-\*\+\s](?=[a-z])/gi, '$1');
  return clean;
}

/**
 * Calculate Jaccard word similarity between two texts
 */
function calculateTextSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(textA.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(textB.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersectionCount = 0;
  wordsA.forEach(w => {
    if (wordsB.has(w)) intersectionCount++;
  });

  const unionCount = wordsA.size + wordsB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Analyze comment content against buzzer, bot, and coordinated spam patterns
 */
export function analyzeCommentAntiBuzzer(
  content: string,
  userName: string,
  existingComments: NewsComment[] = [],
  config: AntiBuzzerConfig = DEFAULT_BUZZER_CONFIG
): BuzzerAnalysisResult {
  if (!config.enabled) {
    return {
      isSuspect: false,
      isHeld: false,
      riskScore: 0,
      reasons: [],
      severity: 'low',
      threatCategories: [],
      normalizedText: content
    };
  }

  const cleanText = content.trim();
  const lowerText = cleanText.toLowerCase();
  const normalizedText = normalizeTextForBypass(cleanText);
  const lowerName = userName.toLowerCase();
  const reasons: string[] = [];
  const threatCategories: ThreatCategory[] = [];
  let score = 0;

  // Track category flags
  let isCommercial = false;
  let isPolitical = false;
  let isAiBot = false;
  let isHate = false;
  let isCopyPaste = false;
  let isEvasion = false;

  // 1. Evasion detection (e.g. dots or leetspeak in suspicious words)
  if (cleanText !== normalizedText && /(b\.u\.z|c3b0|s\$l0t|f\-u\-f\-u|k\.a\.d\.r)/i.test(cleanText)) {
    score += 35;
    isEvasion = true;
    reasons.push('Terdeteksi teknik manipulasi karakter/leetspeak untuk meloloskan kata terlarang');
  }

  // 2. Check Blacklisted keywords on normalized text
  config.blacklistedKeywords.forEach(kw => {
    const kwNorm = kw.toLowerCase();
    if (normalizedText.includes(kwNorm) || lowerText.includes(kwNorm)) {
      score += 45;
      if (/slot|maxwin|pinjol|wa\.me|bit\.ly|t\.me|depo/i.test(kwNorm)) {
        isCommercial = true;
      } else {
        isPolitical = true;
      }
      reasons.push(`Mengandung kata terlarang/pola narasi terkoordinasi: "${kw}"`);
    }
  });

  // 3. Check for Promotional Links / Tele / WA spam (Common bot pattern)
  const linkPatterns = /(https?:\/\/|www\.|bit\.ly|wa\.me|t\.me|tinyurl|slot|gacor|maxwin|depo88)/i;
  if (linkPatterns.test(lowerText) || linkPatterns.test(normalizedText)) {
    score += 60;
    isCommercial = true;
    reasons.push('Terdeteksi tautan eksternal / promosi bot otomatis komersial');
  }

  // 4. AI Bot / Canned AI Response Signature
  const aiBotPatterns = /(sebagai model bahasa ai|sebagai ai|artikel ini sangat menarik dan bermanfaat sekali|mari kita jadikan ini sebagai bahan refleksi bersama kawan|mantap min lanjutkan warta yang bagus)/i;
  if (aiBotPatterns.test(lowerText)) {
    score += 40;
    isAiBot = true;
    reasons.push('Terdeteksi pola respons AI generik / bot komentar otomatis');
  }

  // 5. High Emoji Density Spam (e.g. 🚨🚨🚨🔥🔥🔥💥💥💥)
  const emojiCount = (cleanText.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/gu) || []).length;
  if (emojiCount >= 5) {
    score += 25;
    reasons.push(`Penggunaan emoji berlebihan (${emojiCount} emoji) yang mencirikan spam bot visual`);
  }

  // 6. Check for ALL CAPS screaming / Agitasi provokatif
  const letters = cleanText.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 12) {
    const uppercaseLetters = cleanText.replace(/[^A-Z]/g, '');
    const capsRatio = uppercaseLetters.length / letters.length;
    if (capsRatio > 0.60) {
      score += 35;
      isHate = true;
      reasons.push('Penggunaan huruf kapital berlebihan (>60% ALL CAPS) indikasi gertakan/provokasi');
    }
  }

  // 7. Excessive repetitive punctuation (e.g. !!!!!!! or ????)
  if (/([!?.])\1{3,}/.test(cleanText)) {
    score += 20;
    reasons.push('Tanda baca berulang berlebihan (indikator agitasi bot emosional)');
  }

  // 8. Coordinated Copy-Paste Detection against other comments
  if (config.flagRepeatedText && existingComments.length > 0) {
    let highestSim = 0;
    let matchedName = '';

    for (const other of existingComments) {
      if (other.content && other.content !== cleanText) {
        const sim = calculateTextSimilarity(cleanText, other.content);
        if (sim > highestSim) {
          highestSim = sim;
          matchedName = other.userName;
        }
      }
    }

    if (highestSim > 0.60) {
      score += 55;
      isCopyPaste = true;
      reasons.push(`Teks terdeteksi sangat mirip (${Math.round(highestSim * 100)}%) dengan komentar ${matchedName} (indikasi serangan bot copy-paste)`);
    }
  }

  // 9. Coordinated Campaign Hashtag (e.g., #SerbuMedia #TolakAntek #BuzzerGas)
  if (/#(serbu|tolak|hancurkan|lawan|bubarkan|boikot)[a-z0-9_]+/i.test(lowerText)) {
    score += 35;
    isPolitical = true;
    reasons.push('Terdeteksi tagar kampanye terkoordinasi (coordinated hashtag campaign)');
  }

  // 10. Suspicious repetitive username pattern (e.g., user18274612 or akun_bot_99)
  if (/^(user\d{4,}|akun_\d+|bot\d+|admin_\d+|anon_\d+|influencer_\d+)$/i.test(lowerName)) {
    score += 25;
    reasons.push('Nama pengguna mencurigakan dengan pola akun massal/kloningan');
  }

  // 11. Extremely short purely agitative comments
  if (cleanText.length < 15 && /(hancur|tumbang|panik|buzzer|antek|bubarkan|fufufafa|cebong|kampret)/i.test(normalizedText)) {
    score += 30;
    isPolitical = true;
    reasons.push('Komentar terlalu pendek dengan nada provokatif tanpa substansi argumen');
  }

  // Build Threat Categories
  if (isCommercial) threatCategories.push({ type: 'BOT_COMMERCIAL', label: 'Bot Commercial Spam', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' });
  if (isPolitical) threatCategories.push({ type: 'POLITICAL_BUZZER', label: 'Buzzer Politik Terkoordinasi', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' });
  if (isAiBot) threatCategories.push({ type: 'AI_BOT_GENERATED', label: 'Spam Bot AI Generik', badgeColor: 'bg-sky-100 text-sky-800 border-sky-300' });
  if (isHate) threatCategories.push({ type: 'HATE_PROVOCATION', label: 'Ujaran Provokasi/Screaming', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' });
  if (isCopyPaste) threatCategories.push({ type: 'COPY_PASTE_CLONE', label: 'Serangan Copy-Paste', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300' });
  if (isEvasion) threatCategories.push({ type: 'LEETSPEAK_EVASION', label: 'Evasi Leetspeak/Manipulasi', badgeColor: 'bg-slate-200 text-slate-800 border-slate-300' });

  // Cap risk score between 0 and 100
  const finalScore = Math.min(100, score);

  // Strictness Thresholds
  let suspectThreshold = 35;
  let heldThreshold = 50;

  if (config.strictness === 'rendah') {
    suspectThreshold = 55;
    heldThreshold = 75;
  } else if (config.strictness === 'standar') {
    suspectThreshold = 40;
    heldThreshold = 60;
  } else if (config.strictness === 'tinggi') {
    suspectThreshold = 30;
    heldThreshold = 50;
  } else if (config.strictness === 'maksimal') {
    suspectThreshold = 20;
    heldThreshold = 35;
  }

  const isSuspect = finalScore >= suspectThreshold;
  const isHeld = finalScore >= heldThreshold;

  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (finalScore >= 75) severity = 'critical';
  else if (finalScore >= 50) severity = 'high';
  else if (finalScore >= 30) severity = 'medium';

  return {
    isSuspect,
    isHeld,
    riskScore: finalScore,
    reasons,
    severity,
    threatCategories,
    normalizedText
  };
}

/**
 * Initial list of flagged buzzer comments for editorial moderation queue
 */
export const INITIAL_FLAGGED_BUZZER_COMMENTS: Array<{
  id: string;
  articleId: string;
  articleTitle: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  riskScore: number;
  reasons: string[];
  reportCount: number;
  status: 'held' | 'flagged' | 'reviewed';
}> = [
  {
    id: 'flg-1',
    articleId: 'art-1',
    articleTitle: 'Pertumbuhan Ekonomi Kuartal II Melampaui Target',
    userName: 'Akun_Anonim_9921',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    content: 'MEDIA ANTEK PENJILAT!!! JANGAN PERCAYA DATA INI SEMUA REKAYASA BUZZER RUPIAH PANIK KALAH TELAK DI LAPANGAN SERBUUUU!!!!',
    timestamp: '12 menit lalu',
    riskScore: 96,
    reasons: [
      'Penggunaan huruf kapital berlebihan (>80% ALL CAPS)',
      'Mengandung kata terlarang: "buzzer rupiah", "rezim antek"',
      'Pola nama pengguna akun massal bot (Akun_Anonim_9921)',
      'Tanda seru berulang (!!!!)'
    ],
    reportCount: 14,
    status: 'held'
  },
  {
    id: 'flg-2',
    articleId: 'art-2',
    articleTitle: 'Timnas Sepak Bola Indonesia Amankan Tiket Putaran Final',
    userName: 'FastPromo_Bot',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
    content: 'Garuda mantap bosku! Yang mau saldo gratis dan bonus new member langsung klik bit.ly/slot-resmi-garuda wa.me/62899882211 proses 2 menit cair.',
    timestamp: '22 menit lalu',
    riskScore: 92,
    reasons: [
      'Terdeteksi tautan eksternal promosi bot: bit.ly dan wa.me',
      'Kata kunci spam komersial: "bonus new member", "slot"'
    ],
    reportCount: 18,
    status: 'held'
  },
  {
    id: 'flg-3',
    articleId: 'art-1',
    articleTitle: 'Pertumbuhan Ekonomi Kuartal II Melampaui Target',
    userName: 'Kritikus_Medsos_01',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    content: 'Paslon sebelah panik data ekonomi bagus begini. Dana haram mereka gak kepake lagi fufufafa.',
    timestamp: '35 menit lalu',
    riskScore: 82,
    reasons: [
      'Mengandung frasa provokasi politik: "paslon sebelah panik", "dana haram", "fufufafa"',
      'Framing ad-hominem non-substantif'
    ],
    reportCount: 8,
    status: 'flagged'
  },
  {
    id: 'flg-4',
    articleId: 'art-3',
    articleTitle: 'Transisi Energi Hijau: Pembangkit Listrik Tenaga Surya',
    userName: 'CyberArmy_007',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    content: '#SerbuMedia #TolakAntek b.u.z.z.e.r bayaran panik pencitraan energi murah padahal proyek ghaib!!!!',
    timestamp: '48 menit lalu',
    riskScore: 89,
    reasons: [
      'Terdeteksi manipulasi leetspeak/evasi: b.u.z.z.e.r',
      'Terdeteksi tagar kampanye terkoordinasi: #SerbuMedia #TolakAntek'
    ],
    reportCount: 11,
    status: 'held'
  }
];

