// 🔹 Third-Party Module Imports (npm packages)
const mongoose = require("mongoose");

const setting_schema = new mongoose.Schema({
  new_referral_points: {
    type: Number,
    required: [true, "New referral points is required"],
  },
  platform_earn_percentage: {
    type: Number,
    required: [true, "Platform earn percentage is required"],
  },
  referral_earn_percentage: {
    type: Number,
    required: [true, "Referral earn percentage is required"],
  },
  duration_filter_data: {
    type: [Number],
    required: [true, "Duration filter data is required"],
  },
});

const Setting = mongoose.model("Setting", setting_schema);

module.exports = Setting;
