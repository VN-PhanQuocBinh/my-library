import type { Request, Response } from "express";
import Sach from "./src/models/Sach.ts";

import express from "express";
import cors from "cors";
import routes from "./src/routes/index.ts";

// scripts
import generateEmbeddings from "./src/scripts/generate-embeddings.ts";
import removeEmbeddings from "./src/scripts/remove-embeddings.ts";



// connect to database
import db from "./src/config/db.ts";
db.connect();
Sach.createVectorSearchIndex(); 
// Sach.dropVectorSearchIndex()


const PORT = process.env.PORT || 5000;

const app = express();

// enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3002"],
    // origin: function (origin, callback) {
    //   console.log("Origin:", origin);
    //   const allowedOrigins = ["http://localhost:5173", "http://localhost:3002"];
    //   if (allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // },
  })
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
