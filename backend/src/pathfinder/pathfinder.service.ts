import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'src/services/neo4j/neo4j.service';

@Injectable()
export class PathfinderService {
  constructor(neo4jService: Neo4jService) {}
}
