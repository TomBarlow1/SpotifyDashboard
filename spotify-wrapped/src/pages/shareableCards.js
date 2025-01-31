import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toJpeg } from 'html-to-image';
import SocialShare from '../components/SocialShare';
import Card from '../components/card';
import Modal from 'react-modal';

const ShareableCards = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("medium_term"); // Default to 'medium_term'
  const [view, setView] = useState("topTracks"); // Default view
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const navigate = useNavigate();  // useNavigate hook to navigate between pages
  const token = localStorage.getItem("spotify_token");
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);

        // Fetch Top 5 Tracks based on the selected time range
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopTracks(tracksResponse.data.items);

        // Fetch Top 5 Artists based on the selected time range
        const artistsResponse = await axios.get(
          `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopArtists(artistsResponse.data.items);

        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          navigate("/");
        }
      }
    };

    fetchData();
  }, [token, timeRange, navigate]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleViewChange = (newView) => {
    setView(newView);
    openModal(newView);
  };

  const handleDownload = () => {
    if (cardRef.current) {
      toJpeg(cardRef.current, { quality: 0.95 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'shareable-card.jpeg';
          link.href = dataUrl;
          link.click();
        });
    }
  };

  const openModal = (content) => {
    let modalContent;
    if (content === "topTracks") {
      modalContent = (
        <>
          <h2 className="text-2xl font-semibold mb-4">Top 5 Tracks</h2>
          <div className="mb-4" ref={cardRef}>
            {topTracks.map((track) => (
              <Card
                key={track.id}
                image={track.album.images[0]?.url}
                title={track.name}
                subtitle={track.artists.map((artist) => artist.name).join(", ")}
              />
            ))}
          </div>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 mr-4"
          >
            Download as JPEG
          </button>
        </>
      );
    } else if (content === "topArtists") {
      modalContent = (
        <>
          <h2 className="text-2xl font-semibold mb-4">Top 5 Artists</h2>
          <div className="mb-4" ref={cardRef}>
            {topArtists.map((artist) => (
              <Card
                key={artist.id}
                image={artist.images[0]?.url}
                title={artist.name}
                subtitle={artist.genres[0]}
              />
            ))}
          </div>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 mr-4"
          >
            Download as JPEG
          </button>
        </>
      );
    } else if (content === "topSongsPerArtist") {
      modalContent = (
        <>
          <h2 className="text-2xl font-semibold mb-4">Top Songs Per Artist</h2>
          <div className="mb-4" ref={cardRef}>
            {topArtists.map((artist) => (
              <div key={artist.id} className="mb-4">
                <h3 className="text-xl font-bold mb-2">{artist.name}</h3>
                {topTracks
                  .filter((track) => track.artists.some((trackArtist) => trackArtist.id === artist.id))
                  .map((track) => (
                    <Card
                      key={track.id}
                      image={track.album.images[0]?.url}
                      title={track.name}
                      subtitle={track.artists.map((trackArtist) => trackArtist.name).join(", ")}
                    />
                  ))}
              </div>
            ))}
          </div>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 mr-4"
          >
            Download as JPEG
          </button>
        </>
      );
    }
    setModalContent(modalContent);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalContent(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-6 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Shareable Stats</h1>

      <div className="mb-8 flex justify-center space-x-4">
        {["short_term", "medium_term", "long_term"].map((range) => (
          <button
            key={range}
            onClick={() => handleTimeRangeChange(range)}
            className={`px-4 py-2 rounded ${
              timeRange === range ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            {range === "short_term" ? "1 Week" : range === "medium_term" ? "4 Weeks" : "1 Year"}
          </button>
        ))}
      </div>

      <div className="mb-8 flex justify-center space-x-4">
        {["topTracks", "topArtists", "topSongsPerArtist"].map((viewOption) => (
          <button
            key={viewOption}
            onClick={() => handleViewChange(viewOption)}
            className={`px-4 py-2 rounded ${
              view === viewOption ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            {viewOption === "topTracks" ? "Top Tracks" : viewOption === "topArtists" ? "Top Artists" : "Top Songs Per Artist"}
          </button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/dashboard")} // Navigate back to the dashboard
          className="px-6 py-3 bg-green-500 text-white font-bold rounded-md hover:bg-green-600"
        >
          Back to Dashboard
        </button>
      </div>

      <SocialShare url={window.location.href} />

      {modalIsOpen && (
        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal" overlayClassName="overlay">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
            <button onClick={closeModal} className="float-right text-white text-2xl">&times;</button>
            {modalContent}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ShareableCards;