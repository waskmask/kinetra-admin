const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const asyncHandler = require("../utils/asyncHandler");
const {
  verifyToken,
  isSuperAdmin,
  allAdminUsers,
  canAccessSharedResource,
} = require("../middlewares/auth");

const passport = require("passport");

// Add customer
router.post(
  "/",
  verifyToken,
  isSuperAdmin,
  asyncHandler(customerController.createCustomer)
);

// login customers
router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local-customer",
    { session: false },
    (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .json({ message: info.message || "Unauthorized" });
      }

      req.user = user;
      return customerController.loginCustomer(req, res, next);
    }
  )(req, res, next);
});

// Get all customers
router.get(
  "/",
  verifyToken,
  allAdminUsers,
  asyncHandler(customerController.getAllCustomers)
);

// Get single customer by ID
router.get(
  "/one/:id",
  verifyToken,
  canAccessSharedResource,
  asyncHandler(customerController.getCustomerById)
);

// forgot password
router.post(
  "/forgot-password",
  asyncHandler(customerController.forgotPassword)
);
router.post("/reset-password", asyncHandler(customerController.resetPassword));

// Update customer by ID
router.put(
  "/update/:id",
  verifyToken,
  isSuperAdmin,
  asyncHandler(customerController.updateCustomer)
);

module.exports = router;
