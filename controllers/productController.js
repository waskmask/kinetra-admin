const Product = require("../modals/Product");
const normalizePrice = require("../utils/normalizePrice");
// ✅ Add a new product
exports.addProduct = async (req, res) => {
  try {
    const {
      main_base,
      category,
      product_name,
      product_grade,
      unit_type,
      product_price,
      origin,
    } = req.body;

    const normalizedPrice = normalizePrice(product_price);
    if (normalizedPrice === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid price format",
      });
    }

    const newProduct = await Product.create({
      main_base,
      category,
      product_name,
      product_grade,
      unit_type,
      product_price: normalizedPrice,
      origin,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      main_base,
      category,
      product_name,
      product_grade,
      unit_type,
      origin,
      isActive,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Update only if fields are sent
    if (main_base !== undefined) product.main_base = main_base;
    if (category !== undefined) product.category = category;
    if (product_name !== undefined) product.product_name = product_name;
    if (product_grade !== undefined) product.product_grade = product_grade;
    if (unit_type !== undefined) product.unit_type = unit_type;
    if (origin !== undefined) product.origin = origin;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update only product price
exports.updateProductPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_price } = req.body;
    const adminUserId = req.user._id; // ✅ Get AdminUser ID from token (req.user)

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const normalizedPrice = normalizePrice(new_price);
    if (normalizedPrice === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid price format",
      });
    }

    const oldPrice = product.product_price;

    // ✅ Update price
    product.product_price = normalizedPrice;

    // ✅ Push a new price_change log
    product.price_change.push({
      changed_by: adminUserId,
      change_from: oldPrice,
      change_to: normalizedPrice,
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product price updated successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error updating product price:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ product_id: productId });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("❌ Error fetching single product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
