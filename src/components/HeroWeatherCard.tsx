import React from 'react';
import { 
  Sun, 
  Moon, 
  CloudSun, 
  CloudMoon, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  Cloud,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Navigation
} from 'lucide-react';
import { FullWeatherResponse } from '../types/weather';
import { WeatherScene3D } from './canvas/WeatherScene3D';
import { AnimatedNumber } from './effects/AnimatedNumber';
import { SpotlightCard } from './effects/SpotlightCard';

interface HeroWeatherCardProps {
  weather: FullWeatherResponse;
  unit: '°C' | '°F';
}

export const HeroWeatherCard: React.FC<HeroWeatherCardProps> = ({ weather, unit }) => {
  const { location, current, condition, daily } = weather;

  // Conversion helpers
  const toUnitTemp = (celsius: number) => {
    if (unit === '°F') return Math.round((celsius * 9) / 5 + 32);
    return celsius;
  };

  const currentTemp = toUnitTemp(current.temperature);
  const feelsLike = toUnitTemp(current.apparentTemperature);
  const todayDaily = daily[0] || { tempMax: current.temperature + 3, tempMin: current.temperature - 4 };
  const maxTemp = toUnitTemp(todayDaily.tempMax);
  const minTemp = toUnitTemp(todayDaily.tempMin);

  // Dynamic glow theme color based on current weather
  const getGlowColor = () => {
    switch (condition.theme) {
      case 'sunny':
        return 'rgba(245, 158, 11, 0.45)';
      case 'rainy':
        return 'rgba(14, 165, 233, 0.45)';
      case 'thunder':
        return 'rgba(168, 85, 247, 0.5)';
      case 'snow':
        return 'rgba(56, 189, 248, 0.45)';
      case 'night':
        return 'rgba(129, 140, 248, 0.45)';
      default:
        return 'rgba(203, 213, 225, 0.35)';
    }
  };

  // Weather Icon Component with rich colored containers
  const renderConditionIcon = () => {
    const props = { className: "w-6 h-6 sm:w-7 sm:h-7" };
    switch (condition.icon) {
      case 'Sun': return <Sun {...props} className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 animate-spin-slow" />;
      case 'Moon': return <Moon {...props} className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-300" />;
      case 'CloudSun': return <CloudSun {...props} className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />;
      case 'CloudMoon': return <CloudMoon {...props} className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-200" />;
      case 'CloudRain': return <CloudRain {...props} className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400" />;
      case 'CloudSnow': return <CloudSnow {...props} className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-200" />;
      case 'CloudLightning': return <CloudLightning {...props} className="w-6 h-6 sm:w-7 sm:h-7 text-purple-300 animate-pulse" />;
      case 'CloudFog': return <CloudFog {...props} className="w-6 h-6 sm:w-7 sm:h-7 text-slate-200" />;
      default: return <Cloud {...props} className="w-6 h-6 sm:w-7 sm:h-7 text-slate-200" />;
    }
  };

  return (
    <SpotlightCard
      glowColor={getGlowColor()}
      className="w-full relative overflow-hidden !border-white/25 bg-gradient-to-br from-slate-900/95 via-slate-850/90 to-slate-900/95 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
        
        {/* Left Column: Location, Big Animated Temp, Condition */}
        <div className="lg:col-span-7 flex flex-col justify-between z-10">
          
          {/* Top meta tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-white shadow-sm">
              <Navigation className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              <span className="tracking-wide">{location.name}</span>
              <span className="text-slate-300 font-normal">({location.country})</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs font-black text-amber-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>LIVE</span>
            </div>

            <span className="text-xs text-slate-300 ml-auto hidden sm:inline-block font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
              {location.timezone || 'Local Time'}
            </span>
          </div>

          {/* Huge Dynamic Temperature Odometer */}
          <div className="flex items-baseline gap-2 my-1 sm:my-2">
            <span className="fluid-h1 font-display font-black tracking-tight text-white drop-shadow-md">
              <AnimatedNumber value={currentTemp} />
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-400 select-none drop-shadow-sm">
              {unit}
            </span>
          </div>

          {/* Condition Header & Description */}
          <div className="flex items-center gap-3 my-2 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 shadow-sm flex-shrink-0">
              {renderConditionIcon()}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-wide">
                {condition.label}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                {condition.description}
              </p>
            </div>
          </div>

          {/* High / Low / Feels Like Pills (Distinct, High-Contrast Cards) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-3 border-t border-white/15 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-slate-200">
              <span className="text-slate-300">Feels like:</span>
              <span className="font-extrabold text-white"><AnimatedNumber value={feelsLike} suffix={unit} /></span>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 font-bold">
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>High: <AnimatedNumber value={maxTemp} suffix={unit} /></span>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-400/35 text-sky-300 font-bold">
              <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
              <span>Low: <AnimatedNumber value={minTemp} suffix={unit} /></span>
            </div>

            <div className="flex items-center gap-1 text-xs text-amber-300 font-bold ml-auto px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-400/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>3D Motion</span>
            </div>
          </div>

        </div>

        {/* Right Column: 3D Weather Orb Canvas */}
        <div className="lg:col-span-5 relative w-full h-[210px] sm:h-[270px] md:h-[330px] rounded-2xl overflow-hidden bg-slate-950/40 border border-white/15 flex items-center justify-center shadow-inner">
          <WeatherScene3D 
            theme={condition.theme} 
            isDay={condition.isDay} 
            interactive={true} 
          />
          
          <div className="absolute bottom-2.5 right-3 pointer-events-none px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-[10px] text-white font-mono flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Interactive 3D Engine</span>
          </div>
        </div>

      </div>
    </SpotlightCard>
  );
};
