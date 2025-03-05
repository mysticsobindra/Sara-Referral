// 🔹 Third-Party Module Imports (npm packages)
const express = require("express");

// 🔹 Internal Module Imports (Project files)
const { Update_settings, get_settings } = require("../controllers/settings");


const router = express.Router();

router.put("/newSettings", Update_settings);
router.get("/settings", get_settings);

module.exports = router;
