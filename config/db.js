const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // optional but helps debug
    });

    global.dbConnected = true;

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      global.dbConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
      global.dbConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
      global.dbConnected = false;
    });
  } catch (error) {
    console.error("❌ Initial MongoDB connection error:", error.message);
    global.dbConnected = false;
  }
};

module.exports = connectDB;
