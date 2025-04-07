# Initial file to test

from flask import Flask
from flask_cors import CORS
from routes.flight_plan import flight_plan_bp  # ✅ Import your route blueprint

app = Flask(__name__)
CORS(app)

# Register route blueprint here
app.register_blueprint(flight_plan_bp)

@app.route("/")
def home():
    return "Flight Planner Backend Running!"

if __name__ == "__main__":
    app.run(debug=True)