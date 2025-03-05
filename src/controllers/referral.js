// 🔹 Third-Party Module Imports (npm packages)
const crypto = require("crypto");

// 🔹 Internal Module Imports (Project files)
const user_model = require("../models/User");
const referral_model = require("../models/referrals");
const referral_earnings = require("../models/referralEarnings");
const { async_error_handler } = require("../utils/async_error_handler");

/**
 * Generates a unique referral code for a user if they do not already have one.
 *
 * @async
 * @function generate_referral_code
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object attached to the request.
 * @param {Object} req.user.user - The user details.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a JSON response with the referral code or an error message.
 * @throws {Error} - Throws an error if there is a server issue.
 */
const generate_referral_code = async_error_handler(async (req, res) => {
  // Extract the user from the request object
  const user = req.user;

  // Check if the user already has a referral code
  const existing_user_with_referral_code = await user_model.findOne({
    _id: user._id,
    referral_code: { $exists: true },
  });

  if (existing_user_with_referral_code) {
    return res.status(200).json({
      message: "user_model already has a referral code",
      referral_code: existing_user_with_referral_code.referral_code,
    });
  }

  // Generate a unique referral code
  let referral_code = await unique_referral_code_generator();

  // Update the user with the referral code
  const updatedUser = await user_model.findByIdAndUpdate(
    { _id: `${user._id}` },
    { $set: { referral_code: referral_code } },
    { upsert: true }
  );

  // Return the referral code
  return res.status(200).json({ referral_code: referral_code });
});

/**
 * Validates a referral code provided in the request parameters.
 *
 * @async
 * @function validate_referral_code
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.referral_code - The referral code to validate.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server issue.
 */

const validate_referral_code = async_error_handler(async (req, res) => {
  // Extract the referral code from the request parameters
  const referral_code = req.params.referral_code;
  // Check if the referral code exists in the database
  const user = await user_model.findOne({ referral_code: referral_code });
  if (!user) {
    return res.status(404).json({ message: "Invalid referral code" });
  }

  // Return the referral code
  return res
    .status(200)
    .json({ message: "Valid referral code", referral_code: referral_code });
});

/**
 * Retrieves the referral history for a specific user.
 *
 * @async
 * @function get_referral_history
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.user_id - The ID of the user.
 * @param {Object} req.query - The query parameters.
 * @param {string} [req.query.filter] - The filter for the type of earnings -[New_Referral | game_played ] .
 * @param {string} [req.query.days] - The number of days to look back for referral history.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server issue.
 */
const get_referral_history = async_error_handler(async (req, res) => {
  // Extract the user ID from the request parameters
  const user_id = req.params.user_id;

  // Extract the filter and days from the query parameters
  const filter = req.query.filter;
  const days = req.query.days;

  // Query the database for the referral history
  let query = { referrer_id: user_id };

  // Check if there is a filter
  if (filter) {
    query.earning_type = filter;
  }

  // Check if there is a days filter
  if (days) {
    const days_ago = new Date();
    days_ago.setDate(days_ago.getDate() - parseInt(days));
    query.created_at = { $gte: days_ago };
  }

  // Retrieve the referral history
  const referral_history = await referral_earnings.find(query);

  // Return the referral history
  return res.status(200).json({ referral_history: referral_history });
});

/**
 * Generates a unique referral code.
 *
 * This function generates a random referral code and checks its uniqueness
 * against the database. It continues to generate new codes until a unique
 * code is found.
 *
 * @async
 * @function unique_referral_code_generator
 * @returns {Promise<string>} A promise that resolves to a unique referral code.
 */

// Generate a unique referral code
const unique_referral_code_generator = async () => {
  let referral_code;
  let is_unique = false;
  while (!is_unique) {
    referral_code = crypto.randomBytes(3).toString("hex");
    const existing_user = await user_model.findOne({
      referral_code: referral_code,
    });
    if (!existing_user) {
      is_unique = true;
    }
  }
  return referral_code;
};

