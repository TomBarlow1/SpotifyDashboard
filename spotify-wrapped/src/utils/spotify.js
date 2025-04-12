import axios from "axios";

// Utility function to check if the token has expired
const isTokenExpired = () => {
  const tokenExpiration = localStorage.getItem("spotify_token_expiration");
  return !tokenExpiration || Date.now() > tokenExpiration;
};

// Function to refresh the access token using the refresh token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("spotify_refresh_token");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const CLIENT_ID = "fa3034bb76b34ca2bdf43cbfa0edd739"; 
  const CLIENT_SECRET = "43b8a91128d440319166a27aa3e72c55"; 

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(CLIENT_ID + ":" + CLIENT_SECRET)}`,
        },
      }
    );

    const newAccessToken = response.data.access_token;
    const expirationTime = Date.now() + response.data.expires_in * 1000;

    // Store new token and expiration time
    localStorage.setItem("spotify_token", newAccessToken);
    localStorage.setItem("spotify_token_expiration", expirationTime);

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

// Helper function to get the token from localStorage or refresh it if expired
const getAccessToken = async () => {
  let token = localStorage.getItem("spotify_token");

  if (!token || isTokenExpired()) {
    token = await refreshAccessToken();
  }

  return token;
};

// Fetch top tracks
export const fetchTopTracks = async (timeRange = "medium_term") => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.items;
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    throw error;
  }
};

// Fetch top artists
export const fetchTopArtists = async (timeRange = "medium_term") => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=10`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.items;
  } catch (error) {
    console.error("Error fetching top artists:", error);
    throw error;
  }
};

// Fetch recently played tracks
export const fetchRecentlyPlayed = async () => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/recently-played?limit=48",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.items;
  } catch (error) {
    console.error("Error fetching recently played tracks:", error);
    throw error;
  }
};