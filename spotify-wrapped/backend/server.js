const express = require("express");
const mysql = require("mysql2");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 5001;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Create connection to MySQL
const db = mysql.createConnection({
    host: "127.0.0.1", // Use IPv4 address for localhost
    user: "root", // Default for MAMP
    password: "root", // Default password for MAMP
    database: "music_app", // The name of your database
    port: 8889  
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database.");
});

// Fetch top tracks from Spotify and update the database
app.get("/user/:id/top-tracks", async (req, res) => {
  const userId = req.params.id;
  const token = req.headers.authorization;  // Assuming you are sending the token in the headers

  try {
    // Fetch top tracks from Spotify
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/tracks?limit=10`, // Adjust the limit as needed
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const topTracks = response.data.items;

    // Insert each top track into the database
    topTracks.forEach((track) => {
      const { id, name, album, artists } = track;
      const artistNames = artists.map(artist => artist.name).join(", ");
      const albumImage = album.images[0]?.url;

      // Check if the track is already in the database for this user
      const checkQuery = "SELECT * FROM top_tracks WHERE user_id = ? AND track_id = ?";
      db.query(checkQuery, [userId, id], (err, results) => {
        if (err) {
          console.error("Error checking track:", err);
          return;
        }

        if (results.length === 0) {
          // Insert the track if it's not already present
          const insertQuery = `
            INSERT INTO top_tracks (user_id, track_id, track_name, artist_name, album_image)
            VALUES (?, ?, ?, ?, ?)
          `;
          db.query(insertQuery, [userId, id, name, artistNames, albumImage], (err, result) => {
            if (err) {
              console.error("Error inserting track:", err);
              return;
            }
            console.log("Track inserted:", result);
          });
        } else {
          console.log("Track already in database");
        }
      });
    });

    res.status(200).send("Top tracks updated successfully");
  } catch (error) {
    console.error("Error fetching top tracks from Spotify:", error);
    res.status(500).send("Error fetching top tracks");
  }
});

// Fetch top artists from Spotify and update the database
app.get("/user/:id/top-artists", async (req, res) => {
  const userId = req.params.id;
  const token = req.headers.authorization;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/artists?limit=10`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const topArtists = response.data.items;

    topArtists.forEach((artist) => {
      const { id, name, images } = artist;
      const artistImage = images[0]?.url;

      const checkQuery = "SELECT * FROM top_artists WHERE user_id = ? AND artist_id = ?";
      db.query(checkQuery, [userId, id], (err, results) => {
        if (err) {
          console.error("Error checking artist:", err);
          return;
        }

        if (results.length === 0) {
          const insertQuery = `
            INSERT INTO top_artists (user_id, artist_id, artist_name, artist_image)
            VALUES (?, ?, ?, ?)
          `;
          db.query(insertQuery, [userId, id, name, artistImage], (err, result) => {
            if (err) {
              console.error("Error inserting artist:", err);
              return;
            }
            console.log("Artist inserted:", result);
          });
        } else {
          console.log("Artist already in database");
        }
      });
    });

    res.status(200).send("Top artists updated successfully");
  } catch (error) {
    console.error("Error fetching top artists from Spotify:", error);
    res.status(500).send("Error fetching top artists");
  }
});

// Fetch recently played tracks from Spotify and update the database
app.get("/user/:id/recently-played", async (req, res) => {
  const userId = req.params.id;
  const token = req.headers.authorization;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/player/recently-played?limit=10`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const recentlyPlayed = response.data.items;

    recentlyPlayed.forEach((item) => {
      const { track } = item;
      const { id, name, artists, album } = track;
      const artistNames = artists.map(artist => artist.name).join(", ");
      const albumImage = album.images[0]?.url;
      const playedAt = new Date(item.played_at).toISOString();

      const checkQuery = "SELECT * FROM recently_played WHERE user_id = ? AND track_id = ?";
      db.query(checkQuery, [userId, id], (err, results) => {
        if (err) {
          console.error("Error checking recently played track:", err);
          return;
        }

        if (results.length === 0) {
          const insertQuery = `
            INSERT INTO recently_played (user_id, track_id, track_name, artist_name, album_image, played_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          db.query(insertQuery, [userId, id, name, artistNames, albumImage, playedAt], (err, result) => {
            if (err) {
              console.error("Error inserting recently played track:", err);
              return;
            }
            console.log("Recently played track inserted:", result);
          });
        } else {
          console.log("Track already in recently played");
        }
      });
    });

    res.status(200).send("Recently played tracks updated successfully");
  } catch (error) {
    console.error("Error fetching recently played tracks from Spotify:", error);
    res.status(500).send("Error fetching recently played tracks");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
