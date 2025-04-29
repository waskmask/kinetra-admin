const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction, // only use secure cookies in production (HTTPS)
    sameSite: "lax", // or "none" if doing cross-subdomain with credentials
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: isProduction ? ".kenitra.io" : undefined, // allow all subdomains in prod
  };
};

module.exports = getCookieOptions;
