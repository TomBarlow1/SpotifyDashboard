import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  // State for storing top tracks and artists data
  const [topTracks, setTopTracks] = useState([]); // Stores the user's top tracks
  const [topArtists, setTopArtists] = useState([]); // Stores the user's top artists

  // State for managing loading status
  const [loading, setLoading] = useState(true); // True while data is loading, false when done

  // State for the selected time range (1 week, 4 weeks, or 1 year)
  const [timeRange, setTimeRange] = useState("short_term"); // Default is 1 week (short_term)

  // React Router's navigation hook
  const navigate = useNavigate();

  // Retrieve the Spotify token from localStorage
  const token = localStorage.getItem("spotify_token");

  // Fetch user data from Spotify API
  useEffect(() => {
    const fetchData = async () => {
      // Redirect to login if no token is found
      if (!token) {
        console.error("No token found! Redirecting to login...");
        navigate("/");
        return;
      }

      try {
        // Show loading state while fetching data
        setLoading(true);

        // Fetch the user's top tracks based on the selected time range
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTopTracks(tracksResponse.data.items); // Save tracks data to state

        // Fetch the user's top artists based on the selected time range
        const artistsResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTopArtists(artistsResponse.data.items); // Save artists data to state

        // Stop the loading spinner
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.response || error);

        // If the token has expired, clear it and redirect to login
        if (error.response?.status === 401) {
          console.error("Token expired. Redirecting to login...");
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
      }
    };

    fetchData(); // Call the function to fetch data
  }, [token, timeRange, navigate]); // Re-run the effect when token or timeRange changes

  // Show a loading message while fetching data
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      {/* Dashboard header */}
      <h1 className="text-4xl font-bold mb-8">Welcome to Your Spotify Dashboard</h1>

      {/* Time Range Selector */}
      <div className="mb-8 flex justify-center space-x-4">
        {[
          { label: "1 Week", value: "short_term" }, // Option for short-term data (1 week)
          { label: "4 Weeks", value: "medium_term" }, // Option for medium-term data (4 weeks)
          { label: "1 Year", value: "long_term" }, // Option for long-term data (1 year)
        ].map((range) => (
          <button
            key={range.value} // Unique key for each button
            onClick={() => setTimeRange(range.value)} // Update time range when button is clicked
            className={`px-4 py-2 rounded ${
              timeRange === range.value
                ? "bg-green-500 text-white" // Highlight the selected button
                : "bg-gray-700 text-gray-300" // Dim the unselected buttons
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Display Top Tracks */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Your Top Tracks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topTracks.map((track) => (
            <div key={track.id} className="bg-gray-800 p-4 rounded">
              {/* Album cover */}
              <img
                src={track.album.images[0]?.url} // Album image URL
                alt={track.name} // Track name as alt text
                className="w-full h-40 object-cover rounded mb-2"
              />
              {/* Track name */}
              <h3 className="text-lg font-bold">{track.name}</h3>
              {/* Track artists */}
              <p className="text-sm text-gray-400">
                {track.artists.map((artist) => artist.name).join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Display Top Artists */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Top Artists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topArtists.map((artist) => (
            <div key={artist.id} className="bg-gray-800 p-4 rounded">
              {/* Artist image */}
              <img
                src={artist.images[0]?.url} // Artist image URL
                alt={artist.name} // Artist name as alt text
                className="w-full h-40 object-cover rounded mb-2"
              />
              {/* Artist name */}
              <h3 className="text-lg font-bold">{artist.name}</h3>
              {/* Display up to 2 genres */}
              <p className="text-sm text-gray-400">{artist.genres.slice(0, 2).join(", ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
