const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const i18n = require("i18n");
const connectDB = require("./config/db");
const passport = require("./utils/passport");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");
const path = require("path");
const adminRoutes = require("./routes/adminAuthRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const productRoutes = require("./routes/productRoutes");
const storageRoutes = require("./routes/storageRoutes");

// frontend routes
const frontentAuthRoutes = require("./routes/frontend/authRoutes");
const frontentdashboardRoutes = require("./routes/frontend/dashboardRoutes");
const frontentProductsRoutes = require("./routes/frontend/productsRoutes");
const frontentStorageRoutes = require("./routes/frontend/storageRoutes");

// i18n
const acceptedLanguages = i18n.getLocales();
dotenv.config();

const app = express();

i18n.configure({
  locales: ["en", "de"],
  directory: path.join(__dirname, "locales"), // Path to store translation files
  defaultLocale: "en",
  cookie: "i18n", // Use cookies to remember user preference
  queryParameter: "lang", // Allow ?lang= parameter to change language
  fallbackLocale: "en", // Default locale if none is found in the acceptedLanguages array
  header: "accept-language",
  objectNotation: true, // Enable JSON notation for i18n.t() function
});

app.use(i18n.init);
// 🧠 Set EJS as view engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const whitelist = ["http://localhost:3000"]; // frontend origin

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ allows cookies
  })
);

app.use((req, res, next) => {
  const browserLang =
    req.acceptsLanguages(acceptedLanguages) || i18n.getDefaultLocale();
  i18n.setLocale(req, browserLang);
  next();
});
// Init i18n middleware
app.use(i18n.init);

app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(passport.initialize());

app.get("/ping", (req, res) => {
  return res.json({ success: true, dbConnected: global.dbConnected || false });
});

// Block all routes if DB is offline
app.use((req, res, next) => {
  if (req.path === "/ping") return next(); // allow /ping even if offline
  if (global.dbConnected === false) {
    return res.status(503).json({
      success: false,
      message: "You are offline. Please try again later.",
    });
  }
  next();
});

//api routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin-users", adminUserRoutes);
app.use("/api/products", productRoutes);
app.use("/api/storage", storageRoutes);

//frontend admin routes
app.use(frontentAuthRoutes);
app.use(frontentdashboardRoutes);
app.use(frontentProductsRoutes);
app.use(frontentStorageRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use(errorHandler);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
});

// 404 Not Found
app.use((req, res, next) => {
  res.status(404).render("errors/404", {
    path: req.originalUrl,
    user: req.user || null,
    title: "page_not_found",
  });
});

// 500 Internal Server Error
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Server Error:", err.stack);
  res.status(500).render("errors/500", {
    path: req.originalUrl,
    user: req.user || null,
    title: "server_error",
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
    console.warn("⚠️ Starting server without DB connection (offline mode)");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
