const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    fax: { type: String },
    isActive: { type: Boolean, default: true },
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
  {
    timestamps: true,
  }
);

CompanySchema.index(
  { company_name: 1, "address.street": 1, "address.postalCode": 1 },
  { unique: true }
);

module.exports = mongoose.model("Company", CompanySchema);
