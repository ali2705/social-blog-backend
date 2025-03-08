const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();

// Registrazione
router.post("/register", register);

// Login
router.post("/login", login);

module.exports = router;
