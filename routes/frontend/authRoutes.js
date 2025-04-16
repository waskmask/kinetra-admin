const express = require("express");
const router = express.Router();
const adminUserController = require("../../controllers/adminUserController");
const { redirectIfLoggedIn } = require("../../middlewares/redirectIfLoggedIn");
const asyncHandler = require("../../utils/asyncHandler");
const {
  verifyToken,
  isAdminOrSuperAdmin,
  allAdminUsers,
  loggedInAdmin,
} = require("../../middlewares/auth");

// login page
router.get("/login", redirectIfLoggedIn, (req, res) => {
  res.render("login", {
    path: "/login",
    title: "login",
  });
});

//loggedIn admin user
router.get(
  "/me",
  verifyToken,
  loggedInAdmin, // ✅ use here
  asyncHandler(adminUserController.getLoggedInAdminUser)
);

module.exports = router;
