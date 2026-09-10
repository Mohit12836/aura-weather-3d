import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  Layers,
  Heart
} from 'lucide-react';
import { GeoLocation, FullWeatherResponse } from './types/weather';
import { fetchFullWeather, POPULAR_CITIES, getLocationName } from './services/weatherApi';
import { Navbar } from './components/Navbar';
import { HeroWeatherCard } from './components/HeroWeatherCard';
import { MetricsGrid } from './components/MetricsGrid';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { SunMoonTracker } from './components/SunMoonTracker';
import { MagicClickFx } from './components/effects/MagicClickFx';
import { MagneticButton } from './components/effects/MagneticButton';

export const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<GeoLocation>(POPULAR_CITIES[0]); // Default Delhi
  const [weatherData, setWeatherData] = useState<FullWeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'°C' | '°F'>('°C');
  const [magicEnabled, setMagicEnabled] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Load weather whenever selectedCity changes
  const loadWeather = async (city: GeoLocation) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFullWeather(city);
      setWeatherData(data);
    } catch (err: any) {
      console.error('Error fetching weather:', err);
      setError('Unable to fetch live meteorological data. Please check your internet connection or choose another city.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedCity);
  }, [selectedCity]);

  // Handle GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const name = await getLocationName(latitude, longitude);
          const userLocation: GeoLocation = {
            id: Date.now(),
            name: name.split(',')[0],
            country: name.split(',')[1]?.trim() || 'Current Location',
            country_code: 'GPS',
            latitude,
            longitude,
          };
          setSelectedCity(userLocation);
        } catch {
          setSelectedCity({
            id: Date.now(),
            name: 'My Location',
            country: 'Local',
            country_code: 'GPS',
            latitude,
            longitude,
          });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        alert('Could not access current location. Please grant location permissions or search for your city.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Vibrant atmospheric sky palettes (Crisp, High-Contrast & Beautiful)
  const getAmbientBg = () => {
    if (!weatherData) return 'from-[#0369a1] via-[#0f2942] to-[#0a1120]';
    switch (weatherData.condition.theme) {
      case 'sunny':
        return weatherData.condition.isDay
          ? 'from-[#0284c7] via-[#0369a1] to-[#0f172a]' // Radiant Azure Day Sky
          : 'from-[#1e1b4b] via-[#0f172a] to-[#030712]'; // Deep Cosmic Sapphire
      case 'rainy':
        return 'from-[#0c4a6e] via-[#0f2942] to-[#0a1120]'; // Deep Marine Oceanic Rain
      case 'thunder':
        return 'from-[#3b0764] via-[#240c49] to-[#090514]'; // Electric Royal Violet
      case 'snow':
        return 'from-[#0284c7] via-[#0f3b5f] to-[#0a1928]'; // Frosty Glacier Sky
      case 'night':
        return 'from-[#172554] via-[#0f172a] to-[#020617]'; // Deep Starlit Midnight
      default:
        return 'from-[#334155] via-[#1e293b] to-[#0f172a]'; // Atmospheric Slate
    }
  };

  return (
    <div className={`min-h-screen w-full bg-gradient-to-b ${getAmbientBg()} text-slate-100 flex flex-col relative transition-colors duration-1000 selection:bg-amber-500 selection:text-black overflow-x-clip`}>
      
      {/* Har Click Me Magic FX Canvas */}
      <MagicClickFx enabled={magicEnabled} />

      {/* Atmospheric Ambient Radiant Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-amber-400/25 rounded-full blur-[90px]" />
        <div className="absolute top-1/3 -right-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-sky-400/20 rounded-full blur-[90px]" />
        <div className="absolute bottom-10 -left-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-indigo-500/20 rounded-full blur-[90px]" />
      </div>

      {/* Top Navbar */}
      <Navbar
        onSelectCity={(city) => setSelectedCity(city)}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        unit={unit}
        onToggleUnit={() => setUnit(unit === '°C' ? '°F' : '°C')}
        magicEnabled={magicEnabled}
        onToggleMagic={() => setMagicEnabled(!magicEnabled)}
        currentCityName={selectedCity.name}
      />

      {/* Main App Body */}
      <main className="flex-1 fluid-container py-3.5 sm:py-5 md:py-8 z-10">
        
        {/* Loading State with Smooth Spinner */}
        {loading && !weatherData && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white/20 border-t-amber-400 animate-spin" />
              <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-sm font-bold text-white animate-pulse text-center px-4 bg-slate-900/80 py-2 rounded-xl border border-white/20">
              Gathering real-time atmospheric data for {selectedCity.name}...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-3xl bg-rose-950/80 border-2 border-rose-500/50 text-center max-w-lg mx-auto my-8 sm:my-12 backdrop-blur-2xl shadow-2xl">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-lg font-black text-white mb-1">Weather Sync Error</h3>
            <p className="text-xs text-rose-200 mb-4 font-medium">{error}</p>
            <MagneticButton onClick={() => loadWeather(selectedCity)} variant="primary" className="!px-5 !py-2.5 !rounded-xl text-xs gap-2 !font-bold">
              <RefreshCw className="w-4 h-4" /> Try Again
            </MagneticButton>
          </div>
        )}

        {/* Weather Dashboard Content */}
        {weatherData && (
          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            
            {/* 1. Hero Weather Card with Integrated 3D Model & Animated Temperature */}
            <HeroWeatherCard weather={weatherData} unit={unit} />

            {/* 2. 24-Hour Hourly Timeline */}
            <HourlyForecast hourly={weatherData.hourly} unit={unit} />

            {/* 3. Comprehensive Meteorological Metrics Grid (2-Column on Mobile, 3 on Desktop) */}
            <div>
              <div className="flex items-center justify-between mb-2.5 sm:mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <h3 className="font-display font-black text-lg sm:text-xl md:text-2xl text-white tracking-wide drop-shadow-sm">
                    Atmospheric Telemetry
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-200 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  Real-time Sensors
                </span>
              </div>
              <MetricsGrid weather={weatherData} unit={unit} />
            </div>

            {/* 4. Bottom Split Layout: 7-Day Forecast + Sun/Moon Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
              <div className="lg:col-span-8">
                <DailyForecast daily={weatherData.daily} unit={unit} />
              </div>
              <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
                <SunMoonTracker
                  sunrise={weatherData.daily[0]?.sunrise || '06:00'}
                  sunset={weatherData.daily[0]?.sunset || '18:30'}
                />

                {/* Real-time Free API Guarantee Badge */}
                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-emerald-400/30 bg-slate-900/90 backdrop-blur-2xl flex items-center gap-3 shadow-xl">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex-shrink-0">
                    <Layers className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      100% Free Open-Meteo API
                      <span className="px-2 py-0.5 text-[9px] rounded-md bg-emerald-500/25 text-emerald-200 font-mono font-bold border border-emerald-400/30">ACTIVE</span>
                    </h4>
                    <p className="text-[11px] text-slate-200 font-medium mt-0.5">
                      Global weather sensors. Zero rate limits, no API keys or subscription needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/20 bg-slate-900/90 backdrop-blur-2xl py-4 sm:py-6 mt-8 sm:mt-12 text-center text-xs">
        <div className="fluid-container flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <span>AuraWeather 3D</span>
            <span>•</span>
            <span className="text-amber-400">Three.js & Framer Motion</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs">
            <span>Every click is filled with magic ✨</span>
          </div>

          <a 
            href="https://open-meteo.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-amber-300 hover:text-amber-200 font-bold transition-colors flex items-center gap-1 text-xs"
          >
            Powered by Open-Meteo <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </footer>

    </div>
  );
};
