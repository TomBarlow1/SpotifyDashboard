import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SpotifyPlayer from "../components/SpotifyPlayer"; // Import the SpotifyPlayer component

const Dashboard = () => {
  // State variables to store top tracks, top artists, loading state, time range, and selected track URI
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("short_term"); // Default time range: short_term (1 week)
  const [trackUri, setTrackUri] = useState(null); // Track URI for playback
  const navigate = useNavigate(); // Use React Router's navigate function for page redirects
  const token = localStorage.getItem("spotify_token"); // Retrieve token from local storage

  // Fetch data when the component mounts or when the time range or token changes
  useEffect(() => {
    const fetchData = async () => {
      // If there's no token, redirect to the login page
      if (!token) {
        console.error("No token found! Redirecting to login...");
        navigate("/"); // Navigate to the login page
        return;
      }

      try {
        setLoading(true); // Set loading state to true when fetching data

        // Fetch top tracks based on the time range
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`,
          { headers: { Authorization: `Bearer ${token}` } } // Send token as Authorization header
        );
        setTopTracks(tracksResponse.data.items); // Set the top tracks in state

        // Fetch top artists based on the time range
        const artistsResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`,
          { headers: { Authorization: `Bearer ${token}` } } // Send token as Authorization header
        );
        setTopArtists(artistsResponse.data.items); // Set the top artists in state

        setLoading(false); // Set loading state to false after fetching data
      } catch (error) {
        console.error("Error fetching data:", error.response || error);
        if (error.response?.status === 401) {
          // If authentication error, remove token and navigate to login page
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
      }
    };

    fetchData(); // Call the fetchData function to get the top tracks and artists
  }, [token, timeRange, navigate]); // Dependencies: token, timeRange, navigate (re-fetch if any of these change)

  // Handler for when a track is clicked, to update the selected track URI for playback
  const handleTrackClick = (uri) => {
    setTrackUri(uri); // Update the track URI to the clicked track's URI
  };

  // If data is loading, show a loading message
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

      {/* Time Range Selector: Allows users to switch between "1 Week", "4 Weeks", and "1 Year" */}
      <div className="mb-8 flex justify-center space-x-4">
        {["short_term", "medium_term", "long_term"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)} // Update the time range state when clicked
            className={`px-4 py-2 rounded ${timeRange === range ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}
          >
            {range === "short_term" ? "1 Week" : range === "medium_term" ? "4 Weeks" : "1 Year"}
          </button>
        ))}
      </div>

      {/* Spotify Player: Displays the player to control playback */}
      <SpotifyPlayer token={token} trackUri={trackUri} />

      {/* Top Tracks Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Your Top Tracks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topTracks.map((track) => (
            <div
              key={track.id}
              className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
              onClick={() => handleTrackClick(track.uri)} // Set track URI when clicked
            >
              {/* Display track album image */}
              <img
                src={track.album.images[0]?.url}
                alt={track.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              {/* Track name and artist(s) */}
              <h3 className="text-lg font-bold">{track.name}</h3>
              <p className="text-sm text-gray-400">
                {track.artists.map((artist) => artist.name).join(", ")} {/* List of artists */}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Artists Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Top Artists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topArtists.map((artist) => (
            <div key={artist.id} className="bg-gray-800 p-4 rounded">
              {/* Display artist image */}
              <img
                src={artist.images[0]?.url}
                alt={artist.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              {/* Artist name and genres */}
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
