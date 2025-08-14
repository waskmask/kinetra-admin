const Order = require("../modals/Order");
const Product = require("../modals/Product");
const Customer = require("../modals/Customer");
const Company = require("../modals/Company");
const Storage = require("../modals/Storage");
const {
  generateOfferPDF,
  generateLieferscheinPDF,
  generateOrderPDF,
} = require("../utils/pdfGenerator");

const generatePasscode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

function normalizeAmount(input) {
  if (typeof input === "string") {
    input = input.replace(/\./g, "").replace(",", ".");
  }
  const parsed = parseFloat(input);
  return isNaN(parsed) ? 0 : Number(parsed.toFixed(4));
}

exports.createOrderOrOffer = async (req, res) => {
  try {
    const {
      product_id,
      customer_id,
      company_id,
      storage_id,
      quantity_ordered,
      product_price,
      product_vat,
      product_price_total,
      product_vat_total,
      vat_amount,
      sub_total,
      total_amount,
      additional_services = [],
      delivery_address,
      offer_validity,
      prefer_delivery_date,
      currency,
      notes,
      terms_and_conditions,
      title,
      orderStatus,
    } = req.body;

    if (!product_id || !customer_id || !company_id || !storage_id)
      return res
        .status(400)
        .json({ success: false, message: "missing_fields" });

    if (!quantity_ordered || Number(quantity_ordered) <= 0)
      return res
        .status(400)
        .json({ success: false, message: "invalid_quantity_ordered" });

    if (!product_price || !product_price_total)
      return res
        .status(400)
        .json({ success: false, message: "invalid_price_data" });

    if (!offer_validity || !prefer_delivery_date)
      return res.status(400).json({ success: false, message: "missing_dates" });

    if (!orderStatus || !["offer", "active"].includes(orderStatus))
      return res
        .status(400)
        .json({ success: false, message: "invalid_orderStatus" });

    const product = await Product.findOne({ _id: product_id, isActive: true });
    if (!product)
      return res
        .status(400)
        .json({ success: false, message: "product_not_found_or_inactive" });

    const customer = await Customer.findById(customer_id);
    if (!customer)
      return res
        .status(400)
        .json({ success: false, message: "customer_not_found" });

    const company = await Company.findById(company_id);
    if (!company)
      return res
        .status(400)
        .json({ success: false, message: "company_not_found" });

    const storage = await Storage.findById(storage_id);
    if (!storage)
      return res
        .status(400)
        .json({ success: false, message: "storage_not_found" });

    // Normalize numbers from frontend
    const normalizedServices = additional_services.map((service) => ({
      ...service,
      price: normalizeAmount(service.price),
      quantity: normalizeAmount(service.quantity),
      total: normalizeAmount(service.total),
      vat: normalizeAmount(service.vat),
      service_vat_total: normalizeAmount(service.service_vat_total),
    }));

    const timestamp = new Date().toLocaleString("de-DE");

    const order = new Order({
      product_id,
      customer_id,
      company_id,
      storage_id,
      quantity_ordered,
      product_price: normalizeAmount(product_price),
      product_vat: normalizeAmount(product_vat),
      product_vat_total: normalizeAmount(product_vat_total),
      product_price_total: normalizeAmount(product_price_total),
      vat_amount: normalizeAmount(vat_amount),
      sub_total: normalizeAmount(sub_total),
      total_amount: normalizeAmount(total_amount),
      additional_services: normalizedServices,
      delivery_address,
      offer_validity,
      prefer_delivery_date,
      currency,
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
        signature: company.signature,
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

    // Handle inventory
    if (orderStatus === "active") {
      const productEntry = storage.products.find(
        (p) => p.product_id.toString() === product_id.toString()
      );

      if (!productEntry)
        return res.status(400).json({
          success: false,
          message: "product_not_found_in_selected_storage",
        });

      if (productEntry.quantity < quantity_ordered)
        return res.status(400).json({
          success: false,
          message: "insufficient_stock_to_hold_in_storage",
        });

      productEntry.quantity -= quantity_ordered;
      productEntry.held_quantity += quantity_ordered;
      productEntry.inventory.push({
        quantity: quantity_ordered,
        action: "held",
        performed_by: req.user._id,
      });

      await storage.save();
    }

    await order.save();

    // PDFs
    if (orderStatus === "offer") {
      const offerPDF = await generateOfferPDF(order);
      order.offer_pdf_url = `/uploads/pdfs/${offerPDF}`;
    } else {
      const orderPDF = await generateOrderPDF(order);
      const lieferscheinPDF = await generateLieferscheinPDF(order);
      order.order_pdf_url = `/uploads/pdfs/${orderPDF}`;
      order.lieferschein_pdf_url = `/uploads/pdfs/${lieferscheinPDF}`;
    }

    await order.save();

    res.status(201).json({
      success: true,
      message: `${
        orderStatus === "offer" ? "Offer" : "Order"
      } created_successfully`,
      order,
    });
  } catch (err) {
    console.error("❌ Error creating order/offer:", err);
    res.status(500).json({ success: false, message: "server_error" });
  }
};
