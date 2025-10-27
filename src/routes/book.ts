import express from "express";
import BookController, { upload } from "../controllers/book-controller.ts";
import bookBorrowigController from "../controllers/book-borrowing-controller.ts";

// Middlewares
import requireAuth from "../middleware/require-auth.ts";
import requireRole from "../middleware/require-role.ts";
import checkStatusMiddleware from "../middleware/check-status.ts";

const router = express.Router();

router.get("/borrowings", requireAuth, bookBorrowigController.getAllBorrowings);

// Routes for book borrowing (admin)
router.post(
  "/borrow",
  requireAuth,
  requireRole(["admin"]) as express.RequestHandler,
  bookBorrowigController.borrowBook
);

// Routes for book borrowing (reader)
router.post(
  "/register-borrow",
  requireAuth,
  checkStatusMiddleware,
  requireRole(["reader"]) as express.RequestHandler,
  bookBorrowigController.registerBorrowing
);
router.patch(
  "/borrow/:id",
  requireAuth,
  bookBorrowigController.updateBorrowing
);
router.get(
  "/my-borrowings",
  requireAuth,
  requireRole(["reader"]) as express.RequestHandler,
  bookBorrowigController.getUserBorrowings
);


// Routes for book management
router.post(
  "/create",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "detailedImages", maxCount: 10 },
  ]),
  BookController.createBook as express.RequestHandler
);
router.get("/list", BookController.getAllBooks);
router.patch(
  "/:id/update",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "detailedImages", maxCount: 10 },
  ]),
  BookController.updateBook as express.RequestHandler
);
router.get("/:id", BookController.getBookById);
router.post("/return/:id", bookBorrowigController.returnBook);

export default router;
