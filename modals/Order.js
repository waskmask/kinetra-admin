const mongoose = require("mongoose");

const additionalServiceSchema = new mongoose.Schema({
  service_name: { type: String, required: true },
  price: { type: Number, required: true },
  unit_type: {
    type: String,
    enum: ["M3", "Ltr", "MT", "KG", "TONS", "service"],
  },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
  vat: { type: Number },
});

const deliveryAddressSchema = new mongoose.Schema({
  street: String,
  houseNo: String,
  postalcode: String,
  city: String,
  phone: String,
  country: { type: String, default: "Germany" },
});

const orderSchema = new mongoose.Schema(
  {
    offer_id: { type: String, unique: true, sparse: true },
    order_id: { type: String, unique: true, sparse: true },
    offer_date: { type: Date },
    order_date: { type: Date },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    product_snapshot: {
      name: String,
      grade: String,
      unit_type: String,
    },
    customer_snapshot: {
      name: String,
      email: String,
      phone: String,
      address: {
        street: String,
        houseNo: String,
        postalcode: String,
        city: String,
        country: String,
      },
    },
    product_snapshot: {
      name: String,
      grade: String,
      unit_type: {
        type: String,
        enum: ["M3", "Ltr", "MT", "KG", "TONS"],
      },
    },

    customer_snapshot: {
      customer_id: String,
      company_name: String,
      email: String,
      phone: String,
      address: {
        street: String,
        houseNo: String,
        postalCode: String,
        city: String,
        country: String,
      },
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    company_snapshot: {
      company_name: String,
      email: String,
      phone: String,
      fax: String,
      signature: String,
      address: {
        street: String,
        postalCode: String,
        city: String,
        country: String,
      },
      bank_details: {
        bank_name: String,
        iban: String,
        bic_swift: String,
        bank_address: String,
      },
      registry: String,
      registry_no: String,
      tax_id: String,
      vat_id: String,
      representative: String,
      logo: String,
    },
    storage_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Storage",
      required: true,
    },
    quantity_ordered: { type: Number, required: true },

    order_amount: { type: Number, required: true },
    tax_amount: { type: Number },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    additional_services: [additionalServiceSchema],
    delivery_address: deliveryAddressSchema,
    offer_validity: { type: Date },
    prefer_delivery_date: { type: Date },
    orderStatus: {
      type: String,
      enum: ["offer", "active", "dispatched", "delivered", "cancelled"],
      default: "offer",
    },
    quantity_dispatched: { type: Number, default: 0 },
    quantity_delivered: { type: Number, default: 0 },
    delivery_note_img: { type: String },
    delivery_passcode: {
      type: String,
      required: function () {
        return this.orderStatus === "active";
      },
    },
    dispatched_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    dispatched_on: { type: Date },
    delivered_on: { type: Date },
    cancelled_on: { type: Date },
    timestamp: { type: String },
    currency: {
      type: String,
      default: "EUR",
      enum: ["EUR", "USD", "INR", "AED", "GBP", "SAR"],
    },
    vat_percentage: { type: Number },
    vat_amount: { type: Number },
    notes: { type: String },
    terms_and_conditions: { type: String },
    isConvertedToInvoice: { type: Boolean, default: false },
    title: { type: String, trim: true },
    offer_pdf_url: { type: String },
    lieferschein_pdf_url: { type: String },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const Order = mongoose.model("Order");

    if (this.orderStatus === "offer" && !this.offer_id) {
      const lastOffer = await Order.find({ offer_id: { $exists: true } })
        .sort({ offer_id: -1 })
        .limit(1);

      let nextOfferId = "OF100";
      if (lastOffer.length && lastOffer[0].offer_id) {
        const lastNum = parseInt(lastOffer[0].offer_id.slice(2), 10);
        const newNum = (lastNum + 1).toString();
        nextOfferId = `OF${newNum}`;
      }

      this.offer_id = nextOfferId;
      this.offer_date = new Date();
    }

    if (this.orderStatus === "active" && !this.order_id) {
      const lastOrder = await Order.find({ order_id: { $exists: true } })
        .sort({ order_id: -1 })
        .limit(1);

      let nextOrderId = "OR100";
      if (lastOrder.length && lastOrder[0].order_id) {
        const lastNum = parseInt(lastOrder[0].order_id.slice(2), 10);
        const newNum = (lastNum + 1).toString();
        nextOrderId = `OR${newNum}`;
      }

      this.order_id = nextOrderId;
      this.order_date = new Date();
    }
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);
