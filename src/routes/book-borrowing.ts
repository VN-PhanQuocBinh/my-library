import express from "express";

const router = express.Router();
import bookBorrowingController from "../controllers/book-borrowing-controller.ts";

router.post("/borrow", bookBorrowingController.borrowBook);
router.post("/return/:id", bookBorrowingController.returnBook);
