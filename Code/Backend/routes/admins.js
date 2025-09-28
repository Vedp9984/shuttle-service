const express = require("express");
const router = express.Router();
const checkRole = require("../middleware/role");

// Protect routes so only Admins can access
router.get("/dashboard", checkRole("admin"), (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard" });
});

module.exports = router;
