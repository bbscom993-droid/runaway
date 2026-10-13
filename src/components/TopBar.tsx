import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  SunMedium, 
  Sun, 
  CloudRain, 
  CloudSun, 
  CloudLightning, 
  TrendingUp, 
  ChevronDown, 
  Sparkles, 
  Flame,
  Radio
} from 'lucide-react';
import { WeatherInfo, TrendingTopic, SiteSettings } from '../types';

interface TopBarProps {
  weatherCities: WeatherInfo[];
  trendingTopics: TrendingTopic[];
  onSelectTopic: (topicTag: string) => void;
  dbStatus?: 'connected' | 'connecting' | 'offline';
  dbArticlesCount?: number;
  onReconnectDB?: () => void;
  siteSettings?: SiteSettings;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  weatherCities, 
  trendingTopics, 
  onSelectTopic,
  dbStatus = 'connected',
  dbArticlesCount,
  onReconnectDB,
  siteSettings,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<WeatherInfo>(weatherCities[0]);
  const [showWeatherDropdown, setShowWeatherDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format Indonesian date
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('id-ID', options));
      
      const timeStr = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(`${timeStr} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'SunMedium': return <SunMedium className="w-3.5 h-3.5 text-amber-400" />;
      case 'CloudRain': return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
      case 'CloudSun': return <CloudSun className="w-3.5 h-3.5 text-amber-300" />;
      case 'CloudLightning': return <CloudLightning className="w-3.5 h-3.5 text-yellow-400" />;
      default: return <SunMedium className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const portalTheme = siteSettings?.portalThemeSettings;
  const primaryDarkColor = portalTheme?.primaryDarkColor || '#082f49';
  const primaryColor = portalTheme?.primaryColor || '#0c4a6e';
  const accentColor = portalTheme?.accentColor || '#facc15';

  return (
    <div 
      id="top-bar-container" 
      className="portal-theme-topbar text-sky-200 text-xs transition-colors"
      style={{
        backgroundColor: primaryDarkColor,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Live Date, Clock, & Weather Selector */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 text-sky-200 font-semibold">
              <span className="inline-block w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: accentColor }} />
              <span className="uppercase tracking-wider text-[10px] sm:text-[11px] font-mono whitespace-nowrap">{currentDate || 'Memuat tanggal...'}</span>
            </div>

            <div 
              className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-lg border shadow-2xs"
              style={{
                backgroundColor: primaryColor,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: accentColor
              }}
            >
              <Clock className="w-3 h-3 flex-shrink-0" style={{ color: accentColor }} />
              <span className="font-mono font-bold text-[10px] sm:text-[11px] text-white">{currentTime}</span>
            </div>

            {/* Live Firestore Database Connection Badge */}
            {dbStatus === 'connected' ? (
              <div 
                className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono shadow-2xs"
                title="Basis Data Firebase Firestore Terhubung Aktif"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="font-bold">Firestore: Terhubung ({dbArticlesCount || 12} Warta)</span>
              </div>
            ) : dbStatus === 'connecting' ? (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-mono shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin flex-shrink-0" />
                <span>Menghubungkan Database...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onReconnectDB}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-500/80 text-[10px] font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Koneksi database terputus. Klik untuk hubungkan kembali!"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
                <span>Koneksikan Kembali Database</span>
              </button>
            )}

            {/* Weather Widget */}
            <div className="relative">
              <button
                id="weather-dropdown-btn"
                onClick={() => setShowWeatherDropdown(!showWeatherDropdown)}
                className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors bg-sky-900 px-2 sm:px-2.5 py-0.5 rounded-lg border border-sky-800 hover:border-yellow-400/50"
                title="Pilih Kota Cuaca"
              >
                {getWeatherIcon(selectedCity.icon)}
                <span className="font-bold text-white text-[10px] sm:text-[11px]">{selectedCity.city}</span>
                <span className="text-yellow-400 font-black text-[10px] sm:text-[11px]">{selectedCity.temp}°C</span>
                <ChevronDown className="w-3 h-3 text-sky-400" />
              </button>

              {showWeatherDropdown && (
                <div 
                  id="weather-dropdown-menu"
                  className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-60 bg-sky-900 rounded-xl shadow-2xl border border-sky-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-400 border-b border-sky-800 font-mono">
                    Prakiraan Cuaca Nusantara
                  </div>
                  {weatherCities.map((w) => (
                    <button
                      key={w.city}
                      onClick={() => {
                        setSelectedCity(w);
                        setShowWeatherDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-sky-800 transition-colors text-xs min-h-[38px] ${
                        selectedCity.city === w.city ? 'bg-sky-950 text-yellow-300 font-bold' : 'text-sky-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getWeatherIcon(w.icon)}
                        <span className="font-medium">{w.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-sky-300 text-[11px]">{w.condition}</span>
                        <span className="font-bold text-yellow-400 font-mono">{w.temp}°C</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Trending Topics Ticker & Market Indices */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-black text-sky-950 uppercase tracking-wider text-[10px] bg-yellow-400 px-2 py-0.5 rounded-md border border-yellow-500">
                <Flame className="w-3 h-3 text-sky-950" />
                TREN:
              </span>
              <div className="flex items-center gap-2">
                {trendingTopics.slice(0, 4).map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => onSelectTopic(topic.tag)}
                    className="text-sky-200 hover:text-yellow-400 hover:underline transition-colors font-bold text-[11px]"
                  >
                    {topic.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial indicators badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-sky-800 text-[11px] font-mono">
              <span className="text-sky-300 font-medium">IHSG:</span>
              <span className="text-emerald-400 font-bold">7,420.8 (+0.45%)</span>
              <span className="text-sky-700">•</span>
              <span className="text-sky-300 font-medium">USD/IDR:</span>
              <span className="text-yellow-300 font-bold">Rp 15.820</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
