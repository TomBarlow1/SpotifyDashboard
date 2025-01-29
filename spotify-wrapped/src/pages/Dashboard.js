import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SpotifyPlayer from "../components/SpotifyPlayer";

const Dashboard = () => {
  // State variables to store top tracks, top artists, genres, loading state, time range, and selected track URI
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("short_term");
  const [trackUri, setTrackUri] = useState(null);
  const [activeTab, setActiveTab] = useState("tracks"); // State to manage active tab selection
  const navigate = useNavigate();
  const token = localStorage.getItem("spotify_token"); // Retrieve Spotify token from local storage

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/"); // Redirect to home if token is not available
        return;
      }

      try {
        setLoading(true);

        // Fetch top tracks from Spotify API
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=48`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopTracks(tracksResponse.data.items);

        // Fetch top artists from Spotify API
        const artistsResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=48`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopArtists(artistsResponse.data.items);

        // Process genres from top artists and count occurrences
        const genreCounts = {};
        artistsResponse.data.items.forEach((artist) => {
          artist.genres.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        });

        // Sort genres by frequency and update state
        const sortedGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([genre]) => genre);

        setGenres(sortedGenres);
        setLoading(false);
      } catch (error) {
        // Handle authentication error and redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
      }
    };

    fetchData();
  }, [token, timeRange, navigate]); // Re-fetch data when token or time range changes

  // Display loading screen while fetching data
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-8">Welcome to Your Spotify Dashboard</h1>

      {/* Time range selection buttons */}
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

      {/* Tab selection buttons */}
      <div className="mb-8 flex justify-center space-x-4">
        <button
          onClick={() => setActiveTab("tracks")}
          className={`px-4 py-2 rounded ${
            activeTab === "tracks" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          Top Tracks
        </button>
        <button
          onClick={() => setActiveTab("genres")}
          className={`px-4 py-2 rounded ${
            activeTab === "genres" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          Top Genres
        </button>
        <button
          onClick={() => setActiveTab("artists")}
          className={`px-4 py-2 rounded ${
            activeTab === "artists" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          Top Artists
        </button>
      </div>

      {/* Spotify Player component */}
      <SpotifyPlayer token={token} trackUri={trackUri} />

      {/* Display top tracks */}
      {activeTab === "tracks" && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Your Top Tracks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topTracks.map((track) => (
              <div
                key={track.id}
                className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
                onClick={() => setTrackUri(track.uri)}
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
      )}

      {/* Display top genres */}
      {activeTab === "genres" && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Your Top Genres</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-semibold"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Display top artists */}
      {activeTab === "artists" && (
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
      )}
    </div>
  );
};

export default Dashboard;
