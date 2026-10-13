import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart2, 
  TrendingUp, 
  Flame, 
  Eye, 
  Heart, 
  Share2, 
  Layers, 
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { NewsArticle } from '../../types';

interface PopularArticlesChartProps {
  articles: NewsArticle[];
}

export const PopularArticlesChart: React.FC<PopularArticlesChartProps> = ({ articles }) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'shares'>('views');
  const [topCount, setTopCount] = useState<number>(7);
  const [showViews, setShowViews] = useState(true);
  const [showLikes, setShowLikes] = useState(true);
  const [showShares, setShowShares] = useState(true);

  // Compute top articles based on sortBy
  const chartData = useMemo(() => {
    const sorted = [...articles].sort((a, b) => {
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
      return (b.shares || 0) - (a.shares || 0);
    });

    return sorted.slice(0, topCount).map((a, idx) => {
      // Short label for X-axis (first 22 chars of title)
      const shortTitle = a.title.length > 20 ? a.title.slice(0, 18) + '...' : a.title;
      return {
        rank: `#${idx + 1}`,
        name: shortTitle,
        fullTitle: a.title,
        category: a.categoryLabel || a.category,
        views: a.views || 0,
        likes: a.likes || 0,
        shares: a.shares || 0,
      };
    });
  }, [articles, sortBy, topCount]);

  // Leaders
  const topViewed = useMemo(() => [...articles].sort((a, b) => (b.views || 0) - (a.views || 0))[0], [articles]);
  const topLiked = useMemo(() => [...articles].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0], [articles]);
  const topShared = useMemo(() => [...articles].sort((a, b) => (b.shares || 0) - (a.shares || 0))[0], [articles]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-sky-950/95 text-white p-3.5 rounded-xl shadow-2xl border border-sky-700/80 backdrop-blur-md max-w-xs text-xs font-sans">
          <div className="flex items-center justify-between gap-2 border-b border-sky-800 pb-2 mb-2">
            <span className="bg-yellow-400 text-sky-950 font-black text-[10px] px-1.5 py-0.2 rounded font-mono">
              {data.rank}
            </span>
            <span className="text-[10px] text-sky-300 font-mono font-bold uppercase">
              {data.category}
            </span>
          </div>
          <h5 className="font-bold text-white leading-snug line-clamp-2 mb-2.5">
            {data.fullTitle}
          </h5>
          <div className="space-y-1.5 font-mono">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                  <span 
                    className="w-2.5 h-2.5 rounded-full inline-block" 
                    style={{ backgroundColor: entry.color || entry.fill }}
                  />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {entry.value.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-sky-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-400 text-sky-950 font-black text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
              Statistik Populer (Recharts)
            </span>
            <span className="text-xs font-mono text-sky-700 font-bold">
              Views • Suka • Bagikan
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-sky-950 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Statistik Artikel Terpopuler</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Perbandingan metrik performa artikel berdasarkan tayangan, interaksi suka, dan viralisasi bagikan.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Chart Type Toggle (Bar vs Line) */}
          <div className="flex items-center bg-sky-50 rounded-xl p-1 border border-sky-200 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-sky-950 text-yellow-300 shadow-xs font-black'
                  : 'text-sky-800 hover:text-sky-950'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Batang (Bar)</span>
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-sky-950 text-yellow-300 shadow-xs font-black'
                  : 'text-sky-800 hover:text-sky-950'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Garis (Line)</span>
            </button>
          </div>

          {/* Sort By Metric */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-bold">
            <span className="text-[10px] text-slate-500 font-mono px-2 uppercase flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              Urut:
            </span>
            <button
              onClick={() => setSortBy('views')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                sortBy === 'views' ? 'bg-sky-600 text-white font-black' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Views
            </button>
            <button
              onClick={() => setSortBy('likes')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                sortBy === 'likes' ? 'bg-rose-600 text-white font-black' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Likes
            </button>
            <button
              onClick={() => setSortBy('shares')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                sortBy === 'shares' ? 'bg-emerald-600 text-white font-black' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Shares
            </button>
          </div>

          {/* Top Limit Selector */}
          <select
            value={topCount}
            onChange={(e) => setTopCount(Number(e.target.value))}
            className="px-2.5 py-1.5 text-xs bg-white rounded-xl border border-sky-300 text-sky-950 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value={5}>Top 5</option>
            <option value={7}>Top 7</option>
            <option value={10}>Top 10</option>
          </select>
        </div>
      </div>

      {/* Metric Visibility Toggle Filters */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono text-[11px] font-bold">Tampilkan Metrik:</span>
          <button
            onClick={() => setShowViews(!showViews)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              showViews 
                ? 'bg-sky-100 text-sky-900 border-sky-400 font-black' 
                : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <span>Views</span>
          </button>

          <button
            onClick={() => setShowLikes(!showLikes)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              showLikes 
                ? 'bg-rose-100 text-rose-900 border-rose-400 font-black' 
                : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>Likes</span>
          </button>

          <button
            onClick={() => setShowShares(!showShares)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              showShares 
                ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black' 
                : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Shares</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Diurutkan berdasarkan: <strong className="uppercase text-sky-950">{sortBy}</strong>
        </div>
      </div>

      {/* Main Chart Canvas (Recharts) */}
      <div className="h-[280px] sm:h-[320px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#0369a1', fontWeight: 600 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={32}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, fontWeight: 700 }}
              />
              {showViews && (
                <Bar 
                  dataKey="views" 
                  name="Views (Tayangan)" 
                  fill="#0284c7" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={40}
                />
              )}
              {showLikes && (
                <Bar 
                  dataKey="likes" 
                  name="Likes (Suka)" 
                  fill="#e11d48" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={40}
                />
              )}
              {showShares && (
                <Bar 
                  dataKey="shares" 
                  name="Shares (Bagikan)" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={40}
                />
              )}
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#0369a1', fontWeight: 600 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={32}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, fontWeight: 700 }}
              />
              {showViews && (
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  name="Views (Tayangan)" 
                  stroke="#0284c7" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8, stroke: '#38bdf8', strokeWidth: 2 }}
                />
              )}
              {showLikes && (
                <Line 
                  type="monotone" 
                  dataKey="likes" 
                  name="Likes (Suka)" 
                  stroke="#e11d48" 
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7 }}
                />
              )}
              {showShares && (
                <Line 
                  type="monotone" 
                  dataKey="shares" 
                  name="Shares (Bagikan)" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Metric Leader Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-sky-100">
        {/* Top Views */}
        <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200">
          <div className="flex items-center justify-between text-[10px] font-mono text-sky-800 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              Juara Tayangan
            </span>
            <span className="bg-sky-600 text-white px-1.5 py-0.2 rounded font-black">
              {(topViewed?.views || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <h5 className="text-xs font-bold text-sky-950 line-clamp-1 leading-snug">
            {topViewed?.title || 'Belum ada data'}
          </h5>
        </div>

        {/* Top Likes */}
        <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200">
          <div className="flex items-center justify-between text-[10px] font-mono text-rose-800 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              Paling Disukai
            </span>
            <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded font-black">
              {(topLiked?.likes || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <h5 className="text-xs font-bold text-rose-950 line-clamp-1 leading-snug">
            {topLiked?.title || 'Belum ada data'}
          </h5>
        </div>

        {/* Top Shares */}
        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-800 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              Paling Viral (Dibagikan)
            </span>
            <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">
              {(topShared?.shares || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <h5 className="text-xs font-bold text-emerald-950 line-clamp-1 leading-snug">
            {topShared?.title || 'Belum ada data'}
          </h5>
        </div>
      </div>
    </div>
  );
};

export default PopularArticlesChart;
