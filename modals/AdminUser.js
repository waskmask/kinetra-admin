const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // Hashed
    role: {
      type: String,
      enum: [
        "superadmin",
        "admin",
        "sales",
        "moderator",
        "storage",
        "accounts",
      ],
    },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    country: { type: String, default: "DE" },
    tokenVersion: { type: Number, default: 0 },
    password_reset_logs: [
      {
        reset_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AdminUser",
        },
        reset_by_role: { type: String, enum: ["admin", "superadmin", "self"] },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AdminUser", adminUserSchema);
