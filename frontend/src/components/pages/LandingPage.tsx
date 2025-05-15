// Import the navigation helper from react-router-dom
import { useNavigate } from "react-router-dom";

// Import the shared Navbar component
import Navbar from "../../components/organisms/Navbar";

export default function LandingPage() {
  // Hook to programmatically navigate to other routes (like /home)
  const navigate = useNavigate();

  return (
    <>
      {/* Top navigation bar with logo and tab links */}
      <Navbar />

      {/* Main landing content wrapper, centered both vertically and horizontally */}
      <div className="landing-wrapper">
        <div className="landing-content">
          {/* Logo image with text (uses name_logo.png from public folder) */}
          <img src="/name_logo.png" alt="AERONAV" className="landing-logo" />

          {/* Title headline for landing screen */}
          <h1 className="landing-title">
            Smart Flight Planning for Private Pilots
          </h1>

          {/* Subtitle or supporting description */}
          <p className="landing-subtitle">
            Get optimal routes, live weather, and traffic-based navigation with
            AERONAV.
          </p>

          {/* Call-to-action button to enter the main map planner */}
          <button
            className="landing-button"
            onClick={() => navigate("/home", { state: { sidebarOpen: true } })}
          >
            Start Planning →
          </button>
        </div>
      </div>
    </>
  );
}
