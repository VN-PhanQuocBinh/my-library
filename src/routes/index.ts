import userAuthRouter from "./user/auth.ts";
import adminAuthRouter from "./admin/auth.ts";
import publisherRouter from "./publisher.ts";
import bookRouter from "./book.ts";
import conversationRouter from "./conversation.ts";

import userRouter from "./admin/user.ts";
import adminRouter from "./admin/admins.ts";

import testRouter from "./test.ts";

import { type Express } from "express";
import requireAuth from "../middleware/require-auth.ts";

function routes(app: Express) {
  app.use("/api/test", testRouter);

  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/admin/users", userRouter);
  app.use("/api/admin/admins", adminRouter);

  app.use("/api/auth", userAuthRouter);
  app.use("/api/publisher", publisherRouter);
  app.use("/api/book", bookRouter);
  // app.use("/api/ai", aiRouter);
  app.use("/api/conversation", requireAuth, conversationRouter);
}

export default routes;
