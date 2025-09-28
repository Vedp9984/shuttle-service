// middleware/role.js
function checkRole(requiredRole) {
  return (req, res, next) => {
    try {
      // Assuming you attach user info to req.user after authentication
      const user = req.user;

      if (!user || !user.role) {
        return res.status(403).json({ message: "Access denied. No role found." });
      }

      if (user.role !== requiredRole) {
        return res.status(403).json({ message: "Access denied. Insufficient permissions." });
      }

      next();
    } catch (err) {
      console.error("Role check error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

module.exports = checkRole;
