import axios from "axios";

// Utility function to check if the token has expired (based on your token structure, modify accordingly)
const isTokenExpired = (token) => {
  const tokenExpiration = localStorage.getItem("spotify_token_expiration");
  return Date.now() > tokenExpiration;
};

// Function to refresh the access token using the refresh token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("spotify_refresh_token");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const CLIENT_ID = "your-client-id"; // Replace with your actual client ID
  const CLIENT_SECRET = "your-client-secret"; // Replace with your actual client secret

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
  const expirationTime = Date.now() + response.data.expires_in * 1000; // token expiration time

  // Store new token and expiration time
  localStorage.setItem("spotify_token", newAccessToken);
  localStorage.setItem("spotify_token_expiration", expirationTime);

  return newAccessToken;
};

// Helper function to get the token from localStorage or refresh it if expired
const getAccessToken = async () => {
  let token = localStorage.getItem("spotify_token");

  if (!token || isTokenExpired(token)) {
    token = await refreshAccessToken();
  }

  return token;
};

// Fetch top tracks with the correct token
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
    throw error; // Rethrow to handle further up the chain if needed
  }
};

// Fetch top artists with the correct token
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
    throw error; // Rethrow to handle further up the chain if needed
  }
};
