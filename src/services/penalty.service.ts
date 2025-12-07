import DocGia from "../models/DocGia.ts";
import type { IDocGia, PenaltyRecord } from "../types/doc-gia.ts";

import TheoDoiMuonSach from "../models/TheoDoiMuonSach.ts";
import type { TheoDoiMuonSach as ITheoDoiMuonSach } from "../types/theo-doi-muon-sach.ts";
import mongoose, { Types } from "mongoose";

const FINE_PER_DAY = 5000;
const BAN_THRESHOLD = 7;
const BAN_DAYS = 3;

export class PenaltyService {
  public static async calculateAndApplyPenalties(borrowId: string) {
    const borrowRecord = await TheoDoiMuonSach.findById(borrowId);
    if (!borrowRecord) {
      throw new Error("Borrow record not found");
    }

    const user = await DocGia.findById(borrowRecord.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const borrowedAt = borrowRecord.borrowedAt ? new Date(borrowRecord.borrowedAt) : new Date();
    const returnedAt = borrowRecord.returnedAt ? new Date(borrowRecord.returnedAt) : new Date();
    const maxBorrowDays = borrowRecord.maxBorrowDays || 14;
    const daysLate =
      Math.ceil((returnedAt.getTime() - borrowedAt.getTime()) / (1000 * 3600 * 24)) - maxBorrowDays;

    console.log(`Days late for borrow ID ${borrowId}: ${daysLate}`);

    if (daysLate <= 0) {
      return user;
    }

    const fineAmount = daysLate * FINE_PER_DAY;

    let banUntilDate: Date = new Date();
    if (daysLate >= BAN_THRESHOLD) {
      banUntilDate.setDate(banUntilDate.getDate() + BAN_DAYS);
    }

    const penaltyRecord: PenaltyRecord = {
      amount: fineAmount,
      reason: `Late return by ${daysLate} days`,
      type: "late-return",
      borrowId: borrowRecord._id as any,
      banUntilDate,
    };

    const updatePayload: any = {
      $inc: { totalDebt: fineAmount },
      $push: { penaltyLog: penaltyRecord },
    };

    if (banUntilDate) {
      const newBanUntil =
        user.currentBanUntil && user.currentBanUntil > banUntilDate
          ? user.currentBanUntil
          : banUntilDate;
      updatePayload.$set = { currentBanUntil: newBanUntil, status: "banned" };
    }

    const updatedUser = await DocGia.findByIdAndUpdate(user._id, updatePayload, { new: true });
    return updatedUser;
  }
}
