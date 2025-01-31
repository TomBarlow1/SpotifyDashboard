import { useEffect, useRef, useState } from "react";

const SpotifyPlayer = ({ token, trackUri }) => {
  const playerRef = useRef(null);
  const [playerState, setPlayerState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;

        setPlayerState(state);
        setIsPlaying(!state.paused);
        setProgress(state.position);
      });

      player.connect();
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token]);

  useEffect(() => {
    const play = (uri) => {
      fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: "PUT",
        body: JSON.stringify({ uris: [uri] }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    };

    if (playerRef.current && trackUri) {
      play(trackUri);
    }
  }, [trackUri, token]);

  const handlePlayPause = () => {
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.resume();
    }
  };

  const handleProgressBarChange = (e) => {
    const value = e.target.value;
    setProgress(value);
    playerRef.current.seek(value);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  return (
    <div className="spotify-player">
      <div className="controls flex items-center">
        <button onClick={handlePlayPause} className="button">
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      {/* Song Progress */}
      <div className="progress-container flex items-center">
        <span className="time">{formatTime(progress)}</span>
        <input
          type="range"
          min="0"
          max={playerState?.duration || 1}
          value={progress}
          onChange={handleProgressBarChange}
          className="progress-bar mx-2"
        />
        <span className="time">{formatTime(playerState?.duration || 0)}</span>
      </div>
    </div>
  );
};

export default SpotifyPlayer;