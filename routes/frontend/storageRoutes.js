const express = require("express");
const axios = require("axios");
const router = express.Router();
const {
  protectDashboard,
  protectByRoles,
} = require("../../middlewares/authWeb");
const API_BASE_URL = process.env.API_BASE_URL;

// all storages
router.get(
  "/storages",
  protectByRoles([
    "admin",
    "superadmin",
    "sales",
    "moderator",
    "storage",
    "accounts",
  ]),
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

      res.render("storages", {
        path: "/storage",
        pagePath: "/storage",
        title: "Storage",
        user: req.user,
        admin_users,
        storages,
      });
    } catch (error) {
      console.error("Failed to fetch:", error.message);
      res.render("storages", {
        path: "/storage",
        pagePath: "/storage",
        user: req.user,
        title: "admin_users",
        admin_users: [],
        storages: [],
        error: "Could not load admin users",
      });
    }
  }
);

// single storage
router.get(
  "/storages/:storageId",
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
      const { storageId } = req.params;

      const response = await axios.get(
        `${API_BASE_URL}/storage/one/${storageId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${req.cookies.token}`, // 🔒 protect API
          },
        }
      );

      const storage = response.data;

      // inventory
      const inventoryData = await axios.get(
        `${API_BASE_URL}/inventory/by-storage/${storageId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${req.cookies.token}`, // 🔒 protect API
          },
        }
      );

      const inventory = inventoryData.data || [];
      console.log(JSON.stringify(inventory, null, 2));

      if (!storage) {
        return res
          .status(404)
          .render("errors/404", { title: "Storage not found" });
      }
      console.log(storage);

      res.render("single-storage", {
        path: "/storage",
        pagePath: "/single-storage",
        user: req.user,
        title: storage.name,
        storage,
        inventory,
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

// add storage
router.get(
  "/add-storage",
  protectByRoles(["admin", "superadmin"]),
  protectDashboard,
  async (req, res) => {
    try {
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

      res.render("add-storage", {
        path: "/storage",
        pagePath: "/add-storage",
        title: "Add storage",
        user: req.user,
        admin_users,
      });
    } catch (error) {
      console.error("Failed to fetch:", error.message);
      res.render("add-storage", {
        path: "/storage",
        pagePath: "/add-storage",
        user: req.user,
        title: "admin_users",
        admin_users: [],
        error: "Could not load admin users",
      });
    }
  }
);

// update storage
router.get(
  "/update-storage/:id",
  protectByRoles(["admin", "superadmin"]),
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
      const getStorage = await axios.get(`${API_BASE_URL}/storage/one/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
        },
      });
      const storage = getStorage.data || [];
      console.log(storage);
      res.render("update-storage", {
        path: "/storage",
        pagePath: "/update-storage",
        title: "Update storage",
        user: req.user,
        admin_users,
        storage,
      });
    } catch (error) {
      console.error("Failed to fetch:", error.message);
      res.render("update-storage", {
        path: "/storage",
        pagePath: "/update-storage",
        user: req.user,
        title: "admin_users",
        admin_users: [],
        storage: [],
        error: "Could not load admin users",
      });
    }
  }
);

module.exports = router;
