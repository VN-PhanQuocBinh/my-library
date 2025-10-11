import type { Request, Response } from "express";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// load environment variables from .env file
dotenv.config();

// configure cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// connect to database
import db from "./src/config/db.ts";
db.connect();


const PORT = process.env.PORT || 5000;

const app = express();

// enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3002"],
  })
);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// define router
import routes from "./src/routes/index.ts";
routes(app);

app.get("/", (req: Request, res: Response) => res.send("API is running..."));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
