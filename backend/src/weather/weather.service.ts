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

    const projectGraphQuery = `
      MATCH (source:NAVAID)-[r:AIRWAY_ROUTE]-(target:NAVAID)
      RETURN gds.graph.project(
      'airways',
      source,
      target,
      { relationshipProperties: r { .distance, .distanceWeatherCost } }
      )
    `;
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
          description: 'Unknown',
        };

        // Weather Cost is a multiplier.
        const wmoHazardRatings = {
          // 00–09: Phenomena in the vicinity
          0: { rating: 1, description: 'Cloud development not observed' },
          1: { rating: 2, description: 'Cloud development observed' },
          2: { rating: 3, description: 'State of sky on the whole unchanged' },
          3: {
            rating: 4,
            description: 'State of sky on the whole becoming clearer',
          },
          4: {
            rating: 5,
            description: 'State of sky on the whole becoming cloudier',
          },
          5: {
            rating: 10,
            description:
              'Thunderstorm within sight, no precipitation at station',
          },
          6: {
            rating: 12,
            description:
              'Duststorm or sandstorm within sight, no precipitation at station',
          },
          7: {
            rating: 15,
            description:
              'Blowing snow within sight, no precipitation at station',
          },
          8: {
            rating: 20,
            description: 'Showers within sight, no precipitation at station',
          },
          9: {
            rating: 25,
            description:
              'Funnel cloud(s) within sight, no precipitation at station',
          },

          10: { rating: 5, description: 'Mist' },
          11: { rating: 10, description: 'Patches of fog' },
          12: { rating: 15, description: 'Continuous fog' },
          13: {
            rating: 20,
            description: 'Lightning visible, no thunder heard',
          },
          14: {
            rating: 25,
            description: 'Precipitation within sight, not reaching ground',
          },
          15: {
            rating: 30,
            description: 'Precipitation within sight, reaching ground',
          },
          16: {
            rating: 35,
            description:
              'Thunderstorm within sight, no precipitation at station',
          },
          17: {
            rating: 40,
            description: 'Thunderstorm within sight, precipitation at station',
          },
          18: { rating: 45, description: 'Squalls' },
          19: { rating: 50, description: 'Funnel cloud(s) observed' },

          20: { rating: 5, description: 'Drizzle, not freezing, intermittent' },
          21: { rating: 10, description: 'Drizzle, not freezing, continuous' },
          22: { rating: 15, description: 'Drizzle, freezing, slight' },
          23: {
            rating: 20,
            description: 'Drizzle, freezing, moderate or heavy',
          },
          24: { rating: 25, description: 'Drizzle and rain, slight' },
          25: {
            rating: 30,
            description: 'Drizzle and rain, moderate or heavy',
          },
          26: { rating: 35, description: 'Rain, not freezing, intermittent' },
          27: { rating: 40, description: 'Rain, not freezing, continuous' },
          28: { rating: 45, description: 'Rain, freezing, slight' },
          29: { rating: 50, description: 'Rain, freezing, moderate or heavy' },

          30: { rating: 5, description: 'Snow, slight' },
          31: { rating: 10, description: 'Snow, moderate or heavy' },
          32: { rating: 15, description: 'Snow and rain, slight' },
          33: { rating: 20, description: 'Snow and rain, moderate or heavy' },
          34: { rating: 25, description: 'Ice pellets, slight' },
          35: { rating: 30, description: 'Ice pellets, moderate or heavy' },
          36: { rating: 35, description: 'Hail, slight' },
          37: { rating: 40, description: 'Hail, moderate or heavy' },
          38: { rating: 45, description: 'Snow grains, slight' },
          39: { rating: 50, description: 'Snow grains, moderate or heavy' },

          40: { rating: 5, description: 'Fog, visibility ≥ 1 km' },
          41: { rating: 10, description: 'Fog, visibility < 1 km' },
          42: { rating: 15, description: 'Fog, visibility < 500 m' },
          43: { rating: 20, description: 'Fog, visibility < 200 m' },
          44: { rating: 25, description: 'Fog, visibility < 50 m' },
          45: { rating: 30, description: 'Duststorm, slight' },
          46: { rating: 35, description: 'Duststorm, moderate' },
          47: { rating: 40, description: 'Duststorm, severe' },
          48: { rating: 45, description: 'Sandstorm, moderate' },
          49: { rating: 50, description: 'Sandstorm, severe' },

          50: { rating: 5, description: 'Rain, slight' },
          51: { rating: 10, description: 'Rain, moderate' },
          52: { rating: 15, description: 'Rain, heavy' },
          53: { rating: 20, description: 'Rain, very heavy' },
          54: { rating: 25, description: 'Rain, torrential' },
          55: { rating: 30, description: 'Rain, freezing, slight' },
          56: { rating: 35, description: 'Rain, freezing, moderate' },
          57: { rating: 40, description: 'Rain, freezing, heavy' },
          58: { rating: 45, description: 'Rain and snow, slight' },
          59: { rating: 50, description: 'Rain and snow, moderate or heavy' },

          60: { rating: 5, description: 'Rain shower(s), slight' },
          61: { rating: 10, description: 'Rain shower(s), moderate' },
          62: { rating: 15, description: 'Rain shower(s), heavy' },
          63: { rating: 20, description: 'Rain shower(s), very heavy' },
          64: { rating: 25, description: 'Rain shower(s), torrential' },
          65: { rating: 30, description: 'Rain shower(s), freezing, slight' },
          66: { rating: 35, description: 'Rain shower(s), freezing, moderate' },
          67: { rating: 40, description: 'Rain shower(s), freezing, heavy' },
          68: { rating: 45, description: 'Rain and snow shower(s), slight' },
          69: {
            rating: 50,
            description: 'Rain and snow shower(s), moderate or heavy',
          },

          70: { rating: 5, description: 'Snow shower(s), slight' },
          71: { rating: 10, description: 'Snow shower(s), moderate' },
          72: { rating: 15, description: 'Snow shower(s), heavy' },
          73: { rating: 20, description: 'Snow shower(s), very heavy' },
          74: { rating: 25, description: 'Snow shower(s), torrential' },
          75: { rating: 30, description: 'Snow shower(s), freezing, slight' },
          76: { rating: 35, description: 'Snow shower(s), freezing, moderate' },
          77: { rating: 40, description: 'Snow shower(s), freezing, heavy' },
          78: { rating: 45, description: 'Snow and rain shower(s), slight' },
          79: {
            rating: 50,
            description: 'Snow and rain shower(s), moderate or heavy',
          },

          80: { rating: 5, description: 'Thunderstorm, no precipitation' },
          81: { rating: 10, description: 'Thunderstorm, slight rain' },
          82: { rating: 15, description: 'Thunderstorm, moderate rain' },
          83: { rating: 20, description: 'Thunderstorm, heavy rain' },
          84: { rating: 25, description: 'Thunderstorm, very heavy rain' },
          85: { rating: 30, description: 'Thunderstorm, torrential rain' },
          86: { rating: 35, description: 'Thunderstorm, hail' },
          87: { rating: 40, description: 'Thunderstorm, heavy hail' },
          88: { rating: 45, description: 'Thunderstorm, severe' },
          89: { rating: 50, description: 'Thunderstorm, extreme' },

          90: { rating: 5, description: 'No significant weather observed' },
          91: { rating: 10, description: 'Blowing snow' },
          92: { rating: 15, description: 'Blowing sand' },
          93: { rating: 20, description: 'Blowing dust' },
          94: { rating: 25, description: 'Blowing spray' },
          95: { rating: 30, description: 'Blowing volcanic ash' },
          96: { rating: 35, description: 'Blowing smoke' },
          97: { rating: 40, description: 'Blowing mist' },
          98: { rating: 45, description: 'Blowing fog' },
          99: { rating: 50, description: 'Blowing obscuration' },
        };

        weather.weatherCost =
          wmoHazardRatings[weather.weatherCode]?.rating || 0;
        weather.description =
          wmoHazardRatings[weather.weatherCode]?.description || 'Unknown';
        return weather;
      });

      const queryEdges = `
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

      const queryNodes = `
      UNWIND $weatherData AS weather
      MATCH (n:NAVAID)
      WHERE abs(n.latitude - weather.latitude) <= 0.5 AND abs(n.longitude - weather.longitude) <= 0.5
      SET n.weatherCode = weather.weatherCode
      SET n.cloudCover = weather.cloudCover
      SET n.temperature = weather.temperature
      SET n.windSpeed = weather.windSpeed
      SET n.description = weather.description;
      `;

      await this.neo4jService.write(queryNodes, {
        weatherData: transformedWeatherData,
      });

      await this.neo4jService.write(queryEdges, {
        weatherData: transformedWeatherData,
      });

      await delay(10000);
    }

    await this.reloadProjection();
  }
}
