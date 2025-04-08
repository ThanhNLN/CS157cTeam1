from neo4j import GraphDatabase
import os
from threading import Lock
import logging


logger = logging.getLogger(__name__)
class Neo4jService:
    # static variables, singleton for db thread safety
    _instance = None
    _lock = Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                logger.log(20, 'Creating new Neo4jService instance')
                cls._instance = super(Neo4jService, cls).__new__(cls)

                uri = os.getenv("NEO4J_URI")
                user = os.getenv("NEO4J_USER")
                password = os.getenv("NEO4J_PASSWORD")

                cls.driver = GraphDatabase.driver(uri, auth=(user, password))
        return cls._instance

    def create(self, query, parameters=None):
        with self.driver.session() as session:
            return session.execute_write(self._execute_query, query, parameters)

    def read(self, query, parameters=None):
        with self.driver.session() as session:
            return session.execute_read(self._execute_query, query, parameters)

    def update(self, query, parameters=None):
        with self.driver.session() as session:
            return session.execute_write(self._execute_query, query, parameters)

    def delete(self, query, parameters=None):
        with self.driver.session() as session:
            return session.execute_write(self._execute_query, query, parameters)

    @staticmethod
    def _execute_query(tx, query, parameters):
        result = tx.run(query, parameters or {})
        return [record.data() for record in result]