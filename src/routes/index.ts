import userAuthRouter from "./user/auth.ts";
import adminAuthRouter from "./admin/auth.ts";
import publisherRouter from "./publisher.ts";
import bookRouter from "./book.ts";

import userRouter from "./admin/user.ts";
import adminRouter from "./admin/admins.ts";

import aiRouter from "./ai.ts";

import { type Express } from "express";

function routes(app: Express) {
  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/admin/users", userRouter);
  app.use("/api/admin/admins", adminRouter);

  app.use("/api/auth", userAuthRouter);
  app.use("/api/publisher", publisherRouter);
  app.use("/api/book", bookRouter);
  app.use("/api/ai", aiRouter);
}

export default routes;
