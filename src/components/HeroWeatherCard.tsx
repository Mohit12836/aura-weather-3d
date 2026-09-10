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
        return 'rgba(245, 158, 11, 0.35)';
      case 'rainy':
        return 'rgba(14, 165, 233, 0.35)';
      case 'thunder':
        return 'rgba(168, 85, 247, 0.4)';
      case 'snow':
        return 'rgba(56, 189, 248, 0.35)';
      case 'night':
        return 'rgba(99, 102, 241, 0.35)';
      default:
        return 'rgba(148, 163, 184, 0.25)';
    }
  };

  // Weather Icon Component
  const renderConditionIcon = () => {
    const props = { className: "w-5 h-5 sm:w-6 sm:h-6 text-amber-400" };
    switch (condition.icon) {
      case 'Sun': return <Sun {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-spin-slow" />;
      case 'Moon': return <Moon {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" />;
      case 'CloudSun': return <CloudSun {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />;
      case 'CloudMoon': return <CloudMoon {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-200" />;
      case 'CloudRain': return <CloudRain {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />;
      case 'CloudSnow': return <CloudSnow {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200" />;
      case 'CloudLightning': return <CloudLightning {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 animate-pulse" />;
      case 'CloudFog': return <CloudFog {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />;
      default: return <Cloud {...props} className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />;
    }
  };

  return (
    <SpotlightCard
      glowColor={getGlowColor()}
      className="w-full relative overflow-hidden border border-white/15 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
        
        {/* Left Column: Location, Big Animated Temp, Condition */}
        <div className="lg:col-span-7 flex flex-col justify-between z-10">
          
          {/* Top meta tags */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs font-semibold text-slate-200">
              <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400/20" />
              <span className="truncate max-w-[120px] sm:max-w-none">{location.name}</span>
              <span className="text-slate-400">({location.country})</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] sm:text-xs font-bold text-amber-300">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-ping" />
              <span>LIVE</span>
            </div>

            <span className="text-[10px] sm:text-xs text-slate-400 ml-auto hidden sm:inline-block font-mono">
              {location.timezone || 'Local Time'}
            </span>
          </div>

          {/* Huge Dynamic Temperature Odometer */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 my-1 sm:my-2">
            <span className="fluid-h1 font-display font-black tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              <AnimatedNumber value={currentTemp} />
            </span>
            <span className="text-2xl sm:text-4xl md:text-5xl font-light text-amber-400 select-none">
              {unit}
            </span>
          </div>

          {/* Condition Header & Description */}
          <div className="flex items-center gap-2.5 sm:gap-3 my-2">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 shadow-inner flex-shrink-0">
              {renderConditionIcon()}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-display text-white tracking-wide">
                {condition.label}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium line-clamp-2">
                {condition.description}
              </p>
            </div>
          </div>

          {/* High / Low / Feels Like Pills (Auto-wrap) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-300">
              <span className="text-slate-400">Feels like:</span>
              <span className="font-bold text-white"><AnimatedNumber value={feelsLike} suffix={unit} /></span>
            </div>

            <div className="h-3.5 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-1 sm:gap-1.5 text-emerald-400">
              <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>High: <strong><AnimatedNumber value={maxTemp} suffix={unit} /></strong></span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 text-sky-400">
              <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Low: <strong><AnimatedNumber value={minTemp} suffix={unit} /></strong></span>
            </div>

            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-amber-300/90 font-medium ml-auto">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>3D Motion View</span>
            </div>
          </div>

        </div>

        {/* Right Column: 3D Weather Orb Canvas */}
        <div className="lg:col-span-5 relative w-full h-[200px] sm:h-[260px] md:h-[320px] rounded-xl sm:rounded-2xl overflow-hidden bg-radial from-white/5 to-transparent flex items-center justify-center">
          <WeatherScene3D 
            theme={condition.theme} 
            isDay={condition.isDay} 
            interactive={true} 
          />
          
          <div className="absolute bottom-2 right-2 sm:right-3 pointer-events-none px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive 3D</span>
          </div>
        </div>

      </div>
    </SpotlightCard>
  );
};
