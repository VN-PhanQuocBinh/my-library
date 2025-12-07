import express from "express";
import BookController, { upload } from "../controllers/book-controller.ts";
import bookBorrowigController from "../controllers/book-borrowing-controller.ts";

// Middlewares
import requireAuth from "../middleware/require-auth.ts";
import requireRole from "../middleware/require-role.ts";
import checkStatusMiddleware from "../middleware/check-status.ts";

const router = express.Router();

const userAuth = [
  requireAuth,
  checkStatusMiddleware,
  requireRole(["reader"]) as express.RequestHandler,
];

const adminAuth = [requireAuth, requireRole(["staff", "manager"]) as express.RequestHandler];

router.get("/borrowings", ...adminAuth, bookBorrowigController.getAllBorrowings);

// [ADMIN] Routes for book borrowing
router.post("/borrow", ...adminAuth, bookBorrowigController.borrowBook);

// [USER] Routes for book borrowing
router.post("/register-borrow", ...userAuth, bookBorrowigController.registerBorrowing);

// [ADMIN] Routes for updating borrowings
router.patch("/borrow/:id", ...adminAuth, bookBorrowigController.updateBorrowing);

// [USER] Routes for getting user's borrowings
router.get("/my-borrowings", ...userAuth, bookBorrowigController.getUserBorrowings);

// [ADMIN] Routes for book management
router.post(
  "/create",
  requireAuth,
  requireRole(["manager"]) as express.RequestHandler,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "detailedImages", maxCount: 10 },
  ]),
  BookController.createBook as express.RequestHandler
);

router.get("/list", requireAuth, BookController.getAllBooks);

router.patch(
  "/:id/update",
  requireAuth,
  requireRole(["manager"]) as express.RequestHandler,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "detailedImages", maxCount: 10 },
  ]),
  BookController.updateBook as express.RequestHandler
);

router.get("/:id", requireAuth, BookController.getBookById);
router.post("/return/:id", ...adminAuth, bookBorrowigController.returnBook);

export default router;
