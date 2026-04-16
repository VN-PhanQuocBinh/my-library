import type { Request, Response } from "express";
import Sach from "./models/Sach";

import express from "express";
import cors from "cors";
import routes from "./routes/index";

// scripts
import generateEmbeddings from "./scripts/generate-embeddings";
import removeEmbeddings from "./scripts/remove-embeddings";

// connect to database
import db from "./config/db";
db.connect();
// Sach.createVectorSearchIndex();
// Sach.dropVectorSearchIndex()

const PORT = process.env.PORT || 5000;

const app = express();

// enable CORS
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173", process.env.FRONTEND_URL].filter(
  Boolean,
) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    // origin: function (origin, callback) {
    //   console.log("Origin:", origin);
    //   const allowedOrigins = ["http://localhost:5173", "http://localhost:3002"];
    //   if (allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // },
  }),
);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// define router

routes(app);

app.get("/", (req: Request, res: Response) => res.send("API is running..."));

// Run scripts
// generateEmbeddings()
// removeEmbeddings()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
