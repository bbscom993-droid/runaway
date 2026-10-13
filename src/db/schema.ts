import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table (integrates with Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull().default('Pengguna Arun News'),
  role: text('role').notNull().default('reader'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#0284c7'),
  sortOrder: integer('sort_order').notNull().default(0),
});

// News Articles table
export const articles = pgTable('articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  paragraphs: jsonb('paragraphs').$type<string[]>().default([]),
  category: text('category').notNull().references(() => categories.id),
  categoryLabel: text('category_label').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull().default('Reporter Berita'),
  authorAvatar: text('author_avatar').notNull(),
  publishedAt: text('published_at').notNull(),
  readTime: text('read_time').notNull().default('3 mnt baca'),
  imageUrl: text('image_url').notNull(),
  imageCaption: text('image_caption').notNull().default(''),
  views: integer('views').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  shares: integer('shares').notNull().default(0),
  tags: jsonb('tags').$type<string[]>().default([]),
  keyTakeaways: jsonb('key_takeaways').$type<string[]>().default([]),
  isHeadline: boolean('is_headline').default(false),
  isBreaking: boolean('is_breaking').default(false),
  isEditorPick: boolean('is_editor_pick').default(false),
  isTrending: boolean('is_trending').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// News Comments table
export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  articleId: text('article_id').notNull().references(() => articles.id),
  userName: text('user_name').notNull(),
  userAvatar: text('user_avatar').notNull(),
  content: text('content').notNull(),
  timestamp: text('timestamp').notNull(),
  likes: integer('likes').notNull().default(0),
  isVerified: boolean('is_verified').default(false),
  isBuzzerSuspect: boolean('is_buzzer_suspect').default(false),
  buzzerReasons: jsonb('buzzer_reasons').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// Polls table
export const polls = pgTable('polls', {
  id: text('id').primaryKey(),
  question: text('question').notNull(),
  options: jsonb('options').$type<{ id: string; text: string; votes: number }[]>().notNull(),
  totalVotes: integer('total_votes').notNull().default(0),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Ticker Running Text Messages table
export const tickerMessages = pgTable('ticker_messages', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  category: text('category').notNull().default('BREAKING'),
  link: text('link'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
