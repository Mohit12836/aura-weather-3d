import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Droplets, 
  Sun, 
  Moon, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Cloud 
} from 'lucide-react';
import { HourlyForecastItem } from '../types/weather';
import { getWeatherCondition } from '../services/weatherApi';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  unit: '°C' | '°F';
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, unit }) => {
  const toUnitTemp = (celsius: number) => {
    if (unit === '°F') return Math.round((celsius * 9) / 5 + 32);
    return celsius;
  };

  const getConditionIcon = (code: number, hourStr: string) => {
    const isNight = hourStr.includes('PM') && (hourStr.startsWith('8') || hourStr.startsWith('9') || hourStr.startsWith('10') || hourStr.startsWith('11')) ||
                    hourStr.includes('AM') && (hourStr.startsWith('12') || hourStr.startsWith('1') || hourStr.startsWith('2') || hourStr.startsWith('3') || hourStr.startsWith('4') || hourStr.startsWith('5'));
    const info = getWeatherCondition(code, !isNight);
    
    switch (info.icon) {
      case 'Sun': return <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />;
      case 'Moon': return <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />;
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
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="font-display font-bold text-sm sm:text-base md:text-lg text-white">
            24-Hour Forecast Timeline
          </h3>
        </div>
        <span className="text-[11px] sm:text-xs text-slate-400">Swipe →</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-3 pt-1 no-scrollbar select-none snap-x-mandatory">
        {hourly.map((item, idx) => {
          const temp = toUnitTemp(item.temperature);
          const isNow = idx === 0;

          return (
            <motion.div
              key={`${item.time}-${idx}`}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`flex-shrink-0 snap-start flex flex-col items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border min-w-[76px] sm:min-w-[85px] transition-colors ${
                isNow
                  ? 'bg-gradient-to-b from-amber-500/20 to-orange-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className={`text-[11px] sm:text-xs font-semibold ${isNow ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                {item.formattedHour}
              </span>

              <div className="my-2 sm:my-3">
                {getConditionIcon(item.weatherCode, item.formattedHour)}
              </div>

              <span className="font-display font-bold text-xs sm:text-sm md:text-base text-white">
                {temp}{unit}
              </span>

              {/* Rain Probability Pill */}
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] mt-1.5 sm:mt-2 font-medium">
                <Droplets className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${item.precipitationProbability > 20 ? 'text-sky-400' : 'text-slate-500'}`} />
                <span className={item.precipitationProbability > 20 ? 'text-sky-300 font-bold' : 'text-slate-400'}>
                  {item.precipitationProbability}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
