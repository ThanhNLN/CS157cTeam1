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
          AERONAV is a smart flight planning assistant designed for private pilots.
          It helps visualize optimized flight routes based on real-time weather, air traffic data,
          and intelligent pathfinding.
        </p>

        {/* List of key features and technologies used */}
        <ul className="about-list">
          <li>Graph-based flight routing powered by Neo4j</li>
          <li>Live weather overlays using aviation APIs</li>
          <li>Real-time air traffic integration</li>
          <li>Built with React (TypeScript) and Node.js backend</li>
        </ul>

        {/* Credit or course reference */}
        <p className="about-paragraph">
          Developed by <strong>Team 1</strong> for <em>CS157C</em> at San Jose State University.
        </p>
      </div>
    </>
  );
}