import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sparkles, Compass, Loader2, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeoLocation } from '../types/weather';
import { searchCities, POPULAR_CITIES } from '../services/weatherApi';
import { MagneticButton } from './effects/MagneticButton';

interface NavbarProps {
  onSelectCity: (city: GeoLocation) => void;
  onLocateMe: () => void;
  isLocating: boolean;
  unit: '°C' | '°F';
  onToggleUnit: () => void;
  magicEnabled: boolean;
  onToggleMagic: () => void;
  currentCityName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectCity,
  onLocateMe,
  isLocating,
  unit,
  onToggleUnit,
  magicEnabled,
  onToggleMagic,
  currentCityName,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced live city search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchCities(query);
        setSuggestions(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: GeoLocation) => {
    onSelectCity(city);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-slate-900/90 border-b border-white/20 shadow-lg transition-colors">
      <div className="fluid-container py-2.5 sm:py-3 md:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 md:gap-6">
          
          {/* Brand Logo & Mobile Action Controls */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <motion.div 
                whileHover={{ rotate: 180, scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/40 cursor-pointer flex-shrink-0"
              >
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin-slow" />
              </motion.div>
              <div>
                <span className="font-display font-black text-lg sm:text-xl md:text-2xl tracking-tight text-white">
                  AuraWeather <span className="text-amber-400">3D</span>
                </span>
                <span className="hidden lg:inline-block ml-2 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Real-time Free API
                </span>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={onToggleMagic}
                className={`min-h-[38px] px-2.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                  magicEnabled
                    ? 'bg-amber-500/25 text-amber-200 border-amber-400/50 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-300 border-white/20'
                }`}
                title="Toggle Magic Click Effect"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold">{magicEnabled ? 'Magic ON' : 'OFF'}</span>
              </button>

              <button
                onClick={onToggleUnit}
                className="min-h-[38px] px-3 rounded-xl text-xs font-black bg-slate-800 text-white border border-white/25 active:scale-95 transition-transform"
              >
                {unit}
              </button>
            </div>
          </div>

          {/* Search Bar with High Contrast Autocomplete & Geolocation */}
          <div ref={searchContainerRef} className="relative w-full md:max-w-md flex-1">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-amber-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Search city (e.g. Mumbai, Tokyo, London)..."
                className="w-full pl-10 pr-24 py-2.5 rounded-xl sm:rounded-2xl bg-slate-800/95 border-2 border-white/20 text-white placeholder:text-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all shadow-md font-medium"
              />
              
              <div className="absolute right-1.5 flex items-center gap-1">
                {isSearching ? (
                  <div className="p-1.5 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  </div>
                ) : null}

                <MagneticButton
                  onClick={onLocateMe}
                  disabled={isLocating}
                  variant="primary"
                  className="!px-3 !py-1.5 !rounded-lg sm:!rounded-xl !text-xs gap-1.5 min-h-[34px] !font-bold"
                  title="Detect My Location via GPS"
                >
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  )}
                  <span className="text-xs font-black">GPS</span>
                </MagneticButton>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {isOpen && (suggestions.length > 0 || (query.length >= 2 && !isSearching)) && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border-2 border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/10 max-h-[320px] overflow-y-auto"
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <button
                        key={`${item.id}-${item.latitude}`}
                        onClick={() => handleSelect(item)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-800 flex items-center justify-between transition-colors group min-h-[44px]"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-white text-sm">
                              {item.name}
                            </span>
                            <span className="text-xs text-slate-300 ml-2 truncate">
                              {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-slate-200 flex-shrink-0">
                          {item.country_code}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-300 text-center font-medium">
                      No cities found for "{query}".
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Magic Sparkle Click Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onToggleMagic}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
                magicEnabled
                  ? 'bg-amber-500/25 text-amber-200 border-amber-400/50 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border-white/20 hover:bg-slate-700'
              }`}
              title="Toggle Magic Particle FX on every click"
            >
              <Sparkles className={`w-4 h-4 ${magicEnabled ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Magic Clicks {magicEnabled ? 'ON' : 'OFF'}</span>
            </motion.button>

            {/* Metric / Imperial Unit Toggle */}
            <div className="flex items-center p-1 bg-slate-800 rounded-2xl border border-white/20">
              <button
                onClick={() => unit !== '°C' && onToggleUnit()}
                className={`px-3 py-1 text-xs font-black rounded-xl transition-all ${
                  unit === '°C' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => unit !== '°F' && onToggleUnit()}
                className={`px-3 py-1 text-xs font-black rounded-xl transition-all ${
                  unit === '°F' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>
          </div>

        </div>

        {/* Quick-Pick Popular Cities Horizontal Snap Rail */}
        <div className="relative flex items-center mt-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs w-full snap-x-mandatory">
            <span className="text-xs text-amber-300 font-bold whitespace-nowrap mr-1 flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Popular:
            </span>
            {POPULAR_CITIES.map((city) => {
              const isSelected = currentCityName.toLowerCase() === city.name.toLowerCase();
              return (
                <motion.button
                  key={city.name}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectCity(city)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 snap-start min-h-[32px] border ${
                    isSelected
                      ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-md shadow-amber-500/50'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-white/20'
                  }`}
                >
                  {city.name}
                </motion.button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
};
