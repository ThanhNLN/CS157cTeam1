import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'src/services/neo4j/neo4j.service';

@Injectable()
export class PathfinderService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findPath(from: string, to: string) {
    const query = `
      MATCH (source:NAVAID {navaidId: '${from}'}), (target:NAVAID {navaidId: '${to}'})
          CALL gds.shortestPath.dijkstra.stream('airways', {
          sourceNode: source,
          targetNodes: target,
          relationshipWeightProperty: 'distanceWeatherCost'
      })
      YIELD index, sourceNode, targetNode, totalCost, nodeIds, costs, path
      CALL (nodeIds) {
          UNWIND range(0, size(nodeIds)-1) AS i
          MATCH (a)-[r:AIRWAY_ROUTE]-(b)
          WHERE id(a) = nodeIds[i] AND id(b) = nodeIds[i+1]
          RETURN sum(r.distance) AS totalDistance
      }
      RETURN
          index,
          gds.util.asNode(sourceNode).name AS sourceNodeName,
          gds.util.asNode(targetNode).name AS targetNodeName,
          totalCost,
          totalDistance,
          [nodeId IN nodeIds | gds.util.asNode(nodeId).name] AS nodeNames,
          costs,
          [n IN nodes(path) | {
            navaidId: n.navaidId,
            longitude: n.longitude,
            latitude: n.latitude, 
            weatherCode: n.weatherCode, 
            cloudCover: n.cloudCover, 
            temperature: n.temperature, 
            windSpeed: n.windSpeed,
            description: n.description
          }] AS path
      ORDER BY index;
    `;

    const result = await this.neo4jService.read(query);
    if (result.records.length === 0) {
      return { code: 500, error: 'No path found' };
    }

    const totalCost = result.records[0].get('totalCost');
    const totalDistance = result.records[0].get('totalDistance');
    const path = result.records[0].get('path');
    const costs = result.records[0].get('costs');

    return { totalCost, totalDistance, path, costs };
  }

  async findPathNoWeather(from: string, to: string) {
    const query = `
      MATCH (source:NAVAID {navaidId: '${from}'}), (target:NAVAID {navaidId: '${to}'})
          CALL gds.shortestPath.dijkstra.stream('airways', {
          sourceNode: source,
          targetNodes: target,
          relationshipWeightProperty: 'distance'
      })
      YIELD index, sourceNode, targetNode, totalCost, nodeIds, costs, path
      CALL (nodeIds) {
          UNWIND range(0, size(nodeIds)-1) AS i
          MATCH (a)-[r:AIRWAY_ROUTE]-(b)
          WHERE id(a) = nodeIds[i] AND id(b) = nodeIds[i+1]
          RETURN sum(r.distance) AS totalDistance
      }
      RETURN
          index,
          gds.util.asNode(sourceNode).name AS sourceNodeName,
          gds.util.asNode(targetNode).name AS targetNodeName,
          totalCost,
          totalDistance,
          [nodeId IN nodeIds | gds.util.asNode(nodeId).name] AS nodeNames,
          costs,
          [n IN nodes(path) | {
            navaidId: n.navaidId,
            longitude: n.longitude,
            latitude: n.latitude, 
            weatherCode: n.weatherCode, 
            cloudCover: n.cloudCover, 
            temperature: n.temperature, 
            windSpeed: n.windSpeed,
            description: n.description
          }] AS path
      ORDER BY index;
    `;

    const result = await this.neo4jService.read(query);
    if (result.records.length === 0) {
      return { code: 500, error: 'No path found' };
    }

    const totalCost = result.records[0].get('totalCost');
    const totalDistance = result.records[0].get('totalDistance');
    const path = result.records[0].get('path');
    const costs = result.records[0].get('costs');

    return { totalCost, totalDistance, path, costs };
  }
}
