import mongoose from "mongoose";

export type TheoDoiMuonSach = {
  userId: mongoose.Schema.Types.ObjectId;
  bookId: mongoose.Schema.Types.ObjectId;
  status: "pending" | "approved" | "rejected" | "returned";
  maxBorrowDays?: number;
  borrowedAt?: Date;
  returnedAt?: Date | null;
};
