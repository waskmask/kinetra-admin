const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");
    global.dbConnected = true;

    // Handle MongoDB events to update dbConnected globally
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

// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error("MongoDB error:", error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
