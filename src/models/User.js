// 🔹 Third-Party Module Imports (npm packages)
const mongoose = require("mongoose");

const user_schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  referral_code: {
    type: String,
  },
  referred_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  Balance: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", user_schema);

module.exports = User;
