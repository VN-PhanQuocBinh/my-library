import userAuthRouter from "./user/auth.ts";
import adminAuthRouter from "./admin/auth.ts";
import publisherRouter from "./publisher.ts";
import bookRouter from "./book.ts";
import userRouter from "./admin/user.ts";
import { type Express } from "express";

function routes(app: Express) {
  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/admin/user", userRouter);
  app.use("/api/auth", userAuthRouter);
  app.use("/api/publisher", publisherRouter);
  app.use("/api/book", bookRouter);
}

export default routes;
