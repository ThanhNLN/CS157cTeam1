// Added React Query and React Router imports
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import pages
import LandingPage from "./components/pages/LandingPage";
import Home from "./components/pages/Home";
import About from "./components/pages/About"; 

// Initialize a new query client
const client = new QueryClient();

export default function App() {
  return (
    // Provide QueryClient to the app for data fetching
    <QueryClientProvider client={client}>
      {/* Wrap app in BrowserRouter to enable routing */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
