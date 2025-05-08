import { Module } from '@nestjs/common';
import { Neo4jModule as Neo4jBaseModule } from 'nest-neo4j/dist';
import { Neo4jService } from './neo4j.service';

@Module({
  imports: [
    Neo4jBaseModule.forRoot({
      scheme: 'neo4j',
      host: process.env.NEO4J_HOST ?? 'localhost',
      port: parseInt(process.env.NEO4J_PORT ?? '7687'),
      username: process.env.NEO4J_USERNAME ?? 'neo4j',
      password: process.env.NEO4J_PASSWORD ?? 'password',
    }),
  ],
  providers: [Neo4jService],
  exports: [Neo4jService],
})
export class Neo4jModule {}
