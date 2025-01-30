const CLIENT_ID = "fa3034bb76b34ca2bdf43cbfa0edd739";
const REDIRECT_URI = "http://localhost:3000/callback";

// Add necessary scopes for Web Playback SDK and other actions
const SCOPES = [
  "user-top-read",               // Access to top tracks and artists
  "playlist-read-private",       // Access to private playlists
  "playlist-read-collaborative", // Access to collaborative playlists
  "playlist-modify-public",      // Modify public playlists (for playlist generation)
  "playlist-modify-private",     // Modify private playlists (for playlist generation)
  "user-library-read",           // Access to user's library
  "user-library-modify",         // Modify the user's library (if needed for adding/removing tracks)
  "streaming",                   // Allow streaming
  "user-read-playback-state",    // Allow reading playback state
  "user-modify-playback-state",  // Allow modifying playback state
  "user-read-recently-played",   // Allow reading recently played
  "user-read-currently-playing", // Allow access to currently playing track
  "app-remote-control",          // Allow remote control for playback
];


export const getSpotifyAuthURL = () => {
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${SCOPES.join("%20")}&response_type=token&show_dialog=true`;
};
