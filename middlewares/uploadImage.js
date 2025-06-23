const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Allowed file extensions
const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];

// 🔒 File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PNG, JPG, JPEG, and WEBP image files are allowed"),
      false
    );
  }
};

// 🧠 Configure Multer (memory storage + filter + size limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

/**
 * ✅ Image Processor for single image upload
 * Converts to .webp, resizes to 1000px width, saves to uploads/YYYY/MM
 */
const processImage = (fieldName = "imagePath") => {
  return async (req, res, next) => {
    if (!req.file) return next();
    try {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const uploadDir = path.join(__dirname, "../uploads", year, month);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      req[fieldName] = await handleImageProcessing(
        req.file.buffer,
        uploadDir,
        year,
        month
      );
      next();
    } catch (err) {
      console.error("❌ Error processing image:", err);
      res.status(500).json({ message: "Image processing failed" });
    }
  };
};

const uploadCompanyAssets = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]);

/**
 * ✅ Image Processor for fields (e.g., logo + signature)
 */
const processImageField = (fieldName) => {
  return async (req, res, next) => {
    if (!req.files?.[fieldName]?.[0]) return next();
    try {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const uploadDir = path.join(__dirname, "../uploads", year, month);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      req[fieldName] = await handleImageProcessing(
        req.files[fieldName][0].buffer,
        uploadDir,
        year,
        month
      );
      next();
    } catch (err) {
      console.error(`❌ Error processing ${fieldName}:`, err);
      res.status(500).json({ message: "Image processing failed" });
    }
  };
};

// 🖼️ Image Conversion Logic
const handleImageProcessing = async (fileBuffer, uploadDir, year, month) => {
  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(uploadDir, filename);
  const relativePath = `/uploads/${year}/${month}/${filename}`;

  await sharp(fileBuffer)
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);

  return relativePath;
};

module.exports = {
  uploadImage: upload.single("image"), // for single image fields
  uploadCompanyAssets, // for logo + signature
  processImage, // use with upload.single()
  processImageField, // use with upload.fields()
};
