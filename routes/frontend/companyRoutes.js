const express = require("express");
const axios = require("axios");
const router = express.Router();
const {
  protectDashboard,
  protectByRoles,
} = require("../../middlewares/authWeb");
const API_BASE_URL = process.env.API_BASE_URL;

// add new company profile
router.get(
  "/add-company-profile",
  protectByRoles(["superadmin"]),
  protectDashboard,
  async (req, res) => {
    try {
      res.render("add-company-profile", {
        title: "Add new company",
        path: "/companies",
        pagePath: "/company",
        title: "Storage",
        user: req.user,
      });
    } catch (error) {
      console.error("Failed to fetch:", error.message);
      res.render("add-company-profile", {
        title: "Add new company",
        path: "/companies",
        pagePath: "/company",
        user: req.user,
        title: "company_profile",
        error: "Could not load companies",
      });
    }
  }
);

// all company profiles
router.get(
  "/company-profile",
  protectByRoles(["superadmin"]),
  protectDashboard,
  async (req, res) => {
    try {
      const getCompanies = await axios.get(
        `${API_BASE_URL}/company/profile/all`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${req.cookies.token}`,
          },
        }
      );
      const companies = getCompanies.data.companies || [];
      console.log(companies);
      res.render("companies", {
        title: "Add new company",
        path: "/companies",
        pagePath: "/company",
        title: "Storage",
        user: req.user,
        companies,
      });
    } catch (error) {
      console.error("Failed to fetch:", error.message);
      res.render("companies", {
        title: "Add new company",
        path: "/companies",
        pagePath: "/company",
        user: req.user,
        title: "company_profile",
        error: "Could not load companies",
        companies: [],
      });
    }
  }
);

// update company profile
router.get(
  "/update-company-profile/:id",
  protectByRoles(["superadmin"]),
  protectDashboard,
  async (req, res) => {
    try {
      const id = req.params.id;
      const response = await axios.get(
        `${API_BASE_URL}/company/profile/one/${id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${req.cookies.token}`,
          },
        }
      );

      const company = response.data.company;
      res.render("update-company-profile", {
        title: "Update Company",
        path: "/companies",
        pagePath: "/company",
        user: req.user,
        company,
      });
    } catch (error) {
      console.error("Fetch failed:", error.message);
      res.render("update-company-profile", {
        title: "Update Company",
        path: "/companies",
        pagePath: "/company",
        user: req.user,
        error: "Could not load company data",
        company: null,
      });
    }
  }
);

module.exports = router;
