import React, { useEffect, useState } from 'react';
import SpotifyPlayer from '../components/SpotifyPlayer';

const SongInfo = ({ track }) => {
  const token = localStorage.getItem("spotify_token");
  const [audioFeatures, setAudioFeatures] = useState(null);

  useEffect(() => {
    if (!token) {
      console.error('Spotify token not found in localStorage');
      return;
    }

    console.log('Spotify Token:', token); // Debugging step

    const checkTokenScopes = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Token Scopes:', data.scope); // Debugging step
        if (!data.scope.includes('user-read-private') || !data.scope.includes('user-read-email')) {
          throw new Error('Token does not have the required scopes');
        }
      } catch (error) {
        console.error('Error checking token scopes:', error);
        return;
      }
    };

    checkTokenScopes();

    if (!track || !track.id) {
      console.error('Track data is missing or incomplete', track);
      return;
    }

    const fetchAudioFeatures = async () => {
      try {
        const response = await fetch(`https://api.spotify.com/v1/audio-features/${track.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Audio Features:', data); // Debugging step
        setAudioFeatures(data);
      } catch (error) {
        console.error('Error fetching audio features:', error);
      }
    };

    fetchAudioFeatures();
  }, [track.id, token]);

  return (
    <div className="bg-black text-white min-h-screen p-6 font-sans">
      <div className="flex items-center mb-8">
        <img
          src={track.album.images[0]?.url}
          alt={track.name}
          className="w-64 h-64 object-cover rounded mr-8"
        />
        <h1 className="text-4xl font-bold">{track.name}</h1>
      </div>
      <div className="mb-8">
        <p className="text-lg font-bold">Artists: {track.artists.map((artist) => artist.name).join(", ")}</p>
        <p className="text-lg">Duration: {Math.round(track.duration_ms / 60000)} minutes</p>
        <p className="text-lg">Genres: {track.genres ? track.genres.join(", ") : "N/A"}</p>
        <p className="text-lg">Mood: {track.mood || "N/A"}</p>
        {audioFeatures && (
          <div className="mt-4">
            <p className="text-lg">Danceability: {audioFeatures.danceability}</p>
            <p className="text-lg">Energy: {audioFeatures.energy}</p>
            <p className="text-lg">Tempo: {audioFeatures.tempo} BPM</p>
            <p className="text-lg">Valence: {audioFeatures.valence}</p>
            <p className="text-lg">Acousticness: {audioFeatures.acousticness}</p>
            <p className="text-lg">Instrumentalness: {audioFeatures.instrumentalness}</p>
            <p className="text-lg">Liveness: {audioFeatures.liveness}</p>
            <p className="text-lg">Loudness: {audioFeatures.loudness} dB</p>
            <p className="text-lg">Speechiness: {audioFeatures.speechiness}</p>
          </div>
        )}
      </div>
      <SpotifyPlayer token={token} trackUri={track.uri} />
    </div>
  );
};

export default SongInfo;