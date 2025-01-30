import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaylistGenerator = () => {
  const [userTracks, setUserTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("short_term");
  const [error, setError] = useState(null);
  const [mood, setMood] = useState("happy"); // Default mood
  const token = localStorage.getItem("spotify_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTracks = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=48`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Fetched User Tracks:", tracksResponse.data.items);
        setUserTracks(tracksResponse.data.items);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
        console.error("Error fetching user tracks:", error);
        setError("Failed to fetch user tracks.");
        setLoading(false);
      }
    };

    fetchUserTracks();
  }, [token, timeRange, navigate]);

  const generatePlaylist = async () => {
    if (userTracks.length === 0) {
      setError("No user tracks available to generate playlist.");
      console.error("No user tracks available.");
      return;
    }

    try {
      // Reduce the number of seed tracks to 10
      const trackIds = userTracks.slice(0, 10).map((track) => track.id).join(",");
      console.log("Track IDs:", trackIds); // Log track IDs for debugging

      // Get the mood valence
      const targetValence = getMoodValence(mood);
      console.log("Mood Valence:", targetValence); // Log mood valence for debugging

      // Log the full API URL
      const apiUrl = `https://api.spotify.com/v1/recommendations?seed_tracks=${trackIds}&limit=20&target_valence=${targetValence}`;
      console.log("API Request URL:", apiUrl);

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response Status:", response.status); // Log response status
      console.log("API Response Data:", response.data); // Log API data

      if (response.data && response.data.tracks && response.data.tracks.length > 0) {
        setPlaylist(response.data.tracks);
      } else {
        setError("Failed to generate playlist. No tracks found in response.");
        console.error("No tracks found in response.");
      }
    } catch (error) {
      console.error("Error generating playlist:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(`Error: ${error.response.data.error.message}`);
      } else {
        setError("Failed to generate playlist. Please try again.");
      }
    }
  };

  // Helper function to return the mood's corresponding valence
  const getMoodValence = (mood) => {
    switch (mood) {
      case "happy":
        return 0.8; // High energy, positive valence
      case "sad":
        return 0.2; // Low energy, negative valence
      case "energetic":
        return 0.9; // High energy, positive valence
      case "chill":
        return 0.4; // Low energy, positive valence
      default:
        return 0.5; // Neutral
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-8">Personalized Playlist Generator</h1>

      <div className="mb-8 flex justify-center space-x-4">
        {["short_term", "medium_term", "long_term"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded ${
              timeRange === range ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            {range === "short_term" ? "1 Week" : range === "medium_term" ? "4 Weeks" : "1 Year"}
          </button>
        ))}
      </div>

      <div className="mb-8 flex justify-center space-x-4">
        {["happy", "sad", "energetic", "chill"].map((moodOption) => (
          <button
            key={moodOption}
            onClick={() => setMood(moodOption)}
            className={`px-4 py-2 rounded ${
              mood === moodOption ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            {moodOption.charAt(0).toUpperCase() + moodOption.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <button
          onClick={generatePlaylist}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-400"
        >
          Generate Playlist
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Recommended Tracks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlist.map((track) => (
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
            </div>
          ))}
        </div>
      </div>

      {/* Button to navigate back to Dashboard */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/dashboard")} // Navigate back to the dashboard
          className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PlaylistGenerator;
