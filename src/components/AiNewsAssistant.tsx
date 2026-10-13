import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ArrowUpRight, 
  Loader2, 
  Mic, 
  MicOff, 
  Compass,
  FileText,
  Clock,
  ChevronDown
} from 'lucide-react';
import { NewsArticle } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relatedArticles?: Array<{
    id: string;
    title: string;
    categoryLabel?: string;
    imageUrl?: string;
    readTime?: string;
  }>;
}

interface AiNewsAssistantProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  currentArticle?: NewsArticle | null;
}

export const AiNewsAssistant: React.FC<AiNewsAssistantProps> = ({
  articles,
  onSelectArticle,
  currentArticle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [focusOnCurrentArticle, setFocusOnCurrentArticle] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const defaultSuggestions = [
    'Apa 3 berita terhangat hari ini?',
    'Ringkas perkembangan ekonomi nasional terkini',
    'Bagaimana update transportasi & LRT Jabodebek?',
    'Jelaskan isu hukum dan regulasi terbaru',
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: 'Halo! Saya **AI News Assistant** resmi Arun News. Saya dapat membantu Anda merangkum peristiwa, mencari topik berita spesifik, atau menjelaskan isu terkini di Nusantara. Ada yang ingin Anda ketahui?',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Web Speech Synthesis Cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          articles: articles.slice(0, 15).map((a) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt,
            categoryLabel: a.categoryLabel,
            publishedAt: a.publishedAt,
            keyTakeaways: a.keyTakeaways,
          })),
          currentArticle: focusOnCurrentArticle && currentArticle ? currentArticle : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal berkomunikasi dengan server asisten');
      }

      const data = await response.json();

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Maaf, saya tidak dapat memproses jawaban saat ini.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        relatedArticles: data.relatedArticles || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('AI Assistant request failed, using intelligent fallback:', err);
      // Client-side fallback
      const qLower = text.toLowerCase();
      const matched = articles.filter((a) => {
        const full = `${a.title} ${a.excerpt} ${a.categoryLabel}`.toLowerCase();
        return qLower.split(' ').some((w) => w.length > 3 && full.includes(w));
      }).slice(0, 3);

      let fallbackReply = '';
      if (currentArticle && (qLower.includes('ini') || qLower.includes('ringkas') || qLower.includes('jelaskan'))) {
        fallbackReply = `Ringkasan warta yang sedang Anda buka, **"${currentArticle.title}"**:\n\n` +
          `• ${currentArticle.excerpt || 'Warta aktual terverifikasi'}\n` +
          `• Kategori: ${currentArticle.categoryLabel} oleh ${currentArticle.author.name}.\n\n` +
          `Apakah ada aspek lain yang ingin Anda ketahui?`;
      } else if (matched.length > 0) {
        fallbackReply = `Berikut berita terkait pertanyaan Anda di portal Arun News:\n\n` +
          matched.map((m) => `• **${m.title}** (${m.categoryLabel})\n  > ${m.excerpt.slice(0, 120)}...`).join('\n\n') +
          `\n\nKlik kartu warta di bawah untuk membaca liputan lengkap!`;
      } else {
        const top3 = articles.slice(0, 3);
        fallbackReply = `Berikut warta terhangat hari ini di Nusantara:\n\n` +
          top3.map((m) => `• **${m.title}** (${m.categoryLabel})`).join('\n') +
          `\n\nAnda dapat menanyakan topik khusus seperti ekonomi hijau, olahraga, atau investigasi kriminal.`;
      }

      const fallbackMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        relatedArticles: matched.length > 0 ? matched : articles.slice(0, 3),
      };

      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSpeakText = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`>]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) utterance.voice = idVoice;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetChat = () => {
    if (speakingId && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Percakapan telah direset. Silakan tanyakan warta terkini lainnya!',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleToggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Peramban Anda belum mendukung input suara Web Speech API.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const handleArticleClick = (artId: string) => {
    const fullArticle = articles.find((a) => a.id === artId);
    if (fullArticle) {
      onSelectArticle(fullArticle);
    }
  };

  return (
    <>
      {/* Floating Launcher Button (Bottom-Right, adapted for mobile navigation) */}
      {!isOpen && (
        <div className="fixed bottom-18 lg:bottom-5 right-3 sm:right-5 z-40 flex items-center gap-2">
          <button
            id="ai-assistant-floating-btn"
            onClick={handleToggleOpen}
            className="group flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-yellow-300 font-black text-xs shadow-2xl border-2 border-yellow-400 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-yellow-400/20"
            title="Tanya AI News Assistant"
            aria-label="Buka AI News Assistant"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-spin transition-transform" style={{ animationDuration: '6s' }} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="tracking-wide uppercase font-mono hidden sm:inline">Tanya Asisten AI</span>
            <span className="tracking-wide uppercase font-mono sm:hidden text-[11px]">Tanya AI</span>
            <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-yellow-400 text-sky-950 text-[10px] font-black font-mono">
              3.8 Flash
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div 
          id="ai-assistant-floating-panel"
          className={`fixed right-2 sm:right-5 z-40 transition-all duration-300 flex flex-col shadow-2xl rounded-2xl border-2 border-yellow-400 bg-white overflow-hidden ${
            isMinimized 
              ? 'bottom-18 lg:bottom-5 w-72 sm:w-80 h-14' 
              : 'bottom-16 sm:bottom-5 w-[96vw] sm:w-[420px] h-[550px] max-h-[82vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white flex items-center justify-between border-b border-yellow-400/40 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-xs flex-shrink-0">
                <Bot className="w-4 h-4 text-sky-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 leading-tight">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate font-brand">
                    AI News Assistant
                  </h3>
                  <span className="px-1.5 py-0.2 rounded bg-yellow-400 text-sky-950 text-[9px] font-black font-mono">
                    GEMINI
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Siap Menjawab Warta Terkini</span>
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 text-sky-300">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-lg hover:text-yellow-300 hover:bg-sky-900/60 transition-colors"
                title="Reset Percakapan"
                aria-label="Reset Percakapan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:text-yellow-300 hover:bg-sky-900/60 transition-colors"
                title={isMinimized ? 'Perbesar' : 'Kecilkan'}
                aria-label={isMinimized ? 'Perbesar' : 'Kecilkan'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleToggleOpen}
                className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-sky-900/60 transition-colors"
                title="Tutup Asisten AI"
                aria-label="Tutup Asisten AI"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Banner: Active Article if Opened */}
          {!isMinimized && currentArticle && (
            <div className="bg-yellow-50 px-3 py-1.5 border-b border-yellow-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate text-sky-950 font-medium">
                <FileText className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                <span className="text-[11px] truncate">
                  Fokus Warta: <strong>{currentArticle.title}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFocusOnCurrentArticle(!focusOnCurrentArticle)}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                  focusOnCurrentArticle
                    ? 'bg-yellow-400 text-sky-950 border border-yellow-500 font-mono'
                    : 'bg-slate-200 text-slate-700'
                }`}
                title={focusOnCurrentArticle ? 'Fokus ke berita ini aktif' : 'Fokus warta dinonaktifkan'}
              >
                {focusOnCurrentArticle ? 'Fokus ON' : 'Fokus OFF'}
              </button>
            </div>
          )}

          {/* Chat Messages Body */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-sky-900 text-white rounded-br-xs'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {/* Message content */}
                    <div className="whitespace-pre-line space-y-1 font-sans">
                      {msg.content}
                    </div>

                    {/* Related Articles Cards if recommended */}
                    {msg.relatedArticles && msg.relatedArticles.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1.5">
                        <div className="text-[10px] font-black uppercase text-sky-900 flex items-center gap-1">
                          <Compass className="w-3 h-3 text-yellow-500" />
                          Rujukan Warta Terkait:
                        </div>
                        {msg.relatedArticles.map((rel) => (
                          <div
                            key={rel.id}
                            onClick={() => handleArticleClick(rel.id)}
                            className="flex items-center gap-2 p-1.5 rounded-lg bg-sky-50 hover:bg-yellow-100 border border-sky-100 hover:border-yellow-400 cursor-pointer transition-all"
                            title="Buka Berita Ini"
                          >
                            {rel.imageUrl && (
                              <img
                                src={rel.imageUrl}
                                alt={rel.title}
                                className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sky-950 text-[11px] truncate">
                                {rel.title}
                              </div>
                              <div className="text-[9px] text-sky-700 font-mono">
                                {rel.categoryLabel || 'Warta'} • {rel.readTime || '3 mnt'}
                              </div>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bottom Metadata & Controls */}
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <button
                            type="button"
                            onClick={() => handleSpeakText(msg.id, msg.content)}
                            className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                              speakingId === msg.id ? 'text-amber-600 font-bold' : 'text-slate-500'
                            }`}
                            title={speakingId === msg.id ? 'Hentikan Suara' : 'Dengarkan Jawaban (TTS)'}
                          >
                            {speakingId === msg.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.id, msg.content)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                            title="Salin Teks Jawaban"
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing loader */}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 bg-white border border-slate-200 p-2.5 rounded-2xl w-fit rounded-bl-xs shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-500" />
                  <span className="text-[11px] font-mono animate-pulse">Menghubungkan ke Gemini 3.8 Flash...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Quick Suggestions Chips */}
          {!isMinimized && messages.length <= 2 && (
            <div className="px-3 py-2 bg-white border-t border-slate-200 overflow-x-auto whitespace-nowrap space-x-1.5 no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mr-1">Tanya Cepat:</span>
              {defaultSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(sug)}
                  disabled={isLoading}
                  className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-sky-50 hover:bg-yellow-100 hover:text-sky-950 text-sky-800 border border-sky-200 transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input Bar */}
          {!isMinimized && (
            <div className="p-2.5 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-1.5"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Tanya warta terkini atau minta ringkasan..."
                    disabled={isLoading}
                    className="w-full text-xs bg-slate-100 border border-slate-300 focus:border-yellow-500 focus:bg-white rounded-xl py-2 pl-3 pr-8 outline-hidden transition-all text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-500 hover:text-yellow-600 transition-colors ${
                      isListening ? 'text-rose-500 animate-pulse' : ''
                    }`}
                    title={isListening ? 'Mendengarkan suara...' : 'Gunakan Input Suara (Mikrofon)'}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="w-9 h-9 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:hover:bg-yellow-400 text-sky-950 flex items-center justify-center font-bold transition-all shadow-xs border border-yellow-500 cursor-pointer active:scale-95 flex-shrink-0"
                  title="Kirim Pertanyaan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};
