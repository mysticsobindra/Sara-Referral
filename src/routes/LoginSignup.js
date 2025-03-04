const express = require("express");
const router = express.Router();
const { register_User } = require("../controllers/signup");
const { Login } = require("../controllers/login");
const { refresh_Token } = require("../controllers/refreshToken");

router.post("/register", register_User);
router.post("/login", Login);
router.post("/refresh-token", refresh_Token);

module.exports = router;

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *     parameters:
 *       - in: query
 *         name: referral_code
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional referral code
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: test3@gmail.com
 *                     password:
 *                       type: string
 *                       example: $2b$10$2ZExr6njHlKpIbwA.8WvvegNrdHKTtt/5QRcdTqmJi1hogcKSTN3i
 *                     referral_code:
 *                       type: string
 *                       example: 338cc6
 *                     referred_By:
 *                       type: string
 *                       example: 67b84da07e39006ca19a81b2
 *                     Balance:
 *                       type: number
 *                       example: 0
 *                     _id:
 *                       type: string
 *                       example: 67c3f66972b075a6b634a130
 *                     created_At:
 *                       type: string
 *                       example: 2025-03-02T06:10:49.583Z
 *                     __v:
 *                       type: number
 *                       example: 0
 *       400:
 *         description: Bad request
 *       404:
 *         description: Invalid referral code
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user
 *               password:
 *                 type: string
 *                 description: Password of the user
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Refresh access and refresh token, then update it in cookies and database
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: refresh_Token
 *         schema:
 *           type: string
 *         required: true
 *         description: Refresh token of the user
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access token refreshed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
