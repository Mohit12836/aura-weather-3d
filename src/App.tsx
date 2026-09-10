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

  // Dynamic Background Aura based on current weather condition
  const getAmbientBg = () => {
    if (!weatherData) return 'from-slate-950 via-slate-900 to-black';
    switch (weatherData.condition.theme) {
      case 'sunny':
        return 'from-amber-950/40 via-slate-950 to-black';
      case 'rainy':
        return 'from-sky-950/40 via-slate-950 to-black';
      case 'thunder':
        return 'from-purple-950/50 via-slate-950 to-black';
      case 'snow':
        return 'from-cyan-950/30 via-slate-950 to-black';
      case 'night':
        return 'from-indigo-950/50 via-slate-950 to-black';
      default:
        return 'from-slate-900/50 via-slate-950 to-black';
    }
  };

  return (
    <div className={`min-h-screen w-full bg-gradient-to-b ${getAmbientBg()} text-slate-100 flex flex-col relative transition-colors duration-1000 selection:bg-amber-500 selection:text-black`}>
      
      {/* Har Click Me Magic FX Canvas */}
      <MagicClickFx enabled={magicEnabled} />

      {/* Atmospheric Ambient Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
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
      <main className="flex-1 fluid-container py-6 md:py-8 z-10">
        
        {/* Loading State with Smooth Spinner */}
        {loading && !weatherData && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-amber-400 animate-spin" />
              <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-sm font-medium text-slate-300 animate-pulse">
              Gathering real-time atmospheric data for {selectedCity.name}...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-center max-w-lg mx-auto my-12 backdrop-blur-xl">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Weather Sync Error</h3>
            <p className="text-xs text-rose-200/80 mb-4">{error}</p>
            <MagneticButton onClick={() => loadWeather(selectedCity)} variant="primary" className="!px-5 !py-2.5 !rounded-xl text-xs gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </MagneticButton>
          </div>
        )}

        {/* Weather Dashboard Content */}
        {weatherData && (
          <div className="flex flex-col gap-6 md:gap-8">
            
            {/* 1. Hero Weather Card with Integrated 3D Model & Animated Temperature */}
            <HeroWeatherCard weather={weatherData} unit={unit} />

            {/* 2. 24-Hour Hourly Timeline */}
            <HourlyForecast hourly={weatherData.hourly} unit={unit} />

            {/* 3. Comprehensive Meteorological Metrics Grid */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-display font-bold text-lg md:text-xl text-white">
                  Atmospheric Conditions
                </h3>
                <span className="text-xs text-slate-400">Live Telemetry</span>
              </div>
              <MetricsGrid weather={weatherData} unit={unit} />
            </div>

            {/* 4. Bottom Split Layout: 7-Day Forecast + Sun/Moon Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <DailyForecast daily={weatherData.daily} unit={unit} />
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6">
                <SunMoonTracker
                  sunrise={weatherData.daily[0]?.sunrise || '06:00'}
                  sunset={weatherData.daily[0]?.sunset || '18:30'}
                />

                {/* Real-time Free API Guarantee Badge */}
                <div className="p-5 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <Layers className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      100% Free Open-Meteo API
                      <span className="px-1.5 py-0.2 text-[9px] rounded bg-emerald-500/20 text-emerald-300 font-mono">LIVE</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No API keys or credit cards needed. Real-time global meteorological forecasts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-xl py-6 mt-12 text-center text-xs text-slate-500">
        <div className="fluid-container flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <span>AuraWeather 3D</span>
            <span>•</span>
            <span>Motion.dev & Three.js Physics</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Every click is filled with magic ✨</span>
          </div>

          <a 
            href="https://open-meteo.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            Powered by Open-Meteo <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>

    </div>
  );
};
