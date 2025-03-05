// 🔹 Internal Module Imports (Project files)
const user_model = require("../models/User");
const referral_model = require("../models/referrals");
const referral_earnings = require("../models/referralEarnings");
const platform_setting = require("../models/setting");
const unique_referral_code = require("../utils/unique_referral_code");

const { async_error_handler } = require("../utils/async_error_handler");
const Custom_error = require("../utils/customError");
const mongoose = require("mongoose");

/**
 * Registers a new user.
 *
 * @async
 * @function register_user
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} req.query - The query parameters of the request.
 * @param {string} req.query.referral_code - The referral code (optional).
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a response with the status and message.
 * @throws {Error} If there is an error during user registration.
 */

const register_user = async_error_handler(async (req, res, next) => {
  // Extract the email and password from the request body
  const { email, password } = req.body;
  const referral_code = req.query.referral_code;

  // Generate a unique referral code
  const new_referral_code = await unique_referral_code();

  // Check if the referral code is valid
  let referring_user;

  if (!!referral_code) {
    referring_user = await user_model.findOne({
      referral_code: referral_code,
    });

    if (!referring_user) {
      const error = new Custom_error("referral code not found ", 404);
      return next(error);
    }
  }

  // Create a new user
  const new_user = new user_model({
    email: email,
    password: password,
    referral_code: new_referral_code,
    referred_by: referring_user ? referring_user._id : null,
  });
  
  await new_user.save();
  
  // If the user was referred, create a referral record and referral earning record
  if (referring_user) {
    // Create a new referral record
    const new_referral = new referral_model({
      referrer_id: referring_user._id,
      referred_id: new_user._id,
    });

    let settings = await platform_setting.findOne({});

    const new_referral_points = settings ? settings.new_referral_points : 100;

    // Create a new referral earning record
    const referral_earning = new referral_earnings({
      referrer_id: referring_user._id,
      referred_id: new_user._id,
      earning_type: "New_Referral",
      points_earned: new_referral_points,
    });

    // Save the referral and referral earning records
    await new_referral.save();
    await referral_earning.save();
  }

  return res
    .status(201)
    .send({ message: "User created successfully", user: new_user });
});

module.exports = { register_user };
