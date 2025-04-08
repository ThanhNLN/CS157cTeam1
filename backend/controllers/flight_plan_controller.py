# Set up API route here
# Temporary test file 

from flask import Blueprint, request, jsonify

flight_plan_bp = Blueprint("flight_plan", __name__)

@flight_plan_bp.route("/api/flight-plan", methods=["POST"])
def generate_flight_plan():
    data = request.get_json()
    origin = data.get("origin")
    destination = data.get("destination")

    return jsonify({
        "message": "Flight plan received",
        "from": origin,
        "to": destination
    })