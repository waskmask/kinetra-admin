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
  "/inventory",
  protectDashboard,
  protectByRoles([
    "admin",
    "superadmin",
    "sales",
    "moderator",
    "storage",
    "accounts",
  ]),
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

      res.render("inventory", {
        path: "/inventory",
        pagePath: "/inventoryOverview",
        user: req.user,
        title: "Inventory",
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

// inventory logs
router.get(
  "/inventory/logs/:storageId/:productId",
  protectDashboard,
  protectByRoles([
    "admin",
    "superadmin",
    "sales",
    "moderator",
    "storage",
    "accounts",
  ]),
  async (req, res) => {
    const { storageId, productId } = req.params;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/inventory/logs/${storageId}/${productId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${req.cookies.token}`,
          },
        }
      );

      const inventoryLog = response.data || [];
      console.log(inventoryLog);

      res.render("inventory-logs", {
        path: "/inventory",
        pagePath: "/inventoryOverview",
        user: req.user,
        title: "Inventory logs",
        inventoryLog,
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

// update inventory
router.get(
  "/add-inventory",
  protectByRoles(["admin", "superadmin", "accounts"]),
  protectDashboard,
  async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get(
        `${API_BASE_URL}/admin-users/all?isActive=true&page=1&limit=100`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${req.cookies.token}`,
          },
        }
      );

      const admin_users = response.data.admins || [];
      const getStorages = await axios.get(`${API_BASE_URL}/storage/all`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
        },
      });

      const storages = getStorages.data || [];

      console.log(storages);

      res.render("add-inventory", {
        path: "/inventory",
        pagePath: "/addInventory",
        title: "Inventory",
        user: req.user,
        admin_users,
        storages,
      });
    } catch (error) {
      console.error("Failed to fetch:", error.message);
      res.render("add-inventory", {
        path: "/inventory",
        pagePath: "/addInventory",
        user: req.user,
        title: "admin_users",
        admin_users: [],
        storages: [],
        error: "Could not load admin users",
      });
    }
  }
);

// add inventory
router.get("/add-inventory/:storageId", protectDashboard, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${req.cookies.token}`, // 🔒 in case cookie is needed for API
      },
    });

    const products = response.data.products || [];
    console.log(products);

    const { storageId } = req.params;

    const storageData = await axios.get(
      `${API_BASE_URL}/storage/one/${storageId}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${req.cookies.token}`, // 🔒 protect API
        },
      }
    );

    const storage = storageData.data;

    res.render("add-inventory-storage", {
      path: "/inventory",
      pagePath: "/addInventory",
      user: req.user,
      title: "Add Inventory",
      products,
      storage,
    });
  } catch (error) {
    console.error("❌ Failed to fetch cuisines:", error.message);
    res.render("add-inventory-storage", {
      path: "/products",
      pagePath: "/addInventory",
      title: "Add Inventory",
      user: req.user,
      products: [],
      storage: [],
      error: "Could not load admin users",
    });
  }
});

module.exports = router;
