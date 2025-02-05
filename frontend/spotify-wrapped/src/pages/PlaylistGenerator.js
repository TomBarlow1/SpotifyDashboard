import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SpotifyPlayer from "../components/SpotifyPlayer"; // Import the SpotifyPlayer component

const PlaylistGenerator = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);
  const [userTracks, setUserTracks] = useState([]);
  const [generatedPlaylist, setGeneratedPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackUri, setTrackUri] = useState(null); // Store the URI of the selected track to play
  const token = localStorage.getItem("spotify_token");
  const navigate = useNavigate();

  // Fetch user playlists
  useEffect(() => {
    const fetchUserPlaylists = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const playlistsResponse = await axios.get("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPlaylists(playlistsResponse.data.items);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
        console.error("Error fetching user playlists:", error);
        setError("Failed to fetch user playlists.");
        setLoading(false);
      }
    };

    fetchUserPlaylists();
  }, [token, navigate]);

  // Fetch user top tracks
  useEffect(() => {
    const fetchUserTracks = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=48`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
  }, [token, navigate]);

  // Fetch playlist tracks
  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const tracksResponse = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedPlaylistTracks(tracksResponse.data.items);
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
      setError("Failed to fetch playlist tracks.");
    }
  };

  // Handle track selection to play the song
  const handleTrackClick = (trackUri) => {
    setTrackUri(trackUri); // Set the URI of the selected track
  };

  // Generate a playlist based on user tracks (for example, top tracks)
  const generatePlaylist = () => {
    if (userTracks.length > 0) {
      // Randomly select a few tracks (e.g., 10) from the user's top tracks
      const randomTracks = userTracks
        .sort(() => 0.5 - Math.random()) // Shuffle the array
        .slice(0, 10); // Select the first 10 tracks after shuffling

      setGeneratedPlaylist(randomTracks); // Set the generated playlist
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      {/* Back to Dashboard Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300 mb-6"
      >
        Back to Dashboard
      </button>

      <h1 className="text-4xl font-bold mb-8">Your Playlists & Generated Playlist</h1>

      {/* Error handling */}
      {error && (
        <div className="text-red-500 mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Playlists */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Your Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
              onClick={() => fetchPlaylistTracks(playlist.id)}
            >
              <img
                src={playlist.images[0]?.url}
                alt={playlist.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="text-lg font-bold">{playlist.name}</h3>
              <p className="text-sm text-gray-400">{playlist.owner.display_name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spotify Player - Move it here to appear below playlists */}
      {trackUri && <SpotifyPlayer token={token} trackUri={trackUri} />}

      {/* Selected Playlist Tracks */}
      {selectedPlaylistTracks.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Tracks in Playlist</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedPlaylistTracks.map((track) => (
              <div
                key={track.track.id}
                className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
                onClick={() => handleTrackClick(track.track.uri)} // Pass track URI to the player
              >
                <img
                  src={track.track.album.images[0]?.url}
                  alt={track.track.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-bold">{track.track.name}</h3>
                <p className="text-sm text-gray-400">
                  {track.track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Playlist */}
      <div className="mb-8">
        <button
          onClick={generatePlaylist}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-300"
        >
          Generate Playlist from Top Tracks
        </button>
      </div>

      {/* Display Generated Playlist */}
      {generatedPlaylist.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Generated Playlist</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generatedPlaylist.map((track) => (
              <div
                key={track.id}
                className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
                onClick={() => handleTrackClick(track.uri)} // Pass track URI to the player
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
    </div>
  );
};

export default PlaylistGenerator;
