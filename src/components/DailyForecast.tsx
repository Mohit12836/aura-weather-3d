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
      case 'Sun': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'CloudRain': return <CloudRain className="w-5 h-5 text-sky-400" />;
      case 'CloudSnow': return <CloudSnow className="w-5 h-5 text-cyan-200" />;
      case 'CloudLightning': return <CloudLightning className="w-5 h-5 text-purple-400" />;
      default: return <Cloud className="w-5 h-5 text-slate-200" />;
    }
  };

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-white/20 bg-slate-900/90 backdrop-blur-2xl p-4 sm:p-5 md:p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30">
            <CalendarDays className="w-4 h-4" />
          </div>
          <h3 className="font-display font-bold text-sm sm:text-base md:text-lg text-white">
            7-Day Extended Forecast
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg">
          Weekly Outlook
        </span>
      </div>

      <div className="flex flex-col divide-y divide-white/10">
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
              className="py-3 flex items-center justify-between gap-2 sm:gap-4 transition-colors hover:bg-white/5 rounded-xl px-2"
            >
              {/* Day Name & Condition */}
              <div className="w-20 sm:w-24 md:w-28 flex-shrink-0">
                <span className={`text-xs sm:text-sm font-extrabold block ${isToday ? 'text-amber-300' : 'text-white'}`}>
                  {item.dayName}
                </span>
                <div className="text-[11px] text-slate-300 font-medium hidden sm:block truncate">
                  {conditionInfo.label}
                </div>
              </div>

              {/* Condition Icon & Rain % */}
              <div className="flex items-center gap-1.5 sm:gap-2 w-14 sm:w-18 md:w-24 flex-shrink-0">
                {getConditionIcon(item.weatherCode)}
                {item.precipitationProbability > 15 && (
                  <div className="flex items-center text-xs text-sky-300 font-bold">
                    <Droplets className="w-3 h-3 text-sky-400" />
                    <span>{item.precipitationProbability}%</span>
                  </div>
                )}
              </div>

              {/* Temperature Bar & Min/Max */}
              <div className="flex-1 flex items-center gap-2 sm:gap-3 max-w-xs">
                <span className="text-xs font-mono font-bold text-slate-300 w-7 sm:w-8 text-right flex-shrink-0">
                  {min}°
                </span>

                <div className="flex-1 relative h-2.5 bg-slate-800 rounded-full overflow-hidden min-w-[50px] border border-white/10">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400 shadow-sm"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidth}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-mono font-black text-white w-7 sm:w-8 text-left flex-shrink-0">
                  {max}°
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 hidden md:block flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
