import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SpotifyPlayer from "../components/SpotifyPlayer"; // Import the SpotifyPlayer component

const Dashboard = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("short_term");
  const [trackUri, setTrackUri] = useState(null); // Track URI for playback
  const navigate = useNavigate();
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("No token found! Redirecting to login...");
        navigate("/");
        return;
      }

      try {
        setLoading(true);

        // Fetch top tracks
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopTracks(tracksResponse.data.items);

        // Fetch top artists
        const artistsResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopArtists(artistsResponse.data.items);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.response || error);
        if (error.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
      }
    };

    fetchData();
  }, [token, timeRange, navigate]);

  // Track click handler
  const handleTrackClick = (uri) => {
    setTrackUri(uri); // Update track URI to play the selected track
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      {/* Dashboard Header */}
      <h1 className="text-4xl font-bold mb-8">Welcome to Your Spotify Dashboard</h1>

      {/* Time Range Selector */}
      <div className="mb-8 flex justify-center space-x-4">
        {["short_term", "medium_term", "long_term"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded ${timeRange === range ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}
          >
            {range === "short_term" ? "1 Week" : range === "medium_term" ? "4 Weeks" : "1 Year"}
          </button>
        ))}
      </div>

      {/* Spotify Player */}
      <SpotifyPlayer token={token} trackUri={trackUri} />

      {/* Top Tracks */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Your Top Tracks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topTracks.map((track) => (
            <div
              key={track.id}
              className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
              onClick={() => handleTrackClick(track.uri)} // Set URI when clicked
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

      {/* Top Artists */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Top Artists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topArtists.map((artist) => (
            <div key={artist.id} className="bg-gray-800 p-4 rounded">
              <img
                src={artist.images[0]?.url}
                alt={artist.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="text-lg font-bold">{artist.name}</h3>
              <p className="text-sm text-gray-400">{artist.genres.slice(0, 2).join(", ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
