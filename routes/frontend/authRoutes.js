const express = require("express");
const router = express.Router();
const axios = require("axios");
const adminUserController = require("../../controllers/adminUserController");
const { redirectIfLoggedIn } = require("../../middlewares/redirectIfLoggedIn");
const {
  protectDashboard,
  protectByRoles,
} = require("../../middlewares/authWeb");
const asyncHandler = require("../../utils/asyncHandler");
const {
  verifyToken,
  isAdminOrSuperAdmin,
  allAdminUsers,
  loggedInAdmin,
} = require("../../middlewares/auth");
const API_BASE_URL = process.env.API_BASE_URL;

// login page
router.get("/", redirectIfLoggedIn, (req, res) => {
  res.render("login", {
    path: "/login",
    title: "login",
  });
});

//logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

//loggedIn admin user
router.get(
  "/me",
  verifyToken,
  loggedInAdmin, // ✅ use here
  asyncHandler(adminUserController.getLoggedInAdminUser)
);

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
        pagePath: "/admin-users",
        user: req.user,
        title: "admin_users",
        admin_users,
      });
    } catch (error) {
      console.error(" Failed to fetch:", error.message);
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

// admin user proxy route
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
          headers: { Authorization: `Bearer ${req.cookies.token}` },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error("❌ Proxy error for Grid.js:", error.message);
      res.status(500).json({ success: false, message: "Grid fetch failed" });
    }
  }
);

// add admin users
router.get(
  "/add-admin-users",
  protectByRoles(["admin", "superadmin"]),
  async (req, res) => {
    try {
      res.render("add-admin-users", {
        path: "/admin-users",
        pagePath: "/add-admin-users",
        user: req.user,
        title: "add_new_user",
      });
    } catch (error) {
      res.render("admin-users", {
        path: "/admin-users",
        user: req.user,
        title: "add_new_user",
      });
    }
  }
);

// single admin user
router.get(
  "/admin-users/:id",
  protectByRoles(["admin", "superadmin"]),
  async (req, res) => {
    const { id } = req.params;

    // Prevent viewing yourself
    if (req.user._id === id) {
      return res.redirect("/admin-users"); // or render with an error
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/admin-users/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
        },
      });

      const adminUser = response.data.user;

      res.render("admin-user", {
        path: "/admin-users",
        pagePath: "/admin-user",
        user: req.user,
        title: "admin_users",
        adminUser,
      });
    } catch (error) {
      console.error("❌ Failed to fetch admin user:", error.message);
      res.render("admin-user", {
        path: "/admin-users",
        pagePath: "/admin-users",
        user: req.user,
        title: "admin_users",
        adminUser: null,
        error: "Could not load admin user",
      });
    }
  }
);

module.exports = router;
