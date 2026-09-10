import React from 'react';
import { 
  Wind, 
  Droplets, 
  SunMedium, 
  Activity, 
  Gauge, 
  Eye, 
  Compass 
} from 'lucide-react';
import { FullWeatherResponse } from '../types/weather';
import { SpotlightCard } from './effects/SpotlightCard';
import { AnimatedNumber } from './effects/AnimatedNumber';

interface MetricsGridProps {
  weather: FullWeatherResponse;
  unit: '°C' | '°F';
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ weather, unit }) => {
  const { current, airQuality } = weather;

  const windSpeedValue = unit === '°F' ? Math.round(current.windSpeed * 0.621371) : current.windSpeed;
  const windUnit = unit === '°F' ? 'mph' : 'km/h';

  // UV risk description
  const getUvInfo = (uv: number) => {
    if (uv <= 2) return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
    if (uv <= 10) return { label: 'Very High', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
    return { label: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
  };

  const uvInfo = getUvInfo(current.uvIndex);

  return (
    <div className="grid-metrics-auto">
      
      {/* 1. Wind Speed & Direction Compass */}
      <SpotlightCard glowColor="rgba(56, 189, 248, 0.2)" className="!p-3.5 sm:!p-5">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" /> Wind
          </span>
          <span className="font-mono text-slate-300 text-[10px] sm:text-xs">{current.windDirection}°</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              <AnimatedNumber value={windSpeedValue} suffix={` ${windUnit}`} />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 truncate">
              Atmospheric currents
            </p>
          </div>

          {/* Direction Compass */}
          <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full border border-white/20 bg-white/5 flex items-center justify-center shadow-inner flex-shrink-0">
            <Compass 
              className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 transition-transform duration-700" 
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
          </div>
        </div>
      </SpotlightCard>

      {/* 2. Humidity */}
      <SpotlightCard glowColor="rgba(14, 165, 233, 0.2)" className="!p-3.5 sm:!p-5">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" /> Humidity
          </span>
          <span className="text-[10px] sm:text-xs text-slate-300">
            {current.relativeHumidity > 70 ? 'High' : (current.relativeHumidity < 35 ? 'Dry' : 'Norm')}
          </span>
        </div>

        <div className="text-xl sm:text-2xl md:text-3xl font-black text-white">
          <AnimatedNumber value={current.relativeHumidity} suffix="%" />
        </div>

        {/* Humidity Level Bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, current.relativeHumidity)}%` }}
          />
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2 truncate">
          Moisture saturation
        </p>
      </SpotlightCard>

      {/* 3. UV Index */}
      <SpotlightCard glowColor="rgba(245, 158, 11, 0.2)" className="!p-3.5 sm:!p-5">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <SunMedium className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> UV Index
          </span>
          <span className={`px-1.5 sm:px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold border ${uvInfo.bg} ${uvInfo.color}`}>
            {uvInfo.label}
          </span>
        </div>

        <div className="text-xl sm:text-2xl md:text-3xl font-black text-white">
          <AnimatedNumber value={current.uvIndex} suffix=" / 11" />
        </div>

        {/* UV Meter Bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (current.uvIndex / 11) * 100)}%` }}
          />
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2 truncate">
          Solar radiation
        </p>
      </SpotlightCard>

      {/* 4. Air Quality Index (AQI) */}
      <SpotlightCard glowColor="rgba(34, 197, 94, 0.2)" className="!p-3.5 sm:!p-5">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> Air Quality
          </span>
          {airQuality ? (
            <span 
              className="px-1.5 sm:px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold border truncate max-w-[70px] sm:max-w-none"
              style={{ 
                color: airQuality.categoryColor, 
                backgroundColor: `${airQuality.categoryColor}15`, 
                borderColor: `${airQuality.categoryColor}30` 
              }}
            >
              {airQuality.category}
            </span>
          ) : null}
        </div>

        <div className="text-xl sm:text-2xl md:text-3xl font-black text-white">
          <AnimatedNumber value={airQuality?.aqi ?? 48} />
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-white/10">
          <span>PM2.5: <strong className="text-slate-200">{airQuality?.pm25 ?? 12}</strong></span>
          <span>PM10: <strong className="text-slate-200">{airQuality?.pm10 ?? 24}</strong></span>
        </div>
      </SpotlightCard>

      {/* 5. Atmospheric Pressure */}
      <SpotlightCard glowColor="rgba(168, 85, 247, 0.2)" className="!p-3.5 sm:!p-5">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" /> Pressure
          </span>
          <span className="text-[10px] sm:text-xs text-slate-300">Sea</span>
        </div>

        <div className="text-xl sm:text-2xl md:text-3xl font-black text-white">
          <AnimatedNumber value={current.surfacePressure} suffix=" hPa" />
        </div>

        <p className="text-[10px] sm:text-xs text-slate-400 mt-2 truncate">
          {current.surfacePressure > 1013 ? 'High pressure (Calm)' : 'Low pressure (Active)'}
        </p>
      </SpotlightCard>

      {/* 6. Visibility */}
      <SpotlightCard glowColor="rgba(59, 130, 246, 0.2)" className="!p-3.5 sm:!p-5">
        <div className="flex items-center justify-between text-slate-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" /> Visibility
          </span>
          <span className="text-[10px] sm:text-xs text-slate-300">
            {current.visibility >= 10 ? 'Clear' : (current.visibility >= 5 ? 'Fair' : 'Hazy')}
          </span>
        </div>

        <div className="text-xl sm:text-2xl md:text-3xl font-black text-white">
          <AnimatedNumber value={current.visibility} suffix=" km" />
        </div>

        <p className="text-[10px] sm:text-xs text-slate-400 mt-2 truncate">
          Line of sight distance
        </p>
      </SpotlightCard>

    </div>
  );
};
