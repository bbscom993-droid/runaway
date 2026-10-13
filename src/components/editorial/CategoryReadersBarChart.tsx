import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
  LabelList
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Layers, Users, BookOpen, TrendingUp, Sparkles } from 'lucide-react';
import { NewsArticle, Category } from '../../types';

interface CategoryReadersBarChartProps {
  articles: NewsArticle[];
  categories?: Category[];
}

const CATEGORY_COLORS = [
  '#0284c7', // Sky Blue
  '#f59e0b', // Amber / Gold
  '#10b981', // Emerald Green
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#64748b', // Slate
  '#06b6d4', // Cyan
];

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-sky-950/95 text-white p-3 rounded-xl shadow-xl border border-sky-700/80 backdrop-blur-md font-sans text-xs">
        <div className="font-mono font-black text-yellow-400 border-b border-sky-800 pb-1.5 mb-2 flex items-center justify-between gap-4">
          <span>📂 {data.category}</span>
          <span className="text-[10px] text-sky-300 font-normal">Katalog Redaksi</span>
        </div>
        <div className="space-y-1 font-mono">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Jumlah Artikel:</span>
            <span className="font-black text-yellow-300">{data.jumlahArtikel} naskah</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Porsi Naskah:</span>
            <span className="font-bold text-sky-300">{data.articlePercentage}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Total Pembaca:</span>
            <span className="font-bold text-emerald-400">{data.pembaca.toLocaleString('id-ID')} views</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-sky-950/95 text-white p-3 rounded-xl shadow-xl border border-sky-700/80 backdrop-blur-md font-sans text-xs">
        <div className="font-mono font-black text-yellow-400 border-b border-sky-800 pb-1.5 mb-2 flex items-center justify-between gap-4">
          <span>📊 {data.category}</span>
          <span className="text-[10px] text-sky-300 font-normal">Kanal Berita</span>
        </div>
        <div className="space-y-1 font-mono">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Total Pembaca:</span>
            <span className="font-black text-emerald-400">{data.pembaca.toLocaleString('id-ID')} views</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Proporsi Pembaca:</span>
            <span className="font-black text-yellow-300">{data.percentage}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Jumlah Naskah:</span>
            <span className="font-bold text-slate-200">{data.jumlahArtikel} warta</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CategoryReadersBarChart: React.FC<CategoryReadersBarChartProps> = ({ articles, categories = [] }) => {
  const [activeView, setActiveView] = useState<'both' | 'bar' | 'pie'>('both');

  // Aggregate category statistics
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, { id: string; name: string; count: number; views: number }> = {};

    // Initialize with categories
    if (categories.length > 0) {
      categories.forEach(c => {
        if (c.id !== 'all') {
          categoryMap[c.id] = { id: c.id, name: c.name, count: 0, views: 0 };
        }
      });
    }

    // Process articles views & counts
    articles.forEach(article => {
      const catId = article.category || 'lainnya';
      const catName = article.categoryLabel || (categories.find(c => c.id === catId)?.name) || catId;
      if (!categoryMap[catId]) {
        categoryMap[catId] = { id: catId, name: catName, count: 0, views: 0 };
      }
      categoryMap[catId].count += 1;
      categoryMap[catId].views += (article.views || 0);
    });

    const totalViewsAll = Object.values(categoryMap).reduce((sum, item) => sum + item.views, 0);
    const totalArticlesAll = Object.values(categoryMap).reduce((sum, item) => sum + item.count, 0);

    return Object.values(categoryMap)
      .map(cat => ({
        category: cat.name,
        categoryId: cat.id,
        jumlahArtikel: cat.count,
        pembaca: cat.views,
        percentage: totalViewsAll > 0 ? Number(((cat.views / totalViewsAll) * 100).toFixed(1)) : 0,
        articlePercentage: totalArticlesAll > 0 ? Number(((cat.count / totalArticlesAll) * 100).toFixed(1)) : 0,
      }))
      .filter(cat => cat.jumlahArtikel > 0 || cat.pembaca > 0)
      .sort((a, b) => b.jumlahArtikel - a.jumlahArtikel);
  }, [articles, categories]);

  const totalArticles = categoryData.reduce((sum, item) => sum + item.jumlahArtikel, 0);
  const totalViews = categoryData.reduce((sum, item) => sum + item.pembaca, 0);
  const topCategory = categoryData[0] || { category: '-', jumlahArtikel: 0, pembaca: 0 };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs space-y-5">
      
      {/* Header & View Switcher Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-sky-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-yellow-400 text-sky-950 font-black text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
              Analitik Visual Recharts
            </span>
            <span className="text-xs font-mono text-sky-700 font-bold">
              Kanal & Distribusi Konten
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-sky-950 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <span>Analitik Per Kategori & Proporsi Pembaca</span>
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Diagram batang jumlah naskah per rubrik dan diagram lingkaran proporsi pembaca di setiap kanal berita
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono font-bold self-start lg:self-auto">
          <button
            onClick={() => setActiveView('both')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'both' 
                ? 'bg-sky-950 text-yellow-400 shadow-2xs font-black' 
                : 'text-slate-600 hover:text-sky-950'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Chart</span>
          </button>
          <button
            onClick={() => setActiveView('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'bar' 
                ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black' 
                : 'text-slate-600 hover:text-sky-950'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Diagram Batang</span>
          </button>
          <button
            onClick={() => setActiveView('pie')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'pie' 
                ? 'bg-yellow-400 text-sky-950 shadow-2xs font-black' 
                : 'text-slate-600 hover:text-sky-950'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Diagram Lingkaran</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-sky-800 font-mono block">Total Naskah Terbit</span>
            <span className="text-xl font-black text-sky-950 font-mono">{totalArticles} Warta</span>
          </div>
          <BookOpen className="w-6 h-6 text-sky-600 opacity-80" />
        </div>

        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-800 font-mono block">Rubrik Terbanyak</span>
            <span className="text-sm font-black text-amber-950 truncate max-w-[150px] block">{topCategory.category}</span>
            <span className="text-[10px] text-amber-800 font-mono">{topCategory.jumlahArtikel} artikel ({topCategory.articlePercentage}%)</span>
          </div>
          <TrendingUp className="w-6 h-6 text-amber-600 opacity-80" />
        </div>

        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-800 font-mono block">Total Views Kanal</span>
            <span className="text-xl font-black text-emerald-950 font-mono">{totalViews.toLocaleString('id-ID')} Views</span>
          </div>
          <Users className="w-6 h-6 text-emerald-600 opacity-80" />
        </div>
      </div>

      {/* Main Charts Area */}
      <div className={`grid grid-cols-1 ${activeView === 'both' ? 'xl:grid-cols-2' : 'grid-cols-1'} gap-6 pt-2`}>
        
        {/* CHART 1: DIAGRAM BATANG (Jumlah Artikel Per Kategori) */}
        {(activeView === 'both' || activeView === 'bar') && (
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-sky-100 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-sky-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-950 text-yellow-400 flex items-center justify-center font-black">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-sky-950 tracking-tight">
                    Diagram Batang: Jumlah Artikel Per Kategori
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Sensus sebaran total naskah yang telah diterbitkan
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black text-sky-900 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                {categoryData.length} Rubrik
              </span>
            </div>

            <div className="w-full h-72 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: '#334155', fontWeight: 700 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="jumlahArtikel" name="Jumlah Artikel" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="jumlahArtikel" position="top" style={{ fontSize: '11px', fontWeight: '800', fill: '#0f172a' }} />
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-bar-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: DIAGRAM LINGKARAN (Proporsi Pembaca di Setiap Kanal Berita) */}
        {(activeView === 'both' || activeView === 'pie') && (
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-sky-100 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-sky-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-yellow-400 text-sky-950 flex items-center justify-center font-black">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-sky-950 tracking-tight">
                    Diagram Lingkaran: Proporsi Pembaca Per Kanal
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Persentase kontribusi views di tiap kanal berita
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                100% Total Views
              </span>
            </div>

            <div className="w-full h-72 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="pembaca"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-pie-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* Category Breakdown Table Legend */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <div className="text-xs font-mono font-black text-sky-950 uppercase flex items-center justify-between">
          <span>Rincian Lengkap Kanal Berita ({categoryData.length} Rubrik):</span>
          <span className="text-[10px] text-slate-500 font-normal">Sinkronisasi Real-Time</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {categoryData.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-2xs hover:border-yellow-400 transition-colors">
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs"
                style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sky-950 truncate text-[11px]">{item.category}</div>
                <div className="font-mono text-[10px] text-slate-500 flex items-center justify-between">
                  <span>{item.jumlahArtikel} warta</span>
                  <span className="font-bold text-sky-900">{item.percentage}% views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
