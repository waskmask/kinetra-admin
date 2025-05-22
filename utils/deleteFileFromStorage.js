const fs = require("fs");
const path = require("path");

/**
 * Delete a file from local storage
 * @param {string} relativePath - e.g., "/uploads/2025/05/filename.webp"
 */
const deleteFileFromStorage = (relativePath) => {
  if (!relativePath) return;

  const fullPath = path.join(__dirname, "..", relativePath);

  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error(`❌ Failed to delete file: ${relativePath}`, err);
    } else {
      console.log(`🗑️ Deleted file: ${relativePath}`);
    }
  });
};

module.exports = deleteFileFromStorage;
