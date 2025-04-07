from neo4j import GraphDatabase

class Neo4jService:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def test_connection(self):
        with self.driver.session() as session:
            result = session.run("RETURN 'Connected to Neo4j!' AS message")
            return result.single()["message"]