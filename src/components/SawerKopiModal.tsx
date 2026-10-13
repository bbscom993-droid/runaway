import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  X, 
  Heart, 
  CheckCircle, 
  Sparkles, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Award,
  Send,
  MessageCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Supporter {
  id: string;
  name: string;
  cups: number;
  amount: number;
  message: string;
  timestamp: string;
  avatarSeed: string;
}

const INITIAL_SUPPORTERS: Supporter[] = [
  {
    id: 'sup-1',
    name: 'Budi Santoso',
    cups: 3,
    amount: 50000,
    message: 'Semangat terus mengabarkan kebenaran nusantara tanpa intervensi!',
    timestamp: '10 menit lalu',
    avatarSeed: 'BS'
  },
  {
    id: 'sup-2',
    name: 'Rina Lestari',
    cups: 2,
    amount: 25000,
    message: 'Kanal beritanya sangat berimbang dan faktual. Sukses selalu tim jurnalis!',
    timestamp: '35 menit lalu',
    avatarSeed: 'RL'
  },
  {
    id: 'sup-3',
    name: 'Hamba Allah (Anonim)',
    cups: 5,
    amount: 100000,
    message: 'Secangkir kopi hangat untuk para wartawan pejuang fakta di garis depan.',
    timestamp: '2 jam lalu',
    avatarSeed: 'AN'
  },
  {
    id: 'sup-4',
    name: 'Dimas Wicaksono',
    cups: 1,
    amount: 10000,
    message: 'Kopinya mantap, liputan transportasinya paling lengkap!',
    timestamp: '4 jam lalu',
    avatarSeed: 'DW'
  }
];

