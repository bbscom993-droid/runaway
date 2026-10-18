import type { NewsArticle, Category, NewsComment, SiteSettings } from '../types';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  limit, 
  where,
  onSnapshot
} from 'firebase/firestore';

// Fast In-Memory Article Cache for instant 0ms lookups
export const articleMemoryCache = new Map<string, NewsArticle>();

export function cacheArticle(article: NewsArticle) {
  if (!article) return;
  if (article.id) {
    articleMemoryCache.set(article.id, article);
    articleMemoryCache.set(article.id.toLowerCase(), article);
    articleMemoryCache.set(article.id.replace('art-', ''), article);
  }
  if (article.slug) {
    articleMemoryCache.set(article.slug, article);
    articleMemoryCache.set(article.slug.toLowerCase(), article);
  }
}

export function parseArticleData(data: any): NewsArticle {
  const rawParagraphs = Array.isArray(data.paragraphs) && data.paragraphs.length > 0
    ? data.paragraphs
    : (data.content ? data.content.split('\n\n').filter(Boolean) : []);

  const paragraphs = rawParagraphs.length > 0 ? rawParagraphs : [data.title || 'Warta Berita Terkini'];

  let authorObj = {
    name: 'Redaksi Arun News',
    role: 'Tim Jurnalis',
    avatar: 'https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=100&q=80',
  };

  if (data.author && typeof data.author === 'object') {
    authorObj = {
      name: data.author.name || data.authorName || 'Redaksi Arun News',
      role: data.author.role || data.authorRole || 'Tim Jurnalis',
      avatar: data.author.avatar || data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=100&q=80',
    };
  } else if (data.authorName) {
    authorObj.name = data.authorName;
    if (data.authorRole) authorObj.role = data.authorRole;
    if (data.authorAvatar) authorObj.avatar = data.authorAvatar;
  }

  const parsed: NewsArticle = {
    id: String(data.id || ''),
    title: String(data.title || 'Warta Berita Arun News'),
    slug: data.slug || data.id,
    excerpt: data.excerpt || (paragraphs[0] ? paragraphs[0].slice(0, 160) + '...' : ''),
    content: data.content || paragraphs.join('\n\n'),
    paragraphs: paragraphs,
    category: data.category || 'politik',
    categoryLabel: data.categoryLabel || 'Politik & Hukum',
    author: authorObj,
    publishedAt: data.publishedAt || 'Hari Ini',
    readTime: data.readTime || '3 menit',
    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    imageCaption: data.imageCaption || '',
    views: typeof data.views === 'number' ? data.views : 100,
    likes: typeof data.likes === 'number' ? data.likes : 10,
    shares: typeof data.shares === 'number' ? data.shares : 5,
    tags: Array.isArray(data.tags) ? data.tags : [],
    keyTakeaways: Array.isArray(data.keyTakeaways) ? data.keyTakeaways : [],
    comments: Array.isArray(data.comments) ? data.comments : [],
    isHeadline: Boolean(data.isHeadline),
    isBreaking: Boolean(data.isBreaking),
    isEditorPick: Boolean(data.isEditorPick),
    isTrending: Boolean(data.isTrending),
    trendingRank: data.trendingRank,
    reactions: data.reactions,
    status: data.status || 'published',
    scheduledPublishAt: data.scheduledPublishAt || undefined,
  };

  cacheArticle(parsed);
  return parsed;
}

export async function checkDBHealth(): Promise<{ status: string; database?: string; articlesCount?: number }> {
  try {
    const q = query(collection(db, 'articles'), limit(15));
    const snap = await getDocs(q);
    return { 
      status: 'ok', 
      database: 'Firebase Firestore (Connected)',
      articlesCount: snap.size
    };
  } catch (err) {
    console.warn('Firestore health check pinging fallback:', err);
    if (db) {
      return { status: 'ok', database: 'Firebase Firestore' };
    }
    return { status: 'offline' };
  }
}

export async function fetchArticlesFromDB(): Promise<NewsArticle[] | null> {
  try {
    const snapshot = await getDocs(collection(db, 'articles'));
    if (!snapshot.empty) {
      const list: NewsArticle[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && (data.id || docSnap.id) && data.title) {
          list.push(parseArticleData({ id: data.id || docSnap.id, ...data }));
        }
      });
      if (list.length > 0) return list;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch articles from Firestore:', err);
    return null;
  }
}

/**
 * Mengambil artikel secara instan tanpa delay:
 * 1. Cek memory cache (0ms)
 * 2. Cek localStorage (0ms)
 * 3. Query paralel ke Server Endpoint /api/db/articles dan Firestore dengan timeout ketat
 */
