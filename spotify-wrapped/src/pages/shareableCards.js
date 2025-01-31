import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ShareableCards = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [minutesListened, setMinutesListened] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("medium_term"); // Default to 'medium_term'
  const navigate = useNavigate();  // useNavigate hook to navigate between pages
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);

        // Fetch Top 5 Tracks based on the selected time range
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopTracks(tracksResponse.data.items);

        // Fetch Top 5 Artists based on the selected time range
        const artistsResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopArtists(artistsResponse.data.items);

        // Fetch Total Minutes Listened (last 30 days)
        const historyResponse = await axios.get(
          `https://api.spotify.com/v1/me/player/recently-played?limit=48`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const totalMinutes = historyResponse.data.items.reduce((acc, item) => {
          const trackDuration = item.track.duration_ms / 60000; // Convert milliseconds to minutes
          return acc + trackDuration;
        }, 0);
        setMinutesListened(Math.round(totalMinutes));

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

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-6 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Shareable Stats</h1>

      <div className="mb-8 flex justify-center space-x-4">
        {["short_term", "medium_term", "long_term"].map((range) => (
          <button
            key={range}
            onClick={() => handleTimeRangeChange(range)}
            className={`px-4 py-2 rounded ${
              timeRange === range ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            {range === "short_term" ? "1 Week" : range === "medium_term" ? "4 Weeks" : "1 Year"}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Top 5 Tracks</h2>
        <div className="mb-4">
          {topTracks.map((track) => (
            <div key={track.id} className="flex items-center mb-2">
              <img
                src={track.album.images[0]?.url}
                alt={track.name}
                className="w-16 h-16 object-cover rounded-full mr-4"
              />
              <div>
                <h3 className="text-xl font-bold">{track.name}</h3>
                <p className="text-sm text-gray-400">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4">Top 5 Artists</h2>
        <div className="mb-4">
          {topArtists.map((artist) => (
            <div key={artist.id} className="flex items-center mb-2">
              <img
                src={artist.images[0]?.url}
                alt={artist.name}
                className="w-16 h-16 object-cover rounded-full mr-4"
              />
              <div>
                <h3 className="text-xl font-bold">{artist.name}</h3>
                <p className="text-sm text-gray-400">{artist.genres[0]}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4">Total Minutes Listened</h2>
        <p className="text-lg">{minutesListened} minutes</p>
      </div>

      {/* Back to Dashboard Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/dashboard")} // Navigate back to the dashboard
          className="px-6 py-3 bg-green-500 text-white font-bold rounded-md hover:bg-green-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ShareableCards;