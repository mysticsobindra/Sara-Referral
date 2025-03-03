const express = require("express");
const {
TotalUserPoints,
  recordGamePlay,
  EarningsController,
  recordGameOutcome,
} = require("../controllers/game");
const router = express.Router();

router.post("/play/:userId", recordGamePlay);
router.patch("/points/:userId", TotalUserPoints);
router.get("/histroy/:userId", EarningsController);
router.post("/gameDecision/:userId", recordGameOutcome);

module.exports = router;

/**
 * @swagger
 * /game/play/{userId}:
 *   post:
 *     summary: Record a Game Play
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to play the game
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Recorded Game played successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newEarning:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     earning_type:
 *                       type: string
 *                     points_earned:
 *                       type: number
 *                     _id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *               example:
 *                 message: " Game played and earning recorded successfully"
 *                 newEarning:
 *                   user_id: "67b814dbbdf5810b8023f177"
 *                   earning_type: "Game Played"
 *                   points_earned: -100
 *                   _id: "67b815afbdf5810b8023f1a4"
 *                   created_at: "2025-02-21T05:57:03.935Z"
 *                   __v: 0
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /game/balance/{userId}:
 *   patch:
 *     summary: Updates user Total Points based on their earning and  and return current balance
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to get the balance for
 *     responses:
 *       200:
 *         description: User balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 CurrentBalance:
 *                   type: number
 *               example:
 *                 CurrentBalance: 2400
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /game/histroy/{userId}:
 *   get:
 *     summary: Get earnings history of a user
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to get earnings history for
 *     responses:
 *       200:
 *         description: Earnings history retrieved successfully
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
 *                 earnings:
 *                   - _id: "67b82a517c4c9182dda8eff1"
 *                     user_id: "67b820c580a5345e68f81131"
 *                     earning_type: "Game Played"
 *                     points_earned: -100
 *                     created_at: "2025-02-21T07:25:05.570Z"
 *                     __v: 0
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /game/gameDecision/{userId}:
 *   post:
 *     summary: Record a game Outcome
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to Record a game Outcome for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               decision:
 *                 type: string
 *               stakeAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Game decision made successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newEarning:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     earning_type:
 *                       type: string
 *                     points_earned:
 *                       type: number
 *                     _id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                 newReferralearning:
 *                   type: object
 *                   properties:
 *                     referrer_id:
 *                       type: string
 *                     referred_id:
 *                       type: string
 *                     earning_type:
 *                       type: string
 *                     points_earned:
 *                       type: number
 *                     _id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *               example:
 *                 message: "Game played and earning recorded successfully"
 *                 newEarning:
 *                   user_id: "67b814dbbdf5810b8023f177"
 *                   earning_type: "Game Played"
 *                   points_earned: -100
 *                   _id: "67b827d66fedb2edae52116d"
 *                   created_at: "2025-02-21T07:14:30.991Z"
 *                   __v: 0
 *                 newReferralearning:
 *                   referrer_id: "67b81477bdf5810b8023f16b"
 *                   referred_id: "67b814dbbdf5810b8023f177"
 *                   earning_type: "Game Played"
 *                   points_earned: 2
 *                   _id: "67b827d66fedb2edae52116b"
 *                   created_at: "2025-02-21T07:14:30.986Z"
 *                   __v: 0
 *       400:
 *         description: Bad request
 */
