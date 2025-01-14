const CLIENT_ID = "fa3034bb76b34ca2bdf43cbfa0edd739";
const REDIRECT_URI = "http://localhost:3000/callback";

// Add necessary scopes for Web Playback SDK
const SCOPES = [
  "user-top-read",               // Access to top tracks and artists
  "playlist-read-private",       // Access to private playlists
  "user-library-read",           // Access to user's library
  "streaming",                   // Allow streaming
  "user-read-playback-state",    // Allow reading playback state
  "user-modify-playback-state",  // Allow modifying playback state
];

export const getSpotifyAuthURL = () => {
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${SCOPES.join("%20")}&response_type=token&show_dialog=true`;
};
