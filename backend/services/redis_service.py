import redis
import os
from threading import Lock
import logging


logger = logging.getLogger(__name__)

class RedisService:
  # static variables, singleton for thread safety
  _instance = None
  _lock = Lock()

  def __new__(cls):
    with cls._lock:
      if cls._instance is None:
        logger.log(20, 'Creating new RedisService instance')
        cls._instance = super(RedisService, cls).__new__(cls)

        host = os.getenv("REDIS_HOST", "localhost")
        port = int(os.getenv("REDIS_PORT", 6379))
        password = os.getenv("REDIS_PASSWORD", None)

        cls.client = redis.StrictRedis(
          host=host,
          port=port,
          # password=password,
          decode_responses=True
        )
    return cls._instance

  def set(self, key, value, ex=None):
    return self.client.set(key, value, ex=ex)

  def get(self, key):
    return self.client.get(key)

  def delete(self, key):
    return self.client.delete(key)

  def exists(self, key):
    return self.client.exists(key)