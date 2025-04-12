// Importing necessary modules from React and other libraries
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Main functional component
const Recommendations = () => {
  // State for storing fetched recommendation data
  const [recommendations, setRecommendations] = useState([]);
  // State for handling loading state
  const [loading, setLoading] = useState(true);
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Retrieving stored Spotify access token from localStorage
  const token = localStorage.getItem("spotify_token");

  // Effect hook to fetch recommendations when component mounts
  useEffect(() => {
    const fetchRecommendations = async () => {
      // If token is not found, redirect to home/login
      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true); // Start loading
        // Make API request to Spotify's recommendations endpoint
        const response = await axios.get(
          "https://api.spotify.com/v1/recommendations?limit=48",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Store the track recommendations in state
        setRecommendations(response.data.tracks);
        setLoading(false); // Stop loading after data is fetched
      } catch (error) {
        // If token is invalid/expired (401), clear local storage and redirect
        if (error.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
      }
    };

    // Call the fetch function
    fetchRecommendations();
  }, [token, navigate]);

  // Render loading screen while data is being fetched
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading your data...</p>
      </div>
    );
  }

  // Render the recommendations grid
  return (
    <div className="bg-black text-white min-h-screen p-6 font-sans">
      <h1 className="text-4xl font-bold mb-8">Your Recommendations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Map over each recommended track and display it */}
        {recommendations.map((track) => (
          <div
            key={track.id}
            className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
          >
            {/* Album artwork */}
            <img
              src={track.album.images[0]?.url}
              alt={track.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            {/* Track name */}
            <h3 className="text-lg font-bold">{track.name}</h3>
            {/* List of artist names */}
            <p className="text-sm text-gray-400">
              {track.artists.map((artist) => artist.name).join(", ")}
            </p>
            {/* Track duration in minutes */}
            <p className="text-sm text-gray-300">
              {Math.round(track.duration_ms / 60000)} minutes
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Exporting the component as default export
export default Recommendations;
