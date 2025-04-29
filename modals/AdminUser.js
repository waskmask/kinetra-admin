const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    userId: { type: String, unique: true },
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
    country: { type: String, default: "germany" },
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

adminUserSchema.pre("save", async function (next) {
  if (this.isNew && !this.userId) {
    try {
      const lastUser = await mongoose
        .model("AdminUser")
        .findOne({})
        .sort({ createdAt: -1 })
        .select("userId");

      let nextId = "KI001";

      if (lastUser && lastUser.userId) {
        const lastNum = parseInt(lastUser.userId.slice(2), 10); // Get the numeric part
        const newNum = (lastNum + 1).toString().padStart(3, "0"); // Pad with zeros
        nextId = `KI${newNum}`;
      }

      this.userId = nextId;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("AdminUser", adminUserSchema);
