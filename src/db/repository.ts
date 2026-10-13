import { db } from './index.ts';
import { articles, categories, comments, polls, tickerMessages, users } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import type { NewsArticle, Category, NewsComment, PollData } from '../types.ts';

// Categories Repository
export async function getDBCategories() {
  try {
    const rows = await db.select().from(categories).orderBy(categories.sortOrder);
    return rows;
  } catch (error) {
    console.error('Error fetching categories from Cloud SQL:', error);
    throw new Error('Gagal mengambil daftar kategori dari database Cloud SQL', { cause: error });
  }
}

export async function seedDBCategories(categoryList: Category[]) {
  try {
    for (let i = 0; i < categoryList.length; i++) {
      const cat = categoryList[i];
      await db.insert(categories)
        .values({
          id: cat.id,
          name: cat.name,
          color: cat.color || '#0284c7',
          sortOrder: i,
        })
        .onConflictDoUpdate({
          target: categories.id,
          set: {
            name: cat.name,
            color: cat.color || '#0284c7',
            sortOrder: i,
          },
        });
    }
  } catch (error) {
    console.error('Error seeding categories in Cloud SQL:', error);
    throw new Error('Gagal menyinkronkan kategori ke Cloud SQL', { cause: error });
  }
}

// Articles Repository
export async function getDBArticles() {
  try {
    const rows = await db.select().from(articles).orderBy(desc(articles.createdAt));
    return rows;
  } catch (error) {
    console.error('Error fetching articles from Cloud SQL:', error);
    throw new Error('Gagal mengambil daftar warta dari database Cloud SQL', { cause: error });
  }
}

export async function saveDBArticle(art: NewsArticle) {
  try {
    if (art.category) {
      await db.insert(categories)
        .values({
          id: art.category,
          name: art.categoryLabel || art.category,
          color: '#0284c7',
          sortOrder: 99,
        })
        .onConflictDoNothing();
    }

    await db.insert(articles)
      .values({
        id: art.id,
        title: art.title,
        slug: art.slug || art.id,
        excerpt: art.excerpt,
        content: art.content,
        paragraphs: art.paragraphs || [art.content],
        category: art.category,
        categoryLabel: art.categoryLabel,
        authorName: art.author.name,
        authorRole: art.author.role,
        authorAvatar: art.author.avatar,
        publishedAt: art.publishedAt,
        readTime: art.readTime || '3 mnt baca',
        imageUrl: art.imageUrl,
        imageCaption: art.imageCaption || '',
        views: art.views || 0,
        likes: art.likes || 0,
        shares: art.shares || 0,
        tags: art.tags || [],
        keyTakeaways: art.keyTakeaways || [],
        isHeadline: art.isHeadline || false,
        isBreaking: art.isBreaking || false,
        isEditorPick: art.isEditorPick || false,
        isTrending: art.isTrending || false,
      })
      .onConflictDoUpdate({
        target: articles.id,
        set: {
          title: art.title,
          slug: art.slug || art.id,
          excerpt: art.excerpt,
          content: art.content,
          paragraphs: art.paragraphs || [art.content],
          category: art.category,
          categoryLabel: art.categoryLabel,
          authorName: art.author.name,
          authorRole: art.author.role,
          authorAvatar: art.author.avatar,
          publishedAt: art.publishedAt,
          readTime: art.readTime || '3 mnt baca',
          imageUrl: art.imageUrl,
          imageCaption: art.imageCaption || '',
          views: art.views || 0,
          likes: art.likes || 0,
          shares: art.shares || 0,
          tags: art.tags || [],
          keyTakeaways: art.keyTakeaways || [],
          isHeadline: art.isHeadline || false,
          isBreaking: art.isBreaking || false,
          isEditorPick: art.isEditorPick || false,
          isTrending: art.isTrending || false,
        },
      });
  } catch (error) {
    console.error('Error saving article to Cloud SQL:', error);
    throw new Error('Gagal menyimpan warta ke database Cloud SQL', { cause: error });
  }
}

export async function deleteDBArticle(id: string) {
  try {
    await db.delete(articles).where(eq(articles.id, id));
  } catch (error) {
    console.error('Error deleting article from Cloud SQL:', error);
    throw new Error('Gagal menghapus warta dari Cloud SQL', { cause: error });
  }
}

// Comments Repository
export async function getDBComments(articleId: string) {
  try {
    const rows = await db.select().from(comments).where(eq(comments.articleId, articleId));
    return rows;
  } catch (error) {
    console.error('Error fetching comments from Cloud SQL:', error);
    throw new Error('Gagal mengambil komentar dari Cloud SQL', { cause: error });
  }
}

export async function addDBComment(c: NewsComment & { articleId: string }) {
  try {
    await db.insert(comments).values({
      id: c.id,
      articleId: c.articleId,
      userName: c.userName,
      userAvatar: c.userAvatar,
      content: c.content,
      timestamp: c.timestamp,
      likes: c.likes || 0,
      isVerified: c.isVerified || false,
      isBuzzerSuspect: c.isBuzzerSuspect || false,
      buzzerReasons: c.buzzerReasons || [],
    });
  } catch (error) {
    console.error('Error adding comment to Cloud SQL:', error);
    throw new Error('Gagal mengirim komentar ke Cloud SQL', { cause: error });
  }
}

// User Profile Upsert
export async function upsertDBUser(uid: string, email: string, name?: string, avatar?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name: name || 'Pengguna Arun News',
        avatar: avatar || undefined,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name: name || 'Pengguna Arun News',
          avatar: avatar || undefined,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error upserting user profile in Cloud SQL:', error);
    throw new Error('Gagal menyimpan profil pengguna ke Cloud SQL', { cause: error });
  }
}
