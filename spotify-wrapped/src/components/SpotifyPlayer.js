import { useEffect, useRef, useState } from "react";

const SpotifyPlayer = ({ token, trackUri }) => {
  const playerRef = useRef(null); // Reference to the player instance
  const [playerState, setPlayerState] = useState(null); // Track player state
  const [progress, setProgress] = useState(0); // Track song progress
  const [isPlaying, setIsPlaying] = useState(false); // Track whether song is playing
  const [seek, setSeek] = useState(0); // Store user-selected position on the progress bar
  const [currentTrack, setCurrentTrack] = useState(null); // Store current track details

  // Initialize the Spotify Web Playback SDK when token is available
  useEffect(() => {
    if (!token) return; // Return if there's no token

    // Create and load the Spotify Web Playback SDK script
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    // When the SDK is ready, initialize the player
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => cb(token),
      });

      playerRef.current = player; // Store the player instance in the reference

      // Listener to detect when the player is ready
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        localStorage.setItem("spotify_device_id", device_id); // Store device ID for later use
      });

      // Listener for when the player is not ready
      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      // Listener for player state changes (e.g., play, pause, track change)
      player.addListener("player_state_changed", (state) => {
        setPlayerState(state); // Update player state
        if (state) {
          setProgress(state.position); // Update the progress bar
          setIsPlaying(!state.paused); // Track play/pause state
          setCurrentTrack(state.track_window.current_track); // Set the current track details
        }
      });

      // Listeners for various errors
      player.addListener("initialization_error", ({ message }) => {
        console.error("Initialization Error:", message);
      });
      player.addListener("authentication_error", ({ message }) => {
        console.error("Authentication Error:", message);
      });
      player.addListener("account_error", ({ message }) => {
        console.error("Account Error:", message);
      });

      // Connect the player to Spotify
      player.connect();
    };

    return () => {
      document.body.removeChild(script); // Clean up by removing the script when the component unmounts
    };
  }, [token]); // Only run this effect when the token changes

  // Play the selected track when `trackUri` or `token` changes
  useEffect(() => {
    const playTrack = async () => {
      if (trackUri && playerRef.current) {
        const device_id = localStorage.getItem("spotify_device_id");
        if (!device_id) {
          console.error("Device ID not found. Player might not be ready.");
          return;
        }

        try {
          // Make a request to start playing the track using the device ID
          await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [trackUri] }), // Pass the track URI to play
          });
          console.log("Playing track:", trackUri);
        } catch (error) {
          console.error("Error playing track:", error);
        }
      }
    };

    playTrack();
  }, [trackUri, token]); // Re-run this effect when `trackUri` or `token` changes

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (isPlaying) {
      playerRef.current.pause(); // Pause the track if it's currently playing
    } else {
      playerRef.current.resume(); // Resume the track if it's currently paused
    }
  };

  // Handle the progress bar change
  const handleProgressBarChange = (event) => {
    const newPosition = event.target.value;
    setSeek(newPosition); // Set the new seek position
    if (playerRef.current) {
      playerRef.current.seek(newPosition); // Move the track to the new position
    }
  };

  // Handle skip forward
  const handleSkipForward = () => {
    if (playerRef.current) {
      playerRef.current.skipToNext(); // Skip to the next track in the queue
    }
  };

  // Handle skip backward
  const handleSkipBackward = () => {
    if (playerRef.current) {
      playerRef.current.skipToPrevious(); // Skip to the previous track in the queue
    }
  };

  // Format time in MM:SS format
  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000); // Calculate minutes
    const seconds = Math.floor((milliseconds % 60000) / 1000); // Calculate seconds
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`; // Return formatted time
  };

  return (
    <div className="spotify-player-ui">
      {/* Album Cover */}
      <div className="album-cover">
        {currentTrack && currentTrack.album && (
          <img
            src={currentTrack.album.images[0]?.url} // Get the album cover image URL
            alt={currentTrack.name} // Use the track name as alt text
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
          {isPlaying ? "Pause" : "Play"} {/* Toggle between play and pause */}
        </button>

        {/* Skip Forward Button */}
        <button onClick={handleSkipForward} className="button">
          &#9654; {/* Right arrow (skip forward) */}
        </button>
      </div>

      {/* Song Progress */}
      <div className="progress-container">
        <span className="time">{formatTime(progress)}</span> {/* Current progress */}
        <input
          type="range"
          min="0"
          max={playerState?.duration || 1} // Set the maximum to the track duration
          value={seek || progress} // Use `seek` value or `progress` for progress bar position
          onChange={handleProgressBarChange} // Update the position when the user moves the progress bar
          className="progress-bar"
        />
        <span className="time">{formatTime(playerState?.duration || 0)}</span> {/* Track duration */}
      </div>
    </div>
  );
};

export default SpotifyPlayer;
