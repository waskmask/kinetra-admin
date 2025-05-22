const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const companyController = require("../controllers/companyController");
const { verifyToken, isSuperAdmin } = require("../middlewares/auth");

const { uploadImage, processImage } = require("../middlewares/uploadImage"); // adjust path if different

router.post(
  "/profile",
  verifyToken,
  isSuperAdmin,
  uploadImage, // ⬅️ multer handles file upload
  processImage("logo"), // ⬅️ sets req.logo = saved file path
  asyncHandler(companyController.createCompany)
);

router.get(
  "/profile/all",
  verifyToken,
  isSuperAdmin,
  asyncHandler(companyController.getAllCompanies)
);

// single company
router.get(
  "/profile/one/:id",
  verifyToken,
  isSuperAdmin,
  asyncHandler(companyController.getCompanyById)
);

router.patch(
  "/profile/:id",
  verifyToken,
  isSuperAdmin,
  uploadImage,
  processImage("logo"),
  asyncHandler(companyController.updateCompany)
);

module.exports = router;
