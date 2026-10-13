import React, { useState } from 'react';
import {
  Train,
  Bus,
  Plane,
  Ship,
  Clock,
  ArrowRight,
  Info,
  MapPin,
  RefreshCw,
  Search,
  Tag
} from 'lucide-react';
import { TransportSchedule, TransportMode } from '../types';

interface TransportScheduleSectionProps {
  schedules: TransportSchedule[];
}

export const TransportScheduleSection: React.FC<TransportScheduleSectionProps> = ({ schedules }) => {
  const [activeTab, setActiveTab] = useState<'semua' | TransportMode>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchedules = schedules.filter((sch) => {
    const matchesTab = activeTab === 'semua' || sch.mode === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      sch.operator.toLowerCase().includes(q) ||
      sch.routeFrom.toLowerCase().includes(q) ||
      sch.routeTo.toLowerCase().includes(q) ||
      (sch.notes && sch.notes.toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });

  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'bus':
        return <Bus className="w-4 h-4 text-emerald-600" />;
      case 'kereta':
        return <Train className="w-4 h-4 text-sky-600" />;
      case 'pesawat':
        return <Plane className="w-4 h-4 text-indigo-600" />;
      case 'kapal':
        return <Ship className="w-4 h-4 text-cyan-600" />;
    }
  };

  const getModeBadge = (mode: TransportMode) => {
    switch (mode) {
      case 'bus':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'kereta':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'pesawat':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'kapal':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    }
  };

  const getStatusBadge = (status: TransportSchedule['status']) => {
    switch (status) {
      case 'Tepat Waktu':
        return 'bg-emerald-500 text-white';
      case 'Boarding':
        return 'bg-amber-500 text-white animate-pulse';
      case 'Dalam Perjalanan':
        return 'bg-sky-600 text-white';
      case 'Terlambat':
        return 'bg-rose-500 text-white';
      case 'Dibatalkan':
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div id="jadwal-transportasi-section" className="bg-white rounded-2xl border-2 border-sky-900 shadow-xl overflow-hidden mb-8 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-950 to-sky-900 p-6 text-white border-b border-sky-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-lg flex-shrink-0 mt-0.5">
              <Train className="w-6 h-6 text-sky-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase">
                  Info Mudik & Perjalanan
                </span>
                <span className="text-xs text-sky-300 font-mono">ARUN NEWS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-mono">
                Jadwal Transportasi
              </h1>
              <p className="text-xs sm:text-sm text-sky-200 font-medium mt-1">
                Keberangkatan bus, kereta, pesawat, dan kapal yang diperbarui redaksi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-sky-900/80 p-2.5 rounded-xl border border-sky-700/60 text-xs text-sky-200 font-mono self-start md:self-auto">
            <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Diperbarui Real-time oleh Redaksi</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 sm:p-5 bg-sky-50/70 border-b border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Moda Tabs: Semua, Bus, Kereta, Pesawat, Kapal */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('semua')}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'semua'
                ? 'bg-sky-950 text-yellow-400 shadow-md font-black'
                : 'bg-white text-slate-700 hover:bg-sky-100 border border-slate-200'
            }`}
          >
            Semua
          </button>

          <button
            onClick={() => setActiveTab('bus')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bus'
                ? 'bg-emerald-700 text-white shadow-md font-black'
                : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Bus</span>
          </button>

          <button
            onClick={() => setActiveTab('kereta')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'kereta'
                ? 'bg-sky-700 text-white shadow-md font-black'
                : 'bg-white text-slate-700 hover:bg-sky-50 border border-slate-200'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Kereta</span>
          </button>

          <button
            onClick={() => setActiveTab('pesawat')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pesawat'
                ? 'bg-indigo-700 text-white shadow-md font-black'
                : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Pesawat</span>
          </button>

          <button
            onClick={() => setActiveTab('kapal')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'kapal'
                ? 'bg-cyan-700 text-white shadow-md font-black'
                : 'bg-white text-slate-700 hover:bg-cyan-50 border border-slate-200'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Kapal</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kota, armada, rute..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-800"
          />
        </div>
      </div>

      {/* Schedules List or Empty State */}
      <div className="p-4 sm:p-6 bg-slate-50 min-h-[220px]">
        {filteredSchedules.length === 0 ? (
          <div className="py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 font-bold">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-mono">
              Belum ada jadwal untuk moda ini.
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Tim redaksi ARUN NEWS terus memperbarui jadwal rute transportasi publik secara berkala. Silakan pilih tab moda lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSchedules.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-3 relative overflow-hidden group"
              >
                {/* Top Row: Mode & Operator + Status */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-2 rounded-xl border flex items-center justify-center ${getModeBadge(item.mode)}`}>
                      {getModeIcon(item.mode)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          {item.mode}
                        </span>
                        {item.priceInfo && (
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {item.priceInfo}
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                        {item.operator}
                      </h4>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs flex-shrink-0 ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                {/* Route & Times Row */}
                <div className="grid grid-cols-11 items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {/* From */}
                  <div className="col-span-5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" /> Keberangkatan
                    </span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={item.routeFrom}>
                      {item.routeFrom}
                    </p>
                    <p className="text-xs font-mono font-extrabold text-sky-950 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-800" /> {item.departureTime}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="col-span-1 flex justify-center text-slate-400">
                    <ArrowRight className="w-4 h-4 text-sky-800" />
                  </div>

                  {/* To */}
                  <div className="col-span-5 space-y-0.5 text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold flex items-center justify-end gap-1">
                      Kedatangan <MapPin className="w-3 h-3 text-emerald-500" />
                    </span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={item.routeTo}>
                      {item.routeTo}
                    </p>
                    <p className="text-xs font-mono font-extrabold text-emerald-900 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-emerald-700" /> {item.arrivalTime}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Notes & Update timestamp */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1 font-mono">
                  {item.notes ? (
                    <span className="truncate text-slate-600 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-sky-700 flex-shrink-0" />
                      <span>{item.notes}</span>
                    </span>
                  ) : <span></span>}
                  <span className="text-[10px] text-slate-400 text-right flex-shrink-0">
                    Redaksi: {item.updatedAt}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
