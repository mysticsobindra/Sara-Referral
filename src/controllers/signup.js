const userModel = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Referral = require("../models/referrals");
const referralEarnings = require("../models/referralEarnings");

const saltRounds = 10;

/**
 * Registers a new user.
 *
 * @async
 * @function registerUser
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} req.params - The parameters of the request.
 * @param {string} req.params.referralCode - The referral code (optional).
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a response with the status and message.
 * @throws {Error} If there is an error during user registration.
 */

async function registerUser(req, res) {
  // Extract the email and password from the request body
  const { email, password } = req.body;
  const referral_Code = req.query.referralCode;
  
  // Check if the email and password are provided
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    // Check if the user already exists
    const existing_User = await userModel.findOne({ email: email });
    if (existing_User) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashed_Password = await bcrypt.hash(password, saltRounds);

    // Generate a unique referral code
    let new_Referral_Code;
    let isUnique = false;
    while (!isUnique) {
      new_Referral_Code = crypto.randomBytes(3).toString("hex");
      const existing_User = await userModel.findOne({
        referralCode: new_Referral_Code,
      });
      if (!existing_User) {
        isUnique = true;
      }
    }

    // Check if the referral code is valid
    let referring_User;
    if (referral_Code) {
      referring_User = await userModel.findOne({ referralCode: referral_Code });
      if (!referring_User) {
        return res.status(404).json({ message: "Invalid referral code" });
      }
    }

    // Create a new user
    const newUser = new userModel({
      email: email,
      password: hashed_Password,
      referralCode: new_Referral_Code,
      referredBy: referring_User ? referring_User._id : null,
    });

    await newUser.save();

    // If the user was referred, signup with referral code and create a referral record
    if (referring_User) {
      // Create a new referral record
      const new_Referral = new Referral({
        referrer_id: referring_User._id,
        referred_id: newUser._id,
      });

      // Create a new referral earning record
      const referralEarning = new referralEarnings({
        referrer_id: referring_User._id,
        referred_id: newUser._id,
        earning_type: "New_Referral",
        points_earned: 100,
      });
     
      // Save the referral and referral earning records
      await new_Referral.save();
      await referralEarning.save();
    }

    res
      .status(201)
      .send({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).send("Error registering user: " + error.message);
  }
}

module.exports = { registerUser };
