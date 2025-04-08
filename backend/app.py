
from services.neo4j_service import Neo4jService
from services.redis_service import RedisService
from flask import Flask
from dotenv import load_dotenv
import logging

load_dotenv(override=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname).4s - %(name)s - %(asctime)s - %(message)s"
)

app = Flask(__name__)
neo4jService = Neo4jService()
redisService = RedisService()

@app.route("/neo4j-test", methods=["GET"])
def neo4j_test():
    neo4jService.create("CREATE (n:TestNode {name: 'Test'})")
    redisService.set("test_key", "test_value")
    return redisService.get("test_key")


if __name__ == "__main__":
    app.run(debug=True)