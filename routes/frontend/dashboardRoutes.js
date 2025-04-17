const express = require("express");
const axios = require("axios");
const router = express.Router();
const {
  protectDashboard,
  protectByRoles,
} = require("../../middlewares/authWeb");
const API_BASE_URL = process.env.API_BASE_URL;

//dashboard
router.get("/dashboard", protectDashboard, (req, res) => {
  console.log(req.user);
  res.render("dashboard", {
    path: "/dashboard",
    pagePath: "/dashboard",
    title: "dashboard",
    user: req.user,
  });
});

// admin users
router.get(
  "/admin-users",
  protectByRoles(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin-users/all?page=1&limit=10`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${req.cookies.token}`, // 🔒 in case cookie is needed for API
          },
        }
      );

      const admin_users = response.data.admins || [];
      console.log(admin_users);
      res.render("admin-users", {
        path: "/admin-users",
        user: req.user,
        title: "admin_users",
        admin_users,
      });
    } catch (error) {
      console.error("❌ Failed to fetch cuisines:", error.message);
      res.render("admin-users", {
        path: "/admin-users",
        user: req.user,
        title: "admin_users",
        admin_users: [],
        error: "Could not load admin users",
      });
    }
  }
);

// proxy route for pagination of the admin users table
router.get(
  "/admin-users/grid-data",
  protectByRoles(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const query = new URLSearchParams(req.query).toString();

      const response = await axios.get(
        `${API_BASE_URL}/admin-users/all?${query}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${req.cookies.token}`,
          },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error("❌ Proxy error for Grid.js:", error.message);
      res.status(500).json({ success: false, message: "Grid fetch failed" });
    }
  }
);

// admin-user profile page
router.get(
  "/admin-users/:id",
  protectByRoles(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin-users/${req.params.id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${req.cookies.token}`,
          },
        }
      );

      const adminUser = response.data?.user;

      res.render("admin-user", {
        path: "/admin-users",
        user: req.user,
        title: "admin_profile",
        adminUser,
      });
    } catch (error) {
      console.error("❌ Failed to load admin user:", error.message);
      res.render("admin-user", {
        path: "/admin-users",
        user: req.user,
        title: "admin_profile",
        adminUser: null,
        error: "Could not load admin user",
      });
    }
  }
);

// register new admin user
router.get(
  "/add-admin-user",
  protectByRoles(["admin", "superadmin"]),
  (req, res) => {
    res.render("add-admin-user", {
      path: "/admin-users",
      user: req.user,
      title: "add_admin_user",
    });
  }
);

module.exports = router;
