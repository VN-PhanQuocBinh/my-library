import mongoose from "mongoose";
import type { TheoDoiMuonSach } from "../types/theo-doi-muon-sach.ts";

const TheoDoiMuonSachSchema = new mongoose.Schema<TheoDoiMuonSach>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocGia",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sach",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "returned", "overdue", "lost"],
      default: "pending",
    },
    maxBorrowDays: { type: Number, default: 14 },
    borrowedAt: { type: Date, default: null },
    returnedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

TheoDoiMuonSachSchema.index({ userId: 1, bookId: 1, status: 1 });

export default mongoose.model(
  "TheoDoiMuonSach",
  TheoDoiMuonSachSchema,
  "TheoDoiMuonSach"
);
