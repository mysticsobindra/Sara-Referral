const express = require("express");
const { updateTotalPoints } = require("../controllers/cms");
const router = express.Router()

router.post("/balance/:userId",updateTotalPoints );

module.exports = router;



/**
 * @swagger
 * /cms/balance/{userId}:
 *   post:
 *     summary: Update the total points balance for a user
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to update the balance for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Points balance updated successfully
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
 *                 message: "Total points updated successfully"
 *                 newEarning:
 *                   user_id: "67b81477bdf5810b8023f16b"
 *                   earning_type: "Deposit"
 *                   points_earned: 3000
 *                   _id: "67b825928d689dbf749ac7ed"
 *                   created_at: "2025-02-21T07:04:50.363Z"
 *       400:
 *         description: Bad request
 */