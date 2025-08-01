const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const AdminUser = require("../modals/AdminUser");
const Customer = require("../modals/Customer");

passport.use(
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const user = await AdminUser.findOne({ email });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        if (!user.isActive) {
          return done(null, false, { message: "Account is inactive" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// customer login
passport.use(
  "local-customer",
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
      console.log("🔐 Customer login attempt:", email); // debug line
      try {
        const user = await Customer.findOne({
          email: email.toLowerCase().trim(),
        });

        if (!user) {
          console.log("❌ Customer not found");
          return done(null, false, { message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log("❌ Incorrect customer password");
          return done(null, false, { message: "Incorrect password" });
        }

        console.log("✅ Customer authenticated");
        return done(null, user);
      } catch (err) {
        console.error("❌ Error in customer strategy:", err);
        return done(err);
      }
    }
  )
);

module.exports = passport;
