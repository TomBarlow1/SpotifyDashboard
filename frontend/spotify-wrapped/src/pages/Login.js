import React from "react";
import { getSpotifyAuthURL } from "../utils/auth";

const Login = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <button
        onClick={() => (window.location.href = getSpotifyAuthURL())}
        className="bg-green-500 text-lg px-6 py-3 rounded-full hover:bg-green-600"
      >
        Connect to Spotify
      </button>
    </div>
  );
};

export default Login;
