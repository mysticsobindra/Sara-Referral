// 🔹 Third-Party Module Imports (npm packages)
const express = require("express");

// 🔹 Internal Module Imports (Project files)
const { Update_settings, get_settings } = require("../controllers/settings");

const router = express.Router();

router.put("/newSettings", Update_settings);
router.get("/settings", get_settings);

module.exports = router;




/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Retrieve the current settings
 *     responses:
 *       200:
 *         description: A JSON object containing the settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 settings:
 *                   type: object
 *                   properties:
 *                     new_referral_points:
 *                       type: integer
 *                     platform_earn_percentage:
 *                       type: integer
 *                     referral_earn_percentage:
 *                       type: integer
 *                     duration_filter_data:
 *                       type: array
 *                       items:
 *                         type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /newSettings:
 *   put:
 *     summary: Update the settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_referral_points:
 *                 type: integer
 *               platform_earn_percentage:
 *                 type: integer
 *               referral_earn_percentage:
 *                 type: integer
 *               duration_filter_data:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: A JSON object containing the updated settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 new_referral_points:
 *                   type: integer
 *                 platform_earn_percentage:
 *                   type: integer
 *                 referral_earn_percentage:
 *                   type: integer
 *                 duration_filter_data:
 *                   type: array
 *                   items:
 *                     type: integer
 *       500:
 *         description: Internal server error
 */