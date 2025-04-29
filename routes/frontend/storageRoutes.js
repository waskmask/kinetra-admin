const express = require("express");
const axios = require("axios");
const router = express.Router();
const {
  protectDashboard,
  protectByRoles,
} = require("../../middlewares/authWeb");
const API_BASE_URL = process.env.API_BASE_URL;

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
