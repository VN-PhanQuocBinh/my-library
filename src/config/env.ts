import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
export const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";
export const PORT = process.env.PORT || 5000;
