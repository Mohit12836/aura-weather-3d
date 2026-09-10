export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country_code: string;
  country: string;
  admin1?: string;
  timezone?: string;
}

export type WeatherTheme = 'sunny' | 'night' | 'rainy' | 'thunder' | 'snow' | 'cloudy';

export interface WeatherConditionInfo {
  code: number;
  label: string;
  description: string;
  icon: string;
  theme: WeatherTheme;
  isDay: boolean;
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  surfacePressure: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  visibility: number;
}

export interface HourlyForecastItem {
  time: string;
  formattedHour: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  uvMax: number;
  precipitationSum: number;
  precipitationProbability: number;
}

export interface AirQualityData {
  aqi: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  categoryColor: string;
  pm25: number;
  pm10: number;
  no2?: number;
  o3?: number;
  so2?: number;
}

export interface FullWeatherResponse {
  location: GeoLocation;
  current: CurrentWeatherData;
  condition: WeatherConditionInfo;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality?: AirQualityData;
  units: {
    temp: '°C' | '°F';
    speed: 'km/h' | 'mph';
  };
}
