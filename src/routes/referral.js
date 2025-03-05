// 🔹 Third-Party Module Imports (npm packages)
const express = require("express");

// 🔹 Internal Module Imports (Project files)
const {  generate_referral_code, get_top_referrals, get_your_referrals, validate_referral_code, get_referral_history  } = require("../controllers/referral");

const router = express.Router()

router.post("/generate", generate_referral_code);
router.get("/validate/:referral_code", validate_referral_code);
router.get("/history/:user_id", get_referral_history);
router.get("/yourReferrals/:user_id", get_your_referrals);
router.get("/topReferrals", get_top_referrals);


module.exports = router;

/**
 * @swagger
 * /referral/generate:
 *   post:
 *     summary: Generate a new referral code
 *     tags: [Referral]
 *     responses:
 *       200:
 *         description: Referral code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 referral_code:
 *                   type: string
 *             example:
 *               message: "User already has a referral code"
 *               referral_code: "4acaa5"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /referral/validate/{referral_code}:
 *   get:
 *     summary: Validate a referral code
 *     tags: [Referral]
 *     parameters:
 *       - in: path
 *         name: referral_code
 *         schema:
 *           type: string
 *         required: true
 *         description: Referral code to validate
 *     responses:
 *       200:
 *         description: Referral code is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 referral_code:
 *                   type: string
 *               example:
 *                 message: "Valid referral code"
 *                 referral_code: "4acaa5"
 *       400:
 *         description: Bad request
 *       404:
 *        description: Referral code not found
 *       500:
 *         description: Server error
 */



/**
 * @swagger
 * /referral/history/{user_id}:
 *   get:
 *     summary: Get referral history of a user
 *     tags: [Referral]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to get referral history for
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by earning type
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *         required: false
 *         description: Filter by number of days
 *     responses:
 *       200:
 *         description: Referral history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referralHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       referrer_id:
 *                         type: string
 *                       referred_id:
 *                         type: string
 *                       earning_type:
 *                         type: string
 *                       points_earned:
 *                         type: number
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       __v:
 *                         type: number
 *               example:
 *                 referralHistory: 
 *                   - _id: "67b84db27e39006ca19a81b9"
 *                     referrer_id: "67b84da07e39006ca19a81b2"
 *                     referred_id: "67b84db27e39006ca19a81b7"
 *                     earning_type: "New Referral"
 *                     points_earned: 100
 *                     created_at: "2025-02-21T09:56:02.245Z"
 *                     __v: 0
 *                   - _id: "67b84ed0e6fb58efe8e26f73"
 *                     referrer_id: "67b84da07e39006ca19a81b2"
 *                     referred_id: "67b84db27e39006ca19a81b7"
 *                     earning_type: "Game Played"
 *                     points_earned: 2
 *                     created_at: "2025-02-21T10:00:48.546Z"
 *                     __v: 0
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /referral/yourReferrals/{user_id}:
 *   get:
 *     summary: Get your referrals and total points gained
 *     tags: [Referral]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to get referrals for
 *     responses:
 *       200:
 *         description: Referrals and total points retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referrals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       referredUser:
 *                         type: string
 *                       referralDate:
 *                         type: string
 *                       pointsEarned:
 *                         type: Number
 *                 totalPoints:
 *                   type: number
 *               example:
 *                 referrals:
 *                   - referredUser: "test1@gmail.com"
 *                     referralDate: "2025-02-21T05:53:31.153Z"
 *                     pointsEarned: "124"
 *                 totalPoints: 124
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /referral/topReferrals:
 *   get:
 *     summary: Get top referrals and their total points
 *     tags: [Referral]
 *     responses:
 *       200:
 *         description: Top referrals and total points retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topReferrals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       referrerId:
 *                         type: string
 *                       totalPoints:
 *                         type: number
 *                       referrals:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             referredUser:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                             pointsEarned:
 *                               type: number
 *               example:
 *                 topReferrals:
 *                   - referrerId: "67b84da07e39006ca19a81b2"
 *                     totalPoints: 112
 *                     referrals:
 *                       - referredUser:
 *                           _id: "67b84db27e39006ca19a81b7"
 *                           email: "test2@gmail.com"
 *                         pointsEarned: 112
 *       400:
 *         description: Bad request
 */

