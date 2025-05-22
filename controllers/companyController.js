const Company = require("../modals/Company");
const deleteFileFromStorage = require("../utils/deleteFileFromStorage");

exports.createCompany = async (req, res, next) => {
  try {
    const {
      company_name,
      email,
      phone,
      fax,
      address,
      bank_details,
      registry,
      registry_no,
      tax_id,
      vat_id,
      representative,
    } = req.body;

    const normalizeText = (text) =>
      typeof text === "string" ? text.trim().replace(/\s+/g, " ") : "";

    const normalizedCompanyName = normalizeText(company_name);
    const normalizedEmail = email.toLowerCase().trim();

    const normalizedAddress = {
      street: normalizeText(address?.street),
      postalCode: normalizeText(address?.postalCode),
      city: normalizeText(address?.city),
      country: normalizeText(address?.country),
    };

    // 🔒 Check for duplicate email
    const existingEmail = await Company.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: "email_already_exists" });
    }

    // 🧭 Check for duplicate company (same name + same address)
    const existingCompany = await Company.findOne({
      company_name: normalizedCompanyName,
      "address.street": normalizedAddress.street,
      "address.postalCode": normalizedAddress.postalCode,
    });

    if (existingCompany) {
      return res
        .status(400)
        .json({ message: "company_already_exists_at_address" });
    }

    // 🏢 Create the company with logo
    const newCompany = await Company.create({
      company_name: normalizedCompanyName,
      email: normalizedEmail,
      phone,
      fax,
      isActive: true,
      address: normalizedAddress,
      bank_details,
      registry,
      registry_no,
      tax_id,
      vat_id,
      representative,
      logo: req.logo || null, // ✅ add processed logo path
    });

    res.status(201).json({
      success: true,
      message: "company_created_successfully",
      company: newCompany,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, companies });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "company_not_found" });
    }
    res.status(200).json({ success: true, company });
  } catch (error) {
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const companyId = req.params.id;

    const {
      company_name,
      email,
      phone,
      fax,
      address,
      bank_details,
      registry,
      registry_no,
      tax_id,
      vat_id,
      representative,
      isActive,
      remove_logo,
    } = req.body;

    const normalizeText = (text) =>
      typeof text === "string" ? text.trim().replace(/\s+/g, " ") : "";

    const normalizedCompanyName = normalizeText(company_name);
    const normalizedEmail = email.toLowerCase().trim();

    const normalizedAddress = {
      street: normalizeText(address?.street),
      postalCode: normalizeText(address?.postalCode),
      city: normalizeText(address?.city),
      country: normalizeText(address?.country),
    };

    // Check if another company exists at same address (not the current one)
    const duplicateCompany = await Company.findOne({
      _id: { $ne: companyId },
      company_name: normalizedCompanyName,
      "address.street": normalizedAddress.street,
      "address.postalCode": normalizedAddress.postalCode,
    });

    if (duplicateCompany) {
      return res.status(400).json({
        message: "company_already_exists_at_address",
      });
    }

    // Fetch current company to check/remove logo
    const currentCompany = await Company.findById(companyId);
    if (!currentCompany) {
      return res.status(404).json({ message: "company_not_found" });
    }

    const updateFields = {
      company_name: normalizedCompanyName,
      email: normalizedEmail,
      phone,
      fax,
      isActive,
      address: normalizedAddress,
      bank_details,
      registry,
      registry_no,
      tax_id,
      vat_id,
      representative,
    };

    // ✅ Remove logo if requested
    if (remove_logo === "true" && currentCompany.logo) {
      await deleteFileFromStorage(currentCompany.logo); // Your function
      updateFields.logo = null;
    }

    // ✅ Add new logo if uploaded
    if (req.logo) {
      updateFields.logo = req.logo;
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "company_updated_successfully",
      company: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};
