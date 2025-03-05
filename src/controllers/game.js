// 🔹 Internal Module Imports (Project files)
const user_model = require("../models/User");
const Earnings = require("../models/earnings");
const referral_earnings = require("../models/referralEarnings");
const { calculate_referral_earnings } = require("../utils/functions");
const { async_error_handler } = require("../utils/async_error_handler");
const Custom_error = require("../utils/customError");

/**
 * Updates the user's balance based on their earnings and referral earnings , then return current Points of user .
 *
 * @async
 * @function total_user_points
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.user_id - The ID of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user's balance is updated.
 * @throws {Error} - Throws an error if there is a server error.
 */
const total_user_points = async_error_handler(async (req, res, next) => {
  const { user_id } = req.params;

  const earnings = await Earnings.find({ user_id: user_id });

  const referral_earnings_details = await referral_earnings.find({
    user_id: user_id,
  });

  const total_points = earnings.reduce(
    (sum, earning) => sum + earning.points_earned,
    0
  );
  const total_referral_Points = referral_earnings_details.reduce(
    (sum, earning) => sum + earning.points_earned,
    0
  );
  const current_balance = total_points + total_referral_Points;

  await user_model.findByIdAndUpdate(
    { _id: user_id },
    { Balance: current_balance }
  );

  return res.status(200).json({ current_balance });
});

/**
 * Handles the game play request, records the earning, and responds with the result.
 * @function record_game_play
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.user_id - The ID of the user playing the game.
 * @param {Object} req.body - The request body.
 * @param {number} req.body.balance - The balance to be deducted as points earned.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with status and message.
 */
const record_game_play = async_error_handler(async (req, res, next) => {
  // Extract the user ID and balance from the request
  const { user_id } = req.params;

  // Extract the user ID and balance from the request
  const { balance } = req.body;

  // Create a new earning record
  const new_earning = new Earnings({
    user_id: user_id,
    earning_type: "game_played",
    points_earned: -balance,
  });

  // Save the earning record
  await new_earning.save();

  return res.status(200).json({
    message: "Game played and earning recorded successfully",
    new_earning,
  });
});

/**
 * Controller to handle fetching earnings for a specific user.
 *
 * @async
 * @function earnings_controller
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.user_id - ID of the user whose earnings are to be fetched.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the user's earnings or an error message.
 */
const earnings_controller = async_error_handler(async (req, res, next) => {
  // Extract the user ID from the request parameters
  const { user_id } = req.params;

  // Fetch the earnings for the user
  const earnings = await Earnings.find({ user_id: user_id });

  // Send the earnings as a response
  res.status(200).json({ earnings });
});

/**
 * Controller for handling game decisions and recording earnings.
 *
 * @async
 * @function record_game_outcome
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.user_id - ID of the user making the decision.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.decision - Decision made by the user ('win' or other).
 * @param {number} req.body.stake_amount - Amount of stake involved in the game.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server error.
 */

const record_game_outcome = async_error_handler(async (req, res, next) => {
  // Extract the user ID, decision, and stake amount from the request
  const { user_id } = req.params;
  const { decision, stake_amount } = req.body;
  // Check if the decision is 'win' or 'lose'
  if (decision == "win") {
    // Create a new earning record
    const new_earning = new Earnings({
      user_id: user_id,
      earning_type: "game_played",
      points_earned: stake_amount,
    });

    // Save the earning record
    await new_earning.save();

    return res.status(200).json({
      message: "Game played and earning recorded successfully",
      new_earning,
    });

  }
  // If the user loses the game
  else {
    // Create a new earning record

    
    let new_referral_earning;
    // Fetch the user details
    const user = await user_model.findById(user_id);

    // Calculate the referral earnings
    const referral_commission_amount = await calculate_referral_earnings(
      stake_amount
    );

    // Check if the user has a referrer
    if (!!user.referred_by) {
      // Create a new referral earning record
      new_referral_earning = new referral_earnings({
        referrer_id: user.referred_by,
        referred_id: user_id,
        earning_type: "game_played",
        points_earned: referral_commission_amount,
      });

      // Save the referral earning record
      await new_referral_earning.save();
    }

    return res.status(200).json({
      new_referral_earning ,
    });
  }
});

module.exports = {
  total_user_points,
  record_game_play,
  earnings_controller,
  record_game_outcome,
};
