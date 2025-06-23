const Order = require("../modals/Order");
const Product = require("../modals/Product");
const Customer = require("../modals/Customer");
const Company = require("../modals/Company");
const Storage = require("../modals/Storage");
const path = require("path");
const {
  generateOfferPDF,
  generateLieferscheinPDF,
} = require("../utils/pdfGenerator");

const generatePasscode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.createOrderOrOffer = async (req, res) => {
  try {
    const {
      product_id,
      customer_id,
      company_id,
      storage_id,
      quantity_ordered,
      order_amount,
      tax_amount,
      additional_services,
      delivery_address,
      offer_validity,
      prefer_delivery_date,
      currency,
      vat_percentage,
      notes,
      terms_and_conditions,
      title,
      orderStatus, // "offer" or "active"
    } = req.body;

    if (!["offer", "active"].includes(orderStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid orderStatus" });
    }

    // Validate product
    const product = await Product.findOne({ _id: product_id, isActive: true });
    if (!product)
      return res.status(400).json({ message: "Product not found or inactive" });

    // Validate customer
    const customer = await Customer.findById(customer_id);
    if (!customer)
      return res.status(400).json({ message: "Customer not found" });

    // Validate company
    const company = await Company.findById(company_id);
    if (!company) return res.status(400).json({ message: "Company not found" });

    // Validate storage
    const storage = await Storage.findById(storage_id);
    if (!storage) return res.status(400).json({ message: "Storage not found" });

    const timestamp = new Date().toLocaleString("de-DE");

    const order = new Order({
      product_id,
      customer_id,
      company_id,
      storage_id,
      quantity_ordered,
      order_amount,
      tax_amount,
      additional_services,
      delivery_address,
      offer_validity,
      prefer_delivery_date,
      currency,
      vat_percentage,
      notes,
      terms_and_conditions,
      title,
      orderStatus,
      created_by: req.user._id,
      dispatched_by: orderStatus === "active" ? req.user._id : undefined,
      dispatched_on: orderStatus === "active" ? new Date() : undefined,
      timestamp,
      delivery_passcode:
        orderStatus === "active" ? generatePasscode() : undefined,

      // Snapshots
      product_snapshot: {
        name: product.product_name,
        grade: product.product_grade,
        unit_type: product.unit_type,
      },
      customer_snapshot: {
        customer_id: customer.customer_id,
        company_name: customer.company_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
      company_snapshot: {
        company_name: company.company_name,
        email: company.email,
        phone: company.phone,
        fax: company.fax,
        address: company.address,
        bank_details: company.bank_details,
        registry: company.registry,
        registry_no: company.registry_no,
        tax_id: company.tax_id,
        vat_id: company.vat_id,
        representative: company.representative,
        logo: company.logo,
      },
    });

    // 🧊 If status is active, hold inventory
    if (orderStatus === "active") {
      const productEntry = storage.products.find(
        (p) => p.product_id.toString() === product_id.toString()
      );

      if (!productEntry) {
        return res.status(400).json({
          success: false,
          message: "Product not found in selected storage",
        });
      }

      if (productEntry.quantity < quantity_ordered) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock to hold in storage",
        });
      }

      productEntry.quantity -= quantity_ordered;
      productEntry.held_quantity += quantity_ordered;

      productEntry.inventory.push({
        quantity: quantity_ordered,
        action: "held",
        performed_by: req.user._id,
      });

      await storage.save();
    }

    // Save order first to generate _id for PDF
    await order.save();

    // 📄 Generate offer PDF always
    const offerPDF = await generateOfferPDF(order);
    order.offer_pdf_url = `/uploads/pdfs/${offerPDF}`;

    // 📄 If active, generate Lieferschein too
    if (orderStatus === "active") {
      const lieferscheinPDF = await generateLieferscheinPDF(order);
      order.lieferschein_pdf_url = `/uploads/pdfs/${lieferscheinPDF}`;
    }

    await order.save(); // save PDF paths

    res.status(201).json({
      success: true,
      message: `${
        orderStatus === "offer" ? "Offer" : "Order"
      } created successfully`,
      order,
    });
  } catch (err) {
    console.error("❌ Error creating order/offer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
