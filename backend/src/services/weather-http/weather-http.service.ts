import { Injectable } from '@nestjs/common';

import * as fs from 'fs';

@Injectable()
export class WeatherHttpService {
  constructor() {}
  async getWeatherData(places: { lat: number; long: number }[]) {
    const lats = places.map((coords) => coords.lat).join(',');
    const longs = places.map((coords) => coords.long).join(',');
    const elevations = places.map((coords) => 2438).join(',');

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${longs}&elevation=${elevations}&hourly=weather_code,cloud_cover_high,temperature_180m,wind_speed_180m&forecast_days=1`,
    );

    return await res.json();
  }
}
