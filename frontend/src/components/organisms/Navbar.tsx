import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  // Define tab labels and routes
  const tabs = [
    { label: "Home", path: "/" }, // ➜ Landing Page
    { label: "Map", path: "/home" }, // ➜ Flight Planning Tool
    { label: "About", path: "/about" }, // ➜ Placeholder/About info
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Site logo and name wrapped in a Link to home */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="AERONAV Logo" className="navbar-logo" />
          <span className="navbar-title">AERONAV</span>
        </Link>
      </div>

      {/* Render buttons as <Link> for client-side navigation */}
      <div className="navbar-tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            to={tab.path}
            className={`navbar-tab-button ${
              location.pathname === tab.path ? "active-tab-button" : ""
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
