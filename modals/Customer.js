const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customer_id: { type: Number, unique: true, required: true },
    // fullname: { type: String, required: true, trim: true },
    company_name: { type: String, required: true, trim: true },
    address: {
      street: String,
      houseNo: String,
      postalCode: String,
      city: String,
      country: String,
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password: { type: String, required: true },
    tax_id: { type: String },
    representative: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["customer"], // optionally prepare for future roles
      default: "customer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
