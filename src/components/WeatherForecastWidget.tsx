import React, { useState } from 'react';
import { 
  CloudSun, 
  Sun, 
  SunMedium, 
  CloudRain, 
  CloudLightning, 
  Droplets, 
  Wind, 
  Compass, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  ThermometerSun,
  RefreshCw,
  Info
} from 'lucide-react';
import { WeatherInfo } from '../types';

interface WeatherForecastWidgetProps {
  weatherCities: WeatherInfo[];
  onSelectCity?: (city: WeatherInfo) => void;
  className?: string;
}

export const WeatherForecastWidget: React.FC<WeatherForecastWidgetProps> = ({
  weatherCities = [],
  onSelectCity,
  className = '',
}) => {
  const [activeCityName, setActiveCityName] = useState<string>(
    weatherCities[0]?.city || 'Jakarta'
  );
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  if (!weatherCities || weatherCities.length === 0) {
    return null;
  }

  const activeCity = 
    weatherCities.find((c) => c.city.toLowerCase() === activeCityName.toLowerCase()) || 
    weatherCities[0];

  const filteredCities = weatherCities.filter((c) =>
    c.city.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.condition.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const getWeatherIcon = (iconName: string, sizeClass = 'w-6 h-6') => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={`${sizeClass} text-amber-400 animate-spin-slow`} />;
      case 'SunMedium':
        return <SunMedium className={`${sizeClass} text-amber-400`} />;
      case 'CloudRain':
        return <CloudRain className={`${sizeClass} text-sky-400 animate-bounce-subtle`} />;
      case 'CloudSun':
        return <CloudSun className={`${sizeClass} text-amber-300`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${sizeClass} text-yellow-400 animate-pulse`} />;
      default:
        return <CloudSun className={`${sizeClass} text-amber-300`} />;
    }
  };

  const getConditionColor = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
      case 'SunMedium':
        return 'from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/30 text-amber-300';
      case 'CloudRain':
        return 'from-sky-600/20 via-blue-500/10 to-transparent border-sky-500/30 text-sky-300';
      case 'CloudLightning':
        return 'from-purple-600/20 via-yellow-500/10 to-transparent border-yellow-500/30 text-yellow-300';
      case 'CloudSun':
      default:
        return 'from-sky-500/20 via-amber-500/10 to-transparent border-sky-400/30 text-sky-200';
    }
  };

  const scrollContainer = (direction: 'left' | 'right') => {
    const el = document.getElementById('weather-horizontal-scroll');
    if (el) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleCitySelect = (city: WeatherInfo) => {
    setActiveCityName(city.city);
    if (onSelectCity) {
      onSelectCity(city);
    }
  };

  return (
    <div 
      id="weather-forecast-feed-widget"
      className={`rounded-2xl bg-gradient-to-br from-sky-950 via-slate-900 to-sky-900 border border-sky-800/80 shadow-lg p-4 sm:p-5 text-white transition-all overflow-hidden relative ${className}`}
    >
      {/* Decorative ambient lighting backdrop */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10 border-b border-sky-800/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-bold shadow-md shadow-yellow-500/20 shrink-0">
            <ThermometerSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-yellow-400 font-mono">
                Prakiraan Cuaca Nusantara
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                BMKG SINKRON
              </span>
            </div>
            <p className="text-[11px] text-sky-200">
              Pantauan suhu aktual & kondisi atmosfer regional Nusantara
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Arrows */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-sky-900/90 hover:bg-sky-800 text-sky-200 hover:text-white border border-sky-700/80 transition-colors text-xs flex items-center gap-1"
            title="Segarkan data cuaca"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-yellow-400' : ''}`} />
            <span className="text-[10px] font-semibold hidden md:inline">Perbarui</span>
          </button>

          <div className="flex items-center gap-1 ml-1 bg-sky-950/80 p-0.5 rounded-lg border border-sky-800">
            <button
              type="button"
              onClick={() => scrollContainer('left')}
              className="p-1 rounded-md text-sky-300 hover:text-white hover:bg-sky-800 transition-colors"
              title="Gulir ke kiri"
              aria-label="Gulir ke kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollContainer('right')}
              className="p-1 rounded-md text-sky-300 hover:text-white hover:bg-sky-800 transition-colors"
              title="Gulir ke kanan"
              aria-label="Gulir ke kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured City Spotlight Banner */}
      {activeCity && (
        <div className={`mb-3.5 p-3.5 rounded-xl bg-gradient-to-r ${getConditionColor(activeCity.icon)} border backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 transition-all`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-700/60 shadow-inner">
              {getWeatherIcon(activeCity.icon, 'w-8 h-8')}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-base font-black text-white tracking-wide">{activeCity.city}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-900/80 text-yellow-300 border border-sky-700 font-mono">
                  Terpilih
                </span>
              </div>
              <p className="text-xs text-sky-200 mt-0.5 font-medium flex items-center gap-2">
                <span>{activeCity.condition}</span>
                <span className="text-sky-400">•</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-sky-300">
                  <Droplets className="w-3 h-3 text-sky-400" />
                  Kelembapan: {activeCity.humidity}%
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-baseline sm:items-end justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-sky-800/60 pt-2 sm:pt-0">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-mono text-sky-300 block">Suhu Real-Time</span>
              <span className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono tracking-tight">
                {activeCity.temp}°<span className="text-sm font-semibold text-sky-200">C</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Horizontal Cards Strip */}
      <div className="relative">
        <div
          id="weather-horizontal-scroll"
          className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredCities.map((item) => {
            const isSelected = item.city.toLowerCase() === activeCity?.city.toLowerCase();
            return (
              <button
                key={item.city}
                type="button"
                onClick={() => handleCitySelect(item)}
                className={`flex-shrink-0 w-36 sm:w-40 snap-start text-left p-2.5 sm:p-3 rounded-xl transition-all duration-200 cursor-pointer border relative group ${
                  isSelected
                    ? 'bg-gradient-to-b from-sky-900 to-sky-950 border-yellow-400 shadow-md ring-2 ring-yellow-400/30'
                    : 'bg-sky-950/70 hover:bg-sky-900/80 border-sky-800/80 hover:border-sky-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-yellow-300' : 'text-white group-hover:text-yellow-200'}`}>
                    {item.city}
                  </span>
                  <div className="p-1 rounded-lg bg-sky-900/50">
                    {getWeatherIcon(item.icon, 'w-4 h-4')}
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-lg font-black font-mono text-yellow-400">
                    {item.temp}°C
                  </span>
                  <span className="text-[10px] text-sky-300 flex items-center gap-0.5">
                    <Droplets className="w-2.5 h-2.5 text-sky-400" />
                    {item.humidity}%
                  </span>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-sky-800/50 flex items-center justify-between">
                  <span className="text-[10px] text-sky-300 truncate max-w-[95px]">
                    {item.condition}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-2.5 pt-2 border-t border-sky-800/60 flex items-center justify-between text-[10px] text-sky-300">
        <span className="flex items-center gap-1 text-sky-300">
          <Info className="w-3 h-3 text-yellow-400" />
          Klik pada kartu kota untuk melihat detail prakiraan wilayah
        </span>
        <span className="font-mono text-sky-400 font-semibold hidden sm:inline">
          {weatherCities.length} Kota Terdaftar
        </span>
      </div>
    </div>
  );
};

export default WeatherForecastWidget;
