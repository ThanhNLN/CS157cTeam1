import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Neo4jService } from 'src/services/neo4j/neo4j.service';
import { WeatherHttpService } from 'src/services/weather-http/weather-http.service';

@Injectable()
export class WeatherService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly weatherHttpService: WeatherHttpService,
  ) {}

  #chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  @Cron('* * * * *')
  async syncWeatherData() {
    const locations: { lat: number; long: number }[] = [];
    for (let lon = -125; lon <= -67; lon++) {
      for (let lat = 25; lat <= 49; lat++) {
        locations.push({ lat: lat, long: lon });
      }
    }
    const chunks = this.#chunkArray(locations, 100);

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (const chunk of chunks) {
      const weatherData = await this.weatherHttpService.getWeatherData(chunk);

      if (weatherData.error) {
        console.error('Error fetching weather data:', weatherData.error);
        return;
      }

      const transformedWeatherData = weatherData.map((data) => {
        const weather = {
          latitude: data.latitude,
          longitude: data.longitude,
          weatherCode: data.hourly.weather_code[0],
          cloudCover: data.hourly.cloud_cover_high[0],
          temperature: data.hourly.temperature_180m[0],
          windSpeed: data.hourly.wind_speed_180m[0],
          weatherCost: 0,
        };
        weather.weatherCost = 0; // TODO: set weatherCost here
        return weather;
      });

      const query = `
        UNWIND $weatherData AS weather
        MATCH (n:NAVAID)
        WHERE abs(n.latitude - weather.latitude) <= 0.5 AND abs(n.longitude - weather.longitude) <= 0.5
        SET n.weatherCost = weather.weatherCost
        SET n.weatherCode = weather.weatherCode
        SET n.cloudCover = weather.cloudCover
        SET n.temperature = weather.temperature
        SET n.windSpeed = weather.windSpeed
      `;

      await this.neo4jService.write(query, {
        weatherData: transformedWeatherData,
      });
      await delay(11000);
    }
  }
}
