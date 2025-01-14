import { useEffect, useRef, useState } from "react";

const SpotifyPlayer = ({ token, trackUri }) => {
  const playerRef = useRef(null);
  const [playerState, setPlayerState] = useState(null);
  const [progress, setProgress] = useState(0); // Track song progress
  const [isPlaying, setIsPlaying] = useState(false); // Track whether song is playing
  const [seek, setSeek] = useState(0); // Store user-selected position on the progress bar
  const [currentTrack, setCurrentTrack] = useState(null); // Store current track details

  // Initialize player when token is available
  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => cb(token),
      });

      playerRef.current = player;

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        localStorage.setItem("spotify_device_id", device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        setPlayerState(state); // Update player state
        if (state) {
          setProgress(state.position);
          setIsPlaying(!state.paused); // Update play/pause state
          setCurrentTrack(state.track_window.current_track); // Update current track info
        }
      });

      player.addListener("initialization_error", ({ message }) => {
        console.error("Initialization Error:", message);
      });

      player.addListener("authentication_error", ({ message }) => {
        console.error("Authentication Error:", message);
      });

      player.addListener("account_error", ({ message }) => {
        console.error("Account Error:", message);
      });

      player.connect();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [token]);

  // Play the selected track
  useEffect(() => {
    const playTrack = async () => {
      if (trackUri && playerRef.current) {
        const device_id = localStorage.getItem("spotify_device_id");
        if (!device_id) {
          console.error("Device ID not found. Player might not be ready.");
          return;
        }

        try {
          await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [trackUri] }),
          });
          console.log("Playing track:", trackUri);
        } catch (error) {
          console.error("Error playing track:", error);
        }
      }
    };

    playTrack();
  }, [trackUri, token]);

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.resume();
    }
  };

  // Handle skipping to a specific time
  const handleProgressBarChange = (event) => {
    const newPosition = event.target.value;
    setSeek(newPosition);
    if (playerRef.current) {
      playerRef.current.seek(newPosition);
    }
  };

  // Handle skip forward
  const handleSkipForward = () => {
    if (playerRef.current) {
      playerRef.current.skipToNext();
    }
  };

  // Handle skip backward
  const handleSkipBackward = () => {
    if (playerRef.current) {
      playerRef.current.skipToPrevious();
    }
  };

  // Format time into MM:SS format
  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  return (
    <div className="spotify-player-ui">
      {/* Album Cover */}
      <div className="album-cover">
        {currentTrack && currentTrack.album && (
          <img
            src={currentTrack.album.images[0]?.url}
            alt={currentTrack.name}
            className="w-32 h-32 rounded-full"
          />
        )}
      </div>

      {/* Controls */}
      <div className="controls flex justify-between items-center mb-4">
        {/* Skip Backward Button */}
        <button onClick={handleSkipBackward} className="button">
          &#9664; {/* Left arrow (skip backward) */}
        </button>

        {/* Play/Pause Button */}
        <button onClick={handlePlayPause} className="button">
          {isPlaying ? "Pause" : "Play"}
        </button>

        {/* Skip Forward Button */}
        <button onClick={handleSkipForward} className="button">
          &#9654; {/* Right arrow (skip forward) */}
        </button>
      </div>

      {/* Song Progress */}
      <div className="progress-container">
        <span className="time">{formatTime(progress)}</span>
        <input
          type="range"
          min="0"
          max={playerState?.duration || 1}
          value={seek || progress}
          onChange={handleProgressBarChange}
          className="progress-bar"
        />
        <span className="time">{formatTime(playerState?.duration || 0)}</span>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
