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
    for (let lon = 67; lon <= 125; lon++) {
      for (let lat = 25; lat <= 49; lat++) {
        locations.push({ lat: lat, long: lon });
      }
    }
    const chunks = this.#chunkArray(locations, 100);

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (const chunk of chunks) {
      const weatherData = await this.weatherHttpService.getWeatherData(chunk);

      const query = `
        UNWIND $weatherData AS weather
        MATCH (n:NAVAID)
        WHERE abs(n.latitude - weather.lat) <= 0.5 AND abs(n.longitude - weather.long) <= 0.5
        SET n.weather = weather.data
      `;
      console.log(await this.neo4jService.write(query, { weatherData }));
      await delay(11000);
    }
  }
}
