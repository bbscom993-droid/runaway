import { NewsArticle, QuizQuestion, QuizLeaderboardEntry } from '../types';

const LEADERBOARD_STORAGE_KEY = 'wartakini_quiz_leaderboard';
const USER_STATS_STORAGE_KEY = 'wartakini_quiz_user_stats';

// Pre-populated initial community leaderboard entries
const DEFAULT_LEADERBOARD: QuizLeaderboardEntry[] = [
  {
    id: 'lb-1',
    userName: 'Budi_Jurnalis_Muda',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    totalScore: 1250,
    quizzesCompleted: 14,
    lastPlayedAt: '2026-08-18T09:15:00Z',
    badgeTitle: '🥇 Jurnalis Cerdas Utama'
  },
  {
    id: 'lb-2',
    userName: 'Siti_Analis_Politik',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    totalScore: 980,
    quizzesCompleted: 11,
    lastPlayedAt: '2026-08-18T08:30:00Z',
    badgeTitle: '🥈 Detektif Fakta Warta'
  },
  {
    id: 'lb-3',
    userName: 'Rian_Warga_Kritis',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    totalScore: 750,
    quizzesCompleted: 8,
    lastPlayedAt: '2026-08-17T18:45:00Z',
    badgeTitle: '🥉 Pengamat Cermat'
  },
  {
    id: 'lb-4',
    userName: 'Dewi_Setia_Membaca',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    totalScore: 520,
    quizzesCompleted: 6,
    lastPlayedAt: '2026-08-17T14:20:00Z',
    badgeTitle: 'Pembaca Setia'
  },
  {
    id: 'lb-5',
    userName: 'Andi_Koran_Pagi',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    totalScore: 400,
    quizzesCompleted: 5,
    lastPlayedAt: '2026-08-16T20:10:00Z',
    badgeTitle: 'Pencari Berita'
  }
];

export interface UserQuizStats {
  userName: string;
  totalPoints: number;
  quizzesCompleted: number;
  highestScoreSingleQuiz: number;
  currentStreak: number;
  lastQuizDate: string; // YYYY-MM-DD
}

/**
 * Generate 5 dynamic quiz questions based on the latest articles
 */
export function generateDailyQuiz(articles: NewsArticle[]): QuizQuestion[] {
  if (!articles || articles.length === 0) {
    return getStaticFallbackQuiz();
  }

  const questions: QuizQuestion[] = [];
  const shuffled = [...articles].sort(() => 0.5 - Math.random());

  // Pick up to 5 articles
  const selectedArticles = shuffled.slice(0, 5);

  selectedArticles.forEach((art, index) => {
    // Generate different question types based on index / article properties
    if (index % 3 === 0 && art.keyTakeaways && art.keyTakeaways.length > 0) {
      // Type A: Key takeaway / fact question
      const correctTakeaway = art.keyTakeaways[0];
      const distractor1 = "Pengadaan fasilitas dibatalkan total karena tidak memenuhi kuorum rapat.";
      const distractor2 = "Pemerintah pusat resmi menutup kanal informasi publik mengenai isu ini.";
      const distractor3 = "Pihak penyelenggara meminta ganti rugi imateriil kepada publik.";

      const options = [correctTakeaway, distractor1, distractor2, distractor3].sort(() => 0.5 - Math.random());
      const correctIdx = options.indexOf(correctTakeaway);

      questions.push({
        id: `q-${art.id}-takeaway`,
        articleId: art.id,
        articleTitle: art.title,
        question: `Berdasarkan berita "${art.title}", poin kunci manakah yang tepat?`,
        options,
        correctAnswerIndex: correctIdx,
        explanation: `Sesuai fakta dalam berita "${art.title}": ${correctTakeaway}`,
        points: 100
      });
    } else if (index % 3 === 1) {
      // Type B: Category / Topic question
      const correctCategory = art.categoryLabel || art.category;
      const allCategories = ['Nasional', 'Politik', 'Ekonomi', 'Olahraga', 'Teknologi', 'Transportasi', 'Hukum & Kriminal', 'Opini Redaksi'];
      const wrongCategories = allCategories.filter(c => c.toLowerCase() !== correctCategory.toLowerCase()).slice(0, 3);
      const options = [correctCategory, ...wrongCategories].sort(() => 0.5 - Math.random());
      const correctIdx = options.indexOf(correctCategory);

      questions.push({
        id: `q-${art.id}-cat`,
        articleId: art.id,
        articleTitle: art.title,
        question: `Artikel warta "${art.title}" dikategorikan ke dalam kanal berita apa?`,
        options,
        correctAnswerIndex: correctIdx,
        explanation: `Warta ini diterbitkan di bawah kanal/rubrik ${correctCategory}.`,
        points: 100
      });
    } else {
      // Type C: Author / Reporter question or Excerpt understanding
      const correctAuthor = art.author.name;
      const wrongAuthors = ['Dewi Lestari (Jurnalis)', 'Rian Hidayat (Reporter)', 'Siti Nurhaliza (Redaktur)', 'Budi Santoso (Koresponden)'].filter(a => !a.includes(correctAuthor)).slice(0, 3);
      const options = [correctAuthor, ...wrongAuthors].sort(() => 0.5 - Math.random());
      const correctIdx = options.indexOf(correctAuthor);

      questions.push({
        id: `q-${art.id}-author`,
        articleId: art.id,
        articleTitle: art.title,
        question: `Siapakah reporter/jurnalis yang meliput dan menulis berita "${art.title}"?`,
        options,
        correctAnswerIndex: correctIdx,
        explanation: `Liputan ini ditulis oleh jurnalis redaksi ${correctAuthor}.`,
        points: 100
      });
    }
  });

  // If fewer than 5 questions generated, pad with static items
  if (questions.length < 5) {
    const fallbacks = getStaticFallbackQuiz();
    while (questions.length < 5 && fallbacks.length > 0) {
      const fb = fallbacks.pop();
      if (fb) questions.push(fb);
    }
  }

  return questions;
}

