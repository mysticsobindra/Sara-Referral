// 🔹 Third-Party Module Imports (npm packages)
const mongoose = require("mongoose");

const setting_schema = new mongoose.Schema({
  new_referral_points: {
    type: Number,
    required: true,
  },
  platform_earn_percentage: {
    type: Number,
    required: true,
  },
  referral_earn_percentage: {
    type: Number,
    required: true,
  },
  duration_filter_data: {
    type: [Number],
    required: true,
  },
});

const Setting = mongoose.model("Setting", setting_schema);

module.exports = Setting;
