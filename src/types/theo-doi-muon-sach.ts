import mongoose from "mongoose";

export type borrowingStatus = "pending" | "approved" | "rejected" | "returned" | 'overdue' | 'lost';

export type TheoDoiMuonSach = {
  userId: mongoose.Schema.Types.ObjectId;
  bookId: mongoose.Schema.Types.ObjectId;
  status: borrowingStatus;
  maxBorrowDays?: number;
  borrowedAt?: Date;
  returnedAt?: Date | null;
};
