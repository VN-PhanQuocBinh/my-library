import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

import type { INhanVien } from "../types/nhan-vien.ts";

import { normalizeVietnamese } from "../utils/normalize-vietnamese.ts";

const NhanVienSchema = new Schema<INhanVien>(
  {
    fullname: { type: String, required: true },
    normalizedFullname: { type: String, select: false },
    duty: {
      type: String,
      required: true,
      enum: ["staff", "manager"],
      default: "staff",
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
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    passwordHash: { type: String, required: true, select: false },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

NhanVienSchema.index({
  normalizedFullname: "text",
  email: "text",
});

NhanVienSchema.pre("save", function (next) {
  if (this.isModified("fullname")) {
    this.normalizedFullname = normalizeVietnamese(this.fullname);
  }

  next();
});

NhanVienSchema.methods.comparePassword = function (
  password = ""
): Promise<boolean> {
  if (!this.passwordHash) {
    throw new Error("Password hash is missing");
  }
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("NhanVien", NhanVienSchema, "NhanVien");
