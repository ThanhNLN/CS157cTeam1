import { Body, Controller, Post } from '@nestjs/common';
import { PathfinderService } from './pathfinder.service';

@Controller('pathfinder')
export class PathfinderController {
  constructor(private readonly pathfinderService: PathfinderService) {}

  @Post('/')
  async getPath(@Body('from') from: string, @Body('to') to: string) {
    return await this.pathfinderService.findPath(from, to);
  }
}
