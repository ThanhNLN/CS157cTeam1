# CS157cProject: Team project in NoSQL class at SJSU - Spring 2025

## Current Test Mode

### 1. Make sure Neo4j is installed and running locally:

    •	Visit http://localhost:7474 in your browser
    •	Login using your Neo4j credentials
    •	Keep the Neo4j server running

### 2. Create a .env file inside the backend/ folder with the following content:

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password-here
```

Replace your-password-here with your Neo4j password.
Make sure your Neo4j database is running locally on port 7687.

This .env file is required for the Flask backend to connect to the Neo4j database.
The .env file is excluded from Git using .gitignore, so each user must create their own.

### 3. Test run

Open a terminal and navigate to the backend/ folder.

1. Activate the virtual environment:
   `source venv/bin/activate`

2. Install all required Python packages (if not already installed):
   `pip install -r requirements.txt`

(Or install individually: flask, flask-cors, neo4j, requests, python-dotenv)

3. Run the Flask server:

`python app.py`

4. Open your browser and test the following routes:

   • http://127.0.0.1:5000/ → Should show: “Flight Planner Backend Running!”
   • http://127.0.0.1:5000/neo4j-test → Should return JSON confirming Neo4j connection
