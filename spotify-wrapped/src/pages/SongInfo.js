import React from 'react';
import SpotifyPlayer from '../components/SpotifyPlayer';

const SongInfo = ({ track }) => {
  const token = localStorage.getItem("spotify_token");

  if (!token) {
    console.error('Spotify token not found in localStorage');
    return null;
  }

  if (!track || !track.id) {
    console.error('Track data is missing or incomplete', track);
    return null;
  }

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
        <p className="text-lg">Duration: {Math.round(track.duration_ms / 60000)} minutes</p>
        <p className="text-lg">Genres: {track.genres ? track.genres.join(", ") : "N/A"}</p>
      </div>
      <SpotifyPlayer token={token} trackUri={track.uri} />
    </div>
  );
};

export default SongInfo;