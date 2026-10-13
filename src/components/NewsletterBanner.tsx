import React, { useState } from 'react';
import { Mail, Phone, CheckCircle2, Send, Sparkles, ShieldCheck, MessageSquare } from 'lucide-react';

export const NewsletterBanner: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subscribedData, setSubscribedData] = useState<{ email: string; phone: string } | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !phone.trim()) return;
    setSubscribedData({ email, phone });
    setEmail('');
    setPhone('');
  };

  return (
    <section id="newsletter-banner" className="my-8 bg-sky-900 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-sky-800 relative overflow-hidden">
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-sky-950 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider mb-3 shadow-2xs border border-yellow-500 font-mono">
          <Sparkles className="w-3.5 h-3.5 fill-sky-950" />
          LANGGANAN NEWSLETTER HARIAN & WARTA WA
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
          Dapatkan Ringkasan Warta Terpenting Pagi Hari Langsung di Email & WhatsApp Anda
        </h2>

        <p className="text-xs sm:text-sm text-sky-200 mb-5 max-w-xl mx-auto leading-relaxed font-medium">
          Kurasi 5 warta terhangat nasional, analisis ekonomi terpercaya, dan kabar teknologi terbaru setiap pukul 06.00 WIB melalui Email & pesan cepat WhatsApp. Gratis, tanpa spam.
        </p>

        {subscribedData ? (
          <div className="bg-yellow-400 text-sky-950 rounded-xl p-4 border border-yellow-500 max-w-lg mx-auto flex flex-col items-center justify-center gap-1.5 font-black text-xs sm:text-sm animate-in fade-in shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-950 flex-shrink-0" />
              <span>Terima kasih! Anda telah terdaftar di buletin pagi Arun News.</span>
            </div>
            <div className="text-[11px] font-mono font-medium text-sky-900 bg-yellow-300/80 px-3 py-1 rounded-lg border border-yellow-500/50 mt-1 flex flex-wrap items-center justify-center gap-3">
              <span>Email: <strong>{subscribedData.email}</strong></span>
              <span>•</span>
              <span>No. HP/WA: <strong>{subscribedData.phone}</strong></span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3 max-w-xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <Mail className="w-4 h-4 text-sky-600 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan alamat email aktif..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-sky-950 placeholder:text-sky-700/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-xs font-medium border border-sky-300"
                />
              </div>

              <div className="relative">
                <Phone className="w-4 h-4 text-sky-600 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="No. HP / WhatsApp (cth: 0812...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-sky-950 placeholder:text-sky-700/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-xs font-medium border border-sky-300 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto sm:self-center px-8 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-sky-950 font-black text-xs sm:text-sm shadow-md border border-yellow-500 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Langganan Sekarang
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-sky-300 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" /> Privasi data terjamin
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Warta ringkas via WhatsApp
          </span>
          <span>•</span>
          <span>Bisa berhenti kapan saja</span>
        </div>
      </div>
    </section>
  );
};
