import React from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  Droplets, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Cloud,
  ChevronRight
} from 'lucide-react';
import { DailyForecastItem } from '../types/weather';
import { getWeatherCondition } from '../services/weatherApi';

interface DailyForecastProps {
  daily: DailyForecastItem[];
  unit: '°C' | '°F';
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, unit }) => {
  const toUnitTemp = (celsius: number) => {
    if (unit === '°F') return Math.round((celsius * 9) / 5 + 32);
    return celsius;
  };

  // Find overall min & max across 7 days for relative bar scaling
  const allMax = Math.max(...daily.map((d) => d.tempMax));
  const allMin = Math.min(...daily.map((d) => d.tempMin));
  const tempRange = Math.max(1, allMax - allMin);

  const getConditionIcon = (code: number) => {
    const info = getWeatherCondition(code, true);
    switch (info.icon) {
      case 'Sun': return <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />;
      case 'CloudRain': return <CloudRain className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />;
      case 'CloudSnow': return <CloudSnow className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-200" />;
      case 'CloudLightning': return <CloudLightning className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />;
      default: return <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />;
    }
  };

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 md:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-amber-400" />
          <h3 className="font-display font-bold text-sm sm:text-base md:text-lg text-white">
            7-Day Extended Forecast
          </h3>
        </div>
        <span className="text-[11px] sm:text-xs text-slate-400">Week Outlook</span>
      </div>

      <div className="flex flex-col divide-y divide-white/5">
        {daily.map((item, idx) => {
          const conditionInfo = getWeatherCondition(item.weatherCode, true);
          const min = toUnitTemp(item.tempMin);
          const max = toUnitTemp(item.tempMax);
          const isToday = idx === 0;

          // Bar offset calculations
          const leftPercent = ((item.tempMin - allMin) / tempRange) * 100;
          const barWidth = Math.max(18, ((item.tempMax - item.tempMin) / tempRange) * 100);

          return (
            <motion.div
              key={item.date}
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="py-2.5 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4 transition-colors hover:bg-white/[0.02] rounded-xl px-1"
            >
              {/* Day Name */}
              <div className="w-16 sm:w-20 md:w-24 flex-shrink-0">
                <span className={`text-xs sm:text-sm font-semibold block ${isToday ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
                  {item.dayName}
                </span>
                <div className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block truncate">
                  {conditionInfo.label}
                </div>
              </div>

              {/* Condition Icon & Rain % */}
              <div className="flex items-center gap-1 sm:gap-2 w-12 sm:w-16 md:w-24 flex-shrink-0">
                {getConditionIcon(item.weatherCode)}
                {item.precipitationProbability > 15 && (
                  <div className="flex items-center text-[10px] sm:text-[11px] text-sky-400 font-semibold">
                    <Droplets className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{item.precipitationProbability}%</span>
                  </div>
                )}
              </div>

              {/* Temperature Bar & Min/Max */}
              <div className="flex-1 flex items-center gap-1.5 sm:gap-3 max-w-xs">
                <span className="text-[11px] sm:text-xs font-mono text-slate-400 w-6 sm:w-8 text-right flex-shrink-0">
                  {min}°
                </span>

                <div className="flex-1 relative h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden min-w-[40px]">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidth}%`,
                    }}
                  />
                </div>

                <span className="text-[11px] sm:text-xs font-mono font-bold text-white w-6 sm:w-8 text-left flex-shrink-0">
                  {max}°
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500 hidden md:block flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
