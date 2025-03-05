// 🔹 Internal Module Imports (Project files)
const platform_setting = require("../models/setting");
const { async_error_handler } = require("../utils/async_error_handler");

const get_settings = async_error_handler(async (req, res, next) => {
  let settings = await platform_setting.findOne();

  if (!settings) {
    const default_setting = {
      new_referral_points: 100,
      platform_earn_percentage: 10,
      referral_earn_percentage: 2,
      duration_filter_data: [1, 7, 30],
    };

    await platform_setting.findOneAndUpdate({}, default_setting, {
      upsert: true,
      new: true,
    });
    return res.json(default_setting);
  }

  return res.json({ settings });
});

const Update_settings = async_error_handler(async (req, res, next) => {
  const {
    new_referral_points,
    platform_earn_percentage,
    referral_earn_percentage,
    duration_filter_data,
  } = req.body;

  const New_Settings = {
    new_referral_points: new_referral_points,
    platform_earn_percentage: platform_earn_percentage,
    referral_earn_percentage: referral_earn_percentage,
    duration_filter_data: duration_filter_data,
  };

  console.log(New_Settings);

  const updated_Settings = await platform_setting.findOneAndUpdate(
    {},
    New_Settings,
    { upsert: true, new: true }
  );

  return res.json(updated_Settings);
});

module.exports = {
  get_settings,
  Update_settings,
};
