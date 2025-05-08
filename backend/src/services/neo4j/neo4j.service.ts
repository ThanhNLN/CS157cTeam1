import { Injectable } from '@nestjs/common';
import { QueryResult } from 'neo4j-driver';
import { Neo4jService as Neo4jBaseService, Transaction } from 'nest-neo4j/dist';

@Injectable()
export class Neo4jService {
  constructor(private readonly neo4jService: Neo4jBaseService) {}

  async deleteAll() {
    await this.neo4jService.write('MATCH (n) DETACH DELETE n', {});
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
