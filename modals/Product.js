const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: Number,
      unique: true,
    },
    main_base: {
      type: String,
      enum: ["energy_commodities"],
      required: true,
    },
    category: {
      type: String,
      enum: ["liquid", "solid"],
      required: true,
    },
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    product_grade: {
      type: String,
      required: true,
    },
    unit_type: {
      type: String,
      enum: ["M3", "Ltr", "MT", "KG", "TONS"],
      required: true,
    },
    product_price: {
      type: Number,
      required: true,
    },
    origin: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    price_change: [
      {
        changed_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AdminUser",
          required: true,
        },
        change_from: {
          type: Number,
          required: true,
        },
        change_to: {
          type: Number,
          required: true,
        },
        changed_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);
// 🛠 Pre-save hook to auto-generate product_id
productSchema.pre("save", async function (next) {
  if (!this.product_id) {
    const lastProduct = await mongoose
      .model("Product")
      .findOne({})
      .sort({ product_id: -1 });
    this.product_id = lastProduct ? lastProduct.product_id + 1 : 1;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
