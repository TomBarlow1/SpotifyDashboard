import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Awards = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("spotify_token");
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAwards = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const awardsResponse = await axios.get(
          `http://localhost:5000/user/${userId}/awards`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAwards(awardsResponse.data);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
      }
    };

    fetchAwards();
  }, [token, navigate, userId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading your awards...</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-6 font-sans">
      <h1 className="text-4xl font-bold mb-8">Your Awards</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {awards.map((award) => (
          <div key={award.id} className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-bold">{award.name}</h3>
            <p className="text-sm text-gray-400">{award.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 bg-green-500 text-white font-bold rounded-md hover:bg-green-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Awards;