import Sach from "../models/Sach";
import NhaXuatBan from "../models/NhaXuatBan";
import type { Request, Response } from "express";

class BookController {
  createBook = async (req: Request, res: Response) => {
    try {
      const { name, price, quantity, publisher } = req.body;
      const newBook = new Sach({
        name,
        price,
        quantity,
        publisher,
      });
      await newBook.save();
      res.status(201).json(newBook);
    } catch (error) {
      res.status(500).json({ error: "Failed to create book" });
    }
  };
}

export default new BookController();
