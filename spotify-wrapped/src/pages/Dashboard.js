// React core hooks and libraries
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Modal from 'react-modal';

// Custom components
import SongInfo from './SongInfo'; // Displays detailed track info in modal
import SpotifyPlayer from '../components/SpotifyPlayer'; // Embedded Spotify player

// For screen readers and accessibility
Modal.setAppElement('#root');

const Dashboard = () => {
  // Define all the local state variables
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("short_term"); // time range for stats
  const [activeTab, setActiveTab] = useState("tracks"); // which tab is active
  const [modalIsOpen, setModalIsOpen] = useState(false); // control song info modal
  const [selectedTrack, setSelectedTrack] = useState(null); // which track was clicked
  const [playTrack, setPlayTrack] = useState(null); // track to play in embedded player
  const [trackAction, setTrackAction] = useState(null); // dropdown action for track

  const navigate = useNavigate();

  // Get token and user info from localStorage
  const token = localStorage.getItem("spotify_token");
  const userId = localStorage.getItem("user_id");

  // Fetch data when component mounts or timeRange changes
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/"); // redirect to login if token is missing
        return;
      }

      try {
        setLoading(true); // show loading screen

        // Fetch top tracks
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=48`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopTracks(tracksResponse.data.items);

        // Fetch top artists
        const artistsResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=48`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopArtists(artistsResponse.data.items);

        // Count genres based on top artists
        const genreCounts = {};
        artistsResponse.data.items.forEach((artist) => {
          artist.genres.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        });

        // Sort and store top genres
        const sortedGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([genre]) => genre);
        setGenres(sortedGenres);

        // Fetch recently played tracks
        const recentlyPlayedResponse = await axios.get(
          "https://api.spotify.com/v1/me/player/recently-played?limit=48",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRecentlyPlayed(recentlyPlayedResponse.data.items);

        // Fetch liked songs
        const likedSongsResponse = await axios.get(
          "https://api.spotify.com/v1/me/tracks?limit=48",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLikedSongs(likedSongsResponse.data.items);

        setLoading(false); // hide loading screen
      } catch (error) {
        // Handle token expiration or fetch errors
        if (error.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
      }
    };

    fetchData();
  }, [token, timeRange, navigate, userId]);

  // Format duration from milliseconds to minutes
  const formatDuration = (durationMs) => {
    return Math.round(durationMs / 60000);
  };

  // When a user clicks on a track card
  const handleTrackClick = (track) => {
    setSelectedTrack(track);
    setTrackAction(null); // Reset action dropdown
  };

  // Handle dropdown action (play song or open modal)
  const handleActionChange = (e) => {
    const action = e.target.value;
    setTrackAction(action);

    if (action === "play") {
      setPlayTrack(selectedTrack);
    } else if (action === "modal") {
      setModalIsOpen(true);
    }
  };

  // Close song info modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTrack(null);
  };

  // Show loading screen while fetching data
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-6 font-sans flex">
      {/* Sidebar navigation */}
      <div className="w-1/4 pr-4">
        <h1 className="text-4xl font-bold mb-8">Your Spotify Dashboard</h1>

        {/* Time range selector */}
        <div className="mb-8">
          {["short_term", "medium_term", "long_term"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`block w-full text-left px-4 py-2 rounded mb-2 ${
                timeRange === range ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              {range === "short_term" ? "1 Week" : range === "medium_term" ? "4 Weeks" : "1 Year"}
            </button>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="mb-8">
          {[
            { id: "tracks", label: "Top Tracks" },
            { id: "genres", label: "Top Genres" },
            { id: "artists", label: "Top Artists" },
            { id: "recentlyPlayed", label: "Recently Played" },
            { id: "likedSongs", label: "Liked Songs" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`block w-full text-left px-4 py-2 rounded mb-2 ${
                activeTab === id ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Navigation links to other features */}
        <div className="mb-8">
          {[
            { to: "/shareable-cards", label: "Shareable Cards" },
            { to: "/playlist-generator", label: "Playlist Generator" },
            { to: "/music-quiz", label: "Music Quiz" },
            { to: "/awards", label: "Awards" },
          ].map(({ to, label }) => (
            <Link key={to} to={to}>
              <button className="block w-full text-left px-4 py-2 rounded mb-2 bg-blue-500 text-white hover:bg-blue-400">
                {label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="w-3/4">
        {/* Top Tracks Tab */}
        {activeTab === "tracks" && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Your Top Tracks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topTracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
                  onClick={() => handleTrackClick(track)}
                >
                  <img src={track.album.images[0]?.url} alt={track.name} className="w-full h-40 object-cover rounded mb-2" />
                  <h3 className="text-lg font-bold">{track.name}</h3>
                  <p className="text-sm text-gray-400">{track.artists.map((artist) => artist.name).join(", ")}</p>
                  <p className="text-sm text-gray-300">{formatDuration(track.duration_ms)} minutes</p>
                  
                  {/* Dropdown to trigger play or modal */}
                  {selectedTrack === track && (
                    <select
                      value={trackAction || ""}
                      onChange={handleActionChange}
                      className="mt-2 bg-gray-700 text-white p-2 rounded"
                    >
                      <option value="">Select Action</option>
                      <option value="play">Play Song</option>
                      <option value="modal">Open Song info</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs follow same structure */}
        {activeTab === "genres" && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Your Top Genres</h2>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre, index) => (
                <span key={index} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-semibold">
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
                  <img src={artist.images[0]?.url} alt={artist.name} className="w-full h-40 object-cover rounded mb-2" />
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
                <div key={index} className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
                  onClick={() => handleTrackClick(item.track)}
                >
                  <img src={item.track.album.images[0]?.url} alt={item.track.name} className="w-full h-40 object-cover rounded mb-2" />
                  <h3 className="text-lg font-bold">{item.track.name}</h3>
                  <p className="text-sm text-gray-400">{item.track.artists.map((artist) => artist.name).join(", ")}</p>
                  <p className="text-sm text-gray-300">{formatDuration(item.track.duration_ms)} minutes</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "likedSongs" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Liked Songs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {likedSongs.map((item) => (
                <div key={item.track.id} className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
                  onClick={() => handleTrackClick(item.track)}
                >
                  <img src={item.track.album.images[0]?.url} alt={item.track.name} className="w-full h-40 object-cover rounded mb-2" />
                  <h3 className="text-lg font-bold">{item.track.name}</h3>
                  <p className="text-sm text-gray-400">{item.track.artists.map((artist) => artist.name).join(", ")}</p>
                  <p className="text-sm text-gray-300">Added on: {new Date(item.added_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Song Info Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Song Info"
        className="modal"
        overlayClassName="overlay"
      >
        {selectedTrack && <SongInfo track={selectedTrack} />}
      </Modal>

      {/* Embedded Spotify Player */}
      <SpotifyPlayer token={token} trackUri={playTrack?.uri} />
    </div>
  );
};

export default Dashboard;
