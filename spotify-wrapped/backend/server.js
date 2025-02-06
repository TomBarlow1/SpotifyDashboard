const express = require("express");
const mysql = require("mysql2");
const cors = require("cors"); // Optional, to allow CORS if your frontend is on a different port
const app = express();
const port = 5000; // Change this if needed

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Create connection to MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Default for XAMPP
  password: "", // Default password is empty for XAMPP
  database: "music_app" // The name of your database
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database.");
});

// Endpoint to get a user's data
app.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT * FROM users WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      res.status(500).send("Error fetching user data");
      return;
    }
    if (results.length === 0) {
      res.status(404).send("User not found");
      return;
    }
    res.json(results[0]);
  });
});

// Endpoint to get all challenges
app.get("/challenges", (req, res) => {
  const query = "SELECT * FROM challenges";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching challenges:", err);
      res.status(500).send("Error fetching challenges");
      return;
    }
    res.json(results);
  });
});

// Endpoint to complete a challenge
app.post("/user/:id/complete-challenge/:challengeId", (req, res) => {
  const userId = req.params.id;
  const challengeId = req.params.challengeId;
  
  // Check if the challenge is already completed
  const checkQuery = "SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?";
  db.query(checkQuery, [userId, challengeId], (err, results) => {
    if (err) {
      console.error("Error checking challenge:", err);
      res.status(500).send("Error checking challenge");
      return;
    }
    if (results.length > 0) {
      return res.status(400).send("Challenge already completed");
    }
    
    // Insert the completed challenge
    const insertQuery = "INSERT INTO user_challenges (user_id, challenge_id) VALUES (?, ?)";
    db.query(insertQuery, [userId, challengeId], (err, result) => {
      if (err) {
        console.error("Error completing challenge:", err);
        res.status(500).send("Error completing challenge");
        return;
      }
      res.status(200).send("Challenge completed successfully");
    });
  });
});

// Endpoint to award a badge to a user
app.post("/user/:id/award-badge/:badgeId", (req, res) => {
  const userId = req.params.id;
  const badgeId = req.params.badgeId;
  
  const query = "INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)";
  db.query(query, [userId, badgeId], (err, result) => {
    if (err) {
      console.error("Error awarding badge:", err);
      res.status(500).send("Error awarding badge");
      return;
    }
    res.status(200).send("Badge awarded successfully");
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
