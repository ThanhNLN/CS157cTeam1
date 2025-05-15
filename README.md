# CS157cProject: Team project in NoSQL class at SJSU - Spring 2025

## 🛠️ Setup Instructions

### 1. Make sure Neo4j is installed and running locally:

    •	Visit http://localhost:7474 in your browser
    •	Login using your Neo4j credentials
    •	Keep the Neo4j server running

### 2. Create a .env file inside the backend/ folder with the following content:

```
NEO4J_HOST=localhost
NEO4J_PORT=7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password-here

RESET_DATABASE=true
```

Replace your-password-here with your Neo4j password.
Make sure your Neo4j database is running locally on port 7687.

This .env file is required for the backend to connect to the Neo4j database.
The .env file is excluded from Git using .gitignore, so each user must create their own.

### 3. Create a .env file inside the frontend/ folder with the following content:

```
VITE_GOOGLE_MAPS_API_KEY=your-map-api-key-here
VITE_BACKEND_URL=http://localhost:3000
```

Replace your-password-here with your Google Map API password.
Make sure your API Key is enable for Java

This .env file is required for the backend to connect to the Neo4j database.
The .env file is excluded from Git using .gitignore, so each user must create their own.

### 4. Load neccesary files

Follow link

```
https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/
```

Download the Current Subscription (e.g. Subscription effective April 17, 2025)
Unzip and move 4 files

```
APT.txt
AWY.txt
FIX.txt
STARDP.txt
```

into the project directory backend/load_data

Run the backend/load_data/load.sh with administrator permission
`sudo bash load.sh`

### Run app

On backend terminal run

```
install pnpm
pnpm run start
```

On frontend terminal run

```
install pnpm
pnpm run dev
```

### 🧰 Tech Stack

## Frontend

    •	React + TypeScript + Vite
    •	Tailwind CSS
    •	React Router DOM
    •	TanStack React Query
    •	@vis.gl/react-google-maps

## Backend

    •	Node.js + NestJS
    •	Neo4j (graph database)
    •	Weather and traffic API integration
