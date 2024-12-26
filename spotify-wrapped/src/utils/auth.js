const CLIENT_ID = "fa3034bb76b34ca2bdf43cbfa0edd739";
const REDIRECT_URI = "http://localhost:3000/callback";
const SCOPES = ["user-top-read", "playlist-read-private", "user-library-read"];

export const getSpotifyAuthURL = () => {
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${SCOPES.join("%20")}&response_type=token&show_dialog=true`;
};
