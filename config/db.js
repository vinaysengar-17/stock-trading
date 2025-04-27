import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const DB_OPTIONS = {
      dbName: "stock",
    };
    await mongoose.connect(process.env.MONGO_URI, DB_OPTIONS);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
