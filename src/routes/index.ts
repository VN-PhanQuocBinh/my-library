import userAuthRouter from "./user/auth";
import adminAuthRouter from "./admin/auth";
import publisherRouter from "./publisher";
import bookRouter from "./book";
import conversationRouter from "./conversation";

import userRouter from "./admin/user";
import adminRouter from "./admin/admins";

import testRouter from "./test";

import { type Express } from "express";

function routes(app: Express) {
  app.use("/api/test", testRouter);

  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/admin/users", userRouter);
  app.use("/api/admin/admins", adminRouter);

  app.use("/api/auth", userAuthRouter);
  app.use("/api/publisher", publisherRouter);
  app.use("/api/book", bookRouter);
  app.use("/api/conversation", conversationRouter);
}

export default routes;
