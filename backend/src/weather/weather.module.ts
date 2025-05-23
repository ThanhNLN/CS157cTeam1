import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Neo4jModule } from 'src/services/neo4j/neo4j.module';
import { WeatherHttpModule } from 'src/services/weather-http/weather-http.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [Neo4jModule, WeatherHttpModule, ScheduleModule.forRoot()],
  providers: [WeatherService],
})
export class WeatherModule {
  constructor(private readonly weatherService: WeatherService) {}

  async onModuleInit() {
    // await this.weatherService.syncWeatherData();
    await this.weatherService.reloadProjection();
  }
}
