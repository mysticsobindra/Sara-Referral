const crypto = require("crypto");
const user_model = require("../models/User");

const unique_referral_code = async () => {
  let new_referral_code;
  let isUnique = false;

  while (!isUnique) {
    // Generate multiple candidate referral codes
    const candidate_codes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(3).toString("hex")
    );

    // Check if any of the candidate codes already exist in the database
    const existing_referral_users = await user_model.find({
      referral_code: { $in: candidate_codes },
    });

    // Filter out the existing codes from the candidate codes
    const existing_codes = existing_referral_users.map(
      (user) => user.referral_code
    );
    const available_codes = candidate_codes.filter(
      (code) => !existing_codes.includes(code)
    );

    // If there are available codes, use the first one
    if (available_codes.length > 0) {
      new_referral_code = available_codes[0];
      isUnique = true;
    }
  }
  
  return new_referral_code;
};

module.exports = unique_referral_code;
