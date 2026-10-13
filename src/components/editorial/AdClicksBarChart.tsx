import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import {
  BarChart3,
  MousePointerClick,
  Eye,
  TrendingUp,
  Activity,
  ArrowUpDown,
  Sparkles,
  Zap,
  Award,
  Layers,
  Percent,
  Download,
  FileText
} from 'lucide-react';
import { AdSlot, SiteSettings } from '../../types';
import { generateAdPerformancePdf } from '../../utils/adPerformancePdfGenerator';

interface AdClicksBarChartProps {
  adSlots: AdSlot[];
  siteSettings?: SiteSettings;
  onSimulateClick?: (slotId: string) => void;
  className?: string;
}

// Visual color palette for ad slot bars
const SLOT_BAR_COLORS = [
  '#f59e0b', // Amber / Gold
  '#0284c7', // Sky Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

interface CustomAdTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomAdChartTooltip: React.FC<CustomAdTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-sky-950/95 text-white p-3.5 rounded-2xl shadow-2xl border border-sky-700/80 backdrop-blur-md font-sans text-xs min-w-[240px]">
        <div className="font-mono font-black text-yellow-400 border-b border-sky-800 pb-1.5 mb-2.5 flex items-center justify-between gap-3">
          <span className="truncate max-w-[170px]">🎯 {data.name}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${data.isEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300'}`}>
            {data.isEnabled ? 'LIVE' : 'OFF'}
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Mitra Sponsor:</span>
            <span className="font-bold text-sky-200 truncate max-w-[130px]">{data.advertiserName || '-'}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Posisi Slot:</span>
            <span className="font-bold text-yellow-300">{data.positionLabel}</span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1 border-t border-sky-800/60">
            <span className="text-slate-300 flex items-center gap-1">
              <MousePointerClick className="w-3.5 h-3.5 text-yellow-400" />
              <span>Total Klik:</span>
            </span>
            <span className="font-black text-yellow-400 text-sm">
              {Number(data.clicks).toLocaleString('id-ID')} klik
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Total Impresi:</span>
            </span>
            <span className="font-bold text-sky-200">
              {Number(data.impressions).toLocaleString('id-ID')} views
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1 border-t border-sky-800/60">
            <span className="text-slate-300 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              <span>Efektivitas CTR:</span>
            </span>
            <span className="font-black text-emerald-400 text-xs">
              {data.ctr}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Tarif Sewa:</span>
            <span className="font-bold text-slate-300 text-[10px]">{data.priceRate || '-'}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const AdClicksBarChart: React.FC<AdClicksBarChartProps> = ({
  adSlots,
  siteSettings,
  onSimulateClick,
  className = ''
}) => {
  const [metricMode, setMetricMode] = useState<'clicks' | 'dual' | 'ctr'>('clicks');
  const [sortBy, setSortBy] = useState<'clicks_desc' | 'ctr_desc' | 'position'>('clicks_desc');
  const [simulatedSlotId, setSimulatedSlotId] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      generateAdPerformancePdf({
        adSlots,
        siteSettings,
        generatedBy: 'Meja Redaksi & Divisi Komersial',
      });
    } catch (err) {
      console.error('Gagal membuat laporan performa iklan PDF:', err);
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 800);
    }
  };

  // Position friendly labels
  const getPositionLabel = (pos: string) => {
    switch (pos) {
      case 'top_billboard': return 'Header Billboard';
      case 'in_article': return 'Sisipan Artikel';
      case 'sidebar_sticky': return 'Sidebar Sticky';
      case 'bottom_sticky': return 'Bottom Mobile';
      default: return pos;
    }
  };

  // Transform and sort data for Recharts
  const chartData = useMemo(() => {
    const list = adSlots.map((slot, index) => {
      const clicks = Number(slot.clicks || 0);
      const impressions = Number(slot.impressions || 0);
      const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
      const ctrNumber = parseFloat(ctr);

      return {
        id: slot.id,
        name: slot.name,
        shortName: slot.name.length > 18 ? `${slot.name.substring(0, 16)}...` : slot.name,
        advertiserName: slot.advertiserName || 'Sponsor Redaksi',
        position: slot.position,
        positionLabel: getPositionLabel(slot.position),
        isEnabled: slot.isEnabled,
        clicks,
        impressions,
        ctr,
        ctrNumber,
        priceRate: slot.priceRate || 'Rp 2.500.000 / bln',
        color: SLOT_BAR_COLORS[index % SLOT_BAR_COLORS.length],
      };
    });

    if (sortBy === 'clicks_desc') {
      list.sort((a, b) => b.clicks - a.clicks);
    } else if (sortBy === 'ctr_desc') {
      list.sort((a, b) => b.ctrNumber - a.ctrNumber);
    }

    return list;
  }, [adSlots, sortBy]);

  // Aggregate metrics
  const totalClicks = useMemo(() => adSlots.reduce((acc, s) => acc + (s.clicks || 0), 0), [adSlots]);
  const totalImpressions = useMemo(() => adSlots.reduce((acc, s) => acc + (s.impressions || 0), 0), [adSlots]);
  const averageCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const topPerformer = useMemo(() => {
    if (!chartData.length) return null;
    return [...chartData].sort((a, b) => b.clicks - a.clicks)[0];
  }, [chartData]);

  // Handle simulate click for live test
  const handleTriggerSimulate = (slotId: string) => {
    setSimulatedSlotId(slotId);
    if (onSimulateClick) {
      onSimulateClick(slotId);
    }
    setTimeout(() => {
      setSimulatedSlotId(null);
    }, 1200);
  };

  return (
    <div className={`bg-white rounded-3xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-6 ${className}`}>
      
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-2xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-mono uppercase tracking-tight text-sky-950 flex items-center gap-2">
                <span>Statistik Klik & Performa Iklan Real-Time</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" title="Real-time Active Monitoring"></span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pantau konversi klik, interaksi pembaca, dan rasio CTR pada seluruh slot iklan aktif.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="inline-flex p-1 bg-sky-50 rounded-xl border border-sky-200 text-xs font-mono">
            <button
              type="button"
              onClick={() => setMetricMode('clicks')}
              className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                metricMode === 'clicks'
                  ? 'bg-yellow-400 text-sky-950 shadow-xs'
                  : 'text-sky-900 hover:text-sky-950'
              }`}
            >
              Hanya Klik
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('dual')}
              className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                metricMode === 'dual'
                  ? 'bg-yellow-400 text-sky-950 shadow-xs'
                  : 'text-sky-900 hover:text-sky-950'
              }`}
            >
              Klik vs Impresi
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('ctr')}
              className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                metricMode === 'ctr'
                  ? 'bg-yellow-400 text-sky-950 shadow-xs'
                  : 'text-sky-900 hover:text-sky-950'
              }`}
            >
              Rasio CTR (%)
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-sky-950 focus:outline-none cursor-pointer"
            >
              <option value="clicks_desc">Klik Terbanyak</option>
              <option value="ctr_desc">CTR Tertinggi</option>
              <option value="position">Urutan Default</option>
            </select>
          </div>

          {/* Download PDF Report Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-3.5 py-1.5 bg-sky-950 hover:bg-sky-900 active:scale-95 text-yellow-300 text-xs font-mono font-black rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Unduh laporan lengkap performa klik dan estimasi pendapatan dalam format PDF"
          >
            <Download className={`w-3.5 h-3.5 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
            <span>{isDownloadingPdf ? 'Menyiapkan...' : 'Unduh Laporan PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key High-level Performance Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50/40 border border-yellow-200">
          <div className="flex items-center justify-between text-yellow-800 text-[11px] font-mono font-bold uppercase">
            <span>Total Klik Iklan</span>
            <MousePointerClick className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-950 font-mono mt-1">
            {totalClicks.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-yellow-900 font-medium">Akumulasi klik pengunjung</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/40 border border-sky-200">
          <div className="flex items-center justify-between text-sky-800 text-[11px] font-mono font-bold uppercase">
            <span>Total Impresi</span>
            <Eye className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-950 font-mono mt-1">
            {totalImpressions.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-sky-900 font-medium">Tayangan di halaman portal</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200">
          <div className="flex items-center justify-between text-emerald-800 text-[11px] font-mono font-bold uppercase">
            <span>Rata-rata CTR</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1">
            {averageCtr}%
          </div>
          <span className="text-[10px] text-emerald-900 font-medium">Efektivitas interaksi tinggi</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/40 border border-indigo-200">
          <div className="flex items-center justify-between text-indigo-800 text-[11px] font-mono font-bold uppercase">
            <span>Slot Terbaik (Top)</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm font-black text-sky-950 truncate mt-1" title={topPerformer?.name}>
            {topPerformer ? topPerformer.name : '-'}
          </div>
          <span className="text-[10px] text-indigo-900 font-mono font-bold">
            {topPerformer ? `${topPerformer.clicks.toLocaleString('id-ID')} klik (${topPerformer.ctr}%)` : '-'}
          </span>
        </div>
      </div>

      {/* 3. RECHARTS BAR CHART AREA */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <span className="font-bold text-sky-950">
              {metricMode === 'clicks' && '📊 Grafik Batang Jumlah Klik per Slot Iklan'}
              {metricMode === 'dual' && '📊 Perbandingan Jumlah Klik (Kiri) vs Impresi (Kanan)'}
              {metricMode === 'ctr' && '📊 Rasio Efektivitas Klik (Click-Through Rate / CTR %)'}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Sumber Data: <span className="font-bold text-sky-900">Live Ad Tracker Engine</span>
          </div>
        </div>

        <div className="w-full h-80 pt-2 pb-1 bg-slate-50/60 rounded-2xl border border-sky-100/80 p-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              Belum ada data slot iklan yang tersedia.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {metricMode === 'clicks' ? (
                /* SINGLE BAR: CLICKS */
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}
                    stroke="#94a3b8"
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} 
                    stroke="#94a3b8"
                    tickFormatter={(val) => Number(val).toLocaleString('id-ID')}
                  />
                  <Tooltip content={<CustomAdChartTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                    formatter={() => 'Jumlah Klik Real-Time'}
                  />
                  <Bar 
                    dataKey="clicks" 
                    name="Jumlah Klik Real-Time" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.id === simulatedSlotId ? '#10b981' : entry.color} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : metricMode === 'dual' ? (
                /* DUAL BAR: CLICKS & IMPRESSIONS */
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}
                    stroke="#94a3b8"
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 10, fill: '#f59e0b', fontFamily: 'monospace' }} 
                    stroke="#f59e0b"
                    tickFormatter={(val) => Number(val).toLocaleString('id-ID')}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#0284c7', fontFamily: 'monospace' }} 
                    stroke="#0284c7"
                    tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                  />
                  <Tooltip content={<CustomAdChartTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="clicks" 
                    name="Klik Pengunjung" 
                    fill="#f59e0b" 
                    radius={[6, 6, 0, 0]}
                    animationDuration={800}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="impressions" 
                    name="Impresi Tayangan" 
                    fill="#0284c7" 
                    radius={[6, 6, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              ) : (
                /* CTR PERFORMANCE BAR */
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}
                    stroke="#94a3b8"
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#10b981', fontFamily: 'monospace' }} 
                    stroke="#10b981"
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomAdChartTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                    formatter={() => 'Rasio Klik per Tayangan (CTR %)'}
                  />
                  <Bar 
                    dataKey="ctrNumber" 
                    name="Rasio Klik per Tayangan (CTR %)" 
                    fill="#10b981" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-ctr-${index}`} fill={SLOT_BAR_COLORS[index % SLOT_BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Interactive Simulation & Slot Ranking Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <h4 className="text-xs font-black font-mono uppercase tracking-wider text-sky-950">
              Rincian Efisiensi & Simulasi Klik Real-Time per Posisi
            </h4>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            Klik tombol &quot;Uji Klik&quot; untuk menguji respon animasi grafik secara langsung
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {chartData.map((slot, idx) => {
            const isTop = idx === 0 && slot.clicks > 0;
            const isSimulated = slot.id === simulatedSlotId;

            return (
              <div 
                key={slot.id}
                className={`p-3.5 rounded-2xl border transition-all duration-300 space-y-2 relative overflow-hidden ${
                  isSimulated
                    ? 'bg-emerald-50 border-emerald-400 scale-[1.02] shadow-md'
                    : isTop
                    ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-black px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: slot.color }}>
                    #{idx + 1} {slot.positionLabel}
                  </span>
                  <span className={`font-bold ${slot.isEnabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {slot.isEnabled ? '● Live' : '○ Mati'}
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-sky-950 text-xs truncate" title={slot.name}>
                    {slot.name}
                  </h5>
                  <p className="text-[11px] text-slate-500 truncate">
                    {slot.advertiserName}
                  </p>
                </div>

                <div className="pt-1.5 border-t border-slate-200/80 grid grid-cols-2 gap-1 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Klik:</span>
                    <strong className="text-sky-950 font-black">{slot.clicks.toLocaleString('id-ID')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">CTR:</span>
                    <strong className="text-emerald-700 font-black">{slot.ctr}%</strong>
                  </div>
                </div>

                {/* Simulation Button */}
                <button
                  type="button"
                  onClick={() => handleTriggerSimulate(slot.id)}
                  className={`w-full py-1.5 rounded-xl text-[10px] font-mono font-black transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
                    isSimulated
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white hover:bg-yellow-400 hover:text-sky-950 text-sky-950 border border-slate-200'
                  }`}
                  title="Simulasikan 1 klik pengunjung pada slot ini"
                >
                  <MousePointerClick className="w-3 h-3" />
                  <span>{isSimulated ? '+1 Klik Terhitung!' : 'Simulasi Uji Klik'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