function getStaticFallbackQuiz(): QuizQuestion[] {
  return [
    {
      id: 'fb-1',
      question: 'Apa fungsi utama dari prinsip 5W+1H dalam penulisan liputan berita jurnalistik?',
      options: [
        'Memastikan kelengkapan unsur fakta utama (Who, What, Where, When, Why, How)',
        'Meningkatkan jumlah kata dalam artikel agar lebih panjang',
        'Menyembunyikan sumber narasumber resmi',
        'Membuat judul berita terkesan lebih provokatif'
      ],
      correctAnswerIndex: 0,
      explanation: '5W+1H adalah fondasi utama jurnalistik untuk memastikan berita menyajikan fakta utuh secara akurat.',
      points: 100
    },
    {
      id: 'fb-2',
      question: 'Apa arti penting dari Pedoman Media Siber dalam penerbitan warta berita online?',
      options: [
        'Sebagai panduan etika verifikasi, hak jawab, dan perlindungan privasi pembaca',
        'Aturan untuk menaikkan harga iklan secara sepihak',
        'Persyaratan untuk membeli lisensi domain internet',
        'Sistem otomatis untuk menghapus komentar kritis'
      ],
      correctAnswerIndex: 0,
      explanation: 'Pedoman Media Siber menjamin pers nasional bekerja sesuai Kode Etik Jurnalistik dan UU Pers.',
      points: 100
    },
    {
      id: 'fb-3',
      question: 'Apa yang dimaksud dengan "Teras Berita" (Lead) dalam susunan naskah berita?',
      options: [
        'Paragraf pertama yang memuat intisari fakta paling krusial',
        'Bagian kaki halaman yang berisi iklan sponsor',
        'Daftar pustaka narasumber di akhir artikel',
        'Catatan rahasia milik redaktur eksekutif'
      ],
      correctAnswerIndex: 0,
      explanation: 'Teras berita (lead) berada di paragraf pertama untuk menyampaikan pokok fakta dengan cepat kepada pembaca.',
      points: 100
    },
    {
      id: 'fb-4',
      question: 'Bagaimana peran Perisai Anti-Buzzer dalam menjaga integritas opini pembaca di portal berita?',
      options: [
        'Mendeteksi dan menyaring komentar spam, bot, atau kampanye terkoordinasi',
        'Menutup seluruh kolom diskusi secara permanen',
        'Mengubah isi berita berdasarkan jumlah voting pembaca',
        'Menghapus akun pengguna secara acak'
      ],
      correctAnswerIndex: 0,
      explanation: 'Perisai Anti-Buzzer menyaring manipulasi opini sehingga ruang diskusi tetap sehat dan organik.',
      points: 100
    },
    {
      id: 'fb-5',
      question: 'Fitur apakah yang memungkinkan artikel berita dibaca tanpa koneksi internet di browser?',
      options: [
        'Penyimpanan Lokal IndexedDB (Offline Storage)',
        'Mode Pesawat pada perangkat',
        'Sistem Pembayaran Berlangganan',
        'Layar Tangkapan Otomatis'
      ],
      correctAnswerIndex: 0,
      explanation: 'Teknologi IndexedDB menyimpan draf dan warta secara lokal sehingga dapat diakses saat offline.',
      points: 100
    }
  ];
}

