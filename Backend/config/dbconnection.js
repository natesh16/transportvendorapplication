const mongoose = require("mongoose");

mongoose.set("autoIndex", process.env.NODE_ENV !== "production");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_local, {
      autoIndex: false,
      serverSelectionTimeoutMS: 5000
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
