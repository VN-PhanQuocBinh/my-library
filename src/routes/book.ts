import express from "express";
import BookController, { upload } from "../controllers/book-controller.ts";
import bookBorrowigController from "../controllers/book-borrowig-controller.ts";

const router = express.Router();

router.get("/borrowings", bookBorrowigController.getAllBorrowings);
router.post("/borrow", bookBorrowigController.borrowBook);
router.patch("/borrow/:id", bookBorrowigController.updateBorrowing);

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
  BookController.updateBook
);
router.get("/:id", BookController.getBookById);
router.post("/return/:id", bookBorrowigController.returnBook);

export default router;
