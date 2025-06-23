const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken, isAdminOrSuperAdmin } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

// Create Offer or Active Order
router.post(
  "/",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(orderController.createOrderOrOffer)
);

module.exports = router;
