import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          "https://api.spotify.com/v1/recommendations?limit=48",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRecommendations(response.data.tracks);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
      }
    };

    fetchRecommendations();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-6 font-sans">
      <h1 className="text-4xl font-bold mb-8">Your Recommendations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendations.map((track) => (
          <div
            key={track.id}
            className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
          >
            <img
              src={track.album.images[0]?.url}
              alt={track.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h3 className="text-lg font-bold">{track.name}</h3>
            <p className="text-sm text-gray-400">
              {track.artists.map((artist) => artist.name).join(", ")}
            </p>
            <p className="text-sm text-gray-300">
              {Math.round(track.duration_ms / 60000)} minutes
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;