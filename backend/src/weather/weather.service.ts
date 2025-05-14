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
        };

        // Weather Cost is a multiplier.
        const wmoHazardRatings = {
          // 00–09: Phenomena in the vicinity
          0: 1, // Cloud development not observed
          1: 2, // Cloud development observed
          2: 3, // State of sky on the whole unchanged
          3: 4, // State of sky on the whole becoming clearer
          4: 5, // State of sky on the whole becoming cloudier
          5: 10, // Thunderstorm within sight, no precipitation at station
          6: 12, // Duststorm or sandstorm within sight, no precipitation at station
          7: 15, // Blowing snow within sight, no precipitation at station
          8: 20, // Showers within sight, no precipitation at station
          9: 25, // Funnel cloud(s) within sight, no precipitation at station

          // 10–19: Obscuration
          10: 5, // Mist
          11: 10, // Patches of fog
          12: 15, // Continuous fog
          13: 20, // Lightning visible, no thunder heard
          14: 25, // Precipitation within sight, not reaching ground
          15: 30, // Precipitation within sight, reaching ground
          16: 35, // Thunderstorm within sight, no precipitation at station
          17: 40, // Thunderstorm within sight, precipitation at station
          18: 45, // Squalls
          19: 50, // Funnel cloud(s) observed

          // 20–29: Precipitation, fog, duststorms, etc.
          20: 5, // Drizzle, not freezing, intermittent
          21: 10, // Drizzle, not freezing, continuous
          22: 15, // Drizzle, freezing, slight
          23: 20, // Drizzle, freezing, moderate or heavy
          24: 25, // Drizzle and rain, slight
          25: 30, // Drizzle and rain, moderate or heavy
          26: 35, // Rain, not freezing, intermittent
          27: 40, // Rain, not freezing, continuous
          28: 45, // Rain, freezing, slight
          29: 50, // Rain, freezing, moderate or heavy

          // 30–39: Snow, ice pellets, etc.
          30: 5, // Snow, slight
          31: 10, // Snow, moderate or heavy
          32: 15, // Snow and rain, slight
          33: 20, // Snow and rain, moderate or heavy
          34: 25, // Ice pellets, slight
          35: 30, // Ice pellets, moderate or heavy
          36: 35, // Hail, slight
          37: 40, // Hail, moderate or heavy
          38: 45, // Snow grains, slight
          39: 50, // Snow grains, moderate or heavy

          // 40–49: Fog, duststorms, etc.
          40: 5, // Fog, visibility ≥ 1 km
          41: 10, // Fog, visibility < 1 km
          42: 15, // Fog, visibility < 500 m
          43: 20, // Fog, visibility < 200 m
          44: 25, // Fog, visibility < 50 m
          45: 30, // Duststorm, slight
          46: 35, // Duststorm, moderate
          47: 40, // Duststorm, severe
          48: 45, // Sandstorm, moderate
          49: 50, // Sandstorm, severe

          // 50–59: Rain
          50: 5, // Rain, slight
          51: 10, // Rain, moderate
          52: 15, // Rain, heavy
          53: 20, // Rain, very heavy
          54: 25, // Rain, torrential
          55: 30, // Rain, freezing, slight
          56: 35, // Rain, freezing, moderate
          57: 40, // Rain, freezing, heavy
          58: 45, // Rain and snow, slight
          59: 50, // Rain and snow, moderate or heavy

          // 60–69: Showers
          60: 5, // Rain shower(s), slight
          61: 10, // Rain shower(s), moderate
          62: 15, // Rain shower(s), heavy
          63: 20, // Rain shower(s), very heavy
          64: 25, // Rain shower(s), torrential
          65: 30, // Rain shower(s), freezing, slight
          66: 35, // Rain shower(s), freezing, moderate
          67: 40, // Rain shower(s), freezing, heavy
          68: 45, // Rain and snow shower(s), slight
          69: 50, // Rain and snow shower(s), moderate or heavy

          // 70–79: Snow showers
          70: 5, // Snow shower(s), slight
          71: 10, // Snow shower(s), moderate
          72: 15, // Snow shower(s), heavy
          73: 20, // Snow shower(s), very heavy
          74: 25, // Snow shower(s), torrential
          75: 30, // Snow shower(s), freezing, slight
          76: 35, // Snow shower(s), freezing, moderate
          77: 40, // Snow shower(s), freezing, heavy
          78: 45, // Snow and rain shower(s), slight
          79: 50, // Snow and rain shower(s), moderate or heavy

          // 80–89: Thunderstorms
          80: 5, // Thunderstorm, no precipitation
          81: 10, // Thunderstorm, slight rain
          82: 15, // Thunderstorm, moderate rain
          83: 20, // Thunderstorm, heavy rain
          84: 25, // Thunderstorm, very heavy rain
          85: 30, // Thunderstorm, torrential rain
          86: 35, // Thunderstorm, hail
          87: 40, // Thunderstorm, heavy hail
          88: 45, // Thunderstorm, severe
          89: 50, // Thunderstorm, extreme

          // 90–99: Miscellaneous
          90: 5, // No significant weather observed
          91: 10, // Blowing snow
          92: 15, // Blowing sand
          93: 20, // Blowing dust
          94: 25, // Blowing spray
          95: 30, // Blowing volcanic ash
          96: 35, // Blowing smoke
          97: 40, // Blowing mist
          98: 45, // Blowing fog
          99: 50, // Blowing obscuration
        };

        weather.weatherCost = wmoHazardRatings[weather.weatherCode] || 0;
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
