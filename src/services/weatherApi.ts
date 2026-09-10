import { 
  GeoLocation, 
  WeatherConditionInfo, 
  WeatherTheme, 
  FullWeatherResponse, 
  HourlyForecastItem, 
  DailyForecastItem, 
  AirQualityData 
} from '../types/weather';

// WMO Code interpretation
export function getWeatherCondition(code: number, isDay: boolean = true): WeatherConditionInfo {
  // Clear Sky
  if (code === 0) {
    return {
      code,
      label: isDay ? 'Sunny' : 'Clear Night',
      description: isDay ? 'Radiant sunshine with clear blue skies' : 'Starlit sky with crystal clear atmosphere',
      icon: isDay ? 'Sun' : 'Moon',
      theme: isDay ? 'sunny' : 'night',
      isDay,
    };
  }

  // Mainly Clear / Partly Cloudy
  if (code === 1 || code === 2) {
    return {
      code,
      label: isDay ? 'Partly Cloudy' : 'Partly Cloudy Night',
      description: 'Gentle drifting clouds with pleasant visibility',
      icon: isDay ? 'CloudSun' : 'CloudMoon',
      theme: isDay ? 'sunny' : 'night',
      isDay,
    };
  }

  // Overcast
  if (code === 3) {
    return {
      code,
      label: 'Overcast',
      description: 'Thick blanket of atmospheric clouds',
      icon: 'Cloud',
      theme: 'cloudy',
      isDay,
    };
  }

  // Fog & Mist
  if (code === 45 || code === 48) {
    return {
      code,
      label: 'Foggy / Mist',
      description: 'Dense atmospheric moisture causing reduced visibility',
      icon: 'CloudFog',
      theme: 'cloudy',
      isDay,
    };
  }

  // Drizzle
  if (code >= 51 && code <= 57) {
    return {
      code,
      label: 'Light Drizzle',
      description: 'Gentle mist-like rain showers',
      icon: 'CloudDrizzle',
      theme: 'rainy',
      isDay,
    };
  }

  // Rain
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    const isHeavy = code === 65 || code === 82;
    return {
      code,
      label: isHeavy ? 'Heavy Rain' : 'Rain Showers',
      description: isHeavy ? 'Pouring rain with fresh storm breezes' : 'Steady rainfall cooling the ground',
      icon: 'CloudRain',
      theme: 'rainy',
      isDay,
    };
  }

  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return {
      code,
      label: 'Snowfall',
      description: 'Crisp crystalline snowflakes drifting from the clouds',
      icon: 'CloudSnow',
      theme: 'snow',
      isDay,
    };
  }

  // Thunderstorm
  if (code >= 95 && code <= 99) {
    return {
      code,
      label: 'Thunderstorm',
      description: 'Electric storm activity with thunderbolts and wind gusts',
      icon: 'CloudLightning',
      theme: 'thunder',
      isDay,
    };
  }

  return {
    code,
    label: isDay ? 'Partly Sunny' : 'Clear Night',
    description: 'Moderate atmospheric conditions',
    icon: isDay ? 'Sun' : 'Moon',
    theme: isDay ? 'sunny' : 'night',
    isDay,
  };
}

// Search locations worldwide
export async function searchCities(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to query geocoding API');
    const data = await res.json();
    return (data.results || []) as GeoLocation[];
  } catch (error) {
    console.error('Search cities error:', error);
    return [];
  }
}

// Reverse Geocode fallback
export async function getLocationName(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (res.ok) {
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || data.address?.county || 'Current Location';
      const country = data.address?.country || '';
      return country ? `${city}, ${country}` : city;
    }
  } catch {
    // silently ignore and fallback
  }
  return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
}

// Fetch Air Quality
export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | undefined> {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const data = await res.json();
    const current = data.current;
    if (!current) return undefined;

    const aqi = Math.round(current.us_aqi ?? 45);
    let category: AirQualityData['category'] = 'Good';
    let categoryColor = '#22c55e'; // green

    if (aqi <= 50) {
      category = 'Good';
      categoryColor = '#22c55e';
    } else if (aqi <= 100) {
      category = 'Moderate';
      categoryColor = '#eab308';
    } else if (aqi <= 150) {
      category = 'Unhealthy for Sensitive Groups';
      categoryColor = '#f97316';
    } else if (aqi <= 200) {
      category = 'Unhealthy';
      categoryColor = '#ef4444';
    } else if (aqi <= 300) {
      category = 'Very Unhealthy';
      categoryColor = '#a855f7';
    } else {
      category = 'Hazardous';
      categoryColor = '#881337';
    }

    return {
      aqi,
      category,
      categoryColor,
      pm25: current.pm2_5 ?? 12,
      pm10: current.pm10 ?? 25,
      no2: current.nitrogen_dioxide,
      o3: current.ozone,
      so2: current.sulphur_dioxide,
    };
  } catch (err) {
    console.warn('Air quality fetch error:', err);
    return undefined;
  }
}

