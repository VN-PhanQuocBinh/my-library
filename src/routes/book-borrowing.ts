import express from "express";

const router = express.Router();
import bookBorrowingController from "../controllers/book-borrowig-controller.ts";

router.post("/borrow", bookBorrowingController.borrowBook);
router.post("/return/:id", bookBorrowingController.returnBook);