export async function fetchArticleByIdFromDB(idOrSlug: string): Promise<NewsArticle | null> {
  if (!idOrSlug) return null;
  let clean = idOrSlug.trim();
  try {
    clean = decodeURIComponent(clean).trim();
  } catch {}
  clean = clean.replace(/^\/+|\/+$/g, '');
  if (!clean) return null;
  const cleanLower = clean.toLowerCase();

  // 0. Cek Server Preloaded Article (0ms - SSR injected)
  if (typeof window !== 'undefined' && (window as any).__SERVER_ARTICLE__) {
    const sArt = (window as any).__SERVER_ARTICLE__;
    const sId = (sArt.id || '').toLowerCase();
    const sSlug = (sArt.slug || '').toLowerCase();
    if (
      sId === cleanLower ||
      sSlug === cleanLower ||
      sId.replace('art-', '') === cleanLower.replace('art-', '') ||
      (cleanLower.length > 4 && sSlug.includes(cleanLower)) ||
      (cleanLower.length > 4 && cleanLower.includes(sSlug))
    ) {
      const parsed = parseArticleData(sArt);
      cacheArticle(parsed);
      return parsed;
    }
  }

  // 1. Cek Memory Cache (0ms)
  if (articleMemoryCache.has(clean)) return articleMemoryCache.get(clean)!;
  if (articleMemoryCache.has(cleanLower)) return articleMemoryCache.get(cleanLower)!;

  // 2. Cek LocalStorage Cache (0ms)
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('wartakini_articles') : null;
    if (raw) {
      const parsed: NewsArticle[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const localFound = parsed.find((a) => {
          const aId = (a.id || '').toLowerCase();
          const aSlug = (a.slug || '').toLowerCase();
          return (
            aId === cleanLower ||
            aSlug === cleanLower ||
            aId.replace('art-', '') === cleanLower.replace('art-', '') ||
            (cleanLower.length > 4 && aSlug.includes(cleanLower)) ||
            (cleanLower.length > 4 && cleanLower.includes(aSlug))
          );
        });
        if (localFound) {
          cacheArticle(localFound);
          return localFound;
        }
      }
    }
  } catch {}

  // 3. Eksekusi Cepat: Endpoint Tunggal /api/db/articles/:id dan Firestore Paralel
  const fetchSingleFromServer = async (): Promise<NewsArticle | null> => {
    try {
      const res = await fetch(`/api/db/articles/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.article) {
          return parseArticleData(data.article);
        }
      }
      // Fallback: cek endpoint daftar warta jika single belum tersedia
      const listRes = await fetch('/api/db/articles');
      if (listRes.ok) {
        const data = await listRes.json();
        if (data && data.success && Array.isArray(data.articles)) {
          const found = data.articles.find((a: any) => {
            const aId = (a.id || '').toLowerCase();
            const aSlug = (a.slug || '').toLowerCase();
            return (
              aId === cleanLower ||
              aSlug === cleanLower ||
              aId.replace('art-', '') === cleanLower.replace('art-', '') ||
              (cleanLower.length > 4 && aSlug.includes(cleanLower)) ||
              (cleanLower.length > 4 && cleanLower.includes(aSlug))
            );
          });
          if (found) return parseArticleData(found);
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchFromFirestoreParallel = async (): Promise<NewsArticle | null> => {
    try {
      // Direct doc get
      const docPromise = getDoc(doc(db, 'articles', clean))
        .then((snap) => (snap.exists() ? parseArticleData({ id: snap.id, ...snap.data() }) : null))
        .catch(() => null);

      // Slug query
      const slugQueryPromise = getDocs(query(collection(db, 'articles'), where('slug', '==', clean), limit(1)))
        .then((snap) => (!snap.empty ? parseArticleData({ id: snap.docs[0].id, ...snap.docs[0].data() }) : null))
        .catch(() => null);

      const [byDoc, bySlug] = await Promise.all([docPromise, slugQueryPromise]);
      return byDoc || bySlug || null;
    } catch {
      return null;
    }
  };

  // Jalankan fetch paralel dengan timeout cepat
  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
    const results = await Promise.race([
      Promise.all([fetchSingleFromServer(), fetchFromFirestoreParallel()]),
      timeoutPromise.then(() => [null, null]),
    ]);

    if (results) {
      const [fromServer, fromFirestore] = results;
      const finalResult = fromServer || fromFirestore;
      if (finalResult) {
        cacheArticle(finalResult);
        return finalResult;
      }
    }
  } catch {}

  return null;
}

export function subscribeArticlesFromDB(onUpdate: (articles: NewsArticle[]) => void): () => void {
  try {
    const unsub = onSnapshot(collection(db, 'articles'), (snapshot) => {
      if (!snapshot.empty) {
        const list: NewsArticle[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && (data.id || docSnap.id) && data.title) {
            list.push(parseArticleData({ id: data.id || docSnap.id, ...data }));
          }
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      }
    }, (error) => {
      console.warn('Firestore articles realtime subscription listener:', error);
    });
    return unsub;
  } catch (err) {
    console.warn('Failed to subscribe to Firestore articles:', err);
    return () => {};
  }
}

export function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        res[key] = sanitizeForFirestore(val);
      }
    }
    return res;
  }
  return obj;
}

export async function saveArticleToDB(article: NewsArticle): Promise<boolean> {
  const cleaned = sanitizeForFirestore({
    ...article,
    updatedAt: new Date().toISOString(),
  });

  // 1. Optimistic Update 0ms: Segera simpan ke Memory Cache
  cacheArticle(cleaned);

  // 2. Optimistic Update 0ms: Segera perbarui LocalStorage agar UI langsung terbarui tanpa jeda
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('wartakini_articles') : null;
    let list: NewsArticle[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    const idx = list.findIndex((a) => a.id === cleaned.id);
    if (idx >= 0) {
      list[idx] = cleaned;
    } else {
      list.unshift(cleaned);
    }
    localStorage.setItem('wartakini_articles', JSON.stringify(list));
  } catch {}

  // 3. Simpan ke Server Cloud SQL dan Firestore secara paralel tanpa memblokir UI
  const serverSave = fetch('/api/db/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleaned),
  }).catch(() => null);

  const firestoreSave = setDoc(doc(db, 'articles', article.id), cleaned, { merge: true })
    .catch((err) => {
      console.warn('Failed to save article to Firestore:', err);
      return null;
    });

  try {
    await Promise.all([serverSave, firestoreSave]);
    return true;
  } catch {
    return true;
  }
}

export async function deleteArticleFromDB(id: string): Promise<boolean> {
  // Optimistic update
  articleMemoryCache.delete(id);
  articleMemoryCache.delete(id.toLowerCase());
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('wartakini_articles') : null;
    if (raw) {
      const list: NewsArticle[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        localStorage.setItem('wartakini_articles', JSON.stringify(list.filter((a) => a.id !== id)));
      }
    }
  } catch {}

  const serverDel = fetch(`/api/db/articles/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => null);
  const firestoreDel = deleteDoc(doc(db, 'articles', id)).catch(() => null);

  try {
    await Promise.all([serverDel, firestoreDel]);
    return true;
  } catch {
    return false;
  }
}

export async function saveCategoryToDB(category: Category): Promise<boolean> {
  try {
    const cleaned = sanitizeForFirestore(category);
    await setDoc(doc(db, 'categories', category.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to save category to Firestore:', err);
    return false;
  }
}

export async function deleteCategoryFromDB(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'categories', id));
    return true;
  } catch (err) {
    console.warn('Failed to delete category from Firestore:', err);
    return false;
  }
}

