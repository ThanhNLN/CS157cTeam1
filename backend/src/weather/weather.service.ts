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

  async reloadProjection() {
    const deleteProjectedGraphQuery = `
      CALL gds.graph.exists('airways') YIELD exists
      WITH exists
      WHERE exists
      CALL gds.graph.drop('airways') YIELD graphName
      RETURN graphName;

    `;
    await this.neo4jService.write(deleteProjectedGraphQuery);

    // const projectGraphQuery = `
    //   CALL gds.graph.project.cypher(
    //     'airways',
    //     'MATCH (n:NAVAID) RETURN id(n) AS id',
    //     'MATCH (a:NAVAID)-[r:AIRWAY_ROUTE]->(b:NAVAID) RETURN id(a) AS source, id(b) AS target, coalesce(r.distWeatherCost, r.distance) AS totalCost'
    //   )
    //   YIELD graphName, nodeCount, relationshipCount
    // `;
    const projectGraphQuery = `
      MATCH (source:NAVAID)-[r:AIRWAY_ROUTE]-(target:NAVAID)
      RETURN gds.graph.project(
        'airways',
        source,
        target,
        { relationshipProperties: r { .distanceWeatherCost } }
      )
    `
    await this.neo4jService.write(projectGraphQuery);
  }

  // @Cron('* * * * *')
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

    for (const [index, chunk] of chunks.entries()) {
      console.log(`Processing weather chunk ${index} of ${chunks.length}`);
      const weatherData = await this.weatherHttpService.getWeatherData(chunk);

      if (weatherData.error) {
        console.error(
          `Error fetching weather data for chunk ${index}:`,
          weatherData.error,
        );
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
      MATCH (:NAVAID)-[r:AIRWAY_ROUTE]-(:NAVAID)
      WHERE abs(r.midpointLatitude - weather.latitude) <= 0.5 AND abs(r.midpointLongitude - weather.longitude) <= 0.5
      UNWIND r as rs
      CALL (rs, weather) {
        RETURN (rs.distance * weather.weatherCost) AS distWeatherCost
      }
      SET rs.distanceWeatherCost = distWeatherCost
      SET rs.weatherCost = weather.weatherCost
      SET rs.weatherCode = weather.weatherCode
      SET rs.cloudCover = weather.cloudCover
      SET rs.temperature = weather.temperature
      SET rs.windSpeed = weather.windSpeed;
      `;

      await this.neo4jService.write(query, {
        weatherData: transformedWeatherData,
      });
      // console.log(transformedWeatherData);
      await delay(10000);
    }

    await this.reloadProjection();
  }
}
