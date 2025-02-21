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
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Login a user
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the user
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: Password of the user
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 */

const express = require("express")
const router = express.Router()
const { registerUser } = require("../controllers/signup")
const { Login } = require("../controllers/login")

router.post("/register", registerUser);
router.get("/login", Login);

module.exports = router;