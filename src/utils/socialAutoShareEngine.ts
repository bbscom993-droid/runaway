import { NewsArticle, SocialAutoShareSettings } from '../types';

export const DEFAULT_SOCIAL_AUTO_SHARE_SETTINGS: SocialAutoShareSettings = {
  isEnabled: true,
  autoOpenDispatcherOnPublish: true,
  channels: {
    whatsapp: true,
    telegram: true,
    twitter: true,
    facebook: true,
    linkedin: true,
    webhook: false,
  },
  channelConfigs: {
    whatsappTarget: '',
    telegramChannelId: '@arunnews_official',
    telegramBotToken: '',
    webhookUrl: '',
    webhookSecret: '',
  },
  customTemplate: `🚨 *[ARUN NEWS • KILAS TERKINI]*\n\n*{title}*\n\n{excerpt}\n\n🔗 *Baca Selengkapnya di Portal:*\n{url}\n\n{tags}\n_Jembatan Informasi Nusantara_`,
  includeTags: true,
  includeExcerpt: true,
};

export function getArticleShareUrl(article: NewsArticle): string {
  const target = encodeURIComponent(article.slug || article.id);
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/article/${target}`;
  }
  return `/article/${target}`;
}

export function formatSocialShareMessage(
  article: NewsArticle,
  settings?: SocialAutoShareSettings,
  platform?: 'whatsapp' | 'telegram' | 'twitter' | 'facebook' | 'linkedin' | 'generic'
): string {
  const url = getArticleShareUrl(article);
  const title = article.title.trim();
  const excerpt = article.excerpt?.trim() || article.content?.slice(0, 160) || '';
  const category = article.categoryLabel || article.category;
  const author = article.author?.name || 'Redaksi Arun News';
  
  const rawTags = (article.tags && article.tags.length > 0)
    ? article.tags.slice(0, 4).map((t) => `#${t.replace(/\s+/g, '')}`).join(' ')
    : `#ArunNews #${category.replace(/\s+/g, '')}`;

  const template = settings?.customTemplate || DEFAULT_SOCIAL_AUTO_SHARE_SETTINGS.customTemplate!;

  if (platform === 'twitter') {
    // Twitter/X has a 280 character limit
    const tweetHeader = article.isBreaking ? `🚨 [BREAKING] ` : `📰 `;
    const maxTitleLen = 140;
    const truncatedTitle = title.length > maxTitleLen ? `${title.slice(0, maxTitleLen - 3)}...` : title;
    return `${tweetHeader}${truncatedTitle}\n\n${url}\n\n${rawTags}`;
  }

  // Generic replacement for template
  let message = template
    .replace('{title}', title)
    .replace('{excerpt}', settings?.includeExcerpt !== false ? excerpt : '')
    .replace('{url}', url)
    .replace('{category}', category)
    .replace('{author}', author)
    .replace('{tags}', settings?.includeTags !== false ? rawTags : '');

  // Clean multiple newlines
  message = message.replace(/\n{3,}/g, '\n\n').trim();
  return message;
}

export function getWhatsAppShareUrl(text: string, phoneOrTarget?: string): string {
  const encodedText = encodeURIComponent(text);
  if (phoneOrTarget && phoneOrTarget.trim()) {
    const cleanPhone = phoneOrTarget.replace(/[^0-9]/g, '');
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

export function getTelegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export function getTwitterShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function getFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function getLinkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export async function dispatchSocialWebhook(
  article: NewsArticle,
  config: { webhookUrl: string; secret?: string }
): Promise<{ success: boolean; message: string }> {
  if (!config.webhookUrl) {
    return { success: false, message: 'URL Webhook belum ditentukan' };
  }

  const payload = {
    event: 'article.published',
    timestamp: new Date().toISOString(),
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      url: getArticleShareUrl(article),
      category: article.category,
      categoryLabel: article.categoryLabel,
      publishedAt: article.publishedAt,
      author: article.author,
      excerpt: article.excerpt,
      imageUrl: article.imageUrl,
      tags: article.tags,
      isHeadline: article.isHeadline,
      isBreaking: article.isBreaking,
    },
    messageText: formatSocialShareMessage(article),
  };

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.secret) {
      headers['X-Arun-Secret'] = config.secret;
    }

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return { success: true, message: `Webhook terkirim sukses (Status: ${response.status})` };
    } else {
      return { success: false, message: `Webhook merespons kode: ${response.status} ${response.statusText}` };
    }
  } catch (error: any) {
    return { success: false, message: `Gagal mengirim Webhook: ${error?.message || 'Koneksi error'}` };
  }
}

export async function dispatchTelegramBot(
  article: NewsArticle,
  botToken: string,
  channelId: string
): Promise<{ success: boolean; message: string }> {
  if (!botToken || !channelId) {
    return { success: false, message: 'Bot Token dan ID Channel Telegram diperlukan' };
  }

  const text = formatSocialShareMessage(article, undefined, 'telegram');

  try {
    const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, message: `Berhasil disiarkan ke Telegram ${channelId}!` };
    } else {
      return { success: false, message: `Telegram Error: ${data.description || 'Gagal broadcast'}` };
    }
  } catch (error: any) {
    return { success: false, message: `Telegram Network Error: ${error?.message}` };
  }
}
