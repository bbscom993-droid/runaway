import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Check, 
  Copy, 
  ExternalLink, 
  Send, 
  Radio, 
  Sparkles, 
  MessageCircle, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { NewsArticle, SocialAutoShareSettings } from '../../types';
import { 
  formatSocialShareMessage, 
  getArticleShareUrl, 
  getWhatsAppShareUrl, 
  getTelegramShareUrl, 
  getTwitterShareUrl, 
  getFacebookShareUrl, 
  getLinkedInShareUrl,
  dispatchSocialWebhook,
  dispatchTelegramBot,
  DEFAULT_SOCIAL_AUTO_SHARE_SETTINGS
} from '../../utils/socialAutoShareEngine';

interface SocialAutoShareDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
  settings?: SocialAutoShareSettings;
  showToast: (msg: string) => void;
}

export const SocialAutoShareDispatcherModal: React.FC<SocialAutoShareDispatcherModalProps> = ({
  isOpen,
  onClose,
  article,
  settings = DEFAULT_SOCIAL_AUTO_SHARE_SETTINGS,
  showToast,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'preview'>('channels');
  const [customMessageText, setCustomMessageText] = useState('');
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  
  // Dispatch statuses
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [webhookMessage, setWebhookMessage] = useState<string>('');
  const [telegramBotStatus, setTelegramBotStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [telegramBotMessage, setTelegramBotMessage] = useState<string>('');

  useEffect(() => {
    if (article) {
      const formatted = formatSocialShareMessage(article, settings);
      setCustomMessageText(formatted);
      setWebhookStatus('idle');
      setWebhookMessage('');
      setTelegramBotStatus('idle');
      setTelegramBotMessage('');
      
      // Auto-trigger webhook if enabled and configured
      if (settings?.channels?.webhook && settings.channelConfigs?.webhookUrl) {
        handleTriggerWebhook(article);
      }
    }
  }, [article, settings]);

  if (!isOpen || !article) return null;

  const articleUrl = getArticleShareUrl(article);
  const waMessage = customMessageText || formatSocialShareMessage(article, settings, 'whatsapp');
  const twitterMessage = formatSocialShareMessage(article, settings, 'twitter');
  const telegramMessage = customMessageText || formatSocialShareMessage(article, settings, 'telegram');

  const handleCopyText = () => {
    navigator.clipboard.writeText(customMessageText);
    setCopiedText(true);
    showToast('📋 Teks format siaran media sosial berhasil disalin!');
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopiedLink(true);
    showToast('🔗 Tautan berita berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleTriggerWebhook = async (targetArticle: NewsArticle) => {
    if (!settings.channelConfigs?.webhookUrl) return;
    setWebhookStatus('sending');
    const result = await dispatchSocialWebhook(targetArticle, {
      webhookUrl: settings.channelConfigs.webhookUrl,
      secret: settings.channelConfigs.webhookSecret,
    });
    if (result.success) {
      setWebhookStatus('success');
      setWebhookMessage(result.message);
      showToast('⚡ Webhook siaran sosial berhasil dikirim!');
    } else {
      setWebhookStatus('error');
      setWebhookMessage(result.message);
    }
  };

  const handleTriggerTelegramBot = async (targetArticle: NewsArticle) => {
    const token = settings.channelConfigs?.telegramBotToken;
    const channelId = settings.channelConfigs?.telegramChannelId;
    if (!token || !channelId) {
      window.open(getTelegramShareUrl(articleUrl, telegramMessage), '_blank');
      return;
    }
    setTelegramBotStatus('sending');
    const result = await dispatchTelegramBot(targetArticle, token, channelId);
    if (result.success) {
      setTelegramBotStatus('success');
      setTelegramBotMessage(result.message);
      showToast(result.message);
    } else {
      setTelegramBotStatus('error');
      setTelegramBotMessage(result.message);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: customMessageText,
          url: articleUrl,
        });
        showToast('Warta berhasil dibagikan!');
      } catch (e) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyText();
    }
  };

  const handleOpenAllActiveChannels = () => {
    // Open WhatsApp
    window.open(getWhatsAppShareUrl(waMessage, settings.channelConfigs?.whatsappTarget), '_blank');
    // Open Telegram
    setTimeout(() => {
      window.open(getTelegramShareUrl(articleUrl, telegramMessage), '_blank');
    }, 400);
    // Open Twitter
    setTimeout(() => {
      window.open(getTwitterShareUrl(twitterMessage), '_blank');
    }, 800);
    showToast('🚀 Membuka saluran WhatsApp, Telegram, dan Twitter!');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full border-2 border-yellow-400 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-sky-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-xs flex-shrink-0">
              <Radio className="w-5 h-5 text-sky-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-sky-950 font-black text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider shadow-2xs">
                  Real-Time Syndication
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                  Warta Terbit
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight font-sans text-white mt-0.5">
                Siarkan Warta ke Media Sosial
              </h2>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-sky-300 hover:text-white border border-sky-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Summary Banner */}
        <div className="bg-sky-50 px-4 py-3 border-b border-sky-200 flex items-center gap-3 flex-shrink-0">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-12 h-12 rounded-lg object-cover border border-sky-300 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono font-black uppercase text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded mr-2">
              #{article.categoryLabel}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-sky-950 truncate mt-0.5">
              {article.title}
            </h3>
            <p className="text-[11px] text-slate-500 truncate font-mono">
              {articleUrl}
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 pt-2 gap-2 text-xs font-bold font-mono flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'channels'
                ? 'border-yellow-500 text-sky-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Saluran Siaran (Channels)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-yellow-500 text-sky-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pratinjau Teks Pesan</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'channels' ? (
            <>
              {/* Quick 1-Click All Channels Button */}
              <div className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 p-3.5 rounded-xl border border-yellow-500 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-md">
                <div>
                  <h4 className="text-xs font-black uppercase text-sky-950 font-mono tracking-tight flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-950" />
                    Siaran Cepat Multi-Saluran
                  </h4>
                  <p className="text-[11px] text-sky-900 leading-tight">
                    Buka WhatsApp, Telegram, dan Twitter sekaligus dalam 1 klik.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleOpenAllActiveChannels}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-sky-950 hover:bg-sky-900 text-yellow-300 font-black text-xs rounded-lg border border-sky-800 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <span>Luncurkan Siaran</span>
                    <ExternalLink className="w-3 h-3 text-yellow-400" />
                  </button>
                </div>
              </div>

              {/* Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. WhatsApp */}
                <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-400 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sky-950 text-xs">WhatsApp Broadcast</div>
                      <div className="text-[10px] text-emerald-800 truncate font-mono">Saluran / Grup Redaksi</div>
                    </div>
                  </div>
                  <a
                    href={getWhatsAppShareUrl(waMessage, settings.channelConfigs?.whatsappTarget)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-xs flex-shrink-0"
                  >
                    <span>Kirim WA</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* 2. Telegram */}
                <div className="p-3 rounded-xl border border-sky-300 bg-sky-50/70 flex items-center justify-between gap-3 shadow-2xs hover:border-sky-400 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sky-950 text-xs">Telegram Channel</div>
                      <div className="text-[10px] text-sky-800 truncate font-mono">
                        {settings.channelConfigs?.telegramChannelId || '@arunnews'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {settings.channelConfigs?.telegramBotToken ? (
                      <button
                        type="button"
                        onClick={() => handleTriggerTelegramBot(article)}
                        disabled={telegramBotStatus === 'sending'}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        {telegramBotStatus === 'sending' ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : telegramBotStatus === 'success' ? (
                          <Check className="w-3 h-3 text-emerald-300" />
                        ) : (
                          <span>Kirim Bot</span>
                        )}
                      </button>
                    ) : (
                      <a
                        href={getTelegramShareUrl(articleUrl, telegramMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-xs"
                      >
                        <span>Share Telegram</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* 3. X / Twitter */}
                <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-400 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                      <span className="font-mono text-sm">𝕏</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sky-950 text-xs">X (Twitter)</div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">Tweet Berita Kilas</div>
                    </div>
                  </div>
                  <a
                    href={getTwitterShareUrl(twitterMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-xs flex-shrink-0"
                  >
                    <span>Tweet 𝕏</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* 4. Facebook */}
                <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                      <span className="font-serif font-black text-base">f</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sky-950 text-xs">Facebook Page</div>
                      <div className="text-[10px] text-blue-800 truncate font-mono">Halaman / Komunitas</div>
                    </div>
                  </div>
                  <a
                    href={getFacebookShareUrl(articleUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-xs flex-shrink-0"
                  >
                    <span>Bagikan FB</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* 5. LinkedIn */}
                <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/60 flex items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                      <span className="font-mono font-bold text-xs">in</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sky-950 text-xs">LinkedIn Syndication</div>
                      <div className="text-[10px] text-indigo-800 truncate font-mono">Jaringan Profesional</div>
                    </div>
                  </div>
                  <a
                    href={getLinkedInShareUrl(articleUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-xs flex-shrink-0"
                  >
                    <span>Share LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* 6. Webhook / Zapier */}
                <div className="p-3 rounded-xl border border-amber-300 bg-amber-50/70 flex items-center justify-between gap-3 shadow-2xs hover:border-amber-400 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sky-950 text-xs">API Webhook / Zapier</div>
                      <div className="text-[10px] text-amber-900 truncate font-mono">
                        {settings.channelConfigs?.webhookUrl ? 'URL Terkonfigurasi' : 'Belum diatur di Pengaturan'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerWebhook(article)}
                    disabled={!settings.channelConfigs?.webhookUrl || webhookStatus === 'sending'}
                    className={`px-3 py-1.5 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer flex-shrink-0 ${
                      !settings.channelConfigs?.webhookUrl
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : webhookStatus === 'success'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {webhookStatus === 'sending' ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : webhookStatus === 'success' ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Terkirim</span>
                      </>
                    ) : (
                      <span>Picu Webhook</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Feedbacks */}
              {webhookMessage && (
                <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
                  webhookStatus === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                }`}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{webhookMessage}</span>
                </div>
              )}
              {telegramBotMessage && (
                <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
                  telegramBotStatus === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                }`}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{telegramBotMessage}</span>
                </div>
              )}

              {/* Fast Copy Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-sky-950 hover:bg-sky-900 text-yellow-300 font-bold text-xs border border-sky-800 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-yellow-400" />}
                  <span>{copiedText ? 'Teks Berhasil Disalin!' : 'Salin Naskah Siaran Lengkap'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full sm:flex-initial py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-sky-950 font-bold text-xs border border-sky-300 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-sky-700" />}
                  <span>Salin Tautan Saja</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full sm:flex-initial py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs border border-yellow-500 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-950" />
                  <span>Share Sheet Ponsel</span>
                </button>
              </div>
            </>
          ) : (
            /* Tab: Message Preview & Live Editor */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-950 text-xs">
                  Format Naskah Pesan Siaran:
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingMessage(!isEditingMessage)}
                  className="text-[11px] font-mono text-sky-700 hover:text-sky-950 underline font-bold"
                >
                  {isEditingMessage ? 'Selesai Edit' : 'Edit Pesan Manual'}
                </button>
              </div>

              {isEditingMessage ? (
                <textarea
                  rows={8}
                  value={customMessageText}
                  onChange={(e) => setCustomMessageText(e.target.value)}
                  className="w-full p-3 text-xs bg-white rounded-xl border border-sky-300 text-sky-950 font-mono focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner max-h-64 overflow-y-auto select-all">
                  {customMessageText}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Panjang Karakter: <strong>{customMessageText.length}</strong> karakter</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomMessageText(formatSocialShareMessage(article, settings));
                    setIsEditingMessage(false);
                    showToast('Format pesan direset ke template standar.');
                  }}
                  className="text-sky-700 hover:underline"
                >
                  Reset ke Template Standar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Status Terverifikasi • Redaksi Arun News Real-Time Hub
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-xl bg-sky-950 hover:bg-sky-900 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            Selesai &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
