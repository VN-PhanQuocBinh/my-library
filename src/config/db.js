const mongoose = require("mongoose");

const connect = async () => {
  try {
    const db = await mongoose.connect("mongodb://localhost:27017/my_library");
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
};

module.exports = { connect };
