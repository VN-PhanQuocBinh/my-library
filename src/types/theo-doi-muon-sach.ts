import mongoose from "mongoose";

export type borrowingStatus = "pending" | "approved" | "rejected" | "returned" | 'overdue' | 'lost';

export type TheoDoiMuonSach = {
  _id?: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  staffId: mongoose.Schema.Types.ObjectId;
  bookId: mongoose.Schema.Types.ObjectId;

  status: borrowingStatus;
  maxBorrowDays?: number;
  borrowedAt?: Date;
  returnedAt?: Date | null;
};
