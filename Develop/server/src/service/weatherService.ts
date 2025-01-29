import dotenv from 'dotenv';
dotenv.config();

// Define an interface for Coordinates
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// Define the WeatherService class
class WeatherService {
  baseURL: string;
  apiKey: string;
  cityName: string;

  constructor(cityName: string) {
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = cityName;
  }

  // Fetch location data from the API
  private async fetchLocationData(query: string): Promise<Coordinates[]> {
    try {
      const response = await fetch(`${this.baseURL}/geo/1.0/direct?${query}`);
      if (!response.ok) throw new Error('Could not fetch location data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching location data:', error);
      return [];
    }
  }

// Extract latitude and longitude from location data
private destructureLocationData(locationData: Coordinates[]): Coordinates {
  try {
    if (!locationData.length) throw new Error('Location not found');
    return { lat: locationData[0].lat, lon: locationData[0].lon };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred', error); // Log the entire error
    }
    this.cityName = 'Location not found';
    return { lat: -1, lon: -1 }; // Default to invalid coordinates
  }
}


  // Build query for geocoding API
  private buildGeocodeQuery(): string {
    return `q=${encodeURIComponent(this.cityName)}&limit=1&appid=${this.apiKey}`;
  }

  // Build query for weather API
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
  }

  // Fetch and destructure location data
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data from API
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const currentWeatherRes = await fetch(
        `${this.baseURL}/data/2.5/weather?${this.buildWeatherQuery(coordinates)}`
      );
      const forecastRes = await fetch(
        `${this.baseURL}/data/2.5/forecast?${this.buildWeatherQuery(coordinates)}`
      );

      if (!currentWeatherRes.ok || !forecastRes.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const currentWeather = await currentWeatherRes.json();
      const forecast = await forecastRes.json();

      return { currentWeather, forecast };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  // Parse the current weather response
  private parseCurrentWeather(response: any): Weather {
    return new Weather(
      this.cityName,
      new Date().toDateString(),
      response.weather[0].icon,
      response.weather[0].description,
      response.main.temp,
      response.wind.speed,
      response.main.humidity
    );
  }

  // Parse the forecast data response
  private parseForecast(response: any): Weather[] {
    return response.list
      .filter((entry: any) => entry.dt_txt.includes('12:00:00'))
      .map(
        (day: any) =>
          new Weather(
            this.cityName,
            day.dt_txt.slice(0, 10),
            day.weather[0].icon,
            day.weather[0].description,
            day.main.temp,
            day.wind.speed,
            day.main.humidity
          )
      );
  }

  // Build forecast array combining current and future weather data
  private buildForecastArray(currentWeather: Weather, forecast: Weather[]): Weather[] {
    return [currentWeather, ...forecast];
  }

  // Get weather data for a given city
  async getWeatherForCity(): Promise<Weather[] | null> {
    try {
      const locationData = await this.fetchAndDestructureLocationData();
      const combinedWeatherData = await this.fetchWeatherData(locationData);

      if (!combinedWeatherData) return null;

      const current = this.parseCurrentWeather(combinedWeatherData.currentWeather);
      const forecast = this.parseForecast(combinedWeatherData.forecast);

      return this.buildForecastArray(current, forecast);
    } catch (error) {
      console.error('Error retrieving weather data:', error);
      return null;
    }
  }
}

export default WeatherService;
