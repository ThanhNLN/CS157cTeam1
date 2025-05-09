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
        
        // Weather Cost is a multiplier.
        if (weather.weatherCode <= 17) {
          weather.weatherCost = 1; // Fine weather for flying
        } else if (weather.weatherCode <= 19) {
          weather.weatherCost = 1.3; // caution?
        } else if (weather.weatherCode <= 25) {
          weather.weatherCost = 1.15; // rain, it's okay
        } else if (weather.weatherCode <= 29) {
          weather.weatherCost = 5; // Icing risk, probably nogo.
        } else if (weather.weatherCode <= 32) {
          weather.weatherCost = 1.1; // Sand
        } else if (weather.weatherCode <= 35) {
          weather.weatherCost = 1.5; // Severe sand
        } else if (weather.weatherCode <= 41) {
          weather.weatherCost = 1.2; // Snow but not snowing
        } else if (weather.weatherCode <= 47) {
          weather.weatherCost = 1.5; // fog
        } else if (weather.weatherCode <= 49) {
          weather.weatherCost = 50; // I think you want to live, right? ICING
        } else if (weather.weatherCode <= 53) {
          weather.weatherCost = 1.05; // light rain
        } else if (weather.weatherCode <= 55) {
          weather.weatherCost = 1.1; // rain
        } else if (weather.weatherCode <= 57) {
          weather.weatherCost = 50; // freezing rain ICING
        } else if (weather.weatherCode <= 65) {
          weather.weatherCost = 1.15; // rain
        } else if (weather.weatherCode <= 79) {
          weather.weatherCost = 50; // ICING
        } else if (weather.weatherCode <= 81) {
          weather.weatherCost = 1.15; // rain
        } else if (weather.weatherCode <= 99) {
          weather.weatherCost = 50; // ICING
        } else {
          weather.weatherCost = 100;
        }
        return weather;
      });

      const query = `
        UNWIND $weatherData AS weather
        MATCH (n:NAVAID)
        WHERE abs(n.latitude - weather.latitude) <= 0.5 AND abs(n.longitude - weather.longitude) <= 0.5
        WITH n.distance * weather.weatherCost AS distWeatherCost
        SET n.distanceWeatherCost = distWeatherCost
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

      const deleteProjectedGraphQuery = `
        CALL gds.graph.drop('airways') YIELD graphName;
      `;

      await this.neo4jService.write(deleteProjectedGraphQuery);
      await delay(5000)

      const projectGraphQuery = `
        MATCH (source:NAVAID)-[r:AIRWAY_ROUTE]-(target:NAVAID)
        RETURN gds.graph.project(
          'airways',
          source,
          target,
          { relationshipProperties: r { .distanceWeatherCost } }
        )
      `;
      await this.neo4jService.write(projectGraphQuery);
      await delay(5000)
    }
  }
}