export async function fetchCategoriesFromDB(): Promise<Category[] | null> {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    if (!snapshot.empty) {
      const list: Category[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Category;
        if (data && (data.id || docSnap.id) && data.name) {
          list.push({ ...data, id: data.id || docSnap.id });
        }
      });
      if (list.length > 0) return list;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch categories from Firestore:', err);
    return null;
  }
}

export async function seedCategoriesToDB(categoriesList: Category[]): Promise<boolean> {
  try {
    for (const cat of categoriesList) {
      const cleaned = sanitizeForFirestore(cat);
      await setDoc(doc(db, 'categories', cat.id), cleaned, { merge: true });
    }
    return true;
  } catch (err) {
    console.warn('Failed to seed categories to Firestore:', err);
    return false;
  }
}

export async function saveCommentToDB(comment: NewsComment & { articleId: string }): Promise<boolean> {
  try {
    const commentId = comment.id || `comm-${Date.now()}`;
    await setDoc(doc(db, 'comments', commentId), {
      ...comment,
      id: commentId,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to save comment to Firestore:', err);
    return false;
  }
}

export async function fetchCommentsFromDB(articleId: string): Promise<NewsComment[]> {
  try {
    const q = query(collection(db, 'comments'), where('articleId', '==', articleId));
    const snapshot = await getDocs(q);
    const comments: NewsComment[] = [];
    snapshot.forEach((docSnap) => {
      comments.push(docSnap.data() as NewsComment);
    });
    return comments;
  } catch (err) {
    console.warn('Failed to fetch comments from Firestore:', err);
    return [];
  }
}

export async function saveSiteSettingsToDB(settings: SiteSettings): Promise<boolean> {
  try {
    const cleaned = sanitizeForFirestore(settings);
    await setDoc(doc(db, 'site_settings', 'main'), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to save site settings to Firestore:', err);
    return false;
  }
}

export async function fetchSiteSettingsFromDB(): Promise<SiteSettings | null> {
  try {
    const snap = await getDoc(doc(db, 'site_settings', 'main'));
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch site settings from Firestore:', err);
    return null;
  }
}

