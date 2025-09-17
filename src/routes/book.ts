import express from "express";
import BookController from "../controllers/book-controller.ts";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post(
  "/create",
  upload.array("detailedImages", 5),
  BookController.createBook as express.RequestHandler
);
router.get("/list", BookController.getAllBooks);
router.patch("/:id/update", BookController.updateBook);
router.delete("/:id/delete", BookController.deleteBook);
router.get("/:id", BookController.getBookById);

export default router;