// Fetch Full Weather Data
export async function fetchFullWeather(location: GeoLocation): Promise<FullWeatherResponse> {
  const { latitude: lat, longitude: lon } = location;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,visibility&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=auto`;

  const [weatherRes, airQuality] = await Promise.all([
    fetch(url),
    fetchAirQuality(lat, lon)
  ]);

  if (!weatherRes.ok) {
    throw new Error('Failed to fetch weather forecast');
  }

  const data = await weatherRes.json();
  const currentRaw = data.current;
  const isDay = currentRaw.is_day === 1;
  const condition = getWeatherCondition(currentRaw.weather_code, isDay);

  // Parse Hourly Forecast (next 24 hours starting from current hour)
  const currentIsoHour = currentRaw.time ? currentRaw.time.substring(0, 13) : '';
  let startIndex = 0;
  if (data.hourly?.time) {
    const foundIdx = data.hourly.time.findIndex((t: string) => t.startsWith(currentIsoHour));
    if (foundIdx !== -1) startIndex = foundIdx;
  }

  const hourly: HourlyForecastItem[] = [];
  const totalHours = Math.min((data.hourly?.time?.length || 0), startIndex + 24);

  for (let i = startIndex; i < totalHours; i++) {
    const timeStr = data.hourly.time[i];
    const dateObj = new Date(timeStr);
    const hourNum = dateObj.getHours();
    const formattedHour = i === startIndex ? 'Now' : `${hourNum % 12 || 12} ${hourNum >= 12 ? 'PM' : 'AM'}`;

    hourly.push({
      time: timeStr,
      formattedHour,
      temperature: Math.round(data.hourly.temperature_2m[i]),
      precipitationProbability: Math.round(data.hourly.precipitation_probability[i] || 0),
      weatherCode: data.hourly.weather_code[i],
      windSpeed: Math.round(data.hourly.wind_speed_10m[i] || 0),
    });
  }

  // Parse Daily Forecast (7 days)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daily: DailyForecastItem[] = [];
  const dailyCount = Math.min(7, (data.daily?.time?.length || 0));

  for (let i = 0; i < dailyCount; i++) {
    const dateStr = data.daily.time[i];
    const dateObj = new Date(dateStr);
    const dayName = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : daysOfWeek[dateObj.getDay()]);

    daily.push({
      date: dateStr,
      dayName,
      weatherCode: data.daily.weather_code[i],
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      sunrise: data.daily.sunrise[i] ? data.daily.sunrise[i].split('T')[1]?.substring(0, 5) : '06:00',
      sunset: data.daily.sunset[i] ? data.daily.sunset[i].split('T')[1]?.substring(0, 5) : '18:30',
      uvMax: Math.round(data.daily.uv_index_max[i] || 0),
      precipitationSum: data.daily.precipitation_sum[i] || 0,
      precipitationProbability: Math.round(data.daily.precipitation_probability_max[i] || 0),
    });
  }

  return {
    location,
    current: {
      time: currentRaw.time,
      temperature: Math.round(currentRaw.temperature_2m),
      apparentTemperature: Math.round(currentRaw.apparent_temperature),
      relativeHumidity: Math.round(currentRaw.relative_humidity_2m),
      isDay,
      precipitation: currentRaw.precipitation || 0,
      weatherCode: currentRaw.weather_code,
      surfacePressure: Math.round(currentRaw.surface_pressure),
      windSpeed: Math.round(currentRaw.wind_speed_10m),
      windDirection: Math.round(currentRaw.wind_direction_10m),
      uvIndex: Math.round(currentRaw.uv_index || 0),
      visibility: Math.round((currentRaw.visibility || 10000) / 1000), // convert m to km
    },
    condition,
    hourly,
    daily,
    airQuality,
    units: {
      temp: '°C',
      speed: 'km/h',
    }
  };
}

// Popular default cities
export const POPULAR_CITIES: GeoLocation[] = [
  { id: 1273294, name: 'Delhi', country: 'India', country_code: 'IN', latitude: 28.6139, longitude: 77.2090, admin1: 'Delhi' },
  { id: 1275339, name: 'Mumbai', country: 'India', country_code: 'IN', latitude: 19.0760, longitude: 72.8777, admin1: 'Maharashtra' },
  { id: 5128581, name: 'New York', country: 'United States', country_code: 'US', latitude: 40.7128, longitude: -74.0060, admin1: 'New York' },
  { id: 2643743, name: 'London', country: 'United Kingdom', country_code: 'GB', latitude: 51.5074, longitude: -0.1278, admin1: 'England' },
  { id: 1850147, name: 'Tokyo', country: 'Japan', country_code: 'JP', latitude: 35.6895, longitude: 139.6917, admin1: 'Tokyo' },
  { id: 292223, name: 'Dubai', country: 'United Arab Emirates', country_code: 'AE', latitude: 25.2048, longitude: 55.2708, admin1: 'Dubai' },
  { id: 2988507, name: 'Paris', country: 'France', country_code: 'FR', latitude: 48.8566, longitude: 2.3522, admin1: 'Île-de-France' },
];
