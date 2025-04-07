# CS157cProject: Team project in NoSQL class at SJSU - Spring 2025

### Environment Setup (.env)

After cloning the project, create a file named .env inside the backend/ folder with the following content:

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password-here
```

Replace your-password-here with your Neo4j password.
Make sure your Neo4j database is running locally on port 7687.

This .env file is required for the Flask backend to connect to the Neo4j database.
The .env file is excluded from Git using .gitignore, so each user must create their own.
