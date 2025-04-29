const mongoose = require("mongoose");

// Inventory log inside each product in a storage
const inventoryLogSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  action: {
    type: String,
    enum: ["added", "held", "removed", "dispatched"],
    required: true,
  },
  performed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminUser",
    required: true,
  },
});

// Product entry inside a storage
const productInStorageSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, default: 0 }, // available quantity
  held_quantity: { type: Number, default: 0 }, // blocked for invoices
  inventory: [inventoryLogSchema],
});

// Main Storage schema
const storageSchema = new mongoose.Schema(
  {
    storage_id: { type: String, unique: true },
    name: { type: String, required: true },
    address: {
      street_address: { type: String, required: true },
      postal_code: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: "Germany" },
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminUser",
      },
    ],
    products: [productInStorageSchema],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Auto-generate storage_id like ST001
storageSchema.pre("save", async function (next) {
  if (this.isNew && !this.storage_id) {
    try {
      const lastStorage = await mongoose
        .model("Storage")
        .findOne({})
        .sort({ createdAt: -1 })
        .select("storage_id");

      let nextId = "ST001";
      if (lastStorage && lastStorage.storage_id) {
        const lastNum = parseInt(lastStorage.storage_id.slice(2), 10);
        const newNum = (lastNum + 1).toString().padStart(3, "0");
        nextId = `ST${newNum}`;
      }

      this.storage_id = nextId;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Storage", storageSchema);
