import userAuthRouter from "./user/auth.ts";
import adminAuthRouter from "./admin/auth.ts";
import publisherRouter from "./publisher.ts";
import { type Express } from "express";

function routes(app: Express) {
  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/auth", userAuthRouter);
  app.use("/api/publisher", publisherRouter);
}

export default routes;
