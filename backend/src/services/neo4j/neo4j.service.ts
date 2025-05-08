import { Injectable } from '@nestjs/common';
import { QueryResult } from 'neo4j-driver';
import { Neo4jService as Neo4jBaseService, Transaction } from 'nest-neo4j/dist';

@Injectable()
export class Neo4jService {
  constructor(private readonly neo4jService: Neo4jBaseService) {}

  async deleteAll() {
    const numberOfNodes = await this.neo4jService.read(
      'MATCH (p:NAVAID) RETURN count(p) as count',
    );
    const count = numberOfNodes.records[0].get('count').toInt();

    await Promise.all(
      Array.from({ length: count / 10 + 1 }).map(() =>
        this.neo4jService.write(`MATCH (p:NAVAID)
          WITH p
          LIMIT 100000
          DELETE p`),
      ),
    );
    console.log('All nodes and relationships deleted');
  }

  async getAll() {
    const result = await this.neo4jService.read('MATCH (p:NAVAID) RETURN p');
    return result.records.map((record) => record.get('p').properties);
  }

  async write(
    cypher: string,
    params?: Record<string, any>,
    databaseOrTransaction?: string | Transaction,
  ) {
    return await this.neo4jService.write(cypher, params, databaseOrTransaction);
  }

  async read(
    cypher: string,
    params?: Record<string, any>,
    databaseOrTransaction?: string | Transaction,
  ): Promise<QueryResult> {
    return await this.neo4jService.read(cypher, params, databaseOrTransaction);
  }
}
