import dotenv from "dotenv";
dotenv.config();



export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
export const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";
export const PORT = process.env.PORT || 5000;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const HF_API_KEY = process.env.HF_API_KEY || "";
