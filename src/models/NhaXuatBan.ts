import mongoose from "mongoose";
import type { INhaXuatBan } from "../types/nha-xuat-ban.ts";

const nhaXuatBanSchema = new mongoose.Schema<INhaXuatBan>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
});

const NhaXuatBan = mongoose.model("NhaXuatBan", nhaXuatBanSchema, "NhaXuatBan");

export default NhaXuatBan;
