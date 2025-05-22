// routes/inventoryRoutes.js
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const asyncHandler = require("../utils/asyncHandler");
const {
  verifyToken,
  isAdminOrSuperAdmin,
  allAdminUsers,
} = require("../middlewares/auth");

router.post(
  "/storage/:id/add-inventory",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(inventoryController.addInventoryToStorage)
);

router.delete(
  "/storage/:storageId/product/:productId/inventory/:inventoryId",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(inventoryController.softDeleteInventoryLog)
);

// Overview of all inventories across storages
router.get(
  "/overview",
  verifyToken,
  allAdminUsers,
  asyncHandler(inventoryController.getInventoryOverview)
);

// Logs for a specific product in a specific storage
router.get(
  "/logs/:storageId/:productId",
  verifyToken,
  allAdminUsers,
  asyncHandler(inventoryController.getInventoryLogsByProductFromStorage)
);

// get inventory by storage id
router.get(
  "/by-storage/:storageId",
  verifyToken,
  allAdminUsers,
  asyncHandler(inventoryController.getInventoryByStorageId)
);

module.exports = router;
