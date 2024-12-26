import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const token = hash
      .substring(1)
      .split("&")
      .find((item) => item.startsWith("access_token"))
      ?.split("=")[1];

    if (token) {
      // Save token to localStorage or state
      localStorage.setItem("spotify_token", token);
      navigate("/dashboard"); // Redirect to dashboard
    }
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <p>Redirecting...</p>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
