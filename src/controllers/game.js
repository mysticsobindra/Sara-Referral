// 🔹 Internal Module Imports (Project files)
const user_model = require("../models/User");
const Earnings = require("../models/earnings");
const referral_earnings = require("../models/referralEarnings");
const { calculate_referral_earnings } = require("../utils/functions");

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
const total_user_points = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res
        .status(400)
        .json({ message: "user_model ID and balance are required" });
    }

    const user = await user_model.findById({ _id: user_id });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
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

    res.status(200).json({ current_balance });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

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
function record_game_play(req, res) {
  // Extract the user ID and balance from the request
  const { user_id } = req.params;

  // Extract the user ID and balance from the request
  const { balance } = req.body;

  // Check if the user ID and balance are provided
  if (!user_id || balance === undefined) {
    return res
      .status(400)
      .json({ message: "user_model ID and balance are required" });
  }

  // Create a new earning record
  const new_earning = new Earnings({
    user_id: user_id,
    earning_type: "game_played",
    points_earned: -balance,
  });

  // Save the earning record
  new_earning
    .save()
    .then(() => {
      res.status(200).json({
        message: "Game played and earning recorded successfully",
        new_earning,
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error recording earning", error });
    });
}

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
async function earnings_controller(req, res) {
  // Extract the user ID from the request parameters
  const { user_id } = req.params;

  // Check if the user ID is provided
  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Fetch the earnings for the user
    const earnings = await Earnings.find({ user_id: user_id });

    // Send the earnings as a response
    res.status(200).json({ earnings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

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
async function record_game_outcome(req, res) {
  // Extract the user ID, decision, and stake amount from the request
  const { user_id } = req.params;
  const { decision, stake_amount } = req.body;
  try {
    // Check if the user ID and decision are provided
    if (!user_id || !decision) {
      return res
        .status(400)
        .json({ message: "User ID and decision are required" });
    }

    // Check if the decision is 'win' or 'lose'
    if (decision == "win") {
      // Create a new earning record
      const new_earning = new Earnings({
        user_id: user_id,
        earning_type: "game_played",
        points_earned: stake_amount,
      });

      // Save the earning record
      new_earning
        .save()
        .then(() => {
          res.status(200).json({
            message: "Game played and earning recorded successfully",
            new_earning,
          });
        })
        .catch((error) => {
          res.status(500).json({ message: "Error recording earning", error });
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

      console.log(referral_commission_amount);

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


    return  res.status(200).json({
        message: "Game played and earning recorded successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

module.exports = {
  total_user_points,
  record_game_play,
  earnings_controller,
  record_game_outcome,
};
