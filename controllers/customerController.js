const Customer = require("../modals/Customer");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const getCookieOptions = require("../utils/cookieOptions");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");

let customerIdCounter = 10000; // This should ideally be handled in the DB for concurrency safety

exports.createCustomer = async (req, res, next) => {
  try {
    const {
      company_name,
      address,
      email,
      phone,
      password,
      tax_id,
      representative,
    } = req.body;

    // Check for existing email
    const existing = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existing) {
      return res.status(400).json({ message: "email_already_exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assign new customer ID
    const lastCustomer = await Customer.findOne().sort({ customer_id: -1 });
    const newCustomerId = lastCustomer
      ? lastCustomer.customer_id + 1
      : customerIdCounter;

    const customer = await Customer.create({
      customer_id: newCustomerId,
      company_name: company_name.trim(),
      address,
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
      tax_id,
      representative: representative?.trim(),
    });

    res
      .status(201)
      .json({ success: true, message: "customer_created", customer });
  } catch (error) {
    next(error);
  }
};

exports.loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });
    if (!customer) {
      return res.status(400).json({ message: "invalid_email_or_password" });
    }

    // ❌ Block inactive accounts
    if (!customer.isActive) {
      return res.status(403).json({ message: "account_inactive" });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "invalid_email_or_password" });
    }

    const token = generateToken(customer); // ✅ reuse shared token generator

    const sanitizedCustomer = {
      id: customer._id,
      customer_id: customer.customer_id,
      company_name: customer.company_name,
      email: customer.email,
      role: customer.role,
      representative: customer.representative,
    };

    res.cookie("token", token, getCookieOptions()); // ✅ set HttpOnly cookie

    res.status(200).json({
      success: true,
      message: "login_successful",
      token,
      customer: sanitizedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "customer_not_found" });
    res.status(200).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!customer) {
      return res.status(404).json({ message: "account_not_found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expireTime = Date.now() + 60 * 60 * 1000; // 1 hour

    customer.resetPasswordToken = token;
    customer.resetPasswordExpires = expireTime;
    await customer.save();

    const resetUrl = `${process.env.FRONTEND_URL}/customer/reset-password/${token}`;
    const templatePath = path.join(
      __dirname,
      "../emails/customer-reset-password.html"
    );

    let emailTemplate = await fs.readFile(templatePath, "utf-8");

    emailTemplate = emailTemplate
      .replace("{company_name}", customer.company_name)
      .replace("{resetUrl}", resetUrl);
    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_USER}>`,
      to: customer.email,
      subject: "Password Reset Request",
      html: `<p>Hi ${customer.company_name},</p>
             <p>You requested a password reset. Click the link below to reset it:</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>This link is valid for 1 hour.</p>`,
    });

    res.status(200).json({ message: "reset_email_sent" });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const customer = await Customer.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!customer) {
      return res.status(400).json({ message: "invalid_or_expired_token" });
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();

    res.status(200).json({ message: "password_reset_successful" });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "customer_not_found" });
    }

    const {
      company_name,
      address,
      email,
      phone,
      tax_id,
      representative,
      isActive,
    } = req.body;

    if (!company_name || !email || !phone || !address) {
      return res.status(400).json({ message: "missing_required_fields" });
    }

    // Email check if changed
    if (email !== customer.email) {
      const emailTaken = await Customer.findOne({ email });
      if (emailTaken) {
        return res.status(400).json({ message: "email_already_exists" });
      }
    }

    customer.company_name = company_name;
    customer.address = address;
    customer.email = email;
    customer.phone = phone;
    customer.tax_id = tax_id || undefined; // remove if empty string
    customer.representative = representative || undefined;
    customer.isActive =
      typeof isActive === "boolean" ? isActive : customer.isActive;

    await customer.save();

    res
      .status(200)
      .json({ success: true, message: "customer_updated", customer });
  } catch (error) {
    next(error);
  }
};
