import { Module } from '@nestjs/common';
import { PathfinderController } from './pathfinder.controller';
import { PathfinderService } from './pathfinder.service';
import { Neo4jModule } from 'src/services/neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule],
  providers: [PathfinderService],
  controllers: [PathfinderController],
})
export class PathfinderModule {}
