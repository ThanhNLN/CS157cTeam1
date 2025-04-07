
from dotenv import load_dotenv
import os
from services.neo4j_service import Neo4jService
from flask import Flask
from flask_cors import CORS
from routes.flight_plan import flight_plan_bp  # Import the route blueprint

app = Flask(__name__)

# Load env for environment credential
load_dotenv()

# Initialize Neo4j connection
neo4j = Neo4jService(
    uri=os.getenv("NEO4J_URI"),
    user=os.getenv("NEO4J_USER"),
    password=os.getenv("NEO4J_PASSWORD")
)

CORS(app)

# Register route blueprint here
app.register_blueprint(flight_plan_bp)

@app.route("/")
def home():
    return "Flight Planner Backend Running!"


@app.route("/neo4j-test")
def neo4j_test():
    try:
        msg = neo4j.test_connection()
        print(f"Neo4j test message: {msg}")
        return {"status": "success", "message": msg}
    except Exception as e:
        print(f"Neo4j connection error: {e}")
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    app.run(debug=True)