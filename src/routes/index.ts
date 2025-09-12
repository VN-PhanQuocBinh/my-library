import authRouter from "./auth.ts";
import { type Express } from "express";

function routes(app: Express) {
  app.use("/auth", authRouter);
}

export default routes;
