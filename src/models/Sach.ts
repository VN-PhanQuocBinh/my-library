import mongoose from "mongoose";
// import slugify from "slugify";
import slugify from "slugify";
import type { ISach, ImageInfo } from "../types/sach.ts";
import { GENRES } from "../types/sach.ts";
import { normalizeVietnamese } from "../utils/normalize-vietnamese.ts";
import { generateEmbeddingWithHuggingFace } from "../services/ai.service.ts";
import { BOOK_EMBEDDING_CONFIG } from "../config/config.ts";

const VECTOR_INDEX_DEFINITION = {
  name: BOOK_EMBEDDING_CONFIG.SEARCH_INDEX_NAME,
  type: "vectorSearch",
  definition: {
    fields: [
      {
        path: BOOK_EMBEDDING_CONFIG.PATH,
        numDimensions: BOOK_EMBEDDING_CONFIG.DIMENSION,
        similarity: "cosine",
        type: "vector",
      },
    ],
  },
};

const sachSchema = new mongoose.Schema<ISach>(
  {
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
      type: {
        url: String,
        publicId: String,
        folder: String,
        originalName: String,
        size: Number,
        format: String,
        width: Number,
        height: Number,
        uploadedAt: Date,
      },
      default: null,
    },
    detailedImages: [
      {
        type: {
          url: String,
          publicId: String,
          folder: String,
          originalName: String,
          size: Number,
          format: String,
          width: Number,
          height: Number,
          uploadedAt: Date,
        },
        default: null,
      },
    ],

    embeddingVector: {
      type: [Number],
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

sachSchema.index({
  normalizedName: "text",
  normalizedAuthor: "text",
  normalizedGenre: "text",
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

sachSchema.pre("save", async function (next) {
  if (
    this.isModified("name") ||
    this.isModified("author") ||
    this.isModified("description")
  ) {
    const textToEmbed = `Book name: ${this.name}.\nAuthor: ${this.author}.\nDescription: ${this.description}`;
    const embedding = await generateEmbeddingWithHuggingFace(textToEmbed);

    if (embedding) {
      this.embeddingVector = embedding;
    } else {
      this.embeddingVector = null;
    }
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

sachSchema.statics.createVectorSearchIndex = async function () {
  try {
    const collection = mongoose.connection.collection("Sach");

    await collection.createSearchIndex(VECTOR_INDEX_DEFINITION);
    console.log("✅ Created Vector Search Index successfully.");
  } catch (error: any) {
    if (error.codeName === "IndexAlreadyExists") {
      console.log(
        "⚠️ Vector Search Index already exists, skipping index creation."
      );
    } else {
      console.error("❌ Error creating Vector Search Index:", error);
    }
  }
};

sachSchema.statics.dropVectorSearchIndex = async function () {
  try {
    const collection = mongoose.connection.collection("Sach");
    await collection.dropSearchIndex(BOOK_EMBEDDING_CONFIG.SEARCH_INDEX_NAME);
    console.log("✅ Dropped Vector Search Index successfully.");
  } catch (error: any) {
    if (error.codeName === "IndexNotFound") {
      console.log("⚠️ Vector Search Index not found, skipping index drop.");
    } else {
      console.error("❌ Error dropping Vector Search Index:", error);
    }
  }
};

const Sach = mongoose.model("Sach", sachSchema, "Sach");

export default Sach;
