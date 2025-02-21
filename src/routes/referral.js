

const express = require("express");
const router = express.Router()
const { GenerateReferralCode, validateReferralCode, registerWithReferralCode, getReferralHistroy } = require("../controllers/referral");

router.post("/generate", GenerateReferralCode);
router.get("/validate/:referralCode", validateReferralCode);
router.post("/register/:referralCode", registerWithReferralCode);
router.get("/histroy/:userId", getReferralHistroy);

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
 *                 referralCode:
 *                   type: string
 *             example:
 *               message: "User already has a referral code"
 *               referralCode: "4acaa5"
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /referral/validate/{referralCode}:
 *   get:
 *     summary: Validate a referral code
 *     tags: [Referral]
 *     parameters:
 *       - in: path
 *         name: referralCode
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
 *                 referralCode:
 *                   type: string
 *               example:
 *                 message: "Valid referral code"
 *                 referralCode: "4acaa5"
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /referral/register/{referralCode}:
 *   post:
 *     summary: Register a user with a referral code
 *     tags: [Referral]
 *     parameters:
 *       - in: path
 *         name: referralCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Referral code to register with
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully with referral code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     password:
 *                       type: string
 *                     referralCode:
 *                       type: string
 *                     referredBy:
 *                       type: string
 *                     Balance:
 *                       type: number
 *                     _id:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     __v:
 *                       type: number
 *                 referrel:
 *                   type: object
 *                   properties:
 *                     referrer_id:
 *                       type: string
 *                     referred_id:
 *                       type: string
 *                     signup_bonus:
 *                       type: number
 *                     _id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     __v:
 *                       type: number
 *               example:
 *                 message: "User registered successfully"
 *                 user: 
 *                   email: "test4@gmail.com"
 *                   password: "test4"
 *                   referralCode: "a94854"
 *                   referredBy: "67b81477bdf5810b8023f16b"
 *                   Balance: 0
 *                   _id: "67b820c580a5345e68f81131"
 *                   createdAt: "2025-02-21T06:44:21.351Z"
 *                   __v: 0
 *                 referrel:
 *                   referrer_id: "67b81477bdf5810b8023f16b"
 *                   referred_id: "67b820c580a5345e68f81131"
 *                   signup_bonus: 100
 *                   _id: "67b820c580a5345e68f81132"
 *                   created_at: "2025-02-21T06:44:21.351Z"
 *                   __v: 0
 *       400:
 *         description: Bad request
 */


/**
 * @swagger
 * /referral/histroy/{userId}:
 *   get:
 *     summary: Get referral history of a user
 *     tags: [Referral]
 *     parameters:
 *       - in: path
 *         name: userId
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
 *                       referral_id:
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
 *                   - _id: "67b814dbbdf5810b8023f179"
 *                     referral_id: "67b81477bdf5810b8023f16b"
 *                     referred_id: "67b814dbbdf5810b8023f177"
 *                     earning_type: "New Referral"
 *                     points_earned: 100
 *                     created_at: "2025-02-21T05:53:31.153Z"
 *                     __v: 0
 *                   - _id: "67b815f6bdf5810b8023f1b7"
 *                     referral_id: "67b81477bdf5810b8023f16b"
 *                     referred_id: "67b815f6bdf5810b8023f1b5"
 *                     earning_type: "New Referral"
 *                     points_earned: 100
 *                     created_at: "2025-02-21T05:58:14.972Z"
 *                     __v: 0
 *                   - _id: "67b820c580a5345e68f81133"
 *                     referral_id: "67b81477bdf5810b8023f16b"
 *                     referred_id: "67b820c580a5345e68f81131"
 *                     earning_type: "New Referral"
 *                     points_earned: 100
 *                     created_at: "2025-02-21T06:44:21.352Z"
 *                     __v: 0
 *       400:
 *         description: Bad request
 */