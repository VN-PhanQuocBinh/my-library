import mongoose from "mongoose";
// import slugify from "slugify";
import slugify from "slugify";
import type { ISach } from "../types/sach.ts";
import { GENRES } from "../types/sach.ts";

const sachSchema = new mongoose.Schema<ISach>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  slug: {
    type: String,
    trim: true,
    unique: true,
  },
  price: {
    original: { type: Number, required: true },
    sale: { type: Number, default: 0 },
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1,
  },
  publisher: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    ref: "NhaXuatBan",
  },
  author: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    enum: GENRES,
    trim: true,
    lowercase: true,
  },
  pages: {
    type: Number,
    min: 1,
  },
  language: {
    type: String,
    trim: true,
  },
  publishedDate: {
    type: Date,
    validate: {
      validator: function (value: Date) {
        return value <= new Date();
      },
    },
  },
  status: {
    type: Boolean,
    default: true,
  },
  coverImage: {
    type: String,
    trim: true,
    default: null
  },
  detailedImages: [
    {
      type: String,
      trim: true,
    },
  ],
});

sachSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    let newSlug: string = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
      locale: "vi",
    });

    const existingBookWithSlug = await mongoose
      .model("Sach")
      .findOne({ slug: newSlug });

    if (existingBookWithSlug) {
      newSlug = `${newSlug}-${Date.now().toString()}`;
    }

    this.slug = newSlug;
  }
  next();
});

const Sach = mongoose.model("Sach", sachSchema, "Sach");

export default Sach;
