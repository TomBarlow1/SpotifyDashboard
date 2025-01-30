import { useEffect, useRef, useState } from "react";

const SpotifyPlayer = ({ token, trackUri }) => {
  const playerRef = useRef(null);
  const [playerState, setPlayerState] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const progressInterval = useRef(null);

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
        localStorage.setItem("spotify_device_id", device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        setPlayerState(state);
        if (state) {
          setProgress(state.position);
          setIsPlaying(!state.paused);
          setCurrentTrack(state.track_window.current_track);
        }
      });

      player.connect();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [token]);

  useEffect(() => {
    const playTrack = async () => {
      if (trackUri && playerRef.current) {
        const device_id = localStorage.getItem("spotify_device_id");
        if (!device_id) return;

        try {
          await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [trackUri] }),
          });
        } catch (error) {
          console.error("Error playing track:", error);
        }
      }
    };

    playTrack();
  }, [trackUri, token]);

  const handlePlayPause = () => {
    if (playerRef.current) {
      playerRef.current.togglePlay();
    }
  };

  const handleProgressBarChange = (event) => {
    const newPosition = event.target.value;
    setSeek(newPosition);
    if (playerRef.current) {
      playerRef.current.seek(newPosition);
    }
  };

  const handleSkipForward = () => {
    if (playerRef.current) {
      playerRef.current.skipToNext();
    }
  };

  const handleSkipBackward = () => {
    if (playerRef.current) {
      playerRef.current.skipToPrevious();
    }
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  useEffect(() => {
    if (isPlaying && playerRef.current) {
      progressInterval.current = setInterval(() => {
        setProgress((prevProgress) => {
          if (playerState && prevProgress < playerState.duration) {
            return prevProgress + 100;
          }
          return prevProgress;
        });
      }, 100);
    } else {
      clearInterval(progressInterval.current);
    }

    return () => clearInterval(progressInterval.current);
  }, [isPlaying, playerState]);

  return (
    <div className="spotify-player-ui text-white flex flex-col items-center">
      {/* Album Cover with Spinning Animation */}
      <div
        className={`album-cover mb-4 ${isPlaying ? "animate-spin-slow" : ""}`}
      >
        {currentTrack && currentTrack.album && (
          <img
            src={currentTrack.album.images[0]?.url}
            alt={currentTrack.name}
            className="w-32 h-32 rounded-full"
          />
        )}
      </div>

      {/* Song Name */}
      {currentTrack && (
        <h2 className="text-xl font-bold mb-2">{currentTrack.name}</h2>
      )}

      {/* Controls */}
      <div className="controls flex justify-between items-center mb-4">
        <button onClick={handleSkipBackward} className="button">
          &#9664;
        </button>
        <button onClick={handlePlayPause} className="button">
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={handleSkipForward} className="button">
          &#9654;
        </button>
      </div>

      {/* Song Progress */}
      <div className="progress-container flex items-center">
        <span className="time">{formatTime(progress)}</span>
        <input
          type="range"
          min="0"
          max={playerState?.duration || 1}
          value={seek || progress}
          onChange={handleProgressBarChange}
          className="progress-bar mx-2"
        />
        <span className="time">{formatTime(playerState?.duration || 0)}</span>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
