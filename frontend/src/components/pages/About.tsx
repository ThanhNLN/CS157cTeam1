// Import the shared Navbar component for consistent site navigation
import Navbar from "../../components/organisms/Navbar";

export default function About() {
  return (
    <>
      {/* Top navigation bar with logo and tab links */}
      <Navbar />

      {/* Main about page content */}
      <div className="about-container">
        {/* Page title */}
        <h1 className="about-title">About AERONAV</h1>

        {/* General description about the application */}
        <p className="about-paragraph">
          AERONAV is a smart flight planning assistant designed for private
          pilots. It helps visualize optimized flight routes based on real-time
          weather, air traffic data, and intelligent pathfinding.
        </p>

        {/* List of key features and technologies used */}
        <ul className="about-list">
          <li>
            ✈️ Graph-based flight routing using Neo4j (waypoints = nodes, routes
            = edges)
          </li>
          <li>
            🌦️ Real-time weather data is fetched and matched to routes based on
            midpoint proximity (within 0.5° lat/lon)
          </li>
          <li>
            📡 FAA airspace/navigation data is pulled and loaded into the system
            regularly
          </li>
          <li>
            🧠 Pathfinding algorithms (e.g., Dijkstra) compute optimal routes
            with weather awareness
          </li>
          <li>💻 Built with React (TypeScript) frontend and Node.js backend</li>
        </ul>

        {/* Credit or course reference */}
        <p className="about-paragraph">
          Developed by <strong>Team 1</strong> for <em>CS157C</em> at San Jose
          State University.
        </p>
      </div>
    </>
  );
}
