// 🔹 Internal Module Imports (Project files)
const platform_setting = require("../models/setting");
const { async_error_handler } = require("../utils/async_error_handler");

/**
 * @api {get} /settings Retrieve Platform Settings
 * 
 * @apiSuccess {Object} settings The current or default platform settings.
 * @apiSuccess {Number} settings.new_referral_points The referral points set for users.
 * @apiSuccess {Number} settings.platform_earn_percentage The percentage of earnings the platform takes.
 * @apiSuccess {Number} settings.referral_earn_percentage The percentage of earnings allocated to referrals.
 * @apiSuccess {Object} settings.duration_filter_data The configuration for filtering based on duration.
 * 
 */


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





/**
 * @api {put} /settings Update Platform Settings
 * 
 * @apiParam {Object} req.body The request body.
 * @apiParam {Number} req.body.new_referral_points The new referral points.
 * @apiParam {Number} req.body.platform_earn_percentage The platform earning percentage.
 * @apiParam {Number} req.body.referral_earn_percentage The referral earning percentage.
 * @apiParam {Array} req.body.duration_filter_data The duration filter data.
 * 
 * @apiSuccess {Object} settings The updated settings.
 * @apiError (400) BadRequest Invalid request body.
 * @apiError (500) InternalServerError Server error while updating settings.
 */


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
