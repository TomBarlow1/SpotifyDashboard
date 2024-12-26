import axios from "axios";

export const fetchTopTracks = async (token, timeRange = "medium_term") => {
  const response = await axios.get(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.items;
};

export const fetchTopArtists = async (token, timeRange = "medium_term") => {
  const response = await axios.get(
    `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=10`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.items;
};