interface SawerKopiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const SawerKopiModal: React.FC<SawerKopiModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [selectedCups, setSelectedCups] = useState<number>(2);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'gopay' | 'dana' | 'bca'>('qris');
  const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [supporters, setSupporters] = useState<Supporter[]>(() => {
    try {
      const saved = localStorage.getItem('wartakini_sawer_supporters');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_SUPPORTERS;
  });

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cupOptions = [
    { cups: 1, label: '1 Cangkir', desc: 'Espresso Semangat', price: 10000, icon: '☕' },
    { cups: 2, label: '2 Cangkir', desc: 'Kopi Susu Aren', price: 25000, icon: '☕☕', popular: true },
    { cups: 3, label: '3 Cangkir', desc: 'Tubruk Nusantara', price: 50000, icon: '☕☕☕' },
    { cups: 6, label: '1 Teko', desc: 'Barista Redaksi', price: 100000, icon: '🏆' },
  ];

  const currentPrice = isCustom 
    ? (parseInt(customAmount, 10) || 0)
    : (cupOptions.find(o => o.cups === selectedCups)?.price || 25000);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleSelectCup = (cups: number) => {
    setIsCustom(false);
    setSelectedCups(cups);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    if (!customAmount) setCustomAmount('15000');
  };

  const handleProceedToPayment = () => {
    if (currentPrice < 5000) {
      if (onShowToast) onShowToast('Nominal sawer kopi minimal Rp 5.000');
      return;
    }
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newSupporter: Supporter = {
        id: `sup-${Date.now()}`,
        name: isAnonymous ? 'Anonim (Sahabat Pers)' : (donorName.trim() || 'Sahabat Warta'),
        cups: isCustom ? Math.max(1, Math.round(currentPrice / 15000)) : selectedCups,
        amount: currentPrice,
        message: donorMessage.trim() || 'Semangat terus mengawal warta nusantara!',
        timestamp: 'Baru saja',
        avatarSeed: isAnonymous ? 'AN' : (donorName ? donorName.substring(0, 2).toUpperCase() : 'SP')
      };

      const updated = [newSupporter, ...supporters];
      setSupporters(updated);
      try {
        localStorage.setItem('wartakini_sawer_supporters', JSON.stringify(updated.slice(0, 20)));
      } catch (e) {
        // ignore
      }

      setIsProcessing(false);
      setStep('success');
      if (onShowToast) {
        onShowToast(`🎉 Terima kasih! ${formatRupiah(currentPrice)} berhasil disawerkan untuk redaksi.`);
      }
    }, 1200);
  };

  const handleCopyQRIS = () => {
    navigator.clipboard.writeText('00020101021226670016ID.CO.QRIS.WWW011893600911002233445502150000000000000005204581253033605802ID5914ARUN NEWS PERS6007JAKARTA61051011062070703A016304ABCD');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-slate-900 border-2 border-yellow-400/80 rounded-2xl shadow-2xl text-white overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Warm Coffee Gradient */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-5 py-4 text-sky-950 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-950 text-yellow-300 flex items-center justify-center shadow-md">
              <Coffee className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight leading-tight">
                  Sawer Kopi Redaksi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-950 text-yellow-300 font-mono">
                  Dukung Pers
                </span>
              </div>
              <p className="text-xs text-sky-950/90 font-medium">
                Traktir kopi untuk reporter & jurnalis independen Arun News
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-sky-950/20 hover:bg-sky-950 hover:text-yellow-300 text-sky-950 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">
          {step === 'select' && (
            <>
              {/* Cup Selection Grid */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-yellow-400 mb-2.5 font-mono">
                  1. Pilih Jumlah Cangkir Kopi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {cupOptions.map((opt) => {
                    const isSelected = !isCustom && selectedCups === opt.cups;
                    return (
                      <button
                        key={opt.cups}
                        type="button"
                        onClick={() => handleSelectCup(opt.cups)}
                        className={`relative p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                          isSelected
                            ? 'bg-gradient-to-b from-yellow-400 to-amber-400 text-sky-950 border-yellow-300 font-black shadow-lg scale-[1.02]'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-yellow-400/50'
                        }`}
                      >
                        {opt.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white uppercase tracking-wider shadow-xs font-mono">
                            Favorit
                          </span>
                        )}
                        <span className="text-2xl mb-1">{opt.icon}</span>
                        <span className={`text-xs ${isSelected ? 'font-black' : 'font-bold'}`}>{opt.label}</span>
                        <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-sky-950/80 font-semibold' : 'text-slate-400'}`}>
                          {opt.desc}
                        </span>
                        <span className={`mt-2 text-xs font-black font-mono px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-sky-950 text-yellow-300' : 'bg-slate-900 text-yellow-400 border border-slate-700'
                        }`}>
                          {formatRupiah(opt.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Button / Input */}
                <div className="mt-2.5">
                  {!isCustom ? (
                    <button
                      type="button"
                      onClick={handleCustomClick}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-yellow-400/50 hover:border-yellow-400 bg-slate-800/40 hover:bg-slate-800/80 text-yellow-400 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ingin sawer nominal lain? Klik di sini untuk nominal kustom</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-800 border border-yellow-400/60 flex items-center gap-2">
                      <span className="text-xs font-bold text-yellow-400 font-mono">Rp</span>
                      <input
                        type="number"
                        min="5000"
                        step="5000"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Contoh: 75000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-yellow-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustom(false)}
                        className="text-xs text-slate-400 hover:text-white px-2 py-1"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Supporter Details Form */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-yellow-400 font-mono">
                  2. Data & Pesan Penyawer
                </label>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300 font-bold">Nama Pengirim</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-yellow-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded accent-yellow-400 cursor-pointer"
                      />
                      <span>Kirim Anonim (Rahasiakan Nama)</span>
                    </label>
                  </div>
                  {!isAnonymous && (
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Masukkan nama atau alias Anda..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <span className="block text-xs text-slate-300 font-bold mb-1">
                    Pesan Semangat untuk Redaksi & Jurnalis
                  </span>
                  <textarea
                    rows={2}
                    value={donorMessage}
                    onChange={(e) => setDonorMessage(e.target.value)}
                    placeholder="Tuliskan ucapan atau saran untuk kemajuan jurnalisme kami..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 hover:from-amber-300 hover:to-yellow-300 text-sky-950 font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Coffee className="w-4 h-4 text-sky-950" />
                  <span>Lanjut Sawer Kopi ({formatRupiah(currentPrice)})</span>
                </button>
              </div>

              {/* Supporters Live Wall */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>Dinding Penyawer Kopi Terbaru</span>
                  </span>
                  <span className="text-[10px] text-yellow-400 font-mono font-bold">
                    {supporters.length} Penyawer
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {supporters.map((sup) => (
                    <div 
                      key={sup.id}
                      className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                        {sup.avatarSeed}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-white truncate">{sup.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{sup.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-sky-200 mt-0.5 leading-snug break-words">
                          "{sup.message}"
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-yellow-400 font-bold">
                            ☕ {sup.cups} Cangkir ({formatRupiah(sup.amount)})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-800 border border-yellow-400/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Sawer Kopi:</span>
                  <div className="text-lg font-black text-yellow-400 font-mono">
                    {formatRupiah(currentPrice)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Atas Nama:</span>
                  <div className="text-xs font-bold text-white">
                    {isAnonymous ? 'Anonim (Dirahasiakan)' : (donorName || 'Sahabat Warta')}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-yellow-400 mb-2 font-mono">
                  Pilih Saluran Pembayaran
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'qris'
                        ? 'bg-yellow-400 text-sky-950 font-black border-yellow-300'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">QRIS (Semua E-Wallet)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gopay')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'gopay'
                        ? 'bg-yellow-400 text-sky-950 font-black border-yellow-300'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">GoPay / ShopeePay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('dana')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'dana'
                        ? 'bg-yellow-400 text-sky-950 font-black border-yellow-300'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">DANA / OVO</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bca')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bca'
                        ? 'bg-yellow-400 text-sky-950 font-black border-yellow-300'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">Transfer Bank</span>
                  </button>
                </div>
              </div>

              {/* QRIS / Virtual Account Display */}
              <div className="p-4 rounded-2xl bg-white text-slate-900 text-center space-y-3">
                <div className="flex items-center justify-between text-xs border-b pb-2">
                  <span className="font-bold text-sky-950">QRIS Resmi Arun News Media</span>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    NMID: ID1024392019
                  </span>
                </div>

                {/* Simulated QR Code Canvas */}
                <div className="mx-auto w-44 h-44 bg-slate-50 border-2 border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center relative shadow-inner">
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-2">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`rounded-xs ${
                          (i % 2 === 0 || i % 5 === 0 || i < 8 || i > 28) 
                            ? 'bg-slate-950' 
                            : 'bg-transparent'
                        }`} 
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="p-1.5 rounded-lg bg-yellow-400 text-sky-950 font-black shadow-md border border-sky-950">
                      <Coffee className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  Pindai QR di atas menggunakan aplikasi BCA, Mandiri, GoPay, OVO, DANA, LinkAja, atau mobile banking Anda.
                </p>

                <button
                  type="button"
                  onClick={handleCopyQRIS}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-900 font-bold hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? 'Tautan QRIS Disalin!' : 'Salin Kode String QRIS'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Saya Sudah Bayar / Konfirmasi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-sky-950 flex items-center justify-center mx-auto shadow-xl animate-bounce">
                <Coffee className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-yellow-300">
                  Terima Kasih Banyak!
                </h4>
                <p className="text-xs text-sky-200 mt-1 max-w-sm mx-auto leading-relaxed">
                  Saweran kopi Anda sebesar <strong className="text-white font-mono">{formatRupiah(currentPrice)}</strong> telah diterima dewan redaksi. Dukungan ini memberi energi bagi kami untuk terus menyajikan berita akurat, bebas hoaks, dan berimbang.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-yellow-400/30 text-xs text-slate-300 font-mono">
                Pesan Anda telah disematkan pada Dinding Sahabat Warta Arun News.
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs transition-all shadow-md cursor-pointer"
              >
                Kembali Membaca Berita
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
            <span>Terverifikasi Dewan Pers & Akpersi</span>
          </span>
          <span>100% Untuk Kesejahteraan Pewarta</span>
        </div>
      </div>
    </div>
  );
};
