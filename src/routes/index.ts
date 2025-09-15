import userAuthRouter from "./user/auth.ts";
import adminAuthRouter from "./admin/auth.ts";
import { type Express } from "express";

function routes(app: Express) {
  app.use("/api/auth", userAuthRouter);
  app.use("/api/admin/auth", adminAuthRouter);
}

export default routes;
