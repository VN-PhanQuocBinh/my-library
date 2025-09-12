import type { Request, Response } from "express";

import express from "express";
import dotenv from "dotenv";
// const express = require("express");
// const dotenv = require("dotenv");

// connect to database
// const db = require("./src/config/db");
import db from "./src/config/db.ts";
db.connect();

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// define router
// const route = require("./src/routes");
import route from "./src/routes/index.ts";
route(app);

app.get("/", (req: Request, res: Response) => res.send("API is running..."));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
