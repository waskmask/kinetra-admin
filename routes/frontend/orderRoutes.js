const express = require("express");
const axios = require("axios");
const router = express.Router();
const {
  protectDashboard,
  protectByRoles,
} = require("../../middlewares/authWeb");
const API_BASE_URL = process.env.API_BASE_URL;

// new offer
router.get(
  "/new-offer",
  protectDashboard,
  protectByRoles(["admin", "superadmin", "moderator", "accounts"]),
  async (req, res) => {
    try {
      const inventories = await axios.get(
        `${API_BASE_URL}/inventory/overview`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${req.cookies.token}`,
          },
        }
      );

      const inventoryList = inventories.data || [];
      console.log(inventoryList);

      const companies = await axios.get(`${API_BASE_URL}/company/profile/all`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
        },
      });

      const companyList = companies.data.companies || [];
      console.log(companyList);

      const getCustomers = await axios.get(`${API_BASE_URL}/customers`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
        },
      });
      const customers = getCustomers.data.customers || [];
      console.log(customers);

      res.render("new-offer", {
        path: "/orders",
        pagePath: "/new-offer",
        user: req.user,
        title: "New offer",
        companyList,
        customers,
        inventoryList: inventoryList.data,
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
