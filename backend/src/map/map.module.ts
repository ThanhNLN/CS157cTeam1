import { Module } from '@nestjs/common';
import { Neo4jModule } from 'src/services/neo4j/neo4j.module';
import { Neo4jService } from 'src/services/neo4j/neo4j.service';
import { MapService } from './map.service';

@Module({
  imports: [Neo4jModule],
  providers: [MapService],
})
export class MapModule {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly mapService: MapService,
  ) {}
  async onModuleInit() {
    await this.neo4jService.deleteAll();
    await this.mapService.loadNodes();
    await this.mapService.loadEdges();
  }
}
