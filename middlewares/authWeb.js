const axios = require("axios");
const API_BASE_URL = process.env.API_BASE_URL;

const ALLOWED_ROLES = ["superadmin", "admin", "sales", "moderator"];

const protectDashboard = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    // 🔒 Ask backend to verify the token and return user
    const response = await axios.get(`${API_BASE_URL}/admin-users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    const user = response.data?.user;

    // 🔐 Check if role is allowed
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      res.clearCookie("token");
      return res.redirect("/login");
    }

    // ✅ Attach user to request so we can use in EJS
    req.user = user;

    next();
  } catch (error) {
    console.error("❌ protectDashboard middleware failed:", error.message);
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

const protectByRoles = (allowedRoles = []) => {
  return async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
      return res.redirect("/login");
    }

    try {
      // ✅ Call backend to validate token
      const response = await axios.get(`${API_BASE_URL}/admin-users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const user = response.data?.user;

      // ❌ Not allowed
      if (!user || !allowedRoles.includes(user.role)) {
        res.clearCookie("token");
        return res.redirect("/dashboard"); // Or: /unauthorized
      }

      // ✅ User is allowed
      req.user = user;
      next();
    } catch (error) {
      console.error("❌ protectByRoles failed:", error.message);
      res.clearCookie("token");
      return res.redirect("/login");
    }
  };
};

module.exports = { protectDashboard, protectByRoles };
