import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

import type { IDocGia } from "../types/doc-gia.ts";
import { normalizeVietnamese } from "../utils/normalize-vietnamese.ts";

const DocGiaSchema = new Schema<IDocGia>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    normalizedFullname: { type: String, select: false },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (v: Date) {
          return v <= new Date();
        },
        message: "Date of birth cannot be in the future",
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^[0-9]{10,11}$/.test(v);
        },
        message: "Phone number must be 10-11 digits",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    passwordHash: { type: String, required: true, select: false },
    address: {
      type: String,
      required: true,
    },

    totalDebt: { type: Number, required: true, default: 0 },
    currentBanUntil: { type: Date, default: null },
    penaltyLog: [
      {
        amount: { type: Number },
        reason: { type: String, required: true, default: "No reason provided" },
        type: {
          type: String,
          required: true,
          enum: ["late-return", "lost-book", "other"],
        },
        banUntilDate: { type: Date },
        borrowId: { type: Schema.Types.ObjectId, ref: "TheoDoiMuonSach" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    __v: { type: Number, select: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

DocGiaSchema.virtual("isBanned").get(function (this: IDocGia) {
  if (!this.currentBanUntil) {
    return false;
  }
  return this.currentBanUntil > new Date();
});

DocGiaSchema.index({
  email: "text",
  normalizedFullname: "text",
});

DocGiaSchema.pre("save", function (next) {
  if (this.isModified("firstname") || this.isModified("lastname")) {
    this.normalizedFullname = normalizeVietnamese(
      `${this.lastname} ${this.firstname}`
    );
  }

  next();
});

DocGiaSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate() as any;

  if (update.firstname || update.lastname) {
    update.normalizedFullname = normalizeVietnamese(
      `${update.lastname} ${update.firstname}`
    );
  }

  next();
});

DocGiaSchema.methods.comparePassword = function (
  password = ""
): Promise<boolean> {
  console.log(this.passwordHash);
  if (!this.passwordHash) {
    throw new Error("Password hash is missing");
  }
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("DocGia", DocGiaSchema, "DocGia");
