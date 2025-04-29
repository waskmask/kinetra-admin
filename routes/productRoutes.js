const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken, isAdminOrSuperAdmin } = require("../middlewares/auth");

// ✅ Add new product (POST /api/products)
router.post(
  "/",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(productController.addProduct)
);

// Update a product
router.patch(
  "/:id",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(productController.updateProduct)
);

// Update product price
router.patch(
  "/update-price/:id",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(productController.updateProductPrice)
);

// ✅ Get all products (GET /api/products)
router.get(
  "/",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(productController.getAllProducts)
);

router.get(
  "/single/:productId",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(productController.getSingleProduct)
);

module.exports = router;
