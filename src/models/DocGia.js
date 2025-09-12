const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require("bcryptjs");

const DocGiaSchema = new Schema(
  {
    firstname: { type: String, required: true, unique: true },
    lastname: { type: String, required: true },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
      default: "other",
    },
    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v <= new Date();
        },
        message: "Date of birth cannot be in the future",
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
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
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    passwordHash: { type: String, required: true },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

DocGiaSchema.methods.comparePassword = (passwrord) => {
  return bcrypt.compare(passwrord, this.passwordHash);
};

module.exports = mongoose.model("DocGia", DocGiaSchema);
