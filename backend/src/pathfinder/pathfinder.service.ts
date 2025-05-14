import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'src/services/neo4j/neo4j.service';

@Injectable()
export class PathfinderService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async findPath(from: string, to: string) {
    // const query = `
    //   MATCH (source:NAVAID {navaidId: '${from}'}), (target:NAVAID {navaidId: '${to}'})
    //   CALL gds.shortestPath.dijkstra.stream('airways', {
    //     sourceNode: id(source),
    //     targetNode: id(target),
    //     relationshipWeightProperty: 'totalCost'
    //   })
    //   YIELD index, sourceNode, targetNode, totalCost, nodeIds, costs
    //   WITH nodeIds, totalCost, costs,
    //     [nodeId IN nodeIds | gds.util.asNode(nodeId)] AS nodes
    //   UNWIND range(0, size(nodeIds) - 2) AS i
    //   MATCH (a)-[r:AIRWAY_ROUTE]->(b)
    //   WHERE id(a) = nodeIds[i] AND id(b) = nodeIds[i+1]
    //   WITH nodeIds, totalCost, costs, nodes, collect(r) AS rels
    //   WITH
    //     totalCost,
    //     reduce(d = 0.0, r IN rels | d + r.distance) AS totalDistance,
    //     costs,
    //     [n IN nodes | {
    //       navaidId: n.navaidId,
    //       longitude: n.longitude,
    //       latitude: n.latitude
    //     }] AS path
    //   RETURN totalCost, totalDistance, path, costs;
    // `;
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
            latitude: n.latitude
          }] AS path
      ORDER BY index;
    `

    const result = await this.neo4jService.read(query);
    // console.log(JSON.stringify(result));

    const totalCost = result.records[0].get('totalCost');
    const totalDistance = result.records[0].get('totalDistance');
    const path = result.records[0].get('path');
    const costs = result.records[0].get('costs');

    return { totalCost, totalDistance, path, costs };
  }
}
