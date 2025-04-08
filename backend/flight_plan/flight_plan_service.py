from services.neo4j_service import Neo4jService
from services.redis_service import RedisService

class TrafficService:
    neo4j_service = Neo4jService()
    redis_service = RedisService()