/**
 * Leaderboard & User Stats Helper Functions
 */
export function getLeaderboardFromStorage(): QuizLeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.totalScore - a.totalScore);
      }
    }
  } catch (e) {
    console.error('Error reading quiz leaderboard:', e);
  }
  return DEFAULT_LEADERBOARD;
}

export function getUserQuizStats(): UserQuizStats {
  try {
    const raw = localStorage.getItem(USER_STATS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading user quiz stats:', e);
  }
  return {
    userName: 'Pembaca_Setia_' + Math.floor(100 + Math.random() * 900),
    totalPoints: 0,
    quizzesCompleted: 0,
    highestScoreSingleQuiz: 0,
    currentStreak: 0,
    lastQuizDate: ''
  };
}

export function saveQuizResultToLeaderboard(scoreGained: number, userNameInput?: string): {
  updatedStats: UserQuizStats;
  updatedLeaderboard: QuizLeaderboardEntry[];
  badgeTitle: string;
} {
  const currentStats = getUserQuizStats();
  const userName = userNameInput?.trim() || currentStats.userName;
  const todayStr = new Date().toISOString().slice(0, 10);

  // Calculate streak
  let newStreak = currentStats.currentStreak;
  if (currentStats.lastQuizDate) {
    const lastDate = new Date(currentStats.lastQuizDate);
    const todayDate = new Date(todayStr);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const updatedStats: UserQuizStats = {
    userName,
    totalPoints: currentStats.totalPoints + scoreGained,
    quizzesCompleted: currentStats.quizzesCompleted + 1,
    highestScoreSingleQuiz: Math.max(currentStats.highestScoreSingleQuiz, scoreGained),
    currentStreak: newStreak,
    lastQuizDate: todayStr
  };

  // Determine user badge title
  let badgeTitle = 'Pembaca Pemula';
  if (updatedStats.totalPoints >= 1000) {
    badgeTitle = '🥇 Jurnalis Cerdas Utama';
  } else if (updatedStats.totalPoints >= 600) {
    badgeTitle = '🥈 Detektif Fakta Warta';
  } else if (updatedStats.totalPoints >= 300) {
    badgeTitle = '🥉 Pengamat Cermat';
  } else if (updatedStats.totalPoints >= 100) {
    badgeTitle = 'Pembaca Aktif';
  }

  // Save user stats
  try {
    localStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(updatedStats));
  } catch (e) {
    console.error('Error saving user quiz stats:', e);
  }

  // Update Leaderboard
  let leaderboard = getLeaderboardFromStorage();
  const existingIndex = leaderboard.findIndex(entry => entry.userName.toLowerCase() === userName.toLowerCase());

  const userEntry: QuizLeaderboardEntry = {
    id: existingIndex >= 0 ? leaderboard[existingIndex].id : 'user-' + Date.now(),
    userName,
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    totalScore: updatedStats.totalPoints,
    quizzesCompleted: updatedStats.quizzesCompleted,
    lastPlayedAt: new Date().toISOString(),
    badgeTitle
  };

  if (existingIndex >= 0) {
    leaderboard[existingIndex] = userEntry;
  } else {
    leaderboard.push(userEntry);
  }

  // Sort descending by total score
  leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  // Keep top 15 entries
  leaderboard = leaderboard.slice(0, 15);

  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
  } catch (e) {
    console.error('Error saving leaderboard:', e);
  }

  return {
    updatedStats,
    updatedLeaderboard: leaderboard,
    badgeTitle
  };
}
