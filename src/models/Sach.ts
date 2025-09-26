import mongoose from "mongoose";
// import slugify from "slugify";
import slugify from "slugify";
import type { ISach } from "../types/sach.ts";
import { GENRES } from "../types/sach.ts";
import { normalizeVietnamese } from "../utils/normalize-vietnamese.ts";

const sachSchema = new mongoose.Schema<ISach>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  normalizedName: {
    type: String,
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
  normalizedAuthor: {
    type: String,
    lowercase: true,
  },
  genre: {
    type: String,
    enum: GENRES,
    trim: true,
    lowercase: true,
  },
  normalizedGenre: {
    type: String,
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
    default: null,
  },
  detailedImages: [
    {
      type: String,
      trim: true,
    },
  ],
});

sachSchema.index({ normalizedName: "text", normalizedAuthor: "text", normalizedGenre: "text" });

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

sachSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.normalizedName = normalizeVietnamese(this.name);
  }

  if (this.isModified("author")) {
    this.normalizedAuthor = normalizeVietnamese(this.author);
  }

  if (this.isModified("genre") && this.genre) {
    this.normalizedGenre = normalizeVietnamese(this.genre);
  }
  next();
});

sachSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate() as any;

  if (update.name) {
    update.normalizedName = normalizeVietnamese(update.name);
  }

  if (update.author) {
    update.normalizedAuthor = normalizeVietnamese(update.author);
  }

  if (update.genre) {
    update.normalizedGenre = normalizeVietnamese(update.genre);
  }

  next();
});

const Sach = mongoose.model("Sach", sachSchema, "Sach");

export default Sach;
