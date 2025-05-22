const express = require("express");
const router = express.Router();
const storageController = require("../controllers/storageController");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken, isAdminOrSuperAdmin } = require("../middlewares/auth");

router.post(
  "/",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(storageController.createStorage)
);
router.patch(
  "/:id",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(storageController.updateStorage)
);
router.get(
  "/all",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(storageController.getAllStorages)
);
router.get(
  "/one/:id",
  verifyToken,
  isAdminOrSuperAdmin,
  asyncHandler(storageController.getStorageById)
);

module.exports = router;
