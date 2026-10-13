import { NewsArticle, NewsComment } from '../types';

const DB_NAME = 'WartakiniOfflineDB';
const DB_VERSION = 2;
const STORE_NAME = 'saved_articles';
const COMMENTS_STORE_NAME = 'article_comments';

/**
 * Open or create the Wartakini IndexedDB database.
 */
export const openOfflineDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('savedAt', 'savedAt', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
      if (!db.objectStoreNames.contains(COMMENTS_STORE_NAME)) {
        const commentStore = db.createObjectStore(COMMENTS_STORE_NAME, { keyPath: 'id' });
        commentStore.createIndex('articleId', 'articleId', { unique: false });
        commentStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB database'));
    };
  });
};

/**
 * Save a single article into IndexedDB for offline reading.
 */
export const saveArticleToIndexedDB = async (article: NewsArticle): Promise<void> => {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const articleToSave = {
        ...article,
        cachedAt: new Date().toISOString(),
      };

      const request = store.put(articleToSave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save article to IndexedDB:', err);
  }
};

/**
 * Remove an article from IndexedDB.
 */
export const removeArticleFromIndexedDB = async (id: string): Promise<void> => {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to remove article from IndexedDB:', err);
  }
};

/**
 * Get all cached articles from IndexedDB.
 */
export const getAllOfflineArticlesFromIndexedDB = async (): Promise<NewsArticle[]> => {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as NewsArticle[]);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Failed to retrieve articles from IndexedDB:', err);
    return [];
  }
};

/**
 * Get a specific article from IndexedDB by ID.
 */
export const getOfflineArticleFromIndexedDB = async (id: string): Promise<NewsArticle | null> => {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve((request.result as NewsArticle) || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error(`Failed to fetch article ${id} from IndexedDB:`, err);
    return null;
  }
};

/**
 * Sync all current saved articles to IndexedDB in bulk.
 */
export const syncSavedArticlesToIndexedDB = async (articles: NewsArticle[]): Promise<void> => {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear obsolete items first
    store.clear();

    for (const article of articles) {
      store.put({
        ...article,
        cachedAt: new Date().toISOString(),
      });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to sync saved articles to IndexedDB:', err);
  }
};

/**
 * Save a single comment or array of comments into IndexedDB under articleId.
 */
export const saveCommentToIndexedDB = async (articleId: string, comment: NewsComment): Promise<void> => {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(COMMENTS_STORE_NAME, 'readwrite');
      const store = tx.objectStore(COMMENTS_STORE_NAME);

      const recordToStore = {
        ...comment,
        articleId,
        savedLocallyAt: new Date().toISOString(),
      };

      const request = store.put(recordToStore);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`Failed to save comment for article ${articleId} to IndexedDB:`, err);
  }
};

/**
 * Save all comments for a specific article to IndexedDB.
 */
export const saveAllCommentsToIndexedDB = async (articleId: string, comments: NewsComment[]): Promise<void> => {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(COMMENTS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(COMMENTS_STORE_NAME);

    for (const comment of comments) {
      store.put({
        ...comment,
        articleId,
        savedLocallyAt: new Date().toISOString(),
      });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`Failed to bulk save comments for article ${articleId} to IndexedDB:`, err);
  }
};

/**
 * Retrieve all stored comments for an article from IndexedDB.
 */
export const getCommentsFromIndexedDB = async (articleId: string): Promise<NewsComment[]> => {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(COMMENTS_STORE_NAME, 'readonly');
      const store = tx.objectStore(COMMENTS_STORE_NAME);
      const index = store.index('articleId');
      const request = index.getAll(articleId);

      request.onsuccess = () => {
        resolve((request.result as NewsComment[]) || []);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error(`Failed to get comments for article ${articleId} from IndexedDB:`, err);
    return [];
  }
};

/**
 * Get offline storage stats (item count and estimated storage bytes).
 */
export const getOfflineStorageStats = async (): Promise<{ count: number; estimatedKB: number }> => {
  try {
    const articles = await getAllOfflineArticlesFromIndexedDB();
    const jsonString = JSON.stringify(articles);
    const estimatedBytes = new Blob([jsonString]).size;
    return {
      count: articles.length,
      estimatedKB: Math.round(estimatedBytes / 1024),
    };
  } catch (e) {
    return { count: 0, estimatedKB: 0 };
  }
};

