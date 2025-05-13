import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { PathfinderModule } from './pathfinder/pathfinder.module';

@Module({
  imports: [WeatherModule, PathfinderModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
