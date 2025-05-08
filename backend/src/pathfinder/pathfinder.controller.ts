import { Controller, Get } from '@nestjs/common';

@Controller('pathfinder')
export class PathfinderController {
  @Get()
  getPath(): string {
    return 'This action returns all pathfinder resources';
  }
}
