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
      case 'Sun': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-300" />;
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
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white">
            24-Hour Forecast Timeline
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg">
          Swipe Horizontally →
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-3 pt-1 no-scrollbar select-none snap-x-mandatory">
        {hourly.map((item, idx) => {
          const temp = toUnitTemp(item.temperature);
          const isNow = idx === 0;

          return (
            <motion.div
              key={`${item.time}-${idx}`}
              whileHover={{ y: -4, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`flex-shrink-0 snap-start flex flex-col items-center justify-between p-3 rounded-2xl border min-w-[80px] sm:min-w-[90px] transition-all shadow-md ${
                isNow
                  ? 'bg-gradient-to-b from-amber-500/35 via-orange-500/20 to-slate-900 border-amber-400 shadow-amber-500/20 ring-1 ring-amber-400/50'
                  : 'bg-slate-800/80 border-white/15 hover:border-white/30 hover:bg-slate-800'
              }`}
            >
              <span className={`text-xs font-extrabold ${isNow ? 'text-amber-300' : 'text-slate-200'}`}>
                {item.formattedHour}
              </span>

              <div className="my-2.5 sm:my-3 filter drop-shadow">
                {getConditionIcon(item.weatherCode, item.formattedHour)}
              </div>

              <span className="font-display font-black text-sm sm:text-base text-white">
                {temp}{unit}
              </span>

              {/* Rain Probability Pill */}
              <div className="flex items-center gap-1 text-[11px] mt-2 font-bold">
                <Droplets className={`w-3 h-3 ${item.precipitationProbability > 20 ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className={item.precipitationProbability > 20 ? 'text-sky-300' : 'text-slate-300'}>
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
