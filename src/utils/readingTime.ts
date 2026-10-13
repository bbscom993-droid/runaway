import { NewsArticle } from '../types';

/**
 * Calculates estimated reading time for text or article based on word count.
 * Average reading speed: 200 words per minute (WPM).
 */
export interface ReadingTimeResult {
  minutes: number;
  wordCount: number;
  formatted: string;
  formattedWithWords: string;
}

export function calculateReadingTimeFromText(
  text: string, 
  wpm: number = 200
): ReadingTimeResult {
  // Clean tags & extra spaces
  const cleanText = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*`_~[\]()]/g, ' ')
    .trim();

  const words = cleanText ? cleanText.split(/\s+/).filter(w => w.length > 0) : [];
  const wordCount = words.length;

  const rawMinutes = wordCount / wpm;
  const minutes = Math.max(1, Math.ceil(rawMinutes));

  const formatted = `${minutes} mnt baca`;
  const formattedWithWords = `${minutes} mnt baca (${wordCount.toLocaleString('id-ID')} kata)`;

  return {
    minutes,
    wordCount,
    formatted,
    formattedWithWords
  };
}

export function getArticleReadingTime(
  article: Partial<NewsArticle>, 
  wpm: number = 200
): ReadingTimeResult {
  if (!article) {
    return {
      minutes: 1,
      wordCount: 0,
      formatted: '1 mnt baca',
      formattedWithWords: '1 mnt baca (0 kata)'
    };
  }

  // Combine title, excerpt, content and paragraphs text for comprehensive word count
  const titleText = article.title || '';
  const excerptText = article.excerpt || '';
  const contentText = article.content || (Array.isArray(article.paragraphs) ? article.paragraphs.join(' ') : '') || '';

  const fullText = `${titleText} ${excerptText} ${contentText}`;
  return calculateReadingTimeFromText(fullText, wpm);
}
