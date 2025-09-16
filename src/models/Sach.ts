import mongoose from "mongoose";
import slugify from "slugify";

const sachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    required: true,
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
  },
  publisher: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    ref: "NhaXuatBan",
  },
});

sachSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    const newSlug: string = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
      locale: "vi",
    });
    this.slug = newSlug;
  }
  next();
});

const Sach = mongoose.model("Sach", sachSchema);

export default Sach;
