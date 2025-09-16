import type { Request, Response } from "express";
import mongoose from "mongoose";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";


// connect to database
import db from "./src/config/db.ts";
db.connect();

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// enable CORS
app.use(
  cors({
    origin: "http://localhost:5173", // allow requests from this origin
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
