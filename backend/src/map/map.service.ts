import { Injectable } from '@nestjs/common';
import { Node } from 'src/services/neo4j/dto/node.dto';

import * as fs from 'fs';
import * as path from 'path';
import { Neo4jService } from 'src/services/neo4j/neo4j.service';

@Injectable()
export class MapService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async loadNodes() {
    const navaidFile = fs.readFileSync(
      path.join(
        process.cwd(),
        'src',
        'services',
        'neo4j',
        'data',
        'navaid.csv',
      ),
      'utf-8',
    );

    const navaidLines = navaidFile.split('\n');
    const navaidHeaders = navaidLines[0].split(',');

    const nodes: Node[] = navaidLines.map((navaidLine) => {
      const fields = navaidLine.split(',');
      const navaidData = navaidHeaders.reduce(
        (acc, header, index) => {
          acc[header] = fields[index];
          return acc;
        },
        {} as Record<string, string>,
      );
      return {
        lat: parseFloat(navaidData.latitude),
        long: parseFloat(navaidData.longitude),
        id: navaidData['navaidId:ID'],
        name: navaidData.name,
        type: navaidData.use,
      };
    });

    const timepoints = nodes.flatMap((node) => {
      const timepointsPerNode: (Node & { time: number })[] = [];
      for (let i = 0; i < 12; i++) {
        timepointsPerNode.push({
          ...node,
          time: i,
        });
      }
      return timepointsPerNode;
    });

    const query = `
      UNWIND $timepoints AS timepoint
      CREATE (t:Timepoint {
      id: timepoint.id,
      name: timepoint.name,
      type: timepoint.type,
      lat: timepoint.lat,
      long: timepoint.long,
      time: timepoint.time
      })
    `;

    await this.neo4jService.write(query, { timepoints });
  }

  async loadEdges() {
    const airwayFile = fs.readFileSync(
      path.join(
        process.cwd(),
        'src',
        'services',
        'neo4j',
        'data',
        'airway.csv',
      ),
      'utf-8',

      // for each edge, see how long it would take
      // for each start node, add that edge to node with start node time + how long it would take
    );
  }
}
