import express from "express";
import BookController, { upload } from "../controllers/book-controller.ts";

const router = express.Router();

router.post(
  "/create",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "detailedImages", maxCount: 10 },
  ]),
  BookController.createBook as express.RequestHandler
);
router.get("/list", BookController.getAllBooks);
router.patch("/:id/update", BookController.updateBook);
router.delete("/:id/delete", BookController.deleteBook);
router.get("/:id", BookController.getBookById);

export default router;
