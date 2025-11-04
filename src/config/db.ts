import mongoose from "mongoose";

const connectionString =
  process.env.MONGODB_URI || "mongodb://localhost:27017/my_library";

const connect = async () => {
  try {
    const db = await mongoose.connect(connectionString);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
};

export default { connect };
