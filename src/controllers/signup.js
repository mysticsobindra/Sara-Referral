// 🔹 Third-Party Module Imports (npm packages)
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// 🔹 Internal Module Imports (Project files)
const user_model = require("../models/User");
const referral_model = require("../models/referrals");
const referral_earnings = require("../models/referralEarnings");
const platform_setting = require("../models/setting");

const salt_rounds = 10;

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
async function register_user(req, res) {
  // Extract the email and password from the request body
  const { email, password } = req.body;
  const referral_code = req.query.referral_code;

  // Check if the email and password are provided
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    // Check if the user already exists
    const existing_user = await user_model.findOne({ email: email });

    // If the user exists, return an error
    if (existing_user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashed_password = await bcrypt.hash(password, salt_rounds);

    // Generate a unique referral code
    let new_referral_code;
    let isUnique = false;
    while (!isUnique) {
      new_referral_code = crypto.randomBytes(3).toString("hex");
      const existing_Referral_User = await user_model.findOne({
        referral_code: new_referral_code,
      });
      if (!existing_Referral_User) {
        isUnique = true;
      }
    }

    // Check if the referral code is valid
    let referring_user;
    if (referral_code) {
      referring_user = await user_model.findOne({
        referral_code: referral_code,
      });
      if (!referring_user) {
        return res.status(404).json({ message: "Invalid referral code" });
      }
    }

    // Create a new user
    const new_user = new user_model({
      email: email,
      password: hashed_password,
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

      let settings = await platform_setting.findOne();

      // Create a new referral earning record
      const referral_earning = new referral_earnings({
        referrer_id: referring_user._id,
        referred_id: new_user._id,
        earning_type: "New_Referral",
        points_earned: settings ? settings.new_referral_points : 100,
      });

      // Save the referral and referral earning records
      await new_referral.save();
      await referral_earning.save();
    }

    res
      .status(201)
      .send({ message: "User created successfully", user: new_user });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error registering user: " + error.message);
  }
}

module.exports = { register_user };
