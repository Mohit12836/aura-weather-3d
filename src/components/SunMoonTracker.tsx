import React from 'react';
import { Sunrise, Sunset } from 'lucide-react';
import { SpotlightCard } from './effects/SpotlightCard';

interface SunMoonTrackerProps {
  sunrise: string; // e.g. "06:14"
  sunset: string;  // e.g. "18:42"
}

export const SunMoonTracker: React.FC<SunMoonTrackerProps> = ({ sunrise, sunset }) => {
  // Compute approximate sun progress across daytime arc
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [riseH, riseM] = sunrise.split(':').map(Number);
  const [setH, setM] = sunset.split(':').map(Number);
  const sunriseMinutes = (riseH || 6) * 60 + (riseM || 0);
  const sunsetMinutes = (setH || 18) * 60 + (setM || 30);

  const totalDaylightMinutes = Math.max(1, sunsetMinutes - sunriseMinutes);
  const elapsedDaylightMinutes = currentMinutes - sunriseMinutes;
  const progressRatio = Math.min(Math.max(elapsedDaylightMinutes / totalDaylightMinutes, 0), 1);
  const progressPercent = Math.round(progressRatio * 100);

  const isDaytime = currentMinutes >= sunriseMinutes && currentMinutes <= sunsetMinutes;

  return (
    <SpotlightCard glowColor="rgba(245, 158, 11, 0.2)" className="w-full !p-4 sm:!p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Sunrise className="w-4 h-4 text-amber-400" />
          <h3 className="font-display font-bold text-sm sm:text-base text-white">
            Solar Horizon
          </h3>
        </div>
        <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 font-semibold border border-white/10">
          {isDaytime ? `${progressPercent}% Daylight` : 'Night Cycle'}
        </span>
      </div>

      {/* Solar Celestial Arc SVG */}
      <div className="relative w-full h-20 sm:h-24 flex items-center justify-center my-1 sm:my-2">
        <svg viewBox="0 0 300 120" className="w-full h-full max-w-[260px] sm:max-w-[320px] overflow-visible">
          {/* Horizon Line */}
          <line x1="10" y1="110" x2="290" y2="110" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />

          {/* Semicircle Celestial Orbit Path */}
          <path
            d="M 20 110 A 130 90 0 0 1 280 110"
            fill="none"
            stroke="rgba(245, 158, 11, 0.25)"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Active Arc Trail */}
          {isDaytime && (
            <path
              d="M 20 110 A 130 90 0 0 1 280 110"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeDasharray="420"
              strokeDashoffset={420 - (progressPercent / 100) * 420}
              className="transition-all duration-1000"
            />
          )}

          {/* Sun Icon along Arc */}
          {isDaytime && (
            <circle
              cx={20 + 260 * progressRatio}
              cy={110 - Math.sin(progressRatio * Math.PI) * 90}
              r="7"
              fill="#fbbf24"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="filter drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]"
            />
          )}
        </svg>
      </div>

      {/* Sunrise & Sunset Time Display */}
      <div className="grid grid-cols-2 gap-3 pt-2.5 sm:pt-3 border-t border-white/10 text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">
            <Sunrise className="w-3 h-3 text-amber-400" />
            <span>Sunrise</span>
          </div>
          <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-white">
            {sunrise}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">
            <Sunset className="w-3 h-3 text-orange-400" />
            <span>Sunset</span>
          </div>
          <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-white">
            {sunset}
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
};
