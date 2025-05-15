# ✈️ AERONAV – CS157C Team Project

**Smart Flight Planning Assistant**  
_San Jose State University – Spring 2025_

---

## 📖 Overview

**AERONAV** is a smart flight planning assistant designed for private pilots. It visualizes optimal flight routes by incorporating real-time weather data, airspace navigation info from the FAA, and intelligent graph-based pathfinding.

This project was developed by **Team 1** for the NoSQL course (CS157C) and demonstrates full-stack integration using **Neo4j**, **React**, and external aviation APIs.

---

## 🚀 Key Features

- ✈️ Graph-based flight routing using Neo4j (waypoints = nodes, airways = edges)
- 🌦️ Real-time weather data linked to routes by midpoint proximity (≤ 0.5° lat/lon)
- 📡 FAA airspace/navigation data loaded and mapped into Neo4j
- 🧠 Optimized routing via Dijkstra algorithm, factoring in weather
- 🖥️ Clean, interactive UI built with React, Vite, Tailwind, and Google Maps

---

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

### 4. Load FAA Navigation Data

    1.	Download data from the FAA NASR subscription page:

https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/ 2. Unzip the archive and copy the following files into:

```
backend/load_data/
├── APT.txt
├── AWY.txt
├── FIX.txt
└── STARDP.txt
```

    3.	Run the loader script (requires admin privileges):

```
cd backend/load_data
sudo bash load.sh
```

### 5. Run app

🔹 Backend Terminal

```
cd backend
pnpm install
pnpm run start
```

🔹 Frontend Terminal

```
cd frontend
pnpm install
pnpm run dev
```

### 🧠 How It Works (Backend Pipeline)

    1.	FAA nav data is parsed and loaded into a Neo4j graph
    •	Waypoints = nodes, Airways = edges
    2.	Each route segment (edge) is matched to weather data
    •	If the midpoint of an edge is within 0.5° of a weather event, it’s linked
    3.	A custom pathfinding algorithm (e.g. Dijkstra) runs in Neo4j
    •	Routes are scored based on length and weather severity
    4.	Results are sent to the frontend and visualized on a Google Map

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
