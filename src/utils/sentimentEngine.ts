import { NewsArticle } from '../types';

export interface SentimentAnalysis {
  label: 'Positif' | 'Netral' | 'Negatif';
  score: number; // 0 to 100
  confidence: number; // e.g. 85 - 98
  summary: string;
  positiveKeywords: string[];
  negativeKeywords: string[];
}

export function analyzeArticleSentiment(article: NewsArticle): SentimentAnalysis {
  // If article already has sentiment, return it
  if (article.sentiment) {
    return {
      label: article.sentiment.label,
      score: article.sentiment.score,
      confidence: article.sentiment.confidence,
      summary: article.sentiment.summary,
      positiveKeywords: ['pertumbuhan', 'sukses', 'menang', 'positif', 'berhasil', 'inovasi', 'peningkatan', 'solusi'],
      negativeKeywords: ['krisis', 'kendala', 'masalah', 'turun', 'rugi', 'pelanggaran', 'protes']
    };
  }

  const fullText = `${article.title} ${article.excerpt} ${article.content} ${(article.paragraphs || []).join(' ')}`.toLowerCase();

  const positiveWords = [
    'sukses', 'menang', 'berhasil', 'pertumbuhan', 'meningkat', 'positif', 'terbaik',
    'inovasi', 'solusi', 'kemajuan', 'harmonis', 'apresiasi', 'dukungan', 'resmi', 'lancar',
    'gemilang', 'juara', 'berkah', 'sejahtera', 'aman', 'terpercaya', 'penghargaan'
  ];

  const negativeWords = [
    'krisis', 'kendala', 'masalah', 'turun', 'rugi', 'pelanggaran', 'protes', 'korupsi',
    'bencana', 'kecelakaan', 'gagal', 'konflik', 'sengketa', 'kebakaran', 'ancaman',
    'hukum', 'tersangka', 'kecewa', 'penipuan', 'kerugian', 'defisit', 'tunda'
  ];

  let positiveCount = 0;
  let negativeCount = 0;
  const foundPositive: string[] = [];
  const foundNegative: string[] = [];

  positiveWords.forEach(word => {
    if (fullText.includes(word)) {
      positiveCount++;
      if (foundPositive.length < 3) foundPositive.push(word);
    }
  });

  negativeWords.forEach(word => {
    if (fullText.includes(word)) {
      negativeCount++;
      if (foundNegative.length < 3) foundNegative.push(word);
    }
  });

  let label: 'Positif' | 'Netral' | 'Negatif' = 'Netral';
  let score = 55;
  let confidence = 88;
  let summary = 'Konten warta menyajikan laporan berimbang dan faktual tanpa tendensi polarisasi.';

  if (positiveCount > negativeCount + 1) {
    label = 'Positif';
    score = Math.min(95, 65 + positiveCount * 4);
    confidence = 91;
    summary = `Nada pemberitaan cenderung positif, menyoroti kemajuan, pencapaian, dan dampak konstruktif (${foundPositive.join(', ')}).`;
  } else if (negativeCount > positiveCount + 1) {
    label = 'Negatif';
    score = Math.max(15, 45 - negativeCount * 5);
    confidence = 89;
    summary = `Nada pemberitaan menyoroti isu kritis, tantangan, atau peristiwa yang memerlukan perhatian khusus (${foundNegative.join(', ')}).`;
  } else {
    label = 'Netral';
    score = 50;
    confidence = 86;
    summary = 'Analisis sentimen mendeteksi laporan informatif dengan sudut pandang objektif dan berimbang.';
  }

  return {
    label,
    score,
    confidence,
    summary,
    positiveKeywords: foundPositive,
    negativeKeywords: foundNegative
  };
}
