const express = require("express");
const axios = require("axios");
const router = express.Router();
const {
  protectDashboard,
  protectByRoles,
} = require("../../middlewares/authWeb");
const API_BASE_URL = process.env.API_BASE_URL;

// inventory list
router.get(
  "/new-offer",
  protectDashboard,
  protectByRoles(["admin", "superadmin", "moderator", "accounts"]),
  async (req, res) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/overview`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
        },
      });

      const inventories = response.data || [];
      console.log(inventories);

      res.render("new-offer", {
        path: "/orders",
        pagePath: "/new-offer",
        user: req.user,
        title: "New offer",
        inventories,
      });
    } catch (error) {
      console.error("❌ Failed to fetch product:", error.message);
      res.status(500).render("error", {
        title: "Server Error",
        message: "Could not load product",
      });
    }
  }
);

module.exports = router;
