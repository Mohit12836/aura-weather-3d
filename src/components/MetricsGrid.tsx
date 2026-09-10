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
    if (uv <= 2) return { label: 'Low', color: 'text-emerald-300', bg: 'bg-emerald-500/25 border-emerald-400/40' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-amber-300', bg: 'bg-amber-500/25 border-amber-400/40' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-300', bg: 'bg-orange-500/25 border-orange-400/40' };
    if (uv <= 10) return { label: 'Very High', color: 'text-rose-300', bg: 'bg-rose-500/25 border-rose-400/40' };
    return { label: 'Extreme', color: 'text-purple-300', bg: 'bg-purple-500/25 border-purple-400/40' };
  };

  const uvInfo = getUvInfo(current.uvIndex);

  return (
    <div className="grid-metrics-auto">
      
      {/* 1. Wind Speed & Direction Compass */}
      <SpotlightCard 
        glowColor="rgba(56, 189, 248, 0.35)" 
        className="!p-4 sm:!p-5 !border-sky-500/30 !bg-slate-900/90 shadow-xl"
      >
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
          <span className="flex items-center gap-1.5 text-sky-300 bg-sky-500/15 px-2.5 py-1 rounded-lg border border-sky-400/30">
            <Wind className="w-4 h-4 text-sky-400" /> Wind
          </span>
          <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
            {current.windDirection}°
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm">
              <AnimatedNumber value={windSpeedValue} suffix={` ${windUnit}`} />
            </div>
            <p className="text-xs text-slate-200 font-medium mt-1">
              Current breeze speed
            </p>
          </div>

          {/* Direction Compass */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-sky-400/40 bg-sky-950/50 flex items-center justify-center shadow-md flex-shrink-0">
            <Compass 
              className="w-6 h-6 sm:w-7 sm:h-7 text-sky-300 transition-transform duration-700 filter drop-shadow" 
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
          </div>
        </div>
      </SpotlightCard>

      {/* 2. Humidity */}
      <SpotlightCard 
        glowColor="rgba(14, 165, 233, 0.35)" 
        className="!p-4 sm:!p-5 !border-cyan-500/30 !bg-slate-900/90 shadow-xl"
      >
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
          <span className="flex items-center gap-1.5 text-cyan-300 bg-cyan-500/15 px-2.5 py-1 rounded-lg border border-cyan-400/30">
            <Droplets className="w-4 h-4 text-cyan-400" /> Humidity
          </span>
          <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
            {current.relativeHumidity > 70 ? 'High' : (current.relativeHumidity < 35 ? 'Dry' : 'Normal')}
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm mt-2">
          <AnimatedNumber value={current.relativeHumidity} suffix="%" />
        </div>

        {/* Humidity Level Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden border border-white/10">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full transition-all duration-1000 shadow-sm"
            style={{ width: `${Math.min(100, current.relativeHumidity)}%` }}
          />
        </div>
        <p className="text-xs text-slate-200 font-medium mt-1.5">
          Moisture in the air
        </p>
      </SpotlightCard>

      {/* 3. UV Index */}
      <SpotlightCard 
        glowColor="rgba(245, 158, 11, 0.35)" 
        className="!p-4 sm:!p-5 !border-amber-500/30 !bg-slate-900/90 shadow-xl"
      >
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
          <span className="flex items-center gap-1.5 text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-400/30">
            <SunMedium className="w-4 h-4 text-amber-400" /> UV Index
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${uvInfo.bg} ${uvInfo.color}`}>
            {uvInfo.label}
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm mt-2">
          <AnimatedNumber value={current.uvIndex} suffix=" / 11" />
        </div>

        {/* UV Meter Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden border border-white/10">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-all duration-1000 shadow-sm"
            style={{ width: `${Math.min(100, (current.uvIndex / 11) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-200 font-medium mt-1.5">
          Sun exposure level
        </p>
      </SpotlightCard>

      {/* 4. Air Quality Index (AQI) */}
      <SpotlightCard 
        glowColor="rgba(34, 197, 94, 0.35)" 
        className="!p-4 sm:!p-5 !border-emerald-500/30 !bg-slate-900/90 shadow-xl"
      >
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
          <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-400/30">
            <Activity className="w-4 h-4 text-emerald-400" /> Air Quality
          </span>
          {airQuality ? (
            <span 
              className="px-2 py-0.5 rounded-md text-[11px] font-black border"
              style={{ 
                color: airQuality.categoryColor, 
                backgroundColor: `${airQuality.categoryColor}25`, 
                borderColor: `${airQuality.categoryColor}50` 
              }}
            >
              {airQuality.category}
            </span>
          ) : null}
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm mt-2">
          <AnimatedNumber value={airQuality?.aqi ?? 48} />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-200 font-semibold mt-3 pt-2 border-t border-white/15">
          <span>PM2.5: <strong className="text-emerald-300 font-bold">{airQuality?.pm25 ?? 12}</strong></span>
          <span>PM10: <strong className="text-emerald-300 font-bold">{airQuality?.pm10 ?? 24}</strong></span>
        </div>
      </SpotlightCard>

      {/* 5. Atmospheric Pressure */}
      <SpotlightCard 
        glowColor="rgba(168, 85, 247, 0.35)" 
        className="!p-4 sm:!p-5 !border-purple-500/30 !bg-slate-900/90 shadow-xl"
      >
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
          <span className="flex items-center gap-1.5 text-purple-300 bg-purple-500/15 px-2.5 py-1 rounded-lg border border-purple-400/30">
            <Gauge className="w-4 h-4 text-purple-400" /> Pressure
          </span>
          <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
            Sea Level
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm mt-2">
          <AnimatedNumber value={current.surfacePressure} suffix=" hPa" />
        </div>

        <p className="text-xs text-slate-200 font-medium mt-2">
          {current.surfacePressure > 1013 ? 'High pressure (Calm Skies)' : 'Low pressure (Active Storms)'}
        </p>
      </SpotlightCard>

      {/* 6. Visibility */}
      <SpotlightCard 
        glowColor="rgba(59, 130, 246, 0.35)" 
        className="!p-4 sm:!p-5 !border-blue-500/30 !bg-slate-900/90 shadow-xl"
      >
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
          <span className="flex items-center gap-1.5 text-blue-300 bg-blue-500/15 px-2.5 py-1 rounded-lg border border-blue-400/30">
            <Eye className="w-4 h-4 text-blue-400" /> Visibility
          </span>
          <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
            {current.visibility >= 10 ? 'Crystal Clear' : (current.visibility >= 5 ? 'Moderate' : 'Foggy')}
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm mt-2">
          <AnimatedNumber value={current.visibility} suffix=" km" />
        </div>

        <p className="text-xs text-slate-200 font-medium mt-2">
          Distance visible to naked eye
        </p>
      </SpotlightCard>

    </div>
  );
};
