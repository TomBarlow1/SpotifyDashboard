import { useEffect, useRef, useState } from "react";

const SpotifyPlayer = ({ token, trackUri }) => {
  const playerRef = useRef(null);
  const [playerState, setPlayerState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);

  // Handle player setup and state change
  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (!window.Spotify) {
        console.error("Spotify SDK failed to load.");
        return;
      }

      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => cb(token),
      });

      playerRef.current = player;

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setPlayerState(state);
        setIsPlaying(!state.paused);
        setProgress(state.position);
        setCurrentTrack(state.track_window.current_track);
      });

      player.connect();
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token]);

  // Play the track once the player is ready
  useEffect(() => {
    if (!deviceId || !trackUri) return;

    const play = async () => {
      try {
        await fetch("https://api.spotify.com/v1/me/player/play", {
          method: "PUT",
          body: JSON.stringify({ uris: [trackUri] }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Error playing track:", error);
      }
    };

    play();
  }, [trackUri, token, deviceId]);

  // Play/Pause functionality
  const handlePlayPause = () => {
    if (playerRef.current) {
      playerRef.current.togglePlay();
    }
  };

  // Progress bar change
  const handleProgressBarChange = (e) => {
    const value = e.target.value;
    setProgress(value);
    playerRef.current.seek(value);
  };

  // Format time for the progress bar
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  // Set up interval to update progress bar every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerState) {
        setProgress(playerState.position);
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup the interval on unmount or pause
  }, [playerState]);

  return (
    <div className="spotify-player fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center justify-between">
      <div className="album-cover">
        {currentTrack?.album?.images[0]?.url && (
          <img
            src={currentTrack.album.images[0].url}
            alt="Album cover"
            className="w-16 h-16 object-cover rounded"
          />
        )}
      </div>
      <div className="track-info flex flex-col items-center">
        <span className="track-name text-lg font-semibold">{currentTrack?.name}</span>
        <span className="track-artist text-sm">{currentTrack?.artists[0]?.name}</span>
      </div>
      <div className="controls flex items-center">
        <button onClick={handlePlayPause} className="button bg-green-500 text-white p-2 rounded-full">
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <div className="progress-container flex items-center w-full mx-4">
        <span className="time">{formatTime(progress)}</span>
        <input
          type="range"
          min="0"
          max={playerState?.duration || 1}  // Track duration should be used here
          value={progress}
          onChange={handleProgressBarChange}
          className="progress-bar mx-2 w-full"
        />
        <span className="time">{formatTime(playerState?.duration || 0)}</span>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
