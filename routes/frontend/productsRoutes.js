const express = require("express");
const axios = require("axios");
const router = express.Router();
const {
  protectDashboard,
  protectByRoles,
} = require("../../middlewares/authWeb");
const API_BASE_URL = process.env.API_BASE_URL;

//add products
router.get(
  "/add-products",
  protectByRoles(["admin", "superadmin"]),
  protectDashboard,
  (req, res) => {
    console.log(req.user);
    res.render("add-products", {
      path: "/products",
      pagePath: "/add-products",
      title: "dashboard",
      user: req.user,
    });
  }
);

// all products
router.get("/products", protectDashboard, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${req.cookies.token}`, // 🔒 in case cookie is needed for API
      },
    });

    const products = response.data.products || [];
    console.log(products);

    res.render("products", {
      path: "/products",
      pagePath: "/all-products",
      user: req.user,
      title: "admin_users",
      products,
    });
  } catch (error) {
    console.error("❌ Failed to fetch cuisines:", error.message);
    res.render("products", {
      path: "/products",
      pagePath: "/all-products",
      title: "admin_users",
      user: req.user,
      products: [],
      error: "Could not load admin users",
    });
  }
});

// single product
router.get("/product/:productId", protectDashboard, async (req, res) => {
  try {
    const { productId } = req.params;

    const response = await axios.get(
      `${API_BASE_URL}/products/single/${productId}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${req.cookies.token}`, // 🔒 protect API
        },
      }
    );

    const product = response.data.product;
    console.log(product);

    if (!product) {
      return res.status(404).render("404", { title: "Product not found" });
    }

    res.render("single-product", {
      path: "/products",
      pagePath: "/single-product",
      user: req.user,
      title: product.product_name,
      product,
    });
  } catch (error) {
    console.error("❌ Failed to fetch product:", error.message);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Could not load product",
    });
  }
});

module.exports = router;
