import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import SpotifyPlayer from "../components/SpotifyPlayer";

const Dashboard = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("short_term");
  const [trackUri, setTrackUri] = useState(null);
  const [activeTab, setActiveTab] = useState("tracks");
  const navigate = useNavigate();
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    const fetchData = async () => {
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
        setTopTracks(tracksResponse.data.items);

        const artistsResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=48`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopArtists(artistsResponse.data.items);

        const genreCounts = {};
        artistsResponse.data.items.forEach((artist) => {
          artist.genres.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        });

        const sortedGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([genre]) => genre);

        setGenres(sortedGenres);

        const recentlyPlayedResponse = await axios.get(
          "https://api.spotify.com/v1/me/player/recently-played?limit=48",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRecentlyPlayed(recentlyPlayedResponse.data.items);

        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
      }
    };

    fetchData();
  }, [token, timeRange, navigate]);

  const formatDuration = (durationMs) => {
    const durationInMinutes = Math.round(durationMs / 60000);
    return durationInMinutes;
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
      <h1 className="text-4xl font-bold mb-8">Welcome to Your Spotify Dashboard</h1>

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
        <button
          onClick={() => setActiveTab("recentlyPlayed")}
          className={`px-4 py-2 rounded ${
            activeTab === "recentlyPlayed" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          Recently Played
        </button>
      </div>

      <div className="mb-8 flex justify-center space-x-4">
        <Link to="/shareable-cards">
          <button className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-400">
            Shareable Cards
          </button>
        </Link>
      </div>

      <Link to="/playlist-generator">
  <button className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-400">
    Generate Personalized Playlist
  </button>
</Link>


      <SpotifyPlayer token={token} trackUri={trackUri} />

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
                <p className="text-sm text-gray-300">
                  {formatDuration(track.duration_ms)} minutes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {activeTab === "recentlyPlayed" && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recently Played Tracks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentlyPlayed.map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
                onClick={() => setTrackUri(item.track.uri)}
              >
                <img
                  src={item.track.album.images[0]?.url}
                  alt={item.track.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-bold">{item.track.name}</h3>
                <p className="text-sm text-gray-400">
                  {item.track.artists.map((artist) => artist.name).join(", ")}
                </p>
                <p className="text-sm text-gray-300">
                  {formatDuration(item.track.duration_ms)} minutes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
