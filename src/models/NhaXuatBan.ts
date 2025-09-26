import mongoose from "mongoose";
import type { INhaXuatBan } from "../types/nha-xuat-ban.ts";
import { normalizeVietnamese } from "../utils/normalize-vietnamese.ts";

const nhaXuatBanSchema = new mongoose.Schema<INhaXuatBan>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  normalizedName: {
    type: String,
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  normalizedAddress: {
    type: String,
  },
});

nhaXuatBanSchema.index({ normalizedName: "text", normalizedAddress: "text" });
nhaXuatBanSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.normalizedName = normalizeVietnamese(this.name);
  }

  if (this.isModified("address")) {
    this.normalizedAddress = normalizeVietnamese(this.address);
  }
  next();
});

nhaXuatBanSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate() as any;
  if (!update) {
    return next();
  }

  if (update.name) {
    update.normalizedName = normalizeVietnamese(update.name);
  }

  if (update.address) {
    update.normalizedAddress = normalizeVietnamese(update.address);
  }
  next();
});

const NhaXuatBan = mongoose.model("NhaXuatBan", nhaXuatBanSchema, "NhaXuatBan");

export default NhaXuatBan;
