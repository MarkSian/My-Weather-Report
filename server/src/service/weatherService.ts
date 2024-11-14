import dotenv from 'dotenv';
dotenv.config();

// Coordinates object
interface Coordinates {
  lat: number; // Latitude of the location
  lon: number; // Longitude of the location
}

//Weather object
class Weather {
  city: string; // Name of the city
  date: string; // Date of the weather report
  icon: string; // Icon representing the weather condition
  description: string; // Description of the weather condition
  tempF: number; // Temperature in Fahrenheit
  windSpeed: string; // Wind speed
  humidity: string; // Humidity level


  constructor(city: string, date: string, icon: string, description: string, temperature: number, windSpeed: string, humidity: string) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.description = description;
    this.tempF = temperature;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// WeatherService class
class WeatherService {
  private baseURL: string = process.env.API_BASE_URL || ''; // Base URL for the weather API, fetched from environment variables
  private apiKey: string = process.env.API_KEY || ''; // API key for authentication, fetched from environment variables
  // fetchLocationData method
  private async fetchLocationData(query: string): Promise<Coordinates> {

    const geocodeQuery = this.buildGeocodeQuery(query); // Build the geocode query
    const response = await fetch(geocodeQuery); // Fetch location data from the API

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fetch error:', response.status, response.statusText, errorText);
      throw new Error('Failed to fetch location data');
    }
    const data = await response.json();

    if (data.length === 0) {
      throw new Error('Location not found');
    }
    return this.destructureLocationData(data[0]);
  }

  //destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {

    if (!locationData.lat || !locationData.lon) {
      throw new Error('Invalid location data');
    }
    return {
      lat: locationData.lat,
      lon: locationData.lon
    };
  }


  // buildGeocodeQuery method
  private buildGeocodeQuery(city: string): string {
    const query = `${this.baseURL}/geo/1.0/direct?q=${city}&appid=${this.apiKey}`;
    return query;
  }

  // buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const query = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
    return query;
  }

  // fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    try {
      const locationData = await this.fetchLocationData(city);
      return locationData;
    } catch (error) {
      console.error('Failed to fetch location data:', error);
      throw error;
    }
  }
  // fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    const response = await fetch(weatherQuery);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    return await response.json();
  }
  // parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const city = response.city.name; // Extract the city name from the response
    const date = response.list[0].dt_txt; // Extract the date of the weather report from the first item in the list
    const temperature = response.list[0].main.temp; // Extract the temperature from the first item in the list
    const description = response.list[0].weather[0].description; // Extract the weather description from the first item in the list
    const icon = response.list[0].weather[0].icon; // Extract the weather icon code from the first item in the list
    const windSpeed = response.list[0].wind.speed; // Extract the wind speed from the first item in the list
    const humidity = response.list[0].main.humidity; // Extract the humidity from the first item in the list
    return new Weather(city, date, icon, description, temperature, windSpeed, humidity); // Create and return a new Weather object using the extracted data
  }

  //buildForecastArray method
  buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    // Define the forecast array starting with current weather
    const forecastArray = [currentWeather];

    const datesAdded = new Set<string>();


    const filteredData = weatherData.filter(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!datesAdded.has(date)) {
        datesAdded.add(date);
        return true;
      }
      return false;
    }).slice(0, 5);

    // Map through the filtered data to create Weather objects
    const forecastData = filteredData.map(item => {
      const city = currentWeather.city;
      const date = item.dt_txt;
      const temperature = item.main.temp;
      const description = item.weather[0].description;
      const icon = item.weather[0].icon;
      const windSpeed = item.wind.speed;
      const humidity = item.main.humidity;
      return new Weather(city, date, icon, description, temperature, windSpeed, humidity);
    });

    // Return the combined array 
    return forecastArray.concat(forecastData);
  }

  //getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    // error handling
    if (!city) {
      throw new Error('City name is required');
    }

    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
    return forecastArray;
  }
}


export default new WeatherService();