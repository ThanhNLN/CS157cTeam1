import { Module } from '@nestjs/common';
import { WeatherHttpService } from './weather-http.service';

@Module({
  providers: [WeatherHttpService],
  exports: [WeatherHttpService],
})
export class WeatherHttpModule {}
