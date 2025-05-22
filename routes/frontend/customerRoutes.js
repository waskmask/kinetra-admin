const express = require("express");
const axios = require("axios");
const router = express.Router();
const {
  protectDashboard,
  protectByRoles,
} = require("../../middlewares/authWeb");
const API_BASE_URL = process.env.API_BASE_URL;

// add new customer
router.get(
  "/add-new-customer",
  protectByRoles(["superadmin", "admin"]),
  protectDashboard,
  async (req, res) => {
    try {
      res.render("add-new-customer", {
        title: "Add new customer",
        path: "/customers",
        pagePath: "/add-customer",
        title: "add_new_customer",
        user: req.user,
      });
    } catch (error) {
      console.error("Failed to fetch:", error.message);
      res.render("add-new-customer", {
        title: "Add new customer",
        path: "/customers",
        pagePath: "/add-customer",
        user: req.user,
        title: "add_new_customer",
      });
    }
  }
);

// all customers
router.get(
  "/customers",
  protectByRoles(["superadmin"]),
  protectDashboard,
  async (req, res) => {
    try {
      const getCustomers = await axios.get(`${API_BASE_URL}/customers`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
        },
      });
      const customers = getCustomers.data.customers || [];
      console.log(customers);
      res.render("customers", {
        title: "Customers",
        path: "/customers",
        pagePath: "/customers",
        title: "Storage",
        user: req.user,
        customers,
      });
    } catch (error) {
      console.error("Failed to fetch:", error.message);
      res.render("customers", {
        title: "Customers",
        path: "/customers",
        pagePath: "/customers",
        user: req.user,
        title: "customers",
        error: "Could not load customers",
        customers: [],
      });
    }
  }
);

// update a customer profile
router.get(
  "/update-customer/:id",
  protectByRoles(["superadmin"]),
  protectDashboard,
  async (req, res) => {
    try {
      const id = req.params.id;
      const response = await axios.get(`${API_BASE_URL}/customers/one/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
        },
      });

      const customer = response.data.customer;
      console.log(customer);

      res.render("update-customer", {
        title: "Update Customer",
        path: "/customers",
        pagePath: "/customer",
        user: req.user,
        customer,
      });
    } catch (error) {
      console.error("Fetch failed:", error.message);
      res.render("update-company-profile", {
        title: "Update Customer",
        path: "/customers",
        pagePath: "/customers",
        user: req.user,
        error: "Could not load customer data",
        customer: null,
      });
    }
  }
);

module.exports = router;
