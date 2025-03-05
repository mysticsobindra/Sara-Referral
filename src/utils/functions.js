// 🔹 Internal Module Imports (Project files)
const platform_setting = require("../models/setting");

const default_setting = {
  new_referral_points: 100,
  platform_earn_percentage: 10,
  referral_earn_percentage: 2,
  duration_filter_data: [1, 7, 30],
};

async function calculate_referral_earnings(points_Spent) {
  let settings = await platform_setting.findOne();

  // If settings are not found, use the default settings
  if (!settings) {
    // If settings are not found, use the default settings
    const platform_earnings =
      (points_Spent * default_setting.platform_earn_percentage) / 100;

    // Calculate the referral earnings
    return (platform_earnings * default_setting.referral_earn_percentage) / 100;
  }

  // Calculate the platform earnings
  const platform_earnings =
    (points_Spent * settings.platform_earn_percentage) / 100;
  // Calculate the referral earnings
  return (platform_earnings * settings.referral_earn_percentage) / 100;

}

module.exports = { calculate_referral_earnings };
