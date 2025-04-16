require("dotenv").config();
const axios = require("axios");

const API_BASE_URL = process.env.API_BASE_URL;

const redirectIfLoggedIn = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) return next();

  try {
    const response = await axios.get(`${API_BASE_URL}/admin-users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    const user = response.data?.user;

    // if valid and has allowed role, redirect to dashboard
    const allowedRoles = [
      "superadmin",
      "admin",
      "sales",
      "moderator",
      "accounts",
    ];
    if (user && allowedRoles.includes(user.role)) {
      return res.redirect("/dashboard");
    }

    next(); // role not allowed → continue to login
  } catch (error) {
    // token invalid or expired → continue to login
    next();
  }
};

module.exports = { redirectIfLoggedIn };
