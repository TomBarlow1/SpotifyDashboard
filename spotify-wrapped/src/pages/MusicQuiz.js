// Import necessary libraries
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Main MusicQuiz component
const MusicQuiz = () => {
  // State hooks
  const [questions, setQuestions] = useState([]); // Stores quiz questions
  const [currentQuestion, setCurrentQuestion] = useState(0); // Tracks current question index
  const [score, setScore] = useState(0); // User score
  const [quizFinished, setQuizFinished] = useState(false); // Tracks if quiz is complete
  const token = localStorage.getItem("spotify_token"); // Get Spotify auth token

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel API calls for top artists, top tracks, and recently played
        const [artistsRes, tracksRes, recentlyPlayedRes] = await Promise.all([
          axios.get("https://api.spotify.com/v1/me/top/artists?limit=5&time_range=medium_term", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=10", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Format artist, track, and recent track data
        const artists = artistsRes.data.items.map((artist) => ({
          name: artist.name,
          image: artist.images[0]?.url,
        }));
        const tracks = tracksRes.data.items.map((track) => ({
          name: track.name,
          image: track.album.images[0]?.url,
        }));
        const recentTracks = recentlyPlayedRes.data.items.map((item) => ({
          name: item.track.name,
          image: item.track.album.images[0]?.url,
        }));

        // Analyze timestamps to get insights
        const timestamps = recentlyPlayedRes.data.items.map((item) => new Date(item.played_at));
        const hours = timestamps.map((timestamp) => timestamp.getHours());
        const mostPlayedTimeOfDay = getMostPlayedTimeOfDay(hours);
        const totalMinutesListened = getTotalMinutesListened(timestamps);
        const mostPlayedDay = getMostPlayedDay(timestamps);

        // Analyze genres
        const genres = artistsRes.data.items.flatMap((artist) => artist.genres);
        const mostListenedGenre = getMostListenedGenre(genres);
        const leastListenedGenre = getLeastListenedGenre(genres);

        // Placeholder values for missing analysis
        const mostListenedPlaylist = "Playlist 1";
        const averageSongEnergy = "Medium";
        const mostDanceableSong = tracks[0].name;
        const musicPreference = "Happy";
        const newArtistsDiscovered = "20";

        // Create quiz questions dynamically based on data
        const quizQuestions = [
          {
            question: "Which of these is your most-played artist?",
            choices: shuffleArray([...artists, { name: "Random Artist", image: null }]),
            correct: artists[0].name,
          },
          {
            question: "Which of these is NOT in your top 5 artists?",
            choices: shuffleArray([...artists.slice(0, 4), { name: "Fake Artist", image: null }]),
            correct: "Fake Artist",
          },
          {
            question: "Which song have you listened to the most?",
            choices: shuffleArray([...tracks, { name: "Random Song", image: null }]),
            correct: tracks[0].name,
          },
          {
            question: "What time of day do you listen to music the most?",
            choices: shuffleArray([
              { name: "Morning", image: null },
              { name: "Afternoon", image: null },
              { name: "Evening", image: null },
              { name: "Late Night", image: null },
            ]),
            correct: mostPlayedTimeOfDay,
          },
          {
            question: "How many minutes have you listened to music in the past month?",
            choices: shuffleArray([
              { name: "1000", image: null },
              { name: "2000", image: null },
              { name: "3000", image: null },
              { name: "4000", image: null },
            ]),
            correct: totalMinutesListened,
          },
          {
            question: "Which day of the week do you listen to music the most?",
            choices: shuffleArray([
              { name: "Monday" }, { name: "Tuesday" }, { name: "Wednesday" },
              { name: "Thursday" }, { name: "Friday" }, { name: "Saturday" }, { name: "Sunday" },
            ]),
            correct: mostPlayedDay,
          },
          {
            question: "What is your most-listened-to genre?",
            choices: shuffleArray([
              { name: "Pop" }, { name: "Rock" }, { name: "Hip-Hop" }, { name: "Jazz" },
            ]),
            correct: mostListenedGenre,
          },
          {
            question: "Which of these genres do you listen to the LEAST?",
            choices: shuffleArray([
              { name: "Pop" }, { name: "Rock" }, { name: "Hip-Hop" }, { name: "Jazz" },
            ]),
            correct: leastListenedGenre,
          },
          {
            question: "Which playlist do you listen to the most?",
            choices: shuffleArray([
              { name: "Playlist 1" }, { name: "Playlist 2" },
              { name: "Playlist 3" }, { name: "Playlist 4" },
            ]),
            correct: mostListenedPlaylist,
          },
          {
            question: "What is your average song energy level?",
            choices: shuffleArray([
              { name: "Low" }, { name: "Medium" }, { name: "High" }, { name: "Extreme" },
            ]),
            correct: averageSongEnergy,
          },
          {
            question: "What’s the most danceable song in your top tracks?",
            choices: shuffleArray([...tracks, { name: "Random Song", image: null }]),
            correct: mostDanceableSong,
          },
          {
            question: "Do you prefer happy or sad music?",
            choices: shuffleArray([
              { name: "Happy" }, { name: "Sad" }, { name: "Neutral" }, { name: "Mixed" },
            ]),
            correct: musicPreference,
          },
          {
            question: "Which song did you last listen to?",
            choices: shuffleArray([...recentTracks, { name: "Fake Track", image: null }]),
            correct: recentTracks[0].name,
          },
          {
            question: "How many new artists did you discover this month?",
            choices: shuffleArray([
              { name: "10" }, { name: "20" }, { name: "30" }, { name: "40" },
            ]),
            correct: newArtistsDiscovered,
          },
          {
            question: "Which of these songs have you NEVER played?",
            choices: shuffleArray([...tracks.slice(0, 3), { name: "Fake Track", image: null }]),
            correct: "Fake Track",
          },
        ];

        // Set the quiz questions in state
        setQuestions(quizQuestions);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [token]);

  // Handle user answering a question
  const handleAnswer = (answer) => {
    // Check if the answer is correct
    if (answer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    // Move to next question or finish the quiz
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // JSX to render the quiz
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Back button */}
      <Link to="/dashboard" className="self-start mb-4">
        <button className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-400">
          Back to Dashboard
        </button>
      </Link>

      {/* Quiz result screen */}
      {quizFinished ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Quiz Finished!</h2>
          <p className="text-xl">Your score: {score} / {questions.length}</p>
          <Link to="/dashboard">
            <button className="mt-4 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-400">
              Back to Dashboard
            </button>
          </Link>
        </div>
      ) : (
        // Active question screen
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">{questions[currentQuestion]?.question}</h2>
          <div className="grid grid-cols-1 gap-4">
            {questions[currentQuestion]?.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(choice.name)}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-400 flex items-center"
              >
                {choice.image ? (
                  <img src={choice.image} alt={choice.name} className="w-10 h-10 mr-2 rounded-full" />
                ) : (
                  <div className="w-10 h-10 mr-2 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                    ❓
                  </div>
                )}
                <span>{choice.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Utility: Shuffle array randomly
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

// Utility: Determine most played time of day
const getMostPlayedTimeOfDay = (hours) => {
  const counts = hours.reduce((acc, hour) => {
    const timeOfDay = getTimeOfDay(hour);
    acc[timeOfDay] = (acc[timeOfDay] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
};

// Utility: Convert hour to time of day
const getTimeOfDay = (hour) => {
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Late Night";
};

// Utility: Estimate total minutes listened (3 min per track)
const getTotalMinutesListened = (timestamps) => {
  const totalMinutes = timestamps.length * 3;
  return totalMinutes.toString();
};

// Utility: Find the most active listening weekday
const getMostPlayedDay = (timestamps) => {
  const days = timestamps.map((timestamp) => timestamp.getDay());
  const counts = days.reduce((acc, day) => {
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const mostPlayedDayIndex = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return daysOfWeek[mostPlayedDayIndex];
};

// Utility: Find most listened genre
const getMostListenedGenre = (genres) => {
  const counts = genres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
};

// Utility: Find least listened genre
const getLeastListenedGenre = (genres) => {
  const counts = genres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).reduce((a, b) => (counts[a] < counts[b] ? a : b));
};

export default MusicQuiz;
