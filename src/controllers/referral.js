const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/referrals');
const ReferralEarnings = require('../models/referralEarnings');

/**
 * Generates a unique referral code for a user if they do not already have one.
 * 
 * @async
 * @function GenerateReferralCode
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object attached to the request.
 * @param {Object} req.user.user - The user details.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a JSON response with the referral code or an error message.
 * @throws {Error} - Throws an error if there is a server issue.
 */
const GenerateReferralCode = async (req, res) => {
    try {
        const user = req.user.user;

        const existingUserWithReferralCode = await User.findOne({ _id: user._id, referralCode: { $exists: true } });
        if (existingUserWithReferralCode) {
            return res.status(200).json({ message: "User already has a referral code", referralCode: existingUserWithReferralCode.referralCode });
        }

        let ReferralCode = await UniqueReferralCodeGenerator();

        const updatedUser = await User.findByIdAndUpdate(
            { _id: `${user._id}` },
            { $set: { referralCode: ReferralCode } },
            { upsert: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ referralCode: ReferralCode });

    } catch (error) {

        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * Validates a referral code provided in the request parameters.
 *
 * @async
 * @function validateReferralCode
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.referralCode - The referral code to validate.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server issue.
 */
async function validateReferralCode(req, res) {
    const referralCode = req.params.referralCode;
    try {
        const user = await User.findOne({ referralCode: referralCode });
        if (!user) {
            return res.status(404).json({ message: "Invalid referral code" });
        }
        return res.status(200).json({ message: "Valid referral code", referralCode: referralCode });
    } catch (error) {

        return res.status(500).json({ message: "Server error" });
    }
}



/**
 * Retrieves the referral history for a specific user.
 *
 * @async
 * @function getReferralHistroy
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The ID of the user.
 * @param {Object} req.query - The query parameters.
 * @param {string} [req.query.filter] - The filter for the type of earnings.
 * @param {string} [req.query.days] - The number of days to look back for referral history.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server issue.
 */
async function getReferralHistroy(req, res) {
    const userId = req.params.userId;
    const filter = req.query.filter;
    const days = req.query.days;

    try {
        let query = { referrer_id: userId };

        if (filter) {
            query.earning_type = filter;
        }

      
        if (days) {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(days));
            query.created_at = { $gte: daysAgo };
        }

        const referralHistory = await ReferralEarnings.find(query);

        if (!referralHistory.length) {
            return res.status(404).json({ message: "No referral history found for this user" });
        }

        return res.status(200).json({ referralHistory: referralHistory });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}


/**
 * Generates a unique referral code.
 *
 * This function generates a random referral code and checks its uniqueness
 * against the database. It continues to generate new codes until a unique
 * code is found.
 *
 * @async
 * @function UniqueReferralCodeGenerator
 * @returns {Promise<string>} A promise that resolves to a unique referral code.
 */
async function UniqueReferralCodeGenerator() {
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
        referralCode = crypto.randomBytes(3).toString('hex');
        const existingUser = await User.findOne({ referralCode: referralCode });
        if (!existingUser) {
            isUnique = true;
        }
    }
    return referralCode;

}



/**
 * Retrieves the referrals for a given user and calculates the total points earned from those referrals.
 *
 * @async
 * @function getYourReferrals
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The ID of the user whose referrals are to be retrieved.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server error.
 */
async function getYourReferrals(req, res) {

    const userId = req.params.userId;

    try {
        const referrals = await Referral.find({ referrer_id: userId }).populate('referred_id', 'email');
        if (!referrals.length) {
            return res.status(404).json({ message: "No referrals found for this user" });
        }

        let totalPoints = 0;
        const referralDetails = [];

        for (const referral of referrals) {
            const referralEarnings = await ReferralEarnings.find({ referrer_id: userId, referred_id: referral.referred_id._id });
            let userTotalPoints = 0;
            referralEarnings.forEach(earning => {
                totalPoints += earning.points_earned;
                userTotalPoints += earning.points_earned;
            });

            referralDetails.push({
                referredUser: referral.referred_id.email,
                referralDate: referral.created_at,
                pointsEarned: userTotalPoints
            });
        }

        referralDetails.sort((a, b) => b.pointsEarned - a.pointsEarned);

        return res.status(200).json({
            referrals: referralDetails,
            totalPoints: totalPoints
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}


/**
 * Retrieves the top referrals and their earnings.
 *
 * @async
 * @function getTopReferrals
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a JSON response with the top referrals or an error message.
 * @throws {Error} - Throws an error if there is a server issue.
 */
async function getTopReferrals(req, res) {

    try {
        const referrals = await Referral.find().populate('referred_id','email')

        if (!referrals.length) {
            return res.status(404).json({ message: "No referrals found" });
        }
      
        const topReferrerDeatils = {};

        for (const referral of referrals) {
            const referrerEarnings = await ReferralEarnings.find({ referrer_id: referral.referrer_id });
            console.log('referrer earnings ',referrerEarnings)
            let totalPoints = 0;
            referrerEarnings.forEach(earning => {
                totalPoints += earning.points_earned;
            });

            if (!topReferrerDeatils[referral.referrer_id]) {
                topReferrerDeatils[referral.referrer_id] = {
                    referrerId: referral.referrer_id,
                    totalPoints: 0,
                    referrals: []
                };
            }

            topReferrerDeatils[referral.referrer_id].totalPoints += totalPoints;
            topReferrerDeatils[referral.referrer_id].referrals.push({
                referredUser: referral.referred_id,
                pointsEarned: totalPoints
            });
        }

        const sortedReferrals = Object.values(topReferrerDeatils).sort((a, b) => b.totalPoints - a.totalPoints);

        return res.status(200).json({ topReferrals: sortedReferrals });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}




module.exports = { GenerateReferralCode, getTopReferrals, getYourReferrals, validateReferralCode, getReferralHistroy };