/**
 * Retrieves the referrals for a given user and calculates the total points earned from those referrals.
 *
 * @async
 * @function get_your_referrals
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.user_id - The ID of the user whose referrals are to be retrieved.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server error.
 */

const get_your_referrals = async_error_handler(async (req, res) => {
    // Extract the user ID from the request parameters
    const user_id = req.params.user_id;
  
    // Query the database for the referrals
    const referrals = await referral_model
      .find({ referrer_id: user_id })
      .populate("referred_id", "email");
  
    if (!referrals.length) {
      return res.status(404).json({ referrals });
    }
  
    // Extract all referred IDs from the referrals
    const referredIds = referrals.map(referral => referral.referred_id._id);
  
    // Fetch all earnings related to the referred IDs in a single query
    const referralEarnings = await referral_earnings.find({
      referrer_id: user_id,
      referred_id: { $in: referredIds }
    });
  
    // Create an object to store the referral details and total points
    let total_points = 0;
    const referral_details = {};
  
    // Loop through the earnings and calculate the total points earned
    for (const earning of referralEarnings) {
      total_points += earning.points_earned;
  
      if (!referral_details[earning.referred_id]) {
        referral_details[earning.referred_id] = {
          referred_user: referrals.find(referral => referral.referred_id._id.toString() === earning.referred_id.toString()).referred_id.email,
          referral_date: referrals.find(referral => referral.referred_id._id.toString() === earning.referred_id.toString()).created_at,
          points_earned: 0
        };
      }
  
      referral_details[earning.referred_id].points_earned += earning.points_earned;
    }
  
    // Convert the referral details object to an array and sort by points earned
    const sorted_referral_details = Object.values(referral_details).sort(
      (a, b) => b.points_earned - a.points_earned
    );
  
    // Return the referral details and total points earned
    return res.status(200).json({
      referrals: sorted_referral_details,
      total_points: total_points,
    });
  });

  
/**
 * Retrieves the top referrals and their earnings.
 *
 * @async
 * @function get_top_referrals
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a JSON response with the top referrals or an error message.
 * @throws {Error} - Throws an error if there is a server issue.
 */

const get_top_referrals = async_error_handler(async (req, res, next) => {
    // Query the database for all referrals
    const referrals = await referral_model.find().populate("referred_id", "email");
  
    // Check if there are referrals
    if (!referrals.length) {
      return res.status(404).json({ referrals });
    }
  
    // Extract all referrer IDs from the referrals
    const referrerIds = referrals.map(referral => referral.referrer_id);
  
    // Fetch all earnings related to the referrer IDs in a single query
    const referrerEarnings = await referral_earnings.find({
      referrer_id: { $in: referrerIds }
    });
  


    // Create an object to store the top referrers and their details
    const top_referrer_details = {};
  
    // Loop through the referrals and calculate the total points earned by the referrer
    for (const referral of referrals) {
      // Filter earnings for the current referrer
      const earnings = referrerEarnings.filter(
        earning => earning.referrer_id.toString() === referral.referrer_id.toString()
      );
  


      // Calculate the total points earned by the referrer
      let total_points = 0;
      earnings.forEach(earning => {
        total_points += earning.points_earned;
      });
  
      // Add the referrer details to the response
      if (!top_referrer_details[referral.referrer_id]) {
        top_referrer_details[referral.referrer_id] = {
          referrer_id: referral.referrer_id,
          total_points: 0,
          referrals: []
        };
      }
  
      // Update the total points earned by the referrer
      top_referrer_details[referral.referrer_id].total_points += total_points;
      top_referrer_details[referral.referrer_id].referrals.push({
        referred_user: referral.referred_id,
        points_earned: total_points
      });
    }
  
    // Sort the top referrers by total points earned
    const sorted_referrals = Object.values(top_referrer_details).sort(
      (a, b) => b.total_points - a.total_points
    );
  
    // Return the top referrers
    return res.status(200).json({ top_referrals: sorted_referrals });
  });

module.exports = {
  generate_referral_code,
  get_top_referrals,
  get_your_referrals,
  validate_referral_code,
  get_referral_history,
};
