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
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-slate-950/70 border-b border-white/10 transition-colors">
      <div className="fluid-container py-3 md:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30 cursor-pointer"
              >
                <Compass className="w-5 h-5 text-white animate-spin-slow" />
              </motion.div>
              <div>
                <span className="font-display font-black text-xl md:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AuraWeather <span className="text-amber-400">3D</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Real-time Free API
                </span>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={onToggleMagic}
                className={`p-2 rounded-xl text-xs flex items-center gap-1 border transition-all ${
                  magicEnabled
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/30'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}
                title="Toggle Magic Click Effect"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={onToggleUnit}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/15"
              >
                {unit}
              </button>
            </div>
          </div>

          {/* Search Bar with Autocomplete & Geolocation */}
          <div ref={searchContainerRef} className="relative w-full md:max-w-md flex-1">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Search global city (e.g. Mumbai, New York, Tokyo)..."
                className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/80 transition-all shadow-inner"
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
                  variant="secondary"
                  className="!px-2.5 !py-1.5 !rounded-xl !text-xs gap-1.5"
                  title="Detect My Location"
                >
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="hidden sm:inline text-[11px] font-semibold">GPS</span>
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
                  className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5"
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <button
                        key={`${item.id}-${item.latitude}`}
                        onClick={() => handleSelect(item)}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-amber-400/80 group-hover:text-amber-400 transition-colors" />
                          <div>
                            <span className="font-semibold text-slate-100 group-hover:text-white text-sm">
                              {item.name}
                            </span>
                            <span className="text-xs text-slate-400 ml-2">
                              {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          {item.country_code}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center">
                      No cities found for "{query}". Try another spelling.
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleMagic}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                magicEnabled
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
              title="Toggle Magic Particle FX on every click"
            >
              <Sparkles className={`w-4 h-4 ${magicEnabled ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Magic Clicks {magicEnabled ? 'ON' : 'OFF'}</span>
            </motion.button>

            {/* Metric / Imperial Unit Toggle */}
            <div className="flex items-center p-1 bg-white/5 rounded-2xl border border-white/10">
              <button
                onClick={() => unit !== '°C' && onToggleUnit()}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  unit === '°C' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => unit !== '°F' && onToggleUnit()}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  unit === '°F' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>
          </div>

        </div>

        {/* Quick-Pick Popular Cities Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 mt-1 no-scrollbar text-xs">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400/30" /> Popular:
          </span>
          {POPULAR_CITIES.map((city) => {
            const isSelected = currentCityName.toLowerCase() === city.name.toLowerCase();
            return (
              <motion.button
                key={city.name}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelectCity(city)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {city.name}
              </motion.button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
