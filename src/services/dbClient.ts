import type { NewsArticle, Category, NewsComment } from '../types';
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

  return {
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

export async function fetchArticleByIdFromDB(idOrSlug: string): Promise<NewsArticle | null> {
  try {
    if (!idOrSlug) return null;
    // 1. Direct get by Document ID
    const directDoc = await getDoc(doc(db, 'articles', idOrSlug));
    if (directDoc.exists()) {
      return parseArticleData({ id: directDoc.id, ...directDoc.data() });
    }

    // 2. Query by slug
    const qSlug = query(collection(db, 'articles'), where('slug', '==', idOrSlug), limit(1));
    const slugSnap = await getDocs(qSlug);
    if (!slugSnap.empty) {
      const d = slugSnap.docs[0];
      return parseArticleData({ id: d.id, ...d.data() });
    }

    // 3. Query by id field
    const qId = query(collection(db, 'articles'), where('id', '==', idOrSlug), limit(1));
    const idSnap = await getDocs(qId);
    if (!idSnap.empty) {
      const d = idSnap.docs[0];
      return parseArticleData({ id: d.id, ...d.data() });
    }

    return null;
  } catch (err) {
    console.warn('Failed to fetch article by ID/Slug from Firestore:', err);
    return null;
  }
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
  try {
    const cleaned = sanitizeForFirestore({
      ...article,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'articles', article.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to save article to Firestore:', err);
    return false;
  }
}

export async function deleteArticleFromDB(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'articles', id));
    return true;
  } catch (err) {
    console.warn('Failed to delete article from Firestore:', err);
    return false;
  }
}

export async function seedCategoriesToDB(categoriesList: Category[]): Promise<boolean> {
  try {
    for (const cat of categoriesList) {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
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
