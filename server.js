const express = require("express");
const dotenv = require("dotenv");

// connect to database
const db = require("./src/config/db");
db.connect();

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// define router
const route = require("./src/routes");
route(app);

app.get("/", (req, res) => res.send("API is running..."));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
