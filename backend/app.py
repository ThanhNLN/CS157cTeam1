from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allows frontend to talk to this backend

@app.route("/")
def home():
    return "🚀 Flight Planner Backend Running!"

if __name__ == "__main__":
    app.run(debug=True)